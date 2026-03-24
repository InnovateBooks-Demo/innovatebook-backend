# from fastapi import Depends
# import logging

# def get_db():
#     from main import db
#     return db

# async def get_current_user_admin(db = Depends(get_db)):
#     """Verify user has admin permissions - simplified for now"""
#     # In a real app, you would verify the token and check roles
#     return {"user_id": "admin", "org_id": "org_demo", "role": "admin"}



"""
routes/deps.py — Shared FastAPI dependencies for admin routes.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import logging
import uuid
from datetime import datetime, timezone
from pydantic import BaseModel, Field, ConfigDict, EmailStr, model_validator
from typing import List, Optional, Dict, Any
from auth_utils import verify_token

logger = logging.getLogger(__name__)

security = HTTPBearer()

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "placeholder_secret")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")

# ─── Auth Models ────────────────────────────────────────────────────────────
class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: Optional[str] = None # Alias for id, used by many modules
    org_id: Optional[str] = None  # Multi-tenant isolation
    email: EmailStr
    full_name: str
    role: str
    roles: List[str] = [] # For compatibility with WorkspaceUser
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode='after')
    def set_compatibility_fields(self):
        if not self.user_id:
            self.user_id = self.id
        if not self.roles and self.role:
            self.roles = [self.role]
        return self

# ─── Allowed admin roles ────────────────────────────────────────────────────
ADMIN_ROLES = {"owner", "admin"}


def get_db():
    from main import db
    return db

async def get_database():
    """Backward compatibility dependency to get database instance"""
    from main import db
    return db


async def get_current_user_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> dict:
    """
    Real JWT-based auth dependency for admin routes.
    - Validates the JWT token (signature + expiry).
    - Resolves org_id and role_id from the token payload.
    - Raises 403 if the caller is not an admin/owner.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token has expired")
    except jwt.PyJWTError as e:
        logger.warning(f"JWT error in get_current_user_admin: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    # Normalize fields
    user_id = payload.get("user_id") or payload.get("sub")
    org_id = payload.get("org_id")
    role_id = (payload.get("role_id") or "member").strip().lower()
    is_super_admin = bool(payload.get("is_super_admin", False))

    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token: missing user_id")

    if not is_super_admin and role_id not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Admin access required (your role: '{role_id}')",
        )

    return {
        "user_id": user_id,
        "org_id": org_id,
        "role_id": role_id,
        "is_super_admin": is_super_admin,
    }


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """
    Standard JWT-based auth dependency for all protected routes.
    - Validates the access token.
    - Resolves the user from the database or token payload.
    - Returns a User model instance.
    """
    try:
        token = credentials.credentials
        payload = verify_token(token, verify_type="access")

        user_id = payload.get("user_id")
        db = get_db()
        
        # Check database for full user profile
        user = await db.users.find_one({"_id": user_id})
        if user is None:
            user = await db.users.find_one({"user_id": user_id})
        if user is None:
            user = await db.users.find_one({"id": user_id})

        if user is None:
            # Fallback to token payload if user not in db
            user = {
                "_id": user_id,
                "email": payload.get("email") or f"{user_id}@system.local",
                "full_name": payload.get("full_name") or "System User",
                "role": payload.get("role_id", "user"),
                "org_id": payload.get("org_id"),
            }

        mongo_id = user.get("_id") or user.get("user_id") or user_id

        user_data = {
            "id": str(mongo_id),
            "user_id": str(mongo_id),
            "email": user.get("email"),
            "full_name": user.get("full_name", "System User"),
            "role": user.get("role") or user.get("role_id", "member"),
            "roles": [user.get("role") or user.get("role_id", "member")],
            "org_id": user.get("org_id"),
        }

        return User(**user_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

