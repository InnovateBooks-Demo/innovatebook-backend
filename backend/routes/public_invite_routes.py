# routes/public_invite_routes.py

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import secrets
from passlib.context import CryptContext

# ✅ IMPORTANT: absolute import (fixes your import error)
from routes.deps import get_db

router = APIRouter(prefix="/public/invites", tags=["public-invites"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def as_utc_aware(dt: datetime):
    """
    Mongo may return naive datetime (no tzinfo).
    Treat naive as UTC to avoid: can't compare offset-naive and offset-aware datetimes
    """
    if not dt:
        return None
    if isinstance(dt, datetime):
        if dt.tzinfo is None:
            return dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc)
    return None


class VerifyInviteIn(BaseModel):
    token: str = Field(..., min_length=10)


class AcceptInviteIn(BaseModel):
    token: str = Field(..., min_length=10)
    full_name: str = Field(..., min_length=2)
    password: str = Field(..., min_length=6)


@router.post("/verify")
async def verify_invite(payload: VerifyInviteIn, db=Depends(get_db)):
    token = payload.token.strip()

    invite = await db.user_invites.find_one(
        {"invite_token": token},
        {"_id": 0},
    )
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid token")

    if invite.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Invite already used")

    expires_at = invite.get("expires_at")
    if isinstance(expires_at, datetime):
        expires_at = as_utc_aware(expires_at)

    if not expires_at or expires_at <= utc_now():
        raise HTTPException(status_code=400, detail="Token expired")

    # ✅ Return what frontend needs (top-level + invite object for flexibility)
    invite_payload = {
        "email": invite.get("email"),
        "org_id": invite.get("org_id"),
        "role_id": invite.get("role_id"),
        "expires_at": invite.get("expires_at"),
        "invite_id": invite.get("invite_id"),
        "status": invite.get("status"),
    }

    return {
        "success": True,
        "invite": invite_payload,
        # convenience (so frontend can do res.data.email too if needed)
        **invite_payload,
    }


@router.post("/accept", status_code=status.HTTP_201_CREATED)
async def accept_invite(payload: AcceptInviteIn, db=Depends(get_db)):
    token = payload.token.strip()
    full_name = payload.full_name.strip()
    password = payload.password

    invite = await db.user_invites.find_one(
        {"invite_token": token},
        {"_id": 0},
    )
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid token")

    if invite.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Invite already used")

    expires_at = invite.get("expires_at")
    if isinstance(expires_at, datetime):
        expires_at = as_utc_aware(expires_at)

    if not expires_at or expires_at <= utc_now():
        raise HTTPException(status_code=400, detail="Token expired")

    org_id = invite.get("org_id")
    email = (invite["email"] or "").strip().lower()

    role_id = invite.get("role_id")

    if not org_id or not email or not role_id:
        raise HTTPException(status_code=400, detail="Invite is missing required fields")

    # prevent duplicates
    existing = await db.enterprise_users.find_one(
        {"org_id": org_id, "email": email},
        {"_id": 0},
    )

    if existing:
        # If user already exists, mark invite accepted anyway
        await db.user_invites.update_one(
            {"invite_token": token},
            {"$set": {"status": "accepted", "accepted_at": utc_now(), "updated_at": utc_now()}},
        )
        return {"success": True, "message": "User already exists. Invite marked accepted."}

    password_hash = pwd_context.hash(password)
    user_id = f"usr_{secrets.token_hex(3)}"  # example: usr_a1b2c3

    await db.enterprise_users.insert_one(
        {
            "user_id": user_id,
            "org_id": org_id,
            "email": email,
            "full_name": full_name,
            "role_id": role_id,
            "password_hash": password_hash,
            "is_active": True,
            "is_super_admin": False,
            "created_at": utc_now(),
            "last_login_at": None,
            "last_active_at": None,
        }
    )

    await db.user_invites.update_one(
        {"invite_token": token},
        {"$set": {"status": "accepted", "accepted_at": utc_now(), "updated_at": utc_now()}},
    )

    return {"success": True, "user_id": user_id}
