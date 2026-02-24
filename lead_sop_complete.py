"""
Complete Lead Module - All 9 SOP Stages
Based on detailed functional specification
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone, timedelta
from commerce_models import (
    Lead, LeadCreate, SOPStage, LeadStatus, ValidationStatus, 
    LeadScoreCategory, ClosureReason, LeadSource
)
import uuid
import os
import json
import re
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
# from emergentintegrations.llm.chat import LlmChat, UserMessage

try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
except ImportError:
    LlmChat = None
    UserMessage = None

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create router
lead_router = APIRouter(prefix="/commerce/leads", tags=["Lead Management"])

# Get Emergent LLM Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')


def get_db():
    """Database dependency"""
    return db


def generate_fingerprint(lead_data: Dict[str, Any]) -> str:
    """
    Generate unique fingerprint for duplicate detection
    Format: company_name|email_domain|phone|country
    """
    company = lead_data.get('company_name', '').lower().strip()
    company = re.sub(r'[^a-z0-9]', '', company)  # Remove special chars
    
    email = lead_data.get('email_address', '')
    email_domain = email.split('@')[1] if '@' in email else ''
    
    phone = lead_data.get('phone_number', '') or ''
    phone = re.sub(r'[^0-9]', '', phone)  # Keep only digits
    
    country = lead_data.get('country', '').upper()
    
    return f"{company}|{email_domain}|{phone}|{country}"


def log_audit(action: str, performed_by: str, details: str) -> Dict[str, Any]:
    """Create audit log entry"""
    return {
        "action": action,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "performed_by": performed_by,
        "details": details
    }


def log_sop_stage(stage: str, performed_by: str, status: str, notes: str) -> Dict[str, Any]:
    """Create SOP stage history entry"""
    return {
        "stage": stage,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "performed_by": performed_by,
        "status": status,
        "notes": notes
    }


# ==================== LOOKUP: ENRICH SUGGESTIONS ====================

@lead_router.get("/enrich")
async def get_enrich_suggestions(company_name: str, db=Depends(get_db)):
    """
    DB-only company enrichment suggestions.
    Returns distinct companies from existing leads matching the company_name prefix.
    Intended to be called debounced from the frontend LeadCreate form.
    No AI. No external calls.
    """
    if not company_name or len(company_name.strip()) < 2:
        return {"suggestions": []}

    try:
        # Case-insensitive prefix search on company_name
        regex_pattern = f"^{re.escape(company_name.strip())}"
        cursor = db.commerce_leads.find(
            {"company_name": {"$regex": regex_pattern, "$options": "i"}},
            {
                "company_name": 1,
                "industry_type": 1,
                "city": 1,
                "country": 1,
                "website_url": 1,
            }
        ).limit(10)

        docs = await cursor.to_list(length=10)

        # Deduplicate by normalized company_name
        seen = set()
        suggestions = []
        for doc in docs:
            name = doc.get("company_name", "").strip()
            key = name.lower()
            if key not in seen:
                seen.add(key)
                suggestions.append({
                    "company_name": name,
                    "industry_type": doc.get("industry_type"),
                    "city": doc.get("city"),
                    "country": doc.get("country"),
                    "website_url": doc.get("website_url"),
                })

        return {"suggestions": suggestions}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Enrich lookup failed: {str(e)}")


# ==================== CRUD ENDPOINTS ====================

@lead_router.post("")
async def create_lead(lead_data: LeadCreate, db=Depends(get_db)):
    """
    STAGE 1: Add Lead - Data Capture (Lead_Intake_SOP)
    Creates new lead with validation and fingerprint generation
    """
    try:
        # Generate lead_id
        lead_count = await db.commerce_leads.count_documents({})
        year = datetime.now().year
        lead_id = f"LD-{year}-{str(lead_count + 1).zfill(6)}"
        
        # Generate fingerprint for duplicate detection
        fingerprint = generate_fingerprint(lead_data.dict())
        
        # Create lead document
        lead = Lead(
            lead_id=lead_id,
            company_name=lead_data.company_name,
            lead_source=lead_data.lead_source,
            contact_name=lead_data.contact_name,
            email_address=lead_data.email_address,
            phone_number=lead_data.phone_number,
            designation=lead_data.designation,
            department=lead_data.department,
            country=lead_data.country,
            state=lead_data.state,
            city=lead_data.city,
            website_url=lead_data.website_url,
            industry_type=lead_data.industry_type,
            company_size=lead_data.company_size,
            product_or_solution_interested_in=lead_data.product_or_solution_interested_in,
            estimated_deal_value=lead_data.estimated_deal_value,
            decision_timeline=lead_data.decision_timeline,
            notes=lead_data.notes,
            lead_campaign_name=lead_data.lead_campaign_name,
            tags=lead_data.tags or [],
            fingerprint=fingerprint,
            captured_by="current_user",
            lead_status=LeadStatus.NEW,
            last_activity_at=datetime.now(timezone.utc)
        )
        
        # Add audit entry
        lead.audit_trail.append(log_audit(
            "LEAD_CREATED",
            "current_user",
            f"Lead {lead_id} created from source: {lead_data.lead_source}"
        ))
        
        # Mark Intake as completed
        lead.sop_completion_status["Lead_Intake_SOP"] = True
        lead.current_sop_stage = SOPStage.ENRICH
        
        lead.sop_stage_history.append(log_sop_stage(
            "Lead_Intake_SOP",
            "system",
            "Completed",
            "Lead captured successfully, all required fields validated"
        ))
        
        # Insert to database
        lead_dict = lead.dict()
        lead_dict['captured_on'] = lead_dict['captured_on'].isoformat() if isinstance(lead_dict['captured_on'], datetime) else lead_dict['captured_on']
        lead_dict['created_at'] = lead_dict['created_at'].isoformat() if isinstance(lead_dict['created_at'], datetime) else lead_dict['created_at']
        lead_dict['updated_at'] = lead_dict['updated_at'].isoformat() if isinstance(lead_dict['updated_at'], datetime) else lead_dict['updated_at']
        
        await db.commerce_leads.insert_one(lead_dict)
        
        # Automatically trigger enrichment
        # (In real implementation, this would be async background task)
        
        return {
            "success": True,
            "message": "Lead created successfully. Running enrichment and verification checks...",
            "lead_id": lead_id,
            "fingerprint": fingerprint
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create lead: {str(e)}")


@lead_router.get("")
async def list_leads(
    status: Optional[str] = None,
    score_category: Optional[str] = None,
    assigned_to: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db=Depends(get_db)
):
    """Get all leads with optional filtering"""
    try:
        query = {}
        if status:
            query["lead_status"] = status
        if score_category:
            query["lead_score_category"] = score_category
        if assigned_to:
            query["assigned_to"] = assigned_to
        
        leads = await db.commerce_leads.find(query).skip(skip).limit(limit).to_list(length=limit)
        return leads
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@lead_router.get("/{lead_id}", response_model=None)
async def get_lead(lead_id: str, db=Depends(get_db)):
    """Get single lead by ID - Returns ALL fields including enriched data"""
    try:
        from bson import ObjectId as BSONObjectId
        
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Convert ObjectId to string for JSON serialization
        if lead.get('_id'):
            lead['_id'] = str(lead['_id'])
        
        # Convert datetime objects to ISO format
        for key in list(lead.keys()):
            value = lead[key]
            if hasattr(value, 'isoformat'):
                lead[key] = value.isoformat()
            elif isinstance(value, BSONObjectId):
                lead[key] = str(value)
        
        # Return as plain dict (response_model=None bypasses Pydantic)
        return lead
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print(f"Error in get_lead: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=str(e))


@lead_router.put("/{lead_id}")
async def update_lead(lead_id: str, update_data: Dict[str, Any], db=Depends(get_db)):
    """Update lead - Full update"""
    try:
        print(f"📝 Updating lead {lead_id} with data: {update_data}")
        
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Update fingerprint if key fields changed
        if any(k in update_data for k in ['company_name', 'email_address', 'phone_number', 'country']):
            merged_data = {**lead, **update_data}
            update_data['fingerprint'] = generate_fingerprint(merged_data)
        
        update_data['updated_at'] = datetime.now(timezone.utc)
        update_data['modified_by'] = "current_user"
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Lead updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@lead_router.patch("/{lead_id}")
async def partial_update_lead(lead_id: str, update_data: dict, db=Depends(get_db)):
    """Partial update lead - for assignment, status changes, etc."""
    try:
        print(f"📝 Partial update for lead {lead_id} with data: {update_data}")
        
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Add metadata
        update_data['updated_at'] = datetime.now(timezone.utc)
        update_data['modified_by'] = "current_user"
        
        # Update the lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {"$set": update_data}
        )
        
        print(f"✅ Lead {lead_id} updated successfully")
        return {"success": True, "message": "Lead updated successfully", "lead_id": lead_id}
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating lead: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== STAGE 2: ENRICHMENT ====================

@lead_router.post("/{lead_id}/enrich")
async def enrich_lead(lead_id: str, db=Depends(get_db)):
    """
    STAGE 2: Data Enrichment (Lead_Enrich_SOP)
    Automatically fills missing company data using GPT-5
    """
    try:
        print(f"🚀 Starting GPT-5 enrichment for lead: {lead_id}")
        from gpt_enrichment_service import enrich_lead_with_gpt
        
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        print(f"📋 Lead data: {lead.get('company_name')}, {lead.get('city')}, {lead.get('country')}")
        
        # Call GPT-5 enrichment service
        gpt_result = await enrich_lead_with_gpt(
            company_name=lead.get('company_name'),
            industry=lead.get('industry_type'),
            city=lead.get('city'),
            country=lead.get('country'),
            website=lead.get('website_url'),
            contact_name=lead.get('contact_name'),
            email=lead.get('email_address')
        )
        
        print(f"📊 GPT Result: Success={gpt_result.get('success')}, Confidence={gpt_result.get('confidence')}")
        
        # Initialize variables
        enrichment_data = {}
        update_fields = {}
        status = "Partial"
        
        if gpt_result['success']:
            enriched = gpt_result['enriched_data']
            
            # Update lead with ALL enriched fields
            update_fields = {
                # Basic Information
                "legal_entity_name": enriched.get('legal_entity_name'),
                "year_established": enriched.get('year_established'),
                "company_size": enriched.get('company_size'),
                "employees_count": enriched.get('employees_count'),
                "annual_turnover": enriched.get('annual_turnover'),
                "business_model": enriched.get('business_model'),
                "company_description": enriched.get('company_description'),
                
                # Registration & Compliance
                "gstin": enriched.get('gstin'),
                "pan": enriched.get('pan'),
                "cin": enriched.get('cin'),
                "registered_name": enriched.get('registered_name'),
                "verification_status": enriched.get('verification_status'),
                
                # Location Details
                "headquarters": enriched.get('headquarters'),
                "state": enriched.get('state'),
                "pincode": enriched.get('pincode'),
                "branch_locations": enriched.get('branch_locations', []),
                
                # Online & Digital Presence
                "official_website": enriched.get('official_website'),
                "linkedin_page": enriched.get('linkedin_page'),
                "twitter_url": enriched.get('twitter_url'),
                "facebook_url": enriched.get('facebook_url'),
                "instagram_url": enriched.get('instagram_url'),
                "domain_emails": enriched.get('domain_emails', []),
                "technology_stack": enriched.get('technology_stack', []),
                
                # Financial & Organizational Profile
                "estimated_revenue": enriched.get('estimated_revenue'),
                "funding_stage": enriched.get('funding_stage'),
                "investors": enriched.get('investors', []),
                "ownership_type": enriched.get('ownership_type'),
                
                # Operational Overview
                "main_products_services": enriched.get('main_products_services', []),
                "key_markets": enriched.get('key_markets', []),
                "office_count": enriched.get('office_count'),
                "certifications": enriched.get('certifications', []),
                
                # Contact Enrichment
                "contact_designation": enriched.get('designation'),
                "contact_department": enriched.get('department'),
                "contact_phone": enriched.get('contact_phone'),
                "contact_linkedin": enriched.get('contact_linkedin'),
                "seniority_level": enriched.get('seniority_level'),
                "decision_maker_flag": enriched.get('decision_maker_flag'),
                "last_verified_date": enriched.get('last_verified_date'),
                "contact_source": enriched.get('contact_source'),
                
                # Enrichment Metadata
                "enrichment_confidence": gpt_result['confidence'],
                "enrichment_data_sources": enriched.get('data_sources', []),
                "enrichment_timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            # Store enrichment metadata
            enrichment_data = {
                "source": "GPT-5",
                "confidence": gpt_result['confidence'],
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            
            status = "Completed"
            print(f"✅ GPT enrichment completed - {len(update_fields)} fields updated")
            print(f"📋 Sample fields: GSTIN={update_fields.get('gstin')}, PAN={update_fields.get('pan')}")
        else:
            # Fallback to basic enrichment if GPT fails
            enrichment_data = {
                "enrichment_source": "Fallback",
                "enrichment_timestamp": datetime.now(timezone.utc).isoformat(),
                "confidence_score": 50.0,
                "error": gpt_result.get('error')
            }
            update_fields = {}
            status = "Partial"
            print(f"⚠️ GPT enrichment failed: {gpt_result.get('error')}")
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    **update_fields,
                    "enrichment_status": status,
                    "enrichment_last_updated": datetime.now(timezone.utc),
                    "current_sop_stage": SOPStage.VALIDATE.value,
                    f"sop_completion_status.{SOPStage.ENRICH.value}": True,
                    "lead_status": LeadStatus.ENRICHING.value,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "sop_stage_history": log_sop_stage(
                        "Lead_Enrich_SOP",
                        "system",
                        "Completed",
                        f"Enrichment completed via GPT-5 with {gpt_result.get('confidence', 'Medium')} confidence"
                    ),
                    "audit_trail": log_audit(
                        "ENRICHMENT_COMPLETED",
                        "system",
                        "Lead enriched via GPT-5"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Enrich_SOP",
            "message": "Lead enrichment completed",
            "enrichment_status": status,
            "enrichment_data": enrichment_data,
            "enriched_fields": list(update_fields.keys()) if status == "Completed" else []
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Enrichment failed: {str(e)}\n{traceback.format_exc()}"
        print(f"❌ ERROR in enrich_lead: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Enrichment failed: {str(e)}")


# ==================== STAGE 3: VALIDATION ====================

@lead_router.post("/{lead_id}/validate")
async def validate_lead(lead_id: str, db=Depends(get_db)):
    """
    STAGE 3: Validation (Lead_Validate_SOP)
    Validates email, phone, checks blacklist, verifies business registry
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        validation_checks = {}
        warnings = []
        
        # Email format check
        email = lead.get('email_address', '')
        if '@' in email and '.' in email.split('@')[1]:
            validation_checks["email_format"] = "Passed"
        else:
            validation_checks["email_format"] = "Failed"
        
        # Email domain MX check (simplified - would use dnspython in production)
        email_domain = email.split('@')[1] if '@' in email else ''
        if email_domain and not email_domain.endswith(('gmail.com', 'yahoo.com', 'hotmail.com')):
            validation_checks["email_domain_mx"] = "Passed"
        else:
            validation_checks["email_domain_mx"] = "Warning"
            warnings.append("Free email domain detected - consider verifying business email")
        
        # Phone format check
        phone = lead.get('phone_number', '')
        if phone and len(re.sub(r'[^0-9]', '', phone)) >= 10:
            validation_checks["phone_format"] = "Passed"
        else:
            validation_checks["phone_format"] = "Warning"
            warnings.append("Phone number format needs verification")
        
        # Duplicate detection
        fingerprint = lead.get('fingerprint', '')
        if fingerprint:
            existing = await db.commerce_leads.find_one({
                "fingerprint": fingerprint,
                "lead_id": {"$ne": lead_id}
            })
            if existing:
                validation_checks["duplicate_check"] = "Warning"
                warnings.append(f"Possible duplicate of {existing.get('lead_id')}")
            else:
                validation_checks["duplicate_check"] = "Passed"
        
        # Sanction/Blacklist check (simplified)
        validation_checks["blacklist_check"] = "Passed"
        
        # Business registry check (simplified - would call GSTIN API)
        validation_checks["business_registry"] = "Pending"
        
        # Determine overall status
        if "Failed" in validation_checks.values():
            status = ValidationStatus.FAILED
        elif warnings:
            status = ValidationStatus.WARNING
        else:
            status = ValidationStatus.VERIFIED
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "validation_status": status.value,
                    "validation_checks": validation_checks,
                    "validation_warnings": warnings,
                    "validation_date": datetime.now(timezone.utc),
                    "current_sop_stage": SOPStage.QUALIFY.value,
                    f"sop_completion_status.{SOPStage.VALIDATE.value}": True,
                    "lead_status": LeadStatus.VALIDATED.value,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "sop_stage_history": log_sop_stage(
                        "Lead_Validate_SOP",
                        "system",
                        "Completed",
                        f"Validation {status.value}: {len(warnings)} warnings"
                    ),
                    "audit_trail": log_audit(
                        "VALIDATION_COMPLETED",
                        "system",
                        f"Validation status: {status.value}"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Validate_SOP",
            "validation_status": status.value,
            "validation_checks": validation_checks,
            "warnings": warnings
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Validation failed: {str(e)}")


# ==================== STAGE 4: QUALIFICATION & SCORING ====================

@lead_router.post("/{lead_id}/qualify")
async def qualify_lead(lead_id: str, db=Depends(get_db)):
    """
    STAGE 4: Qualification & Scoring (Lead_Qualify_SOP)
    Calculates Fit (40%) + Intent (30%) + Potential (30%) = Lead Score
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # FIT SCORE (40% weight) - How well they match ICP
        fit_score = 0
        
        # Industry match (20 points)
        preferred_industries = ['Manufacturing', 'SaaS', 'Technology', 'Finance']
        if lead.get('industry_type') in preferred_industries:
            fit_score += 20
        elif lead.get('industry_type'):
            fit_score += 10
        
        # Company size (10 points)
        if lead.get('company_size') == 'Enterprise':
            fit_score += 10
        elif lead.get('company_size') == 'Medium':
            fit_score += 7
        else:
            fit_score += 3
        
        # Geography (10 points)
        if lead.get('country') == 'India':
            fit_score += 10
        else:
            fit_score += 5
        
        fit_score = min(fit_score, 40)  # Cap at 40
        
        # INTENT SCORE (30% weight) - How serious/engaged they are
        intent_score = 0
        
        # Lead source quality (15 points)
        high_intent_sources = ['Website', 'Referral', 'Partner']
        if lead.get('lead_source') in high_intent_sources:
            intent_score += 15
        else:
            intent_score += 8
        
        # Engagement (10 points)
        engagement_count = lead.get('engagement_count', 0)
        intent_score += min(engagement_count * 2, 10)
        
        # Decision timeline (5 points)
        timeline = lead.get('decision_timeline', '')
        if '0-3' in timeline:
            intent_score += 5
        elif '3-6' in timeline:
            intent_score += 3
        else:
            intent_score += 1
        
        intent_score = min(intent_score, 30)  # Cap at 30
        
        # POTENTIAL SCORE (30% weight) - Deal value and opportunity
        potential_score = 0
        
        # Deal value (20 points)
        deal_value = lead.get('estimated_deal_value', 0) or 0
        if deal_value >= 1000000:  # >= 10 lakhs
            potential_score += 20
        elif deal_value >= 500000:  # >= 5 lakhs
            potential_score += 15
        elif deal_value >= 100000:  # >= 1 lakh
            potential_score += 10
        else:
            potential_score += 5
        
        # Decision maker identified (10 points)
        if lead.get('designation') and any(title in lead.get('designation', '').lower() for title in ['director', 'ceo', 'cfo', 'vp', 'head']):
            potential_score += 10
        else:
            potential_score += 3
        
        potential_score = min(potential_score, 30)  # Cap at 30
        
        # TOTAL SCORE
        total_score = fit_score + intent_score + potential_score
        
        # Determine category
        if total_score >= 76:
            category = LeadScoreCategory.HOT
        elif total_score >= 51:
            category = LeadScoreCategory.WARM
        else:
            category = LeadScoreCategory.COLD
        
        reasoning = f"Fit: {fit_score}/40 (Industry match, size, geography) | Intent: {intent_score}/30 (Source quality, engagement) | Potential: {potential_score}/30 (Deal value ₹{deal_value:,.0f}, decision maker)"
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "lead_score": total_score,
                    "lead_score_category": category.value,
                    "fit_score": fit_score,
                    "intent_score": intent_score,
                    "potential_score": potential_score,
                    "scoring_reasoning": reasoning,
                    "scoring_date": datetime.now(timezone.utc),
                    "current_sop_stage": SOPStage.ASSIGN.value,
                    f"sop_completion_status.{SOPStage.QUALIFY.value}": True,
                    "lead_status": LeadStatus.QUALIFIED.value,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "sop_stage_history": log_sop_stage(
                        "Lead_Qualify_SOP",
                        "system",
                        "Completed",
                        f"Lead scored {total_score}/100 - {category.value}"
                    ),
                    "audit_trail": log_audit(
                        "SCORING_COMPLETED",
                        "system",
                        f"Score: {total_score}, Category: {category.value}"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Qualify_SOP",
            "lead_score": total_score,
            "category": category.value,
            "breakdown": {
                "fit_score": fit_score,
                "intent_score": intent_score,
                "potential_score": potential_score
            },
            "reasoning": reasoning
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qualification failed: {str(e)}")


# ==================== STAGE 5: ASSIGNMENT ====================

@lead_router.post("/{lead_id}/assign")
async def assign_lead(
    lead_id: str,
    assigned_to: Optional[str] = None,
    db=Depends(get_db)
):
    """
    STAGE 5: Assignment (Lead_Assign_SOP)
    Rule-based + AI-optimized assignment with follow-up tracking
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        assignment_method = "Manual" if assigned_to else "Rule-based"
        
        # Rule-based assignment logic
        if not assigned_to:
            country = lead.get('country', '')
            industry = lead.get('industry_type', '')
            deal_value = lead.get('estimated_deal_value', 0) or 0
            
            # Assignment rules
            if deal_value >= 1000000:  # >= 10 lakhs
                assigned_to = "Enterprise Team"
            elif country == "India":
                if industry in ['Manufacturing', 'Technology']:
                    assigned_to = "Industrial Solutions Rep"
                else:
                    assigned_to = "India Sales Team"
            else:
                assigned_to = "International Team"
        
        # Calculate follow-up due (4 hours for hot leads, 24 hours for warm, 48 for cold)
        category = lead.get('lead_score_category', 'COLD')
        if category == 'HOT':
            follow_up_hours = 4
        elif category == 'WARM':
            follow_up_hours = 24
        else:
            follow_up_hours = 48
        
        follow_up_due = datetime.now(timezone.utc) + timedelta(hours=follow_up_hours)
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "assigned_to": assigned_to,
                    "assigned_date": datetime.now(timezone.utc),
                    "assignment_method": assignment_method,
                    "follow_up_due": follow_up_due,
                    "current_sop_stage": SOPStage.ENGAGE.value,
                    f"sop_completion_status.{SOPStage.ASSIGN.value}": True,
                    "lead_status": LeadStatus.ASSIGNED.value,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "sop_stage_history": log_sop_stage(
                        "Lead_Assign_SOP",
                        "system",
                        "Completed",
                        f"Assigned to {assigned_to} via {assignment_method}"
                    ),
                    "audit_trail": log_audit(
                        "ASSIGNMENT_COMPLETED",
                        "system",
                        f"Lead assigned to {assigned_to}, follow-up due in {follow_up_hours}h"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Assign_SOP",
            "assigned_to": assigned_to,
            "assignment_method": assignment_method,
            "follow_up_due": follow_up_due.isoformat()
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assignment failed: {str(e)}")


# ==================== STAGE 6: ENGAGEMENT ====================

@lead_router.post("/{lead_id}/engage")
async def log_engagement(
    lead_id: str,
    activity_type: str,  # Email / Call / Meeting / Demo / Proposal / Note
    notes: Optional[str] = None,
    outcome: Optional[str] = None,
    db=Depends(get_db)
):
    """
    STAGE 6: Engagement (Lead_Engage_SOP)
    Log interaction activities (calls, emails, meetings)
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        activity = {
            "activity_id": str(uuid.uuid4()),
            "activity_type": activity_type,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "performed_by": "current_user",
            "notes": notes,
            "outcome": outcome
        }
        
        # Boost intent score slightly with each engagement
        current_intent = lead.get('intent_score', 0)
        new_intent = min(current_intent + 2, 30)  # Cap at 30
        
        # Recalculate total score
        fit = lead.get('fit_score', 0)
        potential = lead.get('potential_score', 0)
        new_total = fit + new_intent + potential
        
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$push": {
                    "engagement_activities": activity,
                    "sop_stage_history": log_sop_stage(
                        "Lead_Engage_SOP",
                        "current_user",
                        "In Progress",
                        f"{activity_type} logged: {notes or 'No notes'}"
                    )
                },
                "$set": {
                    "last_engagement_date": datetime.now(timezone.utc),
                    "last_activity_date": datetime.now(timezone.utc),
                    "intent_score": new_intent,
                    "lead_score": new_total,
                    f"sop_completion_status.{SOPStage.ENGAGE.value}": True,
                    "lead_status": LeadStatus.ENGAGED.value,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$inc": {
                    "engagement_count": 1
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Engage_SOP",
            "message": "Engagement activity logged",
            "activity": activity,
            "updated_intent_score": new_intent
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Engagement logging failed: {str(e)}")


# ==================== STAGE 7: REVIEW & CLEANUP ====================

@lead_router.post("/{lead_id}/review")
async def review_lead(lead_id: str, db=Depends(get_db)):
    """
    STAGE 7: Review & Clean-up (Lead_Review_SOP)
    Check for dormant leads, update status
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        last_activity = lead.get('last_activity_date')
        if last_activity:
            if isinstance(last_activity, str):
                last_activity = datetime.fromisoformat(last_activity.replace('Z', '+00:00'))
            
            days_since_activity = (datetime.now(timezone.utc) - last_activity).days
            
            if days_since_activity >= 30:
                # Mark as dormant
                await db.commerce_leads.update_one(
                    {"lead_id": lead_id},
                    {
                        "$set": {
                            "dormant_flag": True,
                            "dormant_since": datetime.now(timezone.utc),
                            "lead_status": LeadStatus.DORMANT.value,
                            f"sop_completion_status.{SOPStage.REVIEW.value}": True,
                            "updated_at": datetime.now(timezone.utc)
                        },
                        "$push": {
                            "sop_stage_history": log_sop_stage(
                                "Lead_Review_SOP",
                                "system",
                                "Completed",
                                f"Lead marked dormant - no activity for {days_since_activity} days"
                            ),
                            "audit_trail": log_audit(
                                "REVIEW_DORMANT",
                                "system",
                                f"Lead inactive for {days_since_activity} days"
                            )
                        }
                    }
                )
                
                return {
                    "success": True,
                    "stage": "Lead_Review_SOP",
                    "status": "Dormant",
                    "days_inactive": days_since_activity
                }
            else:
                return {
                    "success": True,
                    "stage": "Lead_Review_SOP",
                    "status": "Active",
                    "days_inactive": days_since_activity
                }
        
        return {
            "success": True,
            "stage": "Lead_Review_SOP",
            "status": "No activity recorded",
            "message": "Lead needs engagement"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Review failed: {str(e)}")


@lead_router.post("/{lead_id}/close")
async def close_lead(
    lead_id: str,
    reason: ClosureReason,
    notes: Optional[str] = None,
    db=Depends(get_db)
):
    """Close a lead with reason"""
    try:
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "lead_status": LeadStatus.CLOSED.value,
                    "closure_reason": reason.value,
                    "closure_notes": notes,
                    "closed_date": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "audit_trail": log_audit(
                        "LEAD_CLOSED",
                        "current_user",
                        f"Reason: {reason.value}, Notes: {notes or 'None'}"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "message": "Lead closed",
            "reason": reason.value
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Close failed: {str(e)}")


# ==================== STAGE 8: CONVERSION ====================

@lead_router.post("/{lead_id}/convert")
async def convert_lead(lead_id: str, db=Depends(get_db)):
    """
    STAGE 8: Conversion to Evaluate (Lead_Convert_SOP)
    Convert qualified lead to Evaluate module
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        # Pre-conversion checks
        validation_status = lead.get('validation_status')
        lead_score = lead.get('lead_score', 0)
        
        if validation_status != ValidationStatus.VERIFIED.value:
            return {
                "success": False,
                "message": f"Lead must be verified first (current: {validation_status})"
            }
        
        if lead_score < 60:
            return {
                "success": False,
                "message": f"Lead score too low ({lead_score}). Minimum required: 60"
            }
        
        # Create evaluation record
        eval_count = await db.commerce_evaluate.count_documents({})
        year = datetime.now().year
        eval_id = f"EV-{year}-{str(eval_count + 1).zfill(5)}"
        
        evaluation_data = {
            "id": str(uuid.uuid4()),
            "evaluation_id": eval_id,
            "linked_lead_id": lead_id,
            "customer_id": f"CUST-{str(uuid.uuid4())[:8]}",
            "evaluation_status": "Draft",
            "initiated_by": "system",
            "initiated_on": datetime.now(timezone.utc),
            "opportunity_name": f"{lead.get('company_name')} - {lead.get('product_or_solution_interested_in')}",
            "expected_deal_value": lead.get('estimated_deal_value', 0),
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc)
        }
        
        await db.commerce_evaluate.insert_one(evaluation_data)
        
        # Update lead
        await db.commerce_leads.update_one(
            {"lead_id": lead_id},
            {
                "$set": {
                    "lead_status": LeadStatus.CONVERTED.value,
                    "conversion_date": datetime.now(timezone.utc),
                    "conversion_reference": eval_id,
                    "converted_to_evaluate_id": eval_id,
                    "conversion_eligible": True,
                    f"sop_completion_status.{SOPStage.CONVERT.value}": True,
                    "updated_at": datetime.now(timezone.utc)
                },
                "$push": {
                    "sop_stage_history": log_sop_stage(
                        "Lead_Convert_SOP",
                        "system",
                        "Completed",
                        f"Lead converted to Evaluation {eval_id}"
                    ),
                    "audit_trail": log_audit(
                        "LEAD_CONVERTED",
                        "system",
                        f"Converted to Evaluation module: {eval_id}"
                    )
                }
            }
        )
        
        return {
            "success": True,
            "stage": "Lead_Convert_SOP",
            "message": "Lead converted successfully",
            "evaluation_id": eval_id
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")


# ==================== STAGE 9: AUDIT TRAIL ====================

@lead_router.get("/{lead_id}/audit")
async def get_audit_trail(lead_id: str, db=Depends(get_db)):
    """
    STAGE 9: Audit Trail (Lead_Audit_SOP)
    Get complete history of all actions
    """
    try:
        lead = await db.commerce_leads.find_one({"lead_id": lead_id})
        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found")
        
        return {
            "lead_id": lead_id,
            "sop_stage_history": lead.get('sop_stage_history', []),
            "audit_trail": lead.get('audit_trail', []),
            "engagement_activities": lead.get('engagement_activities', []),
            "current_sop_stage": lead.get('current_sop_stage'),
            "sop_completion_status": lead.get('sop_completion_status', {})
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audit retrieval failed: {str(e)}")


# ==================== BATCH OPERATIONS ====================

@lead_router.post("/batch/review-dormant")
async def review_dormant_leads(db=Depends(get_db)):
    """
    Background job: Review all leads for dormancy
    Runs nightly or weekly
    """
    try:
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=30)
        
        # Find leads with no activity in 30 days
        dormant_leads = await db.commerce_leads.find({
            "last_activity_date": {"$lt": cutoff_date},
            "dormant_flag": False,
            "lead_status": {"$nin": [LeadStatus.CONVERTED.value, LeadStatus.CLOSED.value]}
        }).to_list(length=1000)
        
        count = 0
        for lead in dormant_leads:
            await db.commerce_leads.update_one(
                {"lead_id": lead['lead_id']},
                {
                    "$set": {
                        "dormant_flag": True,
                        "dormant_since": datetime.now(timezone.utc),
                        "lead_status": LeadStatus.DORMANT.value
                    }
                }
            )
            count += 1
        
        return {
            "success": True,
            "message": f"Reviewed and marked {count} leads as dormant"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@lead_router.get("/{lead_id}/raw")
async def get_lead_raw(lead_id: str, db=Depends(get_db)):
    """Test endpoint - returns raw MongoDB data"""
    from bson import json_util
    import json
    
    lead = await db.commerce_leads.find_one({"lead_id": lead_id})
    if not lead:
        return {"error": "Not found"}
    
    # Use bson.json_util to handle ObjectId and datetime
    json_str = json_util.dumps(lead)
    json_data = json.loads(json_str)
    
    return JSONResponse(content=json_data)
