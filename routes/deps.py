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
from typing import List, Optional
from auth_utils import verify_token

logger = logging.getLogger(__name__)

security = HTTPBearer()

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "placeholder_secret")
JWT_ALGORITHM = os.environ.get("JWT_ALGORITHM", "HS256")


# ─── Auth Models ────────────────────────────────────────────────────────────
class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: Optional[str] = None
    org_id: Optional[str] = None
    email: EmailStr
    full_name: str
    role: str
    role_id: str = "member"
    roles: List[str] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    @model_validator(mode="after")
    def set_compatibility_fields(self):
        if not self.user_id:
            self.user_id = self.id
        if not self.roles and self.role:
            self.roles = [self.role]
        if self.role and not self.role_id:
            self.role_id = self.role
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
    JWT-based auth dependency for admin routes.
    Allows only owner/admin or super admin.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT error in get_current_user_admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user_id = payload.get("user_id") or payload.get("sub")
    org_id = payload.get("org_id")
    role_id = (payload.get("role_id") or "member").strip().lower()
    is_super_admin = bool(payload.get("is_super_admin", False))

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id",
        )

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


async def get_current_user_member(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> dict:
    """
    JWT-based auth dependency for routes that should be accessible
    to all authenticated users except viewer.
    """
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT error in get_current_user_member: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

    user_id = payload.get("user_id") or payload.get("sub")
    org_id = payload.get("org_id")
    role_id = (payload.get("role_id") or "member").strip().lower()
    is_super_admin = bool(payload.get("is_super_admin", False))

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token: missing user_id",
        )

    if not is_super_admin and role_id == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for viewer role",
        )

    return {
        "user_id": user_id,
        "org_id": org_id,
        "role_id": role_id,
        "is_super_admin": is_super_admin,
    }


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db),
) -> User:
    """
    Standard JWT-based auth dependency for all protected routes.
    - Validates the access token.
    - Resolves the user from the database or token payload.
    - Returns a User model instance.
    """
    try:
        token = credentials.credentials
        payload = verify_token(token, verify_type="access")

        user_id = payload.get("user_id") or payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id",
            )

        user = await db.users.find_one({"_id": user_id})
        if user is None:
            user = await db.users.find_one({"user_id": user_id})
        if user is None:
            user = await db.users.find_one({"id": user_id})

        if user is None:
            user = {
                "_id": user_id,
                "email": payload.get("email") or f"{user_id}@system.local",
                "full_name": payload.get("full_name") or "System User",
                "role": payload.get("role_id", "member"),
                "org_id": payload.get("org_id"),
            }

        # Prioritize user_id from database if it exists (canonical ID)
        mongo_id = user.get("user_id") or str(user.get("_id")) or user_id

        user_data = {
            "_id": str(mongo_id),
            "user_id": str(mongo_id),
            "email": user.get("email"),
            "full_name": user.get("full_name", "System User"),
            "role": user.get("role") or user.get("role_id", "member"),
            "role_id": (user.get("role_id") or user.get("role") or "member").strip().lower(),
            "roles": [user.get("role") or user.get("role_id", "member")],
            "org_id": user.get("org_id") or payload.get("org_id"),
        }

        # Log inside backend:
        print("USER:", user_data["user_id"], "ROLE:", user_data["role_id"])

        return User(**user_data)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in get_current_user: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


async def require_non_viewer(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Dependency to ensure the current user is not a viewer.
    - admin, manager, member: Allowed
    - viewer: Forbidden (403)
    """
    if current_user.role_id == "viewer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for viewer role",
        )
    return current_user
async def require_authenticated(user: User = Depends(get_current_user)) -> User:
    return user
