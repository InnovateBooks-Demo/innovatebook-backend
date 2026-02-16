"""
IB Finance - Seed Data Routes
Provides demo data seeding for testing and development
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Seed"])


@router.post("/seed")
async def seed_finance_data(current_user: dict = Depends(get_current_user)):
    """Seed demo data for IB Finance module"""
    db = get_db()
    org_id = current_user.get("org_id")
    user_id = current_user.get("user_id")
    now = datetime.now(timezone.utc).isoformat()
    
    # Clear existing data for this org
    await db.fin_billing_records.delete_many({"org_id": org_id})
    await db.fin_receivables.delete_many({"org_id": org_id})
    await db.fin_payables.delete_many({"org_id": org_id})
    await db.fin_accounts.delete_many({"org_id": org_id})
    await db.fin_journals.delete_many({"org_id": org_id})
    await db.fin_assets.delete_many({"org_id": org_id})
    await db.fin_tax_transactions.delete_many({"org_id": org_id})
    await db.fin_periods.delete_many({"org_id": org_id})
    
    # Seed Chart of Accounts
    accounts = [
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1000", "account_name": "Cash & Bank", "account_type": "asset", "balance": 5000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1100", "account_name": "Accounts Receivable", "account_type": "asset", "balance": 2500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1500", "account_name": "Fixed Assets", "account_type": "asset", "balance": 10000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "2000", "account_name": "Accounts Payable", "account_type": "liability", "balance": 1500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "2100", "account_name": "Accrued Expenses", "account_type": "liability", "balance": 500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "3000", "account_name": "Share Capital", "account_type": "equity", "balance": 10000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "4000", "account_name": "Revenue - Services", "account_type": "revenue", "balance": 8000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "5000", "account_name": "Cost of Services", "account_type": "expense", "balance": 3000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "6000", "account_name": "Operating Expenses", "account_type": "expense", "balance": 2000000, "is_active": True, "org_id": org_id, "created_at": now},
    ]
    await db.fin_accounts.insert_many(accounts)
    
    # Seed Billing Records
    billings = [
        {"billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}", "billing_type": "milestone", "party_id": "CUST001", "party_name": "Acme Corp", "billing_period": "2024-Q4", "currency": "INR", "gross_amount": 500000, "tax_amount": 90000, "net_amount": 590000, "status": "issued", "invoice_number": "INV-202412-0001", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}", "billing_type": "subscription", "party_id": "CUST002", "party_name": "TechStart Inc", "billing_period": "2024-12", "currency": "INR", "gross_amount": 100000, "tax_amount": 18000, "net_amount": 118000, "status": "approved", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}", "billing_type": "usage", "party_id": "CUST003", "party_name": "GlobalServe Ltd", "billing_period": "2024-12", "currency": "INR", "gross_amount": 250000, "tax_amount": 45000, "net_amount": 295000, "status": "draft", "org_id": org_id, "created_at": now, "created_by": user_id},
    ]
    await db.fin_billing_records.insert_many(billings)
    
    # Seed Receivables
    receivables = [
        {"receivable_id": f"RCV-{uuid.uuid4().hex[:8].upper()}", "invoice_id": billings[0]["billing_id"], "invoice_number": "INV-202412-0001", "customer_id": "CUST001", "customer_name": "Acme Corp", "invoice_date": "2024-12-01", "due_date": "2024-12-31", "invoice_amount": 590000, "outstanding_amount": 590000, "currency": "INR", "status": "open", "aging_bucket": "0-30", "org_id": org_id, "created_at": now},
        {"receivable_id": f"RCV-{uuid.uuid4().hex[:8].upper()}", "invoice_id": "OLD001", "invoice_number": "INV-202410-0005", "customer_id": "CUST004", "customer_name": "RetailMax", "invoice_date": "2024-10-15", "due_date": "2024-11-15", "invoice_amount": 350000, "outstanding_amount": 350000, "currency": "INR", "status": "overdue", "aging_bucket": "31-60", "org_id": org_id, "created_at": now},
    ]
    await db.fin_receivables.insert_many(receivables)
    
    # Seed Payables
    payables = [
        {"payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}", "vendor_id": "VND001", "vendor_name": "CloudHost Services", "invoice_number": "CH-2024-1234", "invoice_date": "2024-12-05", "due_date": "2025-01-05", "gross_amount": 150000, "tax_amount": 27000, "net_amount": 177000, "outstanding_amount": 177000, "currency": "INR", "status": "pending", "three_way_match": "matched", "aging_bucket": "0-30", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}", "vendor_id": "VND002", "vendor_name": "Office Supplies Co", "invoice_number": "OSC-5678", "invoice_date": "2024-11-20", "due_date": "2024-12-20", "gross_amount": 25000, "tax_amount": 4500, "net_amount": 29500, "outstanding_amount": 29500, "currency": "INR", "status": "approved", "three_way_match": "matched", "aging_bucket": "0-30", "org_id": org_id, "created_at": now, "created_by": user_id},
    ]
    await db.fin_payables.insert_many(payables)
    
    # Seed Assets
    assets = [
        {"asset_id": f"AST-{uuid.uuid4().hex[:8].upper()}", "asset_name": "Office Building - HQ", "asset_class": "building", "asset_tag": "BLD-001", "purchase_date": "2020-01-15", "purchase_cost": 50000000, "salvage_value": 5000000, "useful_life_months": 360, "depreciation_method": "straight_line", "accumulated_depreciation": 7500000, "current_value": 42500000, "location": "Mumbai HQ", "status": "active", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"asset_id": f"AST-{uuid.uuid4().hex[:8].upper()}", "asset_name": "Server Infrastructure", "asset_class": "computer", "asset_tag": "SRV-001", "purchase_date": "2023-06-01", "purchase_cost": 2000000, "salvage_value": 200000, "useful_life_months": 60, "depreciation_method": "straight_line", "accumulated_depreciation": 540000, "current_value": 1460000, "location": "Data Center", "status": "active", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"asset_id": f"AST-{uuid.uuid4().hex[:8].upper()}", "asset_name": "Company Vehicles - Fleet", "asset_class": "vehicle", "asset_tag": "VEH-FLEET", "purchase_date": "2022-03-01", "purchase_cost": 3500000, "salvage_value": 500000, "useful_life_months": 96, "depreciation_method": "declining_balance", "accumulated_depreciation": 1200000, "current_value": 2300000, "location": "Various", "status": "active", "org_id": org_id, "created_at": now, "created_by": user_id},
    ]
    await db.fin_assets.insert_many(assets)
    
    # Seed Tax Transactions
    tax_txns = [
        {"tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}", "source_type": "billing", "source_id": billings[0]["billing_id"], "transaction_date": now, "tax_type": "GST", "tax_code": "GST18", "taxable_amount": 500000, "tax_rate": 18, "tax_amount": 90000, "direction": "output", "status": "pending", "party_id": "CUST001", "party_name": "Acme Corp", "org_id": org_id, "created_at": now},
        {"tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}", "source_type": "payable", "source_id": payables[0]["payable_id"], "transaction_date": now, "tax_type": "GST", "tax_code": "GST18", "taxable_amount": 150000, "tax_rate": 18, "tax_amount": 27000, "direction": "input", "status": "claimed", "party_id": "VND001", "party_name": "CloudHost Services", "org_id": org_id, "created_at": now},
    ]
    await db.fin_tax_transactions.insert_many(tax_txns)
    
    # Seed Accounting Period
    period = {
        "period_id": f"PER-{uuid.uuid4().hex[:8].upper()}",
        "period_name": "December 2024",
        "period_type": "monthly",
        "period_start": "2024-12-01",
        "period_end": "2024-12-31",
        "fiscal_year": "FY2024-25",
        "status": "open",
        "org_id": org_id,
        "created_at": now
    }
    await db.fin_periods.insert_one(period)
    
    return {
        "success": True,
        "message": "IB Finance data seeded successfully",
        "summary": {
            "accounts": len(accounts),
            "billing_records": len(billings),
            "receivables": len(receivables),
            "payables": len(payables),
            "assets": len(assets),
            "tax_transactions": len(tax_txns),
            "periods": 1
        }
    }


# Internal seed function for auto-seed on startup (no auth required)
async def seed_finance_data_internal():
    """Seed demo data for IB Finance module - internal use without auth"""
    db = get_db()
    org_id = "ORG001"  # Default org
    user_id = "SYSTEM"
    now = datetime.now(timezone.utc).isoformat()
    
    # Seed Chart of Accounts
    accounts = [
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1000", "account_name": "Cash & Bank", "account_type": "asset", "balance": 5000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1100", "account_name": "Accounts Receivable", "account_type": "asset", "balance": 2500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "1500", "account_name": "Fixed Assets", "account_type": "asset", "balance": 10000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "2000", "account_name": "Accounts Payable", "account_type": "liability", "balance": 1500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "2100", "account_name": "Accrued Expenses", "account_type": "liability", "balance": 500000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "3000", "account_name": "Share Capital", "account_type": "equity", "balance": 10000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "4000", "account_name": "Revenue - Services", "account_type": "revenue", "balance": 8000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "5000", "account_name": "Cost of Services", "account_type": "expense", "balance": 3000000, "is_active": True, "org_id": org_id, "created_at": now},
        {"account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}", "account_code": "6000", "account_name": "Operating Expenses", "account_type": "expense", "balance": 2000000, "is_active": True, "org_id": org_id, "created_at": now},
    ]
    await db.fin_accounts.insert_many(accounts)
    
    # Seed Billing Records
    billings = [
        {"billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}", "billing_type": "milestone", "party_id": "CUST001", "party_name": "Acme Corp", "billing_period": "2024-Q4", "currency": "INR", "gross_amount": 500000, "tax_amount": 90000, "net_amount": 590000, "status": "issued", "invoice_number": "INV-202412-0001", "org_id": org_id, "created_at": now, "created_by": user_id},
        {"billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}", "billing_type": "subscription", "party_id": "CUST002", "party_name": "TechStart Inc", "billing_period": "2024-12", "currency": "INR", "gross_amount": 100000, "tax_amount": 18000, "net_amount": 118000, "status": "approved", "org_id": org_id, "created_at": now, "created_by": user_id},
    ]
    await db.fin_billing_records.insert_many(billings)
    
    # Seed Receivables
    receivables = [
        {"receivable_id": f"RCV-{uuid.uuid4().hex[:8].upper()}", "invoice_id": billings[0]["billing_id"], "invoice_number": "INV-202412-0001", "customer_id": "CUST001", "customer_name": "Acme Corp", "invoice_date": "2024-12-01", "due_date": "2024-12-31", "invoice_amount": 590000, "outstanding_amount": 590000, "currency": "INR", "status": "open", "aging_bucket": "0-30", "org_id": org_id, "created_at": now},
    ]
    await db.fin_receivables.insert_many(receivables)
    
    # Seed Payables
    payables = [
        {"payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}", "vendor_id": "VND001", "vendor_name": "CloudHost Services", "invoice_number": "CH-2024-1234", "invoice_date": "2024-12-05", "due_date": "2025-01-05", "gross_amount": 150000, "tax_amount": 27000, "net_amount": 177000, "outstanding_amount": 177000, "currency": "INR", "status": "pending", "three_way_match": "matched", "aging_bucket": "0-30", "org_id": org_id, "created_at": now, "created_by": user_id},
    ]
    await db.fin_payables.insert_many(payables)
    
    return {"success": True, "accounts": len(accounts), "billings": len(billings)}
