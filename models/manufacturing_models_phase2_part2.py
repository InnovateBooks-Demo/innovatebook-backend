"""
Manufacturing Lead Module - Phase 2 Models Part 2
Operations, Quality, Logistics, Governance Masters + Extended RBAC (25+ Roles)
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


# ============================================================================
# OPERATIONS MASTERS (7 more)
# ============================================================================

class ShiftMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shift_code: str
    shift_name: str  # Morning, Evening, Night
    start_time: str  # "08:00"
    end_time: str  # "16:00"
    plant_id: str
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CapacityMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    plant_id: str
    workcenter_id: str
    date: date
    available_capacity_hours: float
    utilized_capacity_hours: float = 0.0
    efficiency_percentage: float = 85.0
    is_active: bool = True


class MachineAvailabilityMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workcenter_id: str
    date: date
    shift_id: str
    status: str  # Available, Under Maintenance, Breakdown
    planned_downtime_hours: float = 0.0
    unplanned_downtime_hours: float = 0.0
    is_active: bool = True


class MoldToolMaintenanceMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tooling_id: str
    maintenance_type: str  # Preventive, Corrective
    scheduled_date: date
    completed_date: Optional[date] = None
    technician_name: Optional[str] = None
    cost: float = 0.0
    notes: Optional[str] = None
    is_active: bool = True


class BatchMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    batch_number: str
    sku_id: str
    manufactured_date: date
    expiry_date: Optional[date] = None
    quantity: float
    plant_id: str
    status: str  # In Production, QC Hold, Released, Rejected
    is_active: bool = True


class LotTraceabilityMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    lot_number: str
    batch_id: str
    rm_lot_numbers: List[str] = []
    production_date: date
    shift_id: str
    operator_id: Optional[str] = None
    qc_report_id: Optional[str] = None
    is_active: bool = True


class ScrapCodeMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    scrap_code: str
    scrap_reason: str
    category: str  # Material Defect, Process Issue, Operator Error
    is_reworkable: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class YieldPercentageMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku_id: str
    plant_id: str
    standard_yield_percentage: float = 95.0
    actual_yield_percentage: float = 95.0
    period: str  # Monthly, Quarterly
    last_updated: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


# ============================================================================
# QUALITY & COMPLIANCE MASTERS (8 more)
# ============================================================================

class ISOCertificateMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    certificate_number: str
    iso_standard: str  # ISO9001, ISO14001, IATF16949
    plant_id: str
    issued_by: str
    issue_date: date
    expiry_date: date
    certificate_file: Optional[str] = None
    is_active: bool = True


class CustomerRequiredCertificateMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    certificate_type: str  # PPAP, ROHS, CE, FDA
    mandatory: bool = True
    renewal_frequency_months: Optional[int] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TestProtocolMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    protocol_code: str
    protocol_name: str
    sku_id: Optional[str] = None
    test_steps: List[Dict[str, Any]] = []  # [{step, parameter, method, acceptance}]
    sample_size: int = 1
    frequency: str  # Per part, Per batch, Random
    is_active: bool = True


class InspectionLevelMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    level_code: str
    level_name: str  # General I, General II, Special
    sample_size_percentage: float = 10.0
    aql: float = 1.5  # Acceptable Quality Level
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class MSDSMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    msds_number: str
    chemical_name: str
    cas_number: Optional[str] = None
    hazard_classification: str
    safety_precautions: Optional[str] = None
    file_path: Optional[str] = None
    issue_date: date
    revision: str = "1"
    is_active: bool = True


class HazardClassificationMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    hazard_code: str
    hazard_name: str
    un_number: Optional[str] = None  # UN dangerous goods number
    class_division: Optional[str] = None
    packing_group: Optional[str] = None
    special_provisions: Optional[str] = None
    is_active: bool = True


class CalibrationCertificateMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    certificate_number: str
    equipment_id: str
    calibration_date: date
    next_calibration_date: date
    calibrated_by: str
    certificate_file: Optional[str] = None
    is_active: bool = True


class RejectionCodeMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rejection_code: str
    rejection_reason: str
    category: str  # Dimensional, Visual, Functional, Material
    severity: str  # Critical, Major, Minor
    corrective_action: Optional[str] = None
    is_active: bool = True


# ============================================================================
# LOGISTICS MASTERS (7 more)
# ============================================================================

class PackagingTemplateMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    template_code: str
    template_name: str
    sku_id: Optional[str] = None
    packaging_material_id: str
    quantity_per_package: int
    labeling_requirement: Optional[str] = None
    is_active: bool = True


class PalletizationMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    pallet_code: str
    pallet_type: str  # Wood, Plastic, Metal
    dimensions: str  # LxWxH
    max_weight_kg: float
    packages_per_pallet: int
    is_active: bool = True


class TransporterMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    transporter_code: str
    transporter_name: str
    contact_person: str
    contact_phone: str
    email: str
    address: Optional[str] = None
    rating: Optional[int] = 5  # 1-10
    is_active: bool = True


class VehicleTypeMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vehicle_type_code: str
    vehicle_type_name: str  # Truck, Container, Rail
    capacity_kg: float
    cost_per_km: float = 0.0
    is_active: bool = True


class RouteMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_code: str
    route_name: str
    origin: str
    destination: str
    distance_km: float
    estimated_time_hours: float
    preferred_transporter_id: Optional[str] = None
    is_active: bool = True


class PortMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    port_code: str
    port_name: str
    port_type: str  # Sea Port, Air Port
    country: str
    customs_clearance_days: int = 3
    is_active: bool = True


class ExportDocumentationMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_type: str  # Bill of Lading, Packing List, Certificate of Origin
    required_for_countries: List[str] = []
    template_file: Optional[str] = None
    authority_issuing: Optional[str] = None
    is_active: bool = True


# ============================================================================
# GOVERNANCE MASTERS (10 more)
# ============================================================================

class ApprovalMatrixMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    matrix_name: str
    approval_type: str
    value_tier: str  # Tier0, Tier1, Tier2, Tier3, Tier4
    min_value: float
    max_value: Optional[float] = None
    approver_roles: List[str] = []
    approval_mode: str  # Sequential, Parallel
    sla_hours: int = 48
    is_active: bool = True


class SOPStageMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    stage_code: str
    stage_name: str
    sequence: int
    entry_criteria: List[str] = []
    exit_criteria: List[str] = []
    mandatory_fields: List[str] = []
    sla_hours: int = 24
    is_active: bool = True


class RiskCodeMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    risk_code: str
    risk_name: str
    risk_category: str  # Technical, Financial, Operational
    severity: str  # Low, Medium, High, Critical
    mitigation_strategy: Optional[str] = None
    is_active: bool = True


class LossReasonMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reason_code: str
    reason_name: str
    category: str  # Price, Quality, Delivery, Competitor
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EscalationMatrixMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    escalation_level: int  # 1, 2, 3
    sla_breach_hours: int
    escalate_to_role: str
    notification_channels: List[str] = ["Email"]  # Email, SMS, Slack
    is_active: bool = True


class SLAMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sla_code: str
    sla_name: str
    module: str  # Lead, Feasibility, Approval
    target_hours: int
    warning_threshold_percentage: float = 80.0
    is_active: bool = True


class AccessPolicyMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    policy_code: str
    policy_name: str
    role: str
    allowed_modules: List[str] = []
    allowed_actions: List[str] = []
    is_active: bool = True


class SoDRuleMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rule_code: str
    rule_name: str
    role1: str
    role2: str
    conflict_type: str  # Cannot be same person
    is_active: bool = True


class DataRetentionPolicyMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    policy_code: str
    data_type: str  # Lead, Audit Log, Document
    retention_years: int = 7
    archival_after_years: int = 5
    is_active: bool = True


class ExceptionHandlingMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    exception_code: str
    exception_name: str
    exception_type: str  # Tooling, Capacity, RM Shortage
    mitigation_owner_role: str
    sla_hours: int = 24
    is_active: bool = True


# ============================================================================
# EXTENDED RBAC - 25+ ROLES
# ============================================================================

class ExtendedUserRole(str, Enum):
    # Phase 1 Roles
    SALES_REP = "Sales Rep"
    SALES_MANAGER = "Sales Manager"
    ENGINEERING_LEAD = "Engineering Lead"
    PRODUCTION_MANAGER = "Production Manager"
    QC_MANAGER = "QC Manager"
    PRICING_MANAGER = "Pricing Manager"
    FINANCE_HEAD = "Finance Head"
    
    # Phase 2 Additional Roles
    SALES_DIRECTOR = "Sales Director"
    DESIGN_ENGINEER = "Design Engineer"
    TOOLING_ENGINEER = "Tooling Engineer"
    PRODUCTION_PLANNER = "Production Planner"
    PLANT_MANAGER = "Plant Manager"
    QUALITY_ENGINEER = "Quality Engineer"
    PROCUREMENT_OFFICER = "Procurement Officer"
    PROCUREMENT_MANAGER = "Procurement Manager"
    COMMERCIAL_ANALYST = "Commercial Analyst"
    FINANCE_ANALYST = "Finance Analyst"
    COMPLIANCE_OFFICER = "Compliance Officer"
    REGULATORY_MANAGER = "Regulatory Manager"
    LOGISTICS_COORDINATOR = "Logistics/Dispatch Coordinator"
    OPERATIONS_COORDINATOR = "Operations/Sample Coordinator"
    AUDIT_RISK_MANAGER = "Audit & Risk Manager"
    EXTERNAL_APPROVER = "External Approver (Customer/Vendor)"
    SYSTEM_BOT = "System/Bot Account"
    TENANT_ADMIN = "Tenant Admin"
    SYSTEM_ADMIN = "System Admin"


class ExtendedRolePermissions(BaseModel):
    """Complete RBAC for all 25+ roles"""
    role: ExtendedUserRole
    role_name: str
    permissions: List[str]  # lead:create, lead:approve:technical, etc.
    description: str
    functional_responsibilities: List[str] = []
    can_approve: List[str] = []
    approval_threshold: Optional[float] = None
    plant_restrictions: List[str] = []  # Plant IDs this role can access
    sod_conflicts: List[str] = []  # Roles that conflict with this role
    
    class Config:
        use_enum_values = True


# Example: Complete role definitions
COMPLETE_ROLE_DEFINITIONS = [
    {
        "role": "Sales Director",
        "permissions": ["lead:*", "evaluate:*", "commit:approve:high_value", "user:manage:sales"],
        "description": "Senior sales leadership with strategic oversight",
        "functional_responsibilities": [
            "Strategic account management",
            "Team performance management",
            "High-value deal approvals",
            "Sales forecasting"
        ],
        "can_approve": ["Pricing", "Credit", "Management"],
        "approval_threshold": 50000000.0
    },
    {
        "role": "Plant Manager",
        "permissions": ["lead:view", "production:*", "capacity:manage", "workcenter:manage"],
        "description": "Overall plant operations and production management",
        "functional_responsibilities": [
            "Plant operations oversight",
            "Capacity planning",
            "Resource allocation",
            "Production scheduling"
        ],
        "can_approve": ["Production"],
        "plant_restrictions": ["PLT-001"]  # Can only manage specific plant
    }
    # ... more role definitions
]
