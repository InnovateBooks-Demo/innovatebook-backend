"""
IB Commerce - Data Models for all 12 modules
Complete SOP-driven commercial lifecycle management
"""

from pydantic import BaseModel, Field, EmailStr, ConfigDict, field_validator
from typing import Optional, List, Dict, Any, Union
from datetime import datetime, timezone, date
from enum import Enum
import uuid


# ==================== ENUMS ====================

class LeadSource(str, Enum):
    CRM = "CRM"
    WEBSITE = "Website"
    REFERRAL = "Referral"
    PARTNER = "Partner"
    EVENT = "Event"
    CAMPAIGN = "Campaign"
    IMPORT = "Import"
    MANUAL = "Manual"
    TRADE_SHOW = "Trade Show"
    LINKEDIN = "LinkedIn"
    EMAIL = "Email"


class RiskCategory(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"


class EvaluationStatus(str, Enum):
    DRAFT = "Draft"
    IN_REVIEW = "In Review"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    DEFERRED = "Deferred"


class CommitStatus(str, Enum):
    DRAFT = "Draft"
    UNDER_REVIEW = "Under Review"
    APPROVED = "Approved"
    EXECUTED = "Executed"
    CANCELLED = "Cancelled"


class ExecutionStatus(str, Enum):
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    VERIFIED = "Verified"
    ON_HOLD = "On Hold"
    CANCELLED = "Cancelled"


class InvoiceStatus(str, Enum):
    DRAFT = "Draft"
    APPROVED = "Approved"
    ISSUED = "Issued"
    PAID = "Paid"
    DISPUTED = "Disputed"
    CANCELLED = "Cancelled"


class PaymentStatus(str, Enum):
    PENDING = "Pending"
    PARTIAL = "Partial"
    PAID = "Paid"
    OVERDUE = "Overdue"


class RequisitionStatus(str, Enum):
    DRAFT = "Draft"
    IN_REVIEW = "In Review"
    APPROVED = "Approved"
    PO_CREATED = "PO Created"
    REJECTED = "Rejected"


class POStatus(str, Enum):
    DRAFT = "Draft"
    APPROVED = "Approved"
    SENT = "Sent"
    ACKNOWLEDGED = "Acknowledged"
    RECEIVED = "Received"
    CLOSED = "Closed"


class ExpenseStatus(str, Enum):
    DRAFT = "Draft"
    SUBMITTED = "Submitted"
    APPROVED = "Approved"
    REJECTED = "Rejected"
    REIMBURSED = "Reimbursed"


class ReconcileStatus(str, Enum):
    OPEN = "Open"
    MATCHED = "Matched"
    PARTIALLY_MATCHED = "Partially Matched"
    EXCEPTION = "Exception"
    CLOSED = "Closed"


# ==================== MODULE 1: LEAD ====================

class SOPStage(str, Enum):
    INTAKE = "Lead_Intake_SOP"
    ENRICH = "Lead_Enrich_SOP"
    VALIDATE = "Lead_Validate_SOP"
    QUALIFY = "Lead_Qualify_SOP"
    ASSIGN = "Lead_Assign_SOP"
    ENGAGE = "Lead_Engage_SOP"
    REVIEW = "Lead_Review_SOP"
    CONVERT = "Lead_Convert_SOP"
    AUDIT = "Lead_Audit_SOP"


class LeadStatus(str, Enum):
    NEW = "New"
    ENRICHING = "Enriching"
    ENRICHED = "Enriched"
    VALIDATED = "Validated"
    QUALIFIED = "Qualified"
    SCORED = "Scored"
    ASSIGNED = "Assigned"
    ENGAGED = "Engaged"
    DORMANT = "Dormant"
    CONVERTED = "Converted"
    CLOSED = "Closed"


class ValidationStatus(str, Enum):
    PENDING = "Pending"
    VERIFIED = "Verified"
    VALID = "Valid"
    INVALID = "Invalid"
    WARNING = "Warning"
    FAILED = "Failed"


class LeadScoreCategory(str, Enum):
    COLD = "Cold"  # 0-50
    WARM = "Warm"  # 51-75
    HOT = "Hot"    # 76-100


class ClosureReason(str, Enum):
    NO_BUDGET = "No Budget"
    NOT_INTERESTED = "Not Interested"
    DUPLICATE = "Duplicate"
    WRONG_CONTACT = "Wrong Contact"
    TIMING_ISSUE = "Timing Issue"
    COMPETITOR_CHOSEN = "Competitor Chosen"
    OTHER = "Other"


class LeadEngagementActivity(BaseModel):
    """Individual engagement activity log"""
    activity_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    activity_type: str  # Email/Call/Meeting/Demo/Proposal
    activity_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    performed_by: str
    notes: Optional[str] = None
    outcome: Optional[str] = None


class LeadEnrichmentData(BaseModel):
    """Enrichment data from various sources"""
    company_size_verified: Optional[str] = None
    industry_verified: Optional[str] = None
    revenue_range_verified: Optional[str] = None
    employee_count_verified: Optional[int] = None
    social_media_presence: Dict[str, str] = {}  # linkedin, twitter, etc
    website_analysis: Optional[str] = None
    tech_stack: List[str] = []
    funding_status: Optional[str] = None
    enrichment_source: str = "Internal"  # Internal/API/Manual
    enrichment_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    confidence_score: float = 0.0


class LeadDuplicateCheck(BaseModel):
    """Duplicate detection result"""
    check_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    check_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_duplicate: bool = False
    duplicate_lead_ids: List[str] = []
    similarity_score: float = 0.0
    match_criteria: List[str] = []  # email/phone/tax_id/company_name
    ai_confidence: float = 0.0
    checked_by: str = "AI_Engine"


class LeadCreate(BaseModel):
    # 1. Lead Identification (required on creation)
    company_name: str
    lead_source: LeadSource
    
    # 2. Contact Person (required)
    contact_name: str
    email_address: EmailStr
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    
    # 3. Company Information
    country: str = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    website_url: Optional[str] = None
    industry_type: Optional[str] = None
    company_size: Optional[str] = None  # Small / Medium / Enterprise
    
    # 4. Business Interest (required)
    product_or_solution_interested_in: str
    estimated_deal_value: Optional[float] = None
    decision_timeline: Optional[str] = None  # 0-3 months / 3-6 months / 6+ months
    notes: Optional[str] = None
    
    # 5. Internal Tagging (optional)
    lead_campaign_name: Optional[str] = None
    tags: Optional[List[str]] = []


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # ===== STAGE 1: LEAD IDENTIFICATION =====
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lead_id: str  # Auto-generated: LD-2025-000123
    company_name: str
    lead_source: LeadSource
    captured_by: str = "system"
    captured_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    lead_status: LeadStatus = LeadStatus.NEW
    
    # ===== STAGE 2: CONTACT PERSON =====
    contact_name: str
    email_address: EmailStr
    phone_number: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    
    # ===== STAGE 3: COMPANY INFORMATION =====
    country: str = "India"
    state: Optional[str] = None
    city: Optional[str] = None
    website_url: Optional[str] = None
    industry_type: Optional[str] = None
    company_size: Optional[str] = None  # Small / Medium / Enterprise
    
    # ===== STAGE 4: BUSINESS INTEREST =====
    product_or_solution_interested_in: str
    estimated_deal_value: Optional[float] = None
    decision_timeline: Optional[str] = None  # 0-3 months / 3-6 months / 6+ months
    notes: Optional[str] = None
    
    # ===== STAGE 5: INTERNAL TAGGING =====
    lead_campaign_name: Optional[str] = None
    tags: List[str] = []
    
    # ===== FINGERPRINT (Auto-generated on save) =====
    fingerprint: Optional[str] = None  # company_name|email_domain|phone|country
    
    # ===== ENRICHMENT DATA (Stage 2: Lead_Enrich_SOP) =====
    enrichment_status: str = "Pending"  # Pending / Completed / Partial / Failed
    enrichment_data: Optional[Dict[str, Any]] = None  # Contains all enriched fields
    enrichment_last_updated: Optional[datetime] = None
    enrichment_confidence: Optional[str] = None
    enrichment_timestamp: Optional[str] = None
    enrichment_data_sources: List[str] = []
    
    # Enriched Company Fields
    legal_entity_name: Optional[str] = None
    registered_name: Optional[str] = None
    year_established: Optional[Union[str, int]] = None
    employees_count: Optional[Union[str, int]] = None
    annual_turnover: Optional[Union[str, int, float]] = None
    estimated_revenue: Optional[Union[str, int, float]] = None
    business_model: Optional[str] = None
    company_description: Optional[str] = None
    
    # Registration & Compliance
    gstin: Optional[str] = None
    pan: Optional[str] = None
    cin: Optional[str] = None
    tax_registration_number: Optional[str] = None
    verification_status: Optional[str] = None
    
    # Location Details (Enriched)
    headquarters: Optional[str] = None
    pincode: Optional[str] = None
    branch_locations: List[str] = []
    office_count: Optional[int] = None
    
    # Online & Digital Presence
    official_website: Optional[str] = None
    linkedin_page: Optional[str] = None
    twitter_url: Optional[str] = None
    facebook_url: Optional[str] = None
    instagram_url: Optional[str] = None
    domain_emails: List[str] = []
    technology_stack: List[str] = []
    
    # Financial & Organizational
    funding_stage: Optional[str] = None
    investors: List[str] = []
    ownership_type: Optional[str] = None
    
    # Operational Overview
    main_products_services: List[str] = []
    key_markets: List[str] = []
    certifications: List[str] = []
    
    # Contact Enrichment
    contact_designation: Optional[str] = None
    contact_department: Optional[str] = None
    contact_phone: Optional[str] = None
    contact_linkedin: Optional[str] = None
    seniority_level: Optional[str] = None
    decision_maker_flag: Optional[bool] = None
    last_verified_date: Optional[str] = None
    contact_source: Optional[str] = None
    
    # ===== VALIDATION (Stage 3: Lead_Validate_SOP) =====
    validation_status: ValidationStatus = ValidationStatus.PENDING
    validation_checks: Dict[str, Any] = {}  # {check_name: result} - can be bool or str
    validation_warnings: List[str] = []
    validation_date: Optional[datetime] = None
    
    # ===== SCORING (Stage 4: Lead_Qualify_SOP) =====
    lead_score: float = 0.0  # 0-100 (45% automation + 55% engagement)
    lead_score_category: Optional[LeadScoreCategory] = None  # Cold / Warm / Hot
    fit_score: float = 0.0  # 15% weight (max 15 points)
    intent_score: float = 0.0  # 15% weight (max 15 points)
    potential_score: float = 0.0  # 15% weight (max 15 points)
    engagement_score: float = 0.0  # 55% weight (max 55 points, based on activities)
    scoring_reasoning: Optional[str] = None
    scoring_date: Optional[datetime] = None
    
    # ===== ASSIGNMENT (Stage 5: Lead_Assign_SOP) =====
    assigned_to: Optional[str] = None
    assigned_date: Optional[datetime] = None
    assignment_method: Optional[str] = None  # Rule-based / Manual / AI
    follow_up_due: Optional[datetime] = None
    
    # ===== ENGAGEMENT (Stage 6: Lead_Engage_SOP) =====
    engagement_activities: List[Dict[str, Any]] = []  # Timeline of interactions
    last_engagement_date: Optional[datetime] = None
    engagement_count: int = 0
    
    # ===== REVIEW & CLEANUP (Stage 7: Lead_Review_SOP) =====
    last_activity_date: Optional[datetime] = None
    dormant_flag: bool = False
    dormant_since: Optional[datetime] = None
    closure_reason: Optional[ClosureReason] = None
    closure_notes: Optional[str] = None
    closed_date: Optional[datetime] = None
    
    # ===== CONVERSION (Stage 8: Lead_Convert_SOP) =====
    conversion_eligible: bool = False
    conversion_date: Optional[datetime] = None
    conversion_reference: Optional[str] = None  # EV-2025-00145
    converted_to_evaluate_id: Optional[str] = None
    
    # ===== AUDIT & GOVERNANCE (Stage 9: Lead_Audit_SOP) =====
    audit_trail: List[Dict[str, Any]] = []  # Every action logged
    sop_version: str = "v1.7"
    sop_stage_history: List[Dict[str, Any]] = []
    current_sop_stage: SOPStage = SOPStage.INTAKE
    sop_completion_status: Dict[str, bool] = {
        "Lead_Intake_SOP": False,
        "Lead_Enrich_SOP": False,
        "Lead_Validate_SOP": False,
        "Lead_Qualify_SOP": False,
        "Lead_Assign_SOP": False,
        "Lead_Engage_SOP": False,
        "Lead_Review_SOP": False,
        "Lead_Convert_SOP": False,
        "Lead_Audit_SOP": False
    }
    
    # ===== SYSTEM FIELDS =====
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    last_activity_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by: str = "system"
    modified_by: Optional[str] = None


# ==================== MODULE 2: EVALUATE ====================

class EvaluateCreate(BaseModel):
    linked_lead_id: str
    customer_id: str
    opportunity_name: str
    opportunity_type: str  # New/Renewal/Upsell
    expected_deal_value: float
    proposed_payment_terms: str
    expected_close_date: date
    currency: str = "INR"


class Evaluate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    evaluation_id: str  # AUTO: EVAL-2025-001
    linked_lead_id: str
    customer_id: str
    evaluation_status: EvaluationStatus = EvaluationStatus.DRAFT
    initiated_by: str
    initiated_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    sop_version: str = "v1.0"
    
    # Deal Summary
    opportunity_name: str
    opportunity_type: str
    expected_deal_value: float
    proposed_payment_terms: str
    expected_close_date: date
    currency: str = "INR"
    exchange_rate: float = 1.0
    expected_revenue_recognition_term: str = "Monthly"
    
    # Operational Feasibility
    delivery_capacity_check: str = "Pass"  # Pass/Fail
    operational_dependency: Optional[str] = None
    timeline_feasibility: Optional[int] = None  # days
    assigned_project_manager: Optional[str] = None
    ops_comments: Optional[str] = None
    
    # Cost & Margin Analysis
    estimated_cost: float = 0.0
    estimated_revenue: float = 0.0
    gross_margin_percent: float = 0.0
    margin_threshold_check: str = "Pass"
    discount_applied_percent: float = 0.0
    approval_required: bool = False
    
    # Compliance & Risk
    regulatory_flags: Optional[str] = None
    geo_risk_score: float = 0.0
    sanction_list_check: bool = False
    tax_compliance_flag: str = "Pass"
    risk_classification: RiskCategory = RiskCategory.LOW
    mitigation_plan: Optional[str] = None
    
    # Credit & Financial Viability
    credit_score_validated: float = 0.0
    proposed_credit_limit: float = 0.0
    outstanding_exposure: float = 0.0
    projected_dso: int = 30  # Days Sales Outstanding
    cashflow_impact_index: float = 0.0
    payment_risk_flag: RiskCategory = RiskCategory.LOW
    
    # Deal Scoring & Approval
    deal_score: float = 0.0  # 0-100
    deal_grade: str = "B"  # A/B/C/D
    approved_by: Optional[str] = None
    approval_comments: Optional[str] = None
    approval_date: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Output & Conversion
    proposal_id: Optional[str] = None
    evaluation_outcome: str = "Pending"  # Approved/Rejected/Deferred
    next_module_trigger: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 3: COMMIT ====================

class CommitCreate(BaseModel):
    evaluation_id: str
    customer_id: str
    commit_type: str  # Customer Contract / Vendor PO / Framework Agreement
    contract_title: str
    effective_date: date
    expiry_date: date
    contract_value: float
    payment_terms: str


class Commit(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    commit_id: str  # AUTO: COMM-2025-001
    evaluation_id: str
    customer_id: str
    commit_type: str
    commit_status: CommitStatus = CommitStatus.DRAFT
    sop_version: str = "v1.0"
    created_by: str
    created_on: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
    # Contract Metadata
    contract_number: str
    contract_title: str
    effective_date: date
    expiry_date: date
    renewal_type: Optional[str] = None  # Auto/Manual/Evergreen
    contract_value: float
    currency: str = "INR"
    governing_law: str = "India"
    signature_method: str = "Digital"
    
    # Financial Terms
    payment_terms: str
    billing_cycle: str = "Monthly"
    price_basis: str = "Fixed"
    discount_percent: float = 0.0
    tax_treatment: str = "GST"
    retention_percent: float = 0.0
    advance_percent: float = 0.0
    penalty_clause_ids: List[str] = []
    
    # Clause Registry
    clauses: List[Dict[str, Any]] = []
    
    # Approvals & Workflow
    approval_path: List[Dict[str, str]] = []
    approvers_list: List[str] = []
    approval_status: str = "Pending"
    approval_remarks: Optional[str] = None
    final_approver: Optional[str] = None
    approval_timestamp: Optional[datetime] = None
    
    # Risk & Compliance
    risk_score: float = 0.0
    control_checklist: Dict[str, bool] = {}
    deviation_flag: bool = False
    deviation_approval: Optional[str] = None
    audit_ready: bool = False
    
    # Order Details
    order_id: Optional[str] = None
    order_type: Optional[str] = None  # Sales/Purchase
    linked_project_id: Optional[str] = None
    delivery_schedule: Dict[str, Any] = {}
    order_value: float = 0.0
    
    # Version Control & Audit
    version_number: int = 1
    amendment_reason: Optional[str] = None
    parent_version: Optional[str] = None
    change_approved_by: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 4: EXECUTE ====================

class ExecuteCreate(BaseModel):
    commit_id: str
    order_id: str
    execution_type: str  # Delivery/Service/Milestone
    scheduled_date: date
    description: str


class Execute(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    execution_id: str  # AUTO: EXEC-2025-001
    commit_id: str
    order_id: str
    execution_status: str = "Scheduled"  # Scheduled/In Progress/Completed/Verified
    execution_type: str
    
    # Execution Details
    scheduled_date: Union[date, datetime, str]
    actual_completion_date: Optional[Union[date, datetime, str]] = None
    
    @field_validator('scheduled_date', 'actual_completion_date', mode='before')
    @classmethod
    def parse_date(cls, v):
        if v is None:
            return v
        if isinstance(v, datetime):
            return v.date()
        if isinstance(v, str):
            return datetime.fromisoformat(v.replace('Z', '+00:00')).date()
        return v
    description: str
    delivery_proof: Optional[str] = None
    milestone_validation: Optional[str] = None
    completion_certificate: Optional[str] = None
    
    # Work Details
    work_order_reference: Optional[str] = None
    assigned_team: Optional[str] = None
    project_link: Optional[str] = None
    
    # Approval
    approved_by: Optional[str] = None
    approval_date: Optional[datetime] = None
    customer_acceptance: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 5: BILL ====================

class BillLineItem(BaseModel):
    item_id: str
    item_description: str
    quantity: float
    rate: float
    line_amount: float
    tax_code: str
    hsn_sac_code: str


class BillCreate(BaseModel):
    linked_execution_id: str
    contract_id: str
    customer_id: str
    invoice_type: str  # Milestone/Time-based/Retainer/Advance
    items: List[BillLineItem]


class Bill(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_id: str  # AUTO: INV-2025-001
    linked_execution_id: str
    contract_id: str
    customer_id: str
    invoice_status: InvoiceStatus = InvoiceStatus.DRAFT
    invoice_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    sop_version: str = "v1.0"
    
    # Financial Details
    invoice_type: str
    currency: str = "INR"
    exchange_rate: float = 1.0
    invoice_amount: float = 0.0
    tax_amount: float = 0.0
    net_amount: float = 0.0
    discount_percent: float = 0.0
    retention_percent: float = 0.0
    payment_terms: str = "Net 30"
    due_date: date
    
    # Item & Rate Details
    items: List[Dict[str, Any]] = []
    
    # Tax & Compliance
    tax_structure: Dict[str, float] = {}
    tax_registration_number: str
    customer_tax_id: str
    einvoice_irn: Optional[str] = None
    hsn_sac_code: Optional[str] = None
    eway_bill_number: Optional[str] = None
    tax_compliance_status: str = "Pass"
    
    # Approval & Dispatch
    approval_status: str = "Pending"
    approved_by: Optional[str] = None
    approval_remarks: Optional[str] = None
    dispatched_on: Optional[datetime] = None
    dispatch_method: str = "Email"
    dispatch_proof: Optional[str] = None
    
    # Customer Acknowledgment
    acknowledged_on: Optional[datetime] = None
    acknowledged_by: Optional[str] = None
    acknowledgment_proof: Optional[str] = None
    dispute_flag: bool = False
    dispute_reason: Optional[str] = None
    resolution_sop_id: Optional[str] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 6: COLLECT ====================

class CollectCreate(BaseModel):
    invoice_id: str
    customer_id: str
    amount_due: float


class Collect(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    collection_id: str  # AUTO: COLL-2025-001
    invoice_id: str
    customer_id: str
    payment_status: PaymentStatus = PaymentStatus.PENDING
    
    # Payment Details
    amount_due: float
    amount_received: float = 0.0
    amount_outstanding: float
    currency: str = "INR"
    due_date: date
    payment_received_date: Optional[date] = None
    
    # Collection Schedule
    collection_priority: str = "Medium"  # High/Medium/Low
    days_overdue: int = 0
    dunning_level: int = 0  # 0=No follow-up, 1-5=Escalation levels
    last_followup_date: Optional[date] = None
    next_followup_date: Optional[date] = None
    
    # Payment Details
    payment_method: Optional[str] = None  # Bank/UPI/Card/Cheque
    payment_reference: Optional[str] = None  # UTR/Cheque No
    bank_account: Optional[str] = None
    
    # Dispute & Resolution
    dispute_flag: bool = False
    dispute_reason: Optional[str] = None
    dispute_resolution_date: Optional[date] = None
    partial_settlement: bool = False
    writeoff_flag: bool = False
    writeoff_amount: float = 0.0
    writeoff_reason: Optional[str] = None
    writeoff_approved_by: Optional[str] = None
    
    # Customer Behavior Analysis
    customer_payment_behavior: str = "Good"  # Excellent/Good/Average/Poor
    avg_payment_delay_days: int = 0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 7: PROCURE ====================

class ProcureCreate(BaseModel):
    requested_by: str
    purpose: str
    category: str  # CapEx/OpEx/Services/Consumables
    cost_center: str
    estimated_value: float
    vendor_id: Optional[str] = None


class Procure(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Requisition Details
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    requisition_id: str  # AUTO: REQ-2025-001
    requested_by: str
    request_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    requisition_status: RequisitionStatus = RequisitionStatus.DRAFT
    purpose: str
    category: str
    cost_center: str
    estimated_value: float
    currency: str = "INR"
    budget_code: Optional[str] = None
    
    # Vendor Details
    vendor_id: Optional[str] = None
    vendor_name: Optional[str] = None
    vendor_category: Optional[str] = None  # Approved/Preferred/New
    vendor_rating: float = 0.0
    compliance_status: str = "Pending"
    vendor_gstin: Optional[str] = None
    contact_person: Optional[str] = None
    payment_terms: str = "Net 30"
    
    # Quotation Data
    rfq_id: Optional[str] = None
    quotation_received_from: List[str] = []
    quoted_amount: Dict[str, float] = {}
    delivery_timeline: Dict[str, str] = {}
    comparison_result: Dict[str, Any] = {}
    selected_vendor: Optional[str] = None
    
    # Budget & Financial Control
    budget_available: float = 0.0
    budget_locked: float = 0.0
    threshold_exceeded: bool = False
    approval_required_level: Optional[str] = None
    approved_value: float = 0.0
    
    # Purchase Order Data
    po_id: Optional[str] = None
    po_date: Optional[date] = None
    po_value: float = 0.0
    po_status: POStatus = POStatus.DRAFT
    delivery_schedule: Dict[str, Any] = {}
    po_document: Optional[str] = None
    vendor_acknowledgment: str = "Pending"
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 8: PAY ====================

class PayCreate(BaseModel):
    vendor_id: str
    invoice_id: str
    po_id: str
    invoice_number: str
    invoice_amount: float
    due_date: date


class Pay(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_id: str  # AUTO: PAY-2025-001
    vendor_id: str
    invoice_id: str
    po_id: str
    payment_status: str = "Draft"  # Draft/Pending/Approved/Paid/Reconciled
    sop_version: str = "v1.0"
    payment_type: str = "Full"  # Advance/Full/Partial/Retention Release
    
    # Invoice & Matching Data
    invoice_number: str
    invoice_date: date
    invoice_amount: float
    matched_po_id: str
    grn_id: Optional[str] = None
    match_status: str = "Pending"  # Pass/Partial/Fail
    discrepancy_notes: Optional[str] = None
    
    # Financial Terms
    due_date: date
    currency: str = "INR"
    exchange_rate: float = 1.0
    payment_amount: float = 0.0
    retention_amount: float = 0.0
    tds_amount: float = 0.0
    net_payable: float = 0.0
    payment_method: str = "Bank Transfer"
    payment_mode: str = "Auto"  # Manual/Auto/Scheduled
    
    # Approval & Authorization
    approval_path: List[Dict[str, str]] = []
    approvers: List[str] = []
    approval_status: str = "Pending"
    approval_remarks: Optional[str] = None
    approval_date: Optional[datetime] = None
    sod_validation: str = "Pass"  # Pass/Fail (Segregation of Duties)
    
    # Execution & Bank Data
    bank_name: Optional[str] = None
    bank_account_no: Optional[str] = None
    transaction_ref_no: Optional[str] = None  # UTR
    payment_date: Optional[date] = None
    payment_batch_id: Optional[str] = None
    execution_status: str = "Pending"  # Initiated/Completed/Failed
    failure_reason: Optional[str] = None
    
    # Tax & Compliance
    vendor_tax_id: str
    tds_section: Optional[str] = None
    tax_compliance_status: str = "Pass"
    retention_policy_id: Optional[str] = None
    regulatory_flag: bool = False
    
    # Audit & Closure
    payment_proof: Optional[str] = None
    vendor_acknowledgment: bool = False
    closed_by: Optional[str] = None
    closed_on: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 9: SPEND ====================

class SpendCreate(BaseModel):
    expense_type: str  # Travel/Office/Software/Vendor/Employee
    expense_amount: float
    category_code: str
    cost_center: str
    description: str


class Spend(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    expense_id: str  # AUTO: EXP-2025-001
    expense_type: str
    expense_source: str = "Manual"  # Manual/Card/API/Import
    expense_date: date = Field(default_factory=lambda: datetime.now(timezone.utc).date())
    reported_by: str
    sop_version: str = "v1.0"
    expense_status: ExpenseStatus = ExpenseStatus.DRAFT
    
    # Financial Details
    expense_amount: float
    currency: str = "INR"
    tax_amount: float = 0.0
    net_expense: float = 0.0
    payment_link_id: Optional[str] = None
    reimbursable: bool = False
    budget_code: Optional[str] = None
    
    # Policy & Control Data
    policy_id: Optional[str] = None
    limit_amount: float = 0.0
    breach_flag: bool = False
    justification: Optional[str] = None
    receipt_proof: Optional[str] = None
    policy_action: str = "Needs review"  # Auto-approve/Needs review/Reject
    
    # Categorization Data
    category_code: str
    gl_code: Optional[str] = None
    cost_center: str
    vendor_id: Optional[str] = None
    recurring_flag: bool = False
    expense_tag: List[str] = []
    
    # Approval Data
    approval_level: str = "L1"
    approver_id: Optional[str] = None
    approval_date: Optional[datetime] = None
    approval_status: str = "Pending"
    approval_notes: Optional[str] = None
    
    # Reporting & Closure
    posted_to_finance: bool = False
    finance_journal_id: Optional[str] = None
    linked_tax_record_id: Optional[str] = None
    variance_flag: bool = False
    spend_score: float = 0.0
    closed_on: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 10: TAX ====================

class TaxCreate(BaseModel):
    tax_period: str  # e.g., "2025-01" for Jan 2025
    tax_type: str  # GST/TDS/VAT
    filing_due_date: date


class Tax(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tax_id: str  # AUTO: TAX-2025-001
    tax_period: str
    tax_type: str
    tax_status: str = "Draft"  # Draft/Calculated/Filed/Paid
    
    # Computation
    taxable_amount: float = 0.0
    tax_rate: float = 0.0
    tax_computed: float = 0.0
    tax_collected: float = 0.0
    tax_paid: float = 0.0
    tax_liability: float = 0.0
    input_tax_credit: float = 0.0
    net_tax_payable: float = 0.0
    
    # Filing Details
    filing_due_date: date
    filing_date: Optional[date] = None
    filing_reference: Optional[str] = None  # Acknowledgment Number
    return_type: Optional[str] = None  # GSTR-1/GSTR-3B/TDS Return
    
    # Compliance
    late_filing_flag: bool = False
    penalty_amount: float = 0.0
    interest_amount: float = 0.0
    compliance_score: float = 100.0
    
    # Audit Trail
    prepared_by: Optional[str] = None
    reviewed_by: Optional[str] = None
    approved_by: Optional[str] = None
    filed_by: Optional[str] = None
    
    # Supporting Data
    transaction_ids: List[str] = []
    supporting_documents: List[str] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 11: RECONCILE ====================

class ReconcileCreate(BaseModel):
    reconcile_type: str  # Bank/Vendor/Tax/Customer/Internal
    period_start: date
    period_end: date


class Reconcile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reconcile_id: str  # AUTO: REC-2025-001
    reconcile_type: str
    period_start: date
    period_end: date
    data_source: Dict[str, str] = {}
    sop_version: str = "v1.0"
    reconcile_status: ReconcileStatus = ReconcileStatus.OPEN
    
    # Matching Data
    internal_ref_no: Optional[str] = None
    external_ref_no: Optional[str] = None
    match_status: str = "Pending"  # Matched/Mismatch/Missing
    match_confidence: float = 0.0
    matched_on: Optional[datetime] = None
    mismatch_type: Optional[str] = None  # Amount/Date/Duplicate/Unposted
    adjustment_ref_id: Optional[str] = None
    
    # Financial Details
    amount_internal: float = 0.0
    amount_external: float = 0.0
    difference: float = 0.0
    currency: str = "INR"
    value_date: Optional[date] = None
    gl_impact: str = "Debit"
    
    # Exception Data
    exception_id: Optional[str] = None
    exception_type: Optional[str] = None
    exception_description: Optional[str] = None
    resolution_action: Optional[str] = None  # Adjust/Reverse/Defer/Escalate
    resolved_by: Optional[str] = None
    resolved_on: Optional[datetime] = None
    govern_log_id: Optional[str] = None
    
    # Closure & Reporting
    reconciled_entries: int = 0
    unmatched_entries: int = 0
    reconciled_value: float = 0.0
    exception_value: float = 0.0
    final_status: str = "Open"  # Closed/Pending/Review
    closure_date: Optional[date] = None
    reconciliation_score: float = 0.0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== MODULE 12: GOVERN ====================

class GovernCreate(BaseModel):
    sop_name: str
    sop_type: str  # Process/Policy/Control
    sop_owner: str
    effective_date: date


class Govern(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    govern_id: str  # AUTO: GOV-2025-001
    sop_name: str
    sop_type: str
    sop_version: str = "v1.0"
    sop_status: str = "Active"  # Draft/Active/Under Review/Archived
    
    # SOP Details
    sop_owner: str
    department: Optional[str] = None
    effective_date: date
    review_date: Optional[date] = None
    next_review_date: Optional[date] = None
    
    # Version Control
    version_history: List[Dict[str, Any]] = []
    change_log: List[Dict[str, Any]] = []
    parent_version_id: Optional[str] = None
    
    # Compliance & Control
    control_objectives: List[str] = []
    risk_addressed: List[str] = []
    compliance_framework: List[str] = []  # ISO/SOX/GDPR etc
    
    # Performance Metrics
    sla_defined: Optional[str] = None
    sla_compliance_percent: float = 100.0
    breach_count: int = 0
    last_breach_date: Optional[date] = None
    
    # Audit & Attestation
    last_audit_date: Optional[date] = None
    audit_findings: List[str] = []
    attestation_required: bool = False
    attested_by: Optional[str] = None
    attestation_date: Optional[date] = None
    
    # Continuous Improvement
    improvement_suggestions: List[str] = []
    pending_updates: List[str] = []
    
    # Execution Tracking
    total_runs: int = 0
    successful_runs: int = 0
    failed_runs: int = 0
    avg_execution_time: float = 0.0
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ==================== RESPONSE MODELS ====================

class LeadList(BaseModel):
    leads: List[Lead]
    total: int
    page: int
    page_size: int


class EvaluateList(BaseModel):
    evaluations: List[Evaluate]
    total: int
    page: int
    page_size: int


# Add similar list models for all other modules...
