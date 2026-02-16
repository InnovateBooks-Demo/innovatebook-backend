"""
Seed script for IB Commerce Reconcile Module
Creates sample reconciliation records for bank/vendor/customer reconciliation
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'innovate_books_db')

async def seed_reconcile_data():
    """Seed reconciliation records for IB Commerce"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing reconciliation data
    await db.commerce_reconcile.delete_many({})
    print("✅ Cleared existing reconciliation data")
    
    # Sample reconciliation records
    reconcile_records = [
        {
            "id": "rec-001",
            "reconcile_id": "REC-2025-001",
            "reconcile_type": "Bank",
            "period_start": (date.today().replace(day=1)).isoformat(),
            "period_end": date.today().isoformat(),
            "data_source": {
                "bank": "HDFC Bank - Current Account",
                "bank_statement": "bank_stmt_jan2025.pdf",
                "gl_account": "1001 - Cash at Bank"
            },
            "sop_version": "v1.0",
            "reconcile_status": "Matched",
            "internal_ref_no": "GL-JAN-2025",
            "external_ref_no": "HDFC-STMT-012025",
            "match_status": "Matched",
            "match_confidence": 98.5,
            "matched_on": datetime.now(timezone.utc).isoformat(),
            "mismatch_type": None,
            "adjustment_ref_id": None,
            "amount_internal": 5000000.0,
            "amount_external": 5000000.0,
            "difference": 0.0,
            "currency": "INR",
            "value_date": date.today().isoformat(),
            "gl_impact": "Debit",
            "exception_id": None,
            "exception_type": None,
            "exception_description": None,
            "resolution_action": None,
            "resolved_by": None,
            "resolved_on": None,
            "govern_log_id": "GOV-2025-001",
            "reconciled_entries": 45,
            "unmatched_entries": 0,
            "reconciled_value": 5000000.0,
            "exception_value": 0.0,
            "final_status": "Closed",
            "closure_date": date.today().isoformat(),
            "reconciliation_score": 100.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec-002",
            "reconcile_id": "REC-2025-002",
            "reconcile_type": "Vendor",
            "period_start": (date.today().replace(day=1) - timedelta(days=30)).isoformat(),
            "period_end": (date.today().replace(day=1) - timedelta(days=1)).isoformat(),
            "data_source": {
                "vendor": "TechSupply Inc",
                "vendor_statement": "vendor_stmt_dec2024.pdf",
                "ap_ledger": "2001 - Accounts Payable"
            },
            "sop_version": "v1.0",
            "reconcile_status": "Partially Matched",
            "internal_ref_no": "AP-DEC-2024",
            "external_ref_no": "TECH-STMT-122024",
            "match_status": "Mismatch",
            "match_confidence": 85.0,
            "matched_on": None,
            "mismatch_type": "Amount",
            "adjustment_ref_id": "ADJ-2025-001",
            "amount_internal": 1500000.0,
            "amount_external": 1485000.0,
            "difference": 15000.0,
            "currency": "INR",
            "value_date": (date.today() - timedelta(days=15)).isoformat(),
            "gl_impact": "Credit",
            "exception_id": "EXC-2025-001",
            "exception_type": "Amount Mismatch",
            "exception_description": "Difference of ₹15,000 in vendor statement - pending credit note",
            "resolution_action": "Adjust",
            "resolved_by": None,
            "resolved_on": None,
            "govern_log_id": "GOV-2025-002",
            "reconciled_entries": 28,
            "unmatched_entries": 2,
            "reconciled_value": 1485000.0,
            "exception_value": 15000.0,
            "final_status": "Review",
            "closure_date": None,
            "reconciliation_score": 93.3,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec-003",
            "reconcile_id": "REC-2025-003",
            "reconcile_type": "Customer",
            "period_start": (date.today().replace(day=1)).isoformat(),
            "period_end": date.today().isoformat(),
            "data_source": {
                "customer": "Acme Corp",
                "customer_statement": "cust_stmt_jan2025.pdf",
                "ar_ledger": "1200 - Accounts Receivable"
            },
            "sop_version": "v1.0",
            "reconcile_status": "Open",
            "internal_ref_no": "AR-JAN-2025",
            "external_ref_no": "ACME-STMT-012025",
            "match_status": "Pending",
            "match_confidence": 0.0,
            "matched_on": None,
            "mismatch_type": None,
            "adjustment_ref_id": None,
            "amount_internal": 2500000.0,
            "amount_external": 0.0,
            "difference": 0.0,
            "currency": "INR",
            "value_date": None,
            "gl_impact": "Debit",
            "exception_id": None,
            "exception_type": None,
            "exception_description": None,
            "resolution_action": None,
            "resolved_by": None,
            "resolved_on": None,
            "govern_log_id": None,
            "reconciled_entries": 0,
            "unmatched_entries": 15,
            "reconciled_value": 0.0,
            "exception_value": 0.0,
            "final_status": "Open",
            "closure_date": None,
            "reconciliation_score": 0.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec-004",
            "reconcile_id": "REC-2025-004",
            "reconcile_type": "Tax",
            "period_start": (date.today().replace(day=1) - timedelta(days=90)).isoformat(),
            "period_end": (date.today().replace(day=1) - timedelta(days=1)).isoformat(),
            "data_source": {
                "tax_authority": "GST Portal",
                "gstr_returns": "GSTR-3B Q1 FY2025",
                "tax_ledger": "2301 - GST Payable"
            },
            "sop_version": "v1.0",
            "reconcile_status": "Matched",
            "internal_ref_no": "GST-Q1-2025",
            "external_ref_no": "GSTIN-29XXXXX",
            "match_status": "Matched",
            "match_confidence": 100.0,
            "matched_on": (datetime.now(timezone.utc) - timedelta(days=5)).isoformat(),
            "mismatch_type": None,
            "adjustment_ref_id": None,
            "amount_internal": 900000.0,
            "amount_external": 900000.0,
            "difference": 0.0,
            "currency": "INR",
            "value_date": (date.today() - timedelta(days=5)).isoformat(),
            "gl_impact": "Credit",
            "exception_id": None,
            "exception_type": None,
            "exception_description": None,
            "resolution_action": None,
            "resolved_by": None,
            "resolved_on": None,
            "govern_log_id": "GOV-2025-003",
            "reconciled_entries": 12,
            "unmatched_entries": 0,
            "reconciled_value": 900000.0,
            "exception_value": 0.0,
            "final_status": "Closed",
            "closure_date": (date.today() - timedelta(days=5)).isoformat(),
            "reconciliation_score": 100.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "rec-005",
            "reconcile_id": "REC-2025-005",
            "reconcile_type": "Internal",
            "period_start": (date.today().replace(day=1)).isoformat(),
            "period_end": date.today().isoformat(),
            "data_source": {
                "source_ledger": "Cash at Bank",
                "target_ledger": "Cash Book",
                "reconciliation_type": "Inter-ledger"
            },
            "sop_version": "v1.0",
            "reconcile_status": "Open",
            "internal_ref_no": "INTER-JAN-2025",
            "external_ref_no": None,
            "match_status": "Pending",
            "match_confidence": 0.0,
            "matched_on": None,
            "mismatch_type": None,
            "adjustment_ref_id": None,
            "amount_internal": 500000.0,
            "amount_external": 500000.0,
            "difference": 0.0,
            "currency": "INR",
            "value_date": None,
            "gl_impact": "Debit",
            "exception_id": None,
            "exception_type": None,
            "exception_description": None,
            "resolution_action": None,
            "resolved_by": None,
            "resolved_on": None,
            "govern_log_id": None,
            "reconciled_entries": 8,
            "unmatched_entries": 3,
            "reconciled_value": 450000.0,
            "exception_value": 50000.0,
            "final_status": "Pending",
            "closure_date": None,
            "reconciliation_score": 90.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert reconciliation records
    result = await db.commerce_reconcile.insert_many(reconcile_records)
    print(f"✅ Inserted {len(result.inserted_ids)} reconciliation records")
    
    # Display summary
    print("\n" + "="*60)
    print("RECONCILE MODULE SEED DATA SUMMARY")
    print("="*60)
    for rec in reconcile_records:
        print(f"\n{rec['reconcile_id']}")
        print(f"  Type: {rec['reconcile_type']}")
        print(f"  Status: {rec['reconcile_status']}")
        print(f"  Match Status: {rec['match_status']}")
        print(f"  Internal Amount: ₹{rec['amount_internal']:,.2f}")
        print(f"  External Amount: ₹{rec['amount_external']:,.2f}")
        print(f"  Difference: ₹{rec['difference']:,.2f}")
        print(f"  Reconciliation Score: {rec['reconciliation_score']}%")
        print(f"  Matched Entries: {rec['reconciled_entries']}")
        print(f"  Unmatched Entries: {rec['unmatched_entries']}")
    
    print("\n" + "="*60)
    print("✅ Reconcile module seeding completed successfully!")
    print("="*60)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_reconcile_data())
