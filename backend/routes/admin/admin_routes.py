# from fastapi import APIRouter, HTTPException, Depends, status
# from datetime import datetime, timezone, timedelta
# import secrets
# import logging
# from typing import Dict, List, Optional

# from utils.email import send_invite_email
# from ..deps import get_db, get_current_user_admin

# logger = logging.getLogger(__name__)
# router = APIRouter(prefix="/admin", tags=["admin"])

# # ==================== DASHBOARD ====================

# @router.get("/dashboard")
# async def get_admin_dashboard(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     try:
#         org_id = current_user["org_id"]

#         total_users = await db.enterprise_users.count_documents({"org_id": org_id})
#         active_users = await db.enterprise_users.count_documents(
#             {"org_id": org_id, "is_active": True}
#         )

#         pending_invites = await db.user_invites.count_documents({
#             "org_id": org_id,
#             "status": "pending",
#             "expires_at": {"$gt": datetime.now(timezone.utc)}
#         })

#         total_roles = await db.roles.count_documents({"org_id": org_id})

#         return {
#             "success": True,
#             "stats": {
#                 "total_users": total_users,
#                 "active_users": active_users,
#                 "pending_invites": pending_invites,
#                 "total_roles": total_roles,
#             }
#         }

#     except Exception as e:
#         logger.error(f"Dashboard error: {e}")
#         raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


# # ==================== USERS ====================

# @router.get("/users")
# async def list_users(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     try:
#         org_id = current_user["org_id"]

#         users = await db.enterprise_users.find(
#             {"org_id": org_id},
#             {"_id": 0, "password_hash": 0}
#         ).to_list(length=200)

#         return {"success": True, "users": users}

#     except Exception as e:
#         logger.error(f"List users error: {e}")
#         raise HTTPException(status_code=500, detail="Failed to fetch users")

# @router.post("/users/{user_id}/deactivate")
# async def deactivate_user(user_id: str, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     result = await db.enterprise_users.update_one(
#         {"user_id": user_id, "org_id": org_id},
#         {"$set": {
#             "is_active": False,
#             "deactivated_at": datetime.now(timezone.utc).isoformat()
#         }}
#     )

#     if result.modified_count == 0:
#         raise HTTPException(status_code=404, detail="User not found")

#     return {"success": True}


# @router.post("/users/{user_id}/reactivate")
# async def reactivate_user(user_id: str, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     result = await db.enterprise_users.update_one(
#         {"user_id": user_id, "org_id": org_id},
#         {"$set": {"is_active": True, "deactivated_at": None}}
#     )

#     if result.modified_count == 0:
#         raise HTTPException(status_code=404, detail="User not found")

#     return {"success": True}


# # ==================== INVITES ====================

# @router.get("/invites")
# async def list_invites(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     invites = await db.user_invites.find(
#         {"org_id": org_id, "status": "pending"},
#         {"_id": 0}
#     ).to_list(length=100)

#     return {"success": True, "invites": invites}


# @router.post("/invites")
# async def create_invite(invite_data: dict, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     email = (invite_data.get("email") or "").strip().lower()
#     role_id = invite_data.get("role_id")

#     if not email:
#         raise HTTPException(status_code=400, detail="Email required")

#     if not role_id:
#         raise HTTPException(status_code=400, detail="Role required")

#     existing_user = await db.enterprise_users.find_one({
#         "email": email,
#         "org_id": org_id
#     })

#     if existing_user:
#         raise HTTPException(status_code=400, detail="User already exists")

#     existing_invite = await db.user_invites.find_one({
#         "org_id": org_id,
#         "email": email,
#         "status": "pending"
#     })

#     if existing_invite:
#         raise HTTPException(status_code=400, detail="Active invite already exists")

#     invite_id = f"inv_{secrets.token_urlsafe(8)}"
#     invite_token = secrets.token_urlsafe(32)

#     invite_doc = {
#         "invite_id": invite_id,
#         "org_id": org_id,
#         "email": email,
#         "role_id": role_id,
#         "invite_token": invite_token,
#         "status": "pending",
#         "invited_by": current_user["user_id"],
#         "created_at": datetime.now(timezone.utc).isoformat(),
#         "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
#     }

