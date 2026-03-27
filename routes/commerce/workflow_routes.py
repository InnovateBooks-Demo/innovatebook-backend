"""
IB Commerce - Revenue & Procurement 5-Stage Workflow
Full enterprise-grade implementation with stage transitions, governance, and approvals
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header, UploadFile, File, Request, Body, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
import json
import hashlib
from typing import List, Optional, Dict, Any, Tuple
from datetime import datetime, timezone, timedelta,date
from enum import Enum
import logging
import uuid
import logging
import uuid
import jwt
import os
import re
import httpx
from routes.deps import get_current_user, User, security, JWT_ALGORITHM

# Auth moved to routes.deps
import os
import re
import httpx

JWT_SECRET = os.environ.get("JWT_SECRET_KEY", "placeholder_secret")
CLEARTAX_HOST = os.environ.get("CLEARTAX_HOST", "https://api.cleartax.in")
CLEARTAX_AUTH_TOKEN = os.environ.get("CLEARTAX_AUTH_TOKEN", "placeholder_token")
CLEARTAX_TAXABLE_ENTITY_ID = os.environ.get("CLEARTAX_TAXABLE_ENTITY_ID", "placeholder_id")
ENABLE_CLEARTAX_GST_VERIFY = os.environ.get("ENABLE_CLEARTAX_GST_VERIFY", "false").lower() == "true"
ALLOW_DEV_GST_BYPASS = os.environ.get("ALLOW_DEV_GST_BYPASS", "false").lower() == "true"

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/commerce/workflow", tags=["IB Commerce Workflow"])
legacy_router = APIRouter(prefix="/commerce", tags=["IB Commerce Workflow Legacy"])

# ─── Inline RBAC helper ───────────────────────────────────────────────────────
_ROLE_RANK = {"owner": 4, "admin": 3, "manager": 2, "member": 1, "viewer": 0}

def _require_role(allowed_roles: list):
    """Dependency factory: reject if caller's role rank < min allowed rank."""
    min_rank = min(_ROLE_RANK.get(r, 0) for r in allowed_roles)

    async def _check(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
        try:
            payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        except jwt.ExpiredSignatureError:
            raise HTTPException(status_code=401, detail="Token has expired")
        except jwt.PyJWTError:
            raise HTTPException(status_code=401, detail="Invalid token")
        if payload.get("is_super_admin"):
            return payload
        role = (payload.get("role_id") or "member").strip().lower()
        if _ROLE_RANK.get(role, 0) < min_rank:
            raise HTTPException(
                status_code=403,
                detail=f"Insufficient permissions. Required: {' or '.join(allowed_roles)}. Your role: '{role}'.",
            )
        return payload

    return _check


# ============== WORKSPACE & INTELLIGENCE INTEGRATION ==============

async def create_workspace_task(db, task_data: dict):
    """Create a task in workspace from workflow"""
    task_id = f"TASK-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    # Default to demo user if no assignee specified
    assigned_user = task_data.get("assigned_to_user") or "user_demo_legacy"
    created_by = task_data.get("created_by") or "user_demo_legacy"
    
    task_doc = {
        "task_id": task_id,
        "context_id": task_data.get("context_id", f"CTX-{uuid.uuid4().hex[:8].upper()}"),
        "task_type": task_data.get("task_type", "action"),
        "title": task_data.get("title", "Workflow Task"),
        "description": task_data.get("description", ""),
        "assigned_to_user": assigned_user,
        "assigned_to_role": task_data.get("assigned_to_role"),
        "due_at": task_data.get("due_at"),
        "priority": task_data.get("priority", "medium"),
        "status": "open",  # Must be: open, in_progress, completed, blocked
        "visibility_scope": "internal_only",
        "source": "system",  # Must be: manual, system, escalation
        "created_by": created_by,
        "created_at": now,
        "updated_at": now,
        "completed_at": None,
        "completed_by": None,
        "notes": task_data.get("notes"),
        "workflow_ref": task_data.get("workflow_ref")
    }
    
    await db.workspace_tasks.insert_one(task_doc)
    return task_id


async def create_workspace_approval(db, approval_data: dict):
    """Create an approval in workspace from workflow"""
    approval_id = f"APPR-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    # Default to demo user if no approver specified
    approver_user = approval_data.get("approver_user") or "user_demo_legacy"
    requested_by = approval_data.get("requested_by") or "user_demo_legacy"
    
    approval_doc = {
        "approval_id": approval_id,
        "context_id": approval_data.get("context_id", f"CTX-{uuid.uuid4().hex[:8].upper()}"),
        "linked_task_id": approval_data.get("linked_task_id"),
        "approval_type": approval_data.get("approval_type", "deal_approval"),
        "title": approval_data.get("title", "Workflow Approval"),
        "description": approval_data.get("description", ""),
        "approver_role": approval_data.get("approver_role"),
        "approver_user": approver_user,
        "decision": "pending",
        "decision_reason": None,
        "decided_at": None,
        "decided_by": None,
        "context_snapshot": approval_data.get("context_snapshot"),
        "requested_by": requested_by,
        "created_at": now,
        "due_at": approval_data.get("due_at"),
        "priority": approval_data.get("priority", "high"),
        "workflow_ref": approval_data.get("workflow_ref")
    }
    
    await db.workspace_approvals.insert_one(approval_doc)
    return approval_id


async def create_intelligence_signal(db, signal_data: dict):
    """Create a signal in intelligence module from workflow"""
    signal_id = f"SIG-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    signal_doc = {
        "signal_id": signal_id,
        "org_id": signal_data.get("org_id", "org_demo_legacy"),
        "source_solution": "commerce",
        "source_module": signal_data.get("category", "workflow"),
        "signal_type": signal_data.get("type", "info"),
        "severity": signal_data.get("severity", "info"),
        "entity_reference": signal_data.get("context_id"),
        "entity_type": signal_data.get("context_type", "workflow"),
        "title": signal_data.get("title", "Workflow Signal"),
        "description": signal_data.get("message", ""),
        "detected_at": now,
        "created_by": "workflow_engine",
        "acknowledged": False,
        "metadata": signal_data.get("metadata", {})
    }
    
    # Write to intel_signals collection (used by Intelligence API)
    await db.intel_signals.insert_one(signal_doc)
    return signal_id


async def create_activity_record(db, activity_data: dict):
    """Create an activity record for the activity feed"""
    activity_id = f"ACT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    activity_doc = {
        "activity_id": activity_id,
        "org_id": activity_data.get("org_id"),
        "user_id": activity_data.get("user_id", "system"),
        "user_name": activity_data.get("user_name", "System"),
        "action": activity_data.get("action", "created"),
        "entity_type": activity_data.get("entity_type", "workflow"),
        "entity_id": activity_data.get("entity_id"),
        "entity_name": activity_data.get("entity_name", ""),
        "description": activity_data.get("description", ""),
        "module": activity_data.get("module", "commerce"),
        "metadata": activity_data.get("metadata", {}),
        "timestamp": now,  # For activity_feed collection
        "created_at": now   # For activities collection
    }
    
    # Store in both collections for compatibility
    await db.activity_feed.insert_one(activity_doc.copy())
    await db.activities.insert_one(activity_doc)
    return activity_id

# Get database dependency
def get_db():
    from main import db
    return db

# ============== ENUMS ==============

class LeadStage(str, Enum):
    IMPORTED = "imported"
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"


class MainStage(str, Enum):
    LEAD = "lead"
    EVALUATE = "evaluate"
    COMMIT = "commit"
    CONTRACT = "contract"
    HANDOFF = "handoff"


class EvaluateStage(str, Enum):
    EXPLORE = "explore"
    DEFINE = "define"
    FIT = "fit"
    SCOPE = "scope"
    PROPOSE = "propose"

class EvaluationStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    APPROVED = "approved"
    APPROVAL_REQUIRED = "approval_required"
    BLOCKED = "blocked"

class CommitStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    APPROVED = "approved"
    REJECTED = "rejected"

class ContractStage(str, Enum):
    DRAFT = "Draft"
    REVIEW = "Review"
    SEND = "Send"
    SIGN = "Sign"

class ContractStatus(str, Enum):
    ACTIVE = "Active"
    SIGNED = "Signed"
    REJECTED = "Rejected"
    CANCELLED = "Cancelled"

class HandoffStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"

class ProcureRequestStatus(str, Enum):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    CANCELLED = "cancelled"

# ============== REVENUE MODELS ==============

class RevenueLeadCreate(BaseModel):
    """Lead Stage - Capture commercial interest only"""
    company_name: str
    website: Optional[str] = None
    country: str
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    industry: Optional[str] = None
    # Primary Contact
    contact_name: str
    contact_email: str
    contact_phone: Optional[str] = None
    # Lead Metadata
    lead_source: str = "inbound"  # inbound, outbound, linkedin, referral, website, etc.
    estimated_deal_value: Optional[float] = 0
    expected_timeline: str = "3-6 months"  # 0-3, 3-6, 6-12 months
    owner_id: Optional[str] = None
    # Qualification Checklist
    problem_identified: Optional[bool] = False
    budget_mentioned: Optional[str] = "unknown"  # yes, no, unknown
    authority_known: Optional[bool] = False
    need_timeline: Optional[bool] = False
    # Structured Qualification model (hidden from UI, stored to DB)
    qualification: Optional[Dict[str, Any]] = None
    # Notes
    notes: Optional[str] = None

class RevenueActivityCreate(BaseModel):
    """Log manual activity (call, email, meeting, note)"""
    type: str
    summary: str
    subject: Optional[str] = None
    body_text: Optional[str] = None
    body_html: Optional[str] = None
    from_email: Optional[str] = None
    to_email: Optional[str] = None

class RevenueStatusUpdate(BaseModel):
    """Gated status update with force option"""
    status: str
    force: bool = False

class RevenueEvaluationSingleItemCreate(BaseModel):
    catalog_item_id: str
    quantity: int = Field(default=1, gt=0)
    discount: float = Field(default=0, ge=0)
    notes: Optional[str] = None
    manual_cost: Optional[float] = Field(None, ge=0)
    override_reason: Optional[str] = None

class RevenueEvaluationItemUpdate(BaseModel):
    # Canonical
    quantity: Optional[int] = Field(None, gt=0)
    unit_price: Optional[float] = Field(None, ge=0)
    cost_price: Optional[float] = Field(None, ge=0)
    discount: Optional[float] = Field(None, ge=0)
    
    # Legacy / Aliases for normalization
    expected_cost: Optional[float] = Field(None, ge=0)
    net_price: Optional[float] = Field(None, ge=0)
    line_total: Optional[float] = Field(None, ge=0)
    gross_margin_percent: Optional[float] = Field(None, ge=0)
    
    # Other
    notes: Optional[str] = None
    estimated_cost: Optional[float] = Field(None, ge=0) # existing legacy field

class RevenueEvaluationUpdate(BaseModel):
    opportunity_name: Optional[str] = None
    opportunity_value: Optional[float] = None
    expected_close_date: Optional[date] = None
    payment_terms: Optional[str] = None
    commercial_notes: Optional[str] = None
    internal_notes: Optional[str] = None
    items: Optional[List[Dict[str, Any]]] = None # Use dict to allow flexibility during migration
    total_value: Optional[float] = None
    gross_margin_percent: Optional[float] = None
    evaluation_scope: Optional[Dict[str, Any]] = None
    evaluation_costs: Optional[List[Dict[str, Any]]] = None
class RevenueEvaluationStatusUpdate(BaseModel):
    status: str = Field(..., description="Target status: draft, in_progress, in_review, ready_for_commit, approved, rejected")

class RevenueEvaluationItemCreate(BaseModel):
    item_id: str
    quantity: int = Field(default=1, gt=0)
    discount_percent: float = Field(default=0, ge=0, le=100)

class RevenueEvaluationItem(BaseModel):
    """Item in evaluation with full financial audit fields"""
    item_id: str
    item_name: str
    quantity: int = Field(default=1, gt=0)
    unit_price: float = Field(default=0, ge=0)
    discount_percent: float = Field(default=0, ge=0, le=100)
    
    # Financial Engine Fields
    total_price: float = 0
    total_cost: float = 0
    gross_margin: float = 0
    margin_percent: float = 0
    line_total: float = 0
    
    # Audit & Provenance
    cost_price: float = 0
    discount: float = 0
    cost_source: str = "manual"
    price_source: str = "manual"
    original_catalog_cost: Optional[float] = None
    overridden_cost: Optional[float] = None
    override_reason: Optional[str] = None
    override_flag: bool = False
    
    # Legacy fallbacks
    net_price: float = Field(default=0, ge=0)
    expected_cost: float = Field(default=0, ge=0)

class RevenueEvaluationCreate(BaseModel):
    """Evaluate Stage - Commercial viability check"""
    lead_id: str
    party_id: Optional[str] = None
    # Deal Structure
    deal_type: str = "one-time"  # one-time, subscription, project
    currency: str = "INR"
    region: Optional[str] = None
    contract_duration_months: Optional[int] = 12
    # Items
    items: List[RevenueEvaluationItem] = []
    # Calculated values (auto-computed)
    total_value: Optional[float] = 0
    gross_margin_percent: Optional[float] = 0
    # Risk Assessment (auto-calculated)
    party_risk_score: Optional[int] = 0
    deal_size_risk: Optional[str] = "low"
    geography_risk: Optional[str] = "low"
    concentration_risk: Optional[str] = "low"
    # Result
    policy_flags: List[str] = []
    approval_required: Optional[bool] = False

class LegalProfilePayload(BaseModel):
    """Payload for updating legal profile"""
    registeredName: str
    gst: str
    pan: str
    address: str
    verifiedAt: Optional[str] = None

class RevenueCommitCreate(BaseModel):
    """Commit Stage - Authority enforcement"""
    evaluation_id: str
    # Approval Matrix
    approvers: List[Dict[str, Any]] = []
    approval_reason: Optional[str] = None
    notes: Optional[str] = None

class RevenueContractCreate(BaseModel):
    """Contract Stage - Legal freeze"""
    commit_id: str
    # Contract Details (auto-filled from evaluation)
    party_name: Optional[str] = None
    party_id: Optional[str] = None
    # Terms
    payment_terms: str = "net-30"
    special_terms: Optional[str] = None
    legal_clauses: Optional[str] = None
    # Contract value
    total_value: Optional[float] = 0

class RevenueHandoffCreate(BaseModel):
    """Handoff Stage - Execution trigger"""
    contract_id: str
    finance_notes: Optional[str] = None

# --- EVALUATE SUBSYSTEM MODELS ---
class EvaluationScope(BaseModel):
    scope_id: str
    evaluation_id: str
    deliverables: str = ""
    timeline: str = ""
    assumptions: Optional[str] = None
    dependencies: Optional[str] = None
    created_at: str
    updated_at: str

class EvaluationCost(BaseModel):
    cost_id: str
    evaluation_id: str
    category: str  # labor, infrastructure, vendor, other
    description: str
    amount: float
    created_at: str
    updated_at: str

class EvaluationRisk(BaseModel):
    risk_id: str
    evaluation_id: str
    category: str  # customer, operational, commercial, financial
    risk_score: float
    reason: str
    mitigation: Optional[str] = None
    created_at: str
    updated_at: str

class EvaluationActivity(BaseModel):
    activity_id: str
    evaluation_id: str
    action: str
    performed_by: str
    timestamp: str
    details: Optional[Dict[str, Any]] = None


class EvaluationData(BaseModel):
    """Structured evaluation data for multi-stage workflow"""
    explore: Dict[str, Any] = Field(default_factory=lambda: {
        "problem_statement": "",
        "business_goal": "",
        "stakeholder_status": ""
    })
    define: Dict[str, Any] = Field(default_factory=lambda: {
        "solution_type": "",
        "estimated_users": 0,
        "departments": [],
        "complexity": "low"
    })
    fit: Dict[str, Any] = Field(default_factory=lambda: {
        "product_interest": "",
        "demo_completed": False,
        "client_feedback": ""
    })
    scope: Dict[str, Any] = Field(default_factory=lambda: {
        "deal_size": 0.0,
        "timeline": "",
        "decision_maker": "",
        "budget": "unknown"
    })
    propose: Dict[str, Any] = Field(default_factory=lambda: {
        "proposed_product": "",
        "proposal_quantity": 1,
        "proposal_sent_date": None,
        "client_status": "pending"
    })


class EvaluateStageUpdate(BaseModel):
    evaluate_stage: EvaluateStage


class CommitStageUpdate(BaseModel):
    commit_stage: str


class EvaluationDataUpdate(BaseModel):
    stage: EvaluateStage
    data: Dict[str, Any]

class CommitPricingUpdate(BaseModel):
    """Payload for saving pricing data in the Commit/Price sub-stage."""
    unit_price: float = Field(..., ge=0)
    discount: float = Field(0.0, ge=0, le=100)
    # Fallback cost-per-unit if not available in evaluate items
    # cost_per_unit is now required to ensure safe margin calculations
    cost_per_unit: float = Field(..., ge=0)


class CommitApprovalAction(BaseModel):
    """Payload for submitting an approval decision in Commit/Approve sub-stage."""
    action: str       # approve | reject | request_change
    approver_id: str
    approval_note: Optional[str] = None


# ============== PROCUREMENT MODELS ==============

class ProcureRequestCreate(BaseModel):
    """Procure Stage - Purchase intent capture"""
    # Request Basics
    title: str
    description: str
    request_type: str = "goods"  # goods, services, project, subscription
    priority: str = "medium"  # low, medium, high, critical
    needed_by_date: Optional[str] = None
    # Requestor Info
    requesting_department: str
    cost_center: str
    project_code: Optional[str] = None
    owner_id: Optional[str] = None
    # Estimated Spend
    estimated_cost: float = 0
    is_recurring: bool = False
    notes: Optional[str] = None

class ProcureEvaluationItem(BaseModel):
    """Item in procurement evaluation"""
    description: str
    quantity: int = 1
    unit_cost: float = 0
    total_cost: float = 0
    expected_delivery: Optional[str] = None

class ProcureEvaluationCreate(BaseModel):
    """Procurement Evaluate Stage - Cost & Risk check"""
    request_id: str
    vendor_id: Optional[str] = None
    # Vendor Info
    vendor_status: str = "draft"  # draft, verified
    vendor_legal_ok: bool = False
    vendor_tax_ok: bool = False
    vendor_compliance_ok: bool = False
    # Items/Scope
    items: List[ProcureEvaluationItem] = []
    # Cost & Budget
    total_cost: float = 0
    budget_available: float = 0
    budget_variance: float = 0
    # Risk Assessment
    vendor_risk_score: int = 0
    dependency_risk: str = "low"
    geography_risk: str = "low"
    spend_concentration_risk: str = "low"
    # Result
    policy_flags: List[str] = []
    approval_required: bool = False

class ProcureCommitCreate(BaseModel):
    """Procurement Commit Stage - Authority & Budget enforcement"""
    evaluation_id: str
    approvers: List[Dict[str, Any]] = []
    approval_reason: Optional[str] = None
    notes: Optional[str] = None

class ProcureContractCreate(BaseModel):
    """Procurement Contract Stage - Legal freeze"""
    commit_id: str
    vendor_name: Optional[str] = None
    vendor_id: Optional[str] = None
    # Terms
    payment_terms: str = "net-30"
    delivery_terms: Optional[str] = None
    sla_terms: Optional[str] = None
    penalty_clauses: Optional[str] = None
    total_value: float = 0

class ProcureHandoffCreate(BaseModel):
    """Procurement Handoff Stage - Execution trigger"""
    contract_id: str
    operations_notes: Optional[str] = None
    finance_notes: Optional[str] = None

# ============== MOCK SERVICES ==============

async def cleartax_verify_gstin(gstin: str) -> Dict[str, Any]:
    """Verify GSTIN using ClearTax API with safe response-shape handling"""
    if not ENABLE_CLEARTAX_GST_VERIFY:
        return {
            "verified": False,
            "source": "cleartax",
            "reason": ["ClearTax verification disabled"],
            "raw": None,
        }

    url = f"{CLEARTAX_HOST}/gst/api/v0.2/taxable_entities/{CLEARTAX_TAXABLE_ENTITY_ID}/gstin_verification"
    headers = {"X-Cleartax-Auth-Token": CLEARTAX_AUTH_TOKEN}
    params = {"gstin": gstin}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers, params=params)

        status_code = response.status_code
        raw_data = response.json()

        logger.info(f"[CLEARTAX_VERIFY] raw_data_type={type(raw_data).__name__} raw_data={raw_data}")

        normalized = None

        if isinstance(raw_data, dict):
            normalized = raw_data
        elif isinstance(raw_data, list):
            if raw_data and isinstance(raw_data[0], dict):
                normalized = raw_data[0]
            else:
                return {
                    "verified": False,
                    "source": "cleartax",
                    "reason": ["Unexpected ClearTax response format: list"],
                    "raw": raw_data,
                }
        else:
            return {
                "verified": False,
                "source": "cleartax",
                "reason": [f"Unexpected ClearTax response format: {type(raw_data).__name__}"],
                "raw": raw_data,
            }

        data_node = (
            normalized.get("data")
            or normalized.get("result")
            or normalized.get("payload")
            or normalized
        )

        if isinstance(data_node, list):
            if data_node and isinstance(data_node[0], dict):
                data_node = data_node[0]
            else:
                return {
                    "verified": False,
                    "source": "cleartax",
                    "reason": ["Unexpected ClearTax nested response format"],
                    "raw": raw_data,
                }

        if not isinstance(data_node, dict):
            return {
                "verified": False,
                "source": "cleartax",
                "reason": ["Unexpected ClearTax normalized payload format"],
                "raw": raw_data,
            }

        sts = str(data_node.get("sts") or data_node.get("status") or "").lower()

        is_active = "active" in sts
        is_blocked = any(x in sts for x in ["cancel", "suspend", "inactive"])
        verified = is_active and not is_blocked

        logger.info(
            f"[CLEARTAX_VERIFY] gstin={gstin}, http_status={status_code}, extracted_sts='{sts}', verified={verified}"
        )

        return {
            "verified": verified,
            "gstin": gstin,
            "sts": sts,
            "lgnm": data_node.get("lgnm"),
            "tradeNam": data_node.get("tradeNam"),
            "pradr": data_node.get("pradr"),
            "rgdt": data_node.get("rgdt"),
            "cxdt": data_node.get("cxdt"),
            "source": "cleartax",
            "raw": raw_data,
        }

    except Exception as e:
        logger.error(f"ClearTax verification failed: {str(e)}")
        return {
            "verified": False,
            "source": "cleartax",
            "reason": [f"API Error: {str(e)}"],
            "raw": None,
        }
async def validate_party_readiness(party_id: str, db) -> Dict[str, Any]:
    """Fetch actual party readiness from DB with strict validation (PROMPT A)"""
    # 1) If party_id is missing: return draft, all flags False, risk_score 0, risk_reasons []
    if not party_id:
        return {
            "party_id": None,
            "status": "draft",
            "legal_ok": False,
            "tax_ok": False,
            "compliance_ok": False,
            "risk_score": 0,
            "risk_reasons": []
        }
    
    # 2) Query Mongo collection
    party = await db.revenue_workflow_parties.find_one({"party_id": party_id})
    
    if not party:
        return {
            "party_id": party_id,
            "status": "draft",
            "legal_ok": False,
            "tax_ok": False,
            "compliance_ok": False,
            "risk_score": 0,
            "risk_reasons": ["Party document not found"]
        }
    
    logger.info(f"[DEBUG_READINESS] Processing party_id={party_id}")
    if not isinstance(party, dict):
        party = {}
    
    # 3) legal_ok logic MUST be strict: legal_profile.status == "verified" OR legal_ok == True
    legal_profile = party.get("legal_profile") or {}
    logger.info(f"[DEBUG_READINESS] type(legal_profile)={type(legal_profile)}")
    
    if isinstance(legal_profile, list):
        legal_profile = legal_profile[0] if legal_profile and isinstance(legal_profile[0], dict) else {}
    elif not isinstance(legal_profile, dict):
        legal_profile = {}
        
    legal_ok = bool((legal_profile.get("status") == "verified") or (party.get("legal_ok") is True))
    
    # 4) tax_ok and compliance_ok come ONLY from DB
    tax_ok = bool(party.get("tax_ok", False))
    compliance_ok = bool(party.get("compliance_ok", False))
    
    # 5) status must be computed: "verified" only if (legal_ok and tax_ok and compliance_ok) else "draft"
    status = "verified" if (legal_ok and tax_ok and compliance_ok) else "draft"
    
    # 6) risk_score and risk_reasons come from DB, default 0 and []
    risk_score = party.get("risk_score", 0)
    risk_reasons = party.get("risk_reasons", [])
    
    # 5) Add a one-line debug log (temporary) for verification
    logger.info(f"[DEBUG_READINESS] party_id={party_id}, legal_ok={legal_ok}, status={status}")
    
    # 7) Return consistent keys
    return {
        "party_id": party_id,
        "status": status,
        "legal_ok": legal_ok,
        "tax_ok": tax_ok,
        "compliance_ok": compliance_ok,
        "risk_score": risk_score,
        "risk_reasons": risk_reasons
    }

