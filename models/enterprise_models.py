"""
Enterprise SaaS Models - Multi-tenant Architecture
Database schema for organizations, users, roles, permissions, subscriptions
"""
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from uuid import uuid4

# ==================== ORGANIZATION MODELS ====================

class Organization(BaseModel):
    """Tenant/Organization entity"""
    model_config = ConfigDict(extra="ignore")
    
    org_id: str = Field(default_factory=lambda: str(uuid4()))
    org_name: str
    org_slug: str
    subscription_status: str = "trial"  # trial/active/expired/cancelled
    subscription_id: Optional[str] = None  # Razorpay subscription ID
    razorpay_customer_id: Optional[str] = None
    is_demo: bool = True
    trial_ends_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class OrganizationCreate(BaseModel):
    """Create organization request"""
    org_name: str
    admin_email: EmailStr
    admin_full_name: str
    admin_password: str

# ==================== USER MODELS ====================

class EnterpriseUser(BaseModel):
    """User entity in enterprise system"""
    model_config = ConfigDict(extra="ignore")
    
    user_id: str = Field(default_factory=lambda: str(uuid4()))
    org_id: Optional[str] = None  # null for super admin
    email: EmailStr
    password_hash: str
    full_name: str
    role_id: Optional[str] = None
    is_super_admin: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserCreate(BaseModel):
    """Create user request"""
    email: EmailStr
    password: str
    full_name: str
    role_id: str

class UserInvite(BaseModel):
    """Invite user to organization"""
    email: EmailStr
    full_name: str
    role_id: str

# ==================== ROLE & PERMISSION MODELS ====================

class Role(BaseModel):
    """Role entity"""
    model_config = ConfigDict(extra="ignore")
    
    role_id: str = Field(default_factory=lambda: str(uuid4()))
    org_id: Optional[str] = None  # null for system roles
    role_name: str
    is_system_role: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RoleCreate(BaseModel):
    """Create role request"""
    role_name: str

class Module(BaseModel):
    """Module entity (commerce, finance, workforce, etc.)"""
    model_config = ConfigDict(extra="ignore")
    
    module_id: str = Field(default_factory=lambda: str(uuid4()))
    module_name: str  # e.g., "commerce", "finance"
    display_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class Submodule(BaseModel):
    """Submodule/Action entity"""
    model_config = ConfigDict(extra="ignore")
    
    submodule_id: str = Field(default_factory=lambda: str(uuid4()))
    module_id: str
    submodule_name: str  # e.g., "customers.view", "customers.create"
    action_type: str  # view/create/edit/delete
    display_name: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class RolePermission(BaseModel):
    """Permission mapping for role-submodule"""
    model_config = ConfigDict(extra="ignore")
    
    permission_id: str = Field(default_factory=lambda: str(uuid4()))
    role_id: str
    submodule_id: str
    granted: bool = True
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class PermissionAssign(BaseModel):
    """Assign permissions to role"""
    role_id: str
    submodule_ids: List[str]

# ==================== SUBSCRIPTION MODELS ====================

class Subscription(BaseModel):
    """Subscription entity"""
    model_config = ConfigDict(extra="ignore")
    
    subscription_id: str = Field(default_factory=lambda: str(uuid4()))
    org_id: str
    razorpay_subscription_id: Optional[str] = None
    plan_id: str
    status: str  # trial/active/expired/cancelled
    current_start: Optional[datetime] = None
    current_end: Optional[datetime] = None
    next_billing_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class SubscriptionCreate(BaseModel):
    """Create subscription"""
    org_id: str
    plan_id: str

# ==================== AUTH MODELS ====================

class EnterpriseLogin(BaseModel):
    """Login request"""
    email: EmailStr
    password: str

class EnterpriseLoginResponse(BaseModel):
    """Login response"""
    success: bool
    message: str
    access_token: Optional[str] = None
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional[Dict[str, Any]] = None
    organization: Optional[Dict[str, Any]] = None

class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str

class TokenPayload(BaseModel):
    """JWT Token payload structure"""
    user_id: str
    org_id: Optional[str] = None
    role_id: Optional[str] = None
    subscription_status: str
    is_super_admin: bool = False
    exp: datetime

# ==================== RAZORPAY WEBHOOK MODELS ====================

class RazorpayWebhook(BaseModel):
    """Razorpay webhook payload"""
    entity: str
    account_id: str
    event: str
    contains: List[str]
    payload: Dict[str, Any]
    created_at: int
