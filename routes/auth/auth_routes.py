from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
import jwt
import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, List
import logging
import re

from auth_models import (
    SignupStep1Request, SignupStep2Request, SignupStep3Request,
    VerifyEmailRequest, VerifyMobileRequest, LoginRequest,
    TenantSelectionRequest, ForgotPasswordRequest, ResetPasswordRequest,
    LoginResponse, SignupResponse,
    User, Tenant, UserTenantMapping, UserSession,
    EmailVerification, MobileVerification
)
from auth_masters import (
    USER_ROLES, INDUSTRIES, COMPANY_SIZES, BUSINESS_TYPES,
    COUNTRIES, LANGUAGES, TIMEZONES, SOLUTIONS, INSIGHTS_MODULE
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT Configuration
JWT_SECRET = os.environ['JWT_SECRET_KEY']
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE = 43200  # 30 days in minutes

# Temporary storage for signup process (in production, use Redis)
signup_sessions = {}

def get_db():
    """Get database instance from environment"""
    from server import db
    return db

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return encoded_jwt

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db = Depends(get_db)
):
    """Dependency to get current authenticated user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.users.find_one({"_id": user_id})
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

def generate_verification_code(length: int = 6) -> str:
    """Generate random verification code"""
    return ''.join([str(secrets.randbelow(10)) for _ in range(length)])

def generate_magic_link() -> str:
    """Generate secure magic link token"""
    return secrets.token_urlsafe(32)

async def send_verification_email(email: str, code: str, db):
    """Send email verification code (mock for now)"""
    logger.info(f"📧 Email Verification Code for {email}: {code}")
    print(f"\n{'='*60}")
    print(f"📧 EMAIL VERIFICATION")
    print(f"To: {email}")
    print(f"Code: {code}")
    print(f"Expires: 10 minutes")
    print(f"{'='*60}\n")
    
    # Store in database
    verification = {
        "_id": secrets.token_urlsafe(16),
        "email": email,
        "verification_code": code,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=10),
        "attempts": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.email_verifications.insert_one(verification)

async def send_otp_sms(mobile: str, country_code: str, otp: str, db):
    """Send OTP via SMS (mock for now)"""
    full_mobile = f"{country_code}{mobile}"
    logger.info(f"📱 SMS OTP for {full_mobile}: {otp}")
    print(f"\n{'='*60}")
    print(f"📱 SMS OTP")
    print(f"To: {full_mobile}")
    print(f"OTP: {otp}")
    print(f"Expires: 5 minutes")
    print(f"{'='*60}\n")
    
    # Store in database
    verification = {
        "_id": secrets.token_urlsafe(16),
        "mobile": mobile,
        "mobile_country_code": country_code,
        "otp_code": otp,
        "expires_at": datetime.now(timezone.utc) + timedelta(minutes=5),
        "attempts": 0,
        "verified": False,
        "created_at": datetime.now(timezone.utc)
    }
    await db.mobile_verifications.insert_one(verification)

# ==================== MASTER DATA ENDPOINTS ====================

@router.get("/masters/user-roles")
async def get_user_roles():
    """Get user role master data"""
    return {"success": True, "data": USER_ROLES}

@router.get("/masters/industries")
async def get_industries():
    """Get industry master data"""
    return {"success": True, "data": INDUSTRIES}

@router.get("/masters/company-sizes")
async def get_company_sizes():
    """Get company size master data"""
    return {"success": True, "data": COMPANY_SIZES}

@router.get("/masters/business-types")
async def get_business_types():
    """Get business type master data"""
    return {"success": True, "data": BUSINESS_TYPES}

@router.get("/masters/countries")
async def get_countries():
    """Get country master data"""
    return {"success": True, "data": COUNTRIES}

@router.get("/masters/languages")
async def get_languages():
    """Get language master data"""
    return {"success": True, "data": LANGUAGES}

@router.get("/masters/timezones")
async def get_timezones():
    """Get timezone master data"""
    return {"success": True, "data": TIMEZONES}

@router.get("/masters/solutions")
async def get_solutions():
    """Get solutions master data"""
    return {"success": True, "data": SOLUTIONS}

@router.get("/masters/insights")
async def get_insights():
    """Get insights module data"""
    return {"success": True, "data": INSIGHTS_MODULE}

# ==================== SIGNUP FLOW ====================

@router.post("/signup/step1", response_model=SignupResponse)
async def signup_step1(request: SignupStep1Request, db = Depends(get_db)):
    """
    Step 1: Account Details
    - Collect user information
    - Validate email uniqueness
    - Hash password
    - Store in temporary session
    """
    try:
        # Check if email already exists
        existing_user = await db.users.find_one({"email": request.email})
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email already registered. Please login instead."
            )
        
        # Hash password
        password_hash = hash_password(request.password)
        
        # Store in signup session (temporary)
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
            "created_at": datetime.now(timezone.utc)
        }
        
        return SignupResponse(
            success=True,
            message="Step 1 completed. Proceed to company details.",
            step="step1_complete",
            data={"session_id": session_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 1 error: {e}")
        raise HTTPException(status_code=500, detail="Signup failed")

@router.post("/signup/step2", response_model=SignupResponse)
async def signup_step2(request: SignupStep2Request, db = Depends(get_db)):
    """
    Step 2: Company Details
    - Collect company information
    - Update signup session
    """
    try:
        # Find signup session by email
        session_id = None
        for sid, session in signup_sessions.items():
            if session.get("email") == request.email:
                session_id = sid
                break
        
        if not session_id or signup_sessions[session_id]["step"] < 1:
            raise HTTPException(status_code=400, detail="Invalid signup session")
        
        # Update session
        signup_sessions[session_id].update({
            "step": 2,
            "country": request.country,
            "business_type": request.business_type,
            "website": request.website,
            "registered_address": request.registered_address,
            "operating_address": request.operating_address if not request.address_same_as_registered else request.registered_address,
            "address_same_as_registered": request.address_same_as_registered,
            "timezone": request.timezone,
            "language": request.language
        })
        
        return SignupResponse(
            success=True,
            message="Step 2 completed. Choose your solutions.",
            step="step2_complete",
            data={"session_id": session_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 2 error: {e}")
        raise HTTPException(status_code=500, detail="Step 2 failed")

@router.post("/signup/step3", response_model=SignupResponse)
async def signup_step3(request: SignupStep3Request, db = Depends(get_db)):
    """
    Step 3: Solutions & Insights Selection
    - Select which solutions to enable
    - Enable/disable insights
    - Trigger verification emails/OTP
    """
    try:
        # Find signup session
        session_id = None
        for sid, session in signup_sessions.items():
            if session.get("email") == request.email:
                session_id = sid
                break
        
        if not session_id or signup_sessions[session_id]["step"] < 2:
            raise HTTPException(status_code=400, detail="Invalid signup session")
        
        # Ensure Finance is always enabled
        solutions = request.solutions
        solutions["finance"] = True
        
        # Update session
        signup_sessions[session_id].update({
            "step": 3,
            "solutions": solutions,
            "insights_enabled": request.insights_enabled
        })
        
        # Send verification email
        email_code = generate_verification_code()
        await send_verification_email(request.email, email_code, db)
        
        # Send OTP SMS
        otp_code = generate_verification_code()
        session_data = signup_sessions[session_id]
        await send_otp_sms(
            session_data["mobile"],
            session_data["mobile_country_code"],
            otp_code,
            db
        )
        
        return SignupResponse(
            success=True,
            message="Verification codes sent to email and mobile.",
            step="verification_pending",
            data={"session_id": session_id}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Signup Step 3 error: {e}")
        raise HTTPException(status_code=500, detail="Step 3 failed")

@router.post("/signup/verify-email", response_model=SignupResponse)
async def verify_email(request: VerifyEmailRequest, db = Depends(get_db)):
    """Verify email with code"""
    try:
        # Find verification record
        verification = await db.email_verifications.find_one({
            "email": request.email,
            "verification_code": request.verification_code,
            "verified": False
        })
        
        if not verification:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        # Check expiration
        expires_at = verification["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Verification code expired")
        
        # Check attempts
        if verification["attempts"] >= 5:
            raise HTTPException(status_code=400, detail="Too many attempts. Request new code.")
        
        # Mark as verified
        await db.email_verifications.update_one(
            {"_id": verification["_id"]},
            {"$set": {"verified": True}}
        )
        
        # Update signup session
        for session_id, session in signup_sessions.items():
            if session.get("email") == request.email:
                signup_sessions[session_id]["email_verified"] = True
                break
        
        return SignupResponse(
            success=True,
            message="Email verified successfully",
            step="email_verified",
            data={}
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")

@router.post("/signup/verify-mobile", response_model=SignupResponse)
async def verify_mobile(request: VerifyMobileRequest, db = Depends(get_db)):
    """Verify mobile with OTP"""
    try:
        # Find signup session
        session_data = None
        session_id = None
        for sid, session in signup_sessions.items():
            if session.get("email") == request.email:
                session_data = session
                session_id = sid
                break
        
        if not session_data:
            raise HTTPException(status_code=400, detail="Invalid signup session")
        
        # Find verification record
        verification = await db.mobile_verifications.find_one({
            "mobile": session_data["mobile"],
            "mobile_country_code": session_data["mobile_country_code"],
            "otp_code": request.otp_code,
            "verified": False
        })
        
        if not verification:
            raise HTTPException(status_code=400, detail="Invalid OTP code")
        
        # Check expiration
        expires_at = verification["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="OTP expired")
        
        # Check attempts
        if verification["attempts"] >= 3:
            raise HTTPException(status_code=400, detail="Too many attempts. Request new OTP.")
        
        # Mark as verified
        await db.mobile_verifications.update_one(
            {"_id": verification["_id"]},
            {"$set": {"verified": True}}
        )
        
        # Check if email is also verified
        if not session_data.get("email_verified"):
            signup_sessions[session_id]["mobile_verified"] = True
            return SignupResponse(
                success=True,
                message="Mobile verified. Please verify email.",
                step="mobile_verified",
                data={}
            )
        
        # Both verified - Create user and tenant
        user_id = str(secrets.token_urlsafe(16))
        tenant_id = str(secrets.token_urlsafe(16))
        
        # Create User
        user_doc = {
            "_id": user_id,
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
            "updated_at": datetime.now(timezone.utc)
        }
        await db.users.insert_one(user_doc)
        
        # Create Tenant
        tenant_doc = {
            "_id": tenant_id,
            "company_name": session_data["company_name"],
            "business_type": session_data["business_type"],
            "industry": session_data["industry"],
            "company_size": session_data["company_size"],
            "country": session_data["country"],
            "website": session_data.get("website"),
            "registered_address": session_data.get("registered_address"),
            "operating_address": session_data.get("operating_address"),
            "address_same_as_registered": session_data.get("address_same_as_registered", True),
            "timezone": session_data["timezone"],
            "language": session_data["language"],
            "referral_code": session_data.get("referral_code"),
            "solutions_enabled": session_data["solutions"],
            "insights_enabled": session_data["insights_enabled"],
            "status": "active",
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        await db.tenants.insert_one(tenant_doc)
        
        # Create User-Tenant Mapping (Owner)
        mapping_doc = {
            "_id": str(secrets.token_urlsafe(16)),
            "user_id": user_id,
            "tenant_id": tenant_id,
            "role": "owner",
            "permissions": ["*"],  # Full access
            "is_primary": True,
            "status": "active",
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_tenant_mappings.insert_one(mapping_doc)
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user_id, "tenant_id": tenant_id}
        )
        
        # Clean up signup session
        del signup_sessions[session_id]
        
        # Create session in DB
        session_doc = {
            "_id": str(secrets.token_urlsafe(16)),
            "user_id": user_id,
            "tenant_id": tenant_id,
            "session_token": access_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session_doc)
        
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
                    "role": session_data["role"]
                },
                "tenant": {
                    "id": tenant_id,
                    "company_name": session_data["company_name"]
                }
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Mobile verification error: {e}")
        raise HTTPException(status_code=500, detail="Verification failed")

# ==================== LOGIN FLOW ====================

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest, db = Depends(get_db)):
    """
    Login endpoint with email and password
    - Validate credentials
    - Check account status
    - Handle multi-tenancy
    - Return token
    """
    try:
        logger.info(f"🔐 Login attempt for email: {request.email}")
        logger.info(f"🔐 Remember me: {request.remember_me}")
        
        # FIRST: Check if this is an enterprise user (new multi-tenant system)
        enterprise_user = await db.enterprise_users.find_one({"email": request.email}, {"_id": 0})
        
        if enterprise_user:
            logger.info(f"🔐 Enterprise user detected: {request.email}")
            
            # Super admins must use the dedicated portal
            if enterprise_user.get("is_super_admin"):
                logger.info(f"🔐 Super admin detected, redirecting to enterprise auth")
                raise HTTPException(
                    status_code=403,
                    detail="Super admin accounts must use the Super Admin Portal at /super-admin/login"
                )
            
            # This is a regular enterprise user (e.g., new org admin)
            # Verify password
            password_valid = verify_password(request.password, enterprise_user["password_hash"])
            logger.info(f"🔐 Enterprise password verification: {password_valid}")
            
            if not password_valid:
                logger.warning(f"🔐 Invalid password for enterprise user: {request.email}")
                raise HTTPException(
                    status_code=401,
                    detail="Incorrect email or password"
                )
            
            # Check if user is active
            if not enterprise_user.get("is_active", True):
                raise HTTPException(
                    status_code=403,
                    detail="Account is inactive. Contact administrator."
                )
            
            # # Get organization
            # org = await db.organizations.find_one(
            #     {"org_id": enterprise_user["org_id"]},
            #     {"_id": 0}
            # )
            
            # if not org:
            #     raise HTTPException(
            #         status_code=403,
            #         detail="Organization not found"
            #     )
            
              # Get organization
            org = await db.organizations.find_one(
                {"org_id": enterprise_user["org_id"]},
                {"_id": 0}
            )
            
            if not org:
                raise HTTPException(
                    status_code=403,
                    detail="Organization not found"
                )



            # Import enterprise token generation
            from enterprise_auth_service import create_access_token as create_enterprise_token
            
            # Create enterprise access token with proper org_id
            access_token = create_enterprise_token(
                user_id=enterprise_user["user_id"],
                org_id=enterprise_user["org_id"],
                role_id=enterprise_user.get("role_id"),
                subscription_status=org.get("subscription_status", "trial"),
                is_super_admin=False
            )
            
            logger.info(f"✅ Enterprise login successful for: {request.email}, org: {enterprise_user['org_id']}")
            
            # Return with enterprise token
            return LoginResponse(
                success=True,
                message="Login successful",
                access_token=access_token,
                token_type="bearer",
                user={
                    "id": enterprise_user["user_id"],
                    "email": enterprise_user["email"],
                    "full_name": enterprise_user["full_name"],
                    "role": enterprise_user.get("role_id")
                }
            )
        
        # FALLBACK: Try legacy users collection for backward compatibility
        user = await db.users.find_one({"email": request.email})
        logger.info(f"🔐 Legacy user found: {bool(user)}")
        
        if not user:
            logger.warning(f"🔐 User not found for email: {request.email}")
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Check if account is locked
        if user.get("account_locked_until"):
            if datetime.now(timezone.utc) < user["account_locked_until"]:
                raise HTTPException(
                    status_code=403,
                    detail="Account is locked. Please try again later."
                )
        
        # Check if account is active
        if user.get("status") != "active":
            raise HTTPException(
                status_code=403,
                detail="Account is inactive. Contact support."
            )
        
        # Verify password
        password_valid = verify_password(request.password, user["password_hash"])
        logger.info(f"🔐 Password verification: {password_valid}")
        
        if not password_valid:
            logger.warning(f"🔐 Password verification failed for: {request.email}")
            # Increment failed attempts
            failed_attempts = user.get("failed_login_attempts", 0) + 1
            update_data = {"failed_login_attempts": failed_attempts}
            
            # Lock account after 5 failed attempts
            if failed_attempts >= 5:
                update_data["account_locked_until"] = datetime.now(timezone.utc) + timedelta(minutes=15)
            
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": update_data}
            )
            
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Check if email is verified
        if not user.get("email_verified"):
            raise HTTPException(
                status_code=403,
                detail="Please verify your email before logging in."
            )
        
        # Reset failed attempts and update last login
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "failed_login_attempts": 0,
                "last_login": datetime.now(timezone.utc),
                "account_locked_until": None
            }}
        )
        
        # Get user's tenants
        # mappings = await db.user_tenant_mappings.find(
        #     {"user_id": user["_id"], "status": "active"}
        # ).to_list(length=None)
        
        # if not mappings:
        #     raise HTTPException(
        #         status_code=403,
        #         detail="No active tenant found. Contact support."
        #     )

        # 🔧 FIX: Use org_users instead of user_tenant_mappings
        mappings = await db.org_users.find(
        {
            "email": user["email"],
            "is_active": True,
            "status": "active"
        }
        ).to_list(length=10)

        if not mappings:
            raise HTTPException(
                status_code=403,
                detail="No active tenant found. Contact support."
            )

        
        # If user has multiple tenants, require tenant selection
        if len(mappings) > 1:
            tenants = []
            for mapping in mappings:
                tenant = await db.tenants.find_one({"_id": mapping["tenant_id"]})
                if tenant:
                    tenants.append({
                        "id": tenant["_id"],
                        "company_name": tenant["company_name"],
                        "role": mapping["role"]
                    })
            
            return LoginResponse(
                success=True,
                message="Select tenant to continue",
                requires_tenant_selection=True,
                tenants=tenants,
                user={
                    "id": user["_id"],
                    "email": user["email"],
                    "full_name": user["full_name"],
                    "role": user["role"]
                }
            )
        
        # Single tenant - auto login
        # tenant_id = mappings[0]["tenant_id"]
        tenant_id = mappings[0]["org_id"]

        
        # Create access token
        access_token = create_access_token(
            # data={"sub": user["_id"], "tenant_id": tenant_id}
            data={"sub": str(user["_id"]), "org_id": tenant_id}

        )
        
        # Create session
        session_doc = {
            "_id": str(secrets.token_urlsafe(16)),
            "user_id": user["_id"],
            "tenant_id": tenant_id,
            "session_token": access_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30 if request.remember_me else 1),
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session_doc)
        
        return LoginResponse(
            success=True,
            message="Login successful",
            access_token=access_token,
            token_type="bearer",
            user={
                "id": user["_id"],
                "email": user["email"],
                "full_name": user["full_name"],
                "role": user["role"]
            }
        )
        
    except HTTPException as he:
        logger.warning(f"🔐 Login HTTPException: {he.detail}")
        raise
    except Exception as e:
        logger.error(f"🔐 Login unexpected error: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.post("/select-tenant", response_model=LoginResponse)
async def select_tenant(request: TenantSelectionRequest, db = Depends(get_db), current_user = Depends(get_current_user)):
    """Select tenant for multi-tenant users"""
    try:
        # Verify user has access to this tenant
        mapping = await db.user_tenant_mappings.find_one({
            "user_id": current_user["_id"],
            "tenant_id": request.tenant_id,
            "status": "active"
        })
        
        if not mapping:
            raise HTTPException(status_code=403, detail="Access denied to this tenant")
        
        # Create access token with tenant
        access_token = create_access_token(
            data={"sub": current_user["_id"], "tenant_id": request.tenant_id}
        )
        
        # Create session
        session_doc = {
            "_id": str(secrets.token_urlsafe(16)),
            "user_id": current_user["_id"],
            "tenant_id": request.tenant_id,
            "session_token": access_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=30),
            "created_at": datetime.now(timezone.utc)
        }
        await db.user_sessions.insert_one(session_doc)
        
        return LoginResponse(
            success=True,
            message="Tenant selected",
            access_token=access_token,
            token_type="bearer",
            user={
                "id": current_user["_id"],
                "email": current_user["email"],
                "full_name": current_user["full_name"],
                "role": current_user["role"]
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Tenant selection error: {e}")
        raise HTTPException(status_code=500, detail="Tenant selection failed")

@router.post("/logout")
async def logout(db = Depends(get_db), current_user = Depends(get_current_user)):
    """Logout and invalidate session"""
    try:
        # Delete all sessions for this user
        await db.user_sessions.delete_many({"user_id": current_user["_id"]})
        
        return {"success": True, "message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(status_code=500, detail="Logout failed")

@router.get("/me")
async def get_current_user_info(current_user = Depends(get_current_user), db = Depends(get_db)):
    """Get current user information"""
    try:
        # Get tenant info if available
        tenant_data = None
        if current_user.get("tenant_id"):
            tenant = await db.tenants.find_one({"_id": current_user["tenant_id"]})
            if tenant:
                tenant_data = {
                    "id": tenant["_id"],
                    "company_name": tenant["company_name"],
                    "solutions_enabled": tenant.get("solutions_enabled", {}),
                    "insights_enabled": tenant.get("insights_enabled", True)
                }
        
        return {
            "success": True,
            "user": {
                "id": current_user["_id"],
                "email": current_user["email"],
                "full_name": current_user["full_name"],
                "role": current_user["role"],
                "email_verified": current_user.get("email_verified", False),
                "mobile_verified": current_user.get("mobile_verified", False)
            },
            "tenant": tenant_data
        }
        
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user info")

# ==================== PASSWORD RESET ====================

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest, db = Depends(get_db)):
    """Send password reset link"""
    try:
        user = await db.users.find_one({"email": request.email})
        
        # Don't reveal if email exists
        if not user:
            return {"success": True, "message": "If email exists, reset link will be sent"}
        
        # Generate reset code
        reset_code = generate_verification_code(length=8)
        
        # Store reset code
        reset_doc = {
            "_id": str(secrets.token_urlsafe(16)),
            "email": request.email,
            "reset_code": reset_code,
            "expires_at": datetime.now(timezone.utc) + timedelta(hours=1),
            "used": False,
            "created_at": datetime.now(timezone.utc)
        }
        await db.password_resets.insert_one(reset_doc)
        
        # Mock send email
        logger.info(f"🔐 Password Reset Code for {request.email}: {reset_code}")
        print(f"\n{'='*60}")
        print(f"🔐 PASSWORD RESET")
        print(f"To: {request.email}")
        print(f"Reset Code: {reset_code}")
        print(f"Expires: 1 hour")
        print(f"{'='*60}\n")
        
        return {"success": True, "message": "If email exists, reset link will be sent"}
        
    except Exception as e:
        logger.error(f"Forgot password error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process request")

@router.post("/reset-password")
async def reset_password(request: ResetPasswordRequest, db = Depends(get_db)):
    """Reset password with code"""
    try:
        # Find reset record
        reset_record = await db.password_resets.find_one({
            "email": request.email,
            "reset_code": request.reset_code,
            "used": False
        })
        
        if not reset_record:
            raise HTTPException(status_code=400, detail="Invalid reset code")
        
        # Check expiration
        expires_at = reset_record["expires_at"]
        if isinstance(expires_at, datetime) and expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if datetime.now(timezone.utc) > expires_at:
            raise HTTPException(status_code=400, detail="Reset code expired")
        
        # Find user
        user = await db.users.find_one({"email": request.email})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update password
        new_password_hash = hash_password(request.new_password)
        await db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {
                "password_hash": new_password_hash,
                "failed_login_attempts": 0,
                "account_locked_until": None,
                "updated_at": datetime.now(timezone.utc)
            }}
        )
        
        # Mark reset code as used
        await db.password_resets.update_one(
            {"_id": reset_record["_id"]},
            {"$set": {"used": True}}
        )
        
        # Invalidate all sessions
        await db.user_sessions.delete_many({"user_id": user["_id"]})
        
        return {"success": True, "message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")
