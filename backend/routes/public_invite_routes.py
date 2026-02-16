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
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        except ValueError:
            pass

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
    """
    Accept an invite:
    1. Validate invite token.
    2. Ensure user exists in 'users' (auth source).
    3. Ensure membership exists in 'org_users' (membership source).
    4. Mark invite as accepted.
    """
    token = payload.token.strip()
    full_name = payload.full_name.strip()
    password = payload.password

    # DEBUG LOG
    try:
        with open("debug_server.log", "a") as log:
            log.write(f"\n[{datetime.now()}] Accepted invite request for token: {token[:5]}...\n")
    except: pass

    # 1. Validate Invite
    invite = await db.user_invites.find_one(
        {"invite_token": token},
        {"_id": 0},
    )
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid token")

    if invite.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Invite already used")

    expires_at = invite.get("expires_at")
    if isinstance(expires_at, str):
        try:
            expires_at = datetime.fromisoformat(expires_at.replace("Z", "+00:00"))
        except ValueError:
            pass # Handle or leave as None/Original
    
    if isinstance(expires_at, datetime):
        expires_at = as_utc_aware(expires_at)

    if not expires_at or expires_at <= utc_now():
        raise HTTPException(status_code=400, detail="Token expired")

    org_id = invite.get("org_id")
    email = (invite["email"] or "").strip().lower()
    role_id = invite.get("role_id")

    if not org_id or not email or not role_id:
        raise HTTPException(status_code=400, detail="Invite is missing required fields")

    # START: Role Safety Enforcement
    if role_id == "admin":
        invited_by = invite.get("invited_by")
        if not invited_by:
                # Should technically not happen for admin invites, but safety first
                raise HTTPException(status_code=403, detail="Cannot verify inviter privileges")
        
        # Check inviter permissions
        # 1. Check if global super admin (enterprise_users has is_super_admin)
        inviter_ent = await db.enterprise_users.find_one({"user_id": invited_by})
        is_global_super = inviter_ent and inviter_ent.get("is_super_admin")
        
        # 2. Check org role (org_users)
        inviter_membership = await db.org_users.find_one({
            "user_id": invited_by, 
            "org_id": org_id,
            "status": "active"
        })
        inviter_org_role = inviter_membership.get("role") if inviter_membership else None
        
        # Allowed inviter roles
        if not is_global_super and inviter_org_role not in ["owner", "super_admin"]:
                raise HTTPException(
                    status_code=403, 
                    detail="Invite is invalid: Inviter lacks permission to grant Admin role."
                )
    # END: Role Safety Enforcement

    # 2. Upsert into db.users (Auth Source)
    # Ensure email uniqueness via logic and later via index
    user = await db.users.find_one({"email": email})
    
    password_hash = pwd_context.hash(password)
    user_id = None

    if user:
        # Use existing user_id
        user_id = user.get("user_id")
        # Fallback if missing (rare)
        if not user_id:
            user_id = secrets.token_urlsafe(16)

        # Update specific fields, preserve existing role
        update_fields = {
            "user_id": user_id, 
            "password_hash": password_hash,
            "full_name": full_name,
            "status": "active",
            "is_active": True,
            "email_verified": True,
            "updated_at": utc_now(),
        }
        
        # Only set role if completely missing, otherwise leave as is
        # We want system role to be 'user' generally for invited members
        if not user.get("role"):
            update_fields["role"] = "user"

        await db.users.update_one(
            {"email": email},
            {"$set": update_fields}
        )
    else:
        # Create new user
        user_id = secrets.token_urlsafe(16)
        user_doc = {
            "user_id": user_id,
            "email": email,
            "full_name": full_name,
            "password_hash": password_hash,
            "mobile": "", 
            "mobile_country_code": "",
            "role": "user", # Forces system role to 'user'
            "status": "active",
            "is_active": True,
            "email_verified": True,
            "mobile_verified": False,
            "failed_login_attempts": 0,
            "account_locked_until": None,
            "created_at": utc_now(),
            "updated_at": utc_now(),
        }
        await db.users.insert_one(user_doc)

    # 3. Upsert membership into db.org_users (Membership Source)
    # Organization Role comes from the invite (role_id)
    await db.org_users.update_one(
        {
            "user_id": user_id,
            "org_id": org_id,
        },
        {"$set": {
            "role": role_id,  # This is the ORG role (e.g. admin, member)
            "status": "active",
            "is_active": True,
            "updated_at": utc_now()
        },
        "$setOnInsert": {
            "_id": secrets.token_urlsafe(16),
            "created_at": utc_now(),
            "source": "invitation"
        }},
        upsert=True
    )

    # 4. Upsert into db.enterprise_users (Directory Listing ONLY - No Auth)
    # Allows user to appear in team lists without affecting authentication
    await db.enterprise_users.update_one(
        {
            "org_id": org_id,
            "email": email
        },
        {"$set": {
            "user_id": user_id, # Link to unified user_id
            "full_name": full_name,
            "role": role_id,
            "status": "active",
            "is_active": True,
            "updated_at": utc_now()
        },
        "$setOnInsert": {
            "_id": secrets.token_urlsafe(16),
            "created_at": utc_now()
        }},
        upsert=True
    )

    # 5. Mark Invite Accepted
    await db.user_invites.update_one(
        {"invite_token": token},
        {"$set": {
            "status": "accepted", 
            "accepted_at": utc_now(), 
            "user_id": user_id,
            "updated_at": utc_now()
        }},
    )

    return {
        "success": True, 
        "message": "Invite accepted. You can now login.",
        "user_id": user_id,
        "org_id": org_id
    }
