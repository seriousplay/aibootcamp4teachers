"""数据库初始化：建表 + 灌入徽章定义"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'data', 'microlearn.db')

BADGES = [
    ('first_login', '启程者', '首次登录', '🚀'),
    ('task_chooser', '抉择者', '选择任意任务', '🎯'),
    ('knowledge_master', '认知达人', '完成5个知识关', '⚡'),
    ('practice_master', '实战先锋', '完成8个实操关', '🏁'),
    ('all_clear', '满分通关', '13关全部完成', '🏆'),
    ('explorer', '探索者', '复制3次提示词', '📚'),
]

def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()

    c.execute('''CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        phone TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        points_total INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS progress (
        user_id INTEGER PRIMARY KEY,
        steps_json TEXT DEFAULT '[]',
        task_selected TEXT,
        quiz_json TEXT DEFAULT '{}',
        updated_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')

    # 老库兼容：若 progress 表缺少 quiz_json 列则补上
    cols = [row[1] for row in c.execute('PRAGMA table_info(progress)').fetchall()]
    if 'quiz_json' not in cols:
        c.execute('ALTER TABLE progress ADD COLUMN quiz_json TEXT DEFAULT "{}"')

    c.execute('''CREATE TABLE IF NOT EXISTS point_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        points INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY(user_id) REFERENCES users(id)
    )''')
    c.execute('CREATE INDEX IF NOT EXISTS idx_point_logs_user ON point_logs(user_id)')

    c.execute('''CREATE TABLE IF NOT EXISTS badges (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        icon TEXT
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS user_badges (
        user_id INTEGER NOT NULL,
        badge_id TEXT NOT NULL,
        awarded_at TEXT DEFAULT (datetime('now')),
        PRIMARY KEY(user_id, badge_id),
        FOREIGN KEY(user_id) REFERENCES users(id),
        FOREIGN KEY(badge_id) REFERENCES badges(id)
    )''')

    c.execute('''CREATE TABLE IF NOT EXISTS login_logs (
        user_id INTEGER NOT NULL,
        login_date TEXT NOT NULL,
        PRIMARY KEY(user_id, login_date)
    )''')

    # 灌入徽章定义
    for bid, name, desc, icon in BADGES:
        c.execute('INSERT OR IGNORE INTO badges (id, name, description, icon) VALUES (?,?,?,?)', (bid, name, desc, icon))
        c.execute('UPDATE badges SET description=?, icon=? WHERE id=?', (desc, icon, bid))

    conn.commit()
    conn.close()
    print(f'数据库已初始化: {DB_PATH}')

if __name__ == '__main__':
    init_db()