async def validate_budget(cost_center: str, amount: float, db) -> Dict[str, Any]:
    """Mock budget validation"""
    # Mock budget service
    mock_budgets = {
        "TECH": 5000000,
        "SALES": 3000000,
        "OPS": 2000000,
        "HR": 1000000,
        "DEFAULT": 1000000
    }
    budget_available = mock_budgets.get(cost_center.upper(), mock_budgets["DEFAULT"])
    return {
        "cost_center": cost_center,
        "budget_available": budget_available,
        "amount_requested": amount,
        "variance": budget_available - amount,
        "within_budget": amount <= budget_available
    }

async def calculate_risk_score(data: Dict) -> Dict[str, Any]:
    """Calculate risk scores based on deal/vendor data"""
    score = 20  # Base score
    
    size_risk = "low"
    geo_risk = "low"
    
    try:
        # Deal size risk
        deal_value = float(data.get("total_value", 0) or data.get("total_cost", 0) or 0)
        if deal_value > 10000000:
            score += 30
            size_risk = "high"
        elif deal_value > 1000000:
            score += 15
            size_risk = "medium"
            
        # Geography risk
        region = data.get("region", "")
        if region and str(region).lower() in ["international", "export"]:
            score += 20
            geo_risk = "high"
            
    except Exception as e:
        logger.warning(f"Error calculating risk score: {str(e)}. Using safe defaults.")
    
    return {
        "total_score": min(score, 100),
        "deal_size_risk": size_risk,
        "geography_risk": geo_risk,
        "concentration_risk": "low"
    }

def calculate_approval_matrix(data: Dict) -> List[Dict]:
    """Determine required approvers based on governance rules"""
    approvers = []
    deal_value = data.get("total_value", 0) or data.get("total_cost", 0) or 0
    margin = data.get("gross_margin_percent", 100)
    risk_score = data.get("risk_score", 0)
    
    # Deal value rules
    if deal_value > 10000000:  # > 1 Cr
        approvers.append({"role": "CFO", "reason": "Deal value exceeds ₹1 Crore"})
    elif deal_value > 5000000:  # > 50L
        approvers.append({"role": "Finance Head", "reason": "Deal value exceeds ₹50 Lakhs"})
    elif deal_value > 1000000:  # > 10L
        approvers.append({"role": "Department Head", "reason": "Deal value exceeds ₹10 Lakhs"})
    
    # Margin rules (for revenue)
    if margin < 15:
        approvers.append({"role": "CFO", "reason": "Margin below 15% hard floor"})
    elif margin < 25:
        approvers.append({"role": "Finance Head", "reason": "Margin below 25% soft floor"})
    
    # Risk rules
    if risk_score > 70:
        approvers.append({"role": "CRO", "reason": "Risk score exceeds 70"})
    elif risk_score > 50:
        approvers.append({"role": "Risk Manager", "reason": "Risk score exceeds 50"})
    
    return approvers

# ============== REVENUE WORKFLOW ROUTES ==============

# --- LEAD STAGE ---

# ICP target definitions — adjust to match your business domain
_ICP_TARGET_INDUSTRIES = {"Manufacturing", "Retail", "Logistics", "E-commerce", "FMCG", "Auto", "Pharma"}
_ICP_TARGET_SIZES = {"50-200", "200-500", "500+", "50-200 employees", "200-500 employees", "500+ employees"}


def _compute_lead_fields(lead: dict) -> dict:
    """Attach _computed block to a lead dict (rule-based, no ML)."""
    now = datetime.now(timezone.utc)

    # --- Age (days since created_at) ---
    raw_created = lead.get("created_at")
    try:
        created_dt = datetime.fromisoformat(str(raw_created).replace("Z", "+00:00"))
        if created_dt.tzinfo is None:
            created_dt = created_dt.replace(tzinfo=timezone.utc)
    except Exception:
        created_dt = now
    age_days = max(0, (now - created_dt).days)

    # --- Health (based on inactivity: last_activity_at, fallback created_at) ---
    raw_activity = lead.get("last_activity_at") or raw_created
    try:
        activity_dt = datetime.fromisoformat(str(raw_activity).replace("Z", "+00:00"))
        if activity_dt.tzinfo is None:
            activity_dt = activity_dt.replace(tzinfo=timezone.utc)
    except Exception:
        activity_dt = created_dt
    inactive_days = max(0, (now - activity_dt).days)

    if inactive_days <= 5:
        health = "green"
    elif inactive_days <= 10:
        health = "yellow"
    else:
        health = "red"

    # --- ICP Fit (rule-based: industry + company_size) ---
    industry = str(lead.get("industry") or "").strip()
    company_size = str(lead.get("company_size") or "").strip()
    icp_score = (
        (1 if industry in _ICP_TARGET_INDUSTRIES else 0) +
        (1 if company_size in _ICP_TARGET_SIZES else 0)
    )
    icp_fit = "Strong" if icp_score == 2 else ("Medium" if icp_score == 1 else "Weak")

    # Resolve Main Stage & Sub-stage (Stage-Aware) from canonical 'stage' field
    raw_stage = str(lead.get("stage") or lead.get("main_stage") or "new").lower()
    
    # Map sub-stage-as-stage (legacy) to groups
    if raw_stage == "qualified":
        main_stage = "evaluate"
        sub_stage = _normalize_evaluate_stage(lead.get("evaluate_stage") or "explore")
    elif raw_stage in ["new", "contacted", "disqualified", "imported", "proposal_sent"]:
        main_stage = "lead"
        sub_stage = raw_stage
    else:
        # Use stage as main_stage, resolve specific sub-stage
        main_stage = raw_stage
        if main_stage == "lead":
             sub_stage = lead.get("lead_stage") or "new"
        elif main_stage == "evaluate":
            sub_stage = _normalize_evaluate_stage(lead.get("evaluate_stage") or "explore")
        elif main_stage == "commit":
            sub_stage = lead.get("commit_stage") or "review"
        elif main_stage == "contract":
            sub_stage = (lead.get("contract_data") or {}).get("status") or "draft"
        elif main_stage == "handoff":
            sub_stage = (lead.get("handoff_at") or {}).get("status") or "pending"
        else:
            sub_stage = raw_stage

    # Response-level normalization: attach main_stage for frontend compatibility (not persisted)
    lead["main_stage"] = main_stage

    # Extract Stage Data for summary
    eval_data = _normalize_evaluation_dict(lead.get("evaluation_data") or {})
    commit_data = lead.get("commit_data") or {}
    pricing = commit_data.get("pricing") or {}
    
    lead["_pipeline"] = {
        "main_stage": main_stage,
        "sub_stage": sub_stage,
        "product": eval_data.get("propose", {}).get("proposed_product") or lead.get("product_interest") or "—",
        "quantity": eval_data.get("propose", {}).get("proposal_quantity") or pricing.get("quantity_used") or 0,
        "deal_value": pricing.get("total_value") or lead.get("estimated_deal_value") or 0,
        "unit_price": pricing.get("unit_price"),
        "discount": pricing.get("discount"),
        "margin": pricing.get("margin"),
        "risk_score": commit_data.get("risk", {}).get("risk_score"),
        "approval_status": commit_data.get("approval", {}).get("approval_status"),
        "timeline": eval_data.get("scope", {}).get("timeline") or "—",
        "decision_maker": eval_data.get("scope", {}).get("decision_maker") or "—"
    }

    lead["_computed"] = {
        "age_days": age_days,
        "inactive_days": inactive_days,
        "health": health,
        "icp_fit": icp_fit,
    }
    # Keep top-level age_days for backward compat
    lead["age_days"] = age_days
    return lead


def _extract_signals(summaries: List[str]) -> Dict[str, Any]:
    """Scan all activity summaries for BANT-style keyword signals (Rule-based)."""
    text = " ".join(summaries).lower()

    # Budget signal
    budget = "unknown"
    if any(kw in text for kw in ["budget confirmed", "budget approved", "has budget", "budget available"]):
        budget = "yes"
    elif any(kw in text for kw in ["no budget", "budget not confirmed", "budget rejected", "cannot afford"]):
        budget = "no"

    # Authority known
    auth = any(kw in text for kw in [
        "decision maker", "operations head", "ceo", "founder",
        "cto", "managing director", "md ", "director", "head of"
    ])

    # Interest level
    interest = "low"
    if any(kw in text for kw in ["very interested", "demo scheduled", "positive", "keen"]):
        interest = "high"
    elif any(kw in text for kw in ["interested", "follow up", "demo", "curious"]):
        interest = "medium"

    return {
        "budget_signal": budget,
        "authority_known": auth,
        "interest_level": interest,
        "last_signal_update_at": datetime.now(timezone.utc).isoformat()
    }


def _build_warnings(signals: Dict[str, Any]) -> List[str]:
    """Generate advisory warnings based on extracted signals."""
    warnings = []
    if signals.get("budget_signal") in ("no", "unknown"):
        warnings.append("Budget not clearly discussed or confirmed")
    if not signals.get("authority_known"):
        warnings.append("Primary decision maker (Authority) not yet identified")
    if signals.get("interest_level") == "low":
        warnings.append("Low buyer interest level detected from summaries")
    return warnings


@router.get("/revenue/leads")
async def get_revenue_leads(
    stage: Optional[str] = None,
    owner_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all revenue leads with optional filters. Each lead includes _computed fields:
    _computed.age_days, _computed.inactive_days, _computed.health, _computed.icp_fit"""
    query = {"org_id": current_user.org_id}
    if stage:
        query["stage"] = stage
    if owner_id:
        query["owner_id"] = owner_id

    leads = await db.revenue_workflow_leads.find(query, {"_id": 0}).to_list(1000)

    # Attach computed fields (rule-based, no ML)
    leads = [_compute_lead_fields(lead) for lead in leads]

    return {"success": True, "leads": leads, "count": len(leads)}

@router.post("/revenue/leads", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def create_revenue_lead(
    lead: RevenueLeadCreate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Create a new revenue lead - Stage 1"""
    data = lead.dict()
    
    # ── Owner Assignment (from token) ────────────────────────────────────────
    # Default fallback if no token
    owner_id = data.get("owner_id") or current_user.user_id
    owner_name = current_user.full_name or "Unassigned"
    owner_email = current_user.email
    org_id = current_user.org_id

    data["owner_id"] = owner_id
    data["owner_name"] = owner_name
    data["owner_email"] = owner_email
    data["org_id"] = org_id

    data["lead_id"] = f"REV-LEAD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["stage"] = LeadStage.NEW.value
    now_iso = datetime.now(timezone.utc).isoformat()
    data["created_at"] = now_iso
    data["updated_at"] = now_iso
    # ── New: set last_activity_at to creation time so inactivity starts at 0 ──
    data["last_activity_at"] = now_iso
    data["next_action"] = "Initial contact"

    # ── Compute health/ICP at creation time (health will always be green on day 0) ──
    data["_computed"] = _compute_lead_fields(dict(data))["_computed"]
    data["age_days"] = 0  # backward compat

    await db.revenue_workflow_leads.insert_one(data)
    
    # Create workspace task for follow-up
    await create_workspace_task(db, {
        "context_id": data["lead_id"],
        "task_type": "action",
        "title": f"Initial Contact: {data.get('company_name')}",
        "description": f"Reach out to {data.get('contact_name')} at {data.get('company_name')} - Estimated value: ₹{data.get('estimated_deal_value', 0):,.0f}",
        "assigned_to_user": data.get("owner_id"),
        "priority": "high" if data.get("estimated_deal_value", 0) > 1000000 else "medium",
        "source": "revenue_workflow",
        "workflow_ref": {"type": "lead", "id": data["lead_id"], "stage": "new"},
        "created_by": current_user.user_id
    })
    
    # Create intelligence signal for new lead
    await create_intelligence_signal(db, {
        "type": "opportunity",
        "category": "revenue",
        "title": f"New Lead: {data.get('company_name')}",
        "message": f"New revenue opportunity from {data.get('lead_source')} - Est. value ₹{data.get('estimated_deal_value', 0):,.0f}",
        "severity": "low",
        "source": "workflow_engine",
        "context_type": "revenue_lead",
        "context_id": data["lead_id"],
        "metadata": {"company": data.get("company_name"), "value": data.get("estimated_deal_value")},
        "org_id": org_id
    })
    
    # Create activity record
    await create_activity_record(db, {
        "action": "created",
        "entity_type": "lead",
        "entity_id": data["lead_id"],
        "entity_name": data.get("company_name"),
        "description": f"New lead created: {data.get('company_name')} - ₹{data.get('estimated_deal_value', 0):,.0f}",
        "module": "commerce"
    })

    # ── Audit entry for creation ─────────────────────────────────────────────
    await db.revenue_workflow_audits.insert_one({
        "lead_id":   data["lead_id"],
        "action":    "created",
        "actor":     data.get("owner_id"),
        "timestamp": now_iso,
    })

    return {"success": True, "message": "Lead created", "lead_id": data["lead_id"]}


# ══════════════════════════════════════════════════════════════════════════════
# IMPORT LEADS  —  Preview + Commit
# Routes placed before /enrich and /{lead_id} to avoid path-shadow ambiguity.
# ══════════════════════════════════════════════════════════════════════════════

import csv as _csv
import io  as _io
import time as _time
from urllib.parse import urlparse as _urlparse

# ── Industry keyword dictionary (rule-based, no ML) ───────────────────────────
_INDUSTRY_KEYWORDS: dict[str, list[str]] = {
    "Logistics":          ["logistics", "cargo", "freight", "transport", "courier", "shipping", "dispatch", "warehousing"],
    "Manufacturing":      ["manufacturing", "factory", "industries", "fabrication", "forge", "casting", "steel", "plant", "mills"],
    "Retail":             ["retail", "mart", "store", "shop", "supermarket", "bazaar", "wholesale", "ecommerce"],
    "Technology":         ["tech", "software", "digital", "systems", "solutions", "infotech", "cyber", "saas", "cloud", "ai"],
    "Healthcare":         ["health", "hospital", "pharma", "medical", "clinic", "biotech", "diagnostics", "medsys"],
    "Financial Services": ["finance", "financial", "capital", "bank", "fund", "invest", "fintech", "credit", "insurance"],
    "Construction":       ["construction", "builders", "infra", "infrastructure", "realty", "housing", "estate"],
    "Education":          ["education", "academy", "school", "college", "learning", "institute", "tutor", "edtech"],
    "Telecommunications": ["telecom", "networks", "wireless", "broadband", "mobile", "communications"],
    "Media":              ["media", "publishing", "broadcast", "news", "entertainment", "studios", "films"],
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def _norm_name(name: str) -> str:
    """Lowercase, strip legal suffixes and punctuation — used as dedup key."""
    import re as _re
    s = name.lower().strip()
    s = _re.sub(r"[^a-z0-9 ]", " ", s)
    s = _re.sub(r"\b(pvt|ltd|llp|inc|corp|private|limited|llc|co)\b", " ", s)
    return _re.sub(r"\s+", " ", s).strip()

def _extract_domain(url: str) -> str | None:
    """Return bare domain (no www, no port) or None."""
    if not url:
        return None
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    try:
        host = _urlparse(url).hostname or ""
        return host.removeprefix("www.").lower() or None
    except Exception:
        return None

def _suggest_industry(company_name: str, website: str) -> tuple[str | None, str]:
    """Scan company_name + domain for keyword hits. Returns (industry, confidence)."""
    text = f"{company_name} {_extract_domain(website) or ''}".lower()
    scores: dict[str, int] = {}
    for industry, kws in _INDUSTRY_KEYWORDS.items():
        hits = sum(1 for kw in kws if kw in text)
        if hits:
            scores[industry] = hits
    if not scores:
        return None, "low"
    best = max(scores, key=lambda k: scores[k])
    conf = "high" if scores[best] >= 2 else "medium"
    return best, conf

def _parse_float(val: str) -> float | None:
    try:
        return float(str(val).replace(",", "").replace("$", "").replace("₹", "").strip())
    except (ValueError, TypeError):
        return None

# ── MongoDB import cache (multi-worker safe) ──────────────────────────────────
# Collection: revenue_workflow_import_cache
# Each doc: {token, rows (list), expires_at (ISO str)}
# TTL: 20 minutes — no index needed; we filter on read.

_IMPORT_TTL_MINUTES = 20

async def _cache_store(db, rows: list) -> str:
    token = f"imp_{uuid.uuid4().hex[:12]}"
    expires_at = datetime.now(timezone.utc).isoformat()
    await db.revenue_workflow_import_cache.insert_one({
        "_token": token,
        "rows":   rows,
        "expires_at": expires_at,
        "_ttl_minutes": _IMPORT_TTL_MINUTES,
        "created_at": datetime.now(timezone.utc).isoformat(),
    })
    return token

async def _cache_load(db, token: str) -> list | None:
    doc = await db.revenue_workflow_import_cache.find_one({"_token": token})
    if not doc:
        return None
    # Check TTL manually
    created = datetime.fromisoformat(doc["created_at"])
    if datetime.now(timezone.utc) > created + timedelta(minutes=_IMPORT_TTL_MINUTES):
        await db.revenue_workflow_import_cache.delete_one({"_token": token})
        return None
    return doc["rows"]

async def _cache_delete(db, token: str):
    await db.revenue_workflow_import_cache.delete_one({"_token": token})

# ── CSV column definitions — single source of truth for import ─────────────────
# User-facing CSV headers.  Mandatory: must be present as header AND non-empty.
_REQUIRED_COLS = {
    "company_name",
    "country",
    "industry",
    "lead_full_name",
    "professional_mail",
    "owner_name",
}
# Optional: may be absent or blank.
_OPTIONAL_COLS = {
    "website",
    "contact_phone",
    "lead_source",
    "estimated_deal_value",
    "expected_timeline",
    "problem_identified",
    "budget_mentioned",
    "authority_known",
    "need_timeline",
    "notes",
}
_ALL_EXPECTED = _REQUIRED_COLS | _OPTIONAL_COLS

# Mapping: CSV header  →  internal DB field name
_CSV_TO_DB = {
    "lead_full_name":    "contact_name",
    "professional_mail":  "contact_email",
    "owner_name":         "owner_id",
    # These map 1-to-1:
    "company_name":       "company_name",
    "country":            "country",
    "industry":           "industry",
}

# Valid enum values for budget_mentioned
_BUDGET_MENTIONED_VALUES = {"available", "no_budget", "unknown"}
# Valid enum values for lead_source
_LEAD_SOURCE_VALUES = {"inbound", "outbound", "referral", "linkedin"}
# Valid enum values for expected_timeline
_TIMELINE_VALUES = {"0-3 months", "3-6 months", "6-12 months", "long_term"}

# ── CSV import template (2 sample rows) ───────────────────────────────────────
_TEMPLATE_HEADERS = [
    "company_name", "country", "industry",
    "lead_full_name", "professional_mail", "owner_name",
    "website", "contact_phone",
    "lead_source", "estimated_deal_value", "expected_timeline",
    "notes",
]
_TEMPLATE_SAMPLE_ROWS = [
    [
        "Acme Corporation", "India", "Manufacturing",
        "John Doe", "john.doe@acme.com", "Rahul Mehta",
        "https://acme.com", "+91-9876543210",
        "inbound", "500000", "3-6 months",
        "Interested in ERP solution. Follow up next week.",
    ],
    [
        "Beta Logistics Pvt Ltd", "India", "Logistics",
        "Priya Sharma", "priya@betalog.in", "Anita Desai",
        "https://betalog.in", "+91-9123456780",
        "referral", "1200000", "6-12 months",
        "Referral from Acme. CFO approved budget.",
    ],
    [
        "Gamma Tech Solutions", "USA", "Technology",
        "Michael Chen", "m.chen@gammatech.io", "Rahul Mehta",
        "https://gammatech.io", "+1-555-0199",
        "linkedin", "800000", "0-3 months",
        "Met at SaaS conference. Very interested in cloud migration.",
    ],
]


# ── Email validator (simple regex, no external deps) ─────────────────────────
import re as _re
_EMAIL_RE = _re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def _norm_bool(val: str) -> bool | None:
    """Normalise truthy / falsy CSV strings to Python bool. Returns None if unparseable."""
    v = val.strip().lower()
    if v in ("true", "yes", "1", "y", "on"):  return True
    if v in ("false", "no", "0", "n", "off", ""):  return False
    return None

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINT 0 — Template CSV download
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

from fastapi.responses import StreamingResponse

@router.get("/revenue/leads/import/template")
async def get_import_template():
    """
    Returns a downloadable CSV template with all importable columns and 2 sample rows.
    Headers stay in sync with _TEMPLATE_HEADERS (same source of truth as validation).
    """
    buf = _io.StringIO()
    writer = _csv.writer(buf)
    writer.writerow(_TEMPLATE_HEADERS)
    for sample_row in _TEMPLATE_SAMPLE_ROWS:
        writer.writerow(sample_row)
    buf.seek(0)

    return StreamingResponse(
        _io.BytesIO(buf.getvalue().encode("utf-8")),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=revenue_leads_import_template.csv"},
    )


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINT 1 — Preview
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/revenue/leads/import/preview", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def import_leads_preview(
    file: UploadFile = File(...),
    db=Depends(get_db),
):
    """
    Parse CSV, run per-row validation, duplicate detection, and industry suggestion.
    Does NOT write to leads DB.
    Returns import_token referencing preview data stored in MongoDB.
    All-or-nothing row validation: if any row is invalid, has_row_errors=True is returned
    so the frontend can block the commit.
    """
    # ── Read & decode ─────────────────────────────────────────────────────────
    raw_bytes = await file.read()
    if not raw_bytes:
        raise HTTPException(400, detail="Uploaded file is empty.")
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = raw_bytes.decode("latin-1")

    reader = _csv.DictReader(_io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(400, detail="CSV is empty or has no header row.")

    # Normalise header names (strip whitespace, lowercase)
    headers = {h.strip().lower() for h in reader.fieldnames}

    # ── Check required headers first (blocks entire import) ───────────────────
    missing_required = _REQUIRED_COLS - headers
    if missing_required:
        raise HTTPException(
            400,
            detail={
                "message": "CSV is missing required columns.",
                "missing": sorted(missing_required),
                "required": sorted(_REQUIRED_COLS),
            },
        )

    raw_rows = list(reader)
    if not raw_rows:
        raise HTTPException(400, detail="CSV has headers but no data rows.")

    # ── Pre-load existing DB leads for duplicate detection ─────────────────────
    existing = await db.revenue_workflow_leads.find(
        {}, {"_id": 0, "lead_id": 1, "contact_email": 1, "email": 1, "website": 1, "company_name": 1}
    ).to_list(10000)

    email_to_lead_id:  dict[str, str] = {}
    domain_to_lead_id: dict[str, str] = {}
    name_to_lead_id:   dict[str, str] = {}

    for ex in existing:
        lid = ex.get("lead_id", "")
        em  = (ex.get("contact_email") or ex.get("email") or "").lower().strip()
        dom = _extract_domain(ex.get("website") or "")
        nm  = _norm_name(ex.get("company_name") or "")
        if em:  email_to_lead_id[em]   = lid
        if dom: domain_to_lead_id[dom] = lid
        if nm:  name_to_lead_id[nm]    = lid

    # ── Parse, validate, and check each row ──────────────────────────────────
    preview_rows: list[dict] = []
    errors:       list[dict] = []   # row-level validation errors

    # Batch-level dedup maps
    batch_emails:  dict[str, int] = {}
    batch_domains: dict[str, int] = {}
    batch_names:   dict[str, int] = {}

    total_rows      = len(raw_rows)
    duplicate_count = 0
    invalid_count   = 0

    for idx, raw_row in enumerate(raw_rows):
        # Normalise column names and trim values
        row = {k.strip().lower(): (v or "").strip() for k, v in raw_row.items()}

        # Skip fully empty rows
        if not any(row.values()):
            continue

        row_errors: list[str] = []
        human_row = idx + 2   # +2: 1-based + header row

        # --- Required field checks (use CSV-facing header names) ---
        company_name = row.get("company_name", "")
        if not company_name:
            row_errors.append("company_name is required")

        lead_full_name = row.get("lead_full_name", "")
        if not lead_full_name:
            row_errors.append("lead_full_name is required")

        professional_mail = row.get("professional_mail", "").lower()
        if not professional_mail:
            row_errors.append("professional_mail is required")
        elif not _EMAIL_RE.match(professional_mail):
            row_errors.append(f"professional_mail '{professional_mail}' is not a valid email address")

        country = row.get("country", "")
        if not country:
            row_errors.append("country is required")

        industry_from_csv = row.get("industry", "")
        if not industry_from_csv:
            row_errors.append("industry is required")

        owner_name = row.get("owner_name", "")
        if not owner_name:
            row_errors.append("owner_name is required")

        # --- Optional fields with normalization ---
        website       = row.get("website", "")
        contact_phone = row.get("contact_phone", "") or row.get("phone", "")
        raw_value     = row.get("estimated_deal_value", "")
        timeline      = row.get("expected_timeline", "") or "3-6 months"
        notes         = row.get("notes", "")

        # Validate estimated_deal_value if provided
        deal_value: float | None = None
        if raw_value:
            deal_value = _parse_float(raw_value)
            if deal_value is None:
                row_errors.append(f"estimated_deal_value '{raw_value}' is not a valid number")

        # Validate expected_timeline enum if provided
        if timeline and timeline not in _TIMELINE_VALUES:
            # Try to match loosely, otherwise just keep as-is (don't block)
            pass  # timeline is free-text in the form too

        # Normalize lead_source
        lead_source_raw = row.get("lead_source", "") or "imported"
        lead_source = lead_source_raw if lead_source_raw in _LEAD_SOURCE_VALUES else "imported"

        # Normalize booleans
        problem_identified_raw = row.get("problem_identified", "")
        problem_identified = _norm_bool(problem_identified_raw)
        if problem_identified is None:
            row_errors.append(f"problem_identified '{problem_identified_raw}' must be true/false/yes/no/1/0")
            problem_identified = False

        authority_known_raw = row.get("authority_known", "")
        authority_known = _norm_bool(authority_known_raw)
        if authority_known is None:
            row_errors.append(f"authority_known '{authority_known_raw}' must be true/false/yes/no/1/0")
            authority_known = False

        need_timeline_raw = row.get("need_timeline", "")
        need_timeline = _norm_bool(need_timeline_raw)
        if need_timeline is None:
            row_errors.append(f"need_timeline '{need_timeline_raw}' must be true/false/yes/no/1/0")
            need_timeline = False

        # Normalize budget_mentioned
        budget_mentioned_raw = row.get("budget_mentioned", "") or "unknown"
        if budget_mentioned_raw not in _BUDGET_MENTIONED_VALUES:
            row_errors.append(f"budget_mentioned '{budget_mentioned_raw}' must be one of: {', '.join(sorted(_BUDGET_MENTIONED_VALUES))}")
            budget_mentioned = "unknown"
        else:
            budget_mentioned = budget_mentioned_raw

        # --- Industry (required now, but still try suggestion if empty) ---
        industry_suggested_flag = False
        industry_confidence = None
        if industry_from_csv:
            industry = industry_from_csv
        else:
            industry, industry_confidence = _suggest_industry(company_name or "", website)
            industry_suggested_flag = industry is not None

        # --- Duplicate detection (only for valid rows) ---
        dup_flag   = False
        dup_reason = None
        matched_id = None

        if not row_errors and company_name:
            domain = _extract_domain(website)
            norm   = _norm_name(company_name)

            if professional_mail and professional_mail in email_to_lead_id:
                dup_flag, dup_reason, matched_id = True, "email_match", email_to_lead_id[professional_mail]
            elif domain and domain in domain_to_lead_id:
                dup_flag, dup_reason, matched_id = True, "domain_match", domain_to_lead_id[domain]
            elif norm and norm in name_to_lead_id:
                dup_flag, dup_reason, matched_id = True, "company_name_match", name_to_lead_id[norm]
            elif professional_mail and professional_mail in batch_emails:
                dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_emails[professional_mail]}"
            elif domain and domain in batch_domains:
                dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_domains[domain]}"
            elif norm and norm in batch_names:
                dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_names[norm]}"

            # Register in batch maps
            if professional_mail and professional_mail not in batch_emails: batch_emails[professional_mail] = idx
            if domain and domain not in batch_domains: batch_domains[domain] = idx
            if norm and norm not in batch_names: batch_names[norm] = idx

            if dup_flag:
                duplicate_count += 1

        # --- Accumulate row errors ---
        if row_errors:
            invalid_count += 1
            errors.append({
                "row_index": idx,
                "row_number": human_row,
                "company_name": company_name or "(empty)",
                "errors": row_errors,
                "reason": "; ".join(row_errors),   # backward compat single string
            })
            # Still add to preview_rows so the user can see what's wrong
            invalid_reason = "; ".join(row_errors)
        else:
            invalid_reason = None

        preview_rows.append({
            "row_index":           idx,
            "row_number":          human_row,
            # CSV-facing field names (used by frontend preview table)
            "company_name":        company_name,
            "lead_full_name":      lead_full_name,
            "professional_mail":   professional_mail,
            "owner_name":          owner_name,
            # Schema-matching fields (internal DB names)
            "contact_name":        lead_full_name,
            "contact_email":       professional_mail,
            "owner_id":            owner_name,
            "country":             country,
            "industry":            industry,
            "industry_suggested":  industry_suggested_flag,
            "industry_confidence": industry_confidence,
            # Optional fields
            "contact_phone":       contact_phone,
            "website":             website,
            "lead_source":         lead_source,
            "estimated_deal_value": deal_value or 0,
            "expected_timeline":   timeline,
            "problem_identified":  problem_identified,
            "budget_mentioned":    budget_mentioned,
            "authority_known":     authority_known,
            "need_timeline":       need_timeline,
            "notes":               notes,
            # Dedup / validation
            "duplicate_flag":      dup_flag,
            "duplicate_reason":    dup_reason,
            "matched_lead_id":     matched_id,
            "invalid_reason":      invalid_reason,
        })

    # ── Store preview in MongoDB cache ────────────────────────────────────────
    import_token = await _cache_store(db, preview_rows)

    return {
        "success": True,
        "import_token": import_token,
        "has_row_errors": invalid_count > 0,
        "summary": {
            "total_rows":     total_rows,
            "valid_rows":     len(preview_rows) - invalid_count,
            "invalid_rows":   invalid_count,
            "duplicate_rows": duplicate_count,
        },
        "rows":   preview_rows,
        "errors": errors,
    }


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINT 2 — Commit
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class ImportCommitRequest(BaseModel):
    import_token: str
    mode: str = "skip_duplicates"  # skip_duplicates | import_all | import_non_duplicates_only

