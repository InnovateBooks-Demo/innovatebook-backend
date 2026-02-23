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
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
DEBUG = os.getenv("DEBUG", "false").lower() == "true" or os.getenv("ENVIRONMENT") == "development"

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
    - role_id: role_id
    - type: "access"
    - exp: expiration (unix timestamp)
    - iat: issued at (unix timestamp)
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "sub": user_id,
        "user_id": user_id,
        "org_id": org_id,
        "role_id": role_id,
        "type": "access",
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
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
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    
    jti = secrets.token_urlsafe(16)
    
    to_encode = {
        "sub": user_id,
        "user_id": user_id,
        "org_id": org_id,
        "type": "refresh",
        "exp": int(expire.timestamp()),
        "iat": int(now.timestamp()),
        "jti": jti
    }
    
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt, jti

def verify_token(token: str, verify_type: str = "access") -> Dict[str, Any]:
    """
    Verify and decode a JWT token.
    - Checks signature and expiration using PyJWT's built-in validation
    - Checks 'type' claim (if present in token) matches verify_type
    - Normalizes payload (ensures user_id exists if sub exists)
    """
    try:
        # PyJWT's decode verifies the signature and 'exp' claim by default
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Debug logging for development
        now_ts = int(datetime.now(timezone.utc).timestamp())
        exp_ts = payload.get("exp")
        if exp_ts:
            remaining = exp_ts - now_ts
            print(f"DEBUG: Token verified. now={now_ts}, exp={exp_ts}, remaining={remaining}s")

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
        print(f"DEBUG: Token expired. now={int(datetime.now(timezone.utc).timestamp())}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError as e:
        print(f"DEBUG: InvalidTokenError: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
