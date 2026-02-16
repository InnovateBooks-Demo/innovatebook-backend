"""
Seed comprehensive sample Lead data for the new 9-stage SOP system
Creates realistic leads with all fields populated
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import os
import uuid

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client['ib_commerce']

# Sample data templates
COMPANIES = [
    {
        "company_name": "Acme Robotics Pvt Ltd",
        "industry_type": "Manufacturing",
        "company_size": "Medium",
        "country": "India",
        "state": "Maharashtra",
        "city": "Mumbai",
        "website_url": "https://www.acmerobotics.com",
        "contact_name": "Priya Nair",
        "email_address": "priya.nair@acmerobotics.com",
        "phone_number": "+91 9812345678",
        "designation": "Procurement Manager",
        "department": "Operations",
        "product_or_solution_interested_in": "ERP System",
        "estimated_deal_value": 1200000,
        "decision_timeline": "0-3 months",
        "lead_source": "Website"
    },
    {
        "company_name": "TechVision Solutions",
        "industry_type": "SaaS",
        "company_size": "Enterprise",
        "country": "India",
        "state": "Karnataka",
        "city": "Bangalore",
        "website_url": "https://www.techvision.in",
        "contact_name": "Rajesh Kumar",
        "email_address": "rajesh.kumar@techvision.in",
        "phone_number": "+91 9823456789",
        "designation": "CTO",
        "department": "Technology",
        "product_or_solution_interested_in": "Financial Reporting System",
        "estimated_deal_value": 2500000,
        "decision_timeline": "0-3 months",
        "lead_source": "Referral"
    },
    {
        "company_name": "BuildRight Constructions",
        "industry_type": "Construction",
        "company_size": "Medium",
        "country": "India",
        "state": "Gujarat",
        "city": "Ahmedabad",
        "website_url": "https://www.buildright.co.in",
        "contact_name": "Amit Patel",
        "email_address": "amit.patel@buildright.co.in",
        "phone_number": "+91 9834567890",
        "designation": "Finance Director",
        "department": "Finance",
        "product_or_solution_interested_in": "Accounting Software",
        "estimated_deal_value": 800000,
        "decision_timeline": "3-6 months",
        "lead_source": "Partner"
    },
    {
        "company_name": "HealthPlus Pharma Ltd",
        "industry_type": "Healthcare",
        "company_size": "Enterprise",
        "country": "India",
        "state": "Tamil Nadu",
        "city": "Chennai",
        "website_url": "https://www.healthpluspharma.com",
        "contact_name": "Dr. Sunita Rao",
        "email_address": "sunita.rao@healthpluspharma.com",
        "phone_number": "+91 9845678901",
        "designation": "VP Operations",
        "department": "Operations",
        "product_or_solution_interested_in": "Inventory Management System",
        "estimated_deal_value": 1500000,
        "decision_timeline": "3-6 months",
        "lead_source": "Event"
    },
    {
        "company_name": "GreenLeaf Retailers",
        "industry_type": "Retail",
        "company_size": "Small",
        "country": "India",
        "state": "Delhi",
        "city": "New Delhi",
        "website_url": "https://www.greenleaf.in",
        "contact_name": "Neha Sharma",
        "email_address": "neha.sharma@greenleaf.in",
        "phone_number": "+91 9856789012",
        "designation": "Business Owner",
        "department": "Management",
        "product_or_solution_interested_in": "Point of Sale System",
        "estimated_deal_value": 300000,
        "decision_timeline": "6+ months",
        "lead_source": "Campaign"
    },
    {
        "company_name": "LogiTrans Pvt Ltd",
        "industry_type": "Logistics",
        "company_size": "Medium",
        "country": "India",
        "state": "Haryana",
        "city": "Gurgaon",
        "website_url": "https://www.logitrans.co.in",
        "contact_name": "Vikram Singh",
        "email_address": "vikram.singh@logitrans.co.in",
        "phone_number": "+91 9867890123",
        "designation": "Operations Head",
        "department": "Operations",
        "product_or_solution_interested_in": "Fleet Management Software",
        "estimated_deal_value": 950000,
        "decision_timeline": "3-6 months",
        "lead_source": "LinkedIn"
    },
    {
        "company_name": "EduSmart Technologies",
        "industry_type": "Education",
        "company_size": "Medium",
        "country": "India",
        "state": "West Bengal",
        "city": "Kolkata",
        "website_url": "https://www.edusmart.edu.in",
        "contact_name": "Ananya Mukherjee",
        "email_address": "ananya.m@edusmart.edu.in",
        "phone_number": "+91 9878901234",
        "designation": "Director",
        "department": "Administration",
        "product_or_solution_interested_in": "Student Management System",
        "estimated_deal_value": 650000,
        "decision_timeline": "0-3 months",
        "lead_source": "Email"
    },
    {
        "company_name": "FinServe Capital",
        "industry_type": "Finance",
        "company_size": "Enterprise",
        "country": "India",
        "state": "Maharashtra",
        "city": "Pune",
        "website_url": "https://www.finservecapital.in",
        "contact_name": "Karthik Iyer",
        "email_address": "karthik.iyer@finservecapital.in",
        "phone_number": "+91 9889012345",
        "designation": "CFO",
        "department": "Finance",
        "product_or_solution_interested_in": "Complete Finance Suite",
        "estimated_deal_value": 3500000,
        "decision_timeline": "0-3 months",
        "lead_source": "Website"
    },
    {
        "company_name": "MegaMart Superstore",
        "industry_type": "Retail",
        "company_size": "Enterprise",
        "country": "India",
        "state": "Telangana",
        "city": "Hyderabad",
        "website_url": "https://www.megamart.co.in",
        "contact_name": "Sanjay Reddy",
        "email_address": "sanjay.reddy@megamart.co.in",
        "phone_number": "+91 9890123456",
        "designation": "Head of IT",
        "department": "Technology",
        "product_or_solution_interested_in": "Multi-location Accounting",
        "estimated_deal_value": 1800000,
        "decision_timeline": "3-6 months",
        "lead_source": "Partner"
    },
    {
        "company_name": "CloudNine IT Services",
        "industry_type": "SaaS",
        "company_size": "Small",
        "country": "India",
        "state": "Karnataka",
        "city": "Mysore",
        "website_url": "https://www.cloudnineit.com",
        "contact_name": "Divya Krishnan",
        "email_address": "divya@cloudnineit.com",
        "phone_number": "+91 9801234567",
        "designation": "Founder & CEO",
        "department": "Management",
        "product_or_solution_interested_in": "Billing & Invoicing",
        "estimated_deal_value": 200000,
        "decision_timeline": "0-3 months",
        "lead_source": "Referral"
    }
]


def generate_fingerprint(company_name, email, phone, country):
    """Generate fingerprint for duplicate detection"""
    import re
    company = re.sub(r'[^a-z0-9]', '', company_name.lower())
    email_domain = email.split('@')[1] if '@' in email else ''
    phone_clean = re.sub(r'[^0-9]', '', phone) if phone else ''
    return f"{company}|{email_domain}|{phone_clean}|{country.upper()}"


async def seed_leads():
    """Seed lead data"""
    print("🌱 Starting Lead data seeding for new 9-stage SOP system...")
    
    # Clear existing leads
    await db.commerce_leads.delete_many({})
    print("✅ Cleared existing leads")
    
    year = datetime.now().year
    
    for idx, company_data in enumerate(COMPANIES, 1):
        lead_id = f"LD-{year}-{str(idx).zfill(6)}"
        
        # Generate fingerprint
        fingerprint = generate_fingerprint(
            company_data['company_name'],
            company_data['email_address'],
            company_data['phone_number'],
            company_data['country']
        )
        
        # Calculate scoring (simulate different stages for different leads)
        # Hot leads (3), Warm leads (4), Cold leads (3)
        if idx <= 3:
            # Hot leads - high scores
            fit_score = 35 + (idx * 2)
            intent_score = 25 + idx
            potential_score = 25 + idx
            lead_score = fit_score + intent_score + potential_score
            category = "Hot"
            status = "Qualified"
            validation_status = "Verified"
            sop_stage = "Lead_Assign_SOP"
            sop_completed = {
                "Lead_Intake_SOP": True,
                "Lead_Enrich_SOP": True,
                "Lead_Validate_SOP": True,
                "Lead_Qualify_SOP": True,
                "Lead_Assign_SOP": False,
                "Lead_Engage_SOP": False,
                "Lead_Review_SOP": False,
                "Lead_Convert_SOP": False,
                "Lead_Audit_SOP": False
            }
            assigned_to = "Enterprise Team" if company_data['estimated_deal_value'] >= 1000000 else "India Sales Team"
        elif idx <= 7:
            # Warm leads - medium scores
            fit_score = 25 + idx
            intent_score = 18 + idx
            potential_score = 15 + idx
            lead_score = fit_score + intent_score + potential_score
            category = "Warm"
            status = "Validated"
            validation_status = "Verified"
            sop_stage = "Lead_Qualify_SOP"
            sop_completed = {
                "Lead_Intake_SOP": True,
                "Lead_Enrich_SOP": True,
                "Lead_Validate_SOP": True,
                "Lead_Qualify_SOP": False,
                "Lead_Assign_SOP": False,
                "Lead_Engage_SOP": False,
                "Lead_Review_SOP": False,
                "Lead_Convert_SOP": False,
                "Lead_Audit_SOP": False
            }
            assigned_to = None
        else:
            # Cold leads - low scores
            fit_score = 15 + idx
            intent_score = 12 + idx
            potential_score = 10 + idx
            lead_score = fit_score + intent_score + potential_score
            category = "Cold"
            status = "Enriching"
            validation_status = "Pending"
            sop_stage = "Lead_Enrich_SOP"
            sop_completed = {
                "Lead_Intake_SOP": True,
                "Lead_Enrich_SOP": False,
                "Lead_Validate_SOP": False,
                "Lead_Qualify_SOP": False,
                "Lead_Assign_SOP": False,
                "Lead_Engage_SOP": False,
                "Lead_Review_SOP": False,
                "Lead_Convert_SOP": False,
                "Lead_Audit_SOP": False
            }
            assigned_to = None
        
        # Create lead document
        lead_doc = {
            "id": str(uuid.uuid4()),
            "lead_id": lead_id,
            "company_name": company_data['company_name'],
            "lead_source": company_data['lead_source'],
            "captured_by": "system",
            "captured_on": datetime.now(timezone.utc),
            "lead_status": status,
            
            # Contact Person
            "contact_name": company_data['contact_name'],
            "email_address": company_data['email_address'],
            "phone_number": company_data['phone_number'],
            "designation": company_data['designation'],
            "department": company_data['department'],
            
            # Company Information
            "country": company_data['country'],
            "state": company_data['state'],
            "city": company_data['city'],
            "website_url": company_data['website_url'],
            "industry_type": company_data['industry_type'],
            "company_size": company_data['company_size'],
            
            # Business Interest
            "product_or_solution_interested_in": company_data['product_or_solution_interested_in'],
            "estimated_deal_value": company_data['estimated_deal_value'],
            "decision_timeline": company_data['decision_timeline'],
            "notes": f"Lead generated from {company_data['lead_source']} channel",
            
            # Internal Tagging
            "lead_campaign_name": "Q1 2025 Campaign" if idx % 2 == 0 else None,
            "tags": ["enterprise", "priority"] if company_data['estimated_deal_value'] >= 1000000 else ["standard"],
            
            # Fingerprint
            "fingerprint": fingerprint,
            
            # Enrichment
            "enrichment_status": "Completed" if idx <= 7 else "Pending",
            "enrichment_data": {
                "legal_entity_type": "Private Limited",
                "company_size_verified": company_data['company_size'],
                "industry_verified": company_data['industry_type'],
                "linkedin_page": f"https://linkedin.com/company/{company_data['company_name'].replace(' ', '').lower()}",
                "confidence_score": 85.0
            } if idx <= 7 else None,
            "enrichment_last_updated": datetime.now(timezone.utc) if idx <= 7 else None,
            
            # Validation
            "validation_status": validation_status,
            "validation_checks": {
                "email_format": "Passed",
                "email_domain_mx": "Passed",
                "phone_format": "Passed",
                "duplicate_check": "Passed",
                "blacklist_check": "Passed"
            } if idx <= 7 else {},
            "validation_warnings": [],
            "validation_date": datetime.now(timezone.utc) if idx <= 7 else None,
            
            # Scoring
            "lead_score": lead_score,
            "lead_score_category": category,
            "fit_score": fit_score,
            "intent_score": intent_score,
            "potential_score": potential_score,
            "scoring_reasoning": f"Fit: {fit_score}/40 (Good industry match) | Intent: {intent_score}/30 (Quality source) | Potential: {potential_score}/30 (Deal value ₹{company_data['estimated_deal_value']:,.0f})",
            "scoring_date": datetime.now(timezone.utc) if idx <= 7 else None,
            
            # Assignment
            "assigned_to": assigned_to,
            "assigned_date": datetime.now(timezone.utc) if assigned_to else None,
            "assignment_method": "Rule-based" if assigned_to else None,
            "follow_up_due": (datetime.now(timezone.utc) + timedelta(hours=4)) if assigned_to else None,
            
            # Engagement
            "engagement_activities": [
                {
                    "activity_id": str(uuid.uuid4()),
                    "activity_type": "Email",
                    "timestamp": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
                    "performed_by": "system",
                    "notes": "Initial inquiry sent",
                    "outcome": "Responded"
                }
            ] if idx <= 5 else [],
            "last_engagement_date": datetime.now(timezone.utc) - timedelta(days=2) if idx <= 5 else None,
            "engagement_count": 1 if idx <= 5 else 0,
            
            # Review
            "last_activity_date": datetime.now(timezone.utc) - timedelta(days=2) if idx <= 5 else None,
            "dormant_flag": False,
            "dormant_since": None,
            "closure_reason": None,
            "closure_notes": None,
            "closed_date": None,
            
            # Conversion
            "conversion_eligible": idx <= 3,
            "conversion_date": None,
            "conversion_reference": None,
            "converted_to_evaluate_id": None,
            
            # Audit
            "audit_trail": [
                {
                    "action": "LEAD_CREATED",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "performed_by": "system",
                    "details": f"Lead {lead_id} created from source: {company_data['lead_source']}"
                }
            ],
            "sop_version": "v1.7",
            "sop_stage_history": [
                {
                    "stage": "Lead_Intake_SOP",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                    "performed_by": "system",
                    "status": "Completed",
                    "notes": "Lead captured successfully"
                }
            ],
            "current_sop_stage": sop_stage,
            "sop_completion_status": sop_completed,
            
            # System fields
            "created_at": datetime.now(timezone.utc),
            "updated_at": datetime.now(timezone.utc),
            "created_by": "system",
            "modified_by": None
        }
        
        await db.commerce_leads.insert_one(lead_doc)
        print(f"✅ Created {lead_id}: {company_data['company_name']} - {category} ({lead_score}/100)")
    
    print(f"\n🎉 Successfully seeded {len(COMPANIES)} leads!")
    print(f"   🔥 Hot: 3 leads (score 76-100)")
    print(f"   ⚡ Warm: 4 leads (score 51-75)")
    print(f"   ❄️  Cold: 3 leads (score 0-50)")


async def main():
    try:
        await seed_leads()
        print("\n✅ Lead seeding completed successfully!")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    asyncio.run(main())