@router.post("/revenue/leads/import/commit", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def import_leads_commit(
    req: ImportCommitRequest,
    current_user: User = Depends(get_current_user),
    db=Depends(get_db),
):
    """
    Load preview by token, insert non-duplicate (or all) rows as stage='imported'.
    Uses bulk insert_many for performance.
    """
    rows = await _cache_load(db, req.import_token)
    if rows is None:
        raise HTTPException(
            422,
            detail="Import token expired or not found. Please re-upload your CSV and preview again.",
        )

    now_iso = datetime.now(timezone.utc).isoformat()
    skip_dups = req.mode in ("skip_duplicates", "import_non_duplicates_only")

    to_insert: list[dict] = []
    skipped = 0
    lead_ids: list[str] = []

    for row in rows:
        if row.get("invalid_reason"):
            continue
        if skip_dups and row.get("duplicate_flag"):
            skipped += 1
            continue

        ts_suffix = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S%f")[:17]
        lead_id = f"REV-LEAD-IMP-{ts_suffix}-{row['row_index']}"

        doc = {
            "lead_id":              lead_id,
            "org_id":               current_user.org_id,
            "stage":                "imported",
            # Company
            "company_name":         row["company_name"],
            "website":              row.get("website") or None,
            "country":              row.get("country") or "",
            "industry":             row.get("industry") or None,
            # Contact — mapped from CSV names to internal DB names
            "contact_name":         row.get("lead_full_name") or "",
            "contact_email":        row.get("professional_mail") or None,
            "contact_phone":        row.get("contact_phone") or None,
            # Lead metadata
            "lead_source":          row.get("lead_source") or "imported",
            "estimated_deal_value": row.get("estimated_deal_value") or 0,
            "expected_timeline":    row.get("expected_timeline") or "3-6 months",
            "owner_id":             row.get("owner_name") or None,
            # Qualification signals (from CSV or defaults)
            "problem_identified":   bool(row.get("problem_identified", False)),
            "budget_mentioned":     row.get("budget_mentioned") or "unknown",
            "authority_known":      bool(row.get("authority_known", False)),
            "need_timeline":        bool(row.get("need_timeline", False)),
            "qualification": {
                "budget_confirmed":    False,
                "authority_confirmed": False,
                "timeline_confirmed":  False,
                "need_confirmed":      False,
            },
            # Notes
            "notes":                row.get("notes") or "",
            # Timestamps
            "created_at":           now_iso,
            "updated_at":           now_iso,
            "last_activity_at":     now_iso,
            "age_days":             0,
        }
        # Compute health fields at creation (health = green on day 0)
        doc["_computed"] = _compute_lead_fields(doc).get("_computed", {})

        to_insert.append(doc)
        lead_ids.append(lead_id)

    # Bulk insert
    inserted_count = 0
    if to_insert:
        await db.revenue_workflow_leads.insert_many(to_insert, ordered=False)
        inserted_count = len(to_insert)

    # Audit entry
    await db.revenue_workflow_audits.insert_one({
        "action":              "import_committed",
        "org_id":              current_user.org_id,
        "operator_id":         current_user.user_id,
        "timestamp":           now_iso,
        "total_in_token":      len(rows),
        "inserted":            inserted_count,
        "skipped_duplicates":  skipped,
        "mode":                req.mode,
    })

    # Invalidate token
    await _cache_delete(db, req.import_token)

    return {
        "success":           True,
        "inserted":          inserted_count,
        "skipped_duplicates": skipped,
        "invalid":           len(rows) - inserted_count - skipped,
        "lead_ids":          lead_ids,
    }



#
# 3-tier lookup, in order:
#   1. revenue_workflow_leads     (our own DB — zero cost)
#   2. revenue_workflow_company_cache (MongoDB — zero cost, persists Clearbit results)
#   3. Clearbit Company API       (paid — only called on true cache miss)
#
# The cache means that after the first lookup for a company, all future
# lookups for the same name are served from MongoDB (no Clearbit credit spent).
# ─────────────────────────────────────────────────────────────────────────────

import re as _re
import httpx as _httpx

_CLEARBIT_API_KEY = os.environ.get("CLEARBIT_API_KEY", "").strip()

# Clearbit uses ISO 3166-1 alpha-2 country codes → map to full names for the UI
_COUNTRY_CODES = {
    "IN": "India", "US": "United States", "GB": "United Kingdom",
    "DE": "Germany", "FR": "France", "SG": "Singapore", "AU": "Australia",
    "CA": "Canada", "AE": "UAE", "JP": "Japan", "CN": "China",
    "NL": "Netherlands", "BR": "Brazil", "ZA": "South Africa",
}

# Clearbit industry → our simplified industry labels
_INDUSTRY_MAP = {
    "logistics and supply chain": "Logistics",
    "transportation": "Logistics",
    "manufacturing": "Manufacturing",
    "retail": "Retail",
    "technology": "Technology",
    "software": "Technology",
    "information technology": "Technology",
    "healthcare": "Healthcare",
    "financial services": "Financial Services",
    "banking": "Financial Services",
    "education": "Education",
    "real estate": "Real Estate",
    "construction": "Construction",
    "media": "Media",
    "telecommunications": "Telecommunications",
}

def _normalize_company(name: str) -> str:
    """Lowercase, strip punctuation — used as cache key."""
    return _re.sub(r"[^a-z0-9 ]", "", name.strip().lower()).strip()

def _map_clearbit_response(cb: dict) -> dict:
    """Extract the 4 fields we care about from a Clearbit company object."""
    domain   = cb.get("domain") or ""
    website  = f"https://{domain}" if domain else None

    raw_country = (cb.get("geo") or {}).get("country") or cb.get("country") or ""
    country  = _COUNTRY_CODES.get(raw_country.upper(), raw_country) or None

    raw_industry = (
        (cb.get("category") or {}).get("industry") or
        (cb.get("category") or {}).get("sector") or ""
    ).lower()
    industry = _INDUSTRY_MAP.get(raw_industry) or (raw_industry.title() if raw_industry else None)

    emp_range = (cb.get("metrics") or {}).get("employeesRange") or None
    # Clearbit returns e.g. "51-200"; map to our labels
    size_map  = {"1-10": "1-10", "11-50": "11-50", "51-200": "51-200",
                 "201-500": "200-500", "501-1000": "500+", "1001-5000": "500+",
                 "5001-10000": "500+", "10001+": "500+"}
    company_size = size_map.get(emp_range, emp_range)

    return {k: v for k, v in {
        "website":      website,
        "country":      country,
        "industry":     industry,
        "company_size": company_size,
    }.items() if v}


@router.get("/revenue/leads/enrich")
async def enrich_company(
    company_name: str = Query(..., min_length=2),
    db=Depends(get_db),
):
    """
    3-tier company enrichment:
      1. Existing leads DB  (free, instant)
      2. MongoDB cache       (free after first hit)
      3. Clearbit API        (charged, only on true cache miss)
    """
    company_name = company_name.strip()
    if len(company_name) < 2:
        return {"found": False, "source": None, "suggestions": {}}

    # ── Tier 1: existing leads ──────────────────────────────────────────────
    pattern = _re.compile(_re.escape(company_name), _re.IGNORECASE)
    lead_match = await db.revenue_workflow_leads.find_one(
        {"company_name": {"$regex": pattern}},
        {"_id": 0, "website": 1, "country": 1, "industry": 1, "company_size": 1},
    )
    if lead_match:
        suggestions = {k: v for k, v in {
            "website":      lead_match.get("website"),
            "country":      lead_match.get("country"),
            "industry":     lead_match.get("industry"),
            "company_size": lead_match.get("company_size"),
        }.items() if v}
        if suggestions:
            return {"found": True, "source": "existing_leads", "suggestions": suggestions}

    # ── Tier 2: MongoDB company cache ───────────────────────────────────────
    cache_key = _normalize_company(company_name)
    cached = await db.revenue_workflow_company_cache.find_one(
        {"_cache_key": cache_key},
        {"_id": 0, "suggestions": 1, "source": 1},
    )
    if cached and cached.get("suggestions"):
        return {"found": True, "source": cached.get("source", "cache"), "suggestions": cached["suggestions"]}

    # ── Tier 3: Clearbit API ────────────────────────────────────────────────
    if not _CLEARBIT_API_KEY:
        # Key not set — gracefully return not found
        return {"found": False, "source": None, "suggestions": {}}

    try:
        async with _httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(
                "https://company.clearbit.com/v1/companies/find",
                params={"name": company_name},
                headers={"Authorization": f"Bearer {_CLEARBIT_API_KEY}"},
            )

        if resp.status_code == 200:
            cb_data = resp.json()
            suggestions = _map_clearbit_response(cb_data)
            if suggestions:
                # Persist to cache so future lookups are free
                await db.revenue_workflow_company_cache.update_one(
                    {"_cache_key": cache_key},
                    {"$set": {
                        "_cache_key":  cache_key,
                        "company_name": company_name,
                        "source":      "clearbit",
                        "suggestions": suggestions,
                        "cached_at":   datetime.now(timezone.utc).isoformat(),
                    }},
                    upsert=True,
                )
                return {"found": True, "source": "clearbit", "suggestions": suggestions}

        elif resp.status_code == 404:
            # Company not found in Clearbit — cache negative result (24h implicit TTL via re-query)
            pass  # don't cache 404s; let them retry later

    except Exception as exc:
        logger.warning("Clearbit enrich failed for '%s': %s", company_name, exc)

    return {"found": False, "source": None, "suggestions": {}}



@router.get("/revenue/leads/{lead_id}")
async def get_revenue_lead(
    lead_id: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get lead details with recomputed fields and auto-promotion"""
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    }, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # --- Auto-Promotion (Imported -> New) ---
    if lead.get("stage") == "imported" and not lead.get("auto_promoted_from_imported"):
        now_iso = datetime.now(timezone.utc).isoformat()
        update_res = await db.revenue_workflow_leads.update_one(
            {"lead_id": lead_id, "stage": "imported", "auto_promoted_from_imported": {"$ne": True}},
            {"$set": {
                "stage": "new",
                "auto_promoted_from_imported": True,
                "updated_at": now_iso
            }}
        )
        if update_res.modified_count == 1:
            lead["stage"] = "new"
            lead["auto_promoted_from_imported"] = True
            await db.revenue_workflow_audits.insert_one({
                "lead_id": lead_id,
                "action": "auto_promotion",
                "before": "imported",
                "after": "new",
                "reason": "first_view",
                "timestamp": now_iso
            })

    # Recompute computed fields on the fly for detail view accuracy
    # PASSIVE NORMALIZATION: If stage is missing but evaluate_stage exists, treat as evaluate
    if not lead.get("stage") and lead.get("evaluate_stage"):
        lead["stage"] = "evaluate"

    lead = _compute_lead_fields(lead)
    if lead.get("evaluation_data"):
        lead["evaluation_data"] = _normalize_evaluation_dict(lead["evaluation_data"])
        
    return {"success": True, "lead": lead}

@router.get("/revenue/leads/{lead_id}/activities")
async def get_lead_activities(
    lead_id: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Get all manual activities for a lead (sorted desc) with enrichment"""
    # Verify lead ownership
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    }, {"_id": 1})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    activities = await db.revenue_workflow_activities.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich email activities with engagement data
    engagement_ids = [a["engagement_id"] for a in activities if a.get("type") == "email" and a.get("engagement_id")]
    if engagement_ids:
        engagements = await db.revenue_workflow_engagements.find(
            {"engagement_id": {"$in": engagement_ids}}, {"_id": 0}
        ).to_list(len(engagement_ids))
        
        eng_map = {e["engagement_id"]: e for e in engagements}
        for act in activities:
            eid = act.get("engagement_id")
            if eid in eng_map:
                eng = eng_map[eid]
                # Map fields to what ActivityDetailModal expects
                act["subject"] = eng.get("subject") or act.get("subject")
                act["body_text"] = eng.get("body_text") or act.get("body_text")
                act["body_html"] = eng.get("body_html") or act.get("body_html")
                act["from_email"] = eng.get("from_email") or act.get("from_email")
                act["to_email"] = eng.get("to_email") or act.get("to_email")
                act["status"] = eng.get("status") or act.get("status")
                act["created_by"] = eng.get("created_by") or act.get("actor_id") or "system"
                
    return {"success": True, "activities": activities}

@router.post("/revenue/leads/{lead_id}/activities", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def log_lead_activity(
    lead_id: str, 
    act: RevenueActivityCreate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Log a new activity, recompute signals and update lead health"""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # Verify lead ownership
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    })
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
        
    # 1. Store activity
    activity_doc = {
        "activity_id": f"ACT-LOG-{uuid.uuid4().hex[:6].upper()}",
        "lead_id": lead_id,
        "type": act.type,
        "summary": act.summary,
        "subject": act.subject,
        "body_text": act.body_text,
        "body_html": act.body_html,
        "from_email": act.from_email,
        "to_email": act.to_email,
        "created_at": now_iso,
        "actor_id": current_user.user_id
    }
    await db.revenue_workflow_activities.insert_one(activity_doc)
    
    # 2. Get all activities to re-run signal extraction
    all_acts = await db.revenue_workflow_activities.find({"lead_id": lead_id}).to_list(100)
    summaries = [a["summary"] for a in all_acts]
    signals = _extract_signals(summaries)
    
    # 3. Update Lead (last_activity_at, signals, _computed)
    current_stage = lead.get("stage", "new")
    
    # --- Auto-Promotion (Activity -> Contacted) ---
    if current_stage in ["imported", "new"]:
        update_res = await db.revenue_workflow_leads.update_one(
            {"lead_id": lead_id, "stage": {"$in": ["imported", "new"]}},
            {"$set": {"stage": "contacted", "updated_at": now_iso}}
        )
        if update_res.modified_count == 1:
            await db.revenue_workflow_audits.insert_one({
                "lead_id": lead_id,
                "action": "auto_promotion",
                "before": current_stage,
                "after": "contacted",
                "reason": "activity_logged",
                "timestamp": now_iso
            })
            current_stage = "contacted"

    lead["last_activity_at"] = now_iso
    lead["signals"] = signals
    lead["budget_mentioned"] = signals["budget_signal"]
    lead["authority_known"] = signals["authority_known"]
    
    lead = _compute_lead_fields(lead)
    
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "stage": current_stage,
            "last_activity_at": now_iso,
            "signals": signals,
            "budget_mentioned": lead["budget_mentioned"],
            "authority_known": lead["authority_known"],
            "_computed": lead["_computed"],
            "updated_at": now_iso
        }}
    )

    # 4. Audit Log
    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "activity_added",
        "type": act.type,
        "timestamp": now_iso,
        "message": f"Activity logged: {act.type.upper()}"
    })
    
    return {"success": True, "message": "Activity logged", "activity_id": activity_doc["activity_id"]}


# ── Email Engagement (SendGrid) ────────────────────────────────────────────────

class EmailEngagementCreate(BaseModel):
    to: str                      # recipient email
    subject: str
    html: str                    # HTML body
    text: Optional[str] = None   # plain-text fallback (optional)

@router.post("/revenue/leads/{lead_id}/engagements/email", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def send_lead_email(
    lead_id: str, 
    payload: EmailEngagementCreate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Compose and send an outbound email to a lead via SendGrid.
    Creates an engagement record and updates it with delivery status.
    """
    import re as _re
    now_iso = datetime.now(timezone.utc).isoformat()

    # 1. Validate lead exists
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    }, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # 2. Validate email format
    email_pattern = r"^[^@\s]+@[^@\s]+\.[^@\s]+$"
    if not _re.match(email_pattern, payload.to):
        raise HTTPException(status_code=422, detail=f"Invalid recipient email: {payload.to}")

    # 3. Create engagement record with status "queued"
    engagement_id = f"ENG-EMAIL-{uuid.uuid4().hex[:10].upper()}"
    from_email = os.environ.get("SENDGRID_FROM_EMAIL", "")
    engagement_doc = {
        "engagement_id": engagement_id,
        "lead_id": lead_id,
        "type": "email",
        "direction": "outbound",
        "to_email": payload.to,
        "from_email": from_email,
        "subject": payload.subject,
        "body_html": payload.html,
        "body_text": payload.text or "",
        "status": "queued",
        "provider": "sendgrid",
        "provider_message_id": None,
        "created_by": current_user.user_id,
        "created_at": now_iso,
        "updated_at": now_iso,
    }
    await db.revenue_workflow_engagements.insert_one(engagement_doc)
    engagement_doc.pop("_id", None)

    # 4. Send via SendGrid
    from services.sendgrid_service import send_email
    result = await send_email(
        to_email=payload.to,
        subject=payload.subject,
        html=payload.html,
        text=payload.text,
        engagement_id=engagement_id,
        lead_id=lead_id,
    )

    # 5. Update status based on send result
    if result["success"]:
        new_status = "sent"
        msg_id = result.get("message_id")
    else:
        new_status = "failed"
        msg_id = None

    update_fields = {
        "status": new_status,
        "provider_message_id": msg_id,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.revenue_workflow_engagements.update_one(
        {"engagement_id": engagement_id},
        {"$set": update_fields}
    )
    engagement_doc.update(update_fields)

    # 6. Also write a lightweight activity record so it appears in Engagement History
    activity_doc = {
        "activity_id": f"ACT-EMAIL-{uuid.uuid4().hex[:6].upper()}",
        "lead_id": lead_id,
        "type": "email",
        "summary": f"Email sent to {payload.to} | Subject: {payload.subject}",
        "subject": payload.subject,
        "body_text": payload.text,
        "body_html": payload.html,
        "from_email": from_email,
        "to_email": payload.to,
        "engagement_id": engagement_id,
        "status": new_status,
        "created_at": now_iso,
        "actor_id": current_user.user_id,
    }
    await db.revenue_workflow_activities.insert_one(activity_doc)

    # 7. Auto-Promotion (Email -> Contacted)
    current_stage = lead.get("stage", "new")
    if current_stage in ["imported", "new"]:
        update_res = await db.revenue_workflow_leads.update_one(
            {"lead_id": lead_id, "stage": {"$in": ["imported", "new"]}},
            {"$set": {"stage": "contacted", "updated_at": now_iso}}
        )
        if update_res.modified_count == 1:
            await db.revenue_workflow_audits.insert_one({
                "lead_id": lead_id,
                "action": "auto_promotion",
                "before": current_stage,
                "after": "contacted",
                "reason": "email_sent",
                "timestamp": now_iso
            })
            current_stage = "contacted"

    # 8. Update lead's last_activity_at and signals
    # Re-fetch or use existing lead to compute fields
    lead["stage"] = current_stage
    lead["last_activity_at"] = now_iso
    lead = _compute_lead_fields(lead)

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "stage": current_stage,
            "last_activity_at": now_iso,
            "_computed": lead.get("_computed", {}),
            "updated_at": now_iso
        }}
    )

    if not result["success"]:
        return {
            "success": False,
            "error": result.get("error", "Email sending failed"),
            "engagement": engagement_doc,
        }

    return {"success": True, "engagement": engagement_doc}


