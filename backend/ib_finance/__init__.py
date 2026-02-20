"""
IB Finance - Shared utilities and dependencies
"""
from fastapi import HTTPException, Header
import jwt
import os

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

def get_db():
    """Get database instance from main"""
    from app_state import db
    return db

async def get_current_user(authorization: str = Header(None)):
    """Extract current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_id(prefix: str) -> str:
    """Generate a unique ID with prefix"""
    import uuid
    return f"{prefix}_{uuid.uuid4().hex[:12]}"
