"""FastAPI 后端入口：路由 + CORS + 静态托管"""
import os
import sys
from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional

# 确保能 import 同目录模块
sys.path.insert(0, os.path.dirname(__file__))

from auth import hash_password, verify_password, create_token, verify_token
import models
from gamify import calculate_points, calculate_badges, get_level, check_level_up, POINT_RULES, ALL_LEVELS, _normalize_levels

app = FastAPI(title='微学习平台API', version='2.0.0')

# CORS 允许所有源（file:// 和 http://localhost）
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

# 确保数据库已初始化
from init_db import init_db
init_db()

# ===== 请求模型 =====
class RegisterReq(BaseModel):
    phone: str
    password: str
    name: str

class LoginReq(BaseModel):
    phone: str
    password: str

class StepReq(BaseModel):
    levelId: Optional[str] = None   # 新：关卡ID 如 "K1"/"P3"
    stepNum: Optional[int] = None   # 兼容旧：步骤号1-8
    completed: bool = True

class TaskReq(BaseModel):
    taskType: str

class QuizReq(BaseModel):
    levelId: Optional[str] = None   # 新：关卡ID
    stepNum: Optional[int] = None   # 兼容旧
    answers: list = []

# ===== 鉴权依赖 =====
def get_current_user(request: Request):
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        raise HTTPException(401, '未授权')
    token = auth[7:]
    payload = verify_token(token)
    if not payload:
        raise HTTPException(401, 'Token无效或已过期')
    user = models.get_user(payload['uid'])
    if not user:
        raise HTTPException(401, '用户不存在')
    return user

# ===== 路由 =====

@app.get('/api/health')
async def health():
    return {'status': 'ok', 'mode': 'online', 'version': '1.0.0'}

@app.post('/api/auth/register')
async def register(req: RegisterReq):
    if not req.phone or len(req.phone) != 11:
        raise HTTPException(400, '请输入正确的手机号')
    if len(req.password) < 6:
        raise HTTPException(400, '密码至少6位')
    if not req.name:
        raise HTTPException(400, '请输入姓名')

    pwd_hash = hash_password(req.password)
    uid = models.create_user(req.phone, pwd_hash, req.name)
    if not uid:
        raise HTTPException(409, '该手机号已注册')

    # 首次登录 +5分 + 徽章
    models.check_daily_login(uid)  # 记录今日登录
    models.add_point_log(uid, POINT_RULES['DAILY_LOGIN'], 'daily_login')
    models.update_user_points(uid, POINT_RULES['DAILY_LOGIN'])
    models.award_badge(uid, 'first_login')

    user = models.get_user(uid)
    token = create_token(uid, req.phone)
    return {'token': token, 'user': {'id': uid, 'phone': req.phone, 'name': req.name, 'points': user['points_total']}}

@app.post('/api/auth/login')
async def login(req: LoginReq):
    user = models.get_user_by_phone(req.phone)
    if not user:
        raise HTTPException(404, '手机号未注册')
    if not verify_password(req.password, user['password_hash']):
        raise HTTPException(401, '密码错误')

    # 每日登录加分
    is_first_today = models.check_daily_login(user['id'])
    if is_first_today:
        models.add_point_log(user['id'], POINT_RULES['DAILY_LOGIN'], 'daily_login')
        # 重算总积分
        prog = models.get_progress(user['id'])
        base_points = calculate_points(prog['steps'], bool(prog['task']))
        total = base_points + POINT_RULES['DAILY_LOGIN']
        models.update_user_points(user['id'], total)
        user['points_total'] = total

    token = create_token(user['id'], req.phone)
    return {'token': token, 'user': {'id': user['id'], 'phone': req.phone, 'name': user['name'], 'points': user['points_total']}}

@app.get('/api/auth/me')
async def me(user=Depends(get_current_user)):
    return {'user': {'id': user['id'], 'phone': user['phone'], 'name': user['name'], 'points': user['points_total']}}

@app.get('/api/progress')
async def get_progress(user=Depends(get_current_user)):
    prog = models.get_progress(user['id'])
    badges = models.get_user_badges(user['id'])
    level = get_level(user['points_total'])
    # 规范化关卡ID（兼容老数据：纯数字→P数字）
    levels = _normalize_levels(prog['steps'])
    return {
        'levels': levels,            # 新：规范化的关卡ID列表
        'steps': levels,             # 兼容：老前端读 steps
        'task': prog['task'],
        'quiz': prog.get('quiz', {}),
        'points': user['points_total'],
        'badges': badges,
        'level': level
    }

