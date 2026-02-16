"""
IB Commerce - Enhanced Parties Module
Commercial Identity & Readiness Engine
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from bson import ObjectId
import os
from pymongo import MongoClient

router = APIRouter(prefix="/commerce/parties-engine", tags=["Parties Engine"])

# MongoDB connection
MONGO_URL = os.environ.get("MONGO_URL")
client = MongoClient(MONGO_URL)
db = client[os.environ.get("DB_NAME", "innovatebooks")]

# Collections
parties_collection = db["parties_engine"]
party_identities = db["party_identities"]
party_legal_profiles = db["party_legal_profiles"]
party_tax_profiles = db["party_tax_profiles"]
party_risk_profiles = db["party_risk_profiles"]
party_compliance_profiles = db["party_compliance_profiles"]
party_audit_logs = db["party_audit_logs"]

# ==================== PYDANTIC MODELS ====================

class PartyIdentity(BaseModel):
    legal_name: str
    trade_name: Optional[str] = None
    country: str
    registration_number: Optional[str] = None
    business_type: Optional[str] = None  # private_limited, public_limited, llp, partnership, proprietorship
    address: Optional[Dict[str, Any]] = None

class LegalProfile(BaseModel):
    incorporation_certificate: Optional[str] = None
    certificate_verified: bool = False
    authorized_signatories: List[Dict[str, Any]] = []
    board_resolution_required: bool = False
    board_resolution_uploaded: bool = False
    contract_signing_authority: Optional[str] = None
    verification_status: str = "pending"  # pending, verified, rejected
    verified_at: Optional[str] = None
    verified_by: Optional[str] = None

class TaxProfile(BaseModel):
    tax_residency: Optional[str] = None
    tax_id: Optional[str] = None  # GST/VAT/EIN
    tax_id_type: Optional[str] = None  # gst, vat, ein, pan
    tax_classification: Optional[str] = None  # regular, composition, exempt
    withholding_applicable: bool = False
    withholding_rate: Optional[float] = None
    verification_status: str = "pending"
    verified_at: Optional[str] = None

class RiskProfile(BaseModel):
    country_risk: int = 0  # 0-100
    industry_risk: int = 0
    credit_risk: int = 0
    exposure_risk: int = 0
    sanctions_risk: int = 0
    risk_score: int = 0  # Computed
    risk_level: str = "low"  # low, medium, high
    risk_factors: List[str] = []
    last_evaluated_at: Optional[str] = None

class ComplianceProfile(BaseModel):
    kyc_status: str = "pending"  # pending, verified, rejected
    kyc_documents: List[Dict[str, Any]] = []
    aml_check_status: str = "pending"
    aml_last_checked: Optional[str] = None
    esg_status: Optional[str] = None
    sanctions_screened: bool = False
    sanctions_clear: bool = False
    sanctions_last_screened: Optional[str] = None
    verification_status: str = "pending"
    last_screened_at: Optional[str] = None

class PartyCreate(BaseModel):
    legal_name: str
    country: str
    party_roles: List[str] = []  # customer, vendor, partner, channel
    registration_number: Optional[str] = None
    created_source: str = "manual"  # manual, lead, procurement

class PartyUpdate(BaseModel):
    legal_name: Optional[str] = None
    country: Optional[str] = None
    party_roles: Optional[List[str]] = None
    registration_number: Optional[str] = None
    status: Optional[str] = None

class PartyReadiness(BaseModel):
    party_id: str
    readiness_status: str  # not_ready, minimum_ready, fully_verified
    missing_profiles: List[str] = []
    blocking_reasons: List[str] = []
    can_evaluate: bool = False
    can_commit: bool = False
    can_contract: bool = False

# ==================== HELPER FUNCTIONS ====================

def calculate_risk_score(risk_profile: dict) -> tuple:
    """Calculate overall risk score and level"""
    weights = {
        "country_risk": 0.2,
        "industry_risk": 0.15,
        "credit_risk": 0.3,
        "exposure_risk": 0.2,
        "sanctions_risk": 0.15
    }
    
    score = sum(
        risk_profile.get(key, 0) * weight 
        for key, weight in weights.items()
    )
    
    if score >= 70:
        level = "high"
    elif score >= 40:
        level = "medium"
    else:
        level = "low"
    
    return int(score), level

def calculate_readiness(party_id: str) -> PartyReadiness:
    """Calculate party readiness for commercial transactions"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        return PartyReadiness(
            party_id=party_id,
            readiness_status="not_ready",
            blocking_reasons=["Party not found"]
        )
    
    identity = party_identities.find_one({"party_id": party_id})
    legal = party_legal_profiles.find_one({"party_id": party_id})
    tax = party_tax_profiles.find_one({"party_id": party_id})
    risk = party_risk_profiles.find_one({"party_id": party_id})
    compliance = party_compliance_profiles.find_one({"party_id": party_id})
    
    missing = []
    blocking = []
    
    # Check Identity (required for evaluation)
    if not identity or not identity.get("legal_name"):
        missing.append("identity")
        blocking.append("Identity profile is missing")
    
    # Check Legal (required for contracts)
    if not legal:
        missing.append("legal")
    elif legal.get("verification_status") != "verified":
        blocking.append("Legal profile not verified - contracts blocked")
    
    # Check Tax (required for contracts)
    if not tax:
        missing.append("tax")
    elif tax.get("verification_status") != "verified":
        blocking.append("Tax profile not verified - invoicing blocked")
    
    # Check Risk
    if not risk:
        missing.append("risk")
    else:
        risk_score = risk.get("risk_score", 0)
        if risk_score >= 80:  # Hard threshold
            blocking.append(f"Risk score ({risk_score}) exceeds hard limit - party blocked")
        elif risk_score >= 60:  # Soft threshold
            blocking.append(f"Risk score ({risk_score}) exceeds soft limit - approval escalation required")
    
    # Check Compliance
    if not compliance:
        missing.append("compliance")
    elif compliance.get("verification_status") == "rejected":
        blocking.append("Compliance failed - party blocked")
    elif compliance.get("verification_status") != "verified":
        blocking.append("Compliance not verified - commit blocked")
    
    # Determine readiness status
    has_identity = "identity" not in missing
    has_legal = "legal" not in missing
    compliance_ok = compliance and compliance.get("verification_status") != "rejected"
    risk_ok = not risk or risk.get("risk_score", 0) < 80
    
    # Minimum Ready: Identity + Legal present + Compliance not failed + Risk < hard limit
    minimum_ready = has_identity and has_legal and compliance_ok and risk_ok
    
    # Fully Verified: All profiles verified
    legal_verified = legal and legal.get("verification_status") == "verified"
    tax_verified = tax and tax.get("verification_status") == "verified"
    compliance_verified = compliance and compliance.get("verification_status") == "verified"
    risk_low = not risk or risk.get("risk_score", 0) < 60
    
    fully_verified = minimum_ready and legal_verified and tax_verified and compliance_verified and risk_low
    
    if fully_verified:
        readiness_status = "fully_verified"
    elif minimum_ready:
        readiness_status = "minimum_ready"
    else:
        readiness_status = "not_ready"
    
    return PartyReadiness(
        party_id=party_id,
        readiness_status=readiness_status,
        missing_profiles=missing,
        blocking_reasons=blocking,
        can_evaluate=minimum_ready,
        can_commit=minimum_ready and compliance_verified,
        can_contract=fully_verified
    )

