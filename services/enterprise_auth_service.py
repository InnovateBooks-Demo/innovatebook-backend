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

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
ACCESS_TOKEN_EXPIRE = int(os.environ.get('ACCESS_TOKEN_EXPIRE_MINUTES', 15))
REFRESH_TOKEN_EXPIRE = int(os.environ.get('REFRESH_TOKEN_EXPIRE_DAYS', 7))

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(
    user_id: str,
    org_id: Optional[str],
    role_id: Optional[str],
    subscription_status: str,
    is_super_admin: bool = False
) -> str:
    """
    Create JWT access token (short-lived: 15 minutes)
    Contains: user_id, org_id, role_id, subscription_status, is_super_admin
    """
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE)
    
    payload = {
        "user_id": user_id,
        "org_id": org_id,
        "role_id": role_id,
        "subscription_status": subscription_status,
        "is_super_admin": is_super_admin,
        "exp": expire,
        "type": "access"
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def create_refresh_token(user_id: str) -> str:
    """
    Create refresh token (long-lived: 7 days)
    Contains: user_id only
    """
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE)
    
    payload = {
        "user_id": user_id,
        "exp": expire,
        "type": "refresh",
        "jti": secrets.token_urlsafe(16)  # Unique token ID
    }
    
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_refresh_token(token: str) -> Dict[str, Any]:
    """
    Verify refresh token
    Returns payload if valid, raises exception otherwise
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Not a refresh token")
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise jwt.ExpiredSignatureError("Refresh token has expired")
    except jwt.InvalidTokenError as e:
        raise jwt.InvalidTokenError(f"Invalid refresh token: {str(e)}")

async def generate_tokens(user: Dict[str, Any], org: Dict[str, Any], db) -> Dict[str, str]:
    """
    Generate access and refresh tokens for user
    Also stores refresh token in database
    """
    # Create access token
    access_token = create_access_token(
        user_id=user["user_id"],
        org_id=org.get("org_id") if org else None,
        role_id=user.get("role_id"),
        subscription_status=org.get("subscription_status", "trial") if org else "active",
        is_super_admin=user.get("is_super_admin", False)
    )
    
    # Create refresh token
    refresh_token = create_refresh_token(user["user_id"])
    
    # Store refresh token in database
    refresh_doc = {
        "token": refresh_token,
        "user_id": user["user_id"],
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
    """Mark refresh token as revoked"""
    await db.refresh_tokens.update_one(
        {"token": token},
        {"$set": {"revoked": True}}
    )

async def is_refresh_token_revoked(token: str, db) -> bool:
    """Check if refresh token is revoked"""
    token_doc = await db.refresh_tokens.find_one({"token": token}, {"_id": 0})
    if not token_doc:
        return True  # Token doesn't exist = considered revoked
    return token_doc.get("revoked", False)