@app.put('/api/progress/step')
async def set_step(req: StepReq, user=Depends(get_current_user)):
    # 解析关卡ID：优先 levelId，兼容老 stepNum（数字→P数字）
    if req.levelId:
        level_id = req.levelId
    elif req.stepNum:
        level_id = 'P' + str(req.stepNum)
    else:
        raise HTTPException(400, '缺少关卡ID')
    if level_id not in ALL_LEVELS:
        raise HTTPException(400, '无效的关卡ID')

    prog = models.get_progress(user['id'])
    levels = _normalize_levels(prog['steps'])  # 兼容老数据
    old_badges = models.get_user_badges(user['id'])
    old_points = user['points_total']

    if req.completed and level_id not in levels:
        levels.append(level_id)
        models.add_point_log(user['id'], POINT_RULES['LEVEL_COMPLETE'], f'level:{level_id}')
    elif not req.completed and level_id in levels:
        levels.remove(level_id)
        models.add_point_log(user['id'], -POINT_RULES['LEVEL_COMPLETE'], f'level_undo:{level_id}')
    else:
        level = get_level(old_points)
        return {'points': old_points, 'newBadges': [], 'level': level, 'leveledUp': False}

    base_points = calculate_points(levels, bool(prog['task']))
    login_bonus = models.get_login_days_count(user['id']) * POINT_RULES['DAILY_LOGIN']
    total = base_points + login_bonus
    models.update_user_points(user['id'], total)
    models.set_progress(user['id'], levels, prog['task'], prog.get('quiz', {}))

    should_have = calculate_badges(levels, bool(prog['task']), has_first_login=True)
    new_badges = []
    for bid in should_have:
        if bid not in old_badges:
            models.award_badge(user['id'], bid)
            new_badges.append(bid)

    lv_info = check_level_up(old_points, total)
    level = get_level(total)

    return {
        'points': total,
        'newBadges': new_badges,
        'level': level,
        'leveledUp': lv_info['leveledUp'],
        'oldLevel': lv_info.get('oldLevel'),
        'newLevel': lv_info.get('newLevel')
    }

@app.put('/api/progress/task')
async def set_task(req: TaskReq, user=Depends(get_current_user)):
    if req.taskType not in ['A', 'B', 'C', 'D', 'E']:
        raise HTTPException(400, '无效的任务类型')

    prog = models.get_progress(user['id'])
    old_badges = models.get_user_badges(user['id'])
    old_points = user['points_total']

    # 如果之前没选过任务，加分
    if not prog['task']:
        models.add_point_log(user['id'], POINT_RULES['TASK_SELECT'], 'task_select')

    models.set_progress(user['id'], prog['steps'], req.taskType, prog.get('quiz', {}))

    # 重算积分
    base_points = calculate_points(prog['steps'], True)
    login_bonus = models.get_login_days_count(user['id']) * POINT_RULES['DAILY_LOGIN']
    total = base_points + login_bonus
    models.update_user_points(user['id'], total)

    # 重算徽章
    should_have = calculate_badges(prog['steps'], True, has_first_login=True)
    new_badges = []
    for bid in should_have:
        if bid not in old_badges:
            models.award_badge(user['id'], bid)
            new_badges.append(bid)

    lv_info = check_level_up(old_points, total)
    return {
        'points': total,
        'newBadges': new_badges,
        'leveledUp': lv_info['leveledUp'],
        'oldLevel': lv_info.get('oldLevel'),
        'newLevel': lv_info.get('newLevel')
    }

