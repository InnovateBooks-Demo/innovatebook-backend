"""
Seed sample Evaluation data for IB Commerce module
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, date, timedelta
import uuid

# MongoDB connection
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sample evaluation data
sample_evaluations = [
    {
        "id": str(uuid.uuid4()),
        "evaluation_id": "EVAL-2025-001",
        "linked_lead_id": "LEAD-2025-001",
        "customer_id": "cust_001",
        "evaluation_status": "Draft",
        "initiated_by": "demo_user",
        "initiated_on": datetime.now(timezone.utc),
        "sop_version": "v1.0",
        "opportunity_name": "TechVision Enterprise Software Deal",
        "opportunity_type": "New",
        "expected_deal_value": 8000000.0,
        "proposed_payment_terms": "Net 30",
        "expected_close_date": (date.today() + timedelta(days=45)).isoformat(),
        "currency": "INR",
        "exchange_rate": 1.0,
        "expected_revenue_recognition_term": "Monthly",
        "delivery_capacity_check": "Pass",
        "operational_dependency": "Cloud Infrastructure Ready",
        "timeline_feasibility": 45,
        "assigned_project_manager": "PM-001",
        "ops_comments": "Team capacity available",
        "estimated_cost": 4800000.0,
        "estimated_revenue": 8000000.0,
        "gross_margin_percent": 40.0,
        "margin_threshold_check": "Pass",
        "discount_applied_percent": 5.0,
        "approval_required": True,
        "regulatory_flags": None,
        "geo_risk_score": 15.0,
        "sanction_list_check": False,
        "tax_compliance_flag": "Pass",
        "risk_classification": "Low",
        "mitigation_plan": "Standard SLA in place",
        "credit_score_validated": 78.0,
        "proposed_credit_limit": 10000000.0,
        "outstanding_exposure": 0.0,
        "projected_dso": 30,
        "cashflow_impact_index": 85.0,
        "payment_risk_flag": "Low",
        "deal_score": 75.0,
        "deal_grade": "B",
        "approved_by": None,
        "approval_comments": None,
        "approval_date": None,
        "rejection_reason": None,
        "proposal_id": None,
        "evaluation_outcome": "Pending",
        "next_module_trigger": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "evaluation_id": "EVAL-2025-002",
        "linked_lead_id": "LEAD-2025-002",
        "customer_id": "cust_002",
        "evaluation_status": "In Review",
        "initiated_by": "demo_user",
        "initiated_on": datetime.now(timezone.utc),
        "sop_version": "v1.0",
        "opportunity_name": "GMC Supply Chain Platform",
        "opportunity_type": "New",
        "expected_deal_value": 25000000.0,
        "proposed_payment_terms": "Net 45",
        "expected_close_date": (date.today() + timedelta(days=60)).isoformat(),
        "currency": "INR",
        "exchange_rate": 1.0,
        "expected_revenue_recognition_term": "Quarterly",
        "delivery_capacity_check": "Pass",
        "operational_dependency": "Integration team allocated",
        "timeline_feasibility": 60,
        "assigned_project_manager": "PM-002",
        "ops_comments": "Enterprise project - requires dedicated team",
        "estimated_cost": 15000000.0,
        "estimated_revenue": 25000000.0,
        "gross_margin_percent": 40.0,
        "margin_threshold_check": "Pass",
        "discount_applied_percent": 3.0,
        "approval_required": True,
        "regulatory_flags": None,
        "geo_risk_score": 10.0,
        "sanction_list_check": False,
        "tax_compliance_flag": "Pass",
        "risk_classification": "Low",
        "mitigation_plan": "Enterprise SLA with penalties",
        "credit_score_validated": 88.0,
        "proposed_credit_limit": 30000000.0,
        "outstanding_exposure": 0.0,
        "projected_dso": 45,
        "cashflow_impact_index": 90.0,
        "payment_risk_flag": "Low",
        "deal_score": 88.0,
        "deal_grade": "A",
        "approved_by": None,
        "approval_comments": None,
        "approval_date": None,
        "rejection_reason": None,
        "proposal_id": "PROP-2025-002",
        "evaluation_outcome": "Pending",
        "next_module_trigger": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "evaluation_id": "EVAL-2025-003",
        "linked_lead_id": "LEAD-2025-003",
        "customer_id": "cust_003",
        "evaluation_status": "Approved",
        "initiated_by": "demo_user",
        "initiated_on": datetime.now(timezone.utc),
        "sop_version": "v1.0",
        "opportunity_name": "HC Plus Hospital Management System",
        "opportunity_type": "New",
        "expected_deal_value": 4500000.0,
        "proposed_payment_terms": "Net 30",
        "expected_close_date": (date.today() + timedelta(days=90)).isoformat(),
        "currency": "INR",
        "exchange_rate": 1.0,
        "expected_revenue_recognition_term": "Monthly",
        "delivery_capacity_check": "Pass",
        "operational_dependency": "Healthcare domain team",
        "timeline_feasibility": 90,
        "assigned_project_manager": "PM-003",
        "ops_comments": "Specialized healthcare solution",
        "estimated_cost": 3000000.0,
        "estimated_revenue": 4500000.0,
        "gross_margin_percent": 33.33,
        "margin_threshold_check": "Pass",
        "discount_applied_percent": 10.0,
        "approval_required": True,
        "regulatory_flags": "HIPAA compliance required",
        "geo_risk_score": 20.0,
        "sanction_list_check": False,
        "tax_compliance_flag": "Pass",
        "risk_classification": "Medium",
        "mitigation_plan": "Compliance audit scheduled",
        "credit_score_validated": 65.0,
        "proposed_credit_limit": 5000000.0,
        "outstanding_exposure": 0.0,
        "projected_dso": 45,
        "cashflow_impact_index": 72.0,
        "payment_risk_flag": "Medium",
        "deal_score": 62.0,
        "deal_grade": "C",
        "approved_by": "demo_user",
        "approval_comments": "Approved with compliance conditions",
        "approval_date": datetime.now(timezone.utc),
        "rejection_reason": None,
        "proposal_id": "PROP-2025-003",
        "evaluation_outcome": "Approved",
        "next_module_trigger": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "evaluation_id": "EVAL-2025-004",
        "linked_lead_id": "LEAD-2025-004",
        "customer_id": "cust_004",
        "evaluation_status": "Approved",
        "initiated_by": "demo_user",
        "initiated_on": datetime.now(timezone.utc),
        "sop_version": "v1.0",
        "opportunity_name": "Retail King Omnichannel Platform",
        "opportunity_type": "New",
        "expected_deal_value": 12000000.0,
        "proposed_payment_terms": "Net 30",
        "expected_close_date": (date.today() + timedelta(days=30)).isoformat(),
        "currency": "INR",
        "exchange_rate": 1.0,
        "expected_revenue_recognition_term": "Monthly",
        "delivery_capacity_check": "Pass",
        "operational_dependency": "Retail integration team ready",
        "timeline_feasibility": 30,
        "assigned_project_manager": "PM-004",
        "ops_comments": "Fast-track project",
        "estimated_cost": 7200000.0,
        "estimated_revenue": 12000000.0,
        "gross_margin_percent": 40.0,
        "margin_threshold_check": "Pass",
        "discount_applied_percent": 5.0,
        "approval_required": True,
        "regulatory_flags": None,
        "geo_risk_score": 12.0,
        "sanction_list_check": False,
        "tax_compliance_flag": "Pass",
        "risk_classification": "Low",
        "mitigation_plan": "Standard retail SLA",
        "credit_score_validated": 82.0,
        "proposed_credit_limit": 15000000.0,
        "outstanding_exposure": 0.0,
        "projected_dso": 30,
        "cashflow_impact_index": 85.0,
        "payment_risk_flag": "Low",
        "deal_score": 80.0,
        "deal_grade": "B",
        "approved_by": "demo_user",
        "approval_comments": "Excellent opportunity - approved for fast-track",
        "approval_date": datetime.now(timezone.utc),
        "rejection_reason": None,
        "proposal_id": "PROP-2025-004",
        "evaluation_outcome": "Approved",
        "next_module_trigger": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "evaluation_id": "EVAL-2025-005",
        "linked_lead_id": "LEAD-2025-005",
        "customer_id": "cust_005",
        "evaluation_status": "Rejected",
        "initiated_by": "demo_user",
        "initiated_on": datetime.now(timezone.utc),
        "sop_version": "v1.0",
        "opportunity_name": "FinConsult Analytics Platform",
        "opportunity_type": "Renewal",
        "expected_deal_value": 2000000.0,
        "proposed_payment_terms": "Net 30",
        "expected_close_date": (date.today() + timedelta(days=15)).isoformat(),
        "currency": "INR",
        "exchange_rate": 1.0,
        "expected_revenue_recognition_term": "Quarterly",
        "delivery_capacity_check": "Fail",
        "operational_dependency": "Team unavailable",
        "timeline_feasibility": 15,
        "assigned_project_manager": None,
        "ops_comments": "Resource constraint - team committed to other projects",
        "estimated_cost": 1800000.0,
        "estimated_revenue": 2000000.0,
        "gross_margin_percent": 10.0,
        "margin_threshold_check": "Fail",
        "discount_applied_percent": 15.0,
        "approval_required": True,
        "regulatory_flags": None,
        "geo_risk_score": 25.0,
        "sanction_list_check": False,
        "tax_compliance_flag": "Pass",
        "risk_classification": "High",
        "mitigation_plan": None,
        "credit_score_validated": 90.0,
        "proposed_credit_limit": 8000000.0,
        "outstanding_exposure": 0.0,
        "projected_dso": 30,
        "cashflow_impact_index": 50.0,
        "payment_risk_flag": "Low",
        "deal_score": 35.0,
        "deal_grade": "D",
        "approved_by": "demo_user",
        "approval_comments": None,
        "approval_date": datetime.now(timezone.utc),
        "rejection_reason": "Below margin threshold and operational capacity unavailable",
        "proposal_id": None,
        "evaluation_outcome": "Rejected",
        "next_module_trigger": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
]

async def seed_evaluations():
    try:
        # Clear existing evaluations
        result = await db.commerce_evaluate.delete_many({})
        print(f"Cleared {result.deleted_count} existing evaluations")
        
        # Insert sample evaluations
        result = await db.commerce_evaluate.insert_many(sample_evaluations)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} sample evaluations")
        
        # Verify
        count = await db.commerce_evaluate.count_documents({})
        print(f"Total evaluations in database: {count}")
        
        # Show summary
        print("\nSeeded Evaluations Summary:")
        for evaluation in sample_evaluations:
            print(f"  - {evaluation['evaluation_id']}: {evaluation['opportunity_name']} ({evaluation['evaluation_status']}) - Grade {evaluation['deal_grade']}")
        
    except Exception as e:
        print(f"❌ Error seeding evaluations: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_evaluations())
