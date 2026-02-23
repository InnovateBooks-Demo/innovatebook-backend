"""
Commerce Modules Routes - Catalog, Revenue, Procurement, Governance
Full CRUD operations for all submodules (Async MongoDB)
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/commerce/modules", tags=["Commerce Modules"])

# Get database dependency
def get_db():
    from main import db
    return db

# ============== PYDANTIC MODELS ==============

class CatalogItemCreate(BaseModel):
    item_code: str
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    unit_of_measure: Optional[str] = "Each"
    base_price: Optional[float] = 0
    cost_price: Optional[float] = 0
    tax_category: Optional[str] = None
    status: Optional[str] = "active"

class CatalogPricingCreate(BaseModel):
    name: str
    price_list_type: Optional[str] = "standard"
    currency: Optional[str] = "INR"
    base_price: Optional[float] = 0
    discount_percent: Optional[float] = 0
    status: Optional[str] = "active"

class CatalogCostingCreate(BaseModel):
    name: str
    costing_method: Optional[str] = "standard"
    material_cost: Optional[float] = 0
    labor_cost: Optional[float] = 0
    overhead_cost: Optional[float] = 0
    total_cost: Optional[float] = 0
    status: Optional[str] = "active"

class CatalogRuleCreate(BaseModel):
    rule_name: str
    rule_type: Optional[str] = "pricing"
    description: Optional[str] = None
    condition: Optional[str] = None
    action: Optional[str] = None
    priority: Optional[int] = 1
    status: Optional[str] = "active"

class CatalogPackageCreate(BaseModel):
    package_name: str
    description: Optional[str] = None
    items: Optional[List[str]] = []
    package_price: Optional[float] = 0
    discount_percent: Optional[float] = 0
    status: Optional[str] = "active"

class LeadCreate(BaseModel):
    # Lead Information (Zoho + Salesforce + HubSpot)
    lead_owner: Optional[str] = None
    salutation: Optional[str] = None
    first_name: Optional[str] = None
    last_name: str
    title: Optional[str] = None
    
    # Company Information
    company: str
    industry: Optional[str] = None
    annual_revenue: Optional[float] = None
    no_of_employees: Optional[int] = None
    company_type: Optional[str] = None  # Salesforce: SMB, Mid-Market, Enterprise
    
    # Lead Classification (Enhanced)
    lead_source: Optional[str] = None
    lead_status: Optional[str] = "New"
    rating: Optional[str] = None
    lifecycle_stage: Optional[str] = "Lead"  # HubSpot: Subscriber, Lead, MQL, SQL, Opportunity, Customer
    lead_score: Optional[int] = 0  # HubSpot/Salesforce: Calculated score
    lead_priority: Optional[str] = "Medium"  # High, Medium, Low
    
    # Contact Information
    phone: Optional[str] = None
    mobile: Optional[str] = None
    fax: Optional[str] = None
    email: Optional[str] = None
    secondary_email: Optional[str] = None
    skype_id: Optional[str] = None
    website: Optional[str] = None
    
    # Social Profiles (HubSpot)
    linkedin_url: Optional[str] = None
    twitter_handle: Optional[str] = None
    facebook_url: Optional[str] = None
    
    # Address Information
    street: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    country: Optional[str] = None
    
    # Campaign & Marketing (Salesforce)
    campaign_source: Optional[str] = None
    campaign_name: Optional[str] = None
    campaign_medium: Optional[str] = None  # Email, Social, PPC, Organic
    utm_source: Optional[str] = None
    utm_medium: Optional[str] = None
    utm_campaign: Optional[str] = None
    
    # Engagement Metrics (HubSpot)
    email_opens: Optional[int] = 0
    email_clicks: Optional[int] = 0
    website_visits: Optional[int] = 0
    page_views: Optional[int] = 0
    form_submissions: Optional[int] = 0
    last_activity_date: Optional[str] = None
    last_contacted_date: Optional[str] = None
    days_since_last_contact: Optional[int] = None
    
    # Deal/Opportunity (Salesforce)
    deal_value: Optional[float] = None
    deal_stage: Optional[str] = None  # Qualification, Proposal, Negotiation, Closed Won, Closed Lost
    deal_probability: Optional[int] = None  # 0-100%
    expected_close_date: Optional[str] = None
    deal_currency: Optional[str] = "INR"
    
    # Lead Conversion (Salesforce)
    is_converted: Optional[bool] = False
    converted_date: Optional[str] = None
    converted_account_id: Optional[str] = None
    converted_contact_id: Optional[str] = None
    converted_opportunity_id: Optional[str] = None
    
    # Tags & Segmentation (HubSpot)
    tags: Optional[List[str]] = []
    segments: Optional[List[str]] = []
    
    # Additional Information
    description: Optional[str] = None
    email_opt_out: Optional[bool] = False
    do_not_call: Optional[bool] = False
    unsubscribed: Optional[bool] = False
    
    # Competitor Info
    current_vendor: Optional[str] = None
    competitor_products: Optional[List[str]] = []
    pain_points: Optional[List[str]] = []
    
    # Assignment
    assigned_team: Optional[str] = None
    territory: Optional[str] = None
    region: Optional[str] = None


# Activity/Task Models (HubSpot + Salesforce)
class ActivityCreate(BaseModel):
    activity_type: str  # call, email, meeting, task, note
    subject: str
    description: Optional[str] = None
    lead_id: str
    due_date: Optional[str] = None
    completed_date: Optional[str] = None
    status: Optional[str] = "pending"  # pending, completed, cancelled
    priority: Optional[str] = "medium"
    outcome: Optional[str] = None  # For calls: connected, voicemail, no_answer
    duration_minutes: Optional[int] = None
    assigned_to: Optional[str] = None
    reminder_date: Optional[str] = None


# Deal/Opportunity Model (Salesforce)
class DealCreate(BaseModel):
    deal_name: str
    lead_id: str
    amount: float
    currency: Optional[str] = "INR"
    stage: Optional[str] = "Qualification"  # Qualification, Proposal, Negotiation, Closed Won, Closed Lost
    probability: Optional[int] = 10
    expected_close_date: Optional[str] = None
    deal_type: Optional[str] = "New Business"  # New Business, Existing Business, Renewal
    next_step: Optional[str] = None
    description: Optional[str] = None
    competitor: Optional[str] = None
    loss_reason: Optional[str] = None

class EvaluationCreate(BaseModel):
    name: str
    lead_id: Optional[str] = None
    evaluation_type: Optional[str] = "technical"
    score: Optional[int] = 0
    evaluator: Optional[str] = None
    status: Optional[str] = "pending"

class CommitCreate(BaseModel):
    name: str
    lead_id: Optional[str] = None
    commit_type: Optional[str] = "proposal"
    value: Optional[float] = 0
    terms: Optional[str] = None
    validity_days: Optional[int] = 30
    status: Optional[str] = "draft"

class ContractCreate(BaseModel):
    contract_name: str
    customer_id: Optional[str] = None
    contract_type: Optional[str] = "service"
    value: Optional[float] = 0
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = "draft"

class ProcurementCreate(BaseModel):
    pr_number: str
    title: str
    vendor_id: Optional[str] = None
    total_value: Optional[float] = 0
    requested_by: Optional[str] = None
    required_date: Optional[str] = None
    status: Optional[str] = "draft"
    priority: Optional[str] = "medium"

class PurchaseOrderCreate(BaseModel):
    po_number: str
    pr_id: Optional[str] = None
    vendor_id: Optional[str] = None
    total_value: Optional[float] = 0
    delivery_date: Optional[str] = None
    payment_terms: Optional[str] = None
    status: Optional[str] = "draft"

class PolicyCreate(BaseModel):
    policy_name: str
    policy_type: Optional[str] = "general"
    description: Optional[str] = None
    effective_date: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[str] = "draft"

class LimitCreate(BaseModel):
    limit_name: str
    limit_type: Optional[str] = "spending"
    threshold_value: Optional[float] = 0
    currency: Optional[str] = "INR"
    applies_to: Optional[str] = None
    period: Optional[str] = "monthly"
    status: Optional[str] = "active"

class AuthorityCreate(BaseModel):
    authority_name: str
    role: Optional[str] = None
    approval_limit: Optional[float] = 0
    approval_types: Optional[List[str]] = []
    status: Optional[str] = "active"

class RiskCreate(BaseModel):
    risk_name: str
    risk_type: Optional[str] = "operational"
    description: Optional[str] = None
    probability: Optional[str] = "medium"
    impact: Optional[str] = "medium"
    mitigation: Optional[str] = None
    owner: Optional[str] = None
    status: Optional[str] = "identified"

class AuditCreate(BaseModel):
    audit_name: str
    audit_type: Optional[str] = "internal"
    scope: Optional[str] = None
    auditor: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[str] = "planned"

# ============== CATALOG ROUTES ==============

@router.get("/catalog/items")
async def get_catalog_items(search: Optional[str] = None, category: Optional[str] = None, status: Optional[str] = None, db = Depends(get_db)):
    try:
        query = {}
        if search:
            query["$or"] = [{"name": {"$regex": search, "$options": "i"}}, {"item_code": {"$regex": search, "$options": "i"}}]
        if category:
            query["category"] = category
        if status:
            query["status"] = status
        items = await db.catalog_items.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "items": items, "count": len(items)}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/catalog/items")
async def create_catalog_item(item: CatalogItemCreate, db = Depends(get_db)):
    data = item.dict()
    data["item_id"] = f"ITEM-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.catalog_items.insert_one(data)
    return {"success": True, "message": "Item created", "item_id": data["item_id"]}

@router.get("/catalog/items/{item_id}")
async def get_catalog_item(item_id: str, db = Depends(get_db)):
    item = await db.catalog_items.find_one({"item_id": item_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True, "item": item}

@router.put("/catalog/items/{item_id}")
async def update_catalog_item(item_id: str, item: CatalogItemCreate, db = Depends(get_db)):
    result = await db.catalog_items.update_one({"item_id": item_id}, {"$set": item.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True, "message": "Item updated"}

@router.delete("/catalog/items/{item_id}")
async def delete_catalog_item(item_id: str, db = Depends(get_db)):
    result = await db.catalog_items.delete_one({"item_id": item_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    return {"success": True, "message": "Item deleted"}

# Pricing
@router.get("/catalog/pricing")
async def get_catalog_pricing(status: Optional[str] = None, db = Depends(get_db)):
    query = {} if not status else {"status": status}
    items = await db.catalog_pricing.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "pricing": items, "count": len(items)}

@router.post("/catalog/pricing")
async def create_catalog_pricing(pricing: CatalogPricingCreate, db = Depends(get_db)):
    data = pricing.dict()
    data["pricing_id"] = f"PRC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.catalog_pricing.insert_one(data)
    return {"success": True, "message": "Pricing created", "pricing_id": data["pricing_id"]}

@router.get("/catalog/pricing/{pricing_id}")
async def get_pricing_detail(pricing_id: str, db = Depends(get_db)):
    item = await db.catalog_pricing.find_one({"pricing_id": pricing_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return {"success": True, "pricing": item}

@router.put("/catalog/pricing/{pricing_id}")
async def update_pricing(pricing_id: str, pricing: CatalogPricingCreate, db = Depends(get_db)):
    result = await db.catalog_pricing.update_one({"pricing_id": pricing_id}, {"$set": pricing.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return {"success": True, "message": "Pricing updated"}

@router.delete("/catalog/pricing/{pricing_id}")
async def delete_pricing(pricing_id: str, db = Depends(get_db)):
    result = await db.catalog_pricing.delete_one({"pricing_id": pricing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Pricing not found")
    return {"success": True, "message": "Pricing deleted"}

# Costing
@router.get("/catalog/costing")
async def get_catalog_costing(db = Depends(get_db)):
    items = await db.catalog_costing.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "costing": items, "count": len(items)}

@router.post("/catalog/costing")
async def create_catalog_costing(costing: CatalogCostingCreate, db = Depends(get_db)):
    data = costing.dict()
    data["costing_id"] = f"CST-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.catalog_costing.insert_one(data)
    return {"success": True, "message": "Costing created", "costing_id": data["costing_id"]}

@router.get("/catalog/costing/{costing_id}")
async def get_costing_detail(costing_id: str, db = Depends(get_db)):
    item = await db.catalog_costing.find_one({"costing_id": costing_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Costing not found")
    return {"success": True, "costing": item}

@router.put("/catalog/costing/{costing_id}")
async def update_costing(costing_id: str, costing: CatalogCostingCreate, db = Depends(get_db)):
    result = await db.catalog_costing.update_one({"costing_id": costing_id}, {"$set": costing.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Costing not found")
    return {"success": True, "message": "Costing updated"}

@router.delete("/catalog/costing/{costing_id}")
async def delete_costing(costing_id: str, db = Depends(get_db)):
    result = await db.catalog_costing.delete_one({"costing_id": costing_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Costing not found")
    return {"success": True, "message": "Costing deleted"}

# Rules
@router.get("/catalog/rules")
async def get_catalog_rules(db = Depends(get_db)):
    items = await db.catalog_rules.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "rules": items, "count": len(items)}

@router.post("/catalog/rules")
async def create_catalog_rule(rule: CatalogRuleCreate, db = Depends(get_db)):
    data = rule.dict()
    data["rule_id"] = f"RUL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.catalog_rules.insert_one(data)
    return {"success": True, "message": "Rule created", "rule_id": data["rule_id"]}

@router.get("/catalog/rules/{rule_id}")
async def get_rule_detail(rule_id: str, db = Depends(get_db)):
    item = await db.catalog_rules.find_one({"rule_id": rule_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "rule": item}

@router.put("/catalog/rules/{rule_id}")
async def update_rule(rule_id: str, rule: CatalogRuleCreate, db = Depends(get_db)):
    result = await db.catalog_rules.update_one({"rule_id": rule_id}, {"$set": rule.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "message": "Rule updated"}

@router.delete("/catalog/rules/{rule_id}")
async def delete_rule(rule_id: str, db = Depends(get_db)):
    result = await db.catalog_rules.delete_one({"rule_id": rule_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rule not found")
    return {"success": True, "message": "Rule deleted"}

# Packages
@router.get("/catalog/packages")
async def get_catalog_packages(db = Depends(get_db)):
    items = await db.catalog_packages.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "packages": items, "count": len(items)}

@router.post("/catalog/packages")
async def create_catalog_package(package: CatalogPackageCreate, db = Depends(get_db)):
    data = package.dict()
    data["package_id"] = f"PKG-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.catalog_packages.insert_one(data)
    return {"success": True, "message": "Package created", "package_id": data["package_id"]}

@router.get("/catalog/packages/{package_id}")
async def get_package_detail(package_id: str, db = Depends(get_db)):
    item = await db.catalog_packages.find_one({"package_id": package_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"success": True, "package": item}

@router.put("/catalog/packages/{package_id}")
async def update_package(package_id: str, package: CatalogPackageCreate, db = Depends(get_db)):
    result = await db.catalog_packages.update_one({"package_id": package_id}, {"$set": package.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"success": True, "message": "Package updated"}

@router.delete("/catalog/packages/{package_id}")
async def delete_package(package_id: str, db = Depends(get_db)):
    result = await db.catalog_packages.delete_one({"package_id": package_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Package not found")
    return {"success": True, "message": "Package deleted"}

# ============== REVENUE ROUTES ==============

# Enhanced CRM sample leads data (Zoho + HubSpot + Salesforce)
ENHANCED_SAMPLE_LEADS = [
    {
        "lead_owner": "Rahul Sharma",
        "salutation": "Mr.",
        "first_name": "Amit",
        "last_name": "Patel",
        "title": "Chief Executive Officer",
        "company": "TechVentures Pvt Ltd",
        "company_type": "Enterprise",
        "industry": "Technology",
        "annual_revenue": 50000000,
        "no_of_employees": 250,
        "lead_source": "Website",
        "lead_status": "New",
        "rating": "Hot",
        "lifecycle_stage": "SQL",
        "lead_score": 85,
        "lead_priority": "High",
        "phone": "+91-22-4567890",
        "mobile": "+91-9876543210",
        "email": "amit.patel@techventures.in",
        "secondary_email": "amit.personal@gmail.com",
        "website": "https://techventures.in",
        "linkedin_url": "https://linkedin.com/in/amitpatel",
        "twitter_handle": "@amitpatel_tech",
        "street": "Bandra Kurla Complex, G Block",
        "city": "Mumbai",
        "state": "Maharashtra",
        "zip_code": "400051",
        "country": "India",
        "campaign_source": "Google Ads",
        "campaign_name": "Enterprise CRM Q1",
        "campaign_medium": "PPC",
        "email_opens": 12,
        "email_clicks": 5,
        "website_visits": 8,
        "page_views": 24,
        "form_submissions": 2,
        "deal_value": 2500000,
        "deal_stage": "Proposal",
        "deal_probability": 60,
        "expected_close_date": "2025-02-28",
        "tags": ["enterprise", "high-value", "tech"],
        "description": "Looking for enterprise CRM solution for 500+ users. Budget approved.",
        "email_opt_out": False,
        "current_vendor": "Zoho CRM",
        "pain_points": ["Scalability issues", "Limited customization"]
    },
    {
        "lead_owner": "Priya Singh",
        "salutation": "Mrs.",
        "first_name": "Neha",
        "last_name": "Gupta",
        "title": "VP of Sales",
        "company": "GlobalTrade India",
        "company_type": "Enterprise",
        "industry": "Manufacturing",
        "annual_revenue": 120000000,
        "no_of_employees": 800,
        "lead_source": "Trade Show",
        "lead_status": "Contacted",
        "rating": "Hot",
        "lifecycle_stage": "MQL",
        "lead_score": 78,
        "lead_priority": "High",
        "phone": "+91-11-2345678",
        "mobile": "+91-9812345678",
        "email": "neha.gupta@globaltrade.com",
        "website": "https://globaltrade.com",
        "linkedin_url": "https://linkedin.com/in/nehagupta",
        "street": "Sector 18, Gurugram",
        "city": "Gurugram",
        "state": "Haryana",
        "zip_code": "122001",
        "country": "India",
        "campaign_source": "Trade Show",
        "campaign_name": "ManuTech Expo 2025",
        "campaign_medium": "Event",
        "email_opens": 8,
        "email_clicks": 3,
        "website_visits": 5,
        "page_views": 15,
        "form_submissions": 1,
        "deal_value": 3500000,
        "deal_stage": "Qualification",
        "deal_probability": 40,
        "expected_close_date": "2025-03-15",
        "tags": ["manufacturing", "supply-chain"],
        "description": "Interested in supply chain management module. Met at ManuTech Expo.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Vikram Mehta",
        "salutation": "Dr.",
        "first_name": "Rajesh",
        "last_name": "Kumar",
        "title": "Managing Director",
        "company": "HealthPlus Hospitals",
        "company_type": "Enterprise",
        "industry": "Healthcare",
        "annual_revenue": 75000000,
        "no_of_employees": 450,
        "lead_source": "Referral",
        "lead_status": "Qualified",
        "rating": "Hot",
        "lifecycle_stage": "SQL",
        "lead_score": 92,
        "lead_priority": "High",
        "phone": "+91-80-4123456",
        "mobile": "+91-9900112233",
        "email": "rajesh.kumar@healthplus.org",
        "skype_id": "dr.rajesh.kumar",
        "website": "https://healthplus.org",
        "linkedin_url": "https://linkedin.com/in/drrajeshkumar",
        "street": "Whitefield Main Road",
        "city": "Bangalore",
        "state": "Karnataka",
        "zip_code": "560066",
        "country": "India",
        "campaign_source": "Referral",
        "campaign_name": "Customer Referral Program",
        "campaign_medium": "Word of Mouth",
        "email_opens": 15,
        "email_clicks": 8,
        "website_visits": 12,
        "page_views": 45,
        "form_submissions": 3,
        "deal_value": 5000000,
        "deal_stage": "Negotiation",
        "deal_probability": 75,
        "expected_close_date": "2025-01-31",
        "tags": ["healthcare", "enterprise", "referral"],
        "description": "Referred by FinEdge. Need patient management and billing integration.",
        "email_opt_out": False,
        "current_vendor": "Custom Solution",
        "pain_points": ["Integration issues", "Poor reporting"]
    },
    {
        "lead_owner": "Rahul Sharma",
        "salutation": "Mr.",
        "first_name": "Sanjay",
        "last_name": "Verma",
        "title": "Chief Technology Officer",
        "company": "InnovateSoft Solutions",
        "company_type": "Mid-Market",
        "industry": "Technology",
        "annual_revenue": 35000000,
        "no_of_employees": 150,
        "lead_source": "LinkedIn",
        "lead_status": "Proposal Sent",
        "rating": "Warm",
        "lifecycle_stage": "Opportunity",
        "lead_score": 72,
        "lead_priority": "Medium",
        "phone": "+91-40-5678901",
        "mobile": "+91-9988776655",
        "email": "sanjay.verma@innovatesoft.in",
        "website": "https://innovatesoft.in",
        "linkedin_url": "https://linkedin.com/in/sanjayverma",
        "twitter_handle": "@sanjay_innovate",
        "street": "Hi-Tech City, Madhapur",
        "city": "Hyderabad",
        "state": "Telangana",
        "zip_code": "500081",
        "country": "India",
        "campaign_source": "LinkedIn",
        "campaign_name": "CTO Outreach",
        "campaign_medium": "Social",
        "email_opens": 10,
        "email_clicks": 4,
        "website_visits": 6,
        "page_views": 20,
        "form_submissions": 1,
        "deal_value": 1200000,
        "deal_stage": "Proposal",
        "deal_probability": 50,
        "expected_close_date": "2025-02-15",
        "tags": ["tech", "mid-market"],
        "description": "Evaluating CRM platforms for sales team automation. Proposal sent.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Priya Singh",
        "salutation": "Ms.",
        "first_name": "Kavitha",
        "last_name": "Reddy",
        "title": "Head of Marketing",
        "company": "BrandMax Agency",
        "company_type": "SMB",
        "industry": "Media",
        "annual_revenue": 25000000,
        "no_of_employees": 100,
        "lead_source": "Cold Call",
        "lead_status": "Negotiation",
        "rating": "Hot",
        "lifecycle_stage": "Opportunity",
        "lead_score": 88,
        "lead_priority": "High",
        "phone": "+91-44-8765432",
        "mobile": "+91-9123456789",
        "email": "kavitha.reddy@brandmax.in",
        "secondary_email": "kavitha.r@outlook.com",
        "website": "https://brandmax.in",
        "linkedin_url": "https://linkedin.com/in/kavithareddy",
        "facebook_url": "https://facebook.com/brandmaxagency",
        "street": "Anna Nagar, 2nd Avenue",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "zip_code": "600040",
        "country": "India",
        "campaign_source": "Outbound",
        "campaign_name": "Agency Outreach Q1",
        "campaign_medium": "Phone",
        "email_opens": 20,
        "email_clicks": 12,
        "website_visits": 15,
        "page_views": 50,
        "form_submissions": 4,
        "deal_value": 800000,
        "deal_stage": "Negotiation",
        "deal_probability": 80,
        "expected_close_date": "2025-01-20",
        "tags": ["agency", "marketing-automation"],
        "description": "Final negotiation stage. Looking for marketing automation and lead tracking.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Vikram Mehta",
        "salutation": "Mr.",
        "first_name": "Arjun",
        "last_name": "Malhotra",
        "title": "Founder & CEO",
        "company": "StartupHub Ventures",
        "company_type": "SMB",
        "industry": "Finance",
        "annual_revenue": 15000000,
        "no_of_employees": 50,
        "lead_source": "Partner",
        "lead_status": "New",
        "rating": "Warm",
        "lifecycle_stage": "Lead",
        "lead_score": 55,
        "lead_priority": "Medium",
        "phone": "+91-20-3456789",
        "mobile": "+91-9556677889",
        "email": "arjun@startuphub.vc",
        "website": "https://startuphub.vc",
        "linkedin_url": "https://linkedin.com/in/arjunmalhotra",
        "twitter_handle": "@arjun_vc",
        "street": "Koregaon Park",
        "city": "Pune",
        "state": "Maharashtra",
        "zip_code": "411001",
        "country": "India",
        "campaign_source": "Partner",
        "campaign_name": "VC Partner Program",
        "campaign_medium": "Partnership",
        "email_opens": 3,
        "email_clicks": 1,
        "website_visits": 2,
        "page_views": 8,
        "form_submissions": 1,
        "tags": ["startup", "vc", "finance"],
        "description": "Interested in investor relationship management features.",
        "email_opt_out": True
    },
    {
        "lead_owner": "Rahul Sharma",
        "salutation": "Mrs.",
        "first_name": "Anita",
        "last_name": "Deshmukh",
        "title": "Operations Director",
        "company": "LogiPrime Transport",
        "company_type": "Enterprise",
        "industry": "Transportation",
        "annual_revenue": 90000000,
        "no_of_employees": 600,
        "lead_source": "Advertisement",
        "lead_status": "Contacted",
        "rating": "Warm",
        "lifecycle_stage": "MQL",
        "lead_score": 65,
        "lead_priority": "Medium",
        "phone": "+91-79-6543210",
        "mobile": "+91-9445566778",
        "email": "anita.d@logiprime.com",
        "website": "https://logiprime.com",
        "linkedin_url": "https://linkedin.com/in/anitadeshmukh",
        "street": "SG Highway, Bodakdev",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "zip_code": "380054",
        "country": "India",
        "campaign_source": "Google Ads",
        "campaign_name": "Logistics CRM Ad",
        "campaign_medium": "PPC",
        "email_opens": 6,
        "email_clicks": 2,
        "website_visits": 4,
        "page_views": 12,
        "form_submissions": 1,
        "deal_value": 2000000,
        "deal_stage": "Qualification",
        "deal_probability": 30,
        "tags": ["logistics", "fleet-management"],
        "description": "Need fleet management and customer service module.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Priya Singh",
        "salutation": "Mr.",
        "first_name": "Deepak",
        "last_name": "Agarwal",
        "title": "President",
        "company": "TextileMart Industries",
        "company_type": "Enterprise",
        "industry": "Manufacturing",
        "annual_revenue": 200000000,
        "no_of_employees": 1200,
        "lead_source": "Web Research",
        "lead_status": "Qualified",
        "rating": "Hot",
        "lifecycle_stage": "SQL",
        "lead_score": 95,
        "lead_priority": "High",
        "phone": "+91-141-2890123",
        "mobile": "+91-9334455667",
        "email": "deepak.agarwal@textilemart.co.in",
        "website": "https://textilemart.co.in",
        "linkedin_url": "https://linkedin.com/in/deepakagarwal",
        "street": "Sitapura Industrial Area",
        "city": "Jaipur",
        "state": "Rajasthan",
        "zip_code": "302022",
        "country": "India",
        "campaign_source": "Organic",
        "campaign_name": "SEO Enterprise",
        "campaign_medium": "Organic",
        "email_opens": 18,
        "email_clicks": 10,
        "website_visits": 20,
        "page_views": 75,
        "form_submissions": 5,
        "deal_value": 8000000,
        "deal_stage": "Qualification",
        "deal_probability": 45,
        "expected_close_date": "2025-04-30",
        "tags": ["textile", "enterprise", "erp"],
        "description": "Looking for complete ERP with CRM integration. Largest deal in pipeline.",
        "email_opt_out": False,
        "current_vendor": "SAP",
        "pain_points": ["Too complex", "High cost"]
    },
    {
        "lead_owner": "Vikram Mehta",
        "salutation": "Ms.",
        "first_name": "Shruti",
        "last_name": "Nair",
        "title": "Chief Financial Officer",
        "company": "FinEdge Consulting",
        "company_type": "Mid-Market",
        "industry": "Consulting",
        "annual_revenue": 45000000,
        "no_of_employees": 200,
        "lead_source": "Seminar Partner",
        "lead_status": "Converted",
        "rating": "Hot",
        "lifecycle_stage": "Customer",
        "lead_score": 100,
        "lead_priority": "High",
        "phone": "+91-484-2567890",
        "mobile": "+91-9223344556",
        "email": "shruti.nair@finedge.co",
        "secondary_email": "shruti.personal@yahoo.com",
        "website": "https://finedge.co",
        "linkedin_url": "https://linkedin.com/in/shrutinair",
        "street": "Marine Drive, Ernakulam",
        "city": "Kochi",
        "state": "Kerala",
        "zip_code": "682031",
        "country": "India",
        "campaign_source": "Event",
        "campaign_name": "Finance Summit 2024",
        "campaign_medium": "Event",
        "email_opens": 25,
        "email_clicks": 15,
        "website_visits": 30,
        "page_views": 100,
        "form_submissions": 6,
        "deal_value": 1500000,
        "deal_stage": "Closed Won",
        "deal_probability": 100,
        "is_converted": True,
        "converted_date": "2024-12-15",
        "tags": ["consulting", "converted", "reference-customer"],
        "description": "Successfully onboarded - 100 user license purchased. Happy customer!",
        "email_opt_out": False
    },
    {
        "lead_owner": "Rahul Sharma",
        "salutation": "Mr.",
        "first_name": "Prakash",
        "last_name": "Iyer",
        "title": "General Manager",
        "company": "FoodZone Exports",
        "company_type": "Mid-Market",
        "industry": "Food & Beverage",
        "annual_revenue": 65000000,
        "no_of_employees": 350,
        "lead_source": "Website",
        "lead_status": "Lost",
        "rating": "Cold",
        "lifecycle_stage": "Lead",
        "lead_score": 25,
        "lead_priority": "Low",
        "phone": "+91-821-2345678",
        "mobile": "+91-9112233445",
        "email": "prakash.iyer@foodzone.in",
        "website": "https://foodzone.in",
        "street": "Industrial Suburb, Visvesvaraya Layout",
        "city": "Mysuru",
        "state": "Karnataka",
        "zip_code": "570008",
        "country": "India",
        "campaign_source": "Organic",
        "campaign_name": "SEO Food Industry",
        "campaign_medium": "Organic",
        "email_opens": 2,
        "email_clicks": 0,
        "website_visits": 3,
        "page_views": 5,
        "form_submissions": 1,
        "deal_value": 1000000,
        "deal_stage": "Closed Lost",
        "deal_probability": 0,
        "tags": ["food", "lost"],
        "description": "Chose competitor due to pricing - may revisit next year.",
        "email_opt_out": True,
        "current_vendor": "Freshsales"
    },
    {
        "lead_owner": "Priya Singh",
        "salutation": "Dr.",
        "first_name": "Meera",
        "last_name": "Saxena",
        "title": "Research Director",
        "company": "PharmaCare Labs",
        "company_type": "Enterprise",
        "industry": "Biotechnology",
        "annual_revenue": 85000000,
        "no_of_employees": 400,
        "lead_source": "Internal Seminar",
        "lead_status": "Proposal Sent",
        "rating": "Hot",
        "lifecycle_stage": "Opportunity",
        "lead_score": 82,
        "lead_priority": "High",
        "phone": "+91-120-4567890",
        "mobile": "+91-9001122334",
        "email": "meera.saxena@pharmacare.com",
        "skype_id": "dr.meera.saxena",
        "website": "https://pharmacare.com",
        "linkedin_url": "https://linkedin.com/in/drmeera",
        "street": "Sector 63, Noida",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "zip_code": "201301",
        "country": "India",
        "campaign_source": "Event",
        "campaign_name": "Pharma Tech Seminar",
        "campaign_medium": "Event",
        "email_opens": 14,
        "email_clicks": 7,
        "website_visits": 10,
        "page_views": 35,
        "form_submissions": 3,
        "deal_value": 4500000,
        "deal_stage": "Proposal",
        "deal_probability": 55,
        "expected_close_date": "2025-02-28",
        "tags": ["pharma", "compliance", "regulated"],
        "description": "Needs compliance tracking and regulatory reporting. FDA compliant required.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Vikram Mehta",
        "salutation": "Mr.",
        "first_name": "Kiran",
        "last_name": "Joshi",
        "title": "Business Development Head",
        "company": "EduTech Academy",
        "company_type": "SMB",
        "industry": "Education",
        "annual_revenue": 30000000,
        "no_of_employees": 180,
        "lead_source": "Facebook",
        "lead_status": "New",
        "rating": "Warm",
        "lifecycle_stage": "Lead",
        "lead_score": 48,
        "lead_priority": "Medium",
        "phone": "+91-755-3456789",
        "mobile": "+91-9889900112",
        "email": "kiran.joshi@edutech.edu.in",
        "website": "https://edutech.edu.in",
        "facebook_url": "https://facebook.com/edutechacademy",
        "street": "MP Nagar, Zone 2",
        "city": "Bhopal",
        "state": "Madhya Pradesh",
        "zip_code": "462011",
        "country": "India",
        "campaign_source": "Facebook",
        "campaign_name": "Education Sector Ads",
        "campaign_medium": "Social",
        "email_opens": 4,
        "email_clicks": 1,
        "website_visits": 3,
        "page_views": 10,
        "form_submissions": 1,
        "tags": ["education", "edtech"],
        "description": "Looking for student enrollment and fee management system.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Rahul Sharma",
        "salutation": "Mrs.",
        "first_name": "Lakshmi",
        "last_name": "Krishnan",
        "title": "Vice President",
        "company": "RetailKing Stores",
        "company_type": "Enterprise",
        "industry": "Retail",
        "annual_revenue": 150000000,
        "no_of_employees": 950,
        "lead_source": "Twitter",
        "lead_status": "Negotiation",
        "rating": "Hot",
        "lifecycle_stage": "Opportunity",
        "lead_score": 90,
        "lead_priority": "High",
        "phone": "+91-44-9012345",
        "mobile": "+91-9778899001",
        "email": "lakshmi.k@retailking.in",
        "secondary_email": "lakshmi.personal@gmail.com",
        "website": "https://retailking.in",
        "linkedin_url": "https://linkedin.com/in/lakshmikrishnan",
        "twitter_handle": "@lakshmi_retail",
        "street": "T Nagar",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "zip_code": "600017",
        "country": "India",
        "campaign_source": "Twitter",
        "campaign_name": "Retail CRM Campaign",
        "campaign_medium": "Social",
        "email_opens": 22,
        "email_clicks": 14,
        "website_visits": 18,
        "page_views": 60,
        "form_submissions": 4,
        "deal_value": 6000000,
        "deal_stage": "Negotiation",
        "deal_probability": 70,
        "expected_close_date": "2025-01-25",
        "tags": ["retail", "pos", "loyalty"],
        "description": "Multi-store POS integration with customer loyalty program. Price negotiation ongoing.",
        "email_opt_out": False,
        "current_vendor": "Shopify POS"
    },
    {
        "lead_owner": "Priya Singh",
        "salutation": "Mr.",
        "first_name": "Rohit",
        "last_name": "Sinha",
        "title": "Managing Partner",
        "company": "LegalEase Advocates",
        "company_type": "SMB",
        "industry": "Legal",
        "annual_revenue": 20000000,
        "no_of_employees": 75,
        "lead_source": "Employee Referral",
        "lead_status": "Contacted",
        "rating": "Warm",
        "lifecycle_stage": "MQL",
        "lead_score": 58,
        "lead_priority": "Medium",
        "phone": "+91-33-2890456",
        "mobile": "+91-9667788990",
        "email": "rohit.sinha@legalease.law",
        "website": "https://legalease.law",
        "linkedin_url": "https://linkedin.com/in/rohitsinha",
        "street": "Park Street",
        "city": "Kolkata",
        "state": "West Bengal",
        "zip_code": "700016",
        "country": "India",
        "campaign_source": "Referral",
        "campaign_name": "Employee Referral Program",
        "campaign_medium": "Referral",
        "email_opens": 7,
        "email_clicks": 3,
        "website_visits": 5,
        "page_views": 18,
        "form_submissions": 2,
        "deal_value": 600000,
        "deal_stage": "Qualification",
        "deal_probability": 35,
        "tags": ["legal", "case-management"],
        "description": "Case management and client billing system needed. Referred by employee.",
        "email_opt_out": False
    },
    {
        "lead_owner": "Vikram Mehta",
        "salutation": "Prof.",
        "first_name": "Vivek",
        "last_name": "Menon",
        "title": "Chief Operating Officer",
        "company": "GreenEnergy Solutions",
        "company_type": "Enterprise",
        "industry": "Energy",
        "annual_revenue": 110000000,
        "no_of_employees": 550,
        "lead_source": "External Referral",
        "lead_status": "Qualified",
        "rating": "Hot",
        "lifecycle_stage": "SQL",
        "lead_score": 87,
        "lead_priority": "High",
        "phone": "+91-674-2345678",
        "mobile": "+91-9556677880",
        "email": "vivek.menon@greenenergy.co.in",
        "skype_id": "vivek.menon.green",
        "website": "https://greenenergy.co.in",
        "linkedin_url": "https://linkedin.com/in/vivekmenon",
        "twitter_handle": "@vivek_green",
        "street": "Patia, Near KIIT",
        "city": "Bhubaneswar",
        "state": "Odisha",
        "zip_code": "751024",
        "country": "India",
        "campaign_source": "Referral",
        "campaign_name": "Partner Referral Q4",
        "campaign_medium": "Partnership",
        "email_opens": 16,
        "email_clicks": 9,
        "website_visits": 14,
        "page_views": 48,
        "form_submissions": 4,
        "deal_value": 3800000,
        "deal_stage": "Qualification",
        "deal_probability": 50,
        "expected_close_date": "2025-03-31",
        "tags": ["energy", "solar", "project-management"],
        "description": "Project management and resource allocation for solar installations. Government contracts.",
        "email_opt_out": False,
        "current_vendor": "Monday.com"
    }
]

@router.get("/revenue/leads")
async def get_leads(
    lead_status: Optional[str] = None, 
    lead_source: Optional[str] = None,
    rating: Optional[str] = None,
    db = Depends(get_db)
):
    query = {}
    if lead_status:
        query["lead_status"] = lead_status
    if lead_source:
        query["lead_source"] = lead_source
    if rating:
        query["rating"] = rating
    items = await db.revenue_leads.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "leads": items, "count": len(items)}

@router.post("/revenue/leads/seed")
async def seed_enhanced_leads(db = Depends(get_db)):
    """Seed 15 comprehensive CRM-style sample leads (Zoho + HubSpot + Salesforce features)"""
    # Clear existing leads and related data
    await db.revenue_leads.delete_many({})
    await db.lead_activities.delete_many({})
    await db.lead_deals.delete_many({})
    
    # Insert sample leads with unique IDs
    for i, lead_data in enumerate(ENHANCED_SAMPLE_LEADS, 1):
        lead_copy = lead_data.copy()
        lead_copy["lead_id"] = f"LEAD-2025-{i:04d}"
        lead_copy["created_at"] = datetime.now(timezone.utc).isoformat()
        lead_copy["updated_at"] = datetime.now(timezone.utc).isoformat()
        await db.revenue_leads.insert_one(lead_copy)
        
        # Create sample activities for each lead
        sample_activities = [
            {
                "activity_id": f"ACT-{i:04d}-001",
                "activity_type": "email",
                "subject": f"Welcome email sent to {lead_data.get('first_name')}",
                "description": "Initial outreach email sent introducing our CRM solution",
                "lead_id": lead_copy["lead_id"],
                "status": "completed",
                "completed_date": datetime.now(timezone.utc).isoformat(),
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "activity_id": f"ACT-{i:04d}-002",
                "activity_type": "call",
                "subject": f"Discovery call with {lead_data.get('first_name')}",
                "description": "Initial discovery call to understand requirements",
                "lead_id": lead_copy["lead_id"],
                "status": "completed" if i % 2 == 0 else "pending",
                "outcome": "connected" if i % 2 == 0 else None,
                "duration_minutes": 30 if i % 2 == 0 else None,
                "due_date": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat() if i % 2 != 0 else None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        for act in sample_activities:
            await db.lead_activities.insert_one(act)
        
        # Create sample deal for leads with deal_value
        if lead_data.get("deal_value"):
            deal_data = {
                "deal_id": f"DEAL-2025-{i:04d}",
                "deal_name": f"{lead_data.get('company')} - CRM Implementation",
                "lead_id": lead_copy["lead_id"],
                "amount": lead_data.get("deal_value"),
                "currency": "INR",
                "stage": lead_data.get("deal_stage", "Qualification"),
                "probability": lead_data.get("deal_probability", 20),
                "expected_close_date": lead_data.get("expected_close_date"),
                "deal_type": "New Business",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.lead_deals.insert_one(deal_data)
    
    return {
        "success": True, 
        "message": f"Seeded {len(ENHANCED_SAMPLE_LEADS)} enhanced CRM leads with activities and deals"
    }

@router.post("/revenue/leads")
async def create_lead(lead: LeadCreate, db = Depends(get_db)):
    data = lead.dict()
    data["lead_id"] = f"LEAD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.revenue_leads.insert_one(data)
    return {"success": True, "message": "Lead created", "lead_id": data["lead_id"]}

@router.get("/revenue/leads/{lead_id}")
async def get_lead_detail(lead_id: str, db = Depends(get_db)):
    item = await db.revenue_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "lead": item}

@router.put("/revenue/leads/{lead_id}")
async def update_lead(lead_id: str, lead: LeadCreate, db = Depends(get_db)):
    result = await db.revenue_leads.update_one({"lead_id": lead_id}, {"$set": lead.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": "Lead updated"}

@router.delete("/revenue/leads/{lead_id}")
async def delete_lead(lead_id: str, db = Depends(get_db)):
    result = await db.revenue_leads.delete_one({"lead_id": lead_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": "Lead deleted"}

# ============== LEAD SCORING (HubSpot/Salesforce) ==============

def calculate_lead_score(lead: dict) -> int:
    """Calculate lead score based on engagement, demographics, and behaviors"""
    score = 0
    
    # Demographics scoring
    if lead.get("title"):
        title_lower = lead["title"].lower()
        if any(x in title_lower for x in ["ceo", "cto", "cfo", "president", "director", "vp", "vice president"]):
            score += 25
        elif any(x in title_lower for x in ["manager", "head", "lead"]):
            score += 15
        else:
            score += 5
    
    # Company size scoring
    employees = lead.get("no_of_employees", 0) or 0
    if employees > 500:
        score += 20
    elif employees > 100:
        score += 15
    elif employees > 50:
        score += 10
    else:
        score += 5
    
    # Annual revenue scoring
    revenue = lead.get("annual_revenue", 0) or 0
    if revenue > 100000000:  # 10Cr+
        score += 25
    elif revenue > 50000000:  # 5Cr+
        score += 20
    elif revenue > 10000000:  # 1Cr+
        score += 15
    else:
        score += 5
    
    # Engagement scoring
    score += (lead.get("email_opens", 0) or 0) * 2
    score += (lead.get("email_clicks", 0) or 0) * 5
    score += (lead.get("website_visits", 0) or 0) * 3
    score += (lead.get("page_views", 0) or 0) * 1
    score += (lead.get("form_submissions", 0) or 0) * 10
    
    # Rating boost
    rating = lead.get("rating", "")
    if rating == "Hot":
        score += 20
    elif rating == "Warm":
        score += 10
    
    # Social presence
    if lead.get("linkedin_url"):
        score += 5
    if lead.get("twitter_handle"):
        score += 3
    
    # Deal value boost
    deal_value = lead.get("deal_value", 0) or 0
    if deal_value > 1000000:
        score += 15
    elif deal_value > 500000:
        score += 10
    elif deal_value > 100000:
        score += 5
    
    return min(score, 100)  # Cap at 100


@router.post("/revenue/leads/{lead_id}/calculate-score")
async def calculate_and_update_lead_score(lead_id: str, db = Depends(get_db)):
    """Calculate and update lead score for a specific lead"""
    lead = await db.revenue_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    score = calculate_lead_score(lead)
    await db.revenue_leads.update_one(
        {"lead_id": lead_id}, 
        {"$set": {"lead_score": score, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "lead_id": lead_id, "lead_score": score}


@router.post("/revenue/leads/recalculate-all-scores")
async def recalculate_all_lead_scores(db = Depends(get_db)):
    """Recalculate scores for all leads"""
    leads = await db.revenue_leads.find({}, {"_id": 0}).to_list(1000)
    updated = 0
    for lead in leads:
        score = calculate_lead_score(lead)
        await db.revenue_leads.update_one(
            {"lead_id": lead["lead_id"]}, 
            {"$set": {"lead_score": score}}
        )
        updated += 1
    return {"success": True, "message": f"Recalculated scores for {updated} leads"}


# ============== LEAD ACTIVITIES (HubSpot/Salesforce) ==============

@router.get("/revenue/leads/{lead_id}/activities")
async def get_lead_activities(lead_id: str, db = Depends(get_db)):
    """Get all activities for a lead"""
    activities = await db.lead_activities.find(
        {"lead_id": lead_id}, 
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    return {"success": True, "activities": activities, "count": len(activities)}


@router.post("/revenue/leads/{lead_id}/activities")
async def create_lead_activity(lead_id: str, activity: ActivityCreate, db = Depends(get_db)):
    """Create a new activity for a lead"""
    # Verify lead exists
    lead = await db.revenue_leads.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    data = activity.dict()
    data["activity_id"] = f"ACT-{datetime.now().strftime('%Y%m%d%H%M%S%f')[:17]}"
    data["lead_id"] = lead_id
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.lead_activities.insert_one(data)
    
    # Update lead's last activity date
    await db.revenue_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "last_activity_date": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Activity created", "activity_id": data["activity_id"]}


@router.put("/revenue/activities/{activity_id}")
async def update_activity(activity_id: str, activity: ActivityCreate, db = Depends(get_db)):
    """Update an activity"""
    data = activity.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.lead_activities.update_one(
        {"activity_id": activity_id}, 
        {"$set": data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"success": True, "message": "Activity updated"}


@router.delete("/revenue/activities/{activity_id}")
async def delete_activity(activity_id: str, db = Depends(get_db)):
    """Delete an activity"""
    result = await db.lead_activities.delete_one({"activity_id": activity_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Activity not found")
    return {"success": True, "message": "Activity deleted"}


@router.post("/revenue/leads/{lead_id}/log-call")
async def log_call(lead_id: str, subject: str, description: str = None, outcome: str = None, duration: int = None, db = Depends(get_db)):
    """Quick log a call for a lead"""
    activity = ActivityCreate(
        activity_type="call",
        subject=subject,
        description=description,
        lead_id=lead_id,
        outcome=outcome,
        duration_minutes=duration,
        status="completed",
        completed_date=datetime.now(timezone.utc).isoformat()
    )
    return await create_lead_activity(lead_id, activity, db)


@router.post("/revenue/leads/{lead_id}/log-email")
async def log_email(lead_id: str, subject: str, description: str = None, db = Depends(get_db)):
    """Quick log an email for a lead"""
    activity = ActivityCreate(
        activity_type="email",
        subject=subject,
        description=description,
        lead_id=lead_id,
        status="completed",
        completed_date=datetime.now(timezone.utc).isoformat()
    )
    return await create_lead_activity(lead_id, activity, db)


@router.post("/revenue/leads/{lead_id}/schedule-meeting")
async def schedule_meeting(lead_id: str, subject: str, due_date: str, description: str = None, db = Depends(get_db)):
    """Schedule a meeting for a lead"""
    activity = ActivityCreate(
        activity_type="meeting",
        subject=subject,
        description=description,
        lead_id=lead_id,
        due_date=due_date,
        status="pending"
    )
    return await create_lead_activity(lead_id, activity, db)


@router.post("/revenue/leads/{lead_id}/create-task")
async def create_task(lead_id: str, subject: str, due_date: str = None, priority: str = "medium", description: str = None, db = Depends(get_db)):
    """Create a task for a lead"""
    activity = ActivityCreate(
        activity_type="task",
        subject=subject,
        description=description,
        lead_id=lead_id,
        due_date=due_date,
        priority=priority,
        status="pending"
    )
    return await create_lead_activity(lead_id, activity, db)


# ============== DEALS/OPPORTUNITIES (Salesforce) ==============

@router.get("/revenue/leads/{lead_id}/deals")
async def get_lead_deals(lead_id: str, db = Depends(get_db)):
    """Get all deals for a lead"""
    deals = await db.lead_deals.find({"lead_id": lead_id}, {"_id": 0}).to_list(100)
    return {"success": True, "deals": deals, "count": len(deals)}


@router.get("/revenue/deals")
async def get_all_deals(stage: Optional[str] = None, db = Depends(get_db)):
    """Get all deals with optional stage filter"""
    query = {}
    if stage:
        query["stage"] = stage
    deals = await db.lead_deals.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "deals": deals, "count": len(deals)}


@router.post("/revenue/leads/{lead_id}/deals")
async def create_deal(lead_id: str, deal: DealCreate, db = Depends(get_db)):
    """Create a new deal/opportunity for a lead"""
    # Verify lead exists
    lead = await db.revenue_leads.find_one({"lead_id": lead_id})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    data = deal.dict()
    data["deal_id"] = f"DEAL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["lead_id"] = lead_id
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.lead_deals.insert_one(data)
    
    # Update lead with deal info
    await db.revenue_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "deal_value": data["amount"],
            "deal_stage": data["stage"],
            "deal_probability": data["probability"],
            "expected_close_date": data.get("expected_close_date"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Deal created", "deal_id": data["deal_id"]}


@router.put("/revenue/deals/{deal_id}")
async def update_deal(deal_id: str, deal: DealCreate, db = Depends(get_db)):
    """Update a deal"""
    data = deal.dict()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = await db.lead_deals.update_one({"deal_id": deal_id}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"success": True, "message": "Deal updated"}


@router.delete("/revenue/deals/{deal_id}")
async def delete_deal(deal_id: str, db = Depends(get_db)):
    """Delete a deal"""
    result = await db.lead_deals.delete_one({"deal_id": deal_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Deal not found")
    return {"success": True, "message": "Deal deleted"}


# ============== LEAD CONVERSION (Salesforce) ==============

@router.post("/revenue/leads/{lead_id}/convert")
async def convert_lead(lead_id: str, create_opportunity: bool = True, db = Depends(get_db)):
    """Convert a lead to Account + Contact + optionally Opportunity (Salesforce style)"""
    lead = await db.revenue_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    if lead.get("is_converted"):
        raise HTTPException(status_code=400, detail="Lead is already converted")
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Create Account
    account_data = {
        "account_id": f"ACC-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "account_name": lead.get("company"),
        "industry": lead.get("industry"),
        "annual_revenue": lead.get("annual_revenue"),
        "no_of_employees": lead.get("no_of_employees"),
        "website": lead.get("website"),
        "phone": lead.get("phone"),
        "street": lead.get("street"),
        "city": lead.get("city"),
        "state": lead.get("state"),
        "zip_code": lead.get("zip_code"),
        "country": lead.get("country"),
        "source_lead_id": lead_id,
        "created_at": now
    }
    await db.accounts.insert_one(account_data)
    
    # Create Contact
    contact_data = {
        "contact_id": f"CON-{datetime.now().strftime('%Y%m%d%H%M%S')}",
        "salutation": lead.get("salutation"),
        "first_name": lead.get("first_name"),
        "last_name": lead.get("last_name"),
        "title": lead.get("title"),
        "email": lead.get("email"),
        "phone": lead.get("phone"),
        "mobile": lead.get("mobile"),
        "account_id": account_data["account_id"],
        "source_lead_id": lead_id,
        "created_at": now
    }
    await db.contacts.insert_one(contact_data)
    
    opportunity_id = None
    if create_opportunity:
        # Create Opportunity
        opportunity_data = {
            "opportunity_id": f"OPP-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "opportunity_name": f"{lead.get('company')} - {lead.get('first_name')} {lead.get('last_name')}",
            "account_id": account_data["account_id"],
            "contact_id": contact_data["contact_id"],
            "amount": lead.get("deal_value") or lead.get("annual_revenue", 0) * 0.1,
            "stage": "Qualification",
            "probability": 20,
            "source_lead_id": lead_id,
            "created_at": now
        }
        await db.opportunities.insert_one(opportunity_data)
        opportunity_id = opportunity_data["opportunity_id"]
    
    # Update lead as converted
    await db.revenue_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "is_converted": True,
            "converted_date": now,
            "converted_account_id": account_data["account_id"],
            "converted_contact_id": contact_data["contact_id"],
            "converted_opportunity_id": opportunity_id,
            "lead_status": "Converted",
            "lifecycle_stage": "Customer",
            "updated_at": now
        }}
    )
    
    return {
        "success": True,
        "message": "Lead converted successfully",
        "account_id": account_data["account_id"],
        "contact_id": contact_data["contact_id"],
        "opportunity_id": opportunity_id
    }


# ============== LIFECYCLE STAGE UPDATE (HubSpot) ==============

@router.put("/revenue/leads/{lead_id}/lifecycle-stage")
async def update_lifecycle_stage(lead_id: str, stage: str, db = Depends(get_db)):
    """Update lead lifecycle stage (HubSpot style)"""
    valid_stages = ["Subscriber", "Lead", "MQL", "SQL", "Opportunity", "Customer"]
    if stage not in valid_stages:
        raise HTTPException(status_code=400, detail=f"Invalid stage. Must be one of: {valid_stages}")
    
    result = await db.revenue_leads.update_one(
        {"lead_id": lead_id},
        {"$set": {
            "lifecycle_stage": stage,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": f"Lifecycle stage updated to {stage}"}


# ============== LEAD ENGAGEMENT TRACKING (HubSpot) ==============

@router.post("/revenue/leads/{lead_id}/track-engagement")
async def track_engagement(
    lead_id: str, 
    engagement_type: str,  # email_open, email_click, website_visit, page_view, form_submission
    db = Depends(get_db)
):
    """Track an engagement event for a lead"""
    valid_types = ["email_open", "email_click", "website_visit", "page_view", "form_submission"]
    if engagement_type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid type. Must be one of: {valid_types}")
    
    field_map = {
        "email_open": "email_opens",
        "email_click": "email_clicks",
        "website_visit": "website_visits",
        "page_view": "page_views",
        "form_submission": "form_submissions"
    }
    
    field = field_map[engagement_type]
    result = await db.revenue_leads.update_one(
        {"lead_id": lead_id},
        {
            "$inc": {field: 1},
            "$set": {
                "last_activity_date": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Lead not found")
    return {"success": True, "message": f"Tracked {engagement_type}"}


# ============== LEAD TIMELINE (Full Activity History) ==============

@router.get("/revenue/leads/{lead_id}/timeline")
async def get_lead_timeline(lead_id: str, db = Depends(get_db)):
    """Get complete timeline/activity history for a lead"""
    lead = await db.revenue_leads.find_one({"lead_id": lead_id}, {"_id": 0})
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Get all activities
    activities = await db.lead_activities.find({"lead_id": lead_id}, {"_id": 0}).to_list(100)
    
    # Get all deals
    deals = await db.lead_deals.find({"lead_id": lead_id}, {"_id": 0}).to_list(100)
    
    # Build timeline
    timeline = []
    
    # Add lead creation event
    timeline.append({
        "type": "lead_created",
        "title": "Lead Created",
        "description": f"Lead for {lead.get('first_name')} {lead.get('last_name')} at {lead.get('company')} was created",
        "date": lead.get("created_at"),
        "icon": "plus"
    })
    
    # Add activities
    for act in activities:
        icon_map = {"call": "phone", "email": "mail", "meeting": "calendar", "task": "check", "note": "file"}
        timeline.append({
            "type": f"activity_{act.get('activity_type')}",
            "title": act.get("subject"),
            "description": act.get("description"),
            "date": act.get("created_at"),
            "icon": icon_map.get(act.get("activity_type"), "activity"),
            "status": act.get("status")
        })
    
    # Add deals
    for deal in deals:
        timeline.append({
            "type": "deal_created",
            "title": f"Deal Created: {deal.get('deal_name')}",
            "description": f"Amount: ₹{deal.get('amount'):,.0f} | Stage: {deal.get('stage')}",
            "date": deal.get("created_at"),
            "icon": "briefcase"
        })
    
    # Add conversion event if converted
    if lead.get("is_converted"):
        timeline.append({
            "type": "lead_converted",
            "title": "Lead Converted",
            "description": "Lead was converted to Account, Contact, and Opportunity",
            "date": lead.get("converted_date"),
            "icon": "check-circle"
        })
    
    # Sort by date descending
    timeline.sort(key=lambda x: x.get("date", ""), reverse=True)
    
    return {"success": True, "timeline": timeline, "count": len(timeline)}


# ============== LEAD DASHBOARD STATS ==============

@router.get("/revenue/leads/dashboard/stats")
async def get_lead_dashboard_stats(db = Depends(get_db)):
    """Get comprehensive lead dashboard statistics"""
    leads = await db.revenue_leads.find({}, {"_id": 0}).to_list(1000)
    
    total = len(leads)
    
    # Status breakdown
    status_counts = {}
    for lead in leads:
        status = lead.get("lead_status", "Unknown")
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Rating breakdown
    rating_counts = {"Hot": 0, "Warm": 0, "Cold": 0}
    for lead in leads:
        rating = lead.get("rating", "")
        if rating in rating_counts:
            rating_counts[rating] += 1
    
    # Lifecycle stage breakdown
    lifecycle_counts = {}
    for lead in leads:
        stage = lead.get("lifecycle_stage", "Lead")
        lifecycle_counts[stage] = lifecycle_counts.get(stage, 0) + 1
    
    # Source breakdown
    source_counts = {}
    for lead in leads:
        source = lead.get("lead_source", "Unknown")
        source_counts[source] = source_counts.get(source, 0) + 1
    
    # Total potential revenue
    total_revenue = sum(lead.get("annual_revenue", 0) or 0 for lead in leads)
    total_deal_value = sum(lead.get("deal_value", 0) or 0 for lead in leads)
    
    # Converted leads
    converted = sum(1 for lead in leads if lead.get("is_converted"))
    
    # Average lead score
    scores = [lead.get("lead_score", 0) for lead in leads if lead.get("lead_score")]
    avg_score = sum(scores) / len(scores) if scores else 0
    
    # Top scoring leads
    top_leads = sorted(leads, key=lambda x: x.get("lead_score", 0), reverse=True)[:5]
    
    return {
        "success": True,
        "stats": {
            "total_leads": total,
            "status_breakdown": status_counts,
            "rating_breakdown": rating_counts,
            "lifecycle_breakdown": lifecycle_counts,
            "source_breakdown": source_counts,
            "total_potential_revenue": total_revenue,
            "total_deal_value": total_deal_value,
            "converted_leads": converted,
            "conversion_rate": round((converted / total * 100), 1) if total > 0 else 0,
            "average_lead_score": round(avg_score, 1),
            "top_scoring_leads": [
                {"lead_id": l.get("lead_id"), "name": f"{l.get('first_name')} {l.get('last_name')}", "score": l.get("lead_score", 0)}
                for l in top_leads
            ]
        }
    }

# Evaluations
@router.get("/revenue/evaluations")
async def get_evaluations(db = Depends(get_db)):
    items = await db.revenue_evaluations.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "evaluations": items, "count": len(items)}

@router.post("/revenue/evaluations")
async def create_evaluation(evaluation: EvaluationCreate, db = Depends(get_db)):
    data = evaluation.dict()
    data["evaluation_id"] = f"EVAL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.revenue_evaluations.insert_one(data)
    return {"success": True, "message": "Evaluation created", "evaluation_id": data["evaluation_id"]}

@router.get("/revenue/evaluations/{evaluation_id}")
async def get_evaluation_detail(evaluation_id: str, db = Depends(get_db)):
    item = await db.revenue_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "evaluation": item}

@router.put("/revenue/evaluations/{evaluation_id}")
async def update_evaluation(evaluation_id: str, evaluation: EvaluationCreate, db = Depends(get_db)):
    result = await db.revenue_evaluations.update_one({"evaluation_id": evaluation_id}, {"$set": evaluation.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "message": "Evaluation updated"}

@router.delete("/revenue/evaluations/{evaluation_id}")
async def delete_evaluation(evaluation_id: str, db = Depends(get_db)):
    result = await db.revenue_evaluations.delete_one({"evaluation_id": evaluation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "message": "Evaluation deleted"}

# Commits
@router.get("/revenue/commits")
async def get_commits(db = Depends(get_db)):
    items = await db.revenue_commits.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "commits": items, "count": len(items)}

@router.post("/revenue/commits")
async def create_commit(commit: CommitCreate, db = Depends(get_db)):
    data = commit.dict()
    data["commit_id"] = f"CMT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.revenue_commits.insert_one(data)
    return {"success": True, "message": "Commit created", "commit_id": data["commit_id"]}

@router.get("/revenue/commits/{commit_id}")
async def get_commit_detail(commit_id: str, db = Depends(get_db)):
    item = await db.revenue_commits.find_one({"commit_id": commit_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "commit": item}

@router.put("/revenue/commits/{commit_id}")
async def update_commit(commit_id: str, commit: CommitCreate, db = Depends(get_db)):
    result = await db.revenue_commits.update_one({"commit_id": commit_id}, {"$set": commit.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "message": "Commit updated"}

@router.delete("/revenue/commits/{commit_id}")
async def delete_commit(commit_id: str, db = Depends(get_db)):
    result = await db.revenue_commits.delete_one({"commit_id": commit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "message": "Commit deleted"}

# Contracts
@router.get("/revenue/contracts")
async def get_contracts(db = Depends(get_db)):
    items = await db.revenue_contracts.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "contracts": items, "count": len(items)}

@router.post("/revenue/contracts")
async def create_contract(contract: ContractCreate, db = Depends(get_db)):
    data = contract.dict()
    data["contract_id"] = f"CNT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.revenue_contracts.insert_one(data)
    return {"success": True, "message": "Contract created", "contract_id": data["contract_id"]}

@router.get("/revenue/contracts/{contract_id}")
async def get_contract_detail(contract_id: str, db = Depends(get_db)):
    item = await db.revenue_contracts.find_one({"contract_id": contract_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": item}

@router.put("/revenue/contracts/{contract_id}")
async def update_contract(contract_id: str, contract: ContractCreate, db = Depends(get_db)):
    result = await db.revenue_contracts.update_one({"contract_id": contract_id}, {"$set": contract.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract updated"}

@router.delete("/revenue/contracts/{contract_id}")
async def delete_contract(contract_id: str, db = Depends(get_db)):
    result = await db.revenue_contracts.delete_one({"contract_id": contract_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract deleted"}

# ============== PROCUREMENT ROUTES ==============

@router.get("/procurement/requests")
async def get_procurement_requests(status: Optional[str] = None, db = Depends(get_db)):
    query = {} if not status else {"status": status}
    items = await db.procurement_requests.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "requests": items, "count": len(items)}

@router.post("/procurement/requests")
async def create_procurement_request(pr: ProcurementCreate, db = Depends(get_db)):
    data = pr.dict()
    data["pr_id"] = f"PR-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.procurement_requests.insert_one(data)
    return {"success": True, "message": "PR created", "pr_id": data["pr_id"]}

@router.get("/procurement/requests/{pr_id}")
async def get_pr_detail(pr_id: str, db = Depends(get_db)):
    item = await db.procurement_requests.find_one({"pr_id": pr_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="PR not found")
    return {"success": True, "request": item}

@router.put("/procurement/requests/{pr_id}")
async def update_pr(pr_id: str, pr: ProcurementCreate, db = Depends(get_db)):
    result = await db.procurement_requests.update_one({"pr_id": pr_id}, {"$set": pr.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="PR not found")
    return {"success": True, "message": "PR updated"}

@router.delete("/procurement/requests/{pr_id}")
async def delete_pr(pr_id: str, db = Depends(get_db)):
    result = await db.procurement_requests.delete_one({"pr_id": pr_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="PR not found")
    return {"success": True, "message": "PR deleted"}

# Purchase Orders
@router.get("/procurement/orders")
async def get_purchase_orders(db = Depends(get_db)):
    items = await db.purchase_orders.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "orders": items, "count": len(items)}

@router.post("/procurement/orders")
async def create_purchase_order(po: PurchaseOrderCreate, db = Depends(get_db)):
    data = po.dict()
    data["po_id"] = f"PO-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.purchase_orders.insert_one(data)
    return {"success": True, "message": "PO created", "po_id": data["po_id"]}

@router.get("/procurement/orders/{po_id}")
async def get_po_detail(po_id: str, db = Depends(get_db)):
    item = await db.purchase_orders.find_one({"po_id": po_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="PO not found")
    return {"success": True, "order": item}

@router.put("/procurement/orders/{po_id}")
async def update_po(po_id: str, po: PurchaseOrderCreate, db = Depends(get_db)):
    result = await db.purchase_orders.update_one({"po_id": po_id}, {"$set": po.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="PO not found")
    return {"success": True, "message": "PO updated"}

@router.delete("/procurement/orders/{po_id}")
async def delete_po(po_id: str, db = Depends(get_db)):
    result = await db.purchase_orders.delete_one({"po_id": po_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="PO not found")
    return {"success": True, "message": "PO deleted"}

# Procurement Evaluations
@router.get("/procurement/evaluations")
async def get_procurement_evaluations(db = Depends(get_db)):
    items = await db.procurement_evaluations.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "evaluations": items, "count": len(items)}

@router.post("/procurement/evaluations")
async def create_procurement_evaluation(evaluation: EvaluationCreate, db = Depends(get_db)):
    data = evaluation.dict()
    data["evaluation_id"] = f"PE-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.procurement_evaluations.insert_one(data)
    return {"success": True, "message": "Evaluation created", "evaluation_id": data["evaluation_id"]}

@router.get("/procurement/evaluations/{evaluation_id}")
async def get_procurement_evaluation_detail(evaluation_id: str, db = Depends(get_db)):
    item = await db.procurement_evaluations.find_one({"evaluation_id": evaluation_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "evaluation": item}

@router.put("/procurement/evaluations/{evaluation_id}")
async def update_procurement_evaluation(evaluation_id: str, evaluation: EvaluationCreate, db = Depends(get_db)):
    result = await db.procurement_evaluations.update_one({"evaluation_id": evaluation_id}, {"$set": evaluation.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "message": "Evaluation updated"}

@router.delete("/procurement/evaluations/{evaluation_id}")
async def delete_procurement_evaluation(evaluation_id: str, db = Depends(get_db)):
    result = await db.procurement_evaluations.delete_one({"evaluation_id": evaluation_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Evaluation not found")
    return {"success": True, "message": "Evaluation deleted"}

# Procurement Commits
@router.get("/procurement/commits")
async def get_procurement_commits(db = Depends(get_db)):
    items = await db.procurement_commits.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "commits": items, "count": len(items)}

@router.post("/procurement/commits")
async def create_procurement_commit(commit: CommitCreate, db = Depends(get_db)):
    data = commit.dict()
    data["commit_id"] = f"PC-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.procurement_commits.insert_one(data)
    return {"success": True, "message": "Commit created", "commit_id": data["commit_id"]}

@router.get("/procurement/commits/{commit_id}")
async def get_procurement_commit_detail(commit_id: str, db = Depends(get_db)):
    item = await db.procurement_commits.find_one({"commit_id": commit_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "commit": item}

@router.put("/procurement/commits/{commit_id}")
async def update_procurement_commit(commit_id: str, commit: CommitCreate, db = Depends(get_db)):
    result = await db.procurement_commits.update_one({"commit_id": commit_id}, {"$set": commit.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "message": "Commit updated"}

@router.delete("/procurement/commits/{commit_id}")
async def delete_procurement_commit(commit_id: str, db = Depends(get_db)):
    result = await db.procurement_commits.delete_one({"commit_id": commit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Commit not found")
    return {"success": True, "message": "Commit deleted"}

# Procurement Contracts
@router.get("/procurement/contracts")
async def get_procurement_contracts(db = Depends(get_db)):
    items = await db.procurement_contracts.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "contracts": items, "count": len(items)}

@router.post("/procurement/contracts")
async def create_procurement_contract(contract: ContractCreate, db = Depends(get_db)):
    data = contract.dict()
    data["contract_id"] = f"PCT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.procurement_contracts.insert_one(data)
    return {"success": True, "message": "Contract created", "contract_id": data["contract_id"]}

@router.get("/procurement/contracts/{contract_id}")
async def get_procurement_contract_detail(contract_id: str, db = Depends(get_db)):
    item = await db.procurement_contracts.find_one({"contract_id": contract_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "contract": item}

@router.put("/procurement/contracts/{contract_id}")
async def update_procurement_contract(contract_id: str, contract: ContractCreate, db = Depends(get_db)):
    result = await db.procurement_contracts.update_one({"contract_id": contract_id}, {"$set": contract.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract updated"}

@router.delete("/procurement/contracts/{contract_id}")
async def delete_procurement_contract(contract_id: str, db = Depends(get_db)):
    result = await db.procurement_contracts.delete_one({"contract_id": contract_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Contract not found")
    return {"success": True, "message": "Contract deleted"}

# ============== GOVERNANCE ROUTES ==============

@router.get("/governance/policies")
async def get_policies(status: Optional[str] = None, db = Depends(get_db)):
    query = {} if not status else {"status": status}
    items = await db.governance_policies.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "policies": items, "count": len(items)}

@router.post("/governance/policies")
async def create_policy(policy: PolicyCreate, db = Depends(get_db)):
    data = policy.dict()
    data["policy_id"] = f"POL-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.governance_policies.insert_one(data)
    return {"success": True, "message": "Policy created", "policy_id": data["policy_id"]}

@router.get("/governance/policies/{policy_id}")
async def get_policy_detail(policy_id: str, db = Depends(get_db)):
    item = await db.governance_policies.find_one({"policy_id": policy_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "policy": item}

@router.put("/governance/policies/{policy_id}")
async def update_policy(policy_id: str, policy: PolicyCreate, db = Depends(get_db)):
    result = await db.governance_policies.update_one({"policy_id": policy_id}, {"$set": policy.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "message": "Policy updated"}

@router.delete("/governance/policies/{policy_id}")
async def delete_policy(policy_id: str, db = Depends(get_db)):
    result = await db.governance_policies.delete_one({"policy_id": policy_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    return {"success": True, "message": "Policy deleted"}

# Limits
@router.get("/governance/limits")
async def get_limits(db = Depends(get_db)):
    items = await db.governance_limits.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "limits": items, "count": len(items)}

@router.post("/governance/limits")
async def create_limit(limit: LimitCreate, db = Depends(get_db)):
    data = limit.dict()
    data["limit_id"] = f"LMT-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.governance_limits.insert_one(data)
    return {"success": True, "message": "Limit created", "limit_id": data["limit_id"]}

@router.get("/governance/limits/{limit_id}")
async def get_limit_detail(limit_id: str, db = Depends(get_db)):
    item = await db.governance_limits.find_one({"limit_id": limit_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "limit": item}

@router.put("/governance/limits/{limit_id}")
async def update_limit(limit_id: str, limit: LimitCreate, db = Depends(get_db)):
    result = await db.governance_limits.update_one({"limit_id": limit_id}, {"$set": limit.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "message": "Limit updated"}

@router.delete("/governance/limits/{limit_id}")
async def delete_limit(limit_id: str, db = Depends(get_db)):
    result = await db.governance_limits.delete_one({"limit_id": limit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Limit not found")
    return {"success": True, "message": "Limit deleted"}

# Authority
@router.get("/governance/authority")
async def get_authorities(db = Depends(get_db)):
    items = await db.governance_authority.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "authorities": items, "count": len(items)}

@router.post("/governance/authority")
async def create_authority(authority: AuthorityCreate, db = Depends(get_db)):
    data = authority.dict()
    data["authority_id"] = f"AUTH-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.governance_authority.insert_one(data)
    return {"success": True, "message": "Authority created", "authority_id": data["authority_id"]}

@router.get("/governance/authority/{authority_id}")
async def get_authority_detail(authority_id: str, db = Depends(get_db)):
    item = await db.governance_authority.find_one({"authority_id": authority_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Authority not found")
    return {"success": True, "authority": item}

@router.put("/governance/authority/{authority_id}")
async def update_authority(authority_id: str, authority: AuthorityCreate, db = Depends(get_db)):
    result = await db.governance_authority.update_one({"authority_id": authority_id}, {"$set": authority.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Authority not found")
    return {"success": True, "message": "Authority updated"}

@router.delete("/governance/authority/{authority_id}")
async def delete_authority(authority_id: str, db = Depends(get_db)):
    result = await db.governance_authority.delete_one({"authority_id": authority_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Authority not found")
    return {"success": True, "message": "Authority deleted"}

# Risks
@router.get("/governance/risks")
async def get_risks(db = Depends(get_db)):
    items = await db.governance_risks.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "risks": items, "count": len(items)}

@router.post("/governance/risks")
async def create_risk(risk: RiskCreate, db = Depends(get_db)):
    data = risk.dict()
    data["risk_id"] = f"RSK-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.governance_risks.insert_one(data)
    return {"success": True, "message": "Risk created", "risk_id": data["risk_id"]}

@router.get("/governance/risks/{risk_id}")
async def get_risk_detail(risk_id: str, db = Depends(get_db)):
    item = await db.governance_risks.find_one({"risk_id": risk_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Risk not found")
    return {"success": True, "risk": item}

@router.put("/governance/risks/{risk_id}")
async def update_risk(risk_id: str, risk: RiskCreate, db = Depends(get_db)):
    result = await db.governance_risks.update_one({"risk_id": risk_id}, {"$set": risk.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Risk not found")
    return {"success": True, "message": "Risk updated"}

@router.delete("/governance/risks/{risk_id}")
async def delete_risk(risk_id: str, db = Depends(get_db)):
    result = await db.governance_risks.delete_one({"risk_id": risk_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Risk not found")
    return {"success": True, "message": "Risk deleted"}

# Audits
@router.get("/governance/audits")
async def get_audits(db = Depends(get_db)):
    items = await db.governance_audits.find({}, {"_id": 0}).to_list(1000)
    return {"success": True, "audits": items, "count": len(items)}

@router.post("/governance/audits")
async def create_audit(audit: AuditCreate, db = Depends(get_db)):
    data = audit.dict()
    data["audit_id"] = f"AUD-{datetime.now().strftime('%Y%m%d%H%M%S')}"
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    await db.governance_audits.insert_one(data)
    return {"success": True, "message": "Audit created", "audit_id": data["audit_id"]}

@router.get("/governance/audits/{audit_id}")
async def get_audit_detail(audit_id: str, db = Depends(get_db)):
    item = await db.governance_audits.find_one({"audit_id": audit_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"success": True, "audit": item}

@router.put("/governance/audits/{audit_id}")
async def update_audit(audit_id: str, audit: AuditCreate, db = Depends(get_db)):
    result = await db.governance_audits.update_one({"audit_id": audit_id}, {"$set": audit.dict()})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"success": True, "message": "Audit updated"}

@router.delete("/governance/audits/{audit_id}")
async def delete_audit(audit_id: str, db = Depends(get_db)):
    result = await db.governance_audits.delete_one({"audit_id": audit_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Audit not found")
    return {"success": True, "message": "Audit deleted"}

# ============== DASHBOARD STATS ==============

@router.get("/dashboard/stats")
async def get_module_stats(db = Depends(get_db)):
    try:
        stats = {
            "catalog": {
                "items": await db.catalog_items.count_documents({}),
                "pricing": await db.catalog_pricing.count_documents({}),
                "costing": await db.catalog_costing.count_documents({}),
                "rules": await db.catalog_rules.count_documents({}),
                "packages": await db.catalog_packages.count_documents({})
            },
            "revenue": {
                "leads": await db.revenue_leads.count_documents({}),
                "evaluations": await db.revenue_evaluations.count_documents({}),
                "commits": await db.revenue_commits.count_documents({}),
                "contracts": await db.revenue_contracts.count_documents({})
            },
            "procurement": {
                "requests": await db.procurement_requests.count_documents({}),
                "orders": await db.purchase_orders.count_documents({}),
                "evaluations": await db.procurement_evaluations.count_documents({}),
                "commits": await db.procurement_commits.count_documents({}),
                "contracts": await db.procurement_contracts.count_documents({})
            },
            "governance": {
                "policies": await db.governance_policies.count_documents({}),
                "limits": await db.governance_limits.count_documents({}),
                "authority": await db.governance_authority.count_documents({}),
                "risks": await db.governance_risks.count_documents({}),
                "audits": await db.governance_audits.count_documents({})
            }
        }
        return {"success": True, "stats": stats}
    except Exception as e:
        logger.error(f"Error getting stats: {e}")
        return {"success": True, "stats": {}}