#     await db.user_invites.insert_one(invite_doc)

#     send_invite_email(
#         to_email=email,
#         invite_token=invite_token,
#         org_name="Your Organization"
#     )

#     return {"success": True}


# @router.post("/invites/{invite_id}/resend")
# async def resend_invite(invite_id: str, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     invite = await db.user_invites.find_one({
#         "invite_id": invite_id,
#         "org_id": org_id
#     })

#     if not invite:
#         raise HTTPException(status_code=404, detail="Invite not found")

#     await db.user_invites.update_one(
#         {"invite_id": invite_id},
#         {"$set": {
#             "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
#         }}
#     )

#     send_invite_email(
#         to_email=invite["email"],
#         invite_token=invite["invite_token"],
#         org_name="Your Organization"
#     )

#     return {"success": True}


# # ==================== ROLES ====================

# @router.get("/roles")
# async def list_roles(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     roles = await db.roles.find(
#         {"$or": [{"org_id": org_id}, {"is_system": True}]},
#         {"_id": 0}
#     ).to_list(length=100)

#     return {"success": True, "roles": roles}


# @router.post("/roles")
# async def create_role(role_data: dict, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     role_id = f"role_{secrets.token_urlsafe(8)}"

#     await db.roles.insert_one({
#         "role_id": role_id,
#         "org_id": org_id,
#         "role_name": role_data.get("role_name"),
#         "description": role_data.get("description", ""),
#         "permissions": role_data.get("permissions", []),
#         "is_system": False,
#         "created_at": datetime.now(timezone.utc).isoformat()
#     })

#     return {"success": True}


# # ==================== SETTINGS ====================

# @router.get("/settings")
# async def get_settings(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     settings = await db.org_settings.find_one(
#         {"org_id": org_id},
#         {"_id": 0}
#     )

#     return {"success": True, "settings": settings or {}}


# @router.put("/settings")
# async def update_settings(settings_data: dict, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
#     org_id = current_user["org_id"]

#     settings_data["org_id"] = org_id
#     settings_data["updated_at"] = datetime.now(timezone.utc).isoformat()

#     await db.org_settings.update_one(
#         {"org_id": org_id},
#         {"$set": settings_data},
#         upsert=True
#     )

#     return {"success": True}




# # from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
# # from datetime import datetime, timezone, timedelta
# # import secrets
# # import logging
# # from typing import Any, Dict, List, Optional

# # from pydantic import BaseModel, EmailStr, Field

# # from utils.email import send_invite_email
# # from ..deps import get_db, get_current_user_admin

# # logger = logging.getLogger(__name__)
# # router = APIRouter(prefix="/admin", tags=["admin"])


# # # ==================== HELPERS ====================

# # def utc_now() -> datetime:
# #     return datetime.now(timezone.utc)


# # # ==================== SCHEMAS ====================

# # class InviteCreateIn(BaseModel):
# #     email: EmailStr
# #     role_id: str = Field(..., min_length=3)


# # class RoleCreateIn(BaseModel):
# #     role_name: str = Field(..., min_length=2)
# #     description: str = ""
# #     permissions: List[str] = []


# # class SettingsUpdateIn(BaseModel):
# #     # keep flexible but still validated dict-ish
# #     data: Dict[str, Any] = {}


# # # ==================== DASHBOARD ====================

# # @router.get("/dashboard")
# # async def get_admin_dashboard(
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     try:
# #         org_id = current_user["org_id"]

# #         total_users = await db.enterprise_users.count_documents({"org_id": org_id})
# #         active_users = await db.enterprise_users.count_documents(
# #             {"org_id": org_id, "is_active": True}
# #         )

# #         pending_invites = await db.user_invites.count_documents({
# #             "org_id": org_id,
# #             "status": "pending",
# #             "expires_at": {"$gt": utc_now()},
# #         })

# #         total_roles = await db.roles.count_documents({"org_id": org_id})

# #         return {
# #             "success": True,
# #             "stats": {
# #                 "total_users": total_users,
# #                 "active_users": active_users,
# #                 "pending_invites": pending_invites,
# #                 "total_roles": total_roles,
# #             },
# #         }

