"""
IB Operations - Backend Models
Execution, Delivery, Fulfillment & Control Layer

Modules:
1. Work Intake - Commercial-to-Execution Translation Engine
2. Projects - Structured Execution & Delivery Control Engine
3. Tasks & Workflow - Atomic Execution, Control & Orchestration Engine
4. Inventory & Resources - Execution-Time Consumption & Capacity Control Engine
5. Service Delivery - Non-Project Execution, SLA & Usage Control Engine
6. Execution Governance - Execution Control, Deviation Detection & Enforcement Engine
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


# ==================== WORK INTAKE MODELS ====================

class WorkOrderStatus(str, Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    BLOCKED = "blocked"
    ACTIVE = "active"
    COMPLETED = "completed"


class DeliveryType(str, Enum):
    PROJECT = "project"
    SERVICE = "service"
    SUBSCRIPTION = "subscription"


class SourceType(str, Enum):
    REVENUE = "revenue"
    PROCUREMENT = "procurement"


class WorkOrder(BaseModel):
    work_order_id: str
    source_contract_id: str
    source_type: SourceType
    party_id: str
    party_name: Optional[str] = None
    delivery_type: DeliveryType
    scope_snapshot: Dict[str, Any] = Field(default_factory=dict)
    sla_snapshot: Dict[str, Any] = Field(default_factory=dict)
    planned_start_date: str
    planned_end_date: str
    status: WorkOrderStatus = WorkOrderStatus.PENDING
    risk_flag: bool = False
    blocked_reason: Optional[str] = None
    accepted_by: Optional[str] = None
    accepted_at: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    org_id: Optional[str] = None


class WorkOrderCreate(BaseModel):
    source_contract_id: str
    source_type: SourceType
    party_id: str
    party_name: Optional[str] = None
    delivery_type: DeliveryType
    scope_snapshot: Dict[str, Any] = Field(default_factory=dict)
    sla_snapshot: Dict[str, Any] = Field(default_factory=dict)
    planned_start_date: str
    planned_end_date: str


# ==================== PROJECTS MODELS ====================

class ProjectStatus(str, Enum):
    PLANNED = "planned"
    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"
    FAILED = "failed"
    CLOSED = "closed"


class ProjectType(str, Enum):
    CLIENT = "client"
    VENDOR = "vendor"
    INTERNAL = "internal"
    HYBRID = "hybrid"


class MilestoneStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELAYED = "delayed"


class Project(BaseModel):
    project_id: str
    work_order_id: str
    project_type: ProjectType
    name: str
    description: Optional[str] = None
    start_date: str
    target_end_date: str
    actual_end_date: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNED
    scope_snapshot: Dict[str, Any] = Field(default_factory=dict)
    sla_snapshot: Dict[str, Any] = Field(default_factory=dict)
    owner_id: str
    owner_name: Optional[str] = None
    progress_percent: int = 0
    sla_status: str = "on_track"  # on_track | at_risk | breached
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    org_id: Optional[str] = None


class Milestone(BaseModel):
    milestone_id: str
    project_id: str
    title: str
    description: Optional[str] = None
    planned_date: str
    actual_date: Optional[str] = None
    status: MilestoneStatus = MilestoneStatus.PENDING
    order_index: int = 0
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ProjectIssue(BaseModel):
    issue_id: str
    project_id: str
    issue_type: str  # scope | resource | dependency | sla
    title: str
    description: str
    severity: str  # low | medium | high | critical
    status: str = "open"  # open | investigating | resolved | closed
    raised_by: str
    raised_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    resolved_at: Optional[str] = None


# ==================== TASKS & WORKFLOW MODELS ====================

class TaskType(str, Enum):
    MANUAL = "manual"
    APPROVAL = "approval"
    EXTERNAL = "external"
    SYSTEM = "system"


class TaskStatus(str, Enum):
    CREATED = "created"
    READY = "ready"
    IN_PROGRESS = "in_progress"
    BLOCKED = "blocked"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class AssigneeType(str, Enum):
    INTERNAL = "internal"
    CLIENT = "client"
    VENDOR = "vendor"
    SYSTEM = "system"


class SlaImpact(str, Enum):
    NONE = "none"
    SOFT = "soft"
    HARD = "hard"


class Task(BaseModel):
    task_id: str
    project_id: str
    task_type: TaskType
    title: str
    description: Optional[str] = None
    assignee_type: AssigneeType = AssigneeType.INTERNAL
    assignee_id: Optional[str] = None
    assignee_name: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: str
    status: TaskStatus = TaskStatus.CREATED
    dependencies: List[str] = Field(default_factory=list)  # task_ids
    sla_impact: SlaImpact = SlaImpact.NONE
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    blocked_reason: Optional[str] = None
    org_id: Optional[str] = None


class TaskCreate(BaseModel):
    project_id: str
    task_type: TaskType
    title: str
    description: Optional[str] = None
    assignee_type: AssigneeType = AssigneeType.INTERNAL
    assignee_id: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: str
    dependencies: List[str] = Field(default_factory=list)
    sla_impact: SlaImpact = SlaImpact.NONE


# ==================== INVENTORY & RESOURCES MODELS ====================

class InventoryType(str, Enum):
    PHYSICAL = "physical"
    DIGITAL = "digital"
    CONSUMABLE = "consumable"
    USAGE = "usage"


class InventoryStatus(str, Enum):
    ACTIVE = "active"
    RESTRICTED = "restricted"
    UNAVAILABLE = "unavailable"


class AllocationStatus(str, Enum):
    RESERVED = "reserved"
    PARTIALLY_CONSUMED = "partially_consumed"
    FULLY_CONSUMED = "fully_consumed"
    RELEASED = "released"


class InventoryItem(BaseModel):
    inventory_item_id: str
    name: str
    inventory_type: InventoryType
    unit_of_measure: str
    available_quantity: float
    reserved_quantity: float = 0
    status: InventoryStatus = InventoryStatus.ACTIVE
    org_id: Optional[str] = None


class InventoryAllocation(BaseModel):
    allocation_id: str
    project_id: str
    inventory_item_id: str
    item_name: Optional[str] = None
    quantity_reserved: float
    quantity_consumed: float = 0
    allocation_status: AllocationStatus = AllocationStatus.RESERVED
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ResourceType(str, Enum):
    INTERNAL = "internal"
    CONTRACTOR = "contractor"
    VENDOR = "vendor"


class ResourceStatus(str, Enum):
    AVAILABLE = "available"
    PARTIALLY_ALLOCATED = "partially_allocated"
    FULLY_ALLOCATED = "fully_allocated"


class Resource(BaseModel):
    resource_id: str
    name: str
    resource_type: ResourceType
    skill_tags: List[str] = Field(default_factory=list)
    availability_percent: float = 100.0
    status: ResourceStatus = ResourceStatus.AVAILABLE
    org_id: Optional[str] = None


class ResourceAssignment(BaseModel):
    assignment_id: str
    project_id: str
    resource_id: str
    resource_name: Optional[str] = None
    role: str
    allocation_percent: float
    start_date: str
    end_date: str
    status: str = "planned"  # planned | active | completed | released
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== SERVICE DELIVERY MODELS ====================

class ServiceType(str, Enum):
    SUBSCRIPTION = "subscription"
    SUPPORT = "support"
    RETAINER = "retainer"
    MANAGED = "managed"


class ServiceStatus(str, Enum):
    CREATED = "created"
    ACTIVE = "active"
    PAUSED = "paused"
    TERMINATED = "terminated"
    COMPLETED = "completed"


class DeliveryFrequency(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ON_DEMAND = "on_demand"


class ServiceInstance(BaseModel):
    service_instance_id: str
    contract_id: str
    party_id: str
    party_name: Optional[str] = None
    service_type: ServiceType
    service_name: str
    start_date: str
    end_date: Optional[str] = None
    delivery_frequency: DeliveryFrequency = DeliveryFrequency.MONTHLY
    sla_snapshot: Dict[str, Any] = Field(default_factory=dict)
    usage_metrics_definition: Dict[str, Any] = Field(default_factory=dict)
    usage_current: float = 0
    usage_limit: float = 100
    status: ServiceStatus = ServiceStatus.CREATED
    sla_status: str = "on_track"  # on_track | at_risk | breached
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    org_id: Optional[str] = None


class ServiceUsage(BaseModel):
    usage_id: str
    service_instance_id: str
    metric_type: str
    consumed_value: float
    period: str  # e.g., "2025-12"
    recorded_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


# ==================== EXECUTION GOVERNANCE MODELS ====================

class PolicyType(str, Enum):
    SCOPE = "scope"
    SLA = "sla"
    RESOURCE = "resource"
    FLOW = "flow"


class AlertSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"


class ExecutionPolicy(BaseModel):
    policy_id: str
    policy_type: PolicyType
    name: str
    condition_expression: str
    severity: AlertSeverity
    escalation_required: bool = False
    active: bool = True
    org_id: Optional[str] = None


class DeviationType(str, Enum):
    EXTRA_TASK = "extra_task"
    QUANTITY_OVERRUN = "quantity_overrun"
    UNAPPROVED_WORK = "unapproved_work"
    OVER_ALLOCATION = "over_allocation"
    CONFLICT = "conflict"
    SHORTAGE = "shortage"
    DEPENDENCY_BYPASS = "dependency_bypass"
    APPROVAL_SKIP = "approval_skip"


class ExecutionAlert(BaseModel):
    alert_id: str
    entity_type: str  # project | task | service | resource
    entity_id: str
    entity_name: Optional[str] = None
    alert_category: str  # scope | sla | resource | flow
    severity: AlertSeverity
    message: str
    status: str = "open"  # open | acknowledged | resolved
    raised_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    acknowledged_by: Optional[str] = None
    resolved_at: Optional[str] = None
    org_id: Optional[str] = None


class SlaBreach(BaseModel):
    breach_id: str
    entity_type: str  # task | milestone | project | service
    entity_id: str
    entity_name: Optional[str] = None
    breach_type: str  # soft | hard
    delay_duration: str
    detected_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    org_id: Optional[str] = None