@router.get("/revenue/leads/{lead_id}/engagements")
async def get_lead_engagements(
    lead_id: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Return all email-type engagements for a lead (newest first).
    Pure engagement records (status tracking, provider metadata).
    Use /activities for the unified activity log.
    """
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    }, {"_id": 0, "lead_id": 1})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    engagements = await db.revenue_workflow_engagements.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(200)

    return {"success": True, "engagements": engagements, "count": len(engagements)}



@router.patch("/revenue/leads/{lead_id}/status", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_lead_status(
    lead_id: str, 
    req: RevenueStatusUpdate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Gated status update with BANT signal validation"""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    })
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    old_stage = lead.get("stage", "new")
    new_status = req.status
    
    # Rules: Gating - Qualification Gate
    if new_status == "qualified" and not req.force:
        act_count = await db.revenue_workflow_activities.count_documents({"lead_id": lead_id})
        if act_count == 0:
            raise HTTPException(status_code=400, detail="Add an engagement log before qualifying.")

    # Rules: Advisory (Qualification only)
    warnings = []
    if new_status == "qualified" and not req.force:
        signals = lead.get("signals") or {}
        # If signals are missing, build them from summaries just in case they aren't up to date
        if not signals:
            all_acts = await db.revenue_workflow_activities.find({"lead_id": lead_id}).to_list(100)
            signals = _extract_signals([a["summary"] for a in all_acts])
        
        warnings = _build_warnings(signals)
        if warnings:
            return {
                "success": False,
                "allowed": False,
                "warnings": warnings,
                "can_force": True,
                "detail": "Advisory signals missing for qualification."
            }

    # Transition Logic & Gating
    update_doc: Dict[str, Any] = {
        "updated_at": now_iso,
        "qualification_override": req.force
    }

    if new_status == "qualified":
        # Rule: Lead -> Evaluate explicitly Sets stage to evaluate
        update_doc["stage"] = MainStage.EVALUATE
        update_doc["evaluate_stage"] = EvaluateStage.EXPLORE
        update_doc["lead_stage"] = "qualified" # Store original sub-stage status
        # Initialize evaluation_data if not present
        if not lead.get("evaluation_data"):
             update_doc["evaluation_data"] = EvaluationData().dict()
             
    elif new_status == "commit":
        # Rule: Evaluate -> Commit 
        # Source must be EVALUATE (normalize check)
        current_canonical = lead.get("stage") or lead.get("main_stage") or "lead"
        if str(current_canonical).lower() != "evaluate":
            raise HTTPException(status_code=400, detail="Leads must be in Evaluate stage before moving to Commit.")
        
        current_eval_stage = _normalize_evaluate_stage(lead.get("evaluate_stage") or "propose")
        
        # Rule: Only allow from PROPOSE stage
        if current_eval_stage != "propose":
             raise HTTPException(status_code=400, detail=f"Cannot move to Commit. Current Evaluate stage is '{current_eval_stage}'. Must be 'propose'.")

        # Context-aware sub-stage validation
        raw_eval_data = lead.get("evaluation_data")
        eval_data = raw_eval_data if isinstance(raw_eval_data, dict) else {}
        
        # Final validation of entire evaluate workflow
        is_valid, error_detail, missing_fields = _validate_evaluation_progression(eval_data, current_eval_stage, target_stage=None)
        if not is_valid:
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "detail": error_detail,
                    "missing_fields": missing_fields,
                    "error_type": "VALIDATION_ERROR"
                }
            )
            
        update_doc["stage"] = MainStage.COMMIT
        update_doc["main_stage"] = MainStage.COMMIT # Sync
        update_doc["commit_stage"] = "review"
        
        # Only init commit_data if missing
        if not lead.get("commit_data"):
            update_doc["commit_data"] = {
                "review": {},
                "pricing": {
                    "unit_price": None,
                    "discount": None,
                    "final_price": None,
                    "total_value": None,
                    "cost_per_unit": None,
                    "total_cost": None,
                    "margin": None,
                },
                "validation": { "required_fields_ok": None, "margin_ok": None, "deal_structure_ok": None, "missing_fields": [] },
                "risk": { "country_risk": None, "deal_size_risk": None, "risk_score": None },
                "approval": { "approval_required": None, "approval_status": None, "approver_id": None, "approval_timestamp": None, "approval_note": None },
            }
        
        await db.revenue_workflow_activities.insert_one({
            "lead_id": lead_id,
            "type": "status_change",
            "summary": "Lead moved to Commit",
            "description": "Evaluation successfully completed. Phase changed to COMMIT.",
            "performed_by": "User",
            "created_at": now_iso
        })

    elif new_status in ["new", "contacted", "disqualified", "imported"]:
        # Rule: Internal lead sub-stages
        update_doc["stage"] = MainStage.LEAD
        update_doc["main_stage"] = MainStage.LEAD
        update_doc["lead_stage"] = new_status
    else:
        # Fallback for direct stage sets (contract, handoff, evaluate)
        update_doc["stage"] = new_status
        update_doc["main_stage"] = new_status

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": update_doc}
    )
    
    # Audit Log
    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "status_changed",
        "before": old_stage,
        "after": new_status,
        "override": req.force,
        "warnings": warnings,
        "timestamp": now_iso
    })
    
    return {"success": True, "message": f"Stage updated to {new_status}"}


def _normalize_evaluate_stage(s: Any) -> str:
    """Safely convert any stage input (Enum, Enum-string, or plain string) to lowercase value."""
    if s is None: return "explore"
    # 1. Enum object: EvaluateStage.DEFINE -> "define"
    if hasattr(s, 'value'): return str(s.value).lower()
    
    # 2. String representation of Enum: "EvaluateStage.DEFINE" -> "define"
    s_str = str(s).lower()
    if "." in s_str:
        return s_str.split(".")[-1]
        
    # 3. Plain string: "define" -> "define"
    return s_str

def _normalize_evaluation_dict(eval_data: Any) -> Dict[str, Any]:
    """
    Safe merge strategy: Convert all keys to normalized lowercase.
    If both 'explore' and 'EvaluateStage.EXPLORE' exist, 'explore' takes precedence.
    """
    if not isinstance(eval_data, dict): return {}
    
    normalized = {}
    valid_stages = ["explore", "define", "fit", "scope", "propose"]
    
    # 1. First Pass: Initialize with known lowercase keys if they exist
    for stage in valid_stages:
        if stage in eval_data:
            normalized[stage] = eval_data[stage]
    
    # 2. Second Pass: Fill missing normalized keys from legacy sources
    for k, v in eval_data.items():
        norm_k = _normalize_evaluate_stage(k)
        if norm_k in valid_stages and norm_k not in normalized:
            logger.info(f"[LEGACY_MERGE] Mapping {k} data to {norm_k}")
            normalized[norm_k] = v
            
    return normalized


def _validate_evaluation_progression(eval_data: dict, current_stage: Any, target_stage: Any = None) -> Tuple[bool, str, List[str]]:
    """
    Validate if the lead can progress from current_stage to target_stage (or to COMMIT if target_stage is None).
    Returns (is_valid, error_detail, missing_fields).
    """
    # Use strings as keys for consistency
    validation_map = {
        "explore": ["problem_statement", "business_goal", "stakeholder_status"],
        "define": ["solution_type", "estimated_users", "departments", "complexity"],
        "fit": ["product_interest", "demo_completed", "client_feedback"],
        "scope": ["deal_size", "timeline", "decision_maker", "budget"],
        "propose": ["proposed_product", "proposal_quantity", "proposal_sent_date", "client_status"]
    }

    stages_order = ["explore", "define", "fit", "scope", "propose"]

    logger.debug(f"Validating evaluate progression: current={current_stage}, target={target_stage}, data_keys={list(eval_data.keys())}")
    
    # Normalize all inputs to plain values using helper
    # Defensive: Normalize the entire dict first to handle legacy keys
    eval_data = _normalize_evaluation_dict(eval_data)
    
    curr_val = _normalize_evaluate_stage(current_stage)
    
    try:
        current_idx = stages_order.index(curr_val)
        
        if target_stage:
            target_val = _normalize_evaluate_stage(target_stage)
            target_idx = stages_order.index(target_val)
        else:
            # Moving to COMMIT (end of workflow)
            target_idx = len(stages_order)
            target_val = "commit"
    except ValueError:
        logger.error(f"Invalid stage transition values: current='{current_stage}' (normalized='{curr_val}'), target='{target_stage}'")
        return False, f"Invalid stage transition: '{current_stage}' or '{target_stage}' not recognized.", []

    if target_idx > current_idx:
        all_missing = []
        # Ensure eval_data is a dict
        if not isinstance(eval_data, dict):
            logger.warning(f"Validation Error: evaluation_data is not a dict or is null: {type(eval_data)}")
            eval_data = {}

        for idx in range(current_idx, target_idx):
            stage_key = stages_order[idx] # Already strings
            required_fields = validation_map.get(stage_key, [])
            stage_data = eval_data.get(stage_key)
            
            if not isinstance(stage_data, dict):
                logger.debug(f"Stage data for {stage_key} is missing or not a dict: {type(stage_data)}")
                stage_data = {}
            
            stage_missing = []
            for field in required_fields:
                val = stage_data.get(field)
                logger.info(f"[VALIDATE] Checking {stage_key}.{field}: value='{val}' (type={type(val).__name__})")
                
                if val is None or str(val).strip() == "" or (field == "demo_completed" and val is False):
                    stage_missing.append(str(field))
            
            if stage_missing:
                all_missing.extend(stage_missing)
                destination = target_stage if target_stage else "COMMIT"
                dest_name = str(destination).upper()
                error_msg = f"Cannot move to {dest_name}. Missing required fields in {stage_key} stage."
                logger.warning(f"Validation failed for lead: {error_msg} - Missing: {stage_missing}")
                return False, error_msg, stage_missing
    
    return True, "", []


@router.patch("/revenue/leads/{lead_id}/evaluate-stage", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_evaluate_stage(
    lead_id: str, 
    req: EvaluateStageUpdate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update evaluate sub-stage with validation and optional atomic save"""
    try:
        lead = await db.revenue_workflow_leads.find_one({
            "lead_id": lead_id,
            "org_id": current_user.org_id
        })
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        current_stage = _normalize_evaluate_stage(lead.get("evaluate_stage") or "explore")
        new_stage = _normalize_evaluate_stage(req.evaluate_stage)
        
        # Be defensive with evaluation_data
        raw_eval_data = lead.get("evaluation_data")
        eval_data = raw_eval_data if isinstance(raw_eval_data, dict) else {}

        logger.info(f"Transitioning Lead {lead_id} Evaluate Stage: {current_stage} -> {new_stage}")

        # Structured validation return: (is_valid, error_detail, missing_fields)
        is_valid, error_detail, missing_fields = _validate_evaluation_progression(eval_data, current_stage, new_stage)
        
        if not is_valid:
            logger.warning(f"Evaluation stage transition blocked for {lead_id}: {error_detail}")
            # Use JSONResponse for consistent structured error format
            return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "detail": error_detail,
                    "missing_fields": missing_fields,
                    "error_type": "VALIDATION_ERROR"
                }
            )

        now_iso = datetime.now(timezone.utc).isoformat()
        await db.revenue_workflow_leads.update_one(
            {"lead_id": lead_id, "org_id": current_user.org_id},
            {"$set": {
                "stage": "evaluate", # Reinforce canonical stage
                "evaluate_stage": new_stage,
                "updated_at": now_iso
            }}
        )

        # Audit
        await db.revenue_workflow_audits.insert_one({
            "lead_id": lead_id,
            "action": "evaluate_stage_changed",
            "before": str(current_stage),
            "after": str(new_stage),
            "timestamp": now_iso
        })

        # Insert Activity
        await db.revenue_workflow_activities.insert_one({
            "lead_id": lead_id,
            "type": "evaluate_stage_change",
            "summary": f"Evaluation stage: {str(new_stage).upper()}",
            "description": f"Lead moved from {current_stage} to {new_stage} in the evaluation workflow.",
            "performed_by": "User",
            "created_at": now_iso
        })

        return {"success": True, "message": f"Stage updated to {new_stage}"}
    except Exception as e:
        logger.error(f"Error in update_evaluate_stage: {str(e)}", exc_info=True)
        return {
            "success": False,
            "detail": f"Internal Server Error: {str(e)}",
            "error_type": "SYSTEM_ERROR"
        }


@router.patch("/revenue/leads/{lead_id}/commit-stage", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_commit_stage(
    lead_id: str, 
    req: CommitStageUpdate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update commit sub-stage (review -> price -> check -> approve)"""
    try:
        lead = await db.revenue_workflow_leads.find_one({
            "lead_id": lead_id,
            "org_id": current_user.org_id
        })
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Verify main stage is commit
        current_main_stage = str(lead.get("stage") or lead.get("main_stage") or "").lower()
        if current_main_stage != "commit":
             return JSONResponse(
                status_code=400,
                content={
                    "success": False,
                    "detail": "Lead is not in COMMIT stage",
                    "error_type": "VALIDATION_ERROR"
                }
            )

        new_sub_stage = req.commit_stage.lower()
        current_sub_stage = lead.get("commit_stage") or "review"

        now_iso = datetime.now(timezone.utc).isoformat()
        
        # Update lead
        await db.revenue_workflow_leads.update_one(
            {"lead_id": lead_id, "org_id": current_user.org_id},
            {"$set": {
                "commit_stage": new_sub_stage,
                "updated_at": now_iso
            }}
        )

        # Audit
        await db.revenue_workflow_audits.insert_one({
            "lead_id": lead_id,
            "action": "commit_stage_changed",
            "before": current_sub_stage,
            "after": new_sub_stage,
            "timestamp": now_iso
        })

        return {"success": True, "message": f"Commit stage updated to {new_sub_stage}"}
    except Exception as e:
        logger.error(f"Error in update_commit_stage: {str(e)}", exc_info=True)
        return {
            "success": False,
            "detail": f"Internal Server Error: {str(e)}",
            "error_type": "SYSTEM_ERROR"
        }


@router.put("/revenue/leads/{lead_id}/evaluation-data", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_evaluation_data(
    lead_id: str, 
    req: EvaluationDataUpdate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update evaluation data for a specific stage"""
    now_iso = datetime.now(timezone.utc).isoformat()
    # Use dot notation to update nested field in MongoDB
    stage_val = _normalize_evaluate_stage(req.stage)
    update_key = f"evaluation_data.{stage_val}"
    
    logger.info(f"[SAVE] Updating {lead_id} {stage_val} data with: {list(req.data.keys())}")
    
    result = await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {
            update_key: req.data,
            "updated_at": now_iso
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": f"Evaluation data for {req.stage} updated"}

@router.put("/revenue/leads/{lead_id}", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_revenue_lead(
    lead_id: str, 
    lead: RevenueLeadCreate, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Update lead"""
    data = lead.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}, 
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": "Lead updated"}

@router.delete("/revenue/leads/{lead_id}", dependencies=[Depends(_require_role(["admin", "owner"]))])
async def delete_revenue_lead(
    lead_id: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Delete a revenue lead"""
    result = await db.revenue_workflow_leads.delete_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    })
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Optional: Clean up related activities and audits
    await db.revenue_workflow_activities.delete_many({"lead_id": lead_id})
    await db.revenue_workflow_audits.delete_many({"lead_id": lead_id})
    
    return {"success": True, "message": "Lead deleted successfully"}

@router.put("/revenue/leads/{lead_id}/stage", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def change_lead_stage(
    lead_id: str, 
    new_stage: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Change lead stage"""
    valid_stages = [s.value for s in LeadStage]
    if new_stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")
    
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    })
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Define valid transitions
    transitions = {
        "new": ["contacted", "disqualified"],
        "contacted": ["qualified", "disqualified", "new"],
        "qualified": ["disqualified"],
        "disqualified": ["new"]
    }
    
    current_stage = lead.get("stage", "new")
    if new_stage not in transitions.get(current_stage, []):
        raise HTTPException(status_code=400, detail=f"Cannot transition from {current_stage} to {new_stage}")
    
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {"stage": new_stage, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": f"Stage changed to {new_stage}"}

@router.post("/revenue/leads/{lead_id}/convert-to-evaluate", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def convert_lead_to_evaluate(
    lead_id: str, 
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """Convert qualified lead to evaluation - Creates draft party and evaluation record"""
    lead = await db.revenue_workflow_leads.find_one({
        "lead_id": lead_id,
        "org_id": current_user.org_id
    })
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.get("stage") != "qualified":
        raise HTTPException(status_code=400, detail="Lead must be qualified before conversion")
    
    if lead.get("is_converted"):
        raise HTTPException(status_code=400, detail="Lead is already converted")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create Draft Party
    party_data = {
        "party_id": f"PARTY-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "display_name": lead.get("company_name"),
        "legal_name": lead.get("company_name"),
        "country": lead.get("country"),
        "industry": lead.get("industry"),
        "status": "draft",
        "source_lead_id": lead_id,
        "contacts": [{
            "name": lead.get("contact_name"),
            "email": lead.get("contact_email"),
            "phone": lead.get("contact_phone"),
            "is_primary": True
        }],
        "org_id": current_user.org_id,
        "created_at": now
    }
    await db.revenue_workflow_parties.insert_one(party_data)
    
    # Create Evaluation record 
    # Mapped to `commerce_models.Evaluate` structure for Phase 2
    eval_data = {
        "evaluation_id": f"REV-EVAL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "linked_lead_id": lead_id,
        "lead_id": lead_id,
        "customer_id": party_data["party_id"],
        "party_id": party_data["party_id"],
        
        # Mapped from Lead per requirements
        "opportunity_name": f"Opportunity for {lead.get('company_name')}",
        "company_name": lead.get("company_name"),
        "contact_person": lead.get("contact_name"),
        "contact_email": lead.get("contact_email"),
        "lead_source": lead.get("lead_source"),
        "owner": lead.get("owner_id") or lead.get("owner_name"),
        "notes": lead.get("notes"),
        "org_id": current_user.org_id,
        
        "opportunity_type": "New Business",
        "expected_deal_value": lead.get("estimated_deal_value", 0),
        "total_value": lead.get("estimated_deal_value", 0),
        "proposed_payment_terms": "Net 30",
        "currency": "INR",
        
        # Initial values per requirements
        "stage": "in_progress",
        "status": "draft",
        "evaluation_status": "draft",
        
        "gross_margin_percent": 0.0,
        "estimated_cost": 0.0,
        "items": [],
        "created_at": now,
        "updated_at": now
    }
    await db.revenue_workflow_evaluations.insert_one(eval_data)
    
    # Lock Lead
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {
            "is_converted": True,
            "converted_at": now,
            "evaluation_id": eval_data["evaluation_id"],
            "party_id": party_data["party_id"],
            "updated_at": now
        }}
    )
    
    return {
        "success": True,
        "message": "Lead converted to evaluation",
        "evaluation_id": eval_data["evaluation_id"],
        "lead_id": lead_id,
        "stage": eval_data["stage"],
        "status": eval_data["status"]
    }


# ============== COMMIT WORKFLOW ENDPOINTS ==============
# All commit data lives inside the revenue_workflow_leads document.
# Sub-stages: review → price → check → approve

# Countries considered high-risk for the commit risk engine (simple, transparent list)
_HIGH_RISK_COUNTRIES = {
    "iran", "north korea", "syria", "cuba", "russia", "myanmar", "sudan",
    "venezuela", "zimbabwe", "somalia", "liberia", "iraq"
}

# Minimum margin % policy — can be overridden via env var
_COMMIT_MIN_MARGIN_PCT = float(os.environ.get("COMMIT_MIN_MARGIN_PCT", "25.0"))

# Valid commit sub-stages in order
_COMMIT_STAGES_ORDER = ["review", "price", "check", "approve"]


def _get_commit_data(lead: dict) -> dict:
    """Return commit_data from lead, guaranteed to be a dict (safe for old records)."""
    cd = lead.get("commit_data")
    return cd if isinstance(cd, dict) else {}


# ── 1. Move to Commit ─────────────────────────────────────────────────────────

@router.post(
    "/revenue/leads/{lead_id}/move-to-commit",
    dependencies=[Depends(_require_role(["manager", "admin", "owner"]))]
)
async def move_lead_to_commit(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Transition a lead from Evaluate/Propose into Commit/Review.
    Guards: main_stage must be 'evaluate', evaluate_stage must be 'propose'.
    Initializes commit_data skeleton if not already present.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    main_stage = str(lead.get("main_stage") or "").lower()
    eval_stage = _normalize_evaluate_stage(lead.get("evaluate_stage") or "")

    # Gate: must be in evaluate/propose
    if main_stage != "evaluate":
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "detail": f"Lead must be in Evaluate stage to move to Commit (current: '{main_stage}').",
                "error_type": "INVALID_TRANSITION"
            }
        )
    if eval_stage != "propose":
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "detail": f"Lead must be at Evaluate/Propose sub-stage to move to Commit (current evaluate_stage: '{eval_stage}').",
                "error_type": "INVALID_TRANSITION"
            }
        )

    # Prevent double-transition if already in commit
    if str(lead.get("commit_stage") or "") in _COMMIT_STAGES_ORDER:
        return {
            "success": True,
            "message": "Lead is already in Commit stage.",
            "commit_stage": lead["commit_stage"],
            "already_in_commit": True
        }

    update_fields: Dict[str, Any] = {
        "main_stage": "commit",
        "commit_stage": "review",
        "updated_at": now_iso,
    }

    # Initialize commit_data only if absent (explicit $set, not setdefault)
    if not lead.get("commit_data"):
        update_fields["commit_data"] = {
            "review": {},
            "pricing": {
                "unit_price": None, "discount": None, "final_price": None,
                "total_value": None, "cost_per_unit": None, "total_cost": None, "margin": None,
            },
            "validation": {
                "required_fields_ok": None, "margin_ok": None,
                "deal_structure_ok": None, "missing_fields": [],
            },
            "risk": {
                "country_risk": None, "deal_size_risk": None, "risk_score": None,
            },
            "approval": {
                "approval_required": None, "approval_status": None,
                "approver_id": None, "approval_timestamp": None, "approval_note": None,
            },
        }

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": update_fields}
    )

    # Audit
    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "moved_to_commit",
        "before": "evaluate",
        "after": "commit",
        "actor": current_user.user_id,
        "timestamp": now_iso,
    })

    return {"success": True, "commit_stage": "review", "message": "Lead moved to Commit/Review"}


# ── 2. Get Commit Data ────────────────────────────────────────────────────────

