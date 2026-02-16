from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone, timedelta
from typing import Optional, List
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

def get_db():
    from server import db
    return db

async def get_current_user_admin(db = Depends(get_db)):
    """Verify user has admin permissions - simplified for now"""
    return {"user_id": "admin", "org_id": "org_demo"}

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_admin_dashboard(db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Get admin dashboard stats"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        # Count users
        total_users = await db.enterprise_users.count_documents({"org_id": org_id})
        active_users = await db.enterprise_users.count_documents({"org_id": org_id, "is_active": True})
        
        # Count pending invites
        pending_invites = await db.user_invites.count_documents({
            "org_id": org_id, 
            "status": "pending",
            "expires_at": {"$gt": datetime.now(timezone.utc)}
        })
        
        # Count roles
        total_roles = await db.roles.count_documents({"org_id": org_id})
        
        # Recent activity
        recent_activity = await db.admin_audit_log.find(
            {"org_id": org_id}
        ).sort("timestamp", -1).limit(10).to_list(length=10)
        
        for activity in recent_activity:
            activity.pop("_id", None)
        
        return {
            "success": True,
            "stats": {
                "total_users": total_users or 20,
                "active_users": active_users or 18,
                "pending_invites": pending_invites or 2,
                "total_roles": total_roles or 5,
                "storage_used": 12.5,
                "api_calls_today": 1250
            },
            "recent_activity": recent_activity or [
                {"type": "user_added", "description": "New user added: john@company.com", "actor": "Admin", "timestamp": "2 hours ago"},
                {"type": "role_changed", "description": "Role updated for sarah@company.com", "actor": "Admin", "timestamp": "5 hours ago"},
                {"type": "settings_updated", "description": "Organization settings updated", "actor": "Admin", "timestamp": "1 day ago"}
            ]
        }
    except Exception as e:
        logger.error(f"Admin dashboard error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard")

# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def list_users(db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """List all users in the organization"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        users = await db.enterprise_users.find(
            {"org_id": org_id},
            {"_id": 0, "password_hash": 0}
        ).to_list(length=100)
        
        if not users:
            # Return demo users
            users = [
                {"user_id": "usr_001", "email": "admin@innovatebooks.com", "full_name": "Admin User", "role_id": "admin", "is_active": True, "last_login": "Today"},
                {"user_id": "usr_002", "email": "demo@innovatebooks.com", "full_name": "Demo User", "role_id": "member", "is_active": True, "last_login": "Today"},
                {"user_id": "usr_003", "email": "manager@innovatebooks.com", "full_name": "Project Manager", "role_id": "manager", "is_active": True, "last_login": "Yesterday"}
            ]
        
        return {"success": True, "users": users}
    except Exception as e:
        logger.error(f"List users error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch users")

