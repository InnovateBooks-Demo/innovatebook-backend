"""
IB Commerce - Parties Module Data Models
Universal Party Entity with specialized types
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

# ==================== ENUMS ====================

class PartyCategory(str, Enum):
    CUSTOMER = "customer"
    VENDOR = "vendor"
    PARTNER = "partner"
    CHANNEL = "channel"

class PartyStatus(str, Enum):
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    DORMANT = "dormant"
    BLOCKED = "blocked"

class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class ContactMode(str, Enum):
    EMAIL = "email"
    PHONE = "phone"
    BOTH = "both"

class AddressType(str, Enum):
    REGISTERED = "registered"
    BILLING = "billing"
    SHIPPING = "shipping"
    OPERATIONAL = "operational"

# ==================== SUB-MODELS ====================

class Contact(BaseModel):
    """Embedded contact within a party"""
    name: str
    role: Optional[str] = None
    department: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    preferred_mode: ContactMode = ContactMode.EMAIL
    is_primary: bool = False
    is_active: bool = True

class Location(BaseModel):
    """Embedded location within a party"""
    address_type: AddressType
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: str
    postal_code: Optional[str] = None
    tax_zone: Optional[str] = None
    is_active: bool = True

# ==================== BASE PARTY MODEL ====================

class PartyBase(BaseModel):
    """Universal Party Entity - Base for all party types"""
    # Core Identity
    display_name: str
    legal_name: str
    party_category: PartyCategory
    party_sub_type: Optional[str] = None
    country_of_registration: str
    operating_countries: List[str] = []
    industry_classification: Optional[str] = None
    status: PartyStatus = PartyStatus.ACTIVE
    
    # Commercial Classification
    primary_role: str
    secondary_roles: List[str] = []
    engagement_types: List[str] = []
    default_channel: Optional[str] = None
    
    # Ownership & Responsibility
    commercial_owner: Optional[str] = None
    backup_owner: Optional[str] = None
    business_unit: Optional[str] = None
    region: Optional[str] = None
    escalation_owner: Optional[str] = None
    
    # Risk & Sensitivity
    risk_level: RiskLevel = RiskLevel.LOW
    dependency_level: Optional[str] = None
    exclusivity_indicator: bool = False
    concentration_indicator: bool = False
    geo_risk_flag: bool = False
    internal_risk_notes: Optional[str] = None
    
    # Embedded Collections
    contacts: List[Contact] = []
    locations: List[Location] = []
    
    # Metadata
    tags: List[str] = []
    custom_fields: Dict[str, Any] = {}

class PartyCreate(PartyBase):
    """Model for creating a new party"""
    pass

class Party(PartyBase):
    """Complete party model with system fields"""
    party_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None
    last_reviewed_on: Optional[datetime] = None
    review_frequency: Optional[str] = None
    approval_state: Optional[str] = None

# ==================== CUSTOMER-SPECIFIC ====================

class CustomerCreate(PartyBase):
    """Customer-specific creation model"""
    customer_type: str  # B2B, B2C, B2G, Export
    segment: Optional[str] = None  # Enterprise, SMB, Individual
    size_band: Optional[str] = None
    typical_deal_size_band: Optional[str] = None
    preferred_engagement_type: Optional[str] = None
    buying_cycle_length: Optional[str] = None
    decision_complexity: Optional[str] = None
    discount_eligibility_flag: bool = True
    deal_approval_overrides: bool = False
    contract_mandatory_flag: bool = False
    prepayment_expectation_flag: bool = False

class Customer(CustomerCreate):
    """Complete customer model"""
    party_id: str
    customer_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None

# ==================== VENDOR-SPECIFIC ====================

class VendorCreate(PartyBase):
    """Vendor-specific creation model"""
    vendor_type: str  # Material, Service, Creator, SaaS, Logistics
    capability_categories: List[str] = []
    vendor_status: str = "preferred"  # Preferred, Approved, Restricted
    rate_type: Optional[str] = None  # Hourly, Fixed, Milestone
    capacity_indicator: Optional[str] = None
    typical_lead_time: Optional[str] = None
    geo_availability: List[str] = []
    single_source_flag: bool = False
    critical_vendor_flag: bool = False
    substitution_difficulty: Optional[str] = None
    compliance_dependency_notes: Optional[str] = None

class Vendor(VendorCreate):
    """Complete vendor model"""
    party_id: str
    vendor_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None

# ==================== PARTNER-SPECIFIC ====================

class PartnerCreate(PartyBase):
    """Partner-specific creation model"""
    partner_type: str  # Reseller, Affiliate, Franchise, Strategic Alliance, Distributor, Agent, Technology, Referral
    territory_coverage: List[str] = []
    industry_focus: List[str] = []
    
    # Commercial Terms
    commission_rate: Optional[float] = None
    payment_terms: Optional[str] = None
    contract_end_date: Optional[str] = None
    currency: Optional[str] = None
    
    # Partner Rules
    revenue_share_logic: Optional[str] = None
    referral_logic: Optional[str] = None
    lead_ownership_rules: Optional[str] = None
    conflict_rules: Optional[str] = None
    
    # Contact overrides (for simpler forms)
    addresses: Optional[List[Dict[str, Any]]] = None

class Partner(PartnerCreate):
    """Complete partner model"""
    party_id: str
    partner_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None

# ==================== CHANNEL ====================

class ChannelCreate(BaseModel):
    """Channel creation model"""
    channel_name: str
    channel_type: str  # Direct Sales, Online, Retail, Distributor, Agent, Marketplace, Wholesale
    channel_code: Optional[str] = None
    channel_owner: Optional[str] = None
    geography: List[str] = []
    region: Optional[str] = None
    currency: Optional[str] = None
    
    # Manager Info
    manager_name: Optional[str] = None
    manager_email: Optional[str] = None
    manager_phone: Optional[str] = None
    
    # Performance
    revenue_target: Optional[float] = None
    commission_rate: Optional[float] = None
    active_partners: Optional[int] = None
    
    # Channel Rules
    allowed_party_types: List[str] = []
    allowed_profiles: List[str] = []
    discount_rules: Optional[str] = None
    conflict_rules: Optional[str] = None
    
    status: PartyStatus = PartyStatus.ACTIVE
    description: Optional[str] = None

class Channel(ChannelCreate):
    """Complete channel model"""
    channel_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None

# ==================== PROFILE ====================

class ProfileCreate(BaseModel):
    """Profile creation model - Reusable commercial terms"""
    profile_name: str
    profile_type: str  # Customer, Vendor, Partner, Channel, Premium, Standard, Enterprise
    profile_code: Optional[str] = None
    applicable_regions: List[str] = []
    applicable_industries: List[str] = []
    
    # Commercial Terms (Business-friendly names)
    payment_terms: Optional[str] = None  # Net 30, Net 60, Immediate, etc.
    credit_limit: Optional[float] = None
    default_discount: Optional[float] = None
    max_discount: Optional[float] = None
    min_order_value: Optional[float] = None
    
    # Legacy field names (kept for backward compatibility)
    pricing_basis: Optional[str] = None
    discount_ceiling: Optional[float] = None
    rate_cards: Optional[str] = None
    sla_expectations: Optional[str] = None
    delivery_assumptions: Optional[str] = None
    
    # Settings
    approval_required: bool = False
    auto_apply_discount: bool = False
    allow_partial_payment: bool = True
    priority_level: Optional[str] = None  # Low, Normal, High, Critical
    
    # Contractual References
    master_agreement_id: Optional[str] = None
    validity_period: Optional[str] = None
    renewal_expectation: Optional[str] = None
    
    # Risk & Control (legacy)
    approval_required_flag: bool = False
    exception_handling_rules: Optional[str] = None
    policy_references: List[str] = []
    
    status: PartyStatus = PartyStatus.ACTIVE
    description: Optional[str] = None

class Profile(ProfileCreate):
    """Complete profile model"""
    profile_id: str
    org_id: str
    created_by: str
    created_at: datetime
    last_modified_by: Optional[str] = None
    last_modified_at: Optional[datetime] = None
