"""
Seed script for IB Commerce Govern Module
Creates sample governance/SOP records for process management
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'innovate_books_db')

async def seed_govern_data():
    """Seed governance/SOP records for IB Commerce"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing governance data
    await db.commerce_govern.delete_many({})
    print("✅ Cleared existing governance data")
    
    # Sample governance/SOP records
    govern_records = [
        {
            "id": "gov-001",
            "govern_id": "GOV-2025-001",
            "sop_name": "Bank Reconciliation Process",
            "sop_type": "Process",
            "sop_version": "v2.1",
            "sop_status": "Active",
            "sop_owner": "Finance Manager",
            "department": "Finance",
            "effective_date": (date.today() - timedelta(days=180)).isoformat(),
            "review_date": (date.today() - timedelta(days=150)).isoformat(),
            "next_review_date": (date.today() + timedelta(days=30)).isoformat(),
            "version_history": [
                {"version": "v1.0", "date": "2024-01-01", "author": "Finance Team"},
                {"version": "v2.0", "date": "2024-06-01", "author": "Finance Manager"},
                {"version": "v2.1", "date": "2024-07-15", "author": "CFO"}
            ],
            "change_log": [
                {"date": "2024-07-15", "change": "Added automated matching rules", "author": "CFO"},
                {"date": "2024-06-01", "change": "Updated exception handling process", "author": "Finance Manager"}
            ],
            "parent_version_id": "GOV-2024-001",
            "control_objectives": [
                "Ensure accuracy of bank balances",
                "Identify discrepancies within 24 hours",
                "Maintain audit trail"
            ],
            "risk_addressed": [
                "Cash misappropriation",
                "Recording errors",
                "Bank fraud"
            ],
            "compliance_framework": ["SOX", "ISO 27001", "Internal Audit"],
            "sla_defined": "Complete reconciliation within 2 business days",
            "sla_compliance_percent": 98.5,
            "breach_count": 2,
            "last_breach_date": (date.today() - timedelta(days=45)).isoformat(),
            "last_audit_date": (date.today() - timedelta(days=30)).isoformat(),
            "audit_findings": [
                "Minor delay in exception resolution - Closed",
                "Documentation complete - Satisfactory"
            ],
            "attestation_required": True,
            "attested_by": "CFO",
            "attestation_date": (date.today() - timedelta(days=25)).isoformat(),
            "improvement_suggestions": [
                "Implement real-time reconciliation for high-value transactions",
                "Add ML-based anomaly detection"
            ],
            "pending_updates": [],
            "total_runs": 45,
            "successful_runs": 43,
            "failed_runs": 2,
            "avg_execution_time": 2.5,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gov-002",
            "govern_id": "GOV-2025-002",
            "sop_name": "Vendor Payment Authorization",
            "sop_type": "Control",
            "sop_version": "v1.5",
            "sop_status": "Active",
            "sop_owner": "AP Manager",
            "department": "Accounts Payable",
            "effective_date": (date.today() - timedelta(days=90)).isoformat(),
            "review_date": (date.today() - timedelta(days=60)).isoformat(),
            "next_review_date": (date.today() + timedelta(days=60)).isoformat(),
            "version_history": [
                {"version": "v1.0", "date": "2024-03-01", "author": "AP Team"},
                {"version": "v1.5", "date": "2024-08-15", "author": "AP Manager"}
            ],
            "change_log": [
                {"date": "2024-08-15", "change": "Increased approval threshold to ₹50L", "author": "AP Manager"}
            ],
            "parent_version_id": None,
            "control_objectives": [
                "Prevent unauthorized payments",
                "Ensure dual approval for high-value transactions",
                "Maintain segregation of duties"
            ],
            "risk_addressed": [
                "Payment fraud",
                "Duplicate payments",
                "Vendor collusion"
            ],
            "compliance_framework": ["SOX", "FCPA"],
            "sla_defined": "Process payment within 5 business days",
            "sla_compliance_percent": 95.0,
            "breach_count": 5,
            "last_breach_date": (date.today() - timedelta(days=15)).isoformat(),
            "last_audit_date": (date.today() - timedelta(days=60)).isoformat(),
            "audit_findings": [
                "Approval workflow working as designed",
                "Recommend additional vendor validation"
            ],
            "attestation_required": True,
            "attested_by": "Finance Director",
            "attestation_date": (date.today() - timedelta(days=55)).isoformat(),
            "improvement_suggestions": [
                "Add vendor master data validation",
                "Implement payment pattern analysis"
            ],
            "pending_updates": ["Update approval matrix"],
            "total_runs": 120,
            "successful_runs": 115,
            "failed_runs": 5,
            "avg_execution_time": 1.8,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gov-003",
            "govern_id": "GOV-2025-003",
            "sop_name": "Data Privacy & GDPR Compliance",
            "sop_type": "Policy",
            "sop_version": "v1.0",
            "sop_status": "Under Review",
            "sop_owner": "Compliance Officer",
            "department": "Legal & Compliance",
            "effective_date": (date.today() + timedelta(days=30)).isoformat(),
            "review_date": None,
            "next_review_date": (date.today() + timedelta(days=180)).isoformat(),
            "version_history": [
                {"version": "v1.0-draft", "date": "2024-10-01", "author": "Legal Team"}
            ],
            "change_log": [
                {"date": "2024-10-01", "change": "Initial draft created", "author": "Legal Team"}
            ],
            "parent_version_id": None,
            "control_objectives": [
                "Ensure GDPR compliance",
                "Protect customer data",
                "Maintain data subject rights"
            ],
            "risk_addressed": [
                "Data breach",
                "Non-compliance penalties",
                "Reputation damage"
            ],
            "compliance_framework": ["GDPR", "ISO 27001", "SOC 2"],
            "sla_defined": "Respond to data subject requests within 30 days",
            "sla_compliance_percent": 100.0,
            "breach_count": 0,
            "last_breach_date": None,
            "last_audit_date": None,
            "audit_findings": [],
            "attestation_required": True,
            "attested_by": None,
            "attestation_date": None,
            "improvement_suggestions": [
                "Add automated data retention rules",
                "Implement consent management system"
            ],
            "pending_updates": [
                "Legal review pending",
                "Board approval required"
            ],
            "total_runs": 0,
            "successful_runs": 0,
            "failed_runs": 0,
            "avg_execution_time": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gov-004",
            "govern_id": "GOV-2025-004",
            "sop_name": "Invoice to Cash Process",
            "sop_type": "Process",
            "sop_version": "v3.0",
            "sop_status": "Active",
            "sop_owner": "AR Manager",
            "department": "Accounts Receivable",
            "effective_date": (date.today() - timedelta(days=120)).isoformat(),
            "review_date": (date.today() - timedelta(days=90)).isoformat(),
            "next_review_date": (date.today() + timedelta(days=90)).isoformat(),
            "version_history": [
                {"version": "v1.0", "date": "2023-06-01", "author": "AR Team"},
                {"version": "v2.0", "date": "2024-01-01", "author": "AR Manager"},
                {"version": "v3.0", "date": "2024-08-01", "author": "CFO"}
            ],
            "change_log": [
                {"date": "2024-08-01", "change": "Integrated automated dunning", "author": "CFO"},
                {"date": "2024-01-01", "change": "Added credit limit checks", "author": "AR Manager"}
            ],
            "parent_version_id": "GOV-2024-015",
            "control_objectives": [
                "Accelerate cash collection",
                "Reduce DSO to 45 days",
                "Minimize bad debt"
            ],
            "risk_addressed": [
                "Cash flow issues",
                "Bad debt write-offs",
                "Customer disputes"
            ],
            "compliance_framework": ["Internal Audit", "ISO 9001"],
            "sla_defined": "Issue invoice within 24 hours of delivery",
            "sla_compliance_percent": 92.0,
            "breach_count": 8,
            "last_breach_date": (date.today() - timedelta(days=5)).isoformat(),
            "last_audit_date": (date.today() - timedelta(days=90)).isoformat(),
            "audit_findings": [
                "Process efficiency improved by 20%",
                "DSO reduced from 60 to 48 days"
            ],
            "attestation_required": False,
            "attested_by": None,
            "attestation_date": None,
            "improvement_suggestions": [
                "Implement AI-based credit scoring",
                "Add customer portal for invoice queries"
            ],
            "pending_updates": ["Update credit policy"],
            "total_runs": 180,
            "successful_runs": 172,
            "failed_runs": 8,
            "avg_execution_time": 3.2,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "gov-005",
            "govern_id": "GOV-2025-005",
            "sop_name": "Expense Approval Workflow",
            "sop_type": "Control",
            "sop_version": "v1.0",
            "sop_status": "Draft",
            "sop_owner": "HR Manager",
            "department": "Human Resources",
            "effective_date": (date.today() + timedelta(days=15)).isoformat(),
            "review_date": None,
            "next_review_date": (date.today() + timedelta(days=105)).isoformat(),
            "version_history": [],
            "change_log": [],
            "parent_version_id": None,
            "control_objectives": [
                "Control employee expenses",
                "Ensure policy compliance",
                "Prevent expense fraud"
            ],
            "risk_addressed": [
                "Expense fraud",
                "Policy violations",
                "Budget overruns"
            ],
            "compliance_framework": ["Internal Policy", "Tax Compliance"],
            "sla_defined": "Approve/reject expenses within 3 business days",
            "sla_compliance_percent": 100.0,
            "breach_count": 0,
            "last_breach_date": None,
            "last_audit_date": None,
            "audit_findings": [],
            "attestation_required": False,
            "attested_by": None,
            "attestation_date": None,
            "improvement_suggestions": [
                "Add mobile expense submission",
                "Integrate with corporate card"
            ],
            "pending_updates": [
                "Approval limits to be finalized",
                "Category mapping pending"
            ],
            "total_runs": 0,
            "successful_runs": 0,
            "failed_runs": 0,
            "avg_execution_time": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert governance records
    result = await db.commerce_govern.insert_many(govern_records)
    print(f"✅ Inserted {len(result.inserted_ids)} governance records")
    
    # Display summary
    print("\n" + "="*60)
    print("GOVERN MODULE SEED DATA SUMMARY")
    print("="*60)
    for gov in govern_records:
        print(f"\n{gov['govern_id']}")
        print(f"  SOP Name: {gov['sop_name']}")
        print(f"  Type: {gov['sop_type']}")
        print(f"  Status: {gov['sop_status']}")
        print(f"  Version: {gov['sop_version']}")
        print(f"  Owner: {gov['sop_owner']}")
        print(f"  SLA Compliance: {gov['sla_compliance_percent']}%")
        print(f"  Total Runs: {gov['total_runs']} (Success: {gov['successful_runs']}, Failed: {gov['failed_runs']})")
    
    print("\n" + "="*60)
    print("✅ Govern module seeding completed successfully!")
    print("="*60)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_govern_data())