@router.get("/revenue/leads/{lead_id}/commit-data")
async def get_commit_data(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Return commit_data and a read-only snapshot of evaluate_data.
    Evaluate data is NOT editable from the Commit stage.
    """
    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"_id": 0}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    commit_data = _get_commit_data(lead)
    # Normalize evaluate snapshot (read-only) with metadata enrichment
    evaluate_status = _normalize_evaluate_stage(lead.get("evaluate_stage"))
    evaluate_snapshot = _normalize_evaluation_dict(lead.get("evaluation_data") or {})
    evaluate_snapshot["_metadata"] = {
        "captured_at": datetime.now(timezone.utc).isoformat(),
        "source_stage": evaluate_status
    }

    return {
        "success": True,
        "lead_id": lead_id,
        "main_stage": lead.get("main_stage"),
        "commit_stage": lead.get("commit_stage"),
        "commit_data": commit_data,
        # Read-only summary from Evaluate
        "evaluate_snapshot": evaluate_snapshot,
        "evaluate_stage": evaluate_status,
    }


# ── 3. Save Commit Pricing ────────────────────────────────────────────────────

@router.patch(
    "/revenue/leads/{lead_id}/commit-pricing",
    dependencies=[Depends(_require_role(["manager", "admin", "owner"]))]
)
async def save_commit_pricing(
    lead_id: str,
    req: CommitPricingUpdate,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Save pricing inputs and auto-calculate derived fields.
    - final_price = unit_price - (unit_price * discount / 100)
    - quantity resolved from first evaluate item or defaults to 1
    - cost_per_unit taken from evaluate items if not supplied in payload
    - total_value = final_price * quantity
    - total_cost = cost_per_unit * quantity
    - margin = ((final_price - cost_per_unit) / final_price) * 100 (divide-by-zero safe)
    Does NOT unconditionally advance commit_stage; leaves stage control to the caller.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Require lead to be in commit stage
    if str(lead.get("main_stage") or "").lower() != "commit":
        raise HTTPException(
            status_code=400,
            detail="Pricing can only be saved when the lead is in Commit stage."
        )

    # Resolve quantity and cost_per_unit from evaluate items (safe fallback to 1 / 0)
    eval_items = []
    eval_data = lead.get("evaluation_data") or {}
    propose_data = eval_data.get("propose") if isinstance(eval_data, dict) else None
    if isinstance(propose_data, dict):
        qty_raw = propose_data.get("proposal_quantity")
        try:
            quantity = max(1, int(qty_raw or 1))
        except (TypeError, ValueError):
            quantity = 1
    else:
        quantity = 1

    # Resolve cost_per_unit: payload > first evaluate item > 0
    cost_per_unit = req.cost_per_unit
    if cost_per_unit is None:
        # Try to extract from the existing evaluation items list on the lead
        items_raw = lead.get("evaluation_items") or lead.get("items") or []
        if items_raw and isinstance(items_raw, list) and isinstance(items_raw[0], dict):
            cost_per_unit = float(items_raw[0].get("cost_price") or 0)
        else:
            cost_per_unit = 0.0

    # Auto-calculate
    unit_price = float(req.unit_price)
    discount = float(req.discount)

    final_price = unit_price - (unit_price * discount / 100.0)
    total_value = final_price * quantity
    total_cost = cost_per_unit * quantity

    # Margin — divide-by-zero safe
    if final_price > 0:
        margin = round(((final_price - cost_per_unit) / final_price) * 100, 2)
    else:
        margin = 0.0

    pricing_data = {
        "unit_price": unit_price,
        "discount": discount,
        "final_price": round(final_price, 2),
        "total_value": round(total_value, 2),
        "cost_per_unit": cost_per_unit,
        "total_cost": round(total_cost, 2),
        "margin": margin,
        "quantity_used": quantity,
    }

    # Determine next commit_stage contextually:
    # Any pricing update while in 'check' or 'approve' resets the stage to 'price'
    # to enforce re-validation.
    current_commit_stage = str(lead.get("commit_stage") or "review").lower()
    if current_commit_stage in ["check", "approve"]:
        next_commit_stage = "price"
    elif current_commit_stage == "review":
        next_commit_stage = "price"
    else:
        next_commit_stage = current_commit_stage

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {
            "commit_data.pricing": pricing_data,
            "commit_stage": next_commit_stage,
            "updated_at": now_iso,
        }}
    )

    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "commit_pricing_saved",
        "actor": current_user.user_id,
        "timestamp": now_iso,
        "data": {"unit_price": unit_price, "discount": discount, "margin": margin},
    })

    return {
        "success": True,
        "commit_stage": next_commit_stage,
        "pricing": pricing_data,
        "message": "Commit pricing saved and calculations applied."
    }


# ── 4. Commit Check (Validation + Risk) ──────────────────────────────────────

@router.post(
    "/revenue/leads/{lead_id}/commit-check",
    dependencies=[Depends(_require_role(["manager", "admin", "owner"]))]
)
async def run_commit_check(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Run system-side validation and risk scoring for the Commit stage.
    Writes commit_data.validation and commit_data.risk into the lead record.
    Advances commit_stage to 'check' on success.
    Returns check_status: ready | needs_approval | blocked
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if str(lead.get("main_stage") or "").lower() != "commit":
        raise HTTPException(status_code=400, detail="Commit check can only run in Commit stage.")

    commit_data = _get_commit_data(lead)
    pricing = commit_data.get("pricing") or {}

    # ── Validation ──────────────────────────────────────────────────────────
    missing_fields = []

    # Required pricing fields
    for field in ["unit_price", "discount", "final_price", "total_value", "margin"]:
        if pricing.get(field) is None:
            missing_fields.append(f"pricing.{field}")

    required_fields_ok = len(missing_fields) == 0
    margin = float(pricing.get("margin") or 0)
    margin_ok = margin >= _COMMIT_MIN_MARGIN_PCT

    # Deal structure: evaluate_data.propose must exist with proposal_quantity > 0
    eval_data = lead.get("evaluation_data") or {}
    propose_data = eval_data.get("propose") if isinstance(eval_data, dict) else {}
    deal_structure_ok = bool(
        isinstance(propose_data, dict) and
        propose_data.get("proposed_product") and
        (propose_data.get("proposal_quantity") or 0) > 0
    )
    if not deal_structure_ok:
        missing_fields.append("evaluate.propose.proposed_product / proposal_quantity")

    validation = {
        "required_fields_ok": required_fields_ok,
        "margin_ok": margin_ok,
        "deal_structure_ok": deal_structure_ok,
        "missing_fields": missing_fields,
    }

    # ── Risk Score ───────────────────────────────────────────────────────────
    country = str(lead.get("country") or "").lower().strip()
    country_risk = "high" if country in _HIGH_RISK_COUNTRIES else "low"

    total_value = float(pricing.get("total_value") or 0)
    if total_value > 10_000_000:
        deal_size_risk = "high"
    elif total_value > 1_000_000:
        deal_size_risk = "medium"
    else:
        deal_size_risk = "low"

    # Transparent additive scoring
    risk_score = 20  # base
    if country_risk == "high":
        risk_score += 30
    if deal_size_risk == "high":
        risk_score += 30
    elif deal_size_risk == "medium":
        risk_score += 15
    if not margin_ok:
        risk_score += 15  # thin/negative margin is a risk signal
    risk_score = min(risk_score, 100)

    risk = {
        "country_risk": country_risk,
        "deal_size_risk": deal_size_risk,
        "risk_score": risk_score,
    }

    # ── Approval Requirement (Enriched Logic) ────────────────────────────────
    # Approval is required if margin is below policy OR risk score is high
    # OR if it's a high-risk country.
    approval_required = (not margin_ok) or (risk_score >= 70) or (country_risk == "high")

    # ── Check Status ─────────────────────────────────────────────────────────
    if not required_fields_ok or not deal_structure_ok:
        check_status = "blocked"
    elif approval_required:
        check_status = "needs_approval"
    else:
        check_status = "ready"

    # Persist all validation + risk + approval_required into lead via explicit $set
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {
            "commit_data.validation": validation,
            "commit_data.risk": risk,
            "commit_data.approval.approval_required": approval_required,
            "commit_stage": "check",
            "updated_at": now_iso,
        }}
    )

    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "commit_check_run",
        "actor": current_user.user_id,
        "timestamp": now_iso,
        "data": {"check_status": check_status, "risk_score": risk_score, "margin_ok": margin_ok},
    })

    return {
        "success": True,
        "commit_stage": "check",
        "check_status": check_status,
        "validation": validation,
        "risk": risk,
        "approval_required": approval_required,
        "message": f"Commit check complete. Status: {check_status}."
    }


# ── 5. Submit Approval Action ─────────────────────────────────────────────────

@router.post(
    "/revenue/leads/{lead_id}/commit-approval",
    dependencies=[Depends(_require_role(["manager", "admin", "owner"]))]
)
async def submit_commit_approval(
    lead_id: str,
    req: CommitApprovalAction,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Submit an approval decision for the Commit stage.
    - approve          → approval_status='approved', commit_stage='approve'
    - reject           → approval_status='rejected', commit_stage reverts to 'price'
    - request_change   → approval_status='changes_requested', commit_stage reverts to 'price'
    Contract transition is NOT triggered here; use move-to-contract separately.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    action = str(req.action or "").strip().lower()
    valid_actions = {"approve", "reject", "request_change"}
    if action not in valid_actions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid action '{action}'. Must be one of: {', '.join(sorted(valid_actions))}."
        )

    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if str(lead.get("main_stage") or "").lower() != "commit":
        raise HTTPException(status_code=400, detail="Approval can only be submitted in Commit stage.")

    commit_data = _get_commit_data(lead)
    validation = commit_data.get("validation") or {}

    # Block approval if validation did not pass (blocked state)
    if action == "approve":
        if not validation.get("required_fields_ok", False):
            raise HTTPException(
                status_code=400,
                detail="Cannot approve: required fields validation has not passed. Run commit-check first."
            )
        if not validation.get("deal_structure_ok", False):
            raise HTTPException(
                status_code=400,
                detail="Cannot approve: deal structure validation failed. Resolve issues and re-run commit-check."
            )

    # Determine outcome
    if action == "approve":
        approval_status = "approved"
        next_commit_stage = "approve"  # advances forward
    elif action == "reject":
        approval_status = "rejected"
        next_commit_stage = "price"    # reverts to price for rework
    else:  # request_change
        approval_status = "changes_requested"
        next_commit_stage = "price"    # reverts to price for rework

    approval_fields = {
        "commit_data.approval.approval_status": approval_status,
        "commit_data.approval.approver_id": req.approver_id,
        "commit_data.approval.approval_timestamp": now_iso,
        "commit_data.approval.approval_note": req.approval_note,
        "commit_stage": next_commit_stage,
        "updated_at": now_iso,
    }

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": approval_fields}
    )

    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": f"commit_approval_{action}",
        "actor": req.approver_id,
        "timestamp": now_iso,
        "data": {"approval_status": approval_status, "note": req.approval_note},
    })

    return {
        "success": True,
        "action": action,
        "approval_status": approval_status,
        "commit_stage": next_commit_stage,
        "message": f"Approval action '{action}' recorded. Commit stage is now '{next_commit_stage}'."
    }


# ── 6. Move to Contract ───────────────────────────────────────────────────────

@router.post(
    "/revenue/leads/{lead_id}/move-to-contract",
    dependencies=[Depends(_require_role(["manager", "admin", "owner"]))]
)
async def move_lead_to_contract(
    lead_id: str,
    current_user: User = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Final Commit → Contract transition.
    Guards:
    - commit_stage must be 'approve'
    - If approval_required=True, approval_status must be 'approved'
    - Validations (required_fields_ok, deal_structure_ok) must have passed
    Sets main_stage='contract'.
    """
    now_iso = datetime.now(timezone.utc).isoformat()

    lead = await db.revenue_workflow_leads.find_one(
        {"lead_id": lead_id, "org_id": current_user.org_id}
    )
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if str(lead.get("main_stage") or "").lower() != "commit":
        raise HTTPException(
            status_code=400,
            detail="Lead must be in Commit stage before moving to Contract."
        )

    commit_stage = str(lead.get("commit_stage") or "").lower()
    if commit_stage != "approve":
        return JSONResponse(
            status_code=400,
            content={
                "success": False,
                "detail": f"Lead must be at Commit/Approve sub-stage to move to Contract. Currently at '{commit_stage}'.",
                "error_type": "INVALID_COMMIT_SUBSTAGE"
            }
        )

    commit_data = _get_commit_data(lead)
    validation = commit_data.get("validation") or {}
    approval = commit_data.get("approval") or {}

    # Validation must have completed and passed
    if not validation.get("required_fields_ok"):
        raise HTTPException(
            status_code=400,
            detail="Cannot move to Contract: required fields validation has not passed."
        )
    if not validation.get("deal_structure_ok"):
        raise HTTPException(
            status_code=400,
            detail="Cannot move to Contract: deal structure validation failed."
        )

    # If approval was required, it must be approved
    approval_required = approval.get("approval_required")
    approval_status = str(approval.get("approval_status") or "").lower()
    if approval_required and approval_status != "approved":
        raise HTTPException(
            status_code=400,
            detail=f"Approval is required for this deal. Current approval status: '{approval_status}'. "
                   "Obtain approval before transitioning to Contract."
        )

    # Create RevenueContract record
    contract_id = f"CON-{datetime.now().year}-{lead_id[:8].upper()}"
    new_contract = {
        "contract_id": contract_id,
        "lead_id": lead_id,
        "contract_stage": ContractStage.DRAFT.value,
        "contract_status": ContractStatus.ACTIVE.value,
        "contract_template": "standard_v1",
        "contract_version": 1,
        "contract_data": {
            "party_name": lead.get("company_name"),
            "total_value": commit_data.get("total_value"),
            "currency": commit_data.get("currency", "INR"),
            "items": commit_data.get("items", [])
        },
        "onboarding_checklist": {
            "company_info": True,
            "contacts": True,
            "tax_info": False,
            "documents": False
        },
        "onboarding_status": "PENDING",
        "created_at": now_iso,
        "updated_at": now_iso,
        "versions": []
    }
    await db.revenue_workflow_contracts.insert_one(new_contract)
    
    # Log creation
    await append_audit_log(contract_id, "CONTRACT_CREATED", "system", db)

    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id, "org_id": current_user.org_id},
        {"$set": {
            "main_stage": "contract",
            "contract_id": contract_id,
            "commit_completed_at": now_iso,
            "updated_at": now_iso,
        }}
    )

    await db.revenue_workflow_audits.insert_one({
        "lead_id": lead_id,
        "action": "moved_to_contract",
        "before": "commit",
        "after": "contract",
        "actor": current_user.user_id,
        "timestamp": now_iso,
    })

    await db.revenue_workflow_activities.insert_one({
        "lead_id": lead_id,
        "type": "stage_change",
        "summary": "Lead moved to Contract stage",
        "description": "Commit phase completed. Lead advanced to Contract.",
        "performed_by": current_user.user_id,
        "created_at": now_iso,
    })

    return {
        "success": True,
        "main_stage": "contract",
        "message": "Lead successfully moved to Contract stage."
    }


# --- INTERNAL EVALUATE SUBSYSTEM SERVICES ---
async def internal_create_evaluation_scope(db, scope_data: EvaluationScope):
    await db.revenue_workflow_evaluation_scopes.insert_one(scope_data.model_dump() if hasattr(scope_data, "model_dump") else scope_data.dict())
    return scope_data

async def internal_get_evaluation_scope(db, evaluation_id: str):
    return await db.revenue_workflow_evaluation_scopes.find_one({"evaluation_id": evaluation_id}, {"_id": 0})

async def internal_update_evaluation_scope(db, evaluation_id: str, updates: dict):
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.revenue_workflow_evaluation_scopes.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": updates},
        upsert=True
    )

async def internal_add_evaluation_cost(db, cost_data: EvaluationCost):
    await db.revenue_workflow_evaluation_costs.insert_one(cost_data.model_dump() if hasattr(cost_data, "model_dump") else cost_data.dict())
    return cost_data

async def internal_get_evaluation_costs(db, evaluation_id: str):
    return await db.revenue_workflow_evaluation_costs.find({"evaluation_id": evaluation_id}, {"_id": 0}).to_list(1000)

async def internal_add_evaluation_risk(db, risk_data: EvaluationRisk):
    await db.revenue_workflow_evaluation_risks.insert_one(risk_data.model_dump() if hasattr(risk_data, "model_dump") else risk_data.dict())
    return risk_data

async def internal_get_evaluation_risks(db, evaluation_id: str):
    return await db.revenue_workflow_evaluation_risks.find({"evaluation_id": evaluation_id}, {"_id": 0}).to_list(1000)

async def internal_log_evaluation_activity(db, activity_data: EvaluationActivity):
    await db.revenue_workflow_evaluation_activities.insert_one(activity_data.model_dump() if hasattr(activity_data, "model_dump") else activity_data.dict())
    return activity_data

async def internal_get_evaluation_activities(db, evaluation_id: str):
    return await db.revenue_workflow_evaluation_activities.find({"evaluation_id": evaluation_id}, {"_id": 0}).sort("timestamp", -1).to_list(1000)

async def compute_evaluation_risk(evaluation_id: str, db):
    """
    Structured 4-part risk engine (Customer, Operational, Commercial, Financial).
    Heuristic-based scoring (0-100).
    """
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        return None
        
    scope = await internal_get_evaluation_scope(db, evaluation_id) or {}
    items = eval_data.get("items", [])
    
    party_id = eval_data.get("party_id")
    party_readiness = await validate_party_readiness(party_id, db) if party_id else {}
    
    reasons = []
    now_str = datetime.now(timezone.utc).isoformat()
    
    # 1. Customer Risk (20%)
    c_score = 10.0 # Baseline
    if not party_readiness.get("legal_ok"):
        c_score += 30
        reasons.append({"category": "customer", "factor": "Legal profile not verified", "impact": 30})
    if not party_readiness.get("tax_ok"):
        c_score += 30
        reasons.append({"category": "customer", "factor": "Tax profile not verified", "impact": 30})
    if not party_readiness.get("compliance_ok"):
        c_score += 20
        reasons.append({"category": "customer", "factor": "Compliance profile not verified", "impact": 20})
        
    if party_readiness.get("risk_score", 0) > 50:
        c_score += 10 # Reduced penalty if verification is done
        reasons.append({"category": "customer", "factor": "High party-level risk detected", "impact": 10})
    c_score = min(100, c_score)

    # 2. Operational Risk (25%)
    o_score = 15.0
    if not scope:
        o_score += 25
        reasons.append({"category": "operational", "factor": "Missing project scope definition", "impact": 25})
    else:
        timeline = (scope.get("timeline") or "").lower()
        if any(w in timeline for w in ["immediate", "urgent", "asap", "1 week"]):
            o_score += 20
            reasons.append({"category": "operational", "factor": "Aggressive delivery timeline", "impact": 20})
        if scope.get("dependencies"):
            o_score += 15
            reasons.append({"category": "operational", "factor": "External dependencies identified", "impact": 15})
    
    if len(items) > 10:
        o_score += 10
        reasons.append({"category": "operational", "factor": "High item count increases complexity", "impact": 10})
    o_score = min(100, o_score)

    # 3. Commercial Risk (30%)
    m_percent = eval_data.get("gross_margin_percent", 0)
    com_score = 10.0
    if m_percent < 15:
        com_score = 80.0
        reasons.append({"category": "commercial", "factor": "Aggressive pricing (Margin < 15%)", "impact": 70})
    elif m_percent < 25:
        com_score = 40.0
        reasons.append({"category": "commercial", "factor": "Thin margins (15-25%)", "impact": 30})
        
    total_discount = sum(item.get("discount", 0) for item in items)
    total_rev = eval_data.get("total_value", 0)
    if total_rev > 0 and (total_discount / total_rev) > 0.2:
        com_score += 15
        reasons.append({"category": "commercial", "factor": "Heavy discounting (>20%)", "impact": 15})
    com_score = min(100, com_score)

    # 4. Financial Exposure Risk (25%)
    f_score = 10.0
    if total_rev > 5000000:
        f_score += 40
        reasons.append({"category": "financial", "factor": "High deal value exposure", "impact": 40})
    elif total_rev > 1000000:
        f_score += 20
        reasons.append({"category": "financial", "factor": "Significant deal value", "impact": 20})
        
    if m_percent < 10 and total_rev > 1000000:
        f_score += 20
        reasons.append({"category": "financial", "factor": "High value with critically low margin", "impact": 20})
    f_score = min(100, f_score)

    # Overall Weighted Score
    overall_score = round(
        (c_score * 0.20) +
        (o_score * 0.25) +
        (com_score * 0.30) +
        (f_score * 0.25)
    )
    
    # Risk Level Mapping
    risk_level = "low"
    if overall_score >= 75: risk_level = "critical"
    elif overall_score >= 50: risk_level = "high"
    elif overall_score >= 25: risk_level = "moderate"
    
    # Persist Category Risks
    categories = {
        "customer": {"score": c_score, "desc": "Customer profiling & readiness risk"},
        "operational": {"score": o_score, "desc": "Scope, timeline & complexity risk"},
        "commercial": {"score": com_score, "desc": "Margin & pricing strategy risk"},
        "financial": {"score": f_score, "desc": "Deal size & exposure risk"}
    }
    
    for cat, data in categories.items():
        risk_record = EvaluationRisk(
            risk_id=f"RISK-{uuid.uuid4().hex[:8].upper()}",
            evaluation_id=evaluation_id,
            category=cat,
            risk_score=data["score"],
            reason=data["desc"],
            created_at=now_str,
            updated_at=now_str
        )
        # Upsert by category
        await db.revenue_workflow_evaluation_risks.update_one(
            {"evaluation_id": evaluation_id, "category": cat},
            {"$set": risk_record.model_dump() if hasattr(risk_record, "model_dump") else risk_record.dict()},
            upsert=True
        )
        
    # Update Main Record
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {
            "risk_score": overall_score,
            "risk_level": risk_level,
            "party_risk_score": c_score, # Synchronous update of customer risk on main record
            "updated_at": now_str
        }}
    )
    
    # Log Activity
    activity = EvaluationActivity(
        activity_id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
        evaluation_id=evaluation_id,
        action="risk_recalculated",
        performed_by="system",
        timestamp=now_str,
        details={
            "overall_score": overall_score,
            "risk_level": risk_level,
            "top_reasons": sorted(reasons, key=lambda x: x["impact"], reverse=True)[:3]
        }
    )
    await internal_log_evaluation_activity(db, activity)
    
    return {
        "overall_score": overall_score,
        "overall_level": risk_level,
        "breakdown": {
            "customer_risk": c_score,
            "operational_risk": o_score,
            "commercial_risk": com_score,
            "financial_exposure_risk": f_score
        },
        "reasons": sorted(reasons, key=lambda x: x["impact"], reverse=True)
    }

async def internal_validate_evaluation_policies(db, evaluation_id: str):
    """
    Governance layer: Margin, Discount, and Exposure checks.
    """
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        return None
        
    items = eval_data.get("items", [])
    margin_percent = eval_data.get("gross_margin_percent", 0.0)
    total_rev = eval_data.get("total_value", 0.0)
    
    # 1. Margin Policy (min 25%)
    m_threshold = 25.0
    m_status = "pass" if margin_percent >= m_threshold else "fail"
    m_msg = "Margin meets minimum threshold" if m_status == "pass" else f"Margin {margin_percent}% is below required {m_threshold}%"
    
    # 2. Discount Policy (max 20% individual item discount)
    d_threshold = 20.0
    max_d_found = 0.0
    for item in items:
        u_p = float(item.get("unit_price") or 0)
        qty = int(item.get("quantity") or 1)
        disc = float(item.get("discount") or 0)
        base = u_p * qty
        if base > 0:
            eff_d = (disc / base) * 100
            max_d_found = max(max_d_found, eff_d)
            
    d_status = "pass"
    if max_d_found > d_threshold:
        d_status = "warning"
    if max_d_found > 30: # Hard limit for fail
        d_status = "fail"
        
    d_msg = f"Highest discount {round(max_d_found, 1)}% is within limits" if d_status == "pass" else f"Highest discount {round(max_d_found, 1)}% exceeds threshold of {d_threshold}%"

    # 3. Exposure Policy (max 5M total value)
    e_threshold = 5000000.0
    e_status = "pass" if total_rev <= e_threshold else "fail"
    e_msg = "Exposure within allowed limits" if e_status == "pass" else f"Deal value ₹{total_rev} exceeds exposure limit of ₹{e_threshold}"

    policy_validation = {
        "margin_policy": {"status": m_status, "threshold": m_threshold, "actual": margin_percent, "message": m_msg},
        "discount_policy": {"status": d_status, "threshold": d_threshold, "actual": round(max_d_found, 1), "message": d_msg},
        "exposure_policy": {"status": e_status, "threshold": e_threshold, "actual": total_rev, "message": e_msg}
    }
    
    # Persist
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"policy_validation": policy_validation}}
    )
    
    # Activity Log
    now_str = datetime.now(timezone.utc).isoformat()
    activity = EvaluationActivity(
        activity_id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
        evaluation_id=evaluation_id,
        action="policy_validated",
        performed_by="system",
        timestamp=now_str,
        details={
            "summary": f"M:{m_status}, D:{d_status}, E:{e_status}",
            "results": policy_validation
        }
    )
    await internal_log_evaluation_activity(db, activity)
    
    return policy_validation

async def internal_compute_evaluation_decision(db, evaluation_id: str):
    """
    Recommendation Engine: Send to Commit | Revise | Reject
    """
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        return None
        
    margin = eval_data.get("gross_margin_percent", 0.0)
    risk_score = eval_data.get("risk_score", 0)
    risk_level = eval_data.get("risk_level", "low")
    policy = eval_data.get("policy_validation") or {}
    
    reasons = []
    recommendation = "send_to_commit"
    
    # 1. Reject Logic (Gross margin <= 0 is non-negotiable rejection)
    if (margin <= 0 or 
        (policy.get("margin_policy") or {}).get("status") == "fail" or
        (policy.get("exposure_policy") or {}).get("status") == "fail" or
        risk_level == "critical"):
        recommendation = "reject"
        if margin <= 0: reasons.append("Non-positive gross margin detected")
        if (policy.get("margin_policy") or {}).get("status") == "fail": reasons.append("Margin below critical policy threshold")
        if (policy.get("exposure_policy") or {}).get("status") == "fail": reasons.append("Exposure exceeds financial limits")
        if risk_level == "critical": reasons.append("Critical risk factors identified")
        
    # 2. Revise Logic (if not rejected)
    elif (risk_score >= 50 or 
          (policy.get("discount_policy") or {}).get("status") in ["warning", "fail"]):
        recommendation = "revise"
        if risk_score >= 50: reasons.append("High overall risk score")
        if (policy.get("discount_policy") or {}).get("status") in ["warning", "fail"]: reasons.append("Aggressive discounting requires revision")

    # 3. Default Pass
    if recommendation == "send_to_commit":
        reasons.append("All baseline policies and risk levels cleared")

    # Approval required flag
    approval_required = (recommendation == "revise" or 
                         risk_level in ["high", "critical"] or 
                         any(p.get("status") in ["warning", "fail"] for p in policy.values() if isinstance(p, dict)))

    decision_summary = {
        "recommendation": recommendation,
        "can_submit": recommendation != "reject", # Loss-making or critical failures block submission
        "approval_required": approval_required,
        "reasons": reasons[:4] # Top 4
    }
    
    # Persist
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"decision_summary": decision_summary}}
    )
    
    # Activity Log
    now_str = datetime.now(timezone.utc).isoformat()
    old_summary = eval_data.get("decision_summary")
    if not old_summary or old_summary.get("recommendation") != recommendation:
        activity = EvaluationActivity(
            activity_id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
            evaluation_id=evaluation_id,
            action="decision_updated",
            performed_by="system",
            timestamp=now_str,
            details={
                "previous": old_summary.get("recommendation") if old_summary else None,
                "new": recommendation,
                "reasons": reasons[:4]
            }
        )
        await internal_log_evaluation_activity(db, activity)

    return decision_summary

# --- EVALUATION STAGE ---

@router.get("/revenue/evaluations")
async def get_revenue_evaluations(status: Optional[str] = None, db = Depends(get_db)):
    """Get all evaluations"""
    query = {} if not status else {"status": status}
    evaluations = await db.revenue_workflow_evaluations.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "evaluations": evaluations, "count": len(evaluations)}

