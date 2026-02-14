from datetime import datetime, timedelta, timezone
import os
import jwt
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
import secrets

# Initial Configuration (will be loaded from env)
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
if not JWT_SECRET:
    raise RuntimeError("JWT_SECRET_KEY is missing in environment variables")

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

def create_access_token(
    user_id: str,
    org_id: Optional[str] = None,
    role_id: Optional[str] = None,
    subscription_status: str = "trial",
    is_super_admin: bool = False,
    expires_delta: Optional[timedelta] = None
) -> str:
    """
    Generate a standardized Access Token.
    Payload:
    - sub: user_id
    - user_id: user_id (explicit)
    - org_id: org_id
    - role: role_id
    - type: "access"
    - exp: expiration
    - iat: issued at
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": user_id,
        "user_id": user_id,
        "org_id": org_id,
        "role": role_id, # Standardized key 'role' vs 'role_id' - user requested 'role'
        "role_id": role_id, # Keeping both for backward compat if needed, or strictly following requirement?
                            # User said: "role", so I will include "role"
        "type": "access",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "subscription_status": subscription_status,
        "is_super_admin": is_super_admin
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def create_refresh_token(
    user_id: str,
    org_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None
) -> tuple[str, str]:
    """
    Generate a standardized Refresh Token.
    Returns: (token_string, jti)
    Payload:
    - sub: user_id
    - user_id: user_id
    - org_id: org_id
    - type: "refresh"
    - exp: expiration
    - iat: issued at
    - jti: unique identifier
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    jti = secrets.token_urlsafe(16)
    
    to_encode = {
        "sub": user_id,
        "user_id": user_id,
        "org_id": org_id,
        "type": "refresh",
        "exp": expire,
        "iat": datetime.now(timezone.utc),
        "jti": jti
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt, jti

def verify_token(token: str, verify_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    - Checks signature
    - Checks expiration
    - Checks 'type' claim (if present in token) matches verify_type
    - Normalizes payload (ensures user_id exists if sub exists)
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Verify type if the token has it
        token_type = payload.get("type")
        if token_type and token_type != verify_type:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token type. Expected {verify_type}, got {token_type}"
            )

        # Normalize user_id
        if "user_id" not in payload and "sub" in payload:
            payload["user_id"] = payload["sub"]
            
        if "user_id" not in payload:
             raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user identifier"
            )
            
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
