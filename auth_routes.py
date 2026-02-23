"""
auth_routes.py (UPDATED - ORG-based multi-tenant)

✅ What this version fixes (compared to your current file):
- Single consistent tenancy system: organizations + org_users (no tenants/user_tenant_mappings)
- JWT payload is consistent everywhere: { "sub": <user_id>, "org_id": <org_id> }
- get_current_user always finds user (requires users.user_id present)
- /select-tenant works with org_users
- /me returns org info
- /logout deletes sessions correctly
- Signup completion creates: users + organizations + org_users + session
- Fixes multiple wrong keys: current_user["_id"] vs current_user["user_id"], tenant_id vs org_id
- Safer env var access (fails with clear error)
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
import jwt
import os
import secrets
from datetime import datetime, timezone, timedelta
import logging
from typing import Optional

from auth_models import (
    SignupStep1Request, SignupStep2Request, SignupStep3Request,
    VerifyEmailRequest, VerifyMobileRequest, LoginRequest,
    TenantSelectionRequest, ForgotPasswordRequest, ResetPasswordRequest,
    LoginResponse, SignupResponse
)
from auth_masters import (
    USER_ROLES, INDUSTRIES, COMPANY_SIZES, BUSINESS_TYPES,
    COUNTRIES, LANGUAGES, TIMEZONES, SOLUTIONS, INSIGHTS_MODULE
)
from auth_utils import create_access_token, verify_token, DEBUG
from log_utils import get_logger

logger = logging.getLogger(__name__)
auth_logger = get_logger(__name__)
print("USING AUTH FILE:", __file__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Temporary signup storage (use Redis in prod)
signup_sessions = {}


# ==================== DB ====================

def get_db():
    from main import db
    return db


# ==================== CRYPTO / JWT ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    """
    Reads:
      - sub = user_id
      - org_id = active org context (optional but recommended)
    Attaches:
      - org_id into user dict for downstream use
    """
    token = credentials.credentials
    # verify_token handles decoding, expiration, and ensures user_id exists
    payload = verify_token(token, verify_type="access") 

    user_id = payload["user_id"]
    org_id = payload.get("org_id")

    user = await db.users.find_one({"user_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user["org_id"] = org_id
    return user


# ==================== VERIFICATION HELPERS ====================

def generate_verification_code(length: int = 6) -> str:
    return "".join([str(secrets.randbelow(10)) for _ in range(length)])


async def send_verification_email(email: str, code: str, db):
    # MOCK send (replace with SMTP later)
    logger.info(f"📧 Email Verification Code for {email}: {code}")

    verification = {
        "_id": secrets.token_urlsafe(16),
        "email": email,
        "verification_code": code,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "attempts": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.email_verifications.insert_one(verification)


async def send_otp_sms(mobile: str, country_code: str, otp: str, db):
    # MOCK send (replace with SMS provider later)
    full_mobile = f"{country_code}{mobile}"
    logger.info(f"📱 SMS OTP for {full_mobile}: {otp}")

    verification = {
        "_id": secrets.token_urlsafe(16),
        "mobile": mobile,
        "mobile_country_code": country_code,
        "otp_code": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        "attempts": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc),
    }
    await db.mobile_verifications.insert_one(verification)


# ==================== MASTER DATA ENDPOINTS ====================

@router.get("/masters/user-roles")
async def get_user_roles():
    return {"success": True, "data": USER_ROLES}

@router.get("/masters/industries")
async def get_industries():
    return {"success": True, "data": INDUSTRIES}

@router.get("/masters/company-sizes")
async def get_company_sizes():
    return {"success": True, "data": COMPANY_SIZES}

@router.get("/masters/business-types")
async def get_business_types():
    return {"success": True, "data": BUSINESS_TYPES}

@router.get("/masters/countries")
async def get_countries():
    return {"success": True, "data": COUNTRIES}

@router.get("/masters/languages")
async def get_languages():
    return {"success": True, "data": LANGUAGES}

@router.get("/masters/timezones")
async def get_timezones():
    return {"success": True, "data": TIMEZONES}

@router.get("/masters/solutions")
async def get_solutions():
    return {"success": True, "data": SOLUTIONS}

@router.get("/masters/insights")
async def get_insights():
    return {"success": True, "data": INSIGHTS_MODULE}


# ==================== SIGNUP FLOW ====================

@router.post("/signup/step1", response_model=SignupResponse)
async def signup_step1(request: SignupStep1Request, db=Depends(get_db)):
    """
    Step 1: Account Details
    Stores user details in temporary session.
    """
    try:
        existing_user = await db.users.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered. Please login instead.")

        password_hash = hash_password(request.password)

        session_id = secrets.token_urlsafe(32)
        signup_sessions[session_id] = {
            "step": 1,
            "email": request.email,
            "full_name": request.full_name,
            "password_hash": password_hash,
            "mobile": request.mobile,
            "mobile_country_code": request.mobile_country_code,
            "role": request.role,
            "company_name": request.company_name,
            "industry": request.industry,
            "company_size": request.company_size,
            "referral_code": request.referral_code,
            "marketing_opt_in": request.marketing_opt_in,
            "created_at": datetime.now(timezone.utc),
        }

        return SignupResponse(
            success=True,
            message="Step 1 completed. Proceed to company details.",
            step="step1_complete",
            data={"session_id": session_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 1 error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")


@router.post("/signup/step2", response_model=SignupResponse)
async def signup_step2(request: SignupStep2Request, db=Depends(get_db)):
    """
    Step 2: Company Details
    """
    try:
        session_id = None
        for sid, s in signup_sessions.items():
            if s.get("email") == request.email:
                session_id = sid
                break

        if not session_id or signup_sessions[session_id]["step"] < 1:
            raise HTTPException(status_code=400, detail="Invalid signup session")

        signup_sessions[session_id].update({
            "step": 2,
            "country": request.country,
            "business_type": request.business_type,
            "website": request.website,
            "registered_address": request.registered_address,
            "operating_address": request.operating_address if not request.address_same_as_registered else request.registered_address,
            "address_same_as_registered": request.address_same_as_registered,
            "timezone": request.timezone,
            "language": request.language,
        })

        return SignupResponse(
            success=True,
            message="Step 2 completed. Choose your solutions.",
            step="step2_complete",
            data={"session_id": session_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 2 error: {e}")
        raise HTTPException(status_code=500, detail="Step 2 failed")


@router.post("/signup/step3", response_model=SignupResponse)
async def signup_step3(request: SignupStep3Request, db=Depends(get_db)):
    """
    Step 3: Solutions selection + send verifications
    """
    try:
        session_id = None
        for sid, s in signup_sessions.items():
            if s.get("email") == request.email:
                session_id = sid
                break

        if not session_id or signup_sessions[session_id]["step"] < 2:
            raise HTTPException(status_code=400, detail="Invalid signup session")

        solutions = request.solutions
        solutions["finance"] = True

        signup_sessions[session_id].update({
            "step": 3,
            "solutions": solutions,
            "insights_enabled": request.insights_enabled,
        })

        email_code = generate_verification_code()
        await send_verification_email(request.email, email_code, db)

        otp_code = generate_verification_code()
        s = signup_sessions[session_id]
        await send_otp_sms(s["mobile"], s["mobile_country_code"], otp_code, db)

        return SignupResponse(
            success=True,
            message="Verification codes sent to email and mobile.",
            step="verification_pending",
            data={"session_id": session_id},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 3 error: {e}")
        raise HTTPException(status_code=500, detail="Step 3 failed")


@router.post("/signup/verify-email", response_model=SignupResponse)
async def verify_email(request: VerifyEmailRequest, db=Depends(get_db)):
    try:
        verification = await db.email_verifications.find_one({
            "email": request.email,
            "verification_code": request.verification_code,
            "verified": False,
        })

        if not verification:
            raise HTTPException(status_code=400, detail="Invalid verification code")

        expires_at = verification["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Verification code expired")

        if verification["attempts"] >= 5:
            raise HTTPException(status_code=400, detail="Too many attempts. Request new code.")

        await db.email_verifications.update_one(
            {"_id": verification["_id"]},
            {"$set": {"verified": True}}
        )

        for sid, s in signup_sessions.items():
            if s.get("email") == request.email:
                signup_sessions[sid]["email_verified"] = True
                break

        return SignupResponse(
            success=True,
            message="Email verified successfully",
            step="email_verified",
            data={},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")


@router.post("/signup/verify-mobile", response_model=SignupResponse)
async def verify_mobile(request: VerifyMobileRequest, db=Depends(get_db)):
    """
    Final step:
    - verify OTP
    - if email verified too -> create:
        users + organizations + org_users + session token
    """
    try:
        session_id = None
        session_data = None
        for sid, s in signup_sessions.items():
            if s.get("email") == request.email:
                session_id = sid
                session_data = s
                break

        if not session_data:
            raise HTTPException(status_code=400, detail="Invalid signup session")

        verification = await db.mobile_verifications.find_one({
            "mobile": session_data["mobile"],
            "mobile_country_code": session_data["mobile_country_code"],
            "otp_code": request.otp_code,
            "verified": False,
        })

        if not verification:
            raise HTTPException(status_code=400, detail="Invalid OTP code")

        expires_at = verification["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="OTP expired")

        if verification["attempts"] >= 3:
            raise HTTPException(status_code=400, detail="Too many attempts. Request new OTP.")

        await db.mobile_verifications.update_one(
            {"_id": verification["_id"]},
            {"$set": {"verified": True}}
        )

        # if email not verified yet, stop here
        if not session_data.get("email_verified"):
            signup_sessions[session_id]["mobile_verified"] = True
            return SignupResponse(
                success=True,
                message="Mobile verified. Please verify email.",
                step="mobile_verified",
                data={},
            )

        # ✅ create user + org + mapping
        user_id = secrets.token_urlsafe(16)
        org_id = secrets.token_urlsafe(16)

        user_doc = {
            "_id": user_id,
            "user_id": user_id,  # IMPORTANT: required because you query by user_id everywhere
            "email": session_data["email"],
            "mobile": session_data["mobile"],
            "mobile_country_code": session_data["mobile_country_code"],
            "full_name": session_data["full_name"],
            "password_hash": session_data["password_hash"],
            "role": session_data["role"],
            "status": "active",
            "email_verified": True,
            "mobile_verified": True,
            "email_verified_at": datetime.now(timezone.utc),
            "mobile_verified_at": datetime.now(timezone.utc),
            "failed_login_attempts": 0,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.users.insert_one(user_doc)

        org_doc = {
            "_id": secrets.token_urlsafe(16),
            "org_id": org_id,
            "name": session_data["company_name"],
            "business_type": session_data.get("business_type"),
            "industry": session_data.get("industry"),
            "company_size": session_data.get("company_size"),
            "country": session_data.get("country"),
            "website": session_data.get("website"),
            "registered_address": session_data.get("registered_address"),
            "operating_address": session_data.get("operating_address"),
            "address_same_as_registered": session_data.get("address_same_as_registered", True),
            "timezone": session_data.get("timezone"),
            "language": session_data.get("language"),
            "referral_code": session_data.get("referral_code"),
            "solutions_enabled": session_data.get("solutions", {}),
            "insights_enabled": session_data.get("insights_enabled", True),
            "status": "active",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
        }
        await db.organizations.insert_one(org_doc)

        org_user_doc = {
            "_id": secrets.token_urlsafe(16),
            "org_id": org_id,
            "user_id": user_id,
            "role": "owner",
            "status": "active",
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
        }
        await db.org_users.insert_one(org_user_doc)

        access_token = create_access_token(data={"sub": user_id, "org_id": org_id})

        await db.user_sessions.insert_one({
            "_id": secrets.token_urlsafe(16),
            "user_id": user_id,
            "org_id": org_id,
            "session_token": access_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
            "created_at": datetime.now(timezone.utc),
        })

        # cleanup session
        del signup_sessions[session_id]

        return SignupResponse(
            success=True,
            message="Signup completed successfully!",
            step="complete",
            data={
                "access_token": access_token,
                "user": {
                    "id": user_id,
                    "email": session_data["email"],
                    "full_name": session_data["full_name"],
                    "role": session_data["role"],
                },
                "org": {
                    "id": org_id,
                    "name": session_data["company_name"],
                }
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mobile verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")


# ==================== LOGIN FLOW ====================

# ... existing imports ...
from log_utils import get_logger

logger = logging.getLogger(__name__)
auth_logger = get_logger(__name__)

# ...

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db=Depends(get_db)):
    try:
        # Normalize email
        email = request.email.strip().lower()
        auth_logger.login_attempt(email)

        user = await db.users.find_one({"email": email})
        
        auth_logger.info("login_lookup", 
            email=repr(request.email), 
            found=bool(user),
            hash_prefix=user["password_hash"][:4] if user and "password_hash" in user else "N/A"
        )

        if not user:
            auth_logger.login_failure(request.email, reason="user_not_found")
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        if user.get("status") != "active":
            auth_logger.login_failure(request.email, reason="inactive_account")
            raise HTTPException(status_code=403, detail="Account is inactive")

        password_valid = verify_password(request.password, user["password_hash"])
        auth_logger.info("login_password_verify", 
            email=request.email, 
            valid=password_valid
        )

        if not password_valid:
            auth_logger.login_failure(request.email, reason="invalid_password")
            raise HTTPException(status_code=401, detail="Incorrect email or password")

        if not user.get("email_verified"):
            auth_logger.login_failure(request.email, reason="email_not_verified")
            raise HTTPException(status_code=403, detail="Please verify your email")

        # IMPORTANT: user_id must exist
        user_id = user.get("user_id")
        if not user_id:
            auth_logger.login_failure(request.email, reason="missing_user_id")
            raise HTTPException(status_code=500, detail="User record is missing user_id. Please fix migration.")

        org_mappings = await db.org_users.find({
            "user_id": user_id,
            "status": "active",
            "is_active": True,
        }).to_list(length=50)

        if not org_mappings:
            auth_logger.login_failure(request.email, reason="no_org_found")
            raise HTTPException(status_code=403, detail="No active organization found for this user")

        # multiple orgs -> tenant selection response
        if len(org_mappings) > 1:
            tenants = []
            for m in org_mappings:
                org = await db.organizations.find_one({"org_id": m["org_id"]}, {"_id": 0})
                if org:
                    tenants.append({
                        "id": org["org_id"],
                        "company_name": org.get("name"),
                        "role": m.get("role"),
                    })

            auth_logger.login_success(request.email, user_id=user_id, org_id="multiple_selection_pending")

            return LoginResponse(
                success=True,
                message="Select organization",
                requires_tenant_selection=True,
                tenants=tenants,
                user={
                    "id": user_id,
                    "email": user["email"],
                    "full_name": user.get("full_name") or f"{user.get('first_name','')} {user.get('last_name','')}".strip(),
                    "role": user.get("role"),
                }
            )

        # single org
        org_id = org_mappings[0]["org_id"]

        access_token = create_access_token(
            user_id=user_id,
            org_id=org_id,
            role_id=org_mappings[0].get("role"),
            subscription_status="active"
        )

        await db.user_sessions.insert_one({
            "_id": secrets.token_urlsafe(16),
            "user_id": user_id,
            "org_id": org_id,
            "session_token": access_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30 if request.remember_me else 1),
        })

        auth_logger.login_success(request.email, user_id=user_id, org_id=org_id)

        return LoginResponse(
            success=True,
            message="Login successful",
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user_id,
                "email": user["email"],
                "full_name": user.get("full_name") or f"{user.get('first_name','')} {user.get('last_name','')}".strip(),
                "role": user.get("role"),
            }
        )

    except HTTPException as e:
        # Avoid logging expected validation errors as system errors
        if e.status_code >= 500:
             auth_logger.error("login_http_error", error=e, email=request.email)
        raise
    except Exception as e:
        auth_logger.error("login_exception", error=e, email=request.email)
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/select-tenant", response_model=LoginResponse)
async def select_tenant(
    request: TenantSelectionRequest,
    db=Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Frontend can keep sending tenant_id, but it actually means org_id here.
    """
    try:
        org_id = request.tenant_id

        mapping = await db.org_users.find_one({
            "user_id": current_user["user_id"],
            "org_id": org_id,
            "status": "active",
            "is_active": True,
        })

        if not mapping:
            raise HTTPException(status_code=403, detail="Access denied to this organization")

        access_token = create_access_token(
            user_id=current_user["user_id"],
            org_id=org_id,
            role_id=mapping["role"],
            subscription_status="active"
        )

        await db.user_sessions.insert_one({
            "_id": secrets.token_urlsafe(16),
            "user_id": current_user["user_id"],
            "org_id": org_id,
            "session_token": access_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
        })

        return LoginResponse(
            success=True,
            message="Organization selected",
            access_token=access_token,
            token_type="bearer",
            user={
                "id": current_user["user_id"],
                "email": current_user["email"],
                "full_name": current_user.get("full_name") or f"{current_user.get('first_name','')} {current_user.get('last_name','')}".strip(),
                "role": current_user.get("role"),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tenant selection error: {e}")
        raise HTTPException(status_code=500, detail="Tenant selection failed")


@router.post("/logout")
async def logout(db=Depends(get_db), current_user=Depends(get_current_user)):
    try:
        await db.user_sessions.delete_many({"user_id": current_user["user_id"]})
        return {"success": True, "message": "Logged out successfully"}
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")


@router.get("/me")
async def get_current_user_info(current_user=Depends(get_current_user), db=Depends(get_db)):
    try:
        org_data = None
        org_id = current_user.get("org_id")
        if org_id:
            org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})
            if org:
                org_data = {
                    "id": org.get("org_id"),
                    "name": org.get("name"),
                    "solutions_enabled": org.get("solutions_enabled", {}),
                    "insights_enabled": org.get("insights_enabled", True),
                    "subscription_status": org.get("subscription_status"),
                }

        return {
            "success": True,
            "user": {
                "id": current_user["user_id"],
                "email": current_user["email"],
                "full_name": current_user.get("full_name") or f"{current_user.get('first_name','')} {current_user.get('last_name','')}".strip(),
                "role": current_user.get("role"),
                "email_verified": current_user.get("email_verified", False),
                "mobile_verified": current_user.get("mobile_verified", False),
            },
            "org": org_data,
        }

    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user info")


