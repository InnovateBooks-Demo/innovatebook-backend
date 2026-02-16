"""
Seed script for IB Commerce Tax Module
Creates sample tax records for GST/TDS compliance
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, date, timezone, timedelta
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'innovate_books_db')

async def seed_tax_data():
    """Seed tax records for IB Commerce"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # Clear existing tax data
    await db.commerce_tax.delete_many({})
    print("✅ Cleared existing tax data")
    
    # Sample tax records
    tax_records = [
        {
            "id": "tax-001",
            "tax_id": "TAX-2025-001",
            "tax_period": "2025-01",
            "tax_type": "GST",
            "tax_status": "Filed",
            "taxable_amount": 5000000.0,
            "tax_rate": 18.0,
            "tax_computed": 900000.0,
            "tax_collected": 900000.0,
            "tax_paid": 900000.0,
            "tax_liability": 0.0,
            "input_tax_credit": 150000.0,
            "net_tax_payable": 750000.0,
            "filing_due_date": (date.today() - timedelta(days=30)).isoformat(),
            "filing_date": (date.today() - timedelta(days=25)).isoformat(),
            "filing_reference": "ARN2025010112345",
            "return_type": "GSTR-3B",
            "late_filing_flag": False,
            "penalty_amount": 0.0,
            "interest_amount": 0.0,
            "compliance_score": 100.0,
            "prepared_by": "Finance Team",
            "reviewed_by": "Tax Manager",
            "approved_by": "CFO",
            "filed_by": "Tax Consultant",
            "transaction_ids": ["INV-2025-001", "INV-2025-002", "INV-2025-003"],
            "supporting_documents": ["gstr3b_jan2025.pdf", "itc_register.xlsx"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "tax-002",
            "tax_id": "TAX-2025-002",
            "tax_period": "2025-02",
            "tax_type": "GST",
            "tax_status": "Calculated",
            "taxable_amount": 4500000.0,
            "tax_rate": 18.0,
            "tax_computed": 810000.0,
            "tax_collected": 810000.0,
            "tax_paid": 0.0,
            "tax_liability": 810000.0,
            "input_tax_credit": 120000.0,
            "net_tax_payable": 690000.0,
            "filing_due_date": (date.today() + timedelta(days=15)).isoformat(),
            "filing_date": None,
            "filing_reference": None,
            "return_type": "GSTR-3B",
            "late_filing_flag": False,
            "penalty_amount": 0.0,
            "interest_amount": 0.0,
            "compliance_score": 100.0,
            "prepared_by": "Finance Team",
            "reviewed_by": None,
            "approved_by": None,
            "filed_by": None,
            "transaction_ids": ["INV-2025-010", "INV-2025-011", "INV-2025-012"],
            "supporting_documents": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "tax-003",
            "tax_id": "TAX-2025-003",
            "tax_period": "2025-Q1",
            "tax_type": "TDS",
            "tax_status": "Draft",
            "taxable_amount": 2000000.0,
            "tax_rate": 10.0,
            "tax_computed": 200000.0,
            "tax_collected": 200000.0,
            "tax_paid": 0.0,
            "tax_liability": 200000.0,
            "input_tax_credit": 0.0,
            "net_tax_payable": 200000.0,
            "filing_due_date": (date.today() + timedelta(days=30)).isoformat(),
            "filing_date": None,
            "filing_reference": None,
            "return_type": "TDS Return - 24Q",
            "late_filing_flag": False,
            "penalty_amount": 0.0,
            "interest_amount": 0.0,
            "compliance_score": 100.0,
            "prepared_by": "Finance Team",
            "reviewed_by": None,
            "approved_by": None,
            "filed_by": None,
            "transaction_ids": ["PAY-2025-001", "PAY-2025-002"],
            "supporting_documents": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "tax-004",
            "tax_id": "TAX-2025-004",
            "tax_period": "2024-12",
            "tax_type": "GST",
            "tax_status": "Paid",
            "taxable_amount": 6000000.0,
            "tax_rate": 18.0,
            "tax_computed": 1080000.0,
            "tax_collected": 1080000.0,
            "tax_paid": 1080000.0,
            "tax_liability": 0.0,
            "input_tax_credit": 180000.0,
            "net_tax_payable": 900000.0,
            "filing_due_date": (date.today() - timedelta(days=60)).isoformat(),
            "filing_date": (date.today() - timedelta(days=50)).isoformat(),
            "filing_reference": "ARN2024120112345",
            "return_type": "GSTR-3B",
            "late_filing_flag": True,
            "penalty_amount": 5000.0,
            "interest_amount": 2500.0,
            "compliance_score": 85.0,
            "prepared_by": "Finance Team",
            "reviewed_by": "Tax Manager",
            "approved_by": "CFO",
            "filed_by": "Tax Consultant",
            "transaction_ids": ["INV-2024-098", "INV-2024-099", "INV-2024-100"],
            "supporting_documents": ["gstr3b_dec2024.pdf", "payment_receipt.pdf"],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "tax-005",
            "tax_id": "TAX-2025-005",
            "tax_period": "2025-03",
            "tax_type": "GST",
            "tax_status": "Draft",
            "taxable_amount": 0.0,
            "tax_rate": 18.0,
            "tax_computed": 0.0,
            "tax_collected": 0.0,
            "tax_paid": 0.0,
            "tax_liability": 0.0,
            "input_tax_credit": 0.0,
            "net_tax_payable": 0.0,
            "filing_due_date": (date.today() + timedelta(days=45)).isoformat(),
            "filing_date": None,
            "filing_reference": None,
            "return_type": "GSTR-3B",
            "late_filing_flag": False,
            "penalty_amount": 0.0,
            "interest_amount": 0.0,
            "compliance_score": 100.0,
            "prepared_by": None,
            "reviewed_by": None,
            "approved_by": None,
            "filed_by": None,
            "transaction_ids": [],
            "supporting_documents": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    # Insert tax records
    result = await db.commerce_tax.insert_many(tax_records)
    print(f"✅ Inserted {len(result.inserted_ids)} tax records")
    
    # Display summary
    print("\n" + "="*60)
    print("TAX MODULE SEED DATA SUMMARY")
    print("="*60)
    for tax in tax_records:
        print(f"\n{tax['tax_id']}")
        print(f"  Period: {tax['tax_period']}")
        print(f"  Type: {tax['tax_type']}")
        print(f"  Status: {tax['tax_status']}")
        print(f"  Taxable Amount: ₹{tax['taxable_amount']:,.2f}")
        print(f"  Tax Computed: ₹{tax['tax_computed']:,.2f}")
        print(f"  Net Tax Payable: ₹{tax['net_tax_payable']:,.2f}")
        print(f"  Filing Due: {tax['filing_due_date']}")
        if tax.get('filing_reference'):
            print(f"  Filing Ref: {tax['filing_reference']}")
    
    print("\n" + "="*60)
    print("✅ Tax module seeding completed successfully!")
    print("="*60)
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_tax_data())
