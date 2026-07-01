"""SQLite CRUD 操作"""
import sqlite3
import json
import os
from datetime import date

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'microlearn.db')
LEVEL_ORDER = ['K1', 'K2', 'K3', 'K4', 'K5', 'P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8']
LEVEL_COUNT = len(LEVEL_ORDER)

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def normalize_levels(raw):
    result = []
    for item in raw or []:
        s = str(item).strip()
        if s.isdigit() and 1 <= int(s) <= 8:
            s = 'P' + s
        if s in LEVEL_ORDER and s not in result:
            result.append(s)
    return result

# ===== 用户 =====
def create_user(phone, password_hash, name):
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO users (phone, password_hash, name) VALUES (?,?,?)', (phone, password_hash, name))
        uid = c.lastrowid
        c.execute('INSERT INTO progress (user_id) VALUES (?)', (uid,))
        conn.commit()
        return uid
    except sqlite3.IntegrityError:
        return None
    finally:
        conn.close()

def get_user_by_phone(phone):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE phone=?', (phone,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def get_user(uid):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT * FROM users WHERE id=?', (uid,))
    row = c.fetchone()
    conn.close()
    return dict(row) if row else None

def update_user_points(uid, points):
    conn = get_conn()
    c = conn.cursor()
    c.execute('UPDATE users SET points_total=? WHERE id=?', (points, uid))
    conn.commit()
    conn.close()

# ===== 进度 =====
def get_progress(uid):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT * FROM progress WHERE user_id=?', (uid,))
    row = c.fetchone()
    conn.close()
    if not row:
        return {'steps': [], 'task': None, 'quiz': {}}
    quiz = {}
    try:
        quiz = json.loads(row['quiz_json']) if row['quiz_json'] else {}
    except (json.JSONDecodeError, KeyError):
        quiz = {}
    return {
        'steps': json.loads(row['steps_json']),
        'task': row['task_selected'],
        'quiz': quiz,
    }

def set_progress(uid, steps, task, quiz=None):
    conn = get_conn()
    c = conn.cursor()
    quiz_json = json.dumps(quiz if quiz is not None else {}, ensure_ascii=False)
    c.execute('''INSERT INTO progress (user_id, steps_json, task_selected, quiz_json, updated_at)
                 VALUES (?,?,?,?,datetime('now'))
                 ON CONFLICT(user_id) DO UPDATE SET
                   steps_json=excluded.steps_json,
                   task_selected=excluded.task_selected,
                   quiz_json=excluded.quiz_json,
                   updated_at=datetime('now')''',
              (uid, json.dumps(steps), task, quiz_json))
    conn.commit()
    conn.close()

# ===== 积分流水 =====
def add_point_log(uid, points, reason):
    conn = get_conn()
    c = conn.cursor()
    c.execute('INSERT INTO point_logs (user_id, points, reason) VALUES (?,?,?)', (uid, points, reason))
    conn.commit()
    conn.close()

def get_point_logs(uid):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT * FROM point_logs WHERE user_id=? ORDER BY created_at DESC', (uid,))
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ===== 徽章 =====
def get_all_badges():
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT * FROM badges')
    rows = c.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def get_user_badges(uid):
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT badge_id FROM user_badges WHERE user_id=?', (uid,))
    rows = c.fetchall()
    conn.close()
    return [r['badge_id'] for r in rows]

def award_badge(uid, badge_id):
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO user_badges (user_id, badge_id) VALUES (?,?)', (uid, badge_id))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

# ===== 登录日志 =====
def check_daily_login(uid):
    """检查今日是否首次登录，返回True表示首次"""
    today = date.today().isoformat()
    conn = get_conn()
    c = conn.cursor()
    try:
        c.execute('INSERT INTO login_logs (user_id, login_date) VALUES (?,?)', (uid, today))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False
    finally:
        conn.close()

def get_login_days_count(uid):
    """获取用户累计登录天数（用于计算登录总积分）"""
    conn = get_conn()
    c = conn.cursor()
    c.execute('SELECT COUNT(*) as cnt FROM login_logs WHERE user_id=?', (uid,))
    row = c.fetchone()
    conn.close()
    return row['cnt'] if row else 0

# ===== 排行榜 =====
def get_leaderboard(limit=20):
    conn = get_conn()
    c = conn.cursor()
    c.execute('''
        SELECT u.id as userId, u.name, u.points_total as points,
               p.steps_json
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        ORDER BY u.points_total DESC, p.steps_json DESC
        LIMIT ?
    ''', (limit,))
    rows = c.fetchall()
    conn.close()
    result = []
    for r in rows:
        steps = normalize_levels(json.loads(r['steps_json']) if r['steps_json'] else [])
        result.append({
            'userId': r['userId'],
            'name': r['name'],
            'points': r['points'] or 0,
            'steps': len(steps)
        })
    return result

# ===== 讲师仪表盘 =====
def get_dashboard_stats():
    """讲师端实时数据：班级整体统计 + 每关完成率 + 学员明细"""
    conn = get_conn()
    c = conn.cursor()
    c.execute('''
        SELECT u.id, u.name, u.points_total, u.created_at,
               p.steps_json, p.task_selected, p.updated_at
        FROM users u
        LEFT JOIN progress p ON u.id = p.user_id
        ORDER BY u.points_total DESC, u.created_at ASC
    ''')
    rows = c.fetchall()
    conn.close()

    total_users = len(rows)
    if total_users == 0:
        return {
            'totalUsers': 0, 'totalStepsCompleted': 0,
            'avgProgress': 0, 'stepCompletion': [0]*LEVEL_COUNT,
            'stepCompletionRate': [0]*LEVEL_COUNT,
            'learners': [], 'taskDistribution': {},
        }

    # 每关完成人数统计
    step_counts = [0] * LEVEL_COUNT
    task_dist = {}
    learners = []
    sum_steps = 0

    for r in rows:
        steps = normalize_levels(json.loads(r['steps_json']) if r['steps_json'] else [])
        for s in steps:
            if s in LEVEL_ORDER:
                step_counts[LEVEL_ORDER.index(s)] += 1
        sum_steps += len(steps)
        task = r['task_selected']
        if task:
            task_dist[task] = task_dist.get(task, 0) + 1
        learners.append({
            'id': r['id'],
            'name': r['name'],
            'points': r['points_total'] or 0,
            'stepsCompleted': len(steps),
            'steps': steps,
            'task': task,
            'progress': round(len(steps) / LEVEL_COUNT * 100),
            'lastActive': r['updated_at'] or '',
        })

    return {
        'totalUsers': total_users,
        'totalStepsCompleted': sum_steps,
        'avgProgress': round(sum_steps / (total_users * LEVEL_COUNT) * 100),
        'stepCompletion': step_counts,          # 每关完成人数 [n,n,...]
        'stepCompletionRate': [round(c / total_users * 100) for c in step_counts],
        'taskDistribution': task_dist,
        'learners': learners,
        'generatedAt': __import__('datetime').datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
    }
