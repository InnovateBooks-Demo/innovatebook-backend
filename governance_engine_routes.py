"""
IB Commerce - Governance Engine
Commercial Constitution - Policies, Limits, Authority, Risk, Audit
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import os
from pymongo import MongoClient

router = APIRouter(prefix="/commerce/governance-engine", tags=["Governance Engine"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "innovatebooks")]

# Collections
policies_collection = db["governance_policies"]
limits_collection = db["governance_limits"]
authority_collection = db["governance_authority"]
risk_rules_collection = db["governance_risk_rules"]
audit_logs_collection = db["governance_audit_logs"]

# ==================== PYDANTIC MODELS ====================

class PolicyCreate(BaseModel):
    policy_name: str
    policy_type: str  # pricing, discount, margin, credit, compliance
    scope: str  # revenue, procurement, both
    condition_expression: str  # Rule logic expression
    enforcement_type: str  # HARD, SOFT
    violation_message: str
    threshold_value: Optional[float] = None
    active: bool = True

class LimitCreate(BaseModel):
    limit_name: str
    limit_type: str  # credit, spend, exposure, concentration
    scope: str  # party, project, department
    scope_id: Optional[str] = None  # Specific party_id, project_id, etc.
    threshold_value: float
    current_usage: float = 0
    hard_or_soft: str = "soft"  # hard, soft
    currency: str = "INR"
    active: bool = True

class AuthorityCreate(BaseModel):
    authority_name: str
    scope: str  # revenue, procurement, both
    condition_expression: str  # When this rule triggers
    approver_role: str  # finance_head, cfo, ceo, etc.
    approval_sequence: str = "single"  # single, sequential
    min_value: Optional[float] = None
    max_value: Optional[float] = None
    active: bool = True

class RiskRuleCreate(BaseModel):
    rule_name: str
    risk_type: str  # party, deal, structural
    threshold: int  # 0-100
    enforcement_type: str  # HARD, SOFT
    escalation_role: Optional[str] = None
    active: bool = True

class GovernanceEvaluation(BaseModel):
    context_type: str  # revenue, procurement
    context_id: str
    deal_value: float
    margin_percent: Optional[float] = None
    discount_percent: Optional[float] = None
    party_id: Optional[str] = None
    risk_score: Optional[int] = None
    department: Optional[str] = None

# ==================== HELPER FUNCTIONS ====================

def serialize_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

def log_governance_audit(context_type: str, context_id: str, action: str, decision: dict, actor: str = "system"):
    """Log governance decision for audit"""
    audit_logs_collection.insert_one({
        "context_type": context_type,
        "context_id": context_id,
        "action": action,
        "decision": decision,
        "actor": actor,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

def evaluate_policy(policy: dict, context: dict) -> dict:
    """Evaluate a single policy against context"""
    result = {"policy_id": policy["policy_id"], "policy_name": policy["policy_name"], "passed": True, "message": None}
    
    policy_type = policy.get("policy_type")
    threshold = policy.get("threshold_value")
    enforcement = policy.get("enforcement_type")
    
    if policy_type == "margin" and threshold:
        margin = context.get("margin_percent", 100)
        if margin < threshold:
            result["passed"] = False
            result["message"] = f"Margin {margin}% below minimum {threshold}%"
            result["enforcement"] = enforcement
    
    elif policy_type == "discount" and threshold:
        discount = context.get("discount_percent", 0)
        if discount > threshold:
            result["passed"] = False
            result["message"] = f"Discount {discount}% exceeds maximum {threshold}%"
            result["enforcement"] = enforcement
    
    elif policy_type == "pricing" and threshold:
        value = context.get("deal_value", 0)
        if value < threshold:
            result["passed"] = False
            result["message"] = f"Deal value below minimum threshold"
            result["enforcement"] = enforcement
    
    return result

def evaluate_limit(limit: dict, context: dict) -> dict:
    """Evaluate a single limit against context"""
    result = {"limit_id": limit["limit_id"], "limit_name": limit["limit_name"], "passed": True, "message": None}
    
    threshold = limit.get("threshold_value", 0)
    current = limit.get("current_usage", 0)
    proposed = context.get("deal_value", 0)
    
    post_deal = current + proposed
    
    if post_deal > threshold:
        result["passed"] = False
        result["message"] = f"Post-deal usage ({post_deal:,.0f}) exceeds limit ({threshold:,.0f})"
        result["enforcement"] = limit.get("hard_or_soft", "soft")
        result["current_usage"] = current
        result["proposed"] = proposed
        result["threshold"] = threshold
    
    return result

def resolve_authority(context: dict) -> List[dict]:
    """Resolve which approvers are required based on context"""
    approvers = []
    
    rules = list(authority_collection.find({"active": True}, {"_id": 0}))
    deal_value = context.get("deal_value", 0)
    margin = context.get("margin_percent", 100)
    risk_score = context.get("risk_score", 0)
    
    for rule in rules:
        triggered = False
        reason = None
        
        min_val = rule.get("min_value")
        max_val = rule.get("max_value")
        
        # Check value-based triggers
        if min_val and max_val:
            if min_val <= deal_value <= max_val:
                triggered = True
                reason = f"Deal value {deal_value:,.0f} in range {min_val:,.0f}-{max_val:,.0f}"
        elif min_val and deal_value >= min_val:
            triggered = True
            reason = f"Deal value {deal_value:,.0f} exceeds {min_val:,.0f}"
        
        # Check condition expression
        condition = rule.get("condition_expression", "")
        if "margin < 20" in condition and margin < 20:
            triggered = True
            reason = f"Low margin ({margin}%)"
        if "risk > 60" in condition and risk_score > 60:
            triggered = True
            reason = f"High risk score ({risk_score})"
        
        if triggered:
            approvers.append({
                "authority_id": rule["authority_id"],
                "authority_name": rule["authority_name"],
                "approver_role": rule["approver_role"],
                "reason": reason,
                "sequence": rule.get("approval_sequence", "single")
            })
    
    return approvers

# ==================== POLICIES CRUD ====================

@router.get("/policies")
async def list_policies(scope: Optional[str] = None, active: Optional[bool] = None):
    """List all policies"""
    query = {}
    if scope:
        query["$or"] = [{"scope": scope}, {"scope": "both"}]
    if active is not None:
        query["active"] = active
    
    policies = list(policies_collection.find(query, {"_id": 0}))
    stats = {
        "total": len(policies),
        "active": len([p for p in policies if p.get("active")]),
        "hard": len([p for p in policies if p.get("enforcement_type") == "HARD"]),
        "soft": len([p for p in policies if p.get("enforcement_type") == "SOFT"])
    }
    return {"success": True, "policies": policies, "stats": stats}

@router.post("/policies")
async def create_policy(policy: PolicyCreate):
    """Create a new policy"""
    count = policies_collection.count_documents({}) + 1
    policy_id = f"POL-{count:04d}"
    
    policy_doc = {
        **policy.dict(),
        "policy_id": policy_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    policies_collection.insert_one(policy_doc)
    return {"success": True, "policy_id": policy_id}

@router.get("/policies/{policy_id}")
async def get_policy(policy_id: str):
    """Get policy details"""
    policy = policies_collection.find_one({"policy_id": policy_id}, {"_id": 0})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "policy": policy}

@router.put("/policies/{policy_id}")
async def update_policy(policy_id: str, policy: PolicyCreate):
    """Update a policy"""
    result = policies_collection.update_one(
        {"policy_id": policy_id},
        {"$set": {**policy.dict(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "message": "Policy updated"}

@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: str):
    """Deactivate a policy"""
    result = policies_collection.update_one(
        {"policy_id": policy_id},
        {"$set": {"active": False, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "message": "Policy deactivated"}

# ==================== LIMITS CRUD ====================

@router.get("/limits")
async def list_limits(scope: Optional[str] = None, limit_type: Optional[str] = None):
    """List all limits"""
    query = {}
    if scope:
        query["scope"] = scope
    if limit_type:
        query["limit_type"] = limit_type
    
    limits = list(limits_collection.find(query, {"_id": 0}))
    
    # Calculate utilization for each limit
    for limit in limits:
        threshold = limit.get("threshold_value", 1)
        current = limit.get("current_usage", 0)
        limit["utilization_percent"] = round((current / threshold) * 100, 1) if threshold > 0 else 0
    
    return {"success": True, "limits": limits}

@router.post("/limits")
async def create_limit(limit: LimitCreate):
    """Create a new limit"""
    count = limits_collection.count_documents({}) + 1
    limit_id = f"LIM-{count:04d}"
    
    limit_doc = {
        **limit.dict(),
        "limit_id": limit_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    limits_collection.insert_one(limit_doc)
    return {"success": True, "limit_id": limit_id}

@router.get("/limits/{limit_id}")
async def get_limit(limit_id: str):
    """Get limit details"""
    limit = limits_collection.find_one({"limit_id": limit_id}, {"_id": 0})
    if not limit:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "limit": limit}

@router.put("/limits/{limit_id}")
async def update_limit(limit_id: str, limit: LimitCreate):
    """Update a limit"""
    result = limits_collection.update_one(
        {"limit_id": limit_id},
        {"$set": {**limit.dict(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "message": "Limit updated"}

@router.post("/limits/{limit_id}/update-usage")
async def update_limit_usage(limit_id: str, amount: float):
    """Update limit usage"""
    result = limits_collection.update_one(
        {"limit_id": limit_id},
        {"$inc": {"current_usage": amount}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "message": "Usage updated"}

# ==================== AUTHORITY CRUD ====================

@router.get("/authority")
async def list_authority_rules(scope: Optional[str] = None):
    """List all authority rules"""
    query = {}
    if scope:
        query["$or"] = [{"scope": scope}, {"scope": "both"}]
    
    rules = list(authority_collection.find(query, {"_id": 0}))
    return {"success": True, "authority_rules": rules}

@router.post("/authority")
async def create_authority_rule(authority: AuthorityCreate):
    """Create a new authority rule"""
    count = authority_collection.count_documents({}) + 1
    authority_id = f"AUTH-{count:04d}"
    
    authority_doc = {
        **authority.dict(),
        "authority_id": authority_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    authority_collection.insert_one(authority_doc)
    return {"success": True, "authority_id": authority_id}

@router.get("/authority/{authority_id}")
async def get_authority_rule(authority_id: str):
    """Get authority rule details"""
    rule = authority_collection.find_one({"authority_id": authority_id}, {"_id": 0})
    if not rule:
        raise HTTPException(status_code=404, detail="Authority rule not found")
    return {"success": True, "authority_rule": rule}

@router.put("/authority/{authority_id}")
async def update_authority_rule(authority_id: str, authority: AuthorityCreate):
    """Update an authority rule"""
    result = authority_collection.update_one(
        {"authority_id": authority_id},
        {"$set": {**authority.dict(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Authority rule not found")
    return {"success": True, "message": "Authority rule updated"}

# ==================== RISK RULES ====================

@router.get("/risk-rules")
async def list_risk_rules():
    """List all risk rules"""
    rules = list(risk_rules_collection.find({}, {"_id": 0}))
    return {"success": True, "risk_rules": rules}

@router.post("/risk-rules")
async def create_risk_rule(rule: RiskRuleCreate):
    """Create a new risk rule"""
    count = risk_rules_collection.count_documents({}) + 1
    rule_id = f"RISK-{count:04d}"
    
    rule_doc = {
        **rule.dict(),
        "rule_id": rule_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    risk_rules_collection.insert_one(rule_doc)
    return {"success": True, "rule_id": rule_id}

# ==================== AUDIT LOGS ====================

@router.get("/audit-logs")
async def list_audit_logs(
    context_type: Optional[str] = None,
    context_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List governance audit logs"""
    query = {}
    if context_type:
        query["context_type"] = context_type
    if context_id:
        query["context_id"] = context_id
    
    logs = list(audit_logs_collection.find(query, {"_id": 0}).sort("timestamp", -1).skip(skip).limit(limit))
    total = audit_logs_collection.count_documents(query)
    return {"success": True, "audit_logs": logs, "total": total}