@router.get("/revenue/evaluations/{evaluation_id}")
async def get_revenue_evaluation(evaluation_id: str, db = Depends(get_db)):
    """Get evaluation details for EvaluateDetail.jsx"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Calculate item aggregates
    items = eval_data.get("items", [])
    selected_items_count = sum(item.get("quantity", 1) for item in items)
    
    party_id = eval_data.get("party_id")
    party_readiness = await validate_party_readiness(party_id, db) if party_id else None
    
    risk_assessment = {
        "total_score": party_readiness.get("risk_score", 0) if party_readiness else 0,
        "deal_size_risk": eval_data.get("deal_size_risk", "low"),
        "geography_risk": eval_data.get("geography_risk", "low"),
        "concentration_risk": eval_data.get("concentration_risk", "low"),
    }
    
    # Subsystem Integrations
    res = {
        "success": True,
        
        # Core & Linked info
        "evaluation_id": eval_data.get("evaluation_id"),
        "lead_id": eval_data.get("lead_id") or eval_data.get("linked_lead_id"),
        
        # Copied lead fields
        "company_name": eval_data.get("company_name"),
        "contact_person": eval_data.get("contact_person"),
        "contact_email": eval_data.get("contact_email"),
        "lead_source": eval_data.get("lead_source"),
        "owner": eval_data.get("owner"),
        "notes": eval_data.get("notes"),
        
        # Status
        "stage": eval_data.get("stage", "in_progress"),
        "status": eval_data.get("status", "draft"),
        
        # Economics / Items placeholders
        "selected_items_count": selected_items_count,
        "estimated_revenue": eval_data.get("total_value", 0.0),
        "total_price": eval_data.get("total_value", 0.0), # Canonical
        "estimated_cost": eval_data.get("estimated_cost", 0.0),
        "total_cost": eval_data.get("estimated_cost", 0.0), # Canonical
        "gross_margin_percent": eval_data.get("gross_margin_percent", 0.0),
        "margin_percent": eval_data.get("gross_margin_percent", 0.0), # Canonical
        
        # Timestamps
        "created_at": eval_data.get("created_at"),
        "updated_at": eval_data.get("updated_at"),
        
        # Keep original data for backward compatibility in UI temporarily
        "evaluation": eval_data,
        "items": items,
        
        # Risk & Readiness Data
        "party_readiness": party_readiness,
        "risk_assessment": risk_assessment,
        
        # Subsystem Integrations
        "evaluation_scope": await internal_get_evaluation_scope(db, evaluation_id),
        "evaluation_costs": await internal_get_evaluation_costs(db, evaluation_id),
        
        # Risk Subsystem
        "risk_summary": {
            "overall_score": eval_data.get("risk_score", 0),
            "overall_level": eval_data.get("risk_level", "low")
        },
        "risk_breakdown": {
            "customer_risk": (await db.revenue_workflow_evaluation_risks.find_one({"evaluation_id": evaluation_id, "category": "customer"}) or {}).get("risk_score", 0),
            "operational_risk": (await db.revenue_workflow_evaluation_risks.find_one({"evaluation_id": evaluation_id, "category": "operational"}) or {}).get("risk_score", 0),
            "commercial_risk": (await db.revenue_workflow_evaluation_risks.find_one({"evaluation_id": evaluation_id, "category": "commercial"}) or {}).get("risk_score", 0),
            "financial_exposure_risk": (await db.revenue_workflow_evaluation_risks.find_one({"evaluation_id": evaluation_id, "category": "financial"}) or {}).get("risk_score", 0)
        },
        "risk_reasons": [],
        "policy_validation": eval_data.get("policy_validation"),
        "decision_summary": eval_data.get("decision_summary")
    }
    
    # Enrich reasons from latest activity if missing
    if not res.get("risk_reasons"):
        latest_act = await db.revenue_workflow_evaluation_activities.find_one(
            {"evaluation_id": evaluation_id, "action": "risk_recalculated"},
            sort=[("timestamp", -1)]
        )
        if latest_act and latest_act.get("details"):
            res["risk_reasons"] = latest_act["details"].get("top_reasons", [])
            
    return res

# --- LEGACY ALIAS ROUTES ---

def compute_item_financials(unit_price: float, cost_price: float, quantity: int, discount: float = 0):
    """
    Unified calculation for item-level financials. 
    Canonical: total_price is the NET value (after discount).
    """
    gross_total = round(unit_price * quantity, 2)
    total_price = round(gross_total - discount, 2)
    if total_price < 0:
        total_price = 0.0
        
    total_cost = round(cost_price * quantity, 2)
    gross_margin = round(total_price - total_cost, 2)
    
    margin_percent = 0.0
    if total_price > 0:
        margin_percent = round((gross_margin / total_price) * 100, 2)
        
    return {
        # Canonical inputs
        "unit_price": round(unit_price, 2),
        "cost_price": round(cost_price, 2),
        "quantity": quantity,
        "discount": round(discount, 2),
        
        # Canonical outputs
        "total_price": total_price,  # This is NET VALUE
        "total_cost": total_cost,    # This is TOTAL COST
        "gross_margin": gross_margin,
        "margin_percent": margin_percent,
        
        # Legacy/Compatibility aliases
        "net_price": total_price,
        "line_total": total_price,
        "expected_cost": cost_price, # unit cost legacy name
        "estimated_revenue": total_price,
        "estimated_cost": total_cost,
        "gross_margin_percent": margin_percent
    }

async def recalculate_evaluation_economics(evaluation_id: str, db):
    """Reusable mechanism to recalculate evaluation summary whenever items change"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        return None
        
    items = eval_data.get("items", [])
    
    # 1. Calculation Formulas per requirements (prefer new fields, fallback for legacy)
    selected_items_count = sum(i.get("quantity", 0) for i in items)
    estimated_revenue = sum(float(i.get("total_price") if "total_price" in i else i.get("line_total", 0)) for i in items)
    
    # Structured Costs support
    item_costs = sum(float(i.get("total_cost") if "total_cost" in i else i.get("estimated_cost", 0)) for i in items)
    structured_costs_list = await db.revenue_workflow_evaluation_costs.find({"evaluation_id": evaluation_id}).to_list(100)
    structured_costs_total = sum(float(float(c.get("amount", 0))) for c in structured_costs_list)
    
    estimated_cost = round(item_costs + structured_costs_total, 2)
    
    gross_profit = round(estimated_revenue - estimated_cost, 2)
    gross_margin_percent = round((gross_profit / estimated_revenue * 100), 2) if estimated_revenue > 0 else 0
    
    now = datetime.now(timezone.utc).isoformat()
    
    summary_data = {
        "items": items,
        "selected_items_count": selected_items_count,
        # Canonical names
        "total_price": round(estimated_revenue, 2),
        "total_cost": round(estimated_cost, 2),
        "margin_percent": gross_margin_percent,
        "gross_margin": gross_profit,
        
        # Existing names (Backward Compatibility)
        "estimated_revenue": round(estimated_revenue, 2),
        "total_value": round(estimated_revenue, 2),
        "estimated_cost": round(estimated_cost, 2),
        "gross_profit": gross_profit,
        "gross_margin_percent": gross_margin_percent,
        
        "updated_at": now
    }
    
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": summary_data}
    )
    
    # Trigger Risk & Decision Re-calculation
    await compute_evaluation_risk(evaluation_id, db)
    await internal_compute_evaluation_decision(db, evaluation_id)
    
    return summary_data

@router.post("/revenue/evaluations/{evaluation_id}/items", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def add_evaluation_items(evaluation_id: str, payload: RevenueEvaluationSingleItemCreate, db = Depends(get_db)):
    """Add a selected catalog item into the evaluation as an evaluation item entry"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    # 1. Resolve catalog item via helper
    resolved_item = await resolve_catalog_item(db, payload.catalog_item_id)
    unit_price = resolved_item["base_price"]
    catalog_cost = resolved_item["cost_price"]
    
    # 2. Handle Manual Cost Overrides
    estimated_cost_per_unit = catalog_cost
    override_flag = False
    override_reason = None
    
    if payload.manual_cost is not None and payload.manual_cost != catalog_cost:
        if not payload.override_reason or not payload.override_reason.strip():
            raise HTTPException(status_code=400, detail="Cost override requires justification")
        
        # Deviation check (30%)
        deviation_percent = abs((payload.manual_cost - catalog_cost) / catalog_cost) * 100
        if deviation_percent > 30:
            raise HTTPException(
                status_code=400, 
                detail=f"Cost override exceeds 30% threshold (Current deviation: {deviation_percent:.1f}%)"
            )
            
        estimated_cost_per_unit = payload.manual_cost
        override_flag = True
        override_reason = payload.override_reason

    # 3. Extract payload and resolve name
    qty = payload.quantity
    disc = payload.discount
    notes = payload.notes
    item_name = resolved_item["name"]

    # 4. Calculations explicitly per requirements
    financials = compute_item_financials(unit_price, estimated_cost_per_unit, qty, disc)
    
    # Build Evaluation Item
    item_doc = {
        "item_id": str(uuid.uuid4()),
        "evaluation_id": evaluation_id,
        "catalog_item_id": payload.catalog_item_id,
        "item_name": item_name,
        **financials,
        "original_catalog_cost": round(catalog_cost, 2),
        "overridden_cost": round(estimated_cost_per_unit, 2) if override_flag else None,
        "override_reason": override_reason,
        "override_flag": override_flag,
        "notes": notes,
        "cost_source": resolved_item["cost_source"] if not override_flag else "manual_override",
        "price_source": resolved_item["price_source"]
    }
    
    # Usually adding implies a new line entry. We'll add as a new entry.
    current_items = eval_data.get("items", [])
    current_items.append(item_doc)
        
    # 4. Trigger Reusable Recalculation Mechanism
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"items": current_items}}
    )
    
    summary = await recalculate_evaluation_economics(evaluation_id, db)
    
    return {
        "success": True, 
        "message": "Item added successfully",
        "item": item_doc,
        "evaluation_summary": summary
    }

@router.get("/revenue/evaluations/{evaluation_id}/items")
async def get_evaluation_items(evaluation_id: str, db = Depends(get_db)):
    """Fetch all catalog items linked to the evaluation"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    items = eval_data.get("items", [])
    
    # Calculate summary if needed or pull directly from evaluation root
    selected_items_count = sum(i.get("quantity", 1) for i in items)
    
    # Add unique item_id mapping for frontend uniqueness check if not present natively
    for item in items:
        if "item_id" not in item:
             # Backward compatibility: Fallback id assignment if not originally present
             item["item_id"] = str(uuid.uuid4())
             
        # Add basic mapped timestamp if none exist on row item
        if "created_at" not in item:
             item["created_at"] = eval_data.get("created_at")

    return {
        "success": True,
        "evaluation_id": evaluation_id,
        "items": items,
        "evaluation_summary": {
            "selected_items_count": selected_items_count,
            "estimated_revenue": eval_data.get("total_value", 0.0), # maps to expected deal value sum
            "estimated_cost": eval_data.get("estimated_cost", 0.0),
            "gross_margin_percent": eval_data.get("gross_margin_percent", 0.0)
        }
    }

async def resolve_catalog_item(db, item_id: str):
    """
    Reusable helper to resolve catalog item details with strict financial validation.
    Returns a unified object with price and cost data.
    """
    catalog_item = await db.catalog_items.find_one({"item_id": item_id})
    if not catalog_item:
        raise HTTPException(status_code=404, detail="Catalog item not found")
        
    # Extract & safely convert
    base_price = float(catalog_item.get("base_price", 0) or 0)
    cost_price = float(catalog_item.get("cost_price", 0) or 0)
    
    # Strict financial validation
    if base_price <= 0:
        raise HTTPException(status_code=400, detail="Invalid catalog item: missing or invalid base_price")
    if cost_price <= 0:
        raise HTTPException(status_code=400, detail="Cost not configured for selected catalog item")
        
    return {
        "item_id": catalog_item.get("item_id"),
        "name": catalog_item.get("name", "Unknown Item"),
        "category": catalog_item.get("category"),
        "base_price": base_price,
        "cost_price": cost_price,
        "price_source": "catalog_items",
        "cost_source": "catalog_items"
    }

async def create_conversion_audit(db, lead_id: str, evaluation_id: str, user_id: str):
    pass # Placeholder for actual implementation

@router.patch("/revenue/evaluations/{evaluation_id}/items/{item_id}", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_evaluation_item(evaluation_id: str, item_id: str, payload: RevenueEvaluationItemUpdate, db = Depends(get_db)):
    """Update a specific evaluation item and recalculate financials"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    items = eval_data.get("items", [])
    
    # Extract item to update
    item_idx = next((i for i, x in enumerate(items) if x.get("item_id") == item_id), None)
    if item_idx is None:
        raise HTTPException(status_code=404, detail="Evaluation item not found")
        
    target_item = items[item_idx]
    
    # 1. Update allowed fields dynamically with normalization
    if payload.quantity is not None:
        target_item["quantity"] = payload.quantity
    if payload.unit_price is not None:
        target_item["unit_price"] = payload.unit_price
    
    # cost_price priority
    if payload.cost_price is not None:
        target_item["cost_price"] = payload.cost_price
    elif payload.expected_cost is not None:
        target_item["cost_price"] = payload.expected_cost
    elif payload.estimated_cost is not None:
        target_item["cost_price"] = payload.estimated_cost
        
    if payload.discount is not None:
        target_item["discount"] = payload.discount
    if payload.notes is not None:
        target_item["notes"] = payload.notes
        
    # 2. Recalculate line financials using shared helper
    qty = target_item.get("quantity", 1)
    price = target_item.get("unit_price", 0)
    cost = target_item.get("cost_price", 0)
    disc = target_item.get("discount", 0)
    
    # Validation
    if qty <= 0:
        raise HTTPException(status_code=400, detail="Quantity must be greater than zero")
        
    financials = compute_item_financials(price, cost, qty, disc)
    target_item.update(financials)
    
    # Push update back
    items[item_idx] = target_item
    
    # 3. Trigger Reusable Recalculation Mechanism
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"items": items}}
    )
    
    summary = await recalculate_evaluation_economics(evaluation_id, db)
    
    return {
        "success": True, 
        "message": "Evaluation item updated",
        "item": target_item,
        "evaluation_summary": summary
    }

@router.delete("/revenue/evaluations/{evaluation_id}/items/{item_id}", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def delete_evaluation_item(evaluation_id: str, item_id: str, db = Depends(get_db)):
    """Delete an item from an evaluation and recalculate financials"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    items = eval_data.get("items", [])
    
    initial_length = len(items)
    items = [i for i in items if i.get("item_id") != item_id]
    
    if len(items) == initial_length:
        raise HTTPException(status_code=404, detail="Evaluation item not found")
        
    # Recalculate Evaluation level Summaries
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"items": items}}
    )
    
    summary = await recalculate_evaluation_economics(evaluation_id, db)
    
    return {
        "success": True, 
        "message": "Evaluation item deleted",
        "evaluation_summary": summary
    }

@router.put("/revenue/evaluations/{evaluation_id}", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_revenue_evaluation(evaluation_id: str, payload: RevenueEvaluationUpdate, db = Depends(get_db)):
    """Update core evaluation fields while preserving linked lead and calculated financials"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    # Mapping user fields to internal model names
    update_data = {}
    if payload.opportunity_name is not None:
        update_data["opportunity_name"] = payload.opportunity_name
    if payload.opportunity_value is not None:
        update_data["expected_deal_value"] = payload.opportunity_value
    if payload.expected_close_date is not None:
        update_data["expected_close_date"] = str(payload.expected_close_date)
    if payload.payment_terms is not None:
        update_data["proposed_payment_terms"] = payload.payment_terms
    if payload.commercial_notes is not None:
        update_data["commercial_notes"] = payload.commercial_notes
    if payload.internal_notes is not None:
        update_data["internal_notes"] = payload.internal_notes
        
    # Process Items if provided (Bulk Update from Frontend Workspace)
    if payload.items is not None:
        processed_items = []
        for item in payload.items:
            # 1. Extract inputs with canonical priority
            qty = item.get("quantity", 1)
            unit_price = item.get("unit_price", 0)
            
            # cost_price priority over expected_cost
            cost_price = item.get("cost_price", item.get("expected_cost", 0))
            
            # discount absolute priority over discount_percent
            discount = item.get("discount")
            if discount is None:
                if "discount_percent" in item:
                    discount = (item["discount_percent"] / 100) * unit_price * qty
                else:
                    discount = 0.0
            
            # 2. Re-calculate server-side for truth
            financials = compute_item_financials(unit_price, cost_price, qty, discount)
            
            # 3. Build normalized item doc
            item_id = item.get("item_id") or f"ITEM-{uuid.uuid4().hex[:8].upper()}"
            
            # Maintain identity and merge financials
            item_doc = {
                **item, # keep existing metadata
                "item_id": item_id,
                **financials
            }
            
            # Ensure audit fields
            item_doc["cost_source"] = item_doc.get("cost_source", "manual_sync")
            item_doc["price_source"] = item_doc.get("price_source", "manual_sync")
            
            processed_items.append(item_doc)
            
        update_data["items"] = processed_items

    # Automatic update for updated_at
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Scope Management Integration
    scope_action_taken = None
    if payload.evaluation_scope is not None:
        existing_scope = await internal_get_evaluation_scope(db, evaluation_id)
        now_str = datetime.now(timezone.utc).isoformat()
        if existing_scope:
            await internal_update_evaluation_scope(db, evaluation_id, payload.evaluation_scope)
            scope_action_taken = "scope_updated"
        else:
            new_scope = EvaluationScope(
                scope_id=f"SCOPE-{uuid.uuid4().hex[:8].upper()}",
                evaluation_id=evaluation_id,
                deliverables=payload.evaluation_scope.get("deliverables", ""),
                timeline=payload.evaluation_scope.get("timeline", ""),
                assumptions=payload.evaluation_scope.get("assumptions"),
                dependencies=payload.evaluation_scope.get("dependencies"),
                created_at=now_str,
                updated_at=now_str
            )
            await internal_create_evaluation_scope(db, new_scope)
            scope_action_taken = "scope_created"
            
        # Log Activity
        activity = EvaluationActivity(
            activity_id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
            evaluation_id=evaluation_id,
            action=scope_action_taken,
            performed_by="system", # TODO: Get from auth context when available
            timestamp=now_str,
            details={"updated_fields": list(payload.evaluation_scope.keys())}
        )
        await internal_log_evaluation_activity(db, activity)

    # Structured Costs Integration
    costs_action_taken = None
    if payload.evaluation_costs is not None:
        now_str = datetime.now(timezone.utc).isoformat()
        # Fetch existing to decide update vs create
        existing_costs = await internal_get_evaluation_costs(db, evaluation_id)
        existing_map = {c["category"]: c for c in existing_costs}
        
        changed_categories = []
        for cost_item in payload.evaluation_costs:
            cat = cost_item.get("category")
            if not cat: continue
            
            amount = float(cost_item.get("amount", 0))
            if cat in existing_map:
                await db.revenue_workflow_evaluation_costs.update_one(
                    {"evaluation_id": evaluation_id, "category": cat},
                    {"$set": {
                        "amount": amount,
                        "description": cost_item.get("description", f"{cat.capitalize()} cost"),
                        "updated_at": now_str
                    }}
                )
            else:
                new_cost = EvaluationCost(
                    cost_id=f"COST-{uuid.uuid4().hex[:8].upper()}",
                    evaluation_id=evaluation_id,
                    category=cat,
                    description=cost_item.get("description", f"{cat.capitalize()} cost"),
                    amount=amount,
                    created_at=now_str,
                    updated_at=now_str
                )
                await internal_add_evaluation_cost(db, new_cost)
            changed_categories.append(cat)
        
        costs_action_taken = "costs_updated"
        # Log Activity for costs
        cost_activity = EvaluationActivity(
            activity_id=f"ACT-{uuid.uuid4().hex[:8].upper()}",
            evaluation_id=evaluation_id,
            action=costs_action_taken,
            performed_by="system",
            timestamp=now_str,
            details={"changed_categories": changed_categories}
        )
        await internal_log_evaluation_activity(db, cost_activity)

    # Perform update
    if update_data:
        await db.revenue_workflow_evaluations.update_one(
            {"evaluation_id": evaluation_id},
            {"$set": update_data}
        )
    
    # Trigger Reusable Recalculation Mechanism
    summary = await recalculate_evaluation_economics(evaluation_id, db)
    
    return {
        "success": True, 
        "message": "Evaluation updated successfully",
        "updated_fields": list(update_data.keys()),
        "scope_action": scope_action_taken,
        "evaluation_summary": summary
    }

@router.patch("/revenue/evaluations/{evaluation_id}/status", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_evaluation_status(evaluation_id: str, payload: RevenueEvaluationStatusUpdate, db = Depends(get_db)):
    """Controlled update of evaluation status based on transition rules"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
        
    current_status = eval_data.get("status") or eval_data.get("evaluation_status", "draft")
    new_status = payload.status.lower().strip()
    
    # Define valid transitions
    # Any active state -> rejected is allowed manually
    valid_transitions = {
        "draft": ["in_progress", "rejected"],
        "in_progress": ["in_review", "rejected"],
        "in_review": ["ready_for_commit", "rejected"],
        "ready_for_commit": ["approved", "rejected"],
        "approved": [], # Final state
        "rejected": ["draft"] # Allow restart from rejected? User didn't specify, but often helpful. 
                              # Based on req: draft -> in_progress, etc. 
                              # Let's stick strictly to req + any->rejected.
    }
    
    # Strict check
    is_valid = False
    if new_status == "rejected" and current_status not in ["approved", "rejected"]:
        is_valid = True
    elif new_status in valid_transitions.get(current_status, []):
        is_valid = True
        
    if not is_valid:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid status transition from '{current_status}' to '{new_status}'"
        )
        
    now = datetime.now(timezone.utc).isoformat()
    
    # Update both fields for structural compatibility
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {
            "evaluation_status": new_status,
            "status": new_status,
            "updated_at": now
        }}
    )
    
    return {
        "success": True, 
        "message": f"Status transitioned from {current_status} to {new_status}",
        "previous_status": current_status,
        "current_status": new_status
    }

