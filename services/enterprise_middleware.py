"""
Enterprise Middleware Pipeline
Handles: Authentication → Tenant Validation → Subscription Guard → RBAC Guard
"""
from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
import jwt
import os
from datetime import datetime, timezone
from typing import Optional, Dict, Any
import logging
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')

# Direct MongoDB connection (avoid circular import)
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db_instance = client[os.environ['DB_NAME']]

def get_db():
    """Get database instance"""
    return db_instance

# ==================== AUTHENTICATION MIDDLEWARE ====================

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
) -> Dict[str, Any]:
    """
    Verify JWT token and extract payload
    Returns: Token payload with user_id, org_id, role_id, subscription_status
    """
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        
        # Validate required fields
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user_id"
            )
        
        # Check token expiration (JWT library does this automatically)
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again."
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}"
        )

# ==================== TENANT VALIDATION MIDDLEWARE ====================

# async def validate_tenant(
#     token_payload: Dict[str, Any] = Depends(verify_token),
#     db = Depends(get_db)
# ) -> Dict[str, Any]:
#     """
#     Validate tenant exists and is active
#     Super admins bypass tenant validation
#     """
#     # Super admin bypass
#     if token_payload.get("is_super_admin"):
#         return token_payload
    
#     org_id = token_payload.get("org_id")
#     if not org_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No organization assigned to user"
#         )
    
#     # Verify organization exists and is active
#     org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})
#     if not org:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization not found or inactive"
#         )
    
#     return token_payload

from fastapi import Depends, HTTPException, status
from typing import Dict, Any

# async def validate_tenant(
#     token_payload: Dict[str, Any] = Depends(verify_token),
#     db = Depends(get_db),
# ) -> Dict[str, Any]:
#     """
#     Validate tenant exists and is active
#     Super admins bypass tenant validation
#     """
#     # Super admin bypass
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     org_id = token_payload.get("org_id")
#     if not org_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No organization assigned to user",
#         )

#     # ✅ Fetch org (support both {_id} and {org_id} styles)
#     org = await db.organizations.find_one(
#         {"$or": [{"org_id": org_id}, {"_id": org_id}]},
#         {"_id": 0},
#     )

#     if not org:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization not found",
#         )

#     # ✅ (Optional but recommended) active checks
#     # Your org docs show: status: "active", is_active: true
#     if org.get("is_active") is False or str(org.get("status", "active")).lower() != "active":
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization inactive",
#         )

#     # ✅ IMPORTANT: attach subscription status into token payload
#     # (Your docs show subscription_status exists. Fallback to org.status.)
#     token_payload["subscription_status"] = (
#         org.get("subscription_status")
#         or org.get("subscriptionStatus")     # if any camelCase usage exists
#         or org.get("status")
#         or "trial"
#     )

#     print("[validate_tenant] org_id:", org_id)
#     print("[validate_tenant] org found:", bool(org))
#     print("[validate_tenant] org subscription_status:", org.get("subscription_status") if org else None)
#     print("[validate_tenant] payload subscription_status:", token_payload.get("subscription_status"))

#     return token_payload
# async def validate_tenant(
#     token_payload: Dict[str, Any] = Depends(verify_token),
#     db = Depends(get_db)
# ) -> Dict[str, Any]:

#     if token_payload.get("is_super_admin"):
#         return token_payload

#     org_id = token_payload.get("org_id")
#     if not org_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No organization assigned to user"
#         )

#     # ✅ IMPORTANT: match both org_id field and _id style
#     org = await db.organizations.find_one(
#         {"$or": [{"org_id": org_id}, {"_id": org_id}]},
#         {"_id": 0}
#     )
#     if not org:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization not found or inactive"
#         )

#     # ✅ THIS IS THE KEY LINE
#     token_payload["subscription_status"] = org.get("subscription_status", org.get("status", "trial"))

#     return token_payload

# async def validate_tenant(
#     token_payload: Dict[str, Any] = Depends(verify_token),
#     db = Depends(get_db)
# ) -> Dict[str, Any]:
#     """
#     Validate tenant exists and is active
#     Super admins bypass tenant validation
#     """
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     org_id = token_payload.get("org_id")
#     if not org_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No organization assigned to user"
#         )

#     # IMPORTANT: look up org by org_id
#     org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})

#     # If your organizations collection actually uses _id=org_id instead of org_id field,
#     # uncomment this fallback:
#     # if not org:
#     #     org = await db.organizations.find_one({"_id": org_id}, {"_id": 0})

#     if not org or not org.get("is_active", True):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization not found or inactive"
#         )