def log_audit(party_id: str, action: str, actor: str, details: dict = None):
    """Log audit entry for party changes"""
    party_audit_logs.insert_one({
        "party_id": party_id,
        "action": action,
        "actor": actor,
        "details": details or {},
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

def serialize_doc(doc):
    """Remove MongoDB _id from document"""
    if doc and "_id" in doc:
        del doc["_id"]
    return doc

# ==================== PARTY CRUD ENDPOINTS ====================

@router.get("/parties")
async def list_parties(
    status: Optional[str] = None,
    role: Optional[str] = None,
    country: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """List all parties with filtering"""
    query = {}
    if status:
        query["status"] = status
    if role:
        query["party_roles"] = role
    if country:
        query["country"] = country
    if search:
        query["$or"] = [
            {"legal_name": {"$regex": search, "$options": "i"}},
            {"party_id": {"$regex": search, "$options": "i"}}
        ]
    
    parties = list(parties_collection.find(query, {"_id": 0}).skip(skip).limit(limit))
    total = parties_collection.count_documents(query)
    
    # Add readiness info to each party
    for party in parties:
        readiness = calculate_readiness(party["party_id"])
        party["readiness"] = {
            "status": readiness.readiness_status,
            "can_evaluate": readiness.can_evaluate,
            "can_commit": readiness.can_commit,
            "can_contract": readiness.can_contract
        }
    
    # Get stats
    stats = {
        "total": parties_collection.count_documents({}),
        "draft": parties_collection.count_documents({"status": "draft"}),
        "minimum_ready": parties_collection.count_documents({"status": "minimum_ready"}),
        "verified": parties_collection.count_documents({"status": "verified"}),
        "restricted": parties_collection.count_documents({"status": "restricted"}),
        "blocked": parties_collection.count_documents({"status": "blocked"})
    }
    
    return {"success": True, "parties": parties, "total": total, "stats": stats}

@router.post("/parties")
async def create_party(party: PartyCreate):
    """Create a new party"""
    # Generate party ID
    count = parties_collection.count_documents({}) + 1
    party_id = f"PTY-{count:04d}"
    
    party_doc = {
        "party_id": party_id,
        "legal_name": party.legal_name,
        "country": party.country,
        "party_roles": party.party_roles,
        "registration_number": party.registration_number,
        "status": "draft",
        "created_source": party.created_source,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    parties_collection.insert_one(party_doc)
    
    # Create empty identity profile
    party_identities.insert_one({
        "party_id": party_id,
        "legal_name": party.legal_name,
        "country": party.country,
        "registration_number": party.registration_number,
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    log_audit(party_id, "party_created", "system", {"source": party.created_source})
    
    return {"success": True, "party_id": party_id, "party": serialize_doc(party_doc)}

@router.get("/parties/{party_id}")
async def get_party(party_id: str):
    """Get party details with all profiles"""
    party = parties_collection.find_one({"party_id": party_id}, {"_id": 0})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    # Get all profiles
    identity = serialize_doc(party_identities.find_one({"party_id": party_id}))
    legal = serialize_doc(party_legal_profiles.find_one({"party_id": party_id}))
    tax = serialize_doc(party_tax_profiles.find_one({"party_id": party_id}))
    risk = serialize_doc(party_risk_profiles.find_one({"party_id": party_id}))
    compliance = serialize_doc(party_compliance_profiles.find_one({"party_id": party_id}))
    
    # Calculate readiness
    readiness = calculate_readiness(party_id)
    
    # Get recent audit logs
    audits = list(party_audit_logs.find(
        {"party_id": party_id}, {"_id": 0}
    ).sort("timestamp", -1).limit(20))
    
    return {
        "success": True,
        "party": party,
        "profiles": {
            "identity": identity,
            "legal": legal,
            "tax": tax,
            "risk": risk,
            "compliance": compliance
        },
        "readiness": readiness.dict(),
        "audit_logs": audits
    }

@router.put("/parties/{party_id}")
async def update_party(party_id: str, update: PartyUpdate):
    """Update party basic info"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    update_data = {k: v for k, v in update.dict().items() if v is not None}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    parties_collection.update_one(
        {"party_id": party_id},
        {"$set": update_data}
    )
    
    log_audit(party_id, "party_updated", "system", {"changes": list(update_data.keys())})
    
    return {"success": True, "message": "Party updated"}

@router.delete("/parties/{party_id}")
async def delete_party(party_id: str):
    """Delete a party (soft delete - set to blocked)"""
    result = parties_collection.update_one(
        {"party_id": party_id},
        {"$set": {"status": "blocked", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Party not found")
    
    log_audit(party_id, "party_blocked", "system", {"reason": "deleted"})
    return {"success": True, "message": "Party blocked"}

# ==================== IDENTITY PROFILE ====================

@router.get("/parties/{party_id}/identity")
async def get_identity(party_id: str):
    """Get party identity profile"""
    identity = party_identities.find_one({"party_id": party_id}, {"_id": 0})
    return {"success": True, "identity": identity}

@router.put("/parties/{party_id}/identity")
async def update_identity(party_id: str, identity: PartyIdentity):
    """Update party identity profile"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    identity_doc = identity.dict()
    identity_doc["party_id"] = party_id
    identity_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    party_identities.update_one(
        {"party_id": party_id},
        {"$set": identity_doc},
        upsert=True
    )
    
    # Also update party's legal_name if changed
    if identity.legal_name:
        parties_collection.update_one(
            {"party_id": party_id},
            {"$set": {"legal_name": identity.legal_name, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    log_audit(party_id, "identity_updated", "system")
    return {"success": True, "message": "Identity updated"}

# ==================== LEGAL PROFILE ====================

@router.get("/parties/{party_id}/legal")
async def get_legal_profile(party_id: str):
    """Get party legal profile"""
    legal = party_legal_profiles.find_one({"party_id": party_id}, {"_id": 0})
    return {"success": True, "legal": legal}

@router.put("/parties/{party_id}/legal")
async def update_legal_profile(party_id: str, legal: LegalProfile):
    """Update party legal profile"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    legal_doc = legal.dict()
    legal_doc["party_id"] = party_id
    legal_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    party_legal_profiles.update_one(
        {"party_id": party_id},
        {"$set": legal_doc},
        upsert=True
    )
    
    log_audit(party_id, "legal_profile_updated", "system")
    return {"success": True, "message": "Legal profile updated"}

@router.post("/parties/{party_id}/legal/verify")
async def verify_legal_profile(party_id: str, verified_by: str = "system"):
    """Verify party legal profile"""
    party_legal_profiles.update_one(
        {"party_id": party_id},
        {"$set": {
            "verification_status": "verified",
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "verified_by": verified_by
        }}
    )
    
    log_audit(party_id, "legal_verified", verified_by)
    return {"success": True, "message": "Legal profile verified"}

# ==================== TAX PROFILE ====================

@router.get("/parties/{party_id}/tax")
async def get_tax_profile(party_id: str):
    """Get party tax profile"""
    tax = party_tax_profiles.find_one({"party_id": party_id}, {"_id": 0})
    return {"success": True, "tax": tax}

@router.put("/parties/{party_id}/tax")
async def update_tax_profile(party_id: str, tax: TaxProfile):
    """Update party tax profile"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    tax_doc = tax.dict()
    tax_doc["party_id"] = party_id
    tax_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    party_tax_profiles.update_one(
        {"party_id": party_id},
        {"$set": tax_doc},
        upsert=True
    )
    
    log_audit(party_id, "tax_profile_updated", "system")
    return {"success": True, "message": "Tax profile updated"}

@router.post("/parties/{party_id}/tax/verify")
async def verify_tax_profile(party_id: str, verified_by: str = "system"):
    """Verify party tax profile"""
    party_tax_profiles.update_one(
        {"party_id": party_id},
        {"$set": {
            "verification_status": "verified",
            "verified_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    log_audit(party_id, "tax_verified", verified_by)
    return {"success": True, "message": "Tax profile verified"}

# ==================== RISK PROFILE ====================

@router.get("/parties/{party_id}/risk")
async def get_risk_profile(party_id: str):
    """Get party risk profile"""
    risk = party_risk_profiles.find_one({"party_id": party_id}, {"_id": 0})
    return {"success": True, "risk": risk}

@router.put("/parties/{party_id}/risk")
async def update_risk_profile(party_id: str, risk: RiskProfile):
    """Update party risk profile"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    risk_doc = risk.dict()
    
    # Calculate risk score
    score, level = calculate_risk_score(risk_doc)
    risk_doc["risk_score"] = score
    risk_doc["risk_level"] = level
    risk_doc["party_id"] = party_id
    risk_doc["last_evaluated_at"] = datetime.now(timezone.utc).isoformat()
    
    party_risk_profiles.update_one(
        {"party_id": party_id},
        {"$set": risk_doc},
        upsert=True
    )
    
    # Update party status if risk is too high
    if score >= 80:
        parties_collection.update_one(
            {"party_id": party_id},
            {"$set": {"status": "blocked", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
        log_audit(party_id, "party_blocked_high_risk", "system", {"risk_score": score})
    elif score >= 60:
        parties_collection.update_one(
            {"party_id": party_id},
            {"$set": {"status": "restricted", "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    
    log_audit(party_id, "risk_profile_updated", "system", {"score": score, "level": level})
    return {"success": True, "message": "Risk profile updated", "risk_score": score, "risk_level": level}

# ==================== COMPLIANCE PROFILE ====================

@router.get("/parties/{party_id}/compliance")
async def get_compliance_profile(party_id: str):
    """Get party compliance profile"""
    compliance = party_compliance_profiles.find_one({"party_id": party_id}, {"_id": 0})
    return {"success": True, "compliance": compliance}

@router.put("/parties/{party_id}/compliance")
async def update_compliance_profile(party_id: str, compliance: ComplianceProfile):
    """Update party compliance profile"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    compliance_doc = compliance.dict()
    compliance_doc["party_id"] = party_id
    compliance_doc["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    party_compliance_profiles.update_one(
        {"party_id": party_id},
        {"$set": compliance_doc},
        upsert=True
    )
    
    log_audit(party_id, "compliance_profile_updated", "system")
    return {"success": True, "message": "Compliance profile updated"}

@router.post("/parties/{party_id}/compliance/verify")
async def verify_compliance(party_id: str, verified_by: str = "system"):
    """Verify party compliance"""
    party_compliance_profiles.update_one(
        {"party_id": party_id},
        {"$set": {
            "verification_status": "verified",
            "kyc_status": "verified",
            "aml_check_status": "verified",
            "sanctions_screened": True,
            "sanctions_clear": True,
            "last_screened_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    log_audit(party_id, "compliance_verified", verified_by)
    return {"success": True, "message": "Compliance verified"}

# ==================== READINESS ENGINE ====================

@router.get("/parties/{party_id}/readiness")
async def get_readiness(party_id: str):
    """Get party readiness status"""
    readiness = calculate_readiness(party_id)
    return {"success": True, "readiness": readiness.dict()}

@router.post("/parties/{party_id}/update-status")
async def update_party_status(party_id: str):
    """Recalculate and update party status based on profiles"""
    party = parties_collection.find_one({"party_id": party_id})
    if not party:
        raise HTTPException(status_code=404, detail="Party not found")
    
    readiness = calculate_readiness(party_id)
    
    # Map readiness to status
    if readiness.readiness_status == "fully_verified":
        new_status = "verified"
    elif readiness.readiness_status == "minimum_ready":
        new_status = "minimum_ready"
    else:
        new_status = "draft"
    
    # Check if blocked or restricted from risk
    risk = party_risk_profiles.find_one({"party_id": party_id})
    if risk:
        if risk.get("risk_score", 0) >= 80:
            new_status = "blocked"
        elif risk.get("risk_score", 0) >= 60:
            new_status = "restricted"
    
    parties_collection.update_one(
        {"party_id": party_id},
        {"$set": {"status": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    log_audit(party_id, "status_updated", "system", {"new_status": new_status})
    return {"success": True, "status": new_status, "readiness": readiness.dict()}

# ==================== SEED DATA ====================

@router.post("/seed-parties")
async def seed_parties():
    """Seed sample parties with profiles"""
    sample_parties = [
        {
            "legal_name": "TechCorp India Pvt Ltd",
            "country": "India",
            "party_roles": ["customer"],
            "registration_number": "U72200MH2015PTC123456",
            "status": "verified",
            "created_source": "manual"
        },
        {
            "legal_name": "Global Supplies LLC",
            "country": "USA",
            "party_roles": ["vendor"],
            "registration_number": "EIN-12-3456789",
            "status": "minimum_ready",
            "created_source": "procurement"
        },
        {
            "legal_name": "Asia Pacific Partners",
            "country": "Singapore",
            "party_roles": ["partner", "channel"],
            "registration_number": "SG-2020-12345",
            "status": "draft",
            "created_source": "manual"
        },
        {
            "legal_name": "European Tech Solutions GmbH",
            "country": "Germany",
            "party_roles": ["vendor", "partner"],
            "registration_number": "DE-HRB-123456",
            "status": "restricted",
            "created_source": "lead"
        },
        {
            "legal_name": "BlockedCorp Industries",
            "country": "Russia",
            "party_roles": ["vendor"],
            "registration_number": "RU-2019-99999",
            "status": "blocked",
            "created_source": "manual"
        }
    ]
    
    created = []
    for i, party_data in enumerate(sample_parties):
        party_id = f"PTY-{i+1:04d}"
        
        # Check if exists
        if parties_collection.find_one({"party_id": party_id}):
            continue
        
        party_doc = {
            **party_data,
            "party_id": party_id,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        parties_collection.insert_one(party_doc)
        
        # Create identity
        party_identities.insert_one({
            "party_id": party_id,
            "legal_name": party_data["legal_name"],
            "trade_name": party_data["legal_name"].split()[0],
            "country": party_data["country"],
            "registration_number": party_data["registration_number"],
            "business_type": "private_limited",
            "address": {"city": "Mumbai" if party_data["country"] == "India" else "Other", "country": party_data["country"]},
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create legal profile
        is_verified = party_data["status"] in ["verified", "minimum_ready"]
        party_legal_profiles.insert_one({
            "party_id": party_id,
            "incorporation_certificate": f"cert_{party_id}.pdf" if is_verified else None,
            "certificate_verified": is_verified,
            "authorized_signatories": [{"name": "John Doe", "designation": "Director", "verified": is_verified}],
            "verification_status": "verified" if is_verified else "pending",
            "verified_at": datetime.now(timezone.utc).isoformat() if is_verified else None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create tax profile
        party_tax_profiles.insert_one({
            "party_id": party_id,
            "tax_residency": party_data["country"],
            "tax_id": party_data["registration_number"],
            "tax_id_type": "gst" if party_data["country"] == "India" else "vat",
            "tax_classification": "regular",
            "verification_status": "verified" if party_data["status"] == "verified" else "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create risk profile
        risk_score = 85 if party_data["status"] == "blocked" else (65 if party_data["status"] == "restricted" else 25)
        party_risk_profiles.insert_one({
            "party_id": party_id,
            "country_risk": risk_score // 4,
            "industry_risk": risk_score // 5,
            "credit_risk": risk_score // 3,
            "exposure_risk": risk_score // 4,
            "sanctions_risk": risk_score // 2 if party_data["status"] == "blocked" else 0,
            "risk_score": risk_score,
            "risk_level": "high" if risk_score >= 70 else ("medium" if risk_score >= 40 else "low"),
            "risk_factors": ["Sanctions concern"] if party_data["status"] == "blocked" else [],
            "last_evaluated_at": datetime.now(timezone.utc).isoformat()
        })
        
        # Create compliance profile
        party_compliance_profiles.insert_one({
            "party_id": party_id,
            "kyc_status": "verified" if party_data["status"] == "verified" else "pending",
            "kyc_documents": [{"type": "incorporation", "uploaded": True}] if is_verified else [],
            "aml_check_status": "verified" if party_data["status"] == "verified" else "pending",
            "sanctions_screened": True,
            "sanctions_clear": party_data["status"] != "blocked",
            "verification_status": "verified" if party_data["status"] == "verified" else ("rejected" if party_data["status"] == "blocked" else "pending"),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        created.append(party_id)
    
    return {"success": True, "created": created, "message": f"Seeded {len(created)} parties"}
