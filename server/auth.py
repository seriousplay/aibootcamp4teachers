"""JWT 签发/校验 + bcrypt 密码"""
import jwt
import bcrypt
import os
from datetime import datetime, timedelta, timezone

SECRET_KEY = os.environ.get('JWT_SECRET', 'microlearn-secret-key-2024')
ALGORITHM = 'HS256'
TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def create_token(user_id: int, phone: str) -> str:
    payload = {
        'uid': user_id,
        'phone': phone,
        'exp': datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS),
        'iat': datetime.now(timezone.utc),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