#     # ✅ Attach subscription_status so require_active_subscription can read it
#     token_payload["subscription_status"] = org.get("subscription_status") or org.get("status") or "trial"
#     token_payload["plan"] = org.get("plan")
#     token_payload["org_name"] = org.get("name")

#     return token_payload
from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status

# async def validate_tenant(
#     token_payload: Dict[str, Any] = Depends(verify_token),
#     db = Depends(get_db),
# ) -> Dict[str, Any]:
#     """
#     Validate tenant exists and is active
#     Super admins bypass tenant validation
#     Also inject subscription_status into token_payload (critical for gating)
#     """
#     # Super admin bypass
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     org_id = token_payload.get("org_id")
#     if not org_id:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="No organization assigned to user",
#         )

#     # Your DB seems to have org docs in two possible shapes:
#     # 1) {"org_id": "org_default_innovate", ...}
#     # 2) {"_id": "org_default_innovate", ...}
#     org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})

#     if not org:
#         org = await db.organizations.find_one({"_id": org_id}, {"_id": 0})

#     if not org or not org.get("is_active", True):
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Organization not found or inactive",
#         )

#     # ✅ Inject subscription status into token payload so gating works
#     token_payload["subscription_status"] = (
#         org.get("subscription_status")
#         or org.get("status")
#         or "trial"
#     )

#     # Optional extra helpful fields
#     token_payload["plan"] = org.get("plan")
#     token_payload["org_name"] = org.get("name")

#     return token_payload

from typing import Dict, Any, Optional
from fastapi import Depends, HTTPException, status
from datetime import datetime, timezone

async def validate_tenant(
    token_payload: Dict[str, Any] = Depends(verify_token),
    db = Depends(get_db)
) -> Dict[str, Any]:
    """
    Validate tenant exists and is active.
    Also inject subscription_status from DB into token_payload.
    Super admins bypass tenant validation.
    """
    if token_payload.get("is_super_admin"):
        token_payload["subscription_status"] = "active"
        return token_payload

    org_id = token_payload.get("org_id")
    if not org_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No organization assigned to user"
        )

    # 1) Try lookup by org_id field
    org = await db.organizations.find_one({"org_id": org_id})

    # 2) Fallback lookup by _id (because you also have _id = "org_default_innovate")
    if not org:
        org = await db.organizations.find_one({"_id": org_id})

    if not org or not org.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Organization not found or inactive"
        )

    # ✅ Inject subscription status from DB (THIS is the missing piece)
    # Prefer "subscription_status", fallback to "status", else trial
    token_payload["subscription_status"] = (org.get("subscription_status") or org.get("status") or "trial")

    # Optional (useful for debugging / future logic)
    token_payload["plan"] = org.get("plan")
    token_payload["org_name"] = org.get("name")

    return token_payload
# ==================== SUBSCRIPTION GUARD MIDDLEWARE ====================

# async def subscription_guard(
#     token_payload: Dict[str, Any] = Depends(validate_tenant),
#     db = Depends(get_db)
# ) -> Dict[str, Any]:
#     """
#     Check subscription status
#     Block write operations if subscription is trial/expired/cancelled
#     Super admins bypass subscription checks
#     """
#     # Super admin bypass
#     if token_payload.get("is_super_admin"):
#         return token_payload
    
#     subscription_status = token_payload.get("subscription_status", "trial")
    
#     # Always allow read operations
#     # Write operations will be blocked at route level if needed
#     return token_payload
# async def subscription_guard(
#     token_payload: Dict[str, Any] = Depends(validate_tenant),
#     db = Depends(get_db),
# ) -> Dict[str, Any]:
#     """
#     Check subscription status.
#     Super admins bypass subscription checks.
#     Read operations are always allowed.
#     """
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     # subscription_status is now guaranteed to exist
#     subscription_status = (token_payload.get("subscription_status") or "trial").lower()
#     token_payload["subscription_status"] = subscription_status

#     return token_payload
from typing import Dict, Any
from fastapi import Depends

async def subscription_guard(
    token_payload: Dict[str, Any] = Depends(validate_tenant),
    db = Depends(get_db)
) -> Dict[str, Any]:
    """
    subscription_status is already injected by validate_tenant().
    This function just passes payload forward.
    """
    return token_payload

# def require_active_subscription(token_payload: Dict[str, Any] = Depends(subscription_guard)):
#     """
#     Dependency for routes that require active subscription
#     Use this on POST/PUT/DELETE routes
#     """
#     if token_payload.get("is_super_admin"):
#         return token_payload
    
