"""
User Management Routes for Admin
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from motor.motor_asyncio import AsyncIOMotorDatabase
from auth_models import User
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime, timezone
import uuid
import bcrypt
import os
import shutil

router = APIRouter(prefix="/api/users", tags=["User Management"])

# Import dependencies from main
from main import get_current_user, get_database

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "/app/backend/uploads/profile_photos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str
    status: str = "active"

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    email: Optional[EmailStr] = None

class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    status: str
    email_verified: bool
    created_at: str

@router.get("/list", response_model=List[UserResponse])
async def list_users(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all users in the system"""
    users = await db.users.find({
        "email": {"$regex": "@innovatebooks.com"}
    }).to_list(length=None)
    
    result = []
    for user in users:
        # Convert ObjectId to string if needed
        user_id = str(user["_id"]) if user.get("_id") else ""
        
        # Convert datetime to string if needed
        created_at = user.get("created_at", "")
        if isinstance(created_at, datetime):
            created_at = created_at.isoformat()
        elif not created_at:
            created_at = datetime.now(timezone.utc).isoformat()
        
        result.append(UserResponse(
            id=user_id,
            email=user.get("email", ""),
            full_name=user.get("full_name", "Unknown User"),
            role=user.get("role", "No Role"),
            status=user.get("status", "active"),
            email_verified=user.get("email_verified", False),
            created_at=created_at
        ))
    
    return result

@router.post("/create", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new user"""
    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), salt)
    
    # Get current user's tenant to assign to new user
    current_user_data = await db.users.find_one({"_id": current_user.id})
    tenant_id = current_user_data.get("tenant_id") if current_user_data else None
    
    # Create user document
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    new_user = {
        "_id": user_id,
        "email": user_data.email,
        "full_name": user_data.full_name,
        "password_hash": hashed_password.decode('utf-8'),
        "role": user_data.role,
        "status": user_data.status,
        "email_verified": True,
        "tenant_id": tenant_id,
        "created_at": now.isoformat()
    }
    
    await db.users.insert_one(new_user)
    
    # Create tenant mapping if tenant exists
    if tenant_id:
        await db.user_tenant_mappings.insert_one({
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": "user",
            "status": "active"
        })
    
    # Add user to all public channels
    await db.channels.update_many(
        {"type": "public"},
        {"$addToSet": {"members": user_id}}
    )
    
    return UserResponse(
        id=user_id,
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role,
        status=user_data.status,
        email_verified=True,
        created_at=now.isoformat()
    )

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user information"""
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build update dict
    update_data = {}
    if user_data.full_name:
        update_data["full_name"] = user_data.full_name
    if user_data.role:
        update_data["role"] = user_data.role
    if user_data.status:
        update_data["status"] = user_data.status
    if user_data.email:
        # Check if email is already taken
        existing = await db.users.find_one({"email": user_data.email, "_id": {"$ne": user_id}})
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        update_data["email"] = user_data.email
    
    if update_data:
        await db.users.update_one({"_id": user_id}, {"$set": update_data})
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": user_id})
    
    return UserResponse(
        id=updated_user["_id"],
        email=updated_user.get("email", ""),
        full_name=updated_user.get("full_name", ""),
        role=updated_user.get("role", ""),
        status=updated_user.get("status", "active"),
        email_verified=updated_user.get("email_verified", False),
        created_at=updated_user.get("created_at", datetime.now(timezone.utc).isoformat())
    )

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete a user"""
    # Prevent deleting yourself
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Remove from all channels
    await db.channels.update_many(
        {},
        {"$pull": {"members": user_id}}
    )
    
    # Delete user
    await db.users.delete_one({"_id": user_id})
    
    return {"success": True, "message": "User deleted successfully"}


@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload user profile photo"""
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1]
    filename = f"{current_user.id}_{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user record
    photo_url = f"/uploads/profile_photos/{filename}"
    await db.users.update_one(
        {"_id": current_user.id},
        {"$set": {"profile_photo": photo_url}}
    )
    
    return {"photo_url": photo_url, "message": "Profile photo uploaded successfully"}