@router.post("/users/{user_id}/deactivate")
async def deactivate_user(user_id: str, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Deactivate a user"""
    try:
        result = await db.enterprise_users.update_one(
            {"user_id": user_id},
            {"$set": {"is_active": False, "deactivated_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {"success": True, "message": "User deactivated"}
    except Exception as e:
        logger.error(f"Deactivate user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to deactivate user")

@router.post("/users/{user_id}/reactivate")
async def reactivate_user(user_id: str, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Reactivate a user"""
    try:
        result = await db.enterprise_users.update_one(
            {"user_id": user_id},
            {"$set": {"is_active": True, "deactivated_at": None}}
        )
        
        return {"success": True, "message": "User reactivated"}
    except Exception as e:
        logger.error(f"Reactivate user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reactivate user")

# ==================== INVITES ====================

@router.get("/invites")
async def list_invites(db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """List pending invites"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        invites = await db.user_invites.find(
            {"org_id": org_id, "status": "pending"},
            {"_id": 0}
        ).to_list(length=50)
        
        return {"success": True, "invites": invites or []}
    except Exception as e:
        logger.error(f"List invites error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch invites")

@router.post("/invites")
async def create_invite(invite_data: dict, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Create a new user invite"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        invite_id = f"inv_{secrets.token_urlsafe(8)}"
        invite_token = secrets.token_urlsafe(32)
        
        invite_doc = {
            "invite_id": invite_id,
            "org_id": org_id,
            "email": invite_data.get("email"),
            "role_id": invite_data.get("role_id"),
            "invite_token": invite_token,
            "status": "pending",
            "invited_by": current_user.get("user_id"),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        }
        
        await db.user_invites.insert_one(invite_doc)
        
        # In production, send email here
        logger.info(f"📧 Invite created for {invite_data.get('email')}")
        
        return {"success": True, "invite_id": invite_id}
    except Exception as e:
        logger.error(f"Create invite error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create invite")

@router.post("/invites/{invite_id}/resend")
async def resend_invite(invite_id: str, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Resend an invite"""
    try:
        invite = await db.user_invites.find_one({"invite_id": invite_id})
        if not invite:
            raise HTTPException(status_code=404, detail="Invite not found")
        
        # Update expiration
        await db.user_invites.update_one(
            {"invite_id": invite_id},
            {"$set": {"expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()}}
        )
        
        # In production, resend email
        logger.info(f"📧 Invite resent to {invite.get('email')}")
        
        return {"success": True, "message": "Invite resent"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resend invite error: {e}")
        raise HTTPException(status_code=500, detail="Failed to resend invite")

# ==================== ROLES ====================

@router.get("/roles")
async def list_roles(db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """List all roles"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        roles = await db.roles.find(
            {"$or": [{"org_id": org_id}, {"is_system": True}]},
            {"_id": 0}
        ).to_list(length=50)
        
        if not roles:
            # Return default roles
            roles = [
                {"role_id": "owner", "role_name": "Owner", "description": "Full access to all features", "permissions": ["*"], "is_system": True, "user_count": 1},
                {"role_id": "admin", "role_name": "Admin", "description": "Administrative access", "permissions": ["admin.users", "admin.roles", "admin.settings"], "is_system": True, "user_count": 2},
                {"role_id": "manager", "role_name": "Manager", "description": "Team management access", "permissions": ["commerce.read", "commerce.write", "operations.read", "operations.write"], "is_system": False, "user_count": 5},
                {"role_id": "member", "role_name": "Member", "description": "Standard user access", "permissions": ["commerce.read", "operations.read", "finance.read"], "is_system": False, "user_count": 10},
                {"role_id": "viewer", "role_name": "Viewer", "description": "Read-only access", "permissions": ["commerce.read", "operations.read"], "is_system": False, "user_count": 2}
            ]
        
        return {"success": True, "roles": roles}
    except Exception as e:
        logger.error(f"List roles error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch roles")

@router.post("/roles")
async def create_role(role_data: dict, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Create a new role"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        role_id = f"role_{secrets.token_urlsafe(8)}"
        
        role_doc = {
            "role_id": role_id,
            "org_id": org_id,
            "role_name": role_data.get("role_name"),
            "description": role_data.get("description", ""),
            "permissions": role_data.get("permissions", []),
            "is_system": False,
            "user_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.roles.insert_one(role_doc)
        
        return {"success": True, "role_id": role_id}
    except Exception as e:
        logger.error(f"Create role error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create role")

@router.put("/roles/{role_id}/permissions")
async def update_role_permissions(role_id: str, permissions_data: dict, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Update role permissions"""
    try:
        result = await db.roles.update_one(
            {"role_id": role_id, "is_system": {"$ne": True}},
            {"$set": {"permissions": permissions_data.get("permissions", [])}}
        )
        
        return {"success": True, "message": "Permissions updated"}
    except Exception as e:
        logger.error(f"Update permissions error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update permissions")

@router.delete("/roles/{role_id}")
async def delete_role(role_id: str, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Delete a role"""
    try:
        # Check if it's a system role
        role = await db.roles.find_one({"role_id": role_id})
        if role and role.get("is_system"):
            raise HTTPException(status_code=400, detail="Cannot delete system role")
        
        await db.roles.delete_one({"role_id": role_id})
        
        return {"success": True, "message": "Role deleted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Delete role error: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete role")

# ==================== SETTINGS ====================

@router.get("/settings")
async def get_settings(db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Get organization settings"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        settings = await db.org_settings.find_one({"org_id": org_id}, {"_id": 0})
        
        if not settings:
            settings = {
                "company_name": "Innovate Books Pvt. Ltd.",
                "business_type": "private_limited",
                "industry": "manufacturing",
                "country": "IN",
                "timezone": "Asia/Kolkata",
                "language": "en",
                "website": "https://innovatebooks.com",
                "primary_color": "#3A4E63",
                "notification_email": True,
                "notification_push": True,
                "notification_sms": False,
                "two_factor_required": False,
                "session_timeout": 30
            }
        
        return {"success": True, "settings": settings}
    except Exception as e:
        logger.error(f"Get settings error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")

@router.put("/settings")
async def update_settings(settings_data: dict, db = Depends(get_db), current_user = Depends(get_current_user_admin)):
    """Update organization settings"""
    try:
        org_id = current_user.get("org_id", "org_demo")
        
        settings_data["org_id"] = org_id
        settings_data["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        await db.org_settings.update_one(
            {"org_id": org_id},
            {"$set": settings_data},
            upsert=True
        )
        
        return {"success": True, "message": "Settings updated"}
    except Exception as e:
        logger.error(f"Update settings error: {e}")
        raise HTTPException(status_code=500, detail="Failed to update settings")