#     subscription_status = token_payload.get("subscription_status", "trial")
    
#     if subscription_status in ["trial", "expired", "cancelled"]:
#         raise HTTPException(
#             status_code=status.HTTP_402_PAYMENT_REQUIRED,
#             detail={
#                 "error": "UPGRADE_REQUIRED",
#                 "message": "Upgrade your subscription to access this feature",
#                 "subscription_status": subscription_status
#             }
#         )
#     print("[require_active_subscription] payload subscription_status:", token_payload.get("subscription_status"))
    
#     return token_payload
# def require_active_subscription(token_payload: Dict[str, Any] = Depends(subscription_guard)):
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     subscription_status = (token_payload.get("subscription_status", "trial") or "").lower()

#     if subscription_status in ["trial", "expired", "cancelled"]:
#         raise HTTPException(
#             status_code=status.HTTP_402_PAYMENT_REQUIRED,
#             detail={
#                 "error": "UPGRADE_REQUIRED",
#                 "message": "Upgrade your subscription to access this feature",
#                 "subscription_status": subscription_status
#             }
#         )

#     return token_payload

# def require_active_subscription(
#     token_payload: Dict[str, Any] = Depends(subscription_guard),
# ):
#     """
#     Dependency for routes that require ACTIVE subscription.
#     Put this on POST/PUT/DELETE routes.
#     """
#     if token_payload.get("is_super_admin"):
#         return token_payload

#     subscription_status = (token_payload.get("subscription_status") or "trial").lower()

#     if subscription_status in ["trial", "expired", "cancelled"]:
#         raise HTTPException(
#             status_code=status.HTTP_402_PAYMENT_REQUIRED,
#             detail={
#                 "error": "UPGRADE_REQUIRED",
#                 "message": "Upgrade your subscription to access this feature",
#                 "subscription_status": subscription_status,
#             },
#         )

#     return token_payload
from typing import Dict, Any
from fastapi import Depends, HTTPException, status

def require_active_subscription(
    token_payload: Dict[str, Any] = Depends(subscription_guard)
):
    if token_payload.get("is_super_admin"):
        return token_payload

    subscription_status = (token_payload.get("subscription_status") or "trial").lower()

    if subscription_status in ["trial", "expired", "cancelled"]:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "UPGRADE_REQUIRED",
                "message": "Upgrade your subscription to access this feature",
                "subscription_status": subscription_status
            }
        )

    return token_payload
# ==================== RBAC GUARD MIDDLEWARE ====================

async def check_permission(
    user_id: str,
    module: str,
    action: str,
    db
) -> bool:
    """
    Check if user has permission for module.action
    Returns: True if allowed, False otherwise
    """
    try:
        # Get user's role
        user = await db.enterprise_users.find_one({"user_id": user_id}, {"_id": 0})
        if not user:
            return False
        
        # Super admin has all permissions
        if user.get("is_super_admin"):
            return True
        
        role_id = user.get("role_id")
        if not role_id:
            return False
        
        # Find the submodule
        submodule_name = f"{module}.{action}"
        submodule = await db.submodules.find_one(
            {"submodule_name": submodule_name},
            {"_id": 0}
        )
        if not submodule:
            logger.warning(f"Submodule not found: {submodule_name}")
            return False
        
        # Check if role has permission
        permission = await db.role_permissions.find_one(
            {
                "role_id": role_id,
                "submodule_id": submodule["submodule_id"],
                "granted": True
            },
            {"_id": 0}
        )
        
        return permission is not None
        
    except Exception as e:
        logger.error(f"Permission check error: {e}")
        return False

def require_permission(module: str, action: str):
    """
    Dependency factory for permission-based route protection
    Usage: @router.get("/customers", dependencies=[Depends(require_permission("customers", "view"))])
    """
    async def permission_checker(
        token_payload: Dict[str, Any] = Depends(subscription_guard),
        db = Depends(get_db)
    ):
        user_id = token_payload.get("user_id")
        
        # Super admin bypass
        if token_payload.get("is_super_admin"):
            return token_payload
        
        has_permission = await check_permission(user_id, module, action, db)
        
        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: {module}.{action}"
            )
        
        return token_payload
    
    return permission_checker

# ==================== ORG SCOPE HELPER ====================

def get_org_scope(token_payload: Dict[str, Any] = Depends(subscription_guard)) -> Optional[str]:
    """
    Get org_id for scoping queries
    Use this in route handlers to scope data by organization
    """
    if token_payload.get("is_super_admin"):
        return None  # Super admin sees all orgs
    return token_payload.get("org_id")
