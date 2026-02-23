from pydantic import BaseModel, EmailStr, Field, ConfigDict, field_validator
from typing import Optional, Dict, List
from datetime import datetime, timezone
import uuid
import re

# ==================== MASTER DATA MODELS ====================

class CountryMaster(BaseModel):
    code: str
    name: str
    dial_code: str
    currency_code: str

class IndustryMaster(BaseModel):
    code: str
    name: str

class CompanySizeMaster(BaseModel):
    code: str
    name: str

class BusinessTypeMaster(BaseModel):
    code: str
    name: str

class UserRoleMaster(BaseModel):
    code: str
    name: str

class LanguageMaster(BaseModel):
    code: str
    name: str

class TimeZoneMaster(BaseModel):
    code: str
    name: str
    offset: str

# ==================== USER & TENANT MODELS ====================

class User(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: EmailStr
    mobile: str
    mobile_country_code: str
    full_name: str
    password_hash: str
    role: str
    status: str = "active"  # active, inactive, suspended
    email_verified: bool = False
    mobile_verified: bool = False
    email_verified_at: Optional[datetime] = None
    mobile_verified_at: Optional[datetime] = None
    last_login: Optional[datetime] = None
    failed_login_attempts: int = 0
    account_locked_until: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # SSO fields
    google_id: Optional[str] = None
    microsoft_id: Optional[str] = None
    apple_id: Optional[str] = None

class Tenant(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    company_name: str
    business_type: str
    industry: str
    company_size: str
    country: str
    website: Optional[str] = None
    registered_address: Optional[str] = None
    operating_address: Optional[str] = None
    address_same_as_registered: bool = True
    timezone: str
    language: str
    referral_code: Optional[str] = None
    
    # Solution & Insights configuration
    solutions_enabled: Dict[str, bool] = {
        "commerce": True,
        "workforce": False,
        "capital": True,
        "operations": False,
        "finance": True  # Always true, locked
    }
    insights_enabled: bool = True
    
    status: str = "active"  # active, inactive, suspended
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserTenantMapping(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    tenant_id: str
    role: str  # owner, admin, member
    permissions: List[str] = []
    is_primary: bool = False
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserSession(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    user_id: str
    tenant_id: Optional[str] = None
    session_token: str
    refresh_token: Optional[str] = None
    device_info: Optional[str] = None
    ip_address: Optional[str] = None
    expires_at: datetime
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== VERIFICATION MODELS ====================

class EmailVerification(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    email: EmailStr
    verification_code: str
    expires_at: datetime
    attempts: int = 0
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class MobileVerification(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), alias="_id")
    mobile: str
    mobile_country_code: str
    otp_code: str
    expires_at: datetime
    attempts: int = 0
    verified: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

# ==================== REQUEST/RESPONSE MODELS ====================

class SignupStep1Request(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    password: str = Field(..., min_length=8)
    mobile: str = Field(..., pattern=r'^\d{10,15}$')
    mobile_country_code: str
    role: str
    company_name: str = Field(..., min_length=2, max_length=200)
    industry: str
    company_size: str
    referral_code: Optional[str] = None
    agree_terms: bool
    agree_privacy: bool
    marketing_opt_in: bool = False
    
    @field_validator('password')
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Za-z]', v):
            raise ValueError('Password must contain at least one letter')
        if not re.search(r'\d', v):
            raise ValueError('Password must contain at least one number')
        return v
    
    @field_validator('agree_terms', 'agree_privacy')
    @classmethod
    def validate_agreements(cls, v):
        if not v:
            raise ValueError('You must agree to Terms and Privacy Policy')
        return v

class SignupStep2Request(BaseModel):
    email: EmailStr
    country: str
    business_type: str
    website: Optional[str] = None
    registered_address: Optional[str] = None
    operating_address: Optional[str] = None
    address_same_as_registered: bool = True
    timezone: str
    language: str

class SignupStep3Request(BaseModel):
    email: EmailStr
    solutions: Dict[str, bool] = {
        "commerce": True,
        "workforce": False,
        "capital": True,
        "operations": False,
        "finance": True
    }
    insights_enabled: bool = True

class VerifyEmailRequest(BaseModel):
    email: EmailStr
    verification_code: str

class VerifyMobileRequest(BaseModel):
    email: EmailStr
    otp_code: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class TenantSelectionRequest(BaseModel):
    tenant_id: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    reset_code: str
    new_password: str = Field(..., min_length=8)

class LoginResponse(BaseModel):
    success: bool
    message: str
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[Dict] = None
    tenants: Optional[List[Dict]] = None
    requires_tenant_selection: bool = False

class SignupResponse(BaseModel):
    success: bool
    message: str
    step: str
    data: Optional[Dict] = None

class AcceptInviteRequest(BaseModel):
    invite_token: str
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
