"""
Organization Admin Routes
Accessible by Org Admin users
Handles: Role management, user invites, permission assignment
"""
from fastapi import APIRouter, HTTPException, status, Depends
import logging
from datetime import datetime, timezone
import secrets

from enterprise_models import RoleCreate, UserInvite, PermissionAssign
from enterprise_auth_service import hash_password
from enterprise_middleware import verify_token, validate_tenant
from rbac_engine import assign_permissions_to_role
import os
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise/org-admin", tags=["Organization Admin"])

# Direct MongoDB connection (avoid circular import)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def get_db():
    """Get database instance"""
    return db

def require_org_admin(token_payload: dict = Depends(validate_tenant)):
    """Middleware to ensure user is org admin or super admin"""
    if token_payload.get("is_super_admin"):
        return token_payload  # Super admin bypass
    
    role_id = token_payload.get("role_id")
    if role_id != "role_org_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization admin access required"
        )
    return token_payload

# ==================== ROLE MANAGEMENT ====================

@router.post("/roles/create")
async def create_custom_role(
    role_data: RoleCreate,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """
    Create custom role for organization
    """
    try:
        org_id = token_payload.get("org_id")
        
        # Check if role name already exists in org
        existing = await db.roles.find_one(
            {"org_id": org_id, "role_name": role_data.role_name},
            {"_id": 0}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Role name already exists"
            )
        
        # Create role
        role_id = f"role_{secrets.token_urlsafe(8)}"
        role_doc = {
            "role_id": role_id,
            "org_id": org_id,
            "role_name": role_data.role_name,
            "is_system_role": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db.roles.insert_one(role_doc)
        
        logger.info(f"✅ Custom role created: {role_id} for org {org_id}")
        
        return {
            "success": True,
            "message": "Role created successfully",
            "role": role_doc
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Role creation failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Role creation failed"
        )

@router.get("/roles")
async def list_roles(
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """List all roles for organization (including system roles)"""
    try:
        org_id = token_payload.get("org_id")
        
        # Get org-specific roles and system roles
        roles = await db.roles.find(
            {
                "$or": [
                    {"org_id": org_id},
                    {"is_system_role": True}
                ]
            },
            {"_id": 0}
        ).to_list(None)
        
        return {
            "success": True,
            "roles": roles
        }
        
    except Exception as e:
        logger.error(f"❌ List roles failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list roles"
        )

# ==================== PERMISSION MANAGEMENT ====================

@router.get("/modules")
async def list_modules(
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """List all modules"""
    try:
        modules = await db.modules.find({}, {"_id": 0}).to_list(None)
        return {"success": True, "modules": modules}
    except Exception as e:
        logger.error(f"❌ List modules failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to list modules")

@router.get("/submodules")
async def list_submodules(
    module_id: str = None,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """List all submodules (optionally filtered by module)"""
    try:
        query = {"module_id": module_id} if module_id else {}
        submodules = await db.submodules.find(query, {"_id": 0}).to_list(None)
        return {"success": True, "submodules": submodules}
    except Exception as e:
        logger.error(f"❌ List submodules failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to list submodules")

@router.post("/roles/{role_id}/permissions")
async def assign_permissions(
    role_id: str,
    permissions: PermissionAssign,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """
    Assign permissions to a role
    Replaces existing permissions
    """
    try:
        org_id = token_payload.get("org_id")
        
        # Verify role belongs to org or is system role
        role = await db.roles.find_one({"role_id": role_id}, {"_id": 0})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        if role.get("org_id") and role["org_id"] != org_id:
            raise HTTPException(status_code=403, detail="Cannot modify other org's roles")
        
        # Assign permissions
        await assign_permissions_to_role(role_id, permissions.submodule_ids, db)
        
        return {
            "success": True,
            "message": f"Assigned {len(permissions.submodule_ids)} permissions to role"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Assign permissions failed: {e}")
        raise HTTPException(status_code=500, detail="Permission assignment failed")

@router.get("/roles/{role_id}/permissions")
async def get_role_permissions(
    role_id: str,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """Get all permissions for a role"""
    try:
        permissions = await db.role_permissions.find(
            {"role_id": role_id, "granted": True},
            {"_id": 0}
        ).to_list(None)
        
        # Get submodule details
        submodule_ids = [p["submodule_id"] for p in permissions]
        submodules = await db.submodules.find(
            {"submodule_id": {"$in": submodule_ids}},
            {"_id": 0}
        ).to_list(None)
        
        return {
            "success": True,
            "permissions": permissions,
            "submodules": submodules
        }
        
    except Exception as e:
        logger.error(f"❌ Get role permissions failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to get permissions")

# ==================== USER MANAGEMENT ====================

@router.post("/users/invite")
async def invite_user(
    user_data: UserInvite,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """
    Invite user to organization
    Creates user with temporary password (should be changed on first login)
    """
    try:
        org_id = token_payload.get("org_id")
        
        # Check if user already exists
        existing = await db.enterprise_users.find_one(
            {"email": user_data.email},
            {"_id": 0}
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Verify role exists and belongs to org
        role = await db.roles.find_one({"role_id": user_data.role_id}, {"_id": 0})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        if role.get("org_id") and role["org_id"] != org_id:
            raise HTTPException(status_code=403, detail="Cannot assign role from other org")
        
        # Generate temporary password
        temp_password = secrets.token_urlsafe(12)
        
        # Create user
        user_id = f"user_{secrets.token_urlsafe(8)}"
        user_doc = {
            "user_id": user_id,
            "org_id": org_id,
            "email": user_data.email,
            "password_hash": hash_password(temp_password),
            "full_name": user_data.full_name,
            "role_id": user_data.role_id,
            "is_super_admin": False,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.enterprise_users.insert_one(user_doc)
        
        logger.info(f"✅ User invited: {user_id} to org {org_id}")
        
        # In production, send email with temp password
        logger.info(f"📧 Temporary password for {user_data.email}: {temp_password}")
        
        return {
            "success": True,
            "message": "User invited successfully",
            "user_id": user_id,
            "temporary_password": temp_password  # Remove in production, send via email
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ User invite failed: {e}")
        raise HTTPException(status_code=500, detail="User invite failed")

# @router.get("/users")
# async def list_org_users(
#     token_payload: dict = Depends(require_org_admin),
#     db = Depends(get_db)
# ):
#     """List all users in organization"""
#     try:
#         org_id = token_payload.get("org_id")
        
#         users = await db.enterprise_users.find(
#             {"org_id": org_id},
#             {"_id": 0, "password_hash": 0}
#         ).to_list(None)
        
#         # Get role names
#         for user in users:
#             if user.get("role_id"):
#                 role = await db.roles.find_one(
#                     {"role_id": user["role_id"]},
#                     {"_id": 0}
#                 )
#                 user["role_name"] = role["role_name"] if role else None
        
#         return {
#             "success": True,
#             "users": users
#         }
        
#     except Exception as e:
#         logger.error(f"❌ List users failed: {e}")
#         raise HTTPException(status_code=500, detail="Failed to list users")

from datetime import datetime, timezone

def _to_dt(value):
    """Convert Mongo Date or ISO string -> datetime (UTC)."""
    if not value:
        return None
    if isinstance(value, datetime):
        # ensure timezone-aware
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    if isinstance(value, str):
        try:
            # handle 'Z' and '+00:00' formats
            return datetime.fromisoformat(value.replace("Z", "+00:00"))
        except Exception:
            return None
    return None

def _last_login_label(dt: datetime) -> str:
    """Return Today/Yesterday/N days ago based on UTC date."""
    if not dt:
        return "-"
    now_date = datetime.now(timezone.utc).date()
    d = dt.date()
    diff = (now_date - d).days
    if diff <= 0:
        return "Today"
    if diff == 1:
        return "Yesterday"
    return f"{diff} days ago"


@router.get("/users")
async def list_org_users(
    token_payload: dict = Depends(require_org_admin),
    db=Depends(get_db),
):
    """List all users in organization (UI-friendly shape like demo)."""
    try:
        org_id = token_payload.get("org_id")
        if not org_id:
            raise HTTPException(status_code=401, detail="Missing org context")

        users = await db.enterprise_users.find(
            {"org_id": org_id},
            {"_id": 0, "password_hash": 0}
        ).to_list(length=200)

        # Fetch roles once (org + system)
        role_docs = await db.roles.find(
            {"$or": [{"org_id": org_id}, {"is_system": True}]},
            {"_id": 0, "role_id": 1, "role_name": 1}
        ).to_list(length=200)
        role_map = {r["role_id"]: r.get("role_name") for r in role_docs}

        enriched = []
        for u in users:
            # Determine last activity
            last_dt = _to_dt(u.get("last_active_at")) or _to_dt(u.get("last_login_at")) or _to_dt(u.get("created_at"))
            role_id = u.get("role_id")

            # Build UI-friendly user shape (demo-compatible)
            enriched.append({
                "user_id": u.get("user_id"),
                "email": (u.get("email") or "").strip().lower(),
                "full_name": (
                    u.get("full_name")
                    or f"{u.get('first_name','')} {u.get('last_name','')}".strip()
                    or u.get("user_id")
                    or ""
                ),
                "role_id": role_id,
                "role_name": role_map.get(role_id) or role_id or "",
                "is_active": u.get("is_active", True),
                "last_login": _last_login_label(last_dt),
            })

        return {"success": True, "users": enriched}

    except HTTPException:
        raise
    except Exception as e:
        logger.exception(f" List users failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to list users")



@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: str,
    new_role_id: str,
    token_payload: dict = Depends(require_org_admin),
    db = Depends(get_db)
):
    """Update user's role"""
    try:
        org_id = token_payload.get("org_id")
        
        # Verify user belongs to org
        user = await db.enterprise_users.find_one(
            {"user_id": user_id, "org_id": org_id},
            {"_id": 0}
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify new role
        role = await db.roles.find_one({"role_id": new_role_id}, {"_id": 0})
        if not role:
            raise HTTPException(status_code=404, detail="Role not found")
        
        # Update user
        await db.enterprise_users.update_one(
            {"user_id": user_id},
            {
                "$set": {
                    "role_id": new_role_id,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        logger.info(f"✅ User {user_id} role updated to {new_role_id}")
        
        return {
            "success": True,
            "message": "User role updated"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Update user role failed: {e}")
        raise HTTPException(status_code=500, detail="Failed to update user role")