# #     except Exception as e:
# #         logger.exception(f"Dashboard error: {e}")
# #         raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


# # # ==================== USERS ====================

# # @router.get("/users")
# # async def list_users(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
# #     try:
# #         org_id = current_user["org_id"]

# #         users = await db.enterprise_users.find(
# #             {"org_id": org_id},
# #             {"_id": 0, "password_hash": 0},
# #         ).to_list(length=200)

# #         return {"success": True, "users": users}

# #     except Exception as e:
# #         logger.exception(f"List users error: {e}")
# #         raise HTTPException(status_code=500, detail="Failed to fetch users")


# # @router.post("/users/{user_id}/deactivate")
# # async def deactivate_user(
# #     user_id: str,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     result = await db.enterprise_users.update_one(
# #         {"user_id": user_id, "org_id": org_id},
# #         {"$set": {
# #             "is_active": False,
# #             "deactivated_at": utc_now(),
# #             "updated_at": utc_now(),
# #             "updated_by": current_user["user_id"],
# #         }},
# #     )

# #     if result.modified_count == 0:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     return {"success": True}


# # @router.post("/users/{user_id}/reactivate")
# # async def reactivate_user(
# #     user_id: str,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     result = await db.enterprise_users.update_one(
# #         {"user_id": user_id, "org_id": org_id},
# #         {"$set": {
# #             "is_active": True,
# #             "deactivated_at": None,
# #             "updated_at": utc_now(),
# #             "updated_by": current_user["user_id"],
# #         }},
# #     )

# #     if result.modified_count == 0:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     return {"success": True}


# # # ==================== INVITES ====================

# # @router.get("/invites")
# # async def list_invites(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
# #     org_id = current_user["org_id"]

# #     invites = await db.user_invites.find(
# #         {"org_id": org_id, "status": "pending"},
# #         {"_id": 0},
# #     ).sort("created_at", -1).to_list(length=100)

# #     return {"success": True, "invites": invites}


# # @router.post("/invites", status_code=status.HTTP_201_CREATED)
# # async def create_invite(
# #     payload: InviteCreateIn,
# #     background_tasks: BackgroundTasks,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     email = payload.email.strip().lower()
# #     role_id = payload.role_id

# #     # 1) validate role exists (org role or system role)
# #     role = await db.roles.find_one(
# #         {"role_id": role_id, "$or": [{"org_id": org_id}, {"is_system": True}]},
# #         {"_id": 0},
# #     )
# #     if not role:
# #         raise HTTPException(status_code=400, detail="Invalid role")

# #     # 2) prevent inviting existing user
# #     existing_user = await db.enterprise_users.find_one({"email": email, "org_id": org_id}, {"_id": 0})
# #     if existing_user:
# #         raise HTTPException(status_code=400, detail="User already exists")

# #     # 3) prevent duplicate active invite
# #     existing_invite = await db.user_invites.find_one({
# #         "org_id": org_id,
# #         "email": email,
# #         "status": "pending",
# #         "expires_at": {"$gt": utc_now()},
# #     }, {"_id": 0})

# #     if existing_invite:
# #         raise HTTPException(status_code=400, detail="Active invite already exists")

# #     invite_id = f"inv_{secrets.token_urlsafe(8)}"
# #     invite_token = secrets.token_urlsafe(32)

# #     created_at = utc_now()
# #     expires_at = created_at + timedelta(days=7)

# #     invite_doc = {
# #         "invite_id": invite_id,
# #         "org_id": org_id,
# #         "email": email,
# #         "role_id": role_id,
# #         "invite_token": invite_token,
# #         "status": "pending",
# #         "invited_by": current_user["user_id"],
# #         "created_at": created_at,
# #         "expires_at": expires_at,
# #         # audit
# #         "updated_at": created_at,
# #         "updated_by": current_user["user_id"],
# #     }

# #     await db.user_invites.insert_one(invite_doc)

# #     # pull org name from settings if present
# #     org_settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0, "org_name": 1})
# #     org_name = (org_settings or {}).get("org_name") or "Your Organization"