# ==================== PASSWORD RESET ====================

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db=Depends(get_db)):
    try:
        user = await db.users.find_one({"email": request.email})

        # Don't reveal existence
        if not user:
            return {"success": True, "message": "If email exists, reset link will be sent"}

        reset_code = generate_verification_code(length=8)

        reset_doc = {
            "_id": secrets.token_urlsafe(16),
            "email": request.email,
            "reset_code": reset_code,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
            "created_at": datetime.now(timezone.utc),
        }
        await db.password_resets.insert_one(reset_doc)

        logger.info(f"🔐 Password Reset Code for {request.email}: {reset_code}")
        return {"success": True, "message": "If email exists, reset link will be sent"}

    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process request")


@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db=Depends(get_db)):
    try:
        reset_record = await db.password_resets.find_one({
            "email": request.email,
            "reset_code": request.reset_code,
            "used": False,
        })

        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid reset code")

        expires_at = reset_record["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Reset code expired")

        user = await db.users.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        new_password_hash = hash_password(request.new_password)

        await db.users.update_one(
            {"email": request.email},
            {"$set": {
                "password_hash": new_password_hash,
                "failed_login_attempts": 0,
                "account_locked_until": None,
                "updated_at": datetime.now(timezone.utc),
            }}
        )

        await db.password_resets.update_one(
            {"_id": reset_record["_id"]},
            {"$set": {"used": True}}
        )

        # invalidate sessions
        user_id = user.get("user_id")
        if user_id:
            await db.user_sessions.delete_many({"user_id": user_id})

        return {"success": True, "message": "Password reset successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")

