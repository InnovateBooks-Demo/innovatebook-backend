"""
IB Commerce - Revenue & Procurement 5-Stage Workflow
Full enterprise-grade implementation with stage transitions, governance, and approvals
"""

from fastapi import APIRouter, HTTPException, Depends, Query, Header, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import logging
import uuid
import jwt
import os

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/commerce/workflow", tags=["IB Commerce Workflow"])


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
    NEW = "new"
    CONTACTED = "contacted"
    QUALIFIED = "qualified"
    DISQUALIFIED = "disqualified"

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

class ContractStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    PENDING_ACCEPTANCE = "pending_acceptance"
    SIGNED = "signed"
    CANCELLED = "cancelled"

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

class RevenueStatusUpdate(BaseModel):
    """Gated status update with force option"""
    status: str
    force: bool = False

class RevenueEvaluationItem(BaseModel):
    """Item in evaluation"""
    item_id: str
    item_name: str
    quantity: int = 1
    unit_price: float = 0
    discount_percent: float = 0
    net_price: float = 0
    expected_cost: float = 0
    margin_percent: float = 0

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
    # Handoff targets
    operations_notes: Optional[str] = None
    finance_notes: Optional[str] = None

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

async def validate_party_readiness(party_id: str, db) -> Dict[str, Any]:
    """Mock party validation - returns party readiness status"""
    # Mock validation - in real implementation, query party service
    return {
        "party_id": party_id,
        "status": "verified" if party_id else "draft",
        "legal_ok": True,
        "tax_ok": True,
        "compliance_ok": True,
        "risk_score": 25
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
    
    # Deal size risk
    deal_value = data.get("total_value", 0) or data.get("total_cost", 0) or 0
    if deal_value > 10000000:
        score += 30
        size_risk = "high"
    elif deal_value > 1000000:
        score += 15
        size_risk = "medium"
    else:
        size_risk = "low"
    
    # Geography risk
    region = data.get("region", "")
    if region and region.lower() in ["international", "export"]:
        score += 20
        geo_risk = "high"
    else:
        geo_risk = "low"
    
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
    db = Depends(get_db)
):
    """Get all revenue leads with optional filters. Each lead includes _computed fields:
    _computed.age_days, _computed.inactive_days, _computed.health, _computed.icp_fit"""
    query = {}
    if stage:
        query["stage"] = stage
    if owner_id:
        query["owner_id"] = owner_id

    leads = await db.revenue_workflow_leads.find(query, {"_id": 0}).to_list(1000)

    # Attach computed fields (rule-based, no ML)
    leads = [_compute_lead_fields(lead) for lead in leads]

    return {"success": True, "leads": leads, "count": len(leads)}

@router.post("/revenue/leads")
async def create_revenue_lead(lead: RevenueLeadCreate, db = Depends(get_db)):
    """Create a new revenue lead - Stage 1"""
    data = lead.dict()
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
        "workflow_ref": {"type": "lead", "id": data["lead_id"], "stage": "new"}
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
        "metadata": {"company": data.get("company_name"), "value": data.get("estimated_deal_value")}
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