# #     # send email async (don’t block API)
# #     background_tasks.add_task(
# #         send_invite_email,
# #         to_email=email,
# #         invite_token=invite_token,
# #         org_name=org_name,
# #     )

# #     return {"success": True, "invite_id": invite_id}


# # @router.post("/invites/{invite_id}/resend")
# # async def resend_invite(
# #     invite_id: str,
# #     background_tasks: BackgroundTasks,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     invite = await db.user_invites.find_one(
# #         {"invite_id": invite_id, "org_id": org_id},
# #         {"_id": 0},
# #     )

# #     if not invite:
# #         raise HTTPException(status_code=404, detail="Invite not found")

# #     if invite.get("status") != "pending":
# #         raise HTTPException(status_code=400, detail="Invite is not pending")

# #     new_expiry = utc_now() + timedelta(days=7)

# #     await db.user_invites.update_one(
# #         {"invite_id": invite_id, "org_id": org_id},
# #         {"$set": {
# #             "expires_at": new_expiry,
# #             "updated_at": utc_now(),
# #             "updated_by": current_user["user_id"],
# #         }},
# #     )

# #     org_settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0, "org_name": 1})
# #     org_name = (org_settings or {}).get("org_name") or "Your Organization"

# #     background_tasks.add_task(
# #         send_invite_email,
# #         to_email=invite["email"],
# #         invite_token=invite["invite_token"],
# #         org_name=org_name,
# #     )

# #     return {"success": True}


# # @router.post("/invites/{invite_id}/revoke")
# # async def revoke_invite(
# #     invite_id: str,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     result = await db.user_invites.update_one(
# #         {"invite_id": invite_id, "org_id": org_id, "status": "pending"},
# #         {"$set": {
# #             "status": "revoked",
# #             "revoked_at": utc_now(),
# #             "updated_at": utc_now(),
# #             "updated_by": current_user["user_id"],
# #         }},
# #     )

# #     if result.modified_count == 0:
# #         raise HTTPException(status_code=404, detail="Invite not found or not pending")

# #     return {"success": True}


# # # ==================== ROLES ====================

# # @router.get("/roles")
# # async def list_roles(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
# #     org_id = current_user["org_id"]

# #     roles = await db.roles.find(
# #         {"$or": [{"org_id": org_id}, {"is_system": True}]},
# #         {"_id": 0},
# #     ).sort("created_at", -1).to_list(length=100)

# #     return {"success": True, "roles": roles}


# # @router.post("/roles", status_code=status.HTTP_201_CREATED)
# # async def create_role(
# #     payload: RoleCreateIn,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]
# #     role_id = f"role_{secrets.token_urlsafe(8)}"

# #     doc = {
# #         "role_id": role_id,
# #         "org_id": org_id,
# #         "role_name": payload.role_name.strip(),
# #         "description": (payload.description or "").strip(),
# #         "permissions": payload.permissions or [],
# #         "is_system": False,
# #         "created_at": utc_now(),
# #         # audit
# #         "created_by": current_user["user_id"],
# #         "updated_at": utc_now(),
# #         "updated_by": current_user["user_id"],
# #     }

# #     await db.roles.insert_one(doc)
# #     return {"success": True, "role_id": role_id}


# # # ==================== SETTINGS ====================

# # @router.get("/settings")
# # async def get_settings(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
# #     org_id = current_user["org_id"]

# #     settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0})
# #     return {"success": True, "settings": settings or {}}


# # @router.put("/settings")
# # async def update_settings(
# #     payload: SettingsUpdateIn,
# #     db=Depends(get_db),
# #     current_user=Depends(get_current_user_admin),
# # ):
# #     org_id = current_user["org_id"]

# #     # store user-provided keys under the document root
# #     update_doc = {
# #         **(payload.data or {}),
# #         "org_id": org_id,
# #         "updated_at": utc_now(),
# #         "updated_by": current_user["user_id"],
# #     }

# #     await db.org_settings.update_one(
# #         {"org_id": org_id},
# #         {"$set": update_doc},
# #         upsert=True,
# #     )

# #     return {"success": True}



from fastapi import APIRouter, HTTPException, Depends, status, BackgroundTasks
from datetime import datetime, timezone, timedelta
import secrets
import logging
from typing import Any, Dict, List