# ==================== GOVERNANCE EVALUATION ENGINE ====================

@router.post("/evaluate")
async def evaluate_governance(evaluation: GovernanceEvaluation):
    """
    Main Governance Engine - Evaluates policies, limits, risk, and resolves authority
    Returns decision on whether to proceed, block, or require approval
    """
    context = evaluation.dict()
    
    result = {
        "allowed": True,
        "hard_blocks": [],
        "soft_blocks": [],
        "approvals_required": [],
        "warnings": [],
        "policy_results": [],
        "limit_results": [],
        "audit_reference": None
    }
    
    # 1. POLICY EVALUATION
    policies = list(policies_collection.find({"active": True}, {"_id": 0}))
    for policy in policies:
        # Check scope matches
        if policy["scope"] != "both" and policy["scope"] != evaluation.context_type:
            continue
        
        policy_result = evaluate_policy(policy, context)
        result["policy_results"].append(policy_result)
        
        if not policy_result["passed"]:
            if policy_result.get("enforcement") == "HARD":
                result["hard_blocks"].append(policy_result["message"])
                result["allowed"] = False
            else:
                result["soft_blocks"].append(policy_result["message"])
    
    # 2. LIMIT EVALUATION
    limits = list(limits_collection.find({"active": True}, {"_id": 0}))
    for limit in limits:
        limit_result = evaluate_limit(limit, context)
        result["limit_results"].append(limit_result)
        
        if not limit_result["passed"]:
            if limit_result.get("enforcement") == "hard":
                result["hard_blocks"].append(limit_result["message"])
                result["allowed"] = False
            else:
                result["soft_blocks"].append(limit_result["message"])
    
    # 3. RISK EVALUATION
    risk_score = evaluation.risk_score or 0
    risk_rules = list(risk_rules_collection.find({"active": True}, {"_id": 0}))
    for rule in risk_rules:
        if risk_score >= rule["threshold"]:
            if rule["enforcement_type"] == "HARD":
                result["hard_blocks"].append(f"Risk score ({risk_score}) exceeds hard threshold ({rule['threshold']})")
                result["allowed"] = False
            else:
                result["soft_blocks"].append(f"Risk score ({risk_score}) exceeds soft threshold ({rule['threshold']})")
                if rule.get("escalation_role"):
                    result["approvals_required"].append({
                        "role": rule["escalation_role"],
                        "reason": f"Risk escalation: score {risk_score}"
                    })
    
    # 4. AUTHORITY RESOLUTION
    if result["soft_blocks"] or evaluation.deal_value > 100000:  # Example threshold
        authority_approvers = resolve_authority(context)
        for approver in authority_approvers:
            result["approvals_required"].append({
                "role": approver["approver_role"],
                "reason": approver["reason"],
                "authority_id": approver["authority_id"]
            })
    
    # 5. AUDIT LOGGING
    audit_ref = f"GOV-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"
    log_governance_audit(
        evaluation.context_type,
        evaluation.context_id,
        "governance_evaluation",
        result,
        "system"
    )
    result["audit_reference"] = audit_ref
    
    return {"success": True, "governance_decision": result}

