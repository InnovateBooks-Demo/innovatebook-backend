"""
Enterprise Authentication Service
Handles JWT generation, refresh tokens, password management
"""
from passlib.context import CryptContext
import jwt
import os
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
import secrets
import logging
from auth_utils import create_access_token, create_refresh_token, verify_token

logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verify refresh token structure and signature
    Does NOT check DB revocation (done in service/route)
    """
    return verify_token(token, verify_type="refresh")

async def generate_tokens(user: Dict[str, Any], org: Optional[Dict[str, Any]], db) -> Dict[str, str]:
    """
    Generate access and refresh tokens
    Stores refresh token in 'refresh_tokens' collection
    """
    user_id = user["user_id"]
    org_id = org.get("org_id") if org else None
    
    # Create access token
    access_token = create_access_token(
        user_id=user_id,
        org_id=org_id,
        role_id=user.get("role_id"),
        subscription_status=org.get("subscription_status", "trial") if org else "active",
        is_super_admin=user.get("is_super_admin", False)
    )
    
    # Create refresh token
    refresh_token, jti = create_refresh_token(user_id, org_id)
    
    # Store refresh token in database
    refresh_doc = {
        "token": refresh_token,
        "jti": jti,
        "user_id": user_id,
        "org_id": org_id,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE),
        "created_at": datetime.now(timezone.utc),
        "revoked": False
    }
    
    await db.refresh_tokens.insert_one(refresh_doc)
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token
    }

async def revoke_refresh_token(token: str, db):
    """Mark refresh token as revoked by token string"""
    # Ideally we revoke by JTI if we extracted it, but token string works too
    await db.refresh_tokens.update_one(
        {"token": token},
        {"$set": {"revoked": True, "revoked_at": datetime.now(timezone.utc)}}
    )

async def is_refresh_token_revoked(token: str, db) -> bool:
    """Check if refresh token is revoked in DB"""
    doc = await db.refresh_tokens.find_one({"token": token}, {"revoked": 1})
    if not doc:
        return True # Treat unknown tokens as invalid/revoked for safety
    return doc.get("revoked", False)