from pydantic import BaseModel, EmailStr, Field

from utils.email import send_invite_email
from ..deps import get_db, get_current_user_admin

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/admin", tags=["admin"])


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _to_dt(value):
    """Convert Mongo Date or ISO string -> datetime (UTC-aware)."""
    if not value:
        return None
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except Exception:
            return None
    return None


def _last_login_label(dt: datetime) -> str:
    """Return Today/Yesterday/N days ago based on UTC date."""
    if not dt:
        return "-"
    today = datetime.now(timezone.utc).date()
    d = dt.date()
    diff = (today - d).days
    if diff <= 0:
        return "Today"
    if diff == 1:
        return "Yesterday"
    return f"{diff} days ago"


class InviteCreateIn(BaseModel):
    email: EmailStr
    role_id: str = Field(..., min_length=2)


class RoleCreateIn(BaseModel):
    role_name: str = Field(..., min_length=2)
    description: str = ""
    permissions: List[str] = []


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_admin_dashboard(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    try:
        org_id = current_user["org_id"]

        total_users = await db.enterprise_users.count_documents({"org_id": org_id})
        active_users = await db.enterprise_users.count_documents({"org_id": org_id, "is_active": True})

        pending_invites = await db.user_invites.count_documents({
            "org_id": org_id,
            "status": "pending",
            "expires_at": {"$gt": utc_now()},
        })

        total_roles = await db.roles.count_documents({"org_id": org_id})

        return {
            "success": True,
            "stats": {
                "total_users": total_users,
                "active_users": active_users,
                "pending_invites": pending_invites,
                "total_roles": total_roles,
            }
        }

    except Exception as e:
        logger.exception(f"Dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard")


# ==================== USERS ====================

@router.get("/users")
async def list_users(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    """
    List users in current org.
    Returns demo-like shape so frontend renders:
      user_id, email, full_name, role_id, role_name, is_active, last_login
    """
    try:
        org_id = current_user["org_id"]

        users = await db.enterprise_users.find(
            {"org_id": org_id},
            {"_id": 0, "password_hash": 0}
        ).to_list(length=200)

        # Role map (org + system)
        roles = await db.roles.find(
            {"$or": [{"org_id": org_id}, {"is_system": True}]},
            {"_id": 0, "role_id": 1, "role_name": 1}
        ).to_list(length=200)
        role_map = {r["role_id"]: r.get("role_name") for r in roles}

        enriched = []
        for u in users:
            last_dt = _to_dt(u.get("last_active_at")) or _to_dt(u.get("last_login_at")) or _to_dt(u.get("created_at"))

            enriched.append({
                "user_id": u.get("user_id"),
                "email": (u.get("email") or "").strip().lower(),
                "full_name": (
                    u.get("full_name")
                    or f"{u.get('first_name','')} {u.get('last_name','')}".strip()
                    or u.get("user_id")
                    or ""
                ),
                "role_id": u.get("role_id"),
                "role_name": role_map.get(u.get("role_id")) or u.get("role_id") or "",
                "is_active": u.get("is_active", True),
                "last_login": _last_login_label(last_dt),
                # keep these if frontend wants later; harmless if unused
                "org_id": u.get("org_id"),
                "is_super_admin": u.get("is_super_admin", False),
                "created_at": u.get("created_at"),
            })

        return {"success": True, "users": enriched}

    except Exception as e:
        logger.exception(f"List users error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")


@router.post("/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    org_id = current_user["org_id"]

    result = await db.enterprise_users.update_one(
        {"user_id": user_id, "org_id": org_id},
        {"$set": {
            "is_active": False,
            "deactivated_at": utc_now(),
            "updated_at": utc_now(),
            "updated_by": current_user["user_id"],
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True}


@router.post("/users/{user_id}/reactivate")
async def reactivate_user(user_id: str, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    org_id = current_user["org_id"]

    result = await db.enterprise_users.update_one(
        {"user_id": user_id, "org_id": org_id},
        {"$set": {
            "is_active": True,
            "deactivated_at": None,
            "updated_at": utc_now(),
            "updated_by": current_user["user_id"],
        }}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    return {"success": True}


# ==================== INVITES ====================

@router.get("/invites")
async def list_invites(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    org_id = current_user["org_id"]

    invites = await db.user_invites.find(
        {"org_id": org_id, "status": "pending"},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)

    return {"success": True, "invites": invites}


@router.post("/invites", status_code=status.HTTP_201_CREATED)
async def create_invite(
    payload: InviteCreateIn,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
    current_user=Depends(get_current_user_admin),
):
    org_id = current_user["org_id"]
    email = payload.email.strip().lower()
    role_id = payload.role_id.strip()

    # validate role exists (org role or system role)
    role = await db.roles.find_one(
        {"role_id": role_id, "$or": [{"org_id": org_id}, {"is_system": True}]},
        {"_id": 0}
    )
    if not role:
        raise HTTPException(status_code=400, detail="Invalid role")

    existing_user = await db.enterprise_users.find_one({"email": email, "org_id": org_id}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    existing_invite = await db.user_invites.find_one(
        {"org_id": org_id, "email": email, "status": "pending", "expires_at": {"$gt": utc_now()}},
        {"_id": 0}
    )
    if existing_invite:
        raise HTTPException(status_code=400, detail="Active invite already exists")

    invite_id = f"inv_{secrets.token_urlsafe(8)}"
    invite_token = secrets.token_urlsafe(32)

    created_at = utc_now()
    expires_at = created_at + timedelta(days=7)

    invite_doc = {
        "invite_id": invite_id,
        "org_id": org_id,
        "email": email,
        "role_id": role_id,
        "invite_token": invite_token,
        "status": "pending",
        "invited_by": current_user["user_id"],
        "created_at": created_at,
        "expires_at": expires_at,
        "updated_at": created_at,
        "updated_by": current_user["user_id"],
    }

    await db.user_invites.insert_one(invite_doc)

    # org name from settings if present
    org_settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0, "org_name": 1})
    org_name = (org_settings or {}).get("org_name") or "Your Organization"

    background_tasks.add_task(
        send_invite_email,
        to_email=email,
        invite_token=invite_token,
        org_name=org_name,
    )

    return {"success": True, "invite_id": invite_id}


@router.post("/invites/{invite_id}/resend")
async def resend_invite(
    invite_id: str,
    background_tasks: BackgroundTasks,
    db=Depends(get_db),
    current_user=Depends(get_current_user_admin),
):
    org_id = current_user["org_id"]

    invite = await db.user_invites.find_one({"invite_id": invite_id, "org_id": org_id}, {"_id": 0})
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    if invite.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Invite is not pending")

    new_expiry = utc_now() + timedelta(days=7)

    await db.user_invites.update_one(
        {"invite_id": invite_id, "org_id": org_id},
        {"$set": {"expires_at": new_expiry, "updated_at": utc_now(), "updated_by": current_user["user_id"]}}
    )

    org_settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0, "org_name": 1})
    org_name = (org_settings or {}).get("org_name") or "Your Organization"

    background_tasks.add_task(
        send_invite_email,
        to_email=invite["email"],
        invite_token=invite["invite_token"],
        org_name=org_name,
    )

    return {"success": True}


# ==================== ROLES ====================

@router.get("/roles")
async def list_roles(db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    org_id = current_user["org_id"]

    roles = await db.roles.find(
        {"$or": [{"org_id": org_id}, {"is_system": True}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=100)

    return {"success": True, "roles": roles}


@router.post("/roles", status_code=status.HTTP_201_CREATED)
async def create_role(payload: RoleCreateIn, db=Depends(get_db), current_user=Depends(get_current_user_admin)):
    org_id = current_user["org_id"]

    role_id = f"role_{secrets.token_urlsafe(8)}"

    await db.roles.insert_one({
        "role_id": role_id,
        "org_id": org_id,
        "role_name": payload.role_name.strip(),
        "description": payload.description.strip() if payload.description else "",
        "permissions": payload.permissions or [],
        "is_system": False,
        "created_at": utc_now(),
        "created_by": current_user["user_id"],
    })

    return {"success": True, "role_id": role_id}
