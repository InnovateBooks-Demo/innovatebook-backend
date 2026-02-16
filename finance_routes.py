"""
Finance Module API Routes - ENTERPRISE EDITION
Handles all finance-related endpoints with multi-tenant support
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import os

# Import enterprise middleware
from enterprise_middleware import (
    subscription_guard,
    require_active_subscription,
    require_permission,
    get_org_scope
)

router = APIRouter(prefix="/api/finance", tags=["Finance"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ['DB_NAME']
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ========================
# CUSTOMERS
# ========================

@router.get("/customers", dependencies=[Depends(require_permission("customers", "view"))])
async def get_customers(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all customers (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        customers = await db.customers.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "customers": customers}
    except Exception as e:
        return {"success": False, "customers": [], "error": str(e)}

@router.get("/customers/{customer_id}", dependencies=[Depends(require_permission("customers", "view"))])
async def get_customer(customer_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get customer by ID (org-scoped)"""
    try:
        query = {"customer_id": customer_id}
        if org_id:
            query["org_id"] = org_id
        customer = await db.customers.find_one(query, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"success": True, "customer": customer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/customers", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "create"))])
async def create_customer(customer_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create new customer (org-scoped, requires active subscription)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        customer_data["id"] = f"CUST-{str(await db.customers.count_documents(query) + 1).zfill(4)}"
        customer_data["created_at"] = datetime.now(timezone.utc)
        if org_id:
            customer_data["org_id"] = org_id
        
        # Insert to DB
        result = await db.customers.insert_one(customer_data)
        
        # Return without MongoDB _id
        customer_data.pop("_id", None)
        return {"success": True, "customer": customer_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/customers/{customer_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "edit"))])