# ==================== SEED DATA ====================

@router.post("/seed-governance")
async def seed_governance():
    """Seed sample governance data"""
    
    # Seed Policies
    sample_policies = [
        {"policy_name": "Minimum Margin Policy", "policy_type": "margin", "scope": "revenue", "condition_expression": "margin_percent < threshold", "enforcement_type": "SOFT", "violation_message": "Margin below minimum threshold", "threshold_value": 20, "active": True},
        {"policy_name": "Maximum Discount Policy", "policy_type": "discount", "scope": "revenue", "condition_expression": "discount_percent > threshold", "enforcement_type": "SOFT", "violation_message": "Discount exceeds maximum allowed", "threshold_value": 15, "active": True},
        {"policy_name": "Minimum Deal Size", "policy_type": "pricing", "scope": "revenue", "condition_expression": "deal_value < threshold", "enforcement_type": "HARD", "violation_message": "Deal size below minimum", "threshold_value": 10000, "active": True},
        {"policy_name": "Credit Terms Policy", "policy_type": "credit", "scope": "revenue", "condition_expression": "credit_days > 60", "enforcement_type": "SOFT", "violation_message": "Credit terms exceed standard", "threshold_value": 60, "active": True},
        {"policy_name": "Procurement Approval Policy", "policy_type": "compliance", "scope": "procurement", "condition_expression": "value > threshold", "enforcement_type": "SOFT", "violation_message": "Procurement requires additional approval", "threshold_value": 500000, "active": True}
    ]
    
    for i, policy in enumerate(sample_policies):
        policy_id = f"POL-{i+1:04d}"
        if not policies_collection.find_one({"policy_id": policy_id}):
            policies_collection.insert_one({**policy, "policy_id": policy_id, "created_at": datetime.now(timezone.utc).isoformat()})
    
    # Seed Limits
    sample_limits = [
        {"limit_name": "Customer Credit Limit - Standard", "limit_type": "credit", "scope": "party", "threshold_value": 1000000, "current_usage": 450000, "hard_or_soft": "soft", "currency": "INR", "active": True},
        {"limit_name": "IT Department Spend Limit", "limit_type": "spend", "scope": "department", "scope_id": "IT", "threshold_value": 5000000, "current_usage": 3200000, "hard_or_soft": "soft", "currency": "INR", "active": True},
        {"limit_name": "Single Vendor Exposure", "limit_type": "exposure", "scope": "party", "threshold_value": 10000000, "current_usage": 2500000, "hard_or_soft": "hard", "currency": "INR", "active": True},
        {"limit_name": "Concentration Limit - Geography", "limit_type": "concentration", "scope": "department", "threshold_value": 50, "current_usage": 35, "hard_or_soft": "soft", "currency": "percent", "active": True}
    ]
    
    for i, limit in enumerate(sample_limits):
        limit_id = f"LIM-{i+1:04d}"
        if not limits_collection.find_one({"limit_id": limit_id}):
            limits_collection.insert_one({**limit, "limit_id": limit_id, "created_at": datetime.now(timezone.utc).isoformat()})
    
    # Seed Authority Rules
    sample_authority = [
        {"authority_name": "Finance Head Approval", "scope": "revenue", "condition_expression": "margin < 20 OR value > 500000", "approver_role": "finance_head", "approval_sequence": "single", "min_value": 500000, "max_value": 2000000, "active": True},
        {"authority_name": "CFO Approval", "scope": "both", "condition_expression": "value > 2000000 OR risk > 60", "approver_role": "cfo", "approval_sequence": "single", "min_value": 2000000, "max_value": 10000000, "active": True},
        {"authority_name": "CEO Approval", "scope": "both", "condition_expression": "value > 10000000", "approver_role": "ceo", "approval_sequence": "single", "min_value": 10000000, "active": True},
        {"authority_name": "Procurement Head", "scope": "procurement", "condition_expression": "value > 100000", "approver_role": "procurement_head", "approval_sequence": "single", "min_value": 100000, "max_value": 1000000, "active": True}
    ]
    
    for i, auth in enumerate(sample_authority):
        auth_id = f"AUTH-{i+1:04d}"
        if not authority_collection.find_one({"authority_id": auth_id}):
            authority_collection.insert_one({**auth, "authority_id": auth_id, "created_at": datetime.now(timezone.utc).isoformat()})
    
    # Seed Risk Rules
    sample_risk_rules = [
        {"rule_name": "High Risk Block", "risk_type": "party", "threshold": 80, "enforcement_type": "HARD", "active": True},
        {"rule_name": "Medium Risk Escalation", "risk_type": "party", "threshold": 60, "enforcement_type": "SOFT", "escalation_role": "risk_committee", "active": True},
        {"rule_name": "Deal Risk Warning", "risk_type": "deal", "threshold": 50, "enforcement_type": "SOFT", "escalation_role": "finance_head", "active": True}
    ]
    
    for i, rule in enumerate(sample_risk_rules):
        rule_id = f"RISK-{i+1:04d}"
        if not risk_rules_collection.find_one({"rule_id": rule_id}):
            risk_rules_collection.insert_one({**rule, "rule_id": rule_id, "created_at": datetime.now(timezone.utc).isoformat()})
    
    return {"success": True, "message": "Governance data seeded"}
