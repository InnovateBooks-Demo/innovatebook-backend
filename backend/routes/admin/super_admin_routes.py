"""
Super Admin Portal - Organization & User Management with Real-time WebSocket
"""
from fastapi import APIRouter, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from passlib.context import CryptContext
import uuid
import json
import asyncio
import os
# import jwt # Removed
from auth_utils import verify_token

router = APIRouter(prefix="/super-admin", tags=["Super Admin"])

# Import shared dependencies
from app_state import db, pwd_context

# JWT configuration managed by auth_utils
security = HTTPBearer()

async def get_current_user_enterprise(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from enterprise auth token"""
    try:
        token = credentials.credentials
        # Use auth_utils.verify_token
        payload = verify_token(token, verify_type="access")
        
        user_id = payload.get("user_id")
        
        # Check enterprise_users first
        user = await db.enterprise_users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            # Fallback to users collection
            user = await db.users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Add is_super_admin from token if available
        if payload.get("is_super_admin"):
            user["is_super_admin"] = True
            
        return user
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")

# ==================== MODELS ====================

class OrganizationCreate(BaseModel):
    name: str
    display_name: str
    industry: Optional[str] = None
    size: Optional[str] = None  # small, medium, large, enterprise
    subscription_plan: Optional[str] = "trial"  # trial, basic, professional, enterprise
    max_users: Optional[int] = 5
    features: Optional[List[str]] = []

class OrganizationUpdate(BaseModel):
    display_name: Optional[str] = None
    industry: Optional[str] = None
    size: Optional[str] = None
    subscription_plan: Optional[str] = None
    max_users: Optional[int] = None
    features: Optional[List[str]] = None
    is_active: Optional[bool] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str = "user"  # super_admin, org_admin, manager, user
    org_id: str

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

# ==================== WEBSOCKET CONNECTION MANAGER ====================

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # org_id -> [connections]
        self.super_admin_connections: List[WebSocket] = []
    
    async def connect(self, websocket: WebSocket, org_id: str = None, is_super_admin: bool = False):
        await websocket.accept()
        if is_super_admin:
            self.super_admin_connections.append(websocket)
        elif org_id:
            if org_id not in self.active_connections:
                self.active_connections[org_id] = []
            self.active_connections[org_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, org_id: str = None, is_super_admin: bool = False):
        if is_super_admin:
            if websocket in self.super_admin_connections:
                self.super_admin_connections.remove(websocket)
        elif org_id and org_id in self.active_connections:
            if websocket in self.active_connections[org_id]:
                self.active_connections[org_id].remove(websocket)
    
    async def broadcast_to_org(self, org_id: str, message: dict):
        """Broadcast message to all users in an organization"""
        if org_id in self.active_connections:
            for connection in self.active_connections[org_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_to_super_admins(self, message: dict):
        """Broadcast message to all super admins"""
        for connection in self.super_admin_connections:
            try:
                await connection.send_json(message)
            except:
                pass
    
    async def broadcast_all(self, message: dict):
        """Broadcast to everyone"""
        await self.broadcast_to_super_admins(message)
        for org_id in self.active_connections:
            await self.broadcast_to_org(org_id, message)

manager = ConnectionManager()

# ==================== HELPER FUNCTIONS ====================

def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    doc = dict(doc)
    if "_id" in doc:
        del doc["_id"]
    return doc

def serialize_docs(docs):
    return [serialize_doc(d) for d in docs]

async def verify_super_admin(current_user: dict = Depends(get_current_user_enterprise)):
    """Verify that the current user is a super admin"""
    # Check both role and is_super_admin flag for compatibility
    is_super = current_user.get("role") == "super_admin" or current_user.get("is_super_admin", False)
    if not is_super:
        raise HTTPException(status_code=403, detail="Super admin access required")
    return current_user

# ==================== ORGANIZATION ENDPOINTS ====================

@router.get("/organizations")
async def list_organizations(current_user: dict = Depends(verify_super_admin)):
    """List all organizations (Super Admin only)"""
    orgs = await db.organizations.find({}).to_list(1000)
    
    # Get user counts for each org
    for org in orgs:
        user_count = await db.users.count_documents({"org_id": org.get("org_id")})
        org["user_count"] = user_count
    
    return {"organizations": serialize_docs(orgs)}

@router.get("/organizations/{org_id}")
async def get_organization(org_id: str, current_user: dict = Depends(verify_super_admin)):
    """Get organization details"""
    org = await db.organizations.find_one({"org_id": org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    # Get users in this org
    users = await db.users.find({"org_id": org_id}, {"password_hash": 0}).to_list(100)
    org["users"] = serialize_docs(users)
    
    # Get usage stats
    org["stats"] = {
        "user_count": len(users),
        "invoices": await db.invoices.count_documents({"org_id": org_id}),
        "transactions": await db.transactions.count_documents({"org_id": org_id}),
    }
    
    return serialize_doc(org)

@router.post("/organizations")
async def create_organization(org_data: OrganizationCreate, current_user: dict = Depends(verify_super_admin)):
    """Create a new organization"""
    # Check if org name already exists
    existing = await db.organizations.find_one({"name": org_data.name})
    if existing:
        raise HTTPException(status_code=400, detail="Organization name already exists")
    
    org_id = f"ORG-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_org = {
        "org_id": org_id,
        "name": org_data.name,
        "display_name": org_data.display_name,
        "industry": org_data.industry,
        "size": org_data.size,
        "subscription_plan": org_data.subscription_plan,
        "max_users": org_data.max_users,
        "features": org_data.features or ["finance", "commerce"],
        "is_active": True,
        "created_at": now,
        "created_by": current_user.get("user_id"),
        "subscription_start": now,
        "subscription_end": None
    }
    
    await db.organizations.insert_one(new_org)
    
    # Broadcast to super admins
    await manager.broadcast_to_super_admins({
        "type": "ORG_CREATED",
        "data": serialize_doc(new_org),
        "timestamp": now
    })
    
    return {"success": True, "organization": serialize_doc(new_org)}

@router.put("/organizations/{org_id}")
async def update_organization(org_id: str, org_data: OrganizationUpdate, current_user: dict = Depends(verify_super_admin)):
    """Update organization"""
    existing = await db.organizations.find_one({"org_id": org_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    update_data = {k: v for k, v in org_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = current_user.get("user_id")
    
    await db.organizations.update_one({"org_id": org_id}, {"$set": update_data})
    
    updated = await db.organizations.find_one({"org_id": org_id})
    
    # Broadcast update
    await manager.broadcast_to_super_admins({
        "type": "ORG_UPDATED",
        "data": serialize_doc(updated),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "organization": serialize_doc(updated)}

@router.delete("/organizations/{org_id}")
async def deactivate_organization(org_id: str, current_user: dict = Depends(verify_super_admin)):
    """Deactivate an organization (soft delete)"""
    existing = await db.organizations.find_one({"org_id": org_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Organization not found")
    
    await db.organizations.update_one(
        {"org_id": org_id},
        {"$set": {
            "is_active": False,
            "deactivated_at": datetime.now(timezone.utc).isoformat(),
            "deactivated_by": current_user.get("user_id")
        }}
    )
    
    # Deactivate all users in this org
    await db.users.update_many(
        {"org_id": org_id},
        {"$set": {"is_active": False}}
    )
    
    # Broadcast
    await manager.broadcast_to_super_admins({
        "type": "ORG_DEACTIVATED",
        "org_id": org_id,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "message": "Organization deactivated"}

# ==================== USER MANAGEMENT ENDPOINTS ====================

@router.get("/users")
async def list_all_users(org_id: Optional[str] = None, current_user: dict = Depends(verify_super_admin)):
    """List all users (optionally filtered by org)"""
    query = {}
    if org_id:
        query["org_id"] = org_id
    
    users = await db.users.find(query, {"password_hash": 0}).to_list(1000)
    return {"users": serialize_docs(users)}

@router.post("/users")
async def create_user(user_data: UserCreate, current_user: dict = Depends(verify_super_admin)):
    """Create a new user for an organization"""
    # Check if email exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if org exists and is active
    org = await db.organizations.find_one({"org_id": user_data.org_id})
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if not org.get("is_active", True):
        raise HTTPException(status_code=400, detail="Organization is not active")
    
    # Check user limit
    user_count = await db.users.count_documents({"org_id": user_data.org_id})
    if user_count >= org.get("max_users", 5):
        raise HTTPException(status_code=400, detail=f"Organization has reached maximum users ({org.get('max_users')})")
    
    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    new_user = {
        "user_id": user_id,
        "email": user_data.email,
        "password_hash": pwd_context.hash(user_data.password),
        "first_name": user_data.first_name,
        "last_name": user_data.last_name,
        "role": user_data.role,
        "org_id": user_data.org_id,
        "is_active": True,
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.users.insert_one(new_user)
    
    # Remove password hash from response
    del new_user["password_hash"]
    
    # Broadcast
    await manager.broadcast_to_super_admins({
        "type": "USER_CREATED",
        "data": serialize_doc(new_user),
        "timestamp": now
    })
    
    await manager.broadcast_to_org(user_data.org_id, {
        "type": "USER_CREATED",
        "data": serialize_doc(new_user),
        "timestamp": now
    })
    
    return {"success": True, "user": serialize_doc(new_user)}

@router.put("/users/{user_id}")
async def update_user(user_id: str, user_data: UserUpdate, current_user: dict = Depends(verify_super_admin)):
    """Update a user"""
    existing = await db.users.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    update_data = {k: v for k, v in user_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.users.update_one({"user_id": user_id}, {"$set": update_data})
    
    updated = await db.users.find_one({"user_id": user_id}, {"password_hash": 0})
    
    # Broadcast
    await manager.broadcast_to_super_admins({
        "type": "USER_UPDATED",
        "data": serialize_doc(updated),
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "user": serialize_doc(updated)}

@router.delete("/users/{user_id}")
async def deactivate_user(user_id: str, current_user: dict = Depends(verify_super_admin)):
    """Deactivate a user"""
    existing = await db.users.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    if existing.get("role") == "super_admin":
        raise HTTPException(status_code=400, detail="Cannot deactivate super admin")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {"is_active": False, "deactivated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "User deactivated"}

@router.post("/users/{user_id}/reset-password")
async def reset_user_password(user_id: str, new_password: str, current_user: dict = Depends(verify_super_admin)):
    """Reset a user's password"""
    existing = await db.users.find_one({"user_id": user_id})
    if not existing:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.users.update_one(
        {"user_id": user_id},
        {"$set": {
            "password_hash": pwd_context.hash(new_password),
            "password_reset_at": datetime.now(timezone.utc).isoformat(),
            "password_reset_by": current_user.get("user_id")
        }}
    )
    
    return {"success": True, "message": "Password reset successfully"}

# ==================== DASHBOARD STATS ====================

@router.get("/dashboard")
async def get_super_admin_dashboard(current_user: dict = Depends(verify_super_admin)):
    """Get super admin dashboard stats"""
    total_orgs = await db.organizations.count_documents({})
    active_orgs = await db.organizations.count_documents({"is_active": True})
    total_users = await db.users.count_documents({})
    active_users = await db.users.count_documents({"is_active": True})
    
    # Get subscription breakdown
    plans = await db.organizations.aggregate([
        {"$group": {"_id": "$subscription_plan", "count": {"$sum": 1}}}
    ]).to_list(100)
    
    # Get recent activity
    recent_orgs = await db.organizations.find({}).sort("created_at", -1).limit(5).to_list(5)
    recent_users = await db.users.find({}, {"password_hash": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "stats": {
            "total_organizations": total_orgs,
            "active_organizations": active_orgs,
            "total_users": total_users,
            "active_users": active_users
        },
        "subscription_breakdown": {p["_id"] or "unknown": p["count"] for p in plans},
        "recent_organizations": serialize_docs(recent_orgs),
        "recent_users": serialize_docs(recent_users)
    }

# ==================== WEBSOCKET ENDPOINTS ====================

@router.websocket("/ws/{org_id}")
async def websocket_endpoint(websocket: WebSocket, org_id: str):
    """WebSocket endpoint for real-time updates within an organization"""
    await manager.connect(websocket, org_id=org_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo back or handle messages
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket, org_id=org_id)

@router.websocket("/ws/admin")
async def admin_websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for super admin real-time updates"""
    await manager.connect(websocket, is_super_admin=True)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong", "timestamp": datetime.now(timezone.utc).isoformat()})
    except WebSocketDisconnect:
        manager.disconnect(websocket, is_super_admin=True)

# ==================== SEED SUPER ADMIN ====================

@router.post("/seed-super-admin")
async def seed_super_admin():
    """Create initial super admin user (no auth required - run once)"""
    # Check if super admin exists in enterprise_users
    existing = await db.enterprise_users.find_one({"is_super_admin": True})
    if existing:
        return {"message": "Super admin already exists", "email": existing.get("email")}
    
    # Also check users collection
    existing_user = await db.users.find_one({"role": "super_admin"})
    
    # Create default organization for super admin
    org_id = "ORG-SUPERADMIN"
    org_exists = await db.organizations.find_one({"org_id": org_id})
    if not org_exists:
        await db.organizations.insert_one({
            "org_id": org_id,
            "name": "InnovateBooks Admin",
            "display_name": "InnovateBooks Administration",
            "subscription_plan": "enterprise",
            "max_users": 100,
            "features": ["all"],
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    # Create super admin user in both collections
    user_id = f"USR-{uuid.uuid4().hex[:8].upper()}"
    password_hash = pwd_context.hash("Admin@123")
    now = datetime.now(timezone.utc).isoformat()
    
    # For enterprise_users collection (used by enterprise auth)
    enterprise_user = {
        "user_id": user_id,
        "email": "admin@innovatebooks.com",
        "password_hash": password_hash,
        "full_name": "Super Admin",
        "first_name": "Super",
        "last_name": "Admin",
        "role": "super_admin",
        "org_id": org_id,
        "is_super_admin": True,
        "is_active": True,
        "created_at": now
    }
    
    await db.enterprise_users.insert_one(enterprise_user)
    
    # For users collection (used by standard auth)
    if not existing_user:
        standard_user = {
            "user_id": user_id,
            "email": "admin@innovatebooks.com",
            "password_hash": password_hash,
            "full_name": "Super Admin",
            "first_name": "Super",
            "last_name": "Admin",
            "role": "super_admin",
            "org_id": org_id,
            "is_active": True,
            "created_at": now
        }
        await db.users.insert_one(standard_user)
    
    return {
        "success": True,
        "message": "Super admin created",
        "credentials": {
            "email": "admin@innovatebooks.com",
            "password": "Admin@123"
        }
    }

# Export the connection manager for use in other modules
def get_connection_manager():
    return manager
