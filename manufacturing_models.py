"""
Manufacturing Lead Module - Pydantic Models
Global Manufacturing-Ready Lead Management System
Supports: Automotive, Aerospace, Industrial Machinery, Metals, Electronics, Chemicals, Pharma, Food, Textile, etc.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from enum import Enum
import uuid


# ============================================================================
# ENUMS
# ============================================================================

class LeadStatus(str, Enum):
    NEW = "New"
    INTAKE = "Intake"
    FEASIBILITY_CHECK = "Feasibility Check"
    COSTING = "Costing"
    APPROVAL_PENDING = "Approval Pending"
    APPROVED = "Approved"
    CONVERTED = "Converted"
    LOST = "Lost"
    ON_HOLD = "On Hold"


class LeadPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"


class WorkflowStage(str, Enum):
    INTAKE = "Intake"
    FEASIBILITY = "Feasibility"
    COSTING = "Costing"
    APPROVAL = "Approval"
    CONVERT = "Convert"


class FeasibilityStatus(str, Enum):
    NOT_STARTED = "Not Started"
    IN_PROGRESS = "In Progress"
    FEASIBLE = "Feasible"
    NOT_FEASIBLE = "Not Feasible"
    CONDITIONAL = "Conditional"


class ApprovalStatus(str, Enum):
    NOT_SUBMITTED = "Not Submitted"
    PENDING = "Pending"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    ESCALATED = "Escalated"


class ApprovalType(str, Enum):
    TECHNICAL = "Technical"
    PRODUCTION = "Production"
    QC = "QC"
    PRICING = "Pricing"
    CREDIT = "Credit"
    MANAGEMENT = "Management"
    COMPLIANCE = "Compliance"


class UserRole(str, Enum):
    SALES_REP = "Sales Rep"
    SALES_MANAGER = "Sales Manager"
    ENGINEERING_LEAD = "Engineering Lead"
    PRODUCTION_MANAGER = "Production Manager"
    QC_MANAGER = "QC Manager"
    PRICING_MANAGER = "Pricing Manager"
    FINANCE_HEAD = "Finance Head"
    ADMIN = "Admin"


class IndustryType(str, Enum):
    AUTOMOTIVE = "Automotive"
    AEROSPACE = "Aerospace"
    INDUSTRIAL_MACHINERY = "Industrial Machinery"
    METALS_FORGING = "Metals & Forging"
    ELECTRONICS_PCB = "Electronics & PCB"
    PLASTICS = "Plastics & Injection Molding"
    CHEMICALS = "Chemicals & Paints"
    PHARMA = "Pharma"
    FOOD = "Food & Beverage"
    PACKAGING = "Packaging & Printing"
    TEXTILE = "Textile"
    CONTRACT_MFG = "Contract Manufacturing"


# ============================================================================
# MASTER DATA MODELS
# ============================================================================

class CustomerMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_code: str
    customer_name: str
    industry: IndustryType
    region: str
    country: str
    credit_rating: Optional[str] = "B"  # A, B, C, D
    credit_limit: Optional[float] = 0.0
    gstin: Optional[str] = None
    pan: Optional[str] = None
    contact_person: str
    contact_email: str
    contact_phone: str
    billing_address: Optional[str] = None
    shipping_address: Optional[str] = None
    payment_terms: Optional[str] = "Net 30"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProductFamilyMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    family_code: str
    family_name: str
    category: str  # Castings, Forgings, Machined Parts, Assemblies, etc.
    industry_type: IndustryType
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SKUMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku_code: str
    sku_name: str
    product_family_id: str
    uom: str  # Unit of Measurement
    specification: Optional[str] = None
    drawing_number: Optional[str] = None
    material_grade: Optional[str] = None
    weight_per_unit: Optional[float] = None
    standard_cost: Optional[float] = None
    standard_price: Optional[float] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class BOMMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    bom_id: str
    sku_id: str
    version: str = "1.0"
    components: List[Dict[str, Any]]  # [{rm_id, quantity, uom, cost}]
    total_material_cost: float = 0.0
    manufacturing_cost: float = 0.0
    overhead_cost: float = 0.0
    total_cost: float = 0.0
    is_active: bool = True
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RawMaterialMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rm_code: str
    rm_name: str
    grade: str
    specification: str
    uom: str
    supplier_id: Optional[str] = None
    lead_time_days: int = 30
    standard_cost: float = 0.0
    moq: Optional[float] = None  # Minimum Order Quantity
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PlantMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_code: str
    plant_name: str
    location: str
    country: str
    capacity_units_per_month: Optional[float] = None
    capabilities: List[str] = []  # ["Casting", "Machining", "Assembly"]
    certifications: List[str] = []  # ["ISO9001", "IATF16949", "AS9100"]
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PriceListMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku_id: str
    customer_id: Optional[str] = None  # If customer-specific
    price: float
    currency: str = "INR"
    effective_from: date
    effective_to: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UOMMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    uom_code: str  # KG, MT, PC, SET, etc.
    uom_name: str
    category: str  # Weight, Length, Quantity
    conversion_to_base: float = 1.0
    base_uom: str  # The base unit for this category
    is_active: bool = True


class CurrencyMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    currency_code: str  # INR, USD, EUR
    currency_name: str
    symbol: str
    conversion_to_inr: float = 1.0
    is_active: bool = True
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaxMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tax_code: str
    tax_name: str  # GST, IGST, VAT, Customs Duty
    tax_rate: float  # Percentage
    applicability: str  # Domestic, Export, Import
    country: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# LEAD DATA MODELS
# ============================================================================

class TechnicalSpecification(BaseModel):
    material_grade: Optional[str] = None
    tolerances: Optional[str] = None  # e.g., "±0.05mm"
    surface_finish: Optional[str] = None  # e.g., "Ra 1.6"
    coating: Optional[str] = None  # e.g., "Zinc Plating"
    machining_type: Optional[str] = None  # e.g., "CNC Turning"
    hardness: Optional[str] = None  # e.g., "HRC 45-50"
    heat_treatment: Optional[str] = None
    certifications_required: List[str] = []  # ["ROHS", "ISO9001", "MSDS"]
    msds_required: bool = False
    drawing_files: List[str] = []  # URLs or file paths


class CommercialData(BaseModel):
    expected_price_per_unit: Optional[float] = None
    expected_total_value: Optional[float] = None
    currency: str = "INR"
    payment_terms: Optional[str] = "Net 30"
    incoterms: Optional[str] = "EXW"
    discount_expectation: Optional[float] = 0.0
    tax_category: Optional[str] = None


class FeasibilityCheck(BaseModel):
    engineering_feasible: Optional[bool] = None
    engineering_notes: Optional[str] = None
    engineering_checked_by: Optional[str] = None
    engineering_checked_at: Optional[datetime] = None
    
    production_feasible: Optional[bool] = None
    production_notes: Optional[str] = None
    production_plant_id: Optional[str] = None
    production_checked_by: Optional[str] = None
    production_checked_at: Optional[datetime] = None
    
    qc_feasible: Optional[bool] = None
    qc_notes: Optional[str] = None
    qc_checked_by: Optional[str] = None
    qc_checked_at: Optional[datetime] = None
    
    rm_feasible: Optional[bool] = None
    rm_notes: Optional[str] = None
    rm_lead_time: Optional[int] = None  # days
    
    overall_status: FeasibilityStatus = FeasibilityStatus.NOT_STARTED


class CostingData(BaseModel):
    bom_id: Optional[str] = None
    material_cost: Optional[float] = 0.0
    labor_cost: Optional[float] = 0.0
    overhead_cost: Optional[float] = 0.0
    tooling_cost: Optional[float] = 0.0
    total_cost_per_unit: Optional[float] = 0.0
    margin_percentage: Optional[float] = 0.0
    quoted_price: Optional[float] = 0.0
    calculated_at: Optional[datetime] = None
    calculated_by: Optional[str] = None


class ApprovalRecord(BaseModel):
    approval_type: ApprovalType
    status: ApprovalStatus = ApprovalStatus.NOT_SUBMITTED
    approver_role: str
    approver_id: Optional[str] = None
    approver_name: Optional[str] = None
    submitted_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None


class AuditLog(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    user_name: str
    action: str  # "created", "updated", "stage_changed", "approved", etc.
    field_changed: Optional[str] = None
    old_value: Optional[Any] = None
    new_value: Optional[Any] = None
    notes: Optional[str] = None


class ManufacturingLead(BaseModel):
    # Header
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str  # MFGL-2025-0001
    rfq_number: Optional[str] = None  # Customer's RFQ number
    
    # Status & Priority
    status: LeadStatus = LeadStatus.NEW
    priority: LeadPriority = LeadPriority.MEDIUM
    lead_score: Optional[int] = 0  # 0-100
    current_stage: WorkflowStage = WorkflowStage.INTAKE
    
    # Customer
    customer_id: str
    customer_name: str
    customer_industry: IndustryType
    contact_person: str
    contact_email: str
    contact_phone: str
    
    # Product Requirement
    product_family_id: Optional[str] = None
    sku_id: Optional[str] = None  # If existing SKU
    product_description: str
    quantity: float
    uom: str
    delivery_date_required: date
    application: Optional[str] = None  # End-use application
    
    # Technical Specifications
    technical_specs: Optional[TechnicalSpecification] = None
    
    # Attachments
    attachments: List[Dict[str, str]] = []  # [{type, name, url}]
    
    # BOM & Engineering
    bom_id: Optional[str] = None
    bom_version: Optional[str] = None
    tooling_required: bool = False
    tooling_available: bool = False
    
    # Commercial
    commercial_data: Optional[CommercialData] = None
    
    # Sample/Prototype
    sample_required: bool = False
    sample_quantity: Optional[int] = None
    sample_lead_time: Optional[int] = None  # days
    sample_cost_estimate: Optional[float] = None
    
    # Feasibility
    feasibility: Optional[FeasibilityCheck] = None
    
    # Costing
    costing: Optional[CostingData] = None
    
    # Approvals
    approvals: List[ApprovalRecord] = []
    approval_status: ApprovalStatus = ApprovalStatus.NOT_SUBMITTED
    
    # Assignment
    assigned_to: Optional[str] = None
    assigned_to_name: Optional[str] = None
    assigned_to_role: Optional[UserRole] = None
    
    # Risk
    risk_level: Optional[str] = "Low"  # Low, Medium, High
    risk_notes: Optional[str] = None
    
    # Loss Tracking
    is_lost: bool = False
    lost_reason: Optional[str] = None
    lost_date: Optional[datetime] = None
    
    # Conversion
    is_converted: bool = False
    converted_to_evaluation_id: Optional[str] = None
    converted_at: Optional[datetime] = None
    
    # Audit
    audit_logs: List[AuditLog] = []
    
    # Timestamps
    created_by: str
    created_by_name: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        use_enum_values = True


class ManufacturingLeadCreate(BaseModel):
    """Model for creating a new manufacturing lead"""
    rfq_number: Optional[str] = None
    priority: LeadPriority = LeadPriority.MEDIUM
    
    # Customer
    customer_id: str
    contact_person: str
    contact_email: str
    contact_phone: str
    
    # Product Requirement
    product_family_id: Optional[str] = None
    sku_id: Optional[str] = None
    product_description: str
    quantity: float
    uom: str
    delivery_date_required: str  # ISO date string
    application: Optional[str] = None
    
    # Technical Specifications (optional at creation)
    material_grade: Optional[str] = None
    tolerances: Optional[str] = None
    surface_finish: Optional[str] = None
    coating: Optional[str] = None
    certifications_required: List[str] = []
    
    # Commercial (optional at creation)
    expected_price_per_unit: Optional[float] = None
    currency: str = "INR"
    payment_terms: Optional[str] = "Net 30"
    
    # Sample
    sample_required: bool = False
    sample_quantity: Optional[int] = None
    
    class Config:
        use_enum_values = True


class ManufacturingLeadUpdate(BaseModel):
    """Model for updating a manufacturing lead"""
    rfq_number: Optional[str] = None
    priority: Optional[LeadPriority] = None
    status: Optional[LeadStatus] = None
    
    # Customer updates
    contact_person: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    
    # Product updates
    product_description: Optional[str] = None
    quantity: Optional[float] = None
    uom: Optional[str] = None
    delivery_date_required: Optional[str] = None
    application: Optional[str] = None
    
    # Technical updates
    material_grade: Optional[str] = None
    tolerances: Optional[str] = None
    surface_finish: Optional[str] = None
    coating: Optional[str] = None
    certifications_required: Optional[List[str]] = None
    
    # Commercial updates
    expected_price_per_unit: Optional[float] = None
    payment_terms: Optional[str] = None
    
    # Assignment
    assigned_to: Optional[str] = None
    
    # Risk
    risk_level: Optional[str] = None
    risk_notes: Optional[str] = None
    
    class Config:
        use_enum_values = True


# ============================================================================
# RBAC MODELS
# ============================================================================

class Permission(BaseModel):
    """Individual permission"""
    code: str  # lead:create, lead:view, lead:approve:pricing
    name: str
    description: str
    module: str = "manufacturing"


class RolePermissions(BaseModel):
    """Role with assigned permissions"""
    role: UserRole
    role_name: str
    permissions: List[str]  # List of permission codes
    description: str
    can_approve: List[ApprovalType] = []
    approval_threshold: Optional[float] = None  # Financial threshold
    
    class Config:
        use_enum_values = True


# ============================================================================
# WORKFLOW MODELS
# ============================================================================

class WorkflowTransition(BaseModel):
    """Workflow stage transition"""
    lead_id: str
    from_stage: WorkflowStage
    to_stage: WorkflowStage
    transitioned_by: str
    transitioned_by_name: str
    notes: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        use_enum_values = True
