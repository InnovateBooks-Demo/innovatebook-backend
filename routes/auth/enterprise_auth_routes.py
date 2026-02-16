"""
Enterprise Authentication Routes
Handles: Login, Refresh Token, Logout
"""
from fastapi import APIRouter, HTTPException, status, Depends
from motor.motor_asyncio import AsyncIOMotorClient
import logging
from datetime import datetime, timezone

from enterprise_models import (
    EnterpriseLogin, EnterpriseLoginResponse, RefreshTokenRequest
)
from enterprise_auth_service import (
    verify_password, generate_tokens, verify_refresh_token,
    is_refresh_token_revoked, revoke_refresh_token
)
from enterprise_middleware import verify_token
import os
from motor.motor_asyncio import AsyncIOMotorClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/enterprise/auth", tags=["Enterprise Auth"])

# Direct MongoDB connection (avoid circular import)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def get_db():
    """Get database instance"""
    return db

# ==================== LOGIN ====================

@router.post("/login", response_model=EnterpriseLoginResponse)
async def enterprise_login(credentials: EnterpriseLogin, db = Depends(get_db)):
    """
    Enterprise login endpoint
    - Validates credentials
    - Returns access + refresh tokens
    - Includes org and subscription info
    """
    try:
        logger.info(f"🔐 Enterprise login attempt: {credentials.email}")
        
        # Find user by email
        user = await db.enterprise_users.find_one(
            {"email": credentials.email},
            {"_id": 0}
        )
        
        if not user:
            logger.warning(f"❌ User not found: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Check if user is active
        if not user.get("is_active", True):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive. Contact administrator."
            )
        
        # Verify password
        if not verify_password(credentials.password, user["password_hash"]):
            logger.warning(f"❌ Invalid password for: {credentials.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Get organization (if not super admin)
        org = None
        if not user.get("is_super_admin"):
            org = await db.organizations.find_one(
            {
                "$or": [
                    {"org_id": user["org_id"]},
                    {"_id": user["org_id"]}
                ],
                "status": "active",
                "is_active": True
            },
            {"_id": 0}
        )

            if not org:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Organization not found"
                )
        
        # Generate tokens
        tokens = await generate_tokens(user, org, db)
        
        # Prepare response
        return EnterpriseLoginResponse(
            success=True,
            message="Login successful",
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            user={
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role_id": user.get("role_id"),
                "is_super_admin": user.get("is_super_admin", False)
            },
            organization={
                "org_id": org["org_id"],
                "org_name": org["org_name"],
                "subscription_status": org["subscription_status"],
                "is_demo": org["is_demo"]
            } if org else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

# ==================== REFRESH TOKEN ====================

@router.post("/refresh", response_model=EnterpriseLoginResponse)
async def refresh_access_token(request: RefreshTokenRequest, db = Depends(get_db)):
    """
    Refresh access token using refresh token
    - Validates refresh token
    - Issues new access token
    - Issues new refresh token (token rotation)
    """
    try:
        # Verify refresh token
        try:
            payload = verify_refresh_token(request.refresh_token)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=str(e)
            )
        
        # Check if token is revoked
        if await is_refresh_token_revoked(request.refresh_token, db):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked"
            )
        
        user_id = payload.get("sub")
        
        # Get user
        org = await db.organizations.find_one(
            {
                "$or": [
                    {"org_id": user["org_id"]},
                    {"_id": user["org_id"]}
                ],
                "status": "active",
                "is_active": True
            },
            {"_id": 0}
        )

        
        if not user or not user.get("is_active"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive"
            )
        
        # Get organization
        org = None
        if not user.get("is_super_admin"):
            org = await db.organizations.find_one(
                {"org_id": user["org_id"]},
                {"_id": 0}
            )
        
        # Revoke old refresh token
        await revoke_refresh_token(request.refresh_token, db)
        
        # Generate new tokens (token rotation)
        tokens = await generate_tokens(user, org, db)
        
        return EnterpriseLoginResponse(
            success=True,
            message="Token refreshed",
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            token_type="bearer",
            user={
                "user_id": user["user_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role_id": user.get("role_id"),
                "is_super_admin": user.get("is_super_admin", False)
            },
            organization={
                "org_id": org["org_id"],
                "org_name": org["org_name"],
                "subscription_status": org["subscription_status"],
                "is_demo": org["is_demo"]
            } if org else None
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )

# ==================== LOGOUT ====================

@router.post("/logout")
async def logout(token_payload: dict = Depends(verify_token), db = Depends(get_db)):
    """
    Logout user
    - Revokes all refresh tokens for user
    """
    try:
        user_id = token_payload.get("user_id")
        
        # Revoke all refresh tokens for this user
        await db.refresh_tokens.update_many(
            {"user_id": user_id},
            {"$set": {"revoked": True}}
        )
        
        logger.info(f"✅ User logged out: {user_id}")
        
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"❌ Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

# ==================== ME ENDPOINT ====================

@router.get("/me")
async def get_current_user_details(
    token_payload: dict = Depends(verify_token),
    db = Depends(get_db)
):
    """
    Get current user information with org and role details
    """
    try:
        user_id = token_payload.get("user_id")
        
        user = await db.enterprise_users.find_one(
            {"user_id": user_id},
            {"_id": 0, "password_hash": 0}
        )
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get organization details
        org = None
        if not user.get("is_super_admin"):
            # org = await db.organizations.find_one(
            #     {"org_id": user["org_id"]},
            #     {"_id": 0}
            # )
            org = await db.organizations.find_one(
    {
        "$or": [
            {"org_id": user["org_id"]},
            {"_id": user["org_id"]}
        ],
        "status": "active",
        "is_active": True
    },
    {"_id": 0}
)

        
        # Get role details
        role = None
        if user.get("role_id"):
            role = await db.roles.find_one(
                {"role_id": user["role_id"]},
                {"_id": 0}
            )
        
        return {
            "success": True,
            "user": user,
            "organization": org,
            "role": role
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get user details error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user details"
        )