# ── Required CSV columns (only company_name is truly required) ─────────────────
_REQUIRED_COLS = {"company_name"}
_OPTIONAL_COLS = {
    "contact_name", "email", "phone", "website", "country",
    "industry", "company_size", "source", "lead_source",
    "expected_deal_value", "timeline", "expected_timeline", "notes",
}
_ALL_EXPECTED = _REQUIRED_COLS | _OPTIONAL_COLS


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# ENDPOINT 1 — Preview
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@router.post("/revenue/leads/import/preview")
async def import_leads_preview(
    file: UploadFile = File(...),
    db=Depends(get_db),
):
    """
    Parse CSV, run duplicate detection, suggest industries.
    Does NOT write to leads DB.
    Returns import_token referencing preview data stored in MongoDB.
    """
    # ── Read & decode ─────────────────────────────────────────────────────────
    raw_bytes = await file.read()
    try:
        text = raw_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text = raw_bytes.decode("latin-1")

    reader = _csv.DictReader(_io.StringIO(text))
    if not reader.fieldnames:
        raise HTTPException(400, detail="CSV is empty or has no header row.")

    # Normalise header names (strip whitespace, lowercase)
    headers = {h.strip().lower(): h for h in reader.fieldnames}

    missing_required = _REQUIRED_COLS - set(headers.keys())
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

    # ── Pre-load existing DB leads → maps (not sets) ──────────────────────────
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

    # ── Parse + check each row ────────────────────────────────────────────────
    preview_rows: list[dict] = []
    errors:       list[dict] = []

    # Batch-level dedup maps (same CSV duplicates)
    batch_emails:  dict[str, int] = {}   # email  → first row_index
    batch_domains: dict[str, int] = {}
    batch_names:   dict[str, int] = {}

    total_rows      = len(raw_rows)
    duplicate_count = 0
    invalid_count   = 0

    for idx, raw_row in enumerate(raw_rows):
        # Normalise column names to lowercase
        row = {k.strip().lower(): (v or "").strip() for k, v in raw_row.items()}

        company_name = row.get("company_name", "")
        if not company_name:
            errors.append({"row_index": idx, "reason": "company_name is required"})
            invalid_count += 1
            continue

        contact_name = row.get("contact_name", "")
        email        = (row.get("email", "")).lower()
        phone        = row.get("phone", "") or row.get("contact_phone", "")
        website      = row.get("website", "")
        country      = row.get("country", "")
        company_size = row.get("company_size", "")
        source       = row.get("source") or row.get("lead_source") or "imported"
        timeline     = row.get("expected_timeline") or row.get("timeline") or "3-6 months"
        notes        = row.get("notes", "")
        raw_value    = row.get("expected_deal_value", "")
        deal_value   = _parse_float(raw_value)

        # Industry: use from CSV if present, else suggest
        industry_from_csv = row.get("industry", "")
        industry_suggested_flag = False
        industry_confidence = None
        if industry_from_csv:
            industry = industry_from_csv
        else:
            industry, industry_confidence = _suggest_industry(company_name, website)
            industry_suggested_flag = industry is not None

        # ── Duplicate detection ───────────────────────────────────────────────
        dup_flag   = False
        dup_reason = None
        matched_id = None

        domain = _extract_domain(website)
        norm   = _norm_name(company_name)

        # Check DB maps first (strong match = email, domain; weak = name)
        if email and email in email_to_lead_id:
            dup_flag, dup_reason, matched_id = True, "email_match", email_to_lead_id[email]
        elif domain and domain in domain_to_lead_id:
            dup_flag, dup_reason, matched_id = True, "domain_match", domain_to_lead_id[domain]
        elif norm and norm in name_to_lead_id:
            dup_flag, dup_reason, matched_id = True, "company_name_match", name_to_lead_id[norm]
        # Check within this batch
        elif email and email in batch_emails:
            dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_emails[email]}"
        elif domain and domain in batch_domains:
            dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_domains[domain]}"
        elif norm and norm in batch_names:
            dup_flag, dup_reason, matched_id = True, "batch_duplicate", f"row_{batch_names[norm]}"

        # Register in batch maps (only first occurrence)
        if email  and email  not in batch_emails:  batch_emails[email]   = idx
        if domain and domain not in batch_domains: batch_domains[domain] = idx
        if norm   and norm   not in batch_names:   batch_names[norm]     = idx

        if dup_flag:
            duplicate_count += 1

        preview_rows.append({
            "row_index":           idx,
            "company_name":        company_name,
            "contact_name":        contact_name,
            "email":               email,
            "phone":               phone,
            "website":             website,
            "country":             country,
            "industry":            industry,
            "industry_suggested":  industry_suggested_flag,
            "industry_confidence": industry_confidence,
            "company_size":        company_size,
            "lead_source":         source,
            "estimated_deal_value": deal_value,
            "expected_timeline":   timeline,
            "notes":               notes,
            "duplicate_flag":      dup_flag,
            "duplicate_reason":    dup_reason,
            "matched_lead_id":     matched_id,
            "invalid_reason":      None,
        })

    # ── Store preview in MongoDB cache ────────────────────────────────────────
    import_token = await _cache_store(db, preview_rows)

    return {
        "success": True,
        "import_token": import_token,
        "summary": {
            "total_rows":     total_rows,
            "valid_rows":     len(preview_rows),
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

@router.post("/revenue/leads/import/commit")
async def import_leads_commit(
    req: ImportCommitRequest,
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
            "stage":                "imported",
            "company_name":         row["company_name"],
            "website":              row["website"] or None,
            "country":              row["country"] or "",
            "industry":             row["industry"] or None,
            "company_size":         row["company_size"] or None,
            "contact_name":         row["contact_name"] or "",
            "contact_email":        row["email"] or None,
            "contact_phone":        row["phone"] or None,
            "lead_source":          row["lead_source"] or "imported",
            "estimated_deal_value": row["estimated_deal_value"] or 0,
            "expected_timeline":    row["expected_timeline"] or "3-6 months",
            "notes":                row["notes"] or "",
            "created_at":           now_iso,
            "updated_at":           now_iso,
            "last_activity_at":     now_iso,
            "age_days":             0,
            # Qualification defaults
            "problem_identified":   False,
            "budget_mentioned":     "unknown",
            "authority_known":      False,
            "need_timeline":        False,
            "qualification": {
                "budget_confirmed":    False,
                "authority_confirmed": False,
                "timeline_confirmed":  False,
                "need_confirmed":      False,
            },
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
async def get_revenue_lead(lead_id: str, db = Depends(get_db)):
    """Get lead details with recomputed fields"""
    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Recompute computed fields on the fly for detail view accuracy
    lead = _compute_lead_fields(lead)
    return {"success": True, "lead": lead}

@router.get("/revenue/leads/{lead_id}/activities")
async def get_lead_activities(lead_id: str, db = Depends(get_db)):
    """Get all manual activities for a lead (sorted desc)"""
    activities = await db.revenue_workflow_activities.find(
        {"lead_id": lead_id}, {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"success": True, "activities": activities}

@router.post("/revenue/leads/{lead_id}/activities")
async def log_lead_activity(lead_id: str, act: RevenueActivityCreate, db = Depends(get_db)):
    """Log a new activity, recompute signals and update lead health"""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    # 1. Store activity
    activity_doc = {
        "activity_id": f"ACT-LOG-{uuid.uuid4().hex[:6].upper()}",
        "lead_id": lead_id,
        "type": act.type,
        "summary": act.summary,
        "created_at": now_iso,
        "actor_id": "system"  # In real app, pulled from auth token
    }
    await db.revenue_workflow_activities.insert_one(activity_doc)
    
    # 2. Get all activities to re-run signal extraction
    all_acts = await db.revenue_workflow_activities.find({"lead_id": lead_id}).to_list(100)
    summaries = [a["summary"] for a in all_acts]
    signals = _extract_signals(summaries)
    
    # 3. Update Lead (last_activity_at, signals, _computed)
    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    lead["last_activity_at"] = now_iso
    lead["signals"] = signals
    # Set individual fields for existing UI to pick up if it doesn't use the signals object
    lead["budget_mentioned"] = signals["budget_signal"]
    lead["authority_known"] = signals["authority_known"]
    
    lead = _compute_lead_fields(lead)
    
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
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

@router.patch("/revenue/leads/{lead_id}/status")
async def update_lead_status(lead_id: str, req: RevenueStatusUpdate, db = Depends(get_db)):
    """Gated status update with BANT signal validation"""
    now_iso = datetime.now(timezone.utc).isoformat()
    
    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    old_stage = lead.get("stage", "new")
    new_status = req.status
    
    # Rules: Gating
    if new_status in ["contacted", "qualified"]:
        act_count = await db.revenue_workflow_activities.count_documents({"lead_id": lead_id})
        if act_count == 0:
            raise HTTPException(status_code=400, detail="Cannot advance lead stage without at least one activity logged.")

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

    # Execute update
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "stage": new_status,
            "updated_at": now_iso,
            "qualification_override": req.force
        }}
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

@router.put("/revenue/leads/{lead_id}")
async def update_revenue_lead(lead_id: str, lead: RevenueLeadCreate, db = Depends(get_db)):
    """Update lead"""
    data = lead.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.revenue_workflow_leads.update_one({"lead_id": lead_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": "Lead updated"}

@router.delete("/revenue/leads/{lead_id}")
async def delete_revenue_lead(lead_id: str, db = Depends(get_db)):
    """Delete a revenue lead"""
    result = await db.revenue_workflow_leads.delete_one({"lead_id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Optional: Clean up related activities and audits
    await db.revenue_workflow_activities.delete_many({"lead_id": lead_id})
    await db.revenue_workflow_audits.delete_many({"lead_id": lead_id})
    
    return {"success": True, "message": "Lead deleted successfully"}

@router.put("/revenue/leads/{lead_id}/stage")
async def change_lead_stage(lead_id: str, new_stage: str, db = Depends(get_db)):
    """Change lead stage"""
    valid_stages = [s.value for s in LeadStage]
    if new_stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")
    
    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
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
        {"lead_id": lead_id},
        {"$set": {"stage": new_stage, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    return {"success": True, "message": f"Stage changed to {new_stage}"}

@router.post("/revenue/leads/{lead_id}/convert-to-evaluate")
async def convert_lead_to_evaluate(lead_id: str, db = Depends(get_db)):
    """Convert qualified lead to evaluation - Creates draft party and evaluation record"""
    lead = await db.revenue_workflow_leads.find_one({"lead_id": lead_id})
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
        "created_at": now
    }
    await db.revenue_workflow_parties.insert_one(party_data)
    
    # Create Evaluation record
    eval_data = {
        "evaluation_id": f"REV-EVAL-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "lead_id": lead_id,
        "party_id": party_data["party_id"],
        "deal_type": "one-time",
        "currency": "INR",
        "status": EvaluationStatus.DRAFT.value,
        "items": [],
        "total_value": lead.get("estimated_deal_value", 0),
        "created_at": now,
        "updated_at": now
    }
    await db.revenue_workflow_evaluations.insert_one(eval_data)
    
    # Lock Lead
    await db.revenue_workflow_leads.update_one(
        {"lead_id": lead_id},
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
        "party_id": party_data["party_id"]
    }

# --- EVALUATION STAGE ---

@router.get("/revenue/evaluations")
async def get_revenue_evaluations(status: Optional[str] = None, db = Depends(get_db)):
    """Get all evaluations"""
    query = {} if not status else {"status": status}
    evaluations = await db.revenue_workflow_evaluations.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "evaluations": evaluations, "count": len(evaluations)}

@router.get("/revenue/evaluations/{evaluation_id}")
async def get_revenue_evaluation(evaluation_id: str, db = Depends(get_db)):
    """Get evaluation details with party readiness and risk assessment"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    # Get party readiness
    party_readiness = await validate_party_readiness(eval_data.get("party_id"), db)
    
    # Calculate risk
    risk_data = await calculate_risk_score(eval_data)
    
    return {
        "success": True,
        "evaluation": eval_data,
        "party_readiness": party_readiness,
        "risk_assessment": risk_data
    }

@router.put("/revenue/evaluations/{evaluation_id}")
async def update_revenue_evaluation(evaluation_id: str, data: RevenueEvaluationCreate, db = Depends(get_db)):
    """Update evaluation with items and calculations"""
    eval_data = data.dict()
    
    # Calculate totals from items
    total_value = sum(item.get("net_price", 0) for item in eval_data.get("items", []))
    total_cost = sum(item.get("expected_cost", 0) for item in eval_data.get("items", []))
    gross_margin = ((total_value - total_cost) / total_value * 100) if total_value > 0 else 0
    
    eval_data["total_value"] = total_value
    eval_data["gross_margin_percent"] = round(gross_margin, 2)
    
    # Calculate risk
    risk_data = await calculate_risk_score(eval_data)
    eval_data["party_risk_score"] = risk_data["total_score"]
    eval_data["deal_size_risk"] = risk_data["deal_size_risk"]
    eval_data["geography_risk"] = risk_data["geography_risk"]
    
    # Check for policy violations
    policy_flags = []
    if gross_margin < 15:
        policy_flags.append("Margin below hard floor (15%)")
        eval_data["status"] = EvaluationStatus.BLOCKED.value
    elif gross_margin < 25:
        policy_flags.append("Margin below soft floor (25%)")
        eval_data["status"] = EvaluationStatus.APPROVAL_REQUIRED.value
    
    if risk_data["total_score"] > 70:
        policy_flags.append("High risk score")
        eval_data["status"] = EvaluationStatus.APPROVAL_REQUIRED.value
    
    eval_data["policy_flags"] = policy_flags
    eval_data["approval_required"] = len(policy_flags) > 0 and eval_data.get("status") != EvaluationStatus.BLOCKED.value
    eval_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.revenue_workflow_evaluations.update_one(
        {"evaluation_id": evaluation_id},
        {"$set": eval_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    return {"success": True, "message": "Evaluation updated", "status": eval_data.get("status")}

@router.post("/revenue/evaluations/{evaluation_id}/submit")
async def submit_evaluation_for_commit(evaluation_id: str, db = Depends(get_db)):
    """Submit evaluation for commit stage"""
    eval_data = await db.revenue_workflow_evaluations.find_one({"evaluation_id": evaluation_id})
    if not eval_data:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    
    if eval_data.get("status") == EvaluationStatus.BLOCKED.value:
        raise HTTPException(status_code=400, detail="Evaluation is blocked and cannot proceed")
    
    # Check party readiness
    party_readiness = await validate_party_readiness(eval_data.get("party_id"), db)
    if party_readiness.get("status") != "verified":
        raise HTTPException(status_code=400, detail="Party must be verified before proceeding")
    
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

@router.post("/revenue/commits/{commit_id}/approve")
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

@router.post("/revenue/commits/{commit_id}/reject")
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

@router.post("/revenue/commits/{commit_id}/create-contract")
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
        "status": ContractStatus.DRAFT.value,
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

@router.put("/revenue/contracts/{contract_id}")
async def update_revenue_contract(contract_id: str, data: RevenueContractCreate, db = Depends(get_db)):
    """Update contract terms (only legal text editable)"""
    update_data = {
        "payment_terms": data.payment_terms,
        "special_terms": data.special_terms,
        "legal_clauses": data.legal_clauses,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    result = await db.revenue_workflow_contracts.update_one({"contract_id": contract_id}, {"$set": update_data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract updated"}

@router.post("/revenue/contracts/{contract_id}/sign")
async def sign_revenue_contract(contract_id: str, db = Depends(get_db)):
    """Sign contract - freeze it"""
    now = datetime.now(timezone.utc).isoformat()
    result = await db.revenue_workflow_contracts.update_one(
        {"contract_id": contract_id},
        {"$set": {"status": ContractStatus.SIGNED.value, "signed_at": now, "updated_at": now}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract signed"}

@router.post("/revenue/contracts/{contract_id}/handoff")
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

@router.post("/revenue/handoffs/{handoff_id}/complete")
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

@router.post("/procure/requests")
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

@router.put("/procure/requests/{request_id}")
async def update_procure_request(request_id: str, request: ProcureRequestCreate, db = Depends(get_db)):
    """Update request"""
    data = request.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.procure_workflow_requests.update_one({"request_id": request_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Request not found")
    return {"success": True, "message": "Request updated"}

@router.post("/procure/requests/{request_id}/submit")
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

@router.put("/procure/evaluations/{evaluation_id}")
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

@router.post("/procure/evaluations/{evaluation_id}/submit")
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

@router.post("/procure/commits/{commit_id}/approve")
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

@router.post("/procure/commits/{commit_id}/reject")
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

@router.post("/procure/commits/{commit_id}/create-contract")
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
        "status": ContractStatus.DRAFT.value,
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

@router.put("/procure/contracts/{contract_id}")
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

@router.post("/procure/contracts/{contract_id}/sign")
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

@router.post("/procure/contracts/{contract_id}/handoff")
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

@router.post("/procure/handoffs/{handoff_id}/complete")
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

# ============== SEED DATA ==============

@router.post("/seed-workflow-data")
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