@router.post("/revenue/evaluations/{evaluation_id}/party/legal-profile/verify", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def verify_evaluation_party_legal_profile(
    evaluation_id: str, 
    payload: LegalProfilePayload, 
    db = Depends(get_db)
):
    """Real-time GSTIN verification (No DB write)"""
    # 1. Offline Checks
    gst_regex = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    pan_regex = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"

    if len(payload.registeredName) < 3:
        raise HTTPException(status_code=400, detail="Registered Name must be at least 3 characters")
    if not re.match(gst_regex, payload.gst):
        raise HTTPException(status_code=400, detail="Invalid GSTIN format")
    if not re.match(pan_regex, payload.pan):
        raise HTTPException(status_code=400, detail="Invalid PAN format")
    if len(payload.address) < 10:
        raise HTTPException(status_code=400, detail="Address must be at least 10 characters")

    # 2. ClearTax Verification
    verification = await cleartax_verify_gstin(payload.gst)
    
    if not verification.get("verified") and ALLOW_DEV_GST_BYPASS:
        logger.warning(
            f"[DEV_GST_BYPASS] Allowing GST verify for gstin={payload.gst} in non-production mode"
        )
        verification["verified"] = True
        verification["source"] = "dev_bypass"
        verification["reason"] = ["GST verification bypassed in development"]
        verification["sts"] = verification.get("sts") or "dev_bypass"
    
    return {
        "success": True,
        "verified": verification["verified"],
        "verification": verification
    }

@router.put("/revenue/evaluations/{evaluation_id}/party/legal-profile", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_evaluation_party_legal_profile(
    evaluation_id: str, 
    payload: LegalProfilePayload, 
    db = Depends(get_db)
):
    """Update legal profile for the party associated with an evaluation (Strict ClearTax check)"""
    # 1. Server-side Validation (Offline)
    gst_regex = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    pan_regex = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"

    if len(payload.registeredName) < 3:
        raise HTTPException(status_code=400, detail="Registered Name must be at least 3 characters")
    if not re.match(gst_regex, payload.gst):
        raise HTTPException(status_code=400, detail="Invalid GSTIN format")
    if not re.match(pan_regex, payload.pan):
        raise HTTPException(status_code=400, detail="Invalid PAN format")
    if len(payload.address) < 10:
        raise HTTPException(status_code=400, detail="Address must be at least 10 characters")

    # 2. Re-verify ClearTax (Fool-proof)
    verification = await cleartax_verify_gstin(payload.gst)
    if not verification["verified"]:
        if ALLOW_DEV_GST_BYPASS:
            logger.warning(f"[DEV_GST_BYPASS] Allowing GST save for gstin={payload.gst} in non-production mode")
            verification["verified"] = True
            verification["source"] = "dev_bypass"
            verification["reason"] = ["GST verification bypassed in development"]
            verification["sts"] = verification.get("sts") or "dev_bypass"
        else:
            raise HTTPException(status_code=400, detail="GSTIN could not be verified as Active.")

    # 3. Load Evaluation
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    party_id = eval_data.get("party_id")
    if not party_id:
        raise HTTPException(status_code=400, detail="No party associated with this evaluation")

    # 4. Update Party Document (Safe + Idempotent)
    now = datetime.now(timezone.utc).isoformat()
    legal_profile = {
        "registered_name": payload.registeredName,
        "gst": payload.gst,
        "pan": payload.pan,
        "address": payload.address,
        "verified_at": payload.verifiedAt or now,
        "status": "verified",
        "verification_source": "cleartax",
        "gst_snapshot": {
            "sts": verification.get("sts"),
            "lgnm": verification.get("lgnm"),
            "tradeNam": verification.get("tradeNam"),
            "pradr": verification.get("pradr"),
            "rgdt": verification.get("rgdt"),
            "cxdt": verification.get("cxdt")
        }
    }

    await db.revenue_workflow_parties.update_one(
        {"party_id": party_id},
        {
            "$set": {
                "legal_profile": legal_profile,
                "legal_ok": True,
                "risk_score": 45, # Reduced from 52 to reflect successful verification
                "risk_reasons": ["Industry moderate risk", "Indian entity verified"],
                "updated_at": now
            }
        },
        upsert=True
    )

    # 4.5 Trigger Risk Re-calculation for this specific evaluation
    await compute_evaluation_risk(evaluation_id, db)

    # 5. Return updated readiness by calling validate_party_readiness after update
    party_readiness = await validate_party_readiness(party_id, db)
    
    return {
        "success": True, 
        "party_readiness": party_readiness
    }

@router.put("/parties/{party_id}/tax/verify", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def verify_party_tax(
    party_id: str,
    payload: Dict[str, str],
    db = Depends(get_db)
):
    """Manual PAN verification for Tax (Option 1)"""
    pan = payload.get("pan")
    if not pan:
        raise HTTPException(status_code=400, detail="PAN is required")
    
    pan_regex = r"^[A-Z]{5}[0-9]{4}[A-Z]{1}$"
    if not re.match(pan_regex, pan):
        raise HTTPException(status_code=400, detail="Invalid PAN format")

    now = datetime.now(timezone.utc).isoformat()
    await db.revenue_workflow_parties.update_one(
        {"party_id": party_id},
        {
            "$set": {
                "tax_ok": True,
                "tax_profile": {
                    "pan": pan,
                    "verified_at": now,
                    "method": "manual"
                },
                "updated_at": now
            }
        },
        upsert=True
    )

    # Trigger Risk Re-calculation for all evaluations linked to this party
    evaluations = await db.revenue_workflow_evaluations.find({"party_id": party_id}).to_list(100)
    for ev in evaluations:
        await compute_evaluation_risk(ev["evaluation_id"], db)

    party_readiness = await validate_party_readiness(party_id, db)
    return {"success": True, "party_readiness": party_readiness}

@router.put("/parties/{party_id}/compliance/verify", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def verify_party_compliance(
    party_id: str,
    payload: Dict[str, str],
    db = Depends(get_db)
):
    """Manual Compliance verification (Option 1)"""
    notes = payload.get("notes") or "Manual compliance check approved."
    
    now = datetime.now(timezone.utc).isoformat()
    await db.revenue_workflow_parties.update_one(
        {"party_id": party_id},
        {
            "$set": {
                "compliance_ok": True,
                "compliance_profile": {
                    "verified_at": now,
                    "method": "manual",
                    "notes": notes
                },
                "updated_at": now
            }
        },
        upsert=True
    )

    # Trigger Risk Re-calculation for all evaluations linked to this party
    evaluations = await db.revenue_workflow_evaluations.find({"party_id": party_id}).to_list(100)
    for ev in evaluations:
        await compute_evaluation_risk(ev["evaluation_id"], db)

    party_readiness = await validate_party_readiness(party_id, db)
    return {"success": True, "party_readiness": party_readiness}

@router.post("/revenue/evaluations/{evaluation_id}/submit", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def submit_evaluation_for_commit(evaluation_id: str, db = Depends(get_db)):
    """Submit evaluation for commit stage (Strict Governance)"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    if eval_data.get("status") == EvaluationStatus.BLOCKED.value:
        raise HTTPException(status_code=400, detail="Evaluation is blocked and cannot proceed")
        
    # Validation constraints
    if not eval_data.get("items"):
        raise HTTPException(status_code=400, detail="Evaluation must contain at least one item.")
        
    if float(eval_data.get("total_value", 0)) <= 0:
        raise HTTPException(status_code=400, detail="Evaluation total value must be greater than 0.")
        
    if float(eval_data.get("gross_margin_percent", 0)) < 0:
        raise HTTPException(status_code=400, detail="Evaluation cannot have a negative gross margin.")
    
    # 0. Proactively Refresh/Recalculate Economy to ensure zero-stale data for governance
    await recalculate_evaluation_economics(evaluation_id, db)
    
    # Re-fetch evaluation to get updated economics while securing party_id, lead_id, etc.
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    
    # 1. Check party readiness (Gated server-side)
    party_id = eval_data.get("party_id")
    readiness = await validate_party_readiness(party_id, db)
    
    if not readiness.get("legal_ok"):
        raise HTTPException(status_code=400, detail="Legal profile not verified")

    if not readiness.get("tax_ok"):
        raise HTTPException(status_code=400, detail="Tax profile not verified")

    if not readiness.get("compliance_ok"):
        raise HTTPException(status_code=400, detail="Compliance not verified")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Calculate approval matrix
    approvers = calculate_approval_matrix({
        "total_value": eval_data.get("total_value", 0),
        "gross_margin_percent": eval_data.get("gross_margin_percent", 100),
        "risk_score": eval_data.get("party_risk_score", 0)
    })
    
    # Create Commit record
    commit_data = {
        "commit_id": f"REV-COMMIT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "evaluation_id": evaluation_id,
        "lead_id": eval_data.get("lead_id"),
        "party_id": eval_data.get("party_id"),
        "total_value": eval_data.get("total_value"),
        "gross_margin_percent": eval_data.get("gross_margin_percent"),
        "risk_score": eval_data.get("party_risk_score"),
        "policy_flags": eval_data.get("policy_flags", []),
        "approvers": approvers,
        "status": CommitStatus.PENDING_APPROVAL.value if approvers else CommitStatus.APPROVED.value,
        "created_at": now,
        "updated_at": now
    }
    await db.revenue_workflow_commits.insert_one(commit_data)
    
    # Update evaluation status
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"status": "submitted_for_commit", "commit_id": commit_data["commit_id"], "updated_at": now}}
    )
    
    # Create Workspace Approval Tasks if needed
    if approvers:
        for approver in approvers:
            # Use the proper workspace approval format
            await create_workspace_approval(db, {
                "context_id": commit_data["commit_id"],
                "approval_type": "deal_approval",
                "title": f"Deal Approval: {eval_data.get('party_id')} - ₹{eval_data.get('total_value', 0):,.0f}",
                "description": f"Approval required: {approver['reason']}",
                "approver_role": approver["role"],
                "priority": "high",
                "workflow_ref": {"type": "commit", "id": commit_data["commit_id"], "stage": "commit"},
                "context_snapshot": {
                    "deal_value": eval_data.get("total_value"),
                    "margin": eval_data.get("gross_margin_percent"),
                    "party_id": eval_data.get("party_id")
                }
            })
    
    # Create intelligence signal for commit stage
    await create_intelligence_signal(db, {
        "type": "workflow_milestone",
        "category": "revenue",
        "title": f"Deal Submitted for Commit: {eval_data.get('party_id')}",
        "message": f"Deal worth ₹{eval_data.get('total_value', 0):,.0f} submitted for approval. {'Requires ' + str(len(approvers)) + ' approvals.' if approvers else 'Auto-approved.'}",
        "severity": "medium" if approvers else "low",
        "source": "workflow_engine",
        "context_type": "revenue_commit",
        "context_id": commit_data["commit_id"],
        "metadata": {"value": eval_data.get("total_value"), "approvers_count": len(approvers)}
    })
    
    # Create activity record
    await create_activity_record(db, {
        "action": "submitted",
        "entity_type": "commit",
        "entity_id": commit_data["commit_id"],
        "entity_name": f"Deal: {eval_data.get('party_id')}",
        "description": f"Deal submitted for commit approval - ₹{eval_data.get('total_value', 0):,.0f}",
        "module": "commerce"
    })
    
    return {
        "success": True,
        "message": "Evaluation submitted for commit",
        "commit_id": commit_data["commit_id"],
        "requires_approval": len(approvers) > 0,
        "approvers": approvers
    }

# --- COMMIT STAGE ---

@router.get("/revenue/commits")
async def get_revenue_commits(status: Optional[str] = None, db = Depends(get_db)):
    """Get all commits"""
    query = {} if not status else {"status": status}
    commits = await db.revenue_workflow_commits.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "commits": commits, "count": len(commits)}

@router.get("/revenue/commits/{commit_id}")
async def get_revenue_commit(commit_id: str, db = Depends(get_db)):
    """Get commit details"""
    commit = await db.revenue_workflow_commits.find_one({"commit_id": commit_id}, {"_id": 0})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    # Get evaluation details
    evaluation = await db.revenue_workflow_evaluations.find_one(
        {"evaluation_id": commit.get("evaluation_id")}, {"_id": 0}
    )
    
    return {"success": True, "commit": commit, "evaluation": evaluation}

@router.post("/revenue/commits/{commit_id}/approve", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def approve_revenue_commit(commit_id: str, approver_role: str, db = Depends(get_db)):
    """Approve a commit"""
    commit = await db.revenue_workflow_commits.find_one({"commit_id": commit_id})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    if commit.get("status") != CommitStatus.PENDING_APPROVAL.value:
        raise HTTPException(status_code=400, detail="Commit is not pending approval")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Record approval
    approvals = commit.get("approvals", [])
    approvals.append({
        "role": approver_role,
        "approved_at": now,
        "action": "approved"
    })
    
    # Check if all required approvals are done
    required_roles = [a["role"] for a in commit.get("approvers", [])]
    approved_roles = [a["role"] for a in approvals if a["action"] == "approved"]
    all_approved = all(role in approved_roles for role in required_roles)
    
    new_status = CommitStatus.APPROVED.value if all_approved else CommitStatus.PENDING_APPROVAL.value
    
    await db.revenue_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {"status": new_status, "approvals": approvals, "updated_at": now}}
    )
    
    # Update workspace approval task
    await db.workspace_approvals.update_one(
        {"context_id": commit_id, "assigned_to_role": approver_role},
        {"$set": {"status": "approved", "completed_at": now}}
    )
    
    return {"success": True, "message": "Approval recorded", "all_approved": all_approved}

@router.post("/revenue/commits/{commit_id}/reject", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def reject_revenue_commit(commit_id: str, approver_role: str, reason: str, db = Depends(get_db)):
    """Reject a commit - goes back to evaluation"""
    commit = await db.revenue_workflow_commits.find_one({"commit_id": commit_id})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    await db.revenue_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {
            "status": CommitStatus.REJECTED.value,
            "rejection_reason": reason,
            "rejected_by": approver_role,
            "rejected_at": now,
            "updated_at": now
        }}
    )
    
    # Reopen evaluation
    await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": commit.get("evaluation_id")},
        {"$set": {"status": EvaluationStatus.IN_PROGRESS.value, "updated_at": now}}
    )
    
    return {"success": True, "message": "Commit rejected, evaluation reopened"}

@router.post("/revenue/commits/{commit_id}/create-contract", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def create_contract_from_commit(commit_id: str, db = Depends(get_db)):
    """Create contract from approved commit"""
    commit = await db.revenue_workflow_commits.find_one({"commit_id": commit_id})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    if commit.get("status") != CommitStatus.APPROVED.value:
        raise HTTPException(status_code=400, detail="Commit must be approved before creating contract")
    
    # Get evaluation and party details
    evaluation = await db.revenue_workflow_evaluations.find_one({"evaluation_id": commit.get("evaluation_id")})
    party = await db.revenue_workflow_parties.find_one({"party_id": commit.get("party_id")}, {"_id": 0})
    
    now = datetime.now(timezone.utc).isoformat()
    
    contract_data = {
        "contract_id": f"REV-CONTRACT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "commit_id": commit_id,
        "evaluation_id": commit.get("evaluation_id"),
        "lead_id": commit.get("lead_id"),
        "party_id": commit.get("party_id"),
        "party_name": party.get("display_name") if party else None,
        "items": evaluation.get("items", []) if evaluation else [],
        "total_value": commit.get("total_value"),
        "currency": evaluation.get("currency", "INR") if evaluation else "INR",
        "payment_terms": "net-30",
        "status": ContractStatus.ACTIVE.value,
        "contract_stage": ContractStage.DRAFT.value,
        "created_at": now,
        "updated_at": now
    }
    await db.revenue_workflow_contracts.insert_one(contract_data)
    
    # Update commit
    await db.revenue_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {"contract_id": contract_data["contract_id"], "updated_at": now}}
    )
    
    # Create workspace task for contract review
    await create_workspace_task(db, {
        "context_id": contract_data["contract_id"],
        "task_type": "review",
        "title": f"Review Contract: {contract_data.get('party_name') or commit.get('party_id')}",
        "description": f"Review and prepare contract for signing - Value: ₹{contract_data.get('total_value', 0):,.0f}",
        "priority": "high",
        "source": "revenue_workflow",
        "workflow_ref": {"type": "contract", "id": contract_data["contract_id"], "stage": "contract"}
    })
    
    # Create intelligence signal
    await create_intelligence_signal(db, {
        "type": "workflow_milestone",
        "category": "revenue",
        "title": f"Contract Created: {contract_data.get('party_name') or commit.get('party_id')}",
        "message": f"Contract ready for review - Deal value ₹{contract_data.get('total_value', 0):,.0f}",
        "severity": "low",
        "source": "workflow_engine",
        "context_type": "revenue_contract",
        "context_id": contract_data["contract_id"]
    })
    
    # Create activity record
    await create_activity_record(db, {
        "action": "created",
        "entity_type": "contract",
        "entity_id": contract_data["contract_id"],
        "entity_name": f"Contract: {contract_data.get('party_name') or commit.get('party_id')}",
        "description": f"Contract created for ₹{contract_data.get('total_value', 0):,.0f} deal",
        "module": "commerce"
    })
    
    return {"success": True, "message": "Contract created", "contract_id": contract_data["contract_id"]}

# --- CONTRACT STAGE ---

@router.get("/revenue/contracts")
async def get_revenue_contracts(status: Optional[str] = None, db = Depends(get_db)):
    """Get all contracts"""
    query = {} if not status else {"status": status}
    contracts = await db.revenue_workflow_contracts.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "contracts": contracts, "count": len(contracts)}

@router.get("/revenue/contracts/{contract_id}")
async def get_revenue_contract(contract_id: str, db = Depends(get_db)):
    """Get contract details"""
    contract = await db.revenue_workflow_contracts.find_one({"contract_id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": contract}

async def append_audit_log(contract_id: str, action: str, performed_by: str, db, metadata: Optional[Dict[str, Any]] = None):
    """Append entry to contract audit log. Fail-safe."""
    try:
        log_entry = {
            "action": action,
            "performed_by": performed_by,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "metadata": metadata or {}
        }
        await db.revenue_workflow_contracts.update_one(
            {"contract_id": contract_id},
            {"$push": {"contract_audit_log": log_entry}}
        )
    except Exception as e:
        logging.error(f"Audit log failed for {contract_id}: {e}")

async def trigger_notification(event_type: str, payload: Dict[str, Any]):
    """Send asynchronous notification (Mocked)"""
    # In production, this would use a background task to send emails/slack messages
    logging.info(f"NOTIFICATION [{event_type}]: {json.dumps(payload)}")

@router.put("/revenue/contracts/{contract_id}", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_revenue_contract(contract_id: str, data: Dict[str, Any], db = Depends(get_db)):
    """Update contract terms with versioning"""
    contract = await db.revenue_workflow_contracts.find_one({"contract_id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.get("contract_status") == ContractStatus.SIGNED.value:
        raise HTTPException(status_code=400, detail="Cannot update a signed contract")

    now = datetime.now(timezone.utc).isoformat()
    current_stage = contract.get("contract_stage", ContractStage.DRAFT.value)
    
    update_data = {
        "contract_data": data.get("contract_data", contract.get("contract_data", {})),
        "onboarding_checklist": data.get("onboarding_checklist", contract.get("onboarding_checklist", {})),
        "updated_at": now
    }

    # Versioning logic: Trigger only if stage >= Review AND data is modified
    is_modified = any(update_data.get(k) != contract.get(k) for k in ["contract_data"])
    if current_stage in [ContractStage.REVIEW.value, ContractStage.SEND.value] and is_modified:
        # Save snapshot to versions array
        version_snapshot = {
            "version": contract.get("contract_version", 1),
            "contract_data": contract.get("contract_data"),
            "timestamp": contract.get("updated_at")
        }
        await db.revenue_workflow_contracts.update_one(
            {"contract_id": contract_id},
            {
                "$push": {"versions": version_snapshot},
                "$inc": {"contract_version": 1}
            }
        )

    await db.revenue_workflow_contracts.update_one({"contract_id": contract_id}, {"$set": update_data})
    
    # Log update
    await append_audit_log(contract_id, "CONTRACT_EDITED", "sales_user", db)
    
    return {"success": True, "message": "Contract updated"}

@router.post("/revenue/contracts/{contract_id}/review")
async def review_revenue_contract(contract_id: str, db = Depends(get_db)):
    """Move contract from Draft to Review"""
    result = await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id, "contract_stage": ContractStage.DRAFT.value},
        {"$set": {"contract_stage": ContractStage.REVIEW.value, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Invalid contract or stage transition")
    
    await append_audit_log(contract_id, "STAGE_CHANGED", "sales_user", db, {"to": "Review"})
    
    return {"success": True, "message": "Contract moved to Review"}

@router.post("/revenue/contracts/{contract_id}/send")
async def send_revenue_contract(contract_id: str, db = Depends(get_db)):
    """Generate secure token and move to Send stage"""
    secure_token = str(uuid.uuid4())
    result = await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id, "contract_stage": ContractStage.REVIEW.value},
        {"$set": {
            "contract_stage": ContractStage.SEND.value,
            "access_token": secure_token,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Invalid contract or stage transition")
    
    await append_audit_log(contract_id, "CONTRACT_SENT", "sales_user", db, {"token": secure_token})
    
    # Trigger notification
    await trigger_notification("CONTRACT_SENT", {"contract_id": contract_id, "token": secure_token})
    
    return {"success": True, "message": "Contract sent to client", "public_link": f"/portal/contract/{secure_token}"}

@router.post("/revenue/contracts/{contract_id}/sign")
async def sign_revenue_contract(
    contract_id: str, 
    request: Request,
    signer_name: str = Body(...),
    signer_email: str = Body(...),
    db = Depends(get_db)
):
    """Securely sign contract with metadata capture"""
    contract = await db.revenue_workflow_contracts.find_one({"contract_id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.get("onboarding_status") != "VERIFIED":
        raise HTTPException(status_code=400, detail="Onboarding must be VERIFIED before signing")

    now = datetime.now(timezone.utc).isoformat()
    # Generate contract hash (simple hash of contract_data for brevity)
    contract_content = json.dumps(contract.get("contract_data", {}), sort_keys=True)
    contract_hash = hashlib.sha256(contract_content.encode()).hexdigest()

    metadata = {
        "signer_name": signer_name,
        "signer_email": signer_email,
        "timestamp": now,
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent", "unknown"),
        "contract_hash": contract_hash
    }

    result = await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id, "contract_stage": ContractStage.SEND.value},
        {"$set": {
            "contract_stage": ContractStage.SIGN.value,
            "contract_status": ContractStatus.SIGNED.value,
            "acceptance_metadata": metadata,
            "signed_at": now,
            "updated_at": now
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Invalid contract or stage transition")
    
    # TRIGGER AUTO HANDOFF
    await db.revenue_workflow_leads.update_one(
        {"lead_id": contract["lead_id"]},
        {"$set": {"main_stage": "handoff", "stage": "handoff"}}
    )
    
    await append_audit_log(contract_id, "CONTRACT_SIGNED", "sales_user", db)
    await trigger_notification("CONTRACT_SIGNED", {"contract_id": contract_id})

    return {"success": True, "message": "Contract signed successfully"}

@router.post("/revenue/contracts/{contract_id}/reject")
async def reject_revenue_contract(contract_id: str, db = Depends(get_db)):
    """Move contract from Send back to Review"""
    result = await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id, "contract_stage": ContractStage.SEND.value},
        {"$set": {
            "contract_stage": ContractStage.REVIEW.value,
            "contract_status": ContractStatus.REJECTED.value,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Invalid contract or stage transition")
    return {"success": True, "message": "Contract rejected and returned to Review"}

@router.post("/revenue/contracts/{contract_id}/handoff", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def create_handoff_from_contract(contract_id: str, authorization: str = Header(None), db = Depends(get_db)):
    """Create handoff from signed contract and auto-create Work Order in Operations"""
    # Get org_id from auth token
    org_id = None
    if authorization:
        try:
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            org_id = payload.get("org_id")
        except:
            pass
    
    contract = await db.revenue_workflow_contracts.find_one({"contract_id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract.get("status") != ContractStatus.SIGNED.value:
        raise HTTPException(status_code=400, detail="Contract must be signed before handoff")
    
    # Use org_id from auth or contract
    work_order_org_id = org_id or contract.get("org_id")
    
    now = datetime.now(timezone.utc).isoformat()
    
    handoff_data = {
        "handoff_id": f"REV-HANDOFF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "contract_id": contract_id,
        "party_id": contract.get("party_id"),
        "party_name": contract.get("party_name"),
        "items": contract.get("items", []),
        "total_value": contract.get("total_value"),
        "payment_terms": contract.get("payment_terms"),
        "status": HandoffStatus.PENDING.value,
        # Operations handoff
        "operations_data": {
            "scope": contract.get("items", []),
            "sla": contract.get("special_terms")
        },
        # Finance handoff
        "finance_data": {
            "total_value": contract.get("total_value"),
            "currency": contract.get("currency"),
            "payment_terms": contract.get("payment_terms")
        },
        "created_at": now
    }
    await db.revenue_workflow_handoffs.insert_one(handoff_data)
    
    # Update contract
    await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id},
        {"$set": {"handoff_id": handoff_data["handoff_id"], "updated_at": now}}
    )
    
    # AUTO-CREATE WORK ORDER IN OPERATIONS
    work_order_id = f"WO-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Determine delivery type based on contract items
    delivery_type = "project"  # Default
    if contract.get("items"):
        item_types = [item.get("type", "").lower() for item in contract.get("items", [])]
        if any(t in ["service", "subscription", "retainer", "support"] for t in item_types):
            delivery_type = "service"
    
    # Build scope snapshot from contract
    scope_snapshot = {
        "deliverables": [item.get("name", item.get("description", "")) for item in contract.get("items", [])],
        "quantities": {item.get("name", ""): item.get("quantity", 1) for item in contract.get("items", [])},
        "total_value": contract.get("total_value"),
        "currency": contract.get("currency", "INR")
    }
    
    # Build SLA snapshot from contract terms
    sla_snapshot = {
        "payment_terms": contract.get("payment_terms"),
        "special_terms": contract.get("special_terms"),
        "validity_days": 90  # Default SLA period
    }
    
    # Calculate dates
    start_date = datetime.now().strftime("%Y-%m-%d")
    end_date = (datetime.now().replace(day=1) + timedelta(days=120)).strftime("%Y-%m-%d")
    
    work_order_data = {
        "work_order_id": work_order_id,
        "source_contract_id": contract_id,
        "source_type": "revenue",
        "party_id": contract.get("party_id"),
        "party_name": contract.get("party_name"),
        "delivery_type": delivery_type,
        "scope_snapshot": scope_snapshot,
        "sla_snapshot": sla_snapshot,
        "planned_start_date": start_date,
        "planned_end_date": end_date,
        "status": "pending",
        "risk_flag": False,
        "handoff_id": handoff_data["handoff_id"],
        "created_at": now,
        "org_id": work_order_org_id  # Use org_id from auth or contract
    }
    
    await db.ops_work_orders.insert_one(work_order_data)
    
    # Update handoff with work order reference
    await db.revenue_workflow_handoffs.update_one(
        {"handoff_id": handoff_data["handoff_id"]},
        {"$set": {"work_order_id": work_order_id}}
    )
    
    # Create workspace task for delivery team
    await create_workspace_task(db, {
        "context_id": handoff_data["handoff_id"],
        "task_type": "action",
        "title": f"Start Delivery: {contract.get('party_name') or contract.get('party_id')}",
        "description": f"New work order created. Begin delivery for contract worth ₹{contract.get('total_value', 0):,.0f}",
        "priority": "high",
        "source": "revenue_workflow",
        "workflow_ref": {"type": "handoff", "id": handoff_data["handoff_id"], "work_order_id": work_order_id}
    })
    
    # Create high-value intelligence signal for won deal
    await create_intelligence_signal(db, {
        "type": "deal_won",
        "category": "revenue",
        "title": f"Deal Won: {contract.get('party_name') or contract.get('party_id')}",
        "message": f"Revenue deal closed! Value: ₹{contract.get('total_value', 0):,.0f}. Work order {work_order_id} created.",
        "severity": "high",
        "source": "workflow_engine",
        "context_type": "revenue_handoff",
        "context_id": handoff_data["handoff_id"],
        "metadata": {
            "deal_value": contract.get("total_value"),
            "party_name": contract.get("party_name"),
            "work_order_id": work_order_id
        }
    })
    
    # Create activity record
    await create_activity_record(db, {
        "action": "completed",
        "entity_type": "deal",
        "entity_id": handoff_data["handoff_id"],
        "entity_name": f"Deal: {contract.get('party_name') or contract.get('party_id')}",
        "description": f"Deal closed and handed off to operations - ₹{contract.get('total_value', 0):,.0f}",
        "module": "commerce"
    })
    
    return {
        "success": True, 
        "message": "Handoff created and Work Order generated", 
        "handoff_id": handoff_data["handoff_id"],
        "work_order_id": work_order_id
    }

# --- HANDOFF STAGE ---

@router.get("/revenue/handoffs")
async def get_revenue_handoffs(status: Optional[str] = None, db = Depends(get_db)):
    """Get all handoffs"""
    query = {} if not status else {"status": status}
    handoffs = await db.revenue_workflow_handoffs.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "handoffs": handoffs, "count": len(handoffs)}

@router.get("/revenue/handoffs/{handoff_id}")
async def get_revenue_handoff(handoff_id: str, db = Depends(get_db)):
    """Get handoff details"""
    handoff = await db.revenue_workflow_handoffs.find_one({"handoff_id": handoff_id}, {"_id": 0})
    if not handoff:
        raise HTTPException(status_code=404, detail="Handoff not found")
    return {"success": True, "handoff": handoff}

@router.post("/revenue/handoffs/{handoff_id}/complete", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def complete_revenue_handoff(handoff_id: str, db = Depends(get_db)):
    """Mark handoff as completed"""
    now = datetime.now(timezone.utc).isoformat()
    result = await db.revenue_workflow_handoffs.update_one(
        {"handoff_id": handoff_id},
        {"$set": {"status": HandoffStatus.COMPLETED.value, "completed_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Handoff not found")
    return {"success": True, "message": "Handoff completed - Revenue workflow finished"}

# ============== PROCUREMENT WORKFLOW ROUTES ==============

# --- PROCURE STAGE ---

@router.get("/procure/requests")
async def get_procure_requests(status: Optional[str] = None, db = Depends(get_db)):
    """Get all procurement requests"""
    query = {} if not status else {"status": status}
    requests = await db.procure_workflow_requests.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "requests": requests, "count": len(requests)}

@router.post("/procure/requests", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def create_procure_request(request: ProcureRequestCreate, db = Depends(get_db)):
    """Create procurement request - Stage 1"""
    data = request.dict()
    data["request_id"] = f"PROC-REQ-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["status"] = ProcureRequestStatus.DRAFT.value
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = data["created_at"]
    
    await db.procure_workflow_requests.insert_one(data)
    return {"success": True, "message": "Request created", "request_id": data["request_id"]}

@router.get("/procure/requests/{request_id}")
async def get_procure_request(request_id: str, db = Depends(get_db)):
    """Get request details"""
    request = await db.procure_workflow_requests.find_one({"request_id": request_id}, {"_id": 0})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True, "request": request}

@router.put("/procure/requests/{request_id}", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_procure_request(request_id: str, request: ProcureRequestCreate, db = Depends(get_db)):
    """Update request"""
    data = request.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.procure_workflow_requests.update_one({"request_id": request_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True, "message": "Request updated"}

@router.post("/procure/requests/{request_id}/submit", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def submit_procure_request(request_id: str, db = Depends(get_db)):
    """Submit request for evaluation"""
    request = await db.procure_workflow_requests.find_one({"request_id": request_id})
    if not request:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if request.get("status") != ProcureRequestStatus.DRAFT.value:
        raise HTTPException(status_code=400, detail="Request must be in draft status")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create evaluation record
    eval_data = {
        "evaluation_id": f"PROC-EVAL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "request_id": request_id,
        "vendor_id": None,
        "vendor_status": "draft",
        "items": [],
        "total_cost": request.get("estimated_cost", 0),
        "status": EvaluationStatus.DRAFT.value,
        "created_at": now,
        "updated_at": now
    }
    await db.procure_workflow_evaluations.insert_one(eval_data)
    
    # Update request status
    await db.procure_workflow_requests.update_one(
        {"request_id": request_id},
        {"$set": {
            "status": ProcureRequestStatus.SUBMITTED.value,
            "evaluation_id": eval_data["evaluation_id"],
            "updated_at": now
        }}
    )
    
    return {"success": True, "message": "Request submitted for evaluation", "evaluation_id": eval_data["evaluation_id"]}

# --- PROCUREMENT EVALUATION ---

@router.get("/procure/evaluations")
async def get_procure_evaluations(status: Optional[str] = None, db = Depends(get_db)):
    """Get all procurement evaluations"""
    query = {} if not status else {"status": status}
    evaluations = await db.procure_workflow_evaluations.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "evaluations": evaluations, "count": len(evaluations)}

@router.get("/procure/evaluations/{evaluation_id}")
async def get_procure_evaluation(evaluation_id: str, db = Depends(get_db)):
    """Get evaluation with budget validation"""
    eval_data = await db.procure_workflow_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Get request for budget info
    request = await db.procure_workflow_requests.find_one({"request_id": eval_data.get("request_id")}, {"_id": 0})
    
    # Validate budget
    budget_info = await validate_budget(
        request.get("cost_center", "DEFAULT") if request else "DEFAULT",
        eval_data.get("total_cost", 0),
        db
    )
    
    return {
        "success": True,
        "evaluation": eval_data,
        "request": request,
        "budget_validation": budget_info
    }

@router.put("/procure/evaluations/{evaluation_id}", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def update_procure_evaluation(evaluation_id: str, data: ProcureEvaluationCreate, db = Depends(get_db)):
    """Update procurement evaluation"""
    eval_data = data.dict()
    
    # Calculate totals
    total_cost = sum(item.get("total_cost", 0) for item in eval_data.get("items", []))
    eval_data["total_cost"] = total_cost
    
    # Get request for budget validation
    existing_eval = await db.procure_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if existing_eval:
        request = await db.procure_workflow_requests.find_one({"request_id": existing_eval.get("request_id")})
        if request:
            budget_info = await validate_budget(request.get("cost_center", "DEFAULT"), total_cost, db)
            eval_data["budget_available"] = budget_info["budget_available"]
            eval_data["budget_variance"] = budget_info["variance"]
    
    # Check policy violations
    policy_flags = []
    if eval_data.get("budget_variance", 0) < 0:
        policy_flags.append("Budget exceeded")
        eval_data["status"] = EvaluationStatus.APPROVAL_REQUIRED.value
    
    if eval_data.get("vendor_risk_score", 0) > 70:
        policy_flags.append("High vendor risk")
        eval_data["status"] = EvaluationStatus.APPROVAL_REQUIRED.value
    
    if not eval_data.get("vendor_legal_ok") or not eval_data.get("vendor_tax_ok"):
        policy_flags.append("Vendor not fully compliant")
        eval_data["status"] = EvaluationStatus.BLOCKED.value
    
    eval_data["policy_flags"] = policy_flags
    eval_data["approval_required"] = len(policy_flags) > 0 and eval_data.get("status") != EvaluationStatus.BLOCKED.value
    eval_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.procure_workflow_evaluations.update_one({"evaluation_id": evaluation_id}, {"$set": eval_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return {"success": True, "message": "Evaluation updated", "status": eval_data.get("status")}

@router.post("/procure/evaluations/{evaluation_id}/submit", dependencies=[Depends(_require_role(["member", "manager", "admin", "owner"]))])
async def submit_procure_evaluation(evaluation_id: str, db = Depends(get_db)):
    """Submit evaluation for commit"""
    eval_data = await db.procure_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    if eval_data.get("status") == EvaluationStatus.BLOCKED.value:
        raise HTTPException(status_code=400, detail="Evaluation is blocked")
    
    if eval_data.get("vendor_status") != "verified":
        raise HTTPException(status_code=400, detail="Vendor must be verified")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Calculate approval matrix
    approvers = calculate_approval_matrix({
        "total_cost": eval_data.get("total_cost", 0),
        "risk_score": eval_data.get("vendor_risk_score", 0)
    })
    
    # Add budget-based approvers
    if eval_data.get("budget_variance", 0) < 0:
        approvers.append({"role": "Finance Head", "reason": "Budget overrun"})
    
    # Create commit record
    commit_data = {
        "commit_id": f"PROC-COMMIT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "evaluation_id": evaluation_id,
        "request_id": eval_data.get("request_id"),
        "vendor_id": eval_data.get("vendor_id"),
        "total_cost": eval_data.get("total_cost"),
        "budget_variance": eval_data.get("budget_variance"),
        "risk_score": eval_data.get("vendor_risk_score"),
        "policy_flags": eval_data.get("policy_flags", []),
        "approvers": approvers,
        "status": CommitStatus.PENDING_APPROVAL.value if approvers else CommitStatus.APPROVED.value,
        "created_at": now,
        "updated_at": now
    }
    await db.procure_workflow_commits.insert_one(commit_data)
    
    # Update evaluation
    await db.procure_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": {"status": "submitted_for_commit", "commit_id": commit_data["commit_id"], "updated_at": now}}
    )
    
    # Create approval tasks
    if approvers:
        for approver in approvers:
            await db.workspace_approvals.insert_one({
                "task_id": f"APPROVAL-{uuid.uuid4().hex[:8].upper()}",
                "task_type": "approval",
                "context_type": "procurement_commit",
                "context_id": commit_data["commit_id"],
                "title": f"Procurement Approval: ₹{eval_data.get('total_cost', 0):,.0f}",
                "description": approver["reason"],
                "assigned_to_role": approver["role"],
                "status": "pending",
                "created_at": now
            })
    
    return {
        "success": True,
        "message": "Evaluation submitted for commit",
        "commit_id": commit_data["commit_id"],
        "requires_approval": len(approvers) > 0
    }

# --- PROCUREMENT COMMIT ---

@router.get("/procure/commits")
async def get_procure_commits(status: Optional[str] = None, db = Depends(get_db)):
    """Get all procurement commits"""
    query = {} if not status else {"status": status}
    commits = await db.procure_workflow_commits.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "commits": commits, "count": len(commits)}

@router.get("/procure/commits/{commit_id}")
async def get_procure_commit(commit_id: str, db = Depends(get_db)):
    """Get commit details"""
    commit = await db.procure_workflow_commits.find_one({"commit_id": commit_id}, {"_id": 0})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "commit": commit}

@router.post("/procure/commits/{commit_id}/approve", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def approve_procure_commit(commit_id: str, approver_role: str, db = Depends(get_db)):
    """Approve procurement commit"""
    commit = await db.procure_workflow_commits.find_one({"commit_id": commit_id})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    approvals = commit.get("approvals", [])
    approvals.append({"role": approver_role, "approved_at": now, "action": "approved"})
    
    required_roles = [a["role"] for a in commit.get("approvers", [])]
    approved_roles = [a["role"] for a in approvals if a["action"] == "approved"]
    all_approved = all(role in approved_roles for role in required_roles)
    
    new_status = CommitStatus.APPROVED.value if all_approved else CommitStatus.PENDING_APPROVAL.value
    
    await db.procure_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {"status": new_status, "approvals": approvals, "updated_at": now}}
    )
    
    await db.workspace_approvals.update_one(
        {"context_id": commit_id, "assigned_to_role": approver_role},
        {"$set": {"status": "approved", "completed_at": now}}
    )
    
    return {"success": True, "message": "Approval recorded", "all_approved": all_approved}

@router.post("/procure/commits/{commit_id}/reject", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def reject_procure_commit(commit_id: str, approver_role: str, reason: str, db = Depends(get_db)):
    """Reject procurement commit"""
    now = datetime.now(timezone.utc).isoformat()
    
    result = await db.procure_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {
            "status": CommitStatus.REJECTED.value,
            "rejection_reason": reason,
            "rejected_by": approver_role,
            "rejected_at": now,
            "updated_at": now
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    # Get commit and reopen evaluation
    commit = await db.procure_workflow_commits.find_one({"commit_id": commit_id})
    if commit:
        await db.procure_workflow_evaluations.update_one(
            {"evaluation_id": commit.get("evaluation_id")},
            {"$set": {"status": EvaluationStatus.IN_PROGRESS.value, "updated_at": now}}
        )
    
    return {"success": True, "message": "Commit rejected"}

@router.post("/procure/commits/{commit_id}/create-contract", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def create_procure_contract(commit_id: str, db = Depends(get_db)):
    """Create procurement contract"""
    commit = await db.procure_workflow_commits.find_one({"commit_id": commit_id})
    if not commit:
        raise HTTPException(status_code=404, detail="Commit not found")
    
    if commit.get("status") != CommitStatus.APPROVED.value:
        raise HTTPException(status_code=400, detail="Commit must be approved")
    
    evaluation = await db.procure_workflow_evaluations.find_one({"evaluation_id": commit.get("evaluation_id")})
    
    now = datetime.now(timezone.utc).isoformat()
    
    contract_data = {
        "contract_id": f"PROC-CONTRACT-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "commit_id": commit_id,
        "evaluation_id": commit.get("evaluation_id"),
        "request_id": commit.get("request_id"),
        "vendor_id": commit.get("vendor_id"),
        "items": evaluation.get("items", []) if evaluation else [],
        "total_value": commit.get("total_cost"),
        "payment_terms": "net-30",
        "status": ContractStatus.ACTIVE.value,
        "contract_stage": ContractStage.DRAFT.value,
        "created_at": now,
        "updated_at": now
    }
    await db.procure_workflow_contracts.insert_one(contract_data)
    
    await db.procure_workflow_commits.update_one(
        {"commit_id": commit_id},
        {"$set": {"contract_id": contract_data["contract_id"], "updated_at": now}}
    )
    
    return {"success": True, "message": "Contract created", "contract_id": contract_data["contract_id"]}

# --- PROCUREMENT CONTRACT ---

@router.get("/procure/contracts")
async def get_procure_contracts(status: Optional[str] = None, db = Depends(get_db)):
    """Get all procurement contracts"""
    query = {} if not status else {"status": status}
    contracts = await db.procure_workflow_contracts.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "contracts": contracts, "count": len(contracts)}

@router.get("/procure/contracts/{contract_id}")
async def get_procure_contract(contract_id: str, db = Depends(get_db)):
    """Get contract details"""
    contract = await db.procure_workflow_contracts.find_one({"contract_id": contract_id}, {"_id": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": contract}

@router.put("/procure/contracts/{contract_id}", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def update_procure_contract(contract_id: str, data: ProcureContractCreate, db = Depends(get_db)):
    """Update procurement contract"""
    update_data = {
        "payment_terms": data.payment_terms,
        "delivery_terms": data.delivery_terms,
        "sla_terms": data.sla_terms,
        "penalty_clauses": data.penalty_clauses,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.procure_workflow_contracts.update_one({"contract_id": contract_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract updated"}

@router.post("/procure/contracts/{contract_id}/sign", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def sign_procure_contract(contract_id: str, db = Depends(get_db)):
    """Sign procurement contract"""
    now = datetime.now(timezone.utc).isoformat()
    result = await db.procure_workflow_contracts.update_one(
        {"contract_id": contract_id},
        {"$set": {"status": ContractStatus.SIGNED.value, "signed_at": now, "updated_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract signed"}

@router.post("/procure/contracts/{contract_id}/handoff", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def create_procure_handoff(contract_id: str, db = Depends(get_db)):
    """Create procurement handoff and auto-create Work Order in Operations"""
    contract = await db.procure_workflow_contracts.find_one({"contract_id": contract_id})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    
    if contract.get("status") != ContractStatus.SIGNED.value:
        raise HTTPException(status_code=400, detail="Contract must be signed")
    
    now = datetime.now(timezone.utc).isoformat()
    
    handoff_data = {
        "handoff_id": f"PROC-HANDOFF-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "contract_id": contract_id,
        "vendor_id": contract.get("vendor_id"),
        "vendor_name": contract.get("vendor_name"),
        "items": contract.get("items", []),
        "total_value": contract.get("total_value"),
        "status": HandoffStatus.PENDING.value,
        "operations_data": {
            "scope": contract.get("items", []),
            "delivery_terms": contract.get("delivery_terms")
        },
        "finance_data": {
            "total_value": contract.get("total_value"),
            "payment_terms": contract.get("payment_terms")
        },
        "created_at": now
    }
    await db.procure_workflow_handoffs.insert_one(handoff_data)
    
    await db.procure_workflow_contracts.update_one(
        {"contract_id": contract_id},
        {"$set": {"handoff_id": handoff_data["handoff_id"], "updated_at": now}}
    )
    
    # AUTO-CREATE WORK ORDER IN OPERATIONS
    work_order_id = f"WO-PROC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    
    # Build scope snapshot from procurement contract
    scope_snapshot = {
        "items": [item.get("name", item.get("description", "")) for item in contract.get("items", [])],
        "quantities": {item.get("name", ""): item.get("quantity", 1) for item in contract.get("items", [])},
        "total_value": contract.get("total_value"),
        "currency": contract.get("currency", "INR")
    }
    
    # Build SLA snapshot from contract terms
    sla_snapshot = {
        "delivery_terms": contract.get("delivery_terms"),
        "payment_terms": contract.get("payment_terms"),
        "delivery_days": contract.get("delivery_days", 30)
    }
    
    # Calculate dates
    start_date = datetime.now().strftime("%Y-%m-%d")
    delivery_days = contract.get("delivery_days", 30)
    end_date = (datetime.now() + timedelta(days=delivery_days)).strftime("%Y-%m-%d")
    
    work_order_data = {
        "work_order_id": work_order_id,
        "source_contract_id": contract_id,
        "source_type": "procurement",
        "party_id": contract.get("vendor_id"),
        "party_name": contract.get("vendor_name"),
        "delivery_type": "project",  # Procurement is typically project-based
        "scope_snapshot": scope_snapshot,
        "sla_snapshot": sla_snapshot,
        "planned_start_date": start_date,
        "planned_end_date": end_date,
        "status": "pending",
        "risk_flag": False,
        "handoff_id": handoff_data["handoff_id"],
        "created_at": now,
        "org_id": contract.get("org_id")
    }
    
    await db.ops_work_orders.insert_one(work_order_data)
    
    # Update handoff with work order reference
    await db.procure_workflow_handoffs.update_one(
        {"handoff_id": handoff_data["handoff_id"]},
        {"$set": {"work_order_id": work_order_id}}
    )
    
    return {
        "success": True, 
        "message": "Handoff created and Work Order generated", 
        "handoff_id": handoff_data["handoff_id"],
        "work_order_id": work_order_id
    }

# --- PROCUREMENT HANDOFF ---

@router.get("/procure/handoffs")
async def get_procure_handoffs(status: Optional[str] = None, db = Depends(get_db)):
    """Get all procurement handoffs"""
    query = {} if not status else {"status": status}
    handoffs = await db.procure_workflow_handoffs.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "handoffs": handoffs, "count": len(handoffs)}

@router.get("/procure/handoffs/{handoff_id}")
async def get_procure_handoff(handoff_id: str, db = Depends(get_db)):
    """Get handoff details"""
    handoff = await db.procure_workflow_handoffs.find_one({"handoff_id": handoff_id}, {"_id": 0})
    if not handoff:
        raise HTTPException(status_code=404, detail="Handoff not found")
    return {"success": True, "handoff": handoff}

@router.post("/procure/handoffs/{handoff_id}/complete", dependencies=[Depends(_require_role(["manager", "admin", "owner"]))])
async def complete_procure_handoff(handoff_id: str, db = Depends(get_db)):
    """Complete procurement handoff"""
    now = datetime.now(timezone.utc).isoformat()
    result = await db.procure_workflow_handoffs.update_one(
        {"handoff_id": handoff_id},
        {"$set": {"status": HandoffStatus.COMPLETED.value, "completed_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Handoff not found")
    return {"success": True, "message": "Handoff completed - Procurement workflow finished"}


@router.get("/revenue/public/contract/{token}")
async def get_public_contract(token: str, db = Depends(get_db)):
    """Publicly accessible contract view (unauthenticated)"""
    contract = await db.revenue_workflow_contracts.find_one({"access_token": token}, {"_id": 0, "access_token": 0})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": contract}

@router.post("/revenue/public/contract/{token}/sign")
async def sign_public_contract(
    token: str, 
    request: Request,
    background_tasks: BackgroundTasks,
    signer_name: str = Body(...),
    db = Depends(get_db)
):
    """Public signing endpoint (unauthenticated)"""
    contract = await db.revenue_workflow_contracts.find_one({"access_token": token})
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if contract.get("onboarding_status") != "VERIFIED":
        raise HTTPException(status_code=400, detail="Onboarding must be VERIFIED before signing")

    now = datetime.now(timezone.utc).isoformat()
    contract_content = json.dumps(contract.get("contract_data", {}), sort_keys=True)
    contract_hash = hashlib.sha256(contract_content.encode()).hexdigest()

    metadata = {
        "signer_name": signer_name,
        "signer_email": "client@public-access", 
        "timestamp": now,
        "ip_address": request.client.host,
        "user_agent": request.headers.get("user-agent", "unknown"),
        "contract_hash": contract_hash
    }

    result = await db.revenue_workflow_contracts.update_one(
        {"access_token": token, "contract_stage": ContractStage.SEND.value},
        {"$set": {
            "contract_stage": ContractStage.SIGN.value,
            "contract_status": ContractStatus.SIGNED.value,
            "acceptance_metadata": metadata,
            "signed_at": now,
            "updated_at": now
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=400, detail="Contract already signed or invalid link state")
    
    # TRIGGER AUTO HANDOFF
    await db.revenue_workflow_leads.update_one(
        {"lead_id": contract["lead_id"]},
        {"$set": {"main_stage": "handoff", "stage": "handoff"}}
    )
    
    # BACKGROUND TASKS
    background_tasks.add_task(append_audit_log, contract["contract_id"], "CONTRACT_SIGNED", f"client:{signer_name}", db)
    background_tasks.add_task(trigger_notification, "CONTRACT_SIGNED", {"contract_id": contract["contract_id"], "signer": signer_name})

    return {"success": True, "message": "Signature captured"}

# ============== SEED DATA ==============

@router.post("/seed-workflow-data", dependencies=[Depends(_require_role(["admin", "owner"]))])
async def seed_workflow_data(db = Depends(get_db)):
    """Seed sample data for Revenue and Procurement workflows"""
    now = datetime.now(timezone.utc).isoformat()
    
    # Clear existing workflow data
    await db.revenue_workflow_leads.delete_many({})
    await db.revenue_workflow_evaluations.delete_many({})
    await db.revenue_workflow_commits.delete_many({})
    await db.revenue_workflow_contracts.delete_many({})
    await db.revenue_workflow_handoffs.delete_many({})
    await db.revenue_workflow_parties.delete_many({})
    
    await db.procure_workflow_requests.delete_many({})
    await db.procure_workflow_evaluations.delete_many({})
    await db.procure_workflow_commits.delete_many({})
    await db.procure_workflow_contracts.delete_many({})
    await db.procure_workflow_handoffs.delete_many({})
    
    # Sample Revenue Leads
    revenue_leads = [
        {
            "lead_id": "REV-LEAD-001",
            "company_name": "TechCorp India Pvt Ltd",
            "website": "https://techcorp.in",
            "country": "India",
            "industry": "Technology",
            "contact_name": "Amit Sharma",
            "contact_email": "amit.sharma@techcorp.in",
            "contact_phone": "+91-9876543210",
            "lead_source": "website",
            "estimated_deal_value": 2500000,
            "expected_timeline": "3-6 months",
            "owner_id": "user-001",
            "stage": "qualified",
            "problem_identified": True,
            "budget_mentioned": "yes",
            "authority_known": True,
            "need_timeline": True,
            "next_action": "Schedule demo",
            "notes": "Interested in enterprise CRM solution",
            "created_at": now,
            "updated_at": now
        },
        {
            "lead_id": "REV-LEAD-002",
            "company_name": "GlobalTrade Exports",
            "country": "India",
            "industry": "Manufacturing",
            "contact_name": "Priya Reddy",
            "contact_email": "priya@globaltrade.com",
            "contact_phone": "+91-9123456789",
            "lead_source": "referral",
            "estimated_deal_value": 5000000,
            "expected_timeline": "6-12 months",
            "stage": "contacted",
            "problem_identified": True,
            "budget_mentioned": "unknown",
            "authority_known": False,
            "next_action": "Follow up call",
            "created_at": now,
            "updated_at": now
        },
        {
            "lead_id": "REV-LEAD-003",
            "company_name": "HealthPlus Hospitals",
            "country": "India",
            "industry": "Healthcare",
            "contact_name": "Dr. Rajesh Kumar",
            "contact_email": "rajesh@healthplus.org",
            "lead_source": "linkedin",
            "estimated_deal_value": 8000000,
            "expected_timeline": "0-3 months",
            "stage": "new",
            "problem_identified": False,
            "next_action": "Initial contact",
            "created_at": now,
            "updated_at": now
        }
    ]
    
    for lead in revenue_leads:
        await db.revenue_workflow_leads.insert_one(lead)
    
    # Sample Procurement Requests
    procure_requests = [
        {
            "request_id": "PROC-REQ-001",
            "title": "IT Infrastructure Upgrade",
            "description": "Server and networking equipment for new office",
            "request_type": "goods",
            "priority": "high",
            "needed_by_date": "2025-02-28",
            "requesting_department": "IT",
            "cost_center": "TECH",
            "estimated_cost": 1500000,
            "is_recurring": False,
            "status": "submitted",
            "created_at": now,
            "updated_at": now
        },
        {
            "request_id": "PROC-REQ-002",
            "title": "Annual Software Licenses",
            "description": "Renewal of enterprise software licenses",
            "request_type": "subscription",
            "priority": "medium",
            "requesting_department": "IT",
            "cost_center": "TECH",
            "estimated_cost": 800000,
            "is_recurring": True,
            "status": "draft",
            "created_at": now,
            "updated_at": now
        },
        {
            "request_id": "PROC-REQ-003",
            "title": "Office Furniture",
            "description": "Furniture for new floor expansion",
            "request_type": "goods",
            "priority": "low",
            "requesting_department": "Admin",
            "cost_center": "OPS",
            "estimated_cost": 500000,
            "status": "draft",
            "created_at": now,
            "updated_at": now
        }
    ]
    
    for req in procure_requests:
        await db.procure_workflow_requests.insert_one(req)
    
    return {
        "success": True,
        "message": "Workflow data seeded",
        "revenue_leads": len(revenue_leads),
        "procure_requests": len(procure_requests)
    }
