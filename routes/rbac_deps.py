"""
RBAC Role-Based Dependency Helpers
===================================
Lightweight FastAPI dependencies for role-based route protection.

Role hierarchy (high → low):
  owner (4) > admin (3) > manager (2) > member (1) > viewer (0)

Usage:
    from routes.rbac_deps import require_role

    @router.delete("/resource/{id}", dependencies=[Depends(require_role(["admin", "owner"]))])
    async def delete_resource(...):
        ...

    # Or inline as a param:
    @router.post("/resource")
    async def create_resource(current_user: WorkspaceUser = Depends(require_role(["member", "admin", "owner"]))):
        ...
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import os
import logging

logger = logging.getLogger(__name__)

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "placeholder_secret")
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Normalized role hierarchy for comparison
ROLE_HIERARCHY: dict[str, int] = {
    "owner": 4,
    "admin": 3,
    "manager": 2,
    "member": 1,
    "viewer": 0,
}


def _rank(role: str) -> int:
    """Return numeric rank for a role name (case-insensitive). Unknown roles rank 0."""
    return ROLE_HIERARCHY.get((role or "").strip().lower(), 0)


def _decode_role_from_token(token: str) -> str:
    """
    Decode JWT and return the role_id.
    Normalizes to lowercase.
    """
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return (payload.get("role_id") or "member").strip().lower()
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT decode error in rbac_deps: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def _decode_payload_from_token(token: str) -> dict:
    """
    Decode JWT and return the full payload dict.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.PyJWTError as e:
        logger.warning(f"JWT decode error in rbac_deps: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def require_role(allowed_roles: list[str]):
    """
    Dependency factory — require that the caller has one of the specified roles.

    The check is HIERARCHICAL: if the caller's role rank >= lowest allowed rank,
    access is granted.  owner always passes.

    Args:
        allowed_roles: list of role strings, e.g. ["admin", "owner"]

    Raises:
        HTTP 401 if token is missing/invalid
        HTTP 403 if role is insufficient

    Returns:
        The decoded JWT payload dict (for downstream use if needed)
    """
    min_rank = min(_rank(r) for r in allowed_roles)

    async def _checker(
        credentials: HTTPAuthorizationCredentials = Depends(security),
    ) -> dict:
        token = credentials.credentials
        payload = _decode_payload_from_token(token)

        # super_admin always passes
        if payload.get("is_super_admin"):
            return payload

        role = (payload.get("role_id") or "member").strip().lower()
        caller_rank = _rank(role)

        if caller_rank < min_rank:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Insufficient permissions. "
                    f"This action requires role '{' or '.join(allowed_roles)}', "
                    f"but your role is '{role}'."
                ),
            )

        return payload

    return _checker


def require_min_role(min_role: str):
    """
    Convenience wrapper — require caller's role rank >= min_role rank.

    Example:
        require_min_role("manager")  # allows manager, admin, owner
    """
    return require_role([min_role])