async def update_customer(customer_id: str, customer_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update customer (org-scoped, requires active subscription)"""
    try:
        query = {"id": customer_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.customers.update_one(query, {"$set": customer_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"success": True, "message": "Customer updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# VENDORS
# ========================

@router.get("/vendors", dependencies=[Depends(subscription_guard)])
async def get_vendors(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all vendors (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        vendors = await db.vendors.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "vendors": vendors}
    except Exception as e:
        return {"success": False, "vendors": [], "error": str(e)}

@router.get("/vendors/{vendor_id}", dependencies=[Depends(subscription_guard)])
async def get_vendor(vendor_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get vendor by ID (org-scoped)"""
    try:
        query = {"id": vendor_id}
        if org_id:
            query["org_id"] = org_id
        vendor = await db.vendors.find_one(query, {"_id": 0})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return {"success": True, "vendor": vendor}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vendors", dependencies=[Depends(require_active_subscription)])
async def create_vendor(vendor_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create new vendor (org-scoped, requires active subscription)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        vendor_data["id"] = f"VEND-{str(await db.vendors.count_documents(query) + 1).zfill(4)}"
        vendor_data["created_at"] = datetime.utcnow()
        if org_id:
            vendor_data["org_id"] = org_id
        await db.vendors.insert_one(vendor_data)
        return {"success": True, "vendor": vendor_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/vendors/{vendor_id}", dependencies=[Depends(require_active_subscription)])
async def update_vendor(vendor_id: str, vendor_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update vendor (org-scoped, requires active subscription)"""
    try:
        query = {"id": vendor_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.vendors.update_one(query, {"$set": vendor_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        return {"success": True, "message": "Vendor updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# INVOICES
# ========================

@router.get("/invoices", dependencies=[Depends(require_permission("invoices", "view"))])
async def get_invoices(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all invoices (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        invoices = await db.invoices.find(query, {"_id": 0}).sort("invoice_date", -1).to_list(1000)
        return {"success": True, "invoices": invoices}
    except Exception as e:
        return {"success": False, "invoices": [], "error": str(e)}

@router.get("/invoices/{invoice_id}", dependencies=[Depends(require_permission("invoices", "view"))])
async def get_invoice(invoice_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get invoice by ID (org-scoped)"""
    try:
        query = {"id": invoice_id}
        if org_id:
            query["org_id"] = org_id
        invoice = await db.invoices.find_one(query, {"_id": 0})
        if not invoice:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {"success": True, "invoice": invoice}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invoices", dependencies=[Depends(require_active_subscription), Depends(require_permission("invoices", "create"))])
async def create_invoice(invoice_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create new invoice (org-scoped, requires active subscription)"""
    try:
        from uuid import uuid4
        query = {"org_id": org_id} if org_id else {}
        invoice_data["id"] = str(uuid4())
        invoice_data["invoice_number"] = f"INV-{str(await db.invoices.count_documents(query) + 2001)}"
        if org_id:
            invoice_data["org_id"] = org_id
        invoice_data["created_at"] = datetime.utcnow()
        await db.invoices.insert_one(invoice_data)
        return {"success": True, "invoice": invoice_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/invoices/{invoice_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("invoices", "edit"))])
async def update_invoice(invoice_id: str, invoice_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update invoice (org-scoped, requires active subscription)"""
    try:
        query = {"id": invoice_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.invoices.update_one(query, {"$set": invoice_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Invoice not found")
        return {"success": True, "message": "Invoice updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# BILLS
# ========================

@router.get("/bills", dependencies=[Depends(subscription_guard)])
async def get_bills(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all bills (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        bills = await db.bills.find(query, {"_id": 0}).sort("bill_date", -1).to_list(1000)
        return {"success": True, "bills": bills}
    except Exception as e:
        return {"success": False, "bills": [], "error": str(e)}

@router.get("/bills/{bill_id}", dependencies=[Depends(subscription_guard)])
async def get_bill(bill_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get bill by ID (org-scoped)"""
    try:
        query = {"id": bill_id}
        if org_id:
            query["org_id"] = org_id
        bill = await db.bills.find_one(query, {"_id": 0})
        if not bill:
            raise HTTPException(status_code=404, detail="Bill not found")
        return {"success": True, "bill": bill}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bills", dependencies=[Depends(require_active_subscription)])
async def create_bill(bill_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create new bill (org-scoped, requires active subscription)"""
    try:
        from uuid import uuid4
        query = {"org_id": org_id} if org_id else {}
        bill_data["id"] = str(uuid4())
        bill_data["bill_number"] = f"BILL-{str(await db.bills.count_documents(query) + 2001)}"
        bill_data["created_at"] = datetime.utcnow()
        if org_id:
            bill_data["org_id"] = org_id
        await db.bills.insert_one(bill_data)
        return {"success": True, "bill": bill_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/bills/{bill_id}", dependencies=[Depends(require_active_subscription)])
async def update_bill(bill_id: str, bill_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update bill (org-scoped, requires active subscription)"""
    try:
        query = {"id": bill_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.bills.update_one(query, {"$set": bill_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Bill not found")
        return {"success": True, "message": "Bill updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# COLLECTIONS
# ========================

@router.get("/collections", dependencies=[Depends(require_permission("collections", "view"))])
async def get_collections(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all collections (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        collections = await db.collections.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "collections": collections}
    except Exception as e:
        return {"success": False, "collections": [], "error": str(e)}

# ========================
# PAYMENTS
# ========================

@router.get("/payments", dependencies=[Depends(subscription_guard)])
async def get_payments(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all payments (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "payments": payments}
    except Exception as e:
        return {"success": False, "payments": [], "error": str(e)}

# ========================
# BANKING
# ========================

@router.get("/banking/accounts", dependencies=[Depends(subscription_guard)])
async def get_banking_accounts(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all banking accounts (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        accounts = await db.bank_accounts.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "accounts": accounts}
    except Exception as e:
        return {"success": False, "accounts": [], "error": str(e)}

@router.get("/banking/transactions")
async def get_banking_transactions():
    """Get all banking transactions"""
    try:
        transactions = await db.banking_transactions.find({}, {"_id": 0}).sort("date", -1).to_list(1000)
        return {"success": True, "transactions": transactions}
    except Exception as e:
        return {"success": False, "transactions": [], "error": str(e)}

# ========================
# CASH FLOW
# ========================

@router.get("/cashflow/summary")
async def get_cashflow_summary(month: int, year: int):
    """Get cash flow summary for a specific month"""
    try:
        actual = await db.cashflow_actuals.find_one(
            {"month": month, "year": year},
            {"_id": 0}
        )
        
        if not actual:
            return {
                "success": True,
                "opening_balance": 13562282.37,
                "total_inflows": 0,
                "total_outflows": 0,
                "closing_balance": 13562282.37
            }
        
        return {
            "success": True,
            "opening_balance": actual.get("opening_balance", 0),
            "total_inflows": actual.get("total_inflows", 0),
            "total_outflows": actual.get("total_outflows", 0),
            "closing_balance": actual.get("closing_balance", 0)
        }
    except Exception as e:
        return {
            "success": False,
            "opening_balance": 0,
            "total_inflows": 0,
            "total_outflows": 0,
            "closing_balance": 0,
            "error": str(e)
        }

@router.get("/cashflow/transactions")
async def get_cashflow_transactions(month: int, year: int):
    """Get cash flow transactions for a specific month"""
    try:
        actual = await db.cashflow_actuals.find_one(
            {"month": month, "year": year},
            {"_id": 0}
        )
        
        if not actual or not actual.get("transactions"):
            return {"success": True, "transactions": []}
        
        return {"success": True, "transactions": actual["transactions"]}
    except Exception as e:
        return {"success": False, "transactions": [], "error": str(e)}

@router.get("/cashflow/budgets")
async def get_cashflow_budgets(year: int):
    """Get cash flow budgets for a year"""
    try:
        budgets = await db.cashflow_budgets.find(
            {"year": year},
            {"_id": 0}
        ).to_list(12)
        
        return {"success": True, "budgets": budgets}
    except Exception as e:
        return {"success": False, "budgets": [], "error": str(e)}

@router.get("/cashflow/variance")
async def get_cashflow_variance(month: int, year: int):
    """Get cash flow variance for a specific month"""
    try:
        actual = await db.cashflow_actuals.find_one(
            {"month": month, "year": year},
            {"_id": 0}
        )
        
        budget = await db.cashflow_budgets.find_one(
            {"month": month, "year": year},
            {"_id": 0}
        )
        
        actual_amount = actual.get("closing_balance", 0) if actual else 0
        budget_amount = budget.get("amount", 0) if budget else 0
        
        return {
            "success": True,
            "actual": actual_amount,
            "budget": budget_amount,
            "variance": actual_amount - budget_amount
        }
    except Exception as e:
        return {
            "success": False,
            "actual": 0,
            "budget": 0,
            "variance": 0,
            "error": str(e)
        }

@router.get("/cashflow/forecast")
async def get_cashflow_forecast(months: int = 6):
    """Get cash flow forecast"""
    try:
        # Simple forecast based on historical averages
        actuals = await db.cashflow_actuals.find({}, {"_id": 0}).sort("month", -1).limit(6).to_list(6)
        
        if not actuals:
            return {"success": True, "predictions": []}
        
        avg_closing = sum(a.get("closing_balance", 0) for a in actuals) / len(actuals)
        
        predictions = []
        for i in range(months):
            predictions.append({
                "month": f"Month {i+1}",
                "predicted": avg_closing + (i * 100000),
                "confidence_upper": avg_closing + (i * 150000),
                "confidence_lower": avg_closing + (i * 50000)
            })
        
        return {"success": True, "predictions": predictions}
    except Exception as e:
        return {"success": False, "predictions": [], "error": str(e)}
