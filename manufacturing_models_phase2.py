"""
Manufacturing Lead Module - Phase 2 Models
Additional 90+ Masters and Extended RBAC
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid


# ============================================================================
# ADDITIONAL CUSTOMER MASTERS (7 more)
# ============================================================================

class CustomerGroupMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    group_code: str
    group_name: str
    description: Optional[str] = None
    discount_percentage: Optional[float] = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CustomerCategoryMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_code: str
    category_name: str  # Tier1, Tier2, Strategic, VIP
    credit_limit_multiplier: float = 1.0
    priority_level: int = 5  # 1=highest, 5=lowest
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CustomerRegionMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    region_code: str
    region_name: str
    country: str
    sales_manager_id: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CustomerCreditProfileMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    credit_limit: float
    credit_rating: str  # A, B, C, D
    payment_history_score: int = 0  # 0-100
    outstanding_balance: float = 0.0
    credit_days: int = 30
    last_reviewed: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class CustomerContractMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    contract_number: str
    customer_id: str
    contract_type: str  # Annual, Multi-year, Per-order
    start_date: date
    end_date: date
    total_value: float
    terms_and_conditions: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CustomerSLAMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    rfq_response_time_hours: int = 48
    quote_validity_days: int = 30
    max_lead_time_days: int = 90
    quality_reject_percentage: float = 0.5
    on_time_delivery_percentage: float = 98.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# ADDITIONAL PRODUCT MASTERS (5 more)
# ============================================================================

class ProductCategoryMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category_code: str
    category_name: str
    parent_category_id: Optional[str] = None
    hsn_code: Optional[str] = None
    tax_category: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SKUAliasMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku_id: str
    customer_id: str
    customer_part_number: str
    customer_description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PackagingMaterialMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    packaging_code: str
    packaging_name: str
    packaging_type: str  # Box, Pallet, Crate, Bag
    dimensions: Optional[str] = None  # LxWxH
    weight_capacity_kg: Optional[float] = None
    cost_per_unit: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class LabelingMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    label_code: str
    label_name: str
    label_type: str  # Barcode, QR, Product Label
    template_file: Optional[str] = None
    mandatory_fields: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProductComplianceMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sku_id: str
    compliance_type: str  # ROHS, CE, ISO, MSDS
    certificate_number: Optional[str] = None
    issued_by: Optional[str] = None
    valid_from: date
    valid_until: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# BOM & ENGINEERING MASTERS (13 more)
# ============================================================================

class ComponentBOMMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    component_code: str
    component_name: str
    parent_sku_id: str
    quantity_required: float
    uom: str
    scrap_percentage: float = 0.0
    is_optional: bool = False
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SubstituteMaterialMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    primary_material_id: str
    substitute_material_id: str
    conversion_factor: float = 1.0
    cost_difference_percentage: float = 0.0
    quality_impact: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ToolingMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tooling_code: str
    tooling_name: str
    tooling_type: str  # Mold, Jig, Fixture, Die
    sku_id: Optional[str] = None
    life_cycles: int = 10000
    cycles_used: int = 0
    maintenance_frequency: int = 1000  # cycles
    cost: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkCenterMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workcenter_code: str
    workcenter_name: str
    plant_id: str
    workcenter_type: str  # CNC, Forging, Assembly, QC
    capacity_units_per_hour: float = 10.0
    setup_time_minutes: int = 30
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WorkCenterCapabilityMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    workcenter_id: str
    capability: str  # "5-axis machining", "Heat treatment"
    tolerance_achievable: Optional[str] = None
    max_part_size: Optional[str] = None
    certifications: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ProcessRouteMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    route_code: str
    route_name: str
    sku_id: str
    operations: List[Dict[str, Any]] = []  # [{seq, workcenter_id, time_minutes}]
    total_cycle_time_minutes: int = 0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class EngineeringDrawingMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    drawing_number: str
    drawing_name: str
    sku_id: str
    revision: str = "A"
    file_path: Optional[str] = None
    file_format: str = "PDF"  # PDF, DWG, STEP
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ToleranceTemplateMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    template_code: str
    template_name: str
    industry: str
    general_tolerance: str  # "ISO 2768-mK"
    specific_tolerances: Dict[str, str] = {}  # {dimension_type: tolerance}
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SurfaceFinishMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    finish_code: str
    finish_name: str
    ra_value: str  # "Ra 1.6"
    process_used: str  # Grinding, Polishing
    cost_multiplier: float = 1.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HeatTreatmentMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    treatment_code: str
    treatment_name: str
    treatment_type: str  # Annealing, Hardening, Tempering
    material_grade_applicable: str
    temperature_celsius: int
    duration_hours: int
    cost_per_kg: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class TestingMethodMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    test_code: str
    test_name: str
    test_type: str  # Destructive, Non-destructive
    equipment_required: Optional[str] = None
    duration_minutes: int = 30
    cost_per_test: float = 0.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class QCParameterMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    parameter_code: str
    parameter_name: str
    measurement_unit: str
    acceptable_range_min: Optional[float] = None
    acceptable_range_max: Optional[float] = None
    inspection_frequency: str  # Every part, Sample, First-Last
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CalibrationEquipmentMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    equipment_code: str
    equipment_name: str
    equipment_type: str  # Micrometer, CMM, Hardness Tester
    calibration_frequency_months: int = 12
    last_calibration_date: Optional[date] = None
    next_calibration_date: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# PROCUREMENT MASTERS (6 more)
# ============================================================================

class VendorMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_code: str
    vendor_name: str
    vendor_type: str  # Raw Material, Component, Service
    contact_person: str
    contact_email: str
    contact_phone: str
    address: Optional[str] = None
    gstin: Optional[str] = None
    payment_terms: str = "Net 30"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class VendorRatingMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    vendor_id: str
    quality_rating: int = 5  # 1-10
    delivery_rating: int = 5
    cost_rating: int = 5
    service_rating: int = 5
    overall_rating: float = 5.0
    last_reviewed: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class RMLeadTimeMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rm_id: str
    vendor_id: str
    lead_time_days: int = 30
    moq: float = 100.0
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RMSourceMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rm_id: str
    vendor_id: str
    is_primary: bool = False
    price_per_unit: float = 0.0
    currency: str = "INR"
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RMSubstitutionMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    primary_rm_id: str
    substitute_rm_id: str
    conversion_ratio: float = 1.0
    quality_impact: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class RMPriceMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    rm_id: str
    vendor_id: str
    price_per_unit: float
    currency: str = "INR"
    effective_from: date
    effective_to: Optional[date] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ============================================================================
# ADDITIONAL COMMERCE MASTERS (7 more)
# ============================================================================

class DiscountStructureMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    discount_code: str
    discount_name: str
    discount_type: str  # Percentage, Fixed Amount
    discount_value: float
    applicable_to: str  # Customer Group, Product Category
    min_order_value: Optional[float] = None
    valid_from: date
    valid_to: Optional[date] = None
    is_active: bool = True


class PaymentTermsMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    payment_term_code: str
    payment_term_name: str
    days: int = 30  # Net 30
    discount_percentage: float = 0.0  # Early payment discount
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class DeliveryTermsMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    delivery_term_code: str
    delivery_term_name: str
    description: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class FreightTermsMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    freight_term_code: str
    freight_term_name: str  # FOB, CIF, CFR
    responsibility: str  # Seller, Buyer
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class IncotermsMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    incoterm_code: str
    incoterm_name: str  # EXW, FOB, CIF, DDP
    description: Optional[str] = None
    risk_transfer_point: Optional[str] = None
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)


class CreditLimitMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    credit_limit: float
    utilized_credit: float = 0.0
    available_credit: float = 0.0
    last_reviewed: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True


class BillingLocationMaster(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    location_name: str
    address_line1: str
    address_line2: Optional[str] = None
    city: str
    state: str
    country: str
    pincode: str
    gstin: Optional[str] = None
    is_primary: bool = False
    is_active: bool = True


# Continue in next message due to length...