@app.put('/api/progress/quiz')
async def submit_quiz(req: QuizReq, user=Depends(get_current_user)):
    """提交随堂小测答案。若全对且该关尚未掌握，则触发完成（加分/徽章/升级）。"""
    # 解析关卡ID
    if req.levelId:
        level_id = req.levelId
    elif req.stepNum:
        level_id = 'P' + str(req.stepNum)
    else:
        raise HTTPException(400, '缺少关卡ID')
    if level_id not in ALL_LEVELS:
        raise HTTPException(400, '无效的关卡ID')

    prog = models.get_progress(user['id'])
    levels = _normalize_levels(prog['steps'])
    quiz = prog.get('quiz', {})
    old_badges = models.get_user_badges(user['id'])
    old_points = user['points_total']

    # 记录答题
    quiz[level_id] = {'answers': req.answers, 'correct': True}
    models.set_progress(user['id'], levels, prog['task'], quiz)

    # 若该关尚未掌握，触发完成流程
    if level_id not in levels:
        levels.append(level_id)
        models.add_point_log(user['id'], POINT_RULES['LEVEL_COMPLETE'], f'level:{level_id}')
        base_points = calculate_points(levels, bool(prog['task']))
        login_bonus = models.get_login_days_count(user['id']) * POINT_RULES['DAILY_LOGIN']
        total = base_points + login_bonus
        models.update_user_points(user['id'], total)
        models.set_progress(user['id'], levels, prog['task'], quiz)

        should_have = calculate_badges(levels, bool(prog['task']), has_first_login=True)
        new_badges = []
        for bid in should_have:
            if bid not in old_badges:
                models.award_badge(user['id'], bid)
                new_badges.append(bid)
        lv_info = check_level_up(old_points, total)
        level = get_level(total)
        return {
            'mastered': True, 'points': total, 'newBadges': new_badges,
            'level': level, 'leveledUp': lv_info['leveledUp'],
            'oldLevel': lv_info.get('oldLevel'), 'newLevel': lv_info.get('newLevel'),
            'bonusHit': _detect_bonus(level_id, levels),
        }

    level = get_level(old_points)
    return {'mastered': False, 'points': old_points, 'newBadges': [], 'level': level, 'leveledUp': False}


def _detect_bonus(level_id, levels):
    """检测是否触发知识关全通/实操关全通/13关全通奖励"""
    from gamify import KNOWLEDGE_LEVELS, PRACTICE_LEVELS, ALL_LEVELS
    if len(levels) == len(ALL_LEVELS):
        return 'all_clear'
    if all(k in levels for k in KNOWLEDGE_LEVELS) and level_id == 'K5':
        return 'knowledge'
    if all(p in levels for p in PRACTICE_LEVELS) and level_id == 'P8':
        return 'practice'
    return None



@app.get('/api/leaderboard')
async def leaderboard(limit: int = 20, user=Depends(get_current_user)):
    return models.get_leaderboard(limit)

@app.put('/api/progress/explorer')
async def award_explorer(user=Depends(get_current_user)):
    """授予"探索者"徽章（累计复制3次提示词触发）"""
    old_badges = models.get_user_badges(user['id'])
    old_points = user['points_total']
    new_badges = []
    if 'explorer' not in old_badges:
        models.award_badge(user['id'], 'explorer')
        new_badges.append('explorer')
    lv_info = check_level_up(old_points, user['points_total'])
    level = get_level(user['points_total'])
    return {'awarded': len(new_badges) > 0, 'points': user['points_total'], 'newBadges': new_badges, 'leveledUp': lv_info['leveledUp'], 'newLevel': level}

@app.get('/api/badges')
async def badges():
    return models.get_all_badges()

@app.get('/api/instructor/dashboard')
async def instructor_dashboard():
    """讲师端实时数据大屏（免鉴权，便于投屏访问）"""
    return models.get_dashboard_stats()

# ===== 静态文件托管（可选：通过后端访问前端） =====
STATIC_DIR = os.path.dirname(os.path.dirname(__file__))  # training-site 目录
if os.path.exists(STATIC_DIR):
    # 挂载 assets 目录（前端CSS/JS）
    assets_dir = os.path.join(STATIC_DIR, 'assets')
    if os.path.exists(assets_dir):
        app.mount('/assets', StaticFiles(directory=assets_dir), name='assets')

    @app.get('/')
    async def serve_index():
        return FileResponse(os.path.join(STATIC_DIR, 'student.html'))

    @app.get('/student')
    async def serve_student():
        return FileResponse(os.path.join(STATIC_DIR, 'student.html'))

    @app.get('/index')
    async def serve_instructor():
        return FileResponse(os.path.join(STATIC_DIR, 'index.html'))

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)