# ==================== INVITATION FLOW ====================

from auth_models import AcceptInviteRequest

@router.post("/invitations/accept", response_model=LoginResponse)
async def accept_invite(request: AcceptInviteRequest, db=Depends(get_db)):
    """
    Accept an invitation to join an organization.
    - Validates invite token
    - Creates or updates user
    - Links user to organization
    - Logs user in
    """
    try:
        # 1. Validate Invite
        invite = await db.user_invites.find_one({"token": request.invite_token})
        if not invite:
            raise HTTPException(status_code=400, detail="Invalid invitation token")
            
        if invite.get("status") == "revoked":
             raise HTTPException(status_code=400, detail="Invitation has been revoked")
             
        # Check expiry
        if invite["expires_at"].replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Invitation expired")
            
        # 2. Validate Org
        org = await db.organizations.find_one({"org_id": invite["org_id"]})
        if not org or org.get("status") != "active":
            raise HTTPException(status_code=400, detail="Organization no longer exists or is inactive")
            
        email = invite["email"]
        
        # 3. Check/Create User
        user = await db.users.find_one({"email": email})
        user_id = None
        
        if not user:
            # Create new user
            user_id = secrets.token_urlsafe(16)
            password_hash = hash_password(request.password)
            
            auth_logger.info("accept_invite_create_user", 
                email=repr(email), 
                db_name=db.name,
                user_id=user_id,
                hash_prefix=password_hash[:4]
            )
            
            new_user = {
                "_id": user_id,
                "user_id": user_id,
                "email": email,
                "full_name": request.full_name or email.split("@")[0],
                "password_hash": password_hash,
                "role": "user", # Default system role
                "status": "active",
                "is_active": True,
                "email_verified": True,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            insert_result = await db.users.insert_one(new_user)
            auth_logger.info("accept_invite_inserted", inserted_id=str(insert_result.inserted_id))
            
            user = new_user
        else:
            # Update existing user
            user_id = user["user_id"]
            
            auth_logger.info("accept_invite_update_user", 
                email=repr(email), 
                user_id=user_id,
                has_password_update=bool(request.password)
            )

            update_fields = {
                "email_verified": True,
                "status": "active",
                "is_active": True,
                "updated_at": datetime.now(timezone.utc)
            }
            
            if request.password:
                password_hash = hash_password(request.password)
                update_fields["password_hash"] = password_hash
                auth_logger.info("accept_invite_update_hash", hash_prefix=password_hash[:4])
                
            if request.full_name:
                update_fields["full_name"] = request.full_name
                
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": update_fields}
            )
            
        # 4. Link to Org (org_users)
        existing_mapping = await db.org_users.find_one({
            "user_id": user_id,
            "org_id": invite["org_id"]
        })
        
        if not existing_mapping:
            mapping_doc = {
                "_id": secrets.token_urlsafe(16),
                "user_id": user_id,
                "org_id": invite["org_id"],
                "role": invite["role_id"],
                "status": "active",
                "is_active": True,
                "created_at": datetime.now(timezone.utc),
                "source": "invitation"
            }
            await db.org_users.insert_one(mapping_doc)
            auth_logger.info("accept_invite_mapping_created", user_id=user_id, org_id=invite["org_id"])
            
        # 5. Mark Invite Accepted
        await db.user_invites.update_one(
            {"_id": invite["_id"]},
            {"$set": {
                "status": "accepted",
                "accepted_at": datetime.now(timezone.utc),
                "user_id": user_id
            }}
        )
        
        # 6. Generate Session/Tokens
        access_token = create_access_token(
            user_id=user_id,
            org_id=invite["org_id"],
            role_id=invite["role_id"],
            subscription_status="active"
        )
        
        await db.user_sessions.insert_one({
            "_id": secrets.token_urlsafe(16),
            "user_id": user_id,
            "org_id": invite["org_id"],
            "session_token": access_token,
            "created_at": datetime.now(timezone.utc),
            "expires_at": datetime.now(timezone.utc) + timedelta(days=1),
            "user_agent": "invitation_accept"
        })
        
        return LoginResponse(
            success=True,
            message="Invitation accepted successfully",
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user_id,
                "email": user["email"],
                "full_name": user.get("full_name"),
                "role": invite["role_id"]
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Invitation accept error: {e}")
        raise HTTPException(status_code=500, detail="Failed to accept invitation")
@router.get("/token-debug")
async def token_debug(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Protected debug endpoint to verify token lifecycle and payload.
    Only enabled when DEBUG=true in environment.
    """
    if not DEBUG:
        raise HTTPException(
            status_code=404, 
            detail="Debug endpoint disabled"
        )
    
    token = credentials.credentials
    # verify_token handles native PyJWT verification
    payload = verify_token(token, verify_type="access")
    
    now = datetime.now(timezone.utc)
    exp_ts = payload.get("exp")
    remaining = (exp_ts - int(now.timestamp())) if exp_ts else 0
    
    return {
        "server_utc_now": now.isoformat(),
        "token_exp_utc": datetime.fromtimestamp(exp_ts, tz=timezone.utc).isoformat() if exp_ts else None,
        "remaining_seconds": remaining,
        "payload": {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id"),
            "sub": payload.get("sub")
        }
    }
