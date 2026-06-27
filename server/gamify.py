"""服务端游戏化：积分重算 + 徽章检查（关卡制 v2）"""

# 关卡定义：K=知识关(科普)，P=实操关(动手)
KNOWLEDGE_LEVELS = ['K1', 'K2', 'K3', 'K4', 'K5']      # 5个知识关
PRACTICE_LEVELS = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']  # 8个实操关
ALL_LEVELS = KNOWLEDGE_LEVELS + PRACTICE_LEVELS          # 共13关

POINT_RULES = {
    'DAILY_LOGIN': 5,
    'TASK_SELECT': 20,
    'LEVEL_COMPLETE': 10,        # 每关完成
    'KNOWLEDGE_BONUS': 30,       # 知识关K1-K5全通
    'PRACTICE_BONUS': 80,        # 实操关P1-P8全通
    'ALL_CLEAR_BONUS': 150,      # 13关全通
}

LEVELS = [
    {'lv': 1, 'name': 'AI新兵', 'minPoints': 0, 'color': 'lvl-1'},
    {'lv': 2, 'name': '提示词学徒', 'minPoints': 40, 'color': 'lvl-2'},
    {'lv': 3, 'name': '教案能手', 'minPoints': 90, 'color': 'lvl-3'},
    {'lv': 4, 'name': '技能行家', 'minPoints': 150, 'color': 'lvl-4'},
    {'lv': 5, 'name': '分层达人', 'minPoints': 220, 'color': 'lvl-5'},
    {'lv': 6, 'name': '审核专家', 'minPoints': 290, 'color': 'lvl-6'},
    {'lv': 7, 'name': 'AI教学先锋', 'minPoints': 360, 'color': 'lvl-7'},
    {'lv': 8, 'name': '微学习大师', 'minPoints': 500, 'color': 'lvl-8'},
]

BADGE_IDS = ['first_login', 'task_chooser', 'knowledge_master', 'practice_master', 'all_clear', 'explorer']

def get_level(points):
    result = LEVELS[0]
    for lv in LEVELS:
        if points >= lv['minPoints']:
            result = lv
    return result

def _normalize_levels(raw):
    """把任意形式的已通关记录标准化为关卡ID列表，兼容老数据（纯数字1-8 → P1-P8）"""
    if not raw:
        return []
    result = []
    for item in raw:
        s = str(item).strip()
        # 老数据：纯数字1-8 → 映射为 P1-P8
        if s.isdigit() and 1 <= int(s) <= 8:
            mapped = 'P' + s
            if mapped not in result:
                result.append(mapped)
        elif s in ALL_LEVELS:
            if s not in result:
                result.append(s)
    return result

def calculate_points(levels_raw, has_task):
    """根据已通关的关卡列表重算积分（不含每日登录分）"""
    levels = _normalize_levels(levels_raw)
    pts = 0
    # 每关完成分
    pts += len(levels) * POINT_RULES['LEVEL_COMPLETE']
    # 任务选择分
    if has_task:
        pts += POINT_RULES['TASK_SELECT']
    # 知识关全通 bonus
    if all(k in levels for k in KNOWLEDGE_LEVELS):
        pts += POINT_RULES['KNOWLEDGE_BONUS']
    # 实操关全通 bonus
    if all(p in levels for p in PRACTICE_LEVELS):
        pts += POINT_RULES['PRACTICE_BONUS']
    # 13关全通 bonus
    if len(levels) == len(ALL_LEVELS):
        pts += POINT_RULES['ALL_CLEAR_BONUS']
    return pts

def calculate_badges(levels_raw, has_task, has_first_login=False, has_explored=False):
    levels = _normalize_levels(levels_raw)
    earned = []
    if has_first_login:
        earned.append('first_login')
    if has_task:
        earned.append('task_chooser')
    if all(k in levels for k in KNOWLEDGE_LEVELS):
        earned.append('knowledge_master')
    if all(p in levels for p in PRACTICE_LEVELS):
        earned.append('practice_master')
    if len(levels) == len(ALL_LEVELS):
        earned.append('all_clear')
    if has_explored:
        earned.append('explorer')
    return earned

def check_level_up(old_points, new_points):
    old_lv = get_level(old_points)
    new_lv = get_level(new_points)
    if new_lv['lv'] > old_lv['lv']:
        return {'leveledUp': True, 'oldLevel': old_lv, 'newLevel': new_lv}
    return {'leveledUp': False}
