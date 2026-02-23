"""
IB Finance Module - Backend Routes
Financial Truth & Settlement Engine
7 Core Modules: Billing, Receivables, Payables, Ledger, Assets, Tax, Close
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import jwt
import os

router = APIRouter(prefix="/api/ib-finance", tags=["IB Finance"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

def get_db():
    """Get database instance from main"""
    from main import db
    return db

async def get_current_user(authorization: str = Header(None)):
    """Extract current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_finance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get IB Finance dashboard metrics"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Aggregate metrics
    total_billing = await db.fin_billing_records.count_documents({"org_id": org_id})
    pending_billing = await db.fin_billing_records.count_documents({"org_id": org_id, "status": "draft"})
    
    open_receivables = await db.fin_receivables.count_documents({"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}})
    overdue_receivables = await db.fin_receivables.count_documents({"org_id": org_id, "status": "overdue"})
    
    open_payables = await db.fin_payables.count_documents({"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}})
    overdue_payables = await db.fin_payables.count_documents({"org_id": org_id, "status": "overdue"})
    
    total_assets = await db.fin_assets.count_documents({"org_id": org_id, "status": "active"})
    
    # Get period status
    current_period = await db.fin_accounting_periods.find_one(
        {"org_id": org_id, "status": "open"},
        {"_id": 0}
    )
    
    return {
        "success": True,
        "data": {
            "billing": {"total": total_billing, "pending": pending_billing},
            "receivables": {"open": open_receivables, "overdue": overdue_receivables},
            "payables": {"open": open_payables, "overdue": overdue_payables},
            "assets": {"active": total_assets},
            "current_period": current_period
        }
    }


# ==================== MODULE 1: BILLING ====================

@router.get("/billing")
async def get_billing_records(
    status: Optional[str] = None,
    billing_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all billing records"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if billing_type:
        query["billing_type"] = billing_type
    
    cursor = db.fin_billing_records.find(query, {"_id": 0}).sort("created_at", -1)
    records = await cursor.to_list(length=1000)
    return {"success": True, "data": records, "count": len(records)}


@router.get("/billing/{billing_id}")
async def get_billing_record(billing_id: str, current_user: dict = Depends(get_current_user)):
    """Get billing record details"""
    db = get_db()
    record = await db.fin_billing_records.find_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not record:
        raise HTTPException(status_code=404, detail="Billing record not found")
    return {"success": True, "data": record}


@router.post("/billing")
async def create_billing_record(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new billing record"""
    db = get_db()
    billing_record = {
        "billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}",
        "billing_type": data.get("billing_type", "milestone"),  # milestone | usage | subscription | adjustment
        "source_event_id": data.get("source_event_id"),
        "contract_id": data.get("contract_id"),
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "billing_period": data.get("billing_period"),
        "currency": data.get("currency", "INR"),
        "gross_amount": data.get("gross_amount", 0),
        "tax_code": data.get("tax_code"),
        "tax_amount": data.get("tax_amount", 0),
        "net_amount": data.get("net_amount", 0),
        "description": data.get("description", ""),
        "line_items": data.get("line_items", []),
        "status": "draft",  # draft | approved | issued | cancelled
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    return {"success": True, "data": billing_record}


@router.put("/billing/{billing_id}/approve")
async def approve_billing(billing_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a billing record"""
    db = get_db()
    result = await db.fin_billing_records.update_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id"), "status": "draft"},
        {"$set": {
            "status": "approved",
            "approved_by": current_user.get("user_id"),
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Billing record not found or already processed")
    return {"success": True, "message": "Billing record approved"}


@router.put("/billing/{billing_id}/issue")
async def issue_billing(billing_id: str, current_user: dict = Depends(get_current_user)):
    """Issue a billing record (create invoice)"""
    db = get_db()
    
    # Get billing record
    record = await db.fin_billing_records.find_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not record or record.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Billing must be approved before issuing")
    
    # Generate invoice number
    count = await db.fin_billing_records.count_documents({"org_id": current_user.get("org_id"), "invoice_number": {"$exists": True}})
    invoice_number = f"INV-{datetime.now().strftime('%Y%m')}-{str(count + 1).zfill(4)}"
    
    # Update billing record
    await db.fin_billing_records.update_one(
        {"billing_id": billing_id},
        {"$set": {
            "status": "issued",
            "invoice_number": invoice_number,
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "issued_by": current_user.get("user_id")
        }}
    )
    
    # Create receivable entry
    receivable = {
        "receivable_id": f"RCV-{uuid.uuid4().hex[:8].upper()}",
        "invoice_id": billing_id,
        "invoice_number": invoice_number,
        "customer_id": record.get("party_id"),
        "customer_name": record.get("party_name"),
        "invoice_date": datetime.now(timezone.utc).isoformat(),
        "due_date": data.get("due_date") if 'data' in dir() else (datetime.now(timezone.utc).isoformat()),
        "invoice_amount": record.get("net_amount", 0),
        "outstanding_amount": record.get("net_amount", 0),
        "currency": record.get("currency", "INR"),
        "status": "open",
        "aging_bucket": "0-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_receivables.insert_one(receivable)
    
    return {"success": True, "message": "Invoice issued", "invoice_number": invoice_number}


@router.put("/billing/{billing_id}/cancel")
async def cancel_billing(billing_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Cancel a billing record"""
    db = get_db()
    result = await db.fin_billing_records.update_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id"), "status": {"$in": ["draft", "approved"]}},
        {"$set": {
            "status": "cancelled",
            "cancel_reason": data.get("reason", ""),
            "cancelled_by": current_user.get("user_id"),
            "cancelled_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Billing record not found or cannot be cancelled")
    return {"success": True, "message": "Billing record cancelled"}


# ==================== MODULE 2: RECEIVABLES ====================

@router.get("/receivables")
async def get_receivables(
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all receivables"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if customer_id:
        query["customer_id"] = customer_id
    
    cursor = db.fin_receivables.find(query, {"_id": 0}).sort("due_date", 1)
    records = await cursor.to_list(length=1000)
    return {"success": True, "data": records, "count": len(records)}


@router.get("/receivables/dashboard")
async def get_receivables_dashboard(current_user: dict = Depends(get_current_user)):
    """Get receivables dashboard with aging"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get totals by status
    pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {
            "_id": "$status",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    status_totals = await db.fin_receivables.aggregate(pipeline).to_list(length=10)
    
    # Get aging buckets
    aging_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}}},
        {"$group": {
            "_id": "$aging_bucket",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    aging_totals = await db.fin_receivables.aggregate(aging_pipeline).to_list(length=10)
    
    # Calculate totals
    total_outstanding = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] in ["open", "partially_paid", "overdue"])
    total_overdue = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] == "overdue")
    
    return {
        "success": True,
        "data": {
            "total_outstanding": total_outstanding,
            "total_overdue": total_overdue,
            "by_status": {s["_id"]: {"amount": s["total_amount"], "count": s["count"]} for s in status_totals},
            "aging": {a["_id"]: {"amount": a["total_amount"], "count": a["count"]} for a in aging_totals}
        }
    }


@router.get("/receivables/{receivable_id}")
async def get_receivable(receivable_id: str, current_user: dict = Depends(get_current_user)):
    """Get receivable details with payment history"""
    db = get_db()
    receivable = await db.fin_receivables.find_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not receivable:
        raise HTTPException(status_code=404, detail="Receivable not found")
    
    # Get payment applications
    applications = await db.fin_cash_applications.find(
        {"receivable_id": receivable_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": {**receivable, "payment_applications": applications}}


@router.post("/receivables/payment")
async def record_payment_receipt(data: dict, current_user: dict = Depends(get_current_user)):
    """Record a payment receipt"""
    db = get_db()
    receipt = {
        "receipt_id": f"RCT-{uuid.uuid4().hex[:8].upper()}",
        "customer_id": data.get("customer_id"),
        "customer_name": data.get("customer_name"),
        "payment_date": data.get("payment_date", datetime.now(timezone.utc).isoformat()),
        "amount_received": data.get("amount_received", 0),
        "currency": data.get("currency", "INR"),
        "payment_mode": data.get("payment_mode", "bank"),  # bank | cheque | online | cash
        "reference_number": data.get("reference_number"),
        "bank_account_id": data.get("bank_account_id"),
        "status": "unapplied",  # unapplied | partially_applied | applied
        "unapplied_amount": data.get("amount_received", 0),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_payment_receipts.insert_one(receipt)
    receipt.pop("_id", None)
    return {"success": True, "data": receipt}


@router.post("/receivables/apply-cash")
async def apply_cash_to_invoice(data: dict, current_user: dict = Depends(get_current_user)):
    """Apply cash receipt to invoice"""
    db = get_db()
    receipt_id = data.get("receipt_id")
    receivable_id = data.get("receivable_id")
    amount = data.get("amount", 0)
    
    # Get receipt
    receipt = await db.fin_payment_receipts.find_one({"receipt_id": receipt_id}, {"_id": 0})
    if not receipt or receipt.get("unapplied_amount", 0) < amount:
        raise HTTPException(status_code=400, detail="Insufficient unapplied amount")
    
    # Get receivable
    receivable = await db.fin_receivables.find_one({"receivable_id": receivable_id}, {"_id": 0})
    if not receivable or receivable.get("outstanding_amount", 0) < amount:
        raise HTTPException(status_code=400, detail="Amount exceeds outstanding")
    
    # Create application record
    application = {
        "application_id": f"APP-{uuid.uuid4().hex[:8].upper()}",
        "receipt_id": receipt_id,
        "receivable_id": receivable_id,
        "applied_amount": amount,
        "applied_at": datetime.now(timezone.utc).isoformat(),
        "applied_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_cash_applications.insert_one(application)
    
    # Update receipt
    new_unapplied = receipt.get("unapplied_amount", 0) - amount
    receipt_status = "applied" if new_unapplied == 0 else "partially_applied"
    await db.fin_payment_receipts.update_one(
        {"receipt_id": receipt_id},
        {"$set": {"unapplied_amount": new_unapplied, "status": receipt_status}}
    )
    
    # Update receivable
    new_outstanding = receivable.get("outstanding_amount", 0) - amount
    receivable_status = "paid" if new_outstanding == 0 else "partially_paid"
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id},
        {"$set": {"outstanding_amount": new_outstanding, "status": receivable_status}}
    )
    
    return {"success": True, "message": "Cash applied successfully"}


@router.put("/receivables/{receivable_id}/write-off")
async def write_off_receivable(receivable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Write off a receivable"""
    db = get_db()
    
    # Create write-off record
    writeoff = {
        "writeoff_id": f"WOF-{uuid.uuid4().hex[:8].upper()}",
        "receivable_id": receivable_id,
        "amount": data.get("amount", 0),
        "reason": data.get("reason", ""),
        "approved_by": current_user.get("user_id"),
        "approved_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_writeoffs.insert_one(writeoff)
    
    # Update receivable
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"$set": {"status": "written_off", "written_off_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Receivable written off"}


# ==================== MODULE 3: PAYABLES ====================

@router.get("/payables")
async def get_payables(
    status: Optional[str] = None,
    vendor_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all payables"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if vendor_id:
        query["vendor_id"] = vendor_id
    
    cursor = db.fin_payables.find(query, {"_id": 0}).sort("due_date", 1)
    records = await cursor.to_list(length=1000)
    return {"success": True, "data": records, "count": len(records)}


@router.get("/payables/dashboard")
async def get_payables_dashboard(current_user: dict = Depends(get_current_user)):
    """Get payables dashboard with aging"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get totals by status
    pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {
            "_id": "$status",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    status_totals = await db.fin_payables.aggregate(pipeline).to_list(length=10)
    
    # Get aging buckets
    aging_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}}},
        {"$group": {
            "_id": "$aging_bucket",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    aging_totals = await db.fin_payables.aggregate(aging_pipeline).to_list(length=10)
    
    total_outstanding = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] in ["open", "partially_paid", "overdue"])
    total_overdue = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] == "overdue")
    
    return {
        "success": True,
        "data": {
            "total_outstanding": total_outstanding,
            "total_overdue": total_overdue,
            "by_status": {s["_id"]: {"amount": s["total_amount"], "count": s["count"]} for s in status_totals},
            "aging": {a["_id"]: {"amount": a["total_amount"], "count": a["count"]} for a in aging_totals}
        }
    }


@router.get("/payables/{payable_id}")
async def get_payable(payable_id: str, current_user: dict = Depends(get_current_user)):
    """Get payable details"""
    db = get_db()
    payable = await db.fin_payables.find_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not payable:
        raise HTTPException(status_code=404, detail="Payable not found")
    
    # Get matching records
    matches = await db.fin_bill_matches.find(
        {"payable_id": payable_id},
        {"_id": 0}
    ).to_list(length=100)
    
    # Get settlements
    settlements = await db.fin_payable_settlements.find(
        {"payable_id": payable_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": {**payable, "matches": matches, "settlements": settlements}}


@router.post("/payables")
async def create_payable(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a vendor payable (bill)"""
    db = get_db()
    payable = {
        "payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": data.get("vendor_id"),
        "vendor_name": data.get("vendor_name"),
        "bill_number": data.get("bill_number"),
        "bill_date": data.get("bill_date"),
        "due_date": data.get("due_date"),
        "bill_amount": data.get("bill_amount", 0),
        "outstanding_amount": data.get("bill_amount", 0),
        "currency": data.get("currency", "INR"),
        "status": "open",  # open | partially_paid | paid | overdue | disputed | written_off
        "source_reference": data.get("source_reference"),  # contract | delivery | usage
        "source_reference_id": data.get("source_reference_id"),
        "match_status": "pending",  # pending | matched | mismatch
        "line_items": data.get("line_items", []),
        "aging_bucket": "0-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_payables.insert_one(payable)
    payable.pop("_id", None)
    return {"success": True, "data": payable}


@router.put("/payables/{payable_id}/match")
async def match_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Match payable with contract/delivery"""
    db = get_db()
    match_record = {
        "match_id": f"MTH-{uuid.uuid4().hex[:8].upper()}",
        "payable_id": payable_id,
        "reference_type": data.get("reference_type"),  # contract | delivery | milestone | usage
        "reference_id": data.get("reference_id"),
        "match_status": data.get("match_status", "matched"),  # matched | mismatch | pending
        "variance_amount": data.get("variance_amount", 0),
        "matched_at": datetime.now(timezone.utc).isoformat(),
        "matched_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_bill_matches.insert_one(match_record)
    
    # Update payable match status
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": {"match_status": data.get("match_status", "matched")}}
    )
    
    return {"success": True, "message": "Payable matched"}


@router.put("/payables/{payable_id}/approve")
async def approve_payable(payable_id: str, current_user: dict = Depends(get_current_user)):
    """Approve payable for payment"""
    db = get_db()
    result = await db.fin_payables.update_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id"), "match_status": "matched"},
        {"$set": {
            "approved_for_payment": True,
            "approved_by": current_user.get("user_id"),
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Payable must be matched before approval")
    return {"success": True, "message": "Payable approved for payment"}


@router.put("/payables/{payable_id}/dispute")
async def dispute_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Mark payable as disputed"""
    db = get_db()
    
    dispute = {
        "dispute_id": f"DSP-{uuid.uuid4().hex[:8].upper()}",
        "payable_id": payable_id,
        "reason": data.get("reason", ""),
        "status": "open",  # open | resolved | escalated
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_payable_disputes.insert_one(dispute)
    
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": {"status": "disputed"}}
    )
    
    return {"success": True, "message": "Payable marked as disputed"}


@router.post("/payables/{payable_id}/pay")
async def record_payment(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Record payment against payable"""
    db = get_db()
    
    payable = await db.fin_payables.find_one({"payable_id": payable_id}, {"_id": 0})
    if not payable:
        raise HTTPException(status_code=404, detail="Payable not found")
    
    amount = data.get("amount", 0)
    if amount > payable.get("outstanding_amount", 0):
        raise HTTPException(status_code=400, detail="Amount exceeds outstanding")
    
    settlement = {
        "settlement_id": f"STL-{uuid.uuid4().hex[:8].upper()}",
        "payable_id": payable_id,
        "payment_id": data.get("payment_id"),
        "applied_amount": amount,
        "payment_mode": data.get("payment_mode", "bank"),
        "reference_number": data.get("reference_number"),
        "applied_at": datetime.now(timezone.utc).isoformat(),
        "applied_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_payable_settlements.insert_one(settlement)
    
    new_outstanding = payable.get("outstanding_amount", 0) - amount
    new_status = "paid" if new_outstanding == 0 else "partially_paid"
    
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": {"outstanding_amount": new_outstanding, "status": new_status}}
    )
    
    return {"success": True, "message": "Payment recorded"}


# ==================== MODULE 4: LEDGER ====================

@router.get("/ledger/accounts")
async def get_chart_of_accounts(current_user: dict = Depends(get_current_user)):
    """Get chart of accounts"""
    db = get_db()
    cursor = db.fin_accounts.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    ).sort("account_code", 1)
    accounts = await cursor.to_list(length=1000)
    return {"success": True, "data": accounts, "count": len(accounts)}


@router.post("/ledger/accounts")
async def create_account(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new account in chart of accounts"""
    db = get_db()
    account = {
        "account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}",
        "account_code": data.get("account_code"),
        "account_name": data.get("account_name"),
        "account_type": data.get("account_type"),  # asset | liability | equity | income | expense
        "parent_account_id": data.get("parent_account_id"),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_accounts.insert_one(account)
    account.pop("_id", None)
    return {"success": True, "data": account}


@router.get("/ledger/journals")
async def get_journal_entries(
    status: Optional[str] = None,
    source_module: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get journal entries"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if source_module:
        query["source_module"] = source_module
    if period:
        query["period"] = period
    
    cursor = db.fin_journal_entries.find(query, {"_id": 0}).sort("journal_date", -1)
    entries = await cursor.to_list(length=1000)
    return {"success": True, "data": entries, "count": len(entries)}


@router.get("/ledger/journals/{journal_id}")
async def get_journal_entry(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Get journal entry details"""
    db = get_db()
    entry = await db.fin_journal_entries.find_one(
        {"journal_id": journal_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    # Get lines
    lines = await db.fin_journal_lines.find(
        {"journal_id": journal_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": {**entry, "lines": lines}}


@router.post("/ledger/journals")
async def create_journal_entry(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a journal entry"""
    db = get_db()
    
    # Validate debit = credit
    lines = data.get("lines", [])
    total_debit = sum(l.get("debit_amount", 0) for l in lines)
    total_credit = sum(l.get("credit_amount", 0) for l in lines)
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail="Debit must equal credit")
    
    journal_id = f"JRN-{uuid.uuid4().hex[:8].upper()}"
    
    entry = {
        "journal_id": journal_id,
        "journal_date": data.get("journal_date", datetime.now(timezone.utc).isoformat()),
        "source_module": data.get("source_module"),  # billing | receivables | payables | assets | tax | manual
        "source_reference_id": data.get("source_reference_id"),
        "description": data.get("description", ""),
        "total_debit": total_debit,
        "total_credit": total_credit,
        "status": "draft",  # draft | posted | reversed
        "period": data.get("period"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_journal_entries.insert_one(entry)
    
    # Create lines
    for idx, line in enumerate(lines):
        journal_line = {
            "line_id": f"{journal_id}-L{idx+1}",
            "journal_id": journal_id,
            "account_id": line.get("account_id"),
            "account_code": line.get("account_code"),
            "account_name": line.get("account_name"),
            "debit_amount": line.get("debit_amount", 0),
            "credit_amount": line.get("credit_amount", 0),
            "currency": line.get("currency", "INR"),
            "exchange_rate": line.get("exchange_rate", 1),
            "description": line.get("description", ""),
            "org_id": current_user.get("org_id")
        }
        await db.fin_journal_lines.insert_one(journal_line)
    
    entry.pop("_id", None)
    return {"success": True, "data": entry}


@router.put("/ledger/journals/{journal_id}/post")
async def post_journal_entry(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Post a journal entry"""
    db = get_db()
    
    # Check period is open
    entry = await db.fin_journal_entries.find_one({"journal_id": journal_id}, {"_id": 0})
    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    period = await db.fin_accounting_periods.find_one(
        {"period": entry.get("period"), "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if period and period.get("status") == "closed":
        raise HTTPException(status_code=400, detail="Cannot post to closed period")
    
    result = await db.fin_journal_entries.update_one(
        {"journal_id": journal_id, "status": "draft"},
        {"$set": {
            "status": "posted",
            "posted_by": current_user.get("user_id"),
            "posted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Entry not found or already posted")
    
    return {"success": True, "message": "Journal entry posted"}


@router.put("/ledger/journals/{journal_id}/reverse")
async def reverse_journal_entry(journal_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Reverse a posted journal entry"""
    db = get_db()
    
    entry = await db.fin_journal_entries.find_one(
        {"journal_id": journal_id, "status": "posted"},
        {"_id": 0}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Posted entry not found")
    
    # Get original lines
    lines = await db.fin_journal_lines.find({"journal_id": journal_id}, {"_id": 0}).to_list(length=100)
    
    # Create reversal entry with swapped debits/credits
    reversal_id = f"JRN-{uuid.uuid4().hex[:8].upper()}"
    reversal = {
        "journal_id": reversal_id,
        "journal_date": datetime.now(timezone.utc).isoformat(),
        "source_module": "reversal",
        "source_reference_id": journal_id,
        "description": f"Reversal of {journal_id}: {data.get('reason', '')}",
        "total_debit": entry.get("total_credit"),
        "total_credit": entry.get("total_debit"),
        "status": "posted",
        "period": data.get("period"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "posted_by": current_user.get("user_id"),
        "posted_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_journal_entries.insert_one(reversal)
    
    # Create reversed lines
    for idx, line in enumerate(lines):
        journal_line = {
            "line_id": f"{reversal_id}-L{idx+1}",
            "journal_id": reversal_id,
            "account_id": line.get("account_id"),
            "account_code": line.get("account_code"),
            "account_name": line.get("account_name"),
            "debit_amount": line.get("credit_amount", 0),  # Swapped
            "credit_amount": line.get("debit_amount", 0),  # Swapped
            "currency": line.get("currency", "INR"),
            "exchange_rate": line.get("exchange_rate", 1),
            "description": f"Reversal: {line.get('description', '')}",
            "org_id": current_user.get("org_id")
        }
        await db.fin_journal_lines.insert_one(journal_line)
    
    # Update original entry
    await db.fin_journal_entries.update_one(
        {"journal_id": journal_id},
        {"$set": {"status": "reversed", "reversal_id": reversal_id}}
    )
    
    return {"success": True, "message": "Journal entry reversed", "reversal_id": reversal_id}


@router.get("/ledger/trial-balance")
async def get_trial_balance(period: str, current_user: dict = Depends(get_current_user)):
    """Get trial balance for a period"""
    db = get_db()
    
    pipeline = [
        {"$match": {"org_id": current_user.get("org_id"), "status": "posted"}},
        {"$lookup": {
            "from": "fin_journal_lines",
            "localField": "journal_id",
            "foreignField": "journal_id",
            "as": "lines"
        }},
        {"$unwind": "$lines"},
        {"$group": {
            "_id": "$lines.account_id",
            "account_code": {"$first": "$lines.account_code"},
            "account_name": {"$first": "$lines.account_name"},
            "total_debit": {"$sum": "$lines.debit_amount"},
            "total_credit": {"$sum": "$lines.credit_amount"}
        }},
        {"$sort": {"account_code": 1}}
    ]
    
    balances = await db.fin_journal_entries.aggregate(pipeline).to_list(length=1000)
    
    total_debit = sum(b.get("total_debit", 0) for b in balances)
    total_credit = sum(b.get("total_credit", 0) for b in balances)
    
    return {
        "success": True,
        "data": {
            "period": period,
            "accounts": balances,
            "total_debit": total_debit,
            "total_credit": total_credit,
            "is_balanced": abs(total_debit - total_credit) < 0.01
        }
    }


# ==================== MODULE 5: ASSETS ====================

@router.get("/assets")
async def get_assets(
    status: Optional[str] = None,
    asset_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all assets"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if asset_type:
        query["asset_type"] = asset_type
    
    cursor = db.fin_assets.find(query, {"_id": 0}).sort("acquisition_date", -1)
    assets = await cursor.to_list(length=1000)
    return {"success": True, "data": assets, "count": len(assets)}


@router.get("/assets/{asset_id}")
async def get_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Get asset details with depreciation schedule"""
    db = get_db()
    asset = await db.fin_assets.find_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Get depreciation schedule
    schedule = await db.fin_depreciation_schedules.find(
        {"asset_id": asset_id},
        {"_id": 0}
    ).sort("period", 1).to_list(length=500)
    
    return {"success": True, "data": {**asset, "depreciation_schedule": schedule}}


@router.post("/assets")
async def create_asset(data: dict, current_user: dict = Depends(get_current_user)):
    """Create/capitalize an asset"""
    db = get_db()
    
    asset = {
        "asset_id": f"AST-{uuid.uuid4().hex[:8].upper()}",
        "asset_name": data.get("asset_name"),
        "asset_type": data.get("asset_type", "tangible"),  # tangible | intangible | rou
        "asset_category": data.get("asset_category"),
        "acquisition_date": data.get("acquisition_date"),
        "capitalization_value": data.get("capitalization_value", 0),
        "useful_life_months": data.get("useful_life_months", 36),
        "depreciation_method": data.get("depreciation_method", "straight_line"),  # straight_line | wdv
        "residual_value": data.get("residual_value", 0),
        "accumulated_depreciation": 0,
        "net_book_value": data.get("capitalization_value", 0),
        "status": "active",  # active | suspended | disposed | fully_depreciated
        "source_type": data.get("source_type"),  # payable | internal_cost
        "source_reference_id": data.get("source_reference_id"),
        "location": data.get("location"),
        "serial_number": data.get("serial_number"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_assets.insert_one(asset)
    asset.pop("_id", None)
    return {"success": True, "data": asset}


@router.post("/assets/{asset_id}/depreciate")
async def run_depreciation(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Run depreciation for an asset"""
    db = get_db()
    
    asset = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset or asset.get("status") != "active":
        raise HTTPException(status_code=400, detail="Asset not active")
    
    period = data.get("period")
    
    # Calculate depreciation
    cap_value = asset.get("capitalization_value", 0)
    residual = asset.get("residual_value", 0)
    useful_life = asset.get("useful_life_months", 36)
    method = asset.get("depreciation_method", "straight_line")
    accumulated = asset.get("accumulated_depreciation", 0)
    
    if method == "straight_line":
        monthly_depreciation = (cap_value - residual) / useful_life
    else:  # WDV
        rate = data.get("wdv_rate", 0.25)
        monthly_depreciation = (cap_value - accumulated) * rate / 12
    
    new_accumulated = accumulated + monthly_depreciation
    new_nbv = cap_value - new_accumulated
    
    # Check if fully depreciated
    new_status = "fully_depreciated" if new_nbv <= residual else "active"
    
    # Create depreciation schedule entry
    schedule_entry = {
        "schedule_id": f"DEP-{uuid.uuid4().hex[:8].upper()}",
        "asset_id": asset_id,
        "period": period,
        "depreciation_amount": monthly_depreciation,
        "accumulated_depreciation": new_accumulated,
        "net_book_value": new_nbv,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_depreciation_schedules.insert_one(schedule_entry)
    
    # Update asset
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": {
            "accumulated_depreciation": new_accumulated,
            "net_book_value": new_nbv,
            "status": new_status
        }}
    )
    
    return {"success": True, "data": {
        "depreciation_amount": monthly_depreciation,
        "new_accumulated": new_accumulated,
        "new_nbv": new_nbv,
        "status": new_status
    }}


@router.put("/assets/{asset_id}/dispose")
async def dispose_asset(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Dispose an asset"""
    db = get_db()
    
    asset = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    proceeds = data.get("proceeds_amount", 0)
    nbv = asset.get("net_book_value", 0)
    gain_or_loss = proceeds - nbv
    
    disposal = {
        "disposal_id": f"DIS-{uuid.uuid4().hex[:8].upper()}",
        "asset_id": asset_id,
        "disposal_date": data.get("disposal_date", datetime.now(timezone.utc).isoformat()),
        "proceeds_amount": proceeds,
        "net_book_value": nbv,
        "gain_or_loss": gain_or_loss,
        "disposal_reason": data.get("reason", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_asset_disposals.insert_one(disposal)
    disposal.pop("_id", None)
    
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": {"status": "disposed", "disposed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "data": disposal}


# ==================== MODULE 6: TAX ====================

@router.get("/tax/registrations")
async def get_tax_registrations(current_user: dict = Depends(get_current_user)):
    """Get tax registrations"""
    db = get_db()
    cursor = db.fin_tax_registrations.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    registrations = await cursor.to_list(length=100)
    return {"success": True, "data": registrations}


@router.get("/tax/transactions")
async def get_tax_transactions(
    tax_type: Optional[str] = None,
    direction: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get tax transactions"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if tax_type:
        query["tax_type"] = tax_type
    if direction:
        query["direction"] = direction
    if period:
        query["period"] = period
    
    cursor = db.fin_tax_transactions.find(query, {"_id": 0}).sort("created_at", -1)
    transactions = await cursor.to_list(length=1000)
    return {"success": True, "data": transactions, "count": len(transactions)}


@router.get("/tax/transactions/{tax_txn_id}")
async def get_tax_transaction(tax_txn_id: str, current_user: dict = Depends(get_current_user)):
    """Get a single tax transaction by ID"""
    db = get_db()
    
    transaction = await db.fin_tax_transactions.find_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Tax transaction not found")
    
    return {"success": True, "data": transaction}


@router.get("/tax/dashboard")
async def get_tax_dashboard(period: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get tax dashboard"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    query = {"org_id": org_id}
    if period:
        query["period"] = period
    
    # Get output tax
    output_pipeline = [
        {"$match": {**query, "direction": "output"}},
        {"$group": {
            "_id": "$tax_type",
            "total": {"$sum": "$tax_amount"}
        }}
    ]
    output_taxes = await db.fin_tax_transactions.aggregate(output_pipeline).to_list(length=10)
    
    # Get input tax
    input_pipeline = [
        {"$match": {**query, "direction": "input"}},
        {"$group": {
            "_id": "$tax_type",
            "total": {"$sum": "$tax_amount"}
        }}
    ]
    input_taxes = await db.fin_tax_transactions.aggregate(input_pipeline).to_list(length=10)
    
    output_total = sum(t.get("total", 0) for t in output_taxes)
    input_total = sum(t.get("total", 0) for t in input_taxes)
    
    return {
        "success": True,
        "data": {
            "output_tax": output_total,
            "input_tax": input_total,
            "net_payable": output_total - input_total,
            "by_type": {
                "output": {t["_id"]: t["total"] for t in output_taxes},
                "input": {t["_id"]: t["total"] for t in input_taxes}
            }
        }
    }


@router.post("/tax/transactions")
async def create_tax_transaction(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a tax transaction"""
    db = get_db()
    
    transaction = {
        "tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}",
        "source_module": data.get("source_module"),  # billing | payables
        "source_reference_id": data.get("source_reference_id"),
        "tax_type": data.get("tax_type"),  # GST | VAT | WHT | SALES
        "taxable_amount": data.get("taxable_amount", 0),
        "tax_rate": data.get("tax_rate", 0),
        "tax_amount": data.get("tax_amount", 0),
        "jurisdiction": data.get("jurisdiction"),
        "direction": data.get("direction"),  # output | input
        "status": "final",  # provisional | final
        "period": data.get("period"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_tax_transactions.insert_one(transaction)
    transaction.pop("_id", None)
    return {"success": True, "data": transaction}


@router.get("/tax/input-credits")
async def get_input_tax_credits(current_user: dict = Depends(get_current_user)):
    """Get input tax credits"""
    db = get_db()
    cursor = db.fin_input_tax_credits.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    credits = await cursor.to_list(length=1000)
    return {"success": True, "data": credits}


@router.get("/tax/reports/summary")
async def get_tax_summary_report(period: str, current_user: dict = Depends(get_current_user)):
    """Get tax summary report"""
    db = get_db()
    
    pipeline = [
        {"$match": {"org_id": current_user.get("org_id"), "period": period}},
        {"$group": {
            "_id": {"tax_type": "$tax_type", "direction": "$direction", "jurisdiction": "$jurisdiction"},
            "taxable_amount": {"$sum": "$taxable_amount"},
            "tax_amount": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    
    summary = await db.fin_tax_transactions.aggregate(pipeline).to_list(length=100)
    
    return {"success": True, "data": {"period": period, "summary": summary}}


# ==================== FINANCIAL STATEMENTS API ====================

@router.get("/statements/profit-loss")
async def get_profit_loss_statement(period: str, current_user: dict = Depends(get_current_user)):
    """Generate Profit & Loss statement from ledger data"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get posted journal entries for the period
    pipeline = [
        {"$match": {"org_id": org_id, "status": "posted"}},
        {"$lookup": {
            "from": "fin_journal_lines",
            "localField": "journal_id",
            "foreignField": "journal_id",
            "as": "lines"
        }},
        {"$unwind": "$lines"},
        {"$lookup": {
            "from": "fin_accounts",
            "localField": "lines.account_id",
            "foreignField": "account_id",
            "as": "account_info"
        }},
        {"$unwind": {"path": "$account_info", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": {
                "account_id": "$lines.account_id",
                "account_code": "$lines.account_code",
                "account_name": "$lines.account_name",
                "account_type": "$account_info.account_type"
            },
            "total_debit": {"$sum": "$lines.debit_amount"},
            "total_credit": {"$sum": "$lines.credit_amount"}
        }}
    ]
    
    balances = await db.fin_journal_entries.aggregate(pipeline).to_list(length=1000)
    
    # Calculate P&L items
    revenue = []
    expenses = []
    
    for b in balances:
        account_type = b["_id"].get("account_type", "")
        account_name = b["_id"].get("account_name", "Unknown")
        net_amount = b.get("total_credit", 0) - b.get("total_debit", 0)
        
        if account_type == "income":
            revenue.append({"name": account_name, "amount": net_amount})
        elif account_type == "expense":
            # Expenses: Debits increase expenses
            net_amount = b.get("total_debit", 0) - b.get("total_credit", 0)
            expenses.append({"name": account_name, "amount": net_amount})
    
    # If no ledger data, use billing/receivable data
    if not revenue:
        billing_pipeline = [
            {"$match": {"org_id": org_id, "status": "issued"}},
            {"$group": {
                "_id": None,
                "total_revenue": {"$sum": "$gross_amount"}
            }}
        ]
        billing_result = await db.fin_billing_records.aggregate(billing_pipeline).to_list(length=1)
        if billing_result:
            revenue.append({"name": "Revenue - Services", "amount": billing_result[0].get("total_revenue", 0)})
    
    total_revenue = sum(r["amount"] for r in revenue)
    total_expenses = sum(e["amount"] for e in expenses)
    net_income = total_revenue - total_expenses
    
    return {
        "success": True,
        "data": {
            "period": period,
            "revenue": revenue,
            "expenses": expenses,
            "total_revenue": total_revenue,
            "total_expenses": total_expenses,
            "net_income": net_income
        }
    }


@router.get("/statements/balance-sheet")
async def get_balance_sheet(period: str, current_user: dict = Depends(get_current_user)):
    """Generate Balance Sheet from ledger data"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get account balances
    pipeline = [
        {"$match": {"org_id": org_id, "status": "posted"}},
        {"$lookup": {
            "from": "fin_journal_lines",
            "localField": "journal_id",
            "foreignField": "journal_id",
            "as": "lines"
        }},
        {"$unwind": "$lines"},
        {"$lookup": {
            "from": "fin_accounts",
            "localField": "lines.account_id",
            "foreignField": "account_id",
            "as": "account_info"
        }},
        {"$unwind": {"path": "$account_info", "preserveNullAndEmptyArrays": True}},
        {"$group": {
            "_id": {
                "account_id": "$lines.account_id",
                "account_code": "$lines.account_code",
                "account_name": "$lines.account_name",
                "account_type": "$account_info.account_type"
            },
            "total_debit": {"$sum": "$lines.debit_amount"},
            "total_credit": {"$sum": "$lines.credit_amount"}
        }}
    ]
    
    balances = await db.fin_journal_entries.aggregate(pipeline).to_list(length=1000)
    
    assets_current = []
    assets_non_current = []
    liabilities_current = []
    liabilities_non_current = []
    equity = []
    
    for b in balances:
        account_type = b["_id"].get("account_type", "")
        account_name = b["_id"].get("account_name", "Unknown")
        account_code = b["_id"].get("account_code", "")
        
        if account_type == "asset":
            net_balance = b.get("total_debit", 0) - b.get("total_credit", 0)
            # Check for accumulated depreciation (contra asset)
            if "accumulated" in account_name.lower() or "depreciation" in account_name.lower():
                net_balance = -abs(net_balance)  # Show as negative
            
            if account_code and int(account_code[:2]) < 12:
                assets_current.append({"name": account_name, "amount": net_balance})
            else:
                assets_non_current.append({"name": account_name, "amount": net_balance})
        elif account_type == "liability":
            net_balance = b.get("total_credit", 0) - b.get("total_debit", 0)
            if account_code and int(account_code[:2]) < 22:
                liabilities_current.append({"name": account_name, "amount": net_balance})
            else:
                liabilities_non_current.append({"name": account_name, "amount": net_balance})
        elif account_type == "equity":
            net_balance = b.get("total_credit", 0) - b.get("total_debit", 0)
            equity.append({"name": account_name, "amount": net_balance})
    
    # If no ledger data, use sub-ledger data
    if not assets_current:
        # Get cash from receivables collected
        rcv_total = await db.fin_receivables.aggregate([
            {"$match": {"org_id": org_id}},
            {"$group": {"_id": None, "total": {"$sum": "$outstanding_amount"}}}
        ]).to_list(length=1)
        
        if rcv_total:
            assets_current.append({"name": "Accounts Receivable", "amount": rcv_total[0].get("total", 0)})
        
        # Get assets
        asset_total = await db.fin_assets.aggregate([
            {"$match": {"org_id": org_id, "status": "active"}},
            {"$group": {
                "_id": None, 
                "cap_value": {"$sum": "$capitalization_value"},
                "acc_dep": {"$sum": "$accumulated_depreciation"}
            }}
        ]).to_list(length=1)
        
        if asset_total:
            assets_non_current.append({"name": "Fixed Assets", "amount": asset_total[0].get("cap_value", 0)})
            assets_non_current.append({"name": "Accumulated Depreciation", "amount": -asset_total[0].get("acc_dep", 0)})
        
        # Get payables
        pay_total = await db.fin_payables.aggregate([
            {"$match": {"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}}},
            {"$group": {"_id": None, "total": {"$sum": "$outstanding_amount"}}}
        ]).to_list(length=1)
        
        if pay_total:
            liabilities_current.append({"name": "Accounts Payable", "amount": pay_total[0].get("total", 0)})
    
    total_current_assets = sum(a["amount"] for a in assets_current)
    total_non_current_assets = sum(a["amount"] for a in assets_non_current)
    total_assets = total_current_assets + total_non_current_assets
    
    total_current_liabilities = sum(l["amount"] for l in liabilities_current)
    total_non_current_liabilities = sum(l["amount"] for l in liabilities_non_current)
    total_liabilities = total_current_liabilities + total_non_current_liabilities
    
    total_equity = sum(e["amount"] for e in equity)
    
    return {
        "success": True,
        "data": {
            "period": period,
            "assets": {
                "current": assets_current,
                "non_current": assets_non_current,
                "total_current": total_current_assets,
                "total_non_current": total_non_current_assets,
                "total": total_assets
            },
            "liabilities": {
                "current": liabilities_current,
                "non_current": liabilities_non_current,
                "total_current": total_current_liabilities,
                "total_non_current": total_non_current_liabilities,
                "total": total_liabilities
            },
            "equity": equity,
            "total_equity": total_equity,
            "total_liabilities_equity": total_liabilities + total_equity
        }
    }


@router.get("/statements/cash-flow")
async def get_cash_flow_statement(period: str, current_user: dict = Depends(get_current_user)):
    """Generate Cash Flow statement"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get net income from P&L
    pnl = await get_profit_loss_statement(period, current_user)
    net_income = pnl["data"]["net_income"]
    
    # Get depreciation (add back)
    dep_total = await db.fin_depreciation_schedules.aggregate([
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "total": {"$sum": "$depreciation_amount"}}}
    ]).to_list(length=1)
    depreciation = dep_total[0].get("total", 0) if dep_total else 0
    
    # Get change in receivables
    rcv_total = await db.fin_receivables.aggregate([
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "total": {"$sum": "$outstanding_amount"}}}
    ]).to_list(length=1)
    receivables_change = -(rcv_total[0].get("total", 0) if rcv_total else 0)
    
    # Get change in payables
    pay_total = await db.fin_payables.aggregate([
        {"$match": {"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$outstanding_amount"}}}
    ]).to_list(length=1)
    payables_change = pay_total[0].get("total", 0) if pay_total else 0
    
    # Get asset purchases
    asset_total = await db.fin_assets.aggregate([
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "total": {"$sum": "$capitalization_value"}}}
    ]).to_list(length=1)
    asset_purchases = -(asset_total[0].get("total", 0) if asset_total else 0)
    
    operating_cash_flow = net_income + depreciation + receivables_change + payables_change
    investing_cash_flow = asset_purchases
    financing_cash_flow = 0  # Would come from equity/debt transactions
    
    net_change = operating_cash_flow + investing_cash_flow + financing_cash_flow
    
    return {
        "success": True,
        "data": {
            "period": period,
            "operating": {
                "net_income": net_income,
                "depreciation": depreciation,
                "receivables_change": receivables_change,
                "payables_change": payables_change,
                "total": operating_cash_flow
            },
            "investing": {
                "asset_purchases": asset_purchases,
                "total": investing_cash_flow
            },
            "financing": {
                "total": financing_cash_flow
            },
            "net_change": net_change
        }
    }


# ==================== UPDATE/EDIT ENDPOINTS ====================

@router.put("/billing/{billing_id}")
async def update_billing_record(billing_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a billing record (only draft status)"""
    db = get_db()
    
    # Check if billing exists and is in draft status
    existing = await db.fin_billing_records.find_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    if existing.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft billing records can be edited")
    
    update_fields = {
        "billing_type": data.get("billing_type", existing.get("billing_type")),
        "party_id": data.get("party_id", existing.get("party_id")),
        "party_name": data.get("party_name", existing.get("party_name")),
        "contract_id": data.get("contract_id", existing.get("contract_id")),
        "billing_period": data.get("billing_period", existing.get("billing_period")),
        "currency": data.get("currency", existing.get("currency")),
        "gross_amount": data.get("gross_amount", existing.get("gross_amount")),
        "tax_code": data.get("tax_code", existing.get("tax_code")),
        "tax_amount": data.get("tax_amount", existing.get("tax_amount")),
        "net_amount": data.get("net_amount", existing.get("net_amount")),
        "description": data.get("description", existing.get("description")),
        "line_items": data.get("line_items", existing.get("line_items", [])),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "updated_by": current_user.get("user_id")
    }
    
    await db.fin_billing_records.update_one(
        {"billing_id": billing_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_billing_records.find_one({"billing_id": billing_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/receivables/{receivable_id}")
async def update_receivable(receivable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a receivable record"""
    db = get_db()
    
    existing = await db.fin_receivables.find_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Receivable not found")
    
    update_fields = {
        "customer_name": data.get("customer_name", existing.get("customer_name")),
        "due_date": data.get("due_date", existing.get("due_date")),
        "aging_bucket": data.get("aging_bucket", existing.get("aging_bucket")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_receivables.find_one({"receivable_id": receivable_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/payables/{payable_id}")
async def update_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a payable record"""
    db = get_db()
    
    existing = await db.fin_payables.find_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Payable not found")
    
    if existing.get("status") == "paid":
        raise HTTPException(status_code=400, detail="Cannot edit paid payables")
    
    update_fields = {
        "vendor_name": data.get("vendor_name", existing.get("vendor_name")),
        "bill_number": data.get("bill_number", existing.get("bill_number")),
        "due_date": data.get("due_date", existing.get("due_date")),
        "line_items": data.get("line_items", existing.get("line_items", [])),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_payables.find_one({"payable_id": payable_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/assets/{asset_id}")
async def update_asset(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update an asset record"""
    db = get_db()
    
    existing = await db.fin_assets.find_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if existing.get("status") == "disposed":
        raise HTTPException(status_code=400, detail="Cannot edit disposed assets")
    
    update_fields = {
        "asset_name": data.get("asset_name", existing.get("asset_name")),
        "asset_category": data.get("asset_category", existing.get("asset_category")),
        "location": data.get("location", existing.get("location")),
        "serial_number": data.get("serial_number", existing.get("serial_number")),
        "useful_life_months": data.get("useful_life_months", existing.get("useful_life_months")),
        "depreciation_method": data.get("depreciation_method", existing.get("depreciation_method")),
        "residual_value": data.get("residual_value", existing.get("residual_value")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/ledger/accounts/{account_id}")
async def update_account(account_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a chart of accounts entry"""
    db = get_db()
    
    existing = await db.fin_accounts.find_one(
        {"account_id": account_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Account not found")
    
    update_fields = {
        "account_name": data.get("account_name", existing.get("account_name")),
        "account_type": data.get("account_type", existing.get("account_type")),
        "parent_account_id": data.get("parent_account_id", existing.get("parent_account_id")),
        "is_active": data.get("is_active", existing.get("is_active")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_accounts.update_one(
        {"account_id": account_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_accounts.find_one({"account_id": account_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/ledger/journals/{journal_id}")
async def update_journal_entry(journal_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a journal entry (only draft status)"""
    db = get_db()
    
    existing = await db.fin_journal_entries.find_one(
        {"journal_id": journal_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    if existing.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft journals can be edited")
    
    # Validate debit = credit if lines provided
    lines = data.get("lines", [])
    if lines:
        total_debit = sum(l.get("debit_amount", 0) for l in lines)
        total_credit = sum(l.get("credit_amount", 0) for l in lines)
        if abs(total_debit - total_credit) > 0.01:
            raise HTTPException(status_code=400, detail="Debit must equal credit")
        
        # Delete existing lines and create new ones
        await db.fin_journal_lines.delete_many({"journal_id": journal_id})
        
        for idx, line in enumerate(lines):
            journal_line = {
                "line_id": f"{journal_id}-L{idx+1}",
                "journal_id": journal_id,
                "account_id": line.get("account_id"),
                "account_code": line.get("account_code"),
                "account_name": line.get("account_name"),
                "debit_amount": line.get("debit_amount", 0),
                "credit_amount": line.get("credit_amount", 0),
                "currency": line.get("currency", "INR"),
                "description": line.get("description", ""),
                "org_id": current_user.get("org_id")
            }
            await db.fin_journal_lines.insert_one(journal_line)
    
    update_fields = {
        "journal_date": data.get("journal_date", existing.get("journal_date")),
        "source_module": data.get("source_module", existing.get("source_module")),
        "description": data.get("description", existing.get("description")),
        "period": data.get("period", existing.get("period")),
        "total_debit": sum(l.get("debit_amount", 0) for l in lines) if lines else existing.get("total_debit"),
        "total_credit": sum(l.get("credit_amount", 0) for l in lines) if lines else existing.get("total_credit"),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_journal_entries.update_one(
        {"journal_id": journal_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_journal_entries.find_one({"journal_id": journal_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/tax/transactions/{tax_txn_id}")
async def update_tax_transaction(tax_txn_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a tax transaction"""
    db = get_db()
    
    existing = await db.fin_tax_transactions.find_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tax transaction not found")
    
    update_fields = {
        "tax_type": data.get("tax_type", existing.get("tax_type")),
        "taxable_amount": data.get("taxable_amount", existing.get("taxable_amount")),
        "tax_rate": data.get("tax_rate", existing.get("tax_rate")),
        "tax_amount": data.get("tax_amount", existing.get("tax_amount")),
        "jurisdiction": data.get("jurisdiction", existing.get("jurisdiction")),
        "status": data.get("status", existing.get("status")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.fin_tax_transactions.update_one(
        {"tax_txn_id": tax_txn_id},
        {"$set": update_fields}
    )
    
    updated = await db.fin_tax_transactions.find_one({"tax_txn_id": tax_txn_id}, {"_id": 0})
    return {"success": True, "data": updated}


# ==================== DELETE ENDPOINTS (Soft Delete) ====================

@router.delete("/billing/{billing_id}")
async def delete_billing_record(billing_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a billing record (only draft or cancelled status)"""
    db = get_db()
    
    existing = await db.fin_billing_records.find_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Billing record not found")
    
    if existing.get("status") not in ["draft", "cancelled"]:
        raise HTTPException(status_code=400, detail="Only draft or cancelled billing records can be deleted")
    
    await db.fin_billing_records.update_one(
        {"billing_id": billing_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Billing record deleted"}


@router.delete("/receivables/{receivable_id}")
async def delete_receivable(receivable_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a receivable (only open status with zero payments)"""
    db = get_db()
    
    existing = await db.fin_receivables.find_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Receivable not found")
    
    if existing.get("status") != "open":
        raise HTTPException(status_code=400, detail="Only open receivables can be deleted")
    
    if existing.get("invoice_amount", 0) != existing.get("outstanding_amount", 0):
        raise HTTPException(status_code=400, detail="Cannot delete receivable with partial payments")
    
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Receivable deleted"}


@router.delete("/payables/{payable_id}")
async def delete_payable(payable_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a payable (only open status)"""
    db = get_db()
    
    existing = await db.fin_payables.find_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Payable not found")
    
    if existing.get("status") not in ["open", "disputed"]:
        raise HTTPException(status_code=400, detail="Only open or disputed payables can be deleted")
    
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Payable deleted"}


@router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete an asset (only draft status before activation)"""
    db = get_db()
    
    existing = await db.fin_assets.find_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    if existing.get("status") == "active" and existing.get("accumulated_depreciation", 0) > 0:
        raise HTTPException(status_code=400, detail="Cannot delete asset with depreciation history")
    
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Asset deleted"}


@router.delete("/ledger/journals/{journal_id}")
async def delete_journal_entry(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a journal entry (only draft status)"""
    db = get_db()
    
    existing = await db.fin_journal_entries.find_one(
        {"journal_id": journal_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    
    if existing.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft journal entries can be deleted. Posted entries must be reversed.")
    
    # Delete journal lines
    await db.fin_journal_lines.delete_many({"journal_id": journal_id})
    
    # Soft delete journal header
    await db.fin_journal_entries.update_one(
        {"journal_id": journal_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Journal entry deleted"}


@router.delete("/tax/transactions/{tax_txn_id}")
async def delete_tax_transaction(tax_txn_id: str, current_user: dict = Depends(get_current_user)):
    """Soft delete a tax transaction (only pending status)"""
    db = get_db()
    
    existing = await db.fin_tax_transactions.find_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Tax transaction not found")
    
    if existing.get("status") != "pending":
        raise HTTPException(status_code=400, detail="Only pending tax transactions can be deleted")
    
    await db.fin_tax_transactions.update_one(
        {"tax_txn_id": tax_txn_id},
        {"$set": {
            "deleted": True,
            "deleted_at": datetime.now(timezone.utc).isoformat(),
            "deleted_by": current_user.get("user_id")
        }}
    )
    return {"success": True, "message": "Tax transaction deleted"}


# ==================== AUTOMATED TAX CALCULATION ====================

async def auto_create_tax_transaction(db, org_id: str, user_id: str, source_type: str, source_id: str, 
                                       taxable_amount: float, tax_code: str, tax_amount: float, 
                                       direction: str, party_name: str = None):
    """Internal helper: Auto-create tax transaction when billing/payable is created"""
    
    # Determine tax type from tax code
    tax_type = "GST"
    tax_rate = 18
    jurisdiction = "IN"
    
    if tax_code:
        if "GST" in tax_code.upper():
            tax_type = "GST"
            if "18" in tax_code:
                tax_rate = 18
            elif "12" in tax_code:
                tax_rate = 12
            elif "5" in tax_code:
                tax_rate = 5
            elif "0" in tax_code:
                tax_rate = 0
        elif "VAT" in tax_code.upper():
            tax_type = "VAT"
            tax_rate = 20
            jurisdiction = "UK"
    
    tax_txn = {
        "tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}",
        "tax_type": tax_type,
        "direction": direction,  # "output" for sales, "input" for purchases
        "source_type": source_type,  # "billing" or "payable"
        "source_id": source_id,
        "party_name": party_name,
        "taxable_amount": taxable_amount,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "jurisdiction": jurisdiction,
        "filing_period": datetime.now().strftime("%Y-%m"),
        "status": "pending",
        "auto_generated": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user_id,
        "org_id": org_id
    }
    
    await db.fin_tax_transactions.insert_one(tax_txn)
    return tax_txn


@router.post("/billing/with-tax")
async def create_billing_with_auto_tax(data: dict, current_user: dict = Depends(get_current_user)):
    """Create billing record with automatic tax transaction"""
    db = get_db()
    org_id = current_user.get("org_id")
    user_id = current_user.get("user_id")
    
    billing_id = f"BIL-{uuid.uuid4().hex[:8].upper()}"
    
    billing_record = {
        "billing_id": billing_id,
        "billing_type": data.get("billing_type", "milestone"),
        "source_event_id": data.get("source_event_id"),
        "contract_id": data.get("contract_id"),
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "billing_period": data.get("billing_period"),
        "currency": data.get("currency", "INR"),
        "gross_amount": data.get("gross_amount", 0),
        "tax_code": data.get("tax_code", "GST-18"),
        "tax_amount": data.get("tax_amount", 0),
        "net_amount": data.get("net_amount", 0),
        "description": data.get("description", ""),
        "line_items": data.get("line_items", []),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user_id,
        "org_id": org_id
    }
    
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    
    # Auto-create output tax transaction
    tax_amount = data.get("tax_amount", 0)
    if tax_amount > 0:
        tax_txn = await auto_create_tax_transaction(
            db=db,
            org_id=org_id,
            user_id=user_id,
            source_type="billing",
            source_id=billing_id,
            taxable_amount=data.get("gross_amount", 0),
            tax_code=data.get("tax_code", "GST-18"),
            tax_amount=tax_amount,
            direction="output",
            party_name=data.get("party_name")
        )
        tax_txn.pop("_id", None)
        return {"success": True, "data": billing_record, "tax_transaction": tax_txn}
    
    return {"success": True, "data": billing_record}


@router.post("/payables/with-tax")
async def create_payable_with_auto_tax(data: dict, current_user: dict = Depends(get_current_user)):
    """Create payable with automatic input tax transaction (for ITC claim)"""
    db = get_db()
    org_id = current_user.get("org_id")
    user_id = current_user.get("user_id")
    
    payable_id = f"PAY-{uuid.uuid4().hex[:8].upper()}"
    
    # Calculate amounts from line items
    line_items = data.get("line_items", [])
    gross_amount = sum(item.get("amount", 0) for item in line_items)
    tax_rate = data.get("tax_rate", 18) / 100
    tax_amount = gross_amount * tax_rate
    net_amount = gross_amount + tax_amount
    
    payable = {
        "payable_id": payable_id,
        "vendor_id": data.get("vendor_id"),
        "vendor_name": data.get("vendor_name"),
        "bill_number": data.get("bill_number", f"VBILL-{uuid.uuid4().hex[:6].upper()}"),
        "bill_date": data.get("bill_date", datetime.now(timezone.utc).isoformat()),
        "due_date": data.get("due_date"),
        "bill_amount": net_amount,
        "outstanding_amount": net_amount,
        "gross_amount": gross_amount,
        "tax_code": data.get("tax_code", "GST-18"),
        "tax_amount": tax_amount,
        "currency": data.get("currency", "INR"),
        "payment_terms": data.get("payment_terms", "net_30"),
        "line_items": line_items,
        "status": "open",
        "match_status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": user_id,
        "org_id": org_id
    }
    
    await db.fin_payables.insert_one(payable)
    payable.pop("_id", None)
    
    # Auto-create input tax transaction for ITC claim
    if tax_amount > 0:
        tax_txn = await auto_create_tax_transaction(
            db=db,
            org_id=org_id,
            user_id=user_id,
            source_type="payable",
            source_id=payable_id,
            taxable_amount=gross_amount,
            tax_code=data.get("tax_code", "GST-18"),
            tax_amount=tax_amount,
            direction="input",
            party_name=data.get("vendor_name")
        )
        tax_txn.pop("_id", None)
        return {"success": True, "data": payable, "tax_transaction": tax_txn}
    
    return {"success": True, "data": payable}


@router.get("/tax/auto-summary")
async def get_auto_tax_summary(period: str = None, current_user: dict = Depends(get_current_user)):
    """Get summary of auto-generated tax transactions for compliance"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    if not period:
        period = datetime.now().strftime("%Y-%m")
    
    # Get output tax (from billing)
    output_pipeline = [
        {"$match": {"org_id": org_id, "direction": "output", "auto_generated": True, "filing_period": period}},
        {"$group": {
            "_id": "$tax_type",
            "total_taxable": {"$sum": "$taxable_amount"},
            "total_tax": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    output_taxes = await db.fin_tax_transactions.aggregate(output_pipeline).to_list(length=100)
    
    # Get input tax (from payables - ITC eligible)
    input_pipeline = [
        {"$match": {"org_id": org_id, "direction": "input", "auto_generated": True, "filing_period": period}},
        {"$group": {
            "_id": "$tax_type",
            "total_taxable": {"$sum": "$taxable_amount"},
            "total_tax": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    input_taxes = await db.fin_tax_transactions.aggregate(input_pipeline).to_list(length=100)
    
    total_output = sum(t.get("total_tax", 0) for t in output_taxes)
    total_input = sum(t.get("total_tax", 0) for t in input_taxes)
    net_payable = total_output - total_input
    
    return {
        "success": True,
        "data": {
            "period": period,
            "output_tax": {
                "total": total_output,
                "breakdown": output_taxes
            },
            "input_tax": {
                "total": total_input,
                "itc_available": total_input,
                "breakdown": input_taxes
            },
            "net_payable": net_payable,
            "compliance_status": "ready" if net_payable >= 0 else "itc_excess"
        }
    }


# ==================== MODULE 7: CLOSE ====================

@router.get("/close/periods")
async def get_accounting_periods(current_user: dict = Depends(get_current_user)):
    """Get accounting periods"""
    db = get_db()
    cursor = db.fin_accounting_periods.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    ).sort("start_date", -1)
    periods = await cursor.to_list(length=100)
    return {"success": True, "data": periods}


@router.post("/close/periods")
async def create_accounting_period(data: dict, current_user: dict = Depends(get_current_user)):
    """Create an accounting period"""
    db = get_db()
    period = {
        "period_id": f"PRD-{uuid.uuid4().hex[:8].upper()}",
        "period": data.get("period"),  # e.g., "2025-01"
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "status": "open",  # open | closing | closed
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_accounting_periods.insert_one(period)
    period.pop("_id", None)
    return {"success": True, "data": period}


@router.get("/close/checklist")
async def get_close_checklist(period: str, current_user: dict = Depends(get_current_user)):
    """Get period close checklist"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Check each sub-ledger
    checklist = {
        "billing": {
            "name": "Billing",
            "checks": [
                {"name": "No unissued approved invoices", "passed": True},
            ]
        },
        "receivables": {
            "name": "Receivables",
            "checks": [
                {"name": "All cash applied", "passed": True},
                {"name": "No unapplied receipts pending review", "passed": True}
            ]
        },
        "payables": {
            "name": "Payables",
            "checks": [
                {"name": "All approved bills posted", "passed": True},
                {"name": "No unmatched high-value invoices", "passed": True}
            ]
        },
        "assets": {
            "name": "Assets",
            "checks": [
                {"name": "Depreciation run completed", "passed": True}
            ]
        },
        "tax": {
            "name": "Tax",
            "checks": [
                {"name": "Tax calculated for all taxable transactions", "passed": True}
            ]
        },
        "ledger": {
            "name": "Ledger",
            "checks": [
                {"name": "Trial balance balanced", "passed": True}
            ]
        }
    }
    
    # Check for unissued approved invoices
    unissued = await db.fin_billing_records.count_documents(
        {"org_id": org_id, "status": "approved"}
    )
    checklist["billing"]["checks"][0]["passed"] = unissued == 0
    checklist["billing"]["checks"][0]["count"] = unissued
    
    # Check for unapplied receipts
    unapplied = await db.fin_payment_receipts.count_documents(
        {"org_id": org_id, "status": "unapplied"}
    )
    checklist["receivables"]["checks"][0]["passed"] = unapplied == 0
    checklist["receivables"]["checks"][0]["count"] = unapplied
    
    # Check for unmatched payables
    unmatched = await db.fin_payables.count_documents(
        {"org_id": org_id, "match_status": "pending"}
    )
    checklist["payables"]["checks"][1]["passed"] = unmatched == 0
    checklist["payables"]["checks"][1]["count"] = unmatched
    
    # All checks passed?
    all_passed = all(
        check["passed"] 
        for module in checklist.values() 
        for check in module["checks"]
    )
    
    return {"success": True, "data": {"period": period, "checklist": checklist, "ready_to_close": all_passed}}


@router.get("/close/reconciliations")
async def get_reconciliations(period: str, current_user: dict = Depends(get_current_user)):
    """Get sub-ledger reconciliations"""
    db = get_db()
    cursor = db.fin_reconciliations.find(
        {"org_id": current_user.get("org_id"), "period": period},
        {"_id": 0}
    )
    reconciliations = await cursor.to_list(length=100)
    return {"success": True, "data": reconciliations}


@router.post("/close/reconciliations")
async def create_reconciliation(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a reconciliation record"""
    db = get_db()
    reconciliation = {
        "reconciliation_id": f"REC-{uuid.uuid4().hex[:8].upper()}",
        "period": data.get("period"),
        "source": data.get("source"),  # e.g., "AR Sub-ledger"
        "target": data.get("target"),  # e.g., "AR Control Account"
        "source_amount": data.get("source_amount", 0),
        "target_amount": data.get("target_amount", 0),
        "difference_amount": data.get("source_amount", 0) - data.get("target_amount", 0),
        "status": "matched" if data.get("source_amount", 0) == data.get("target_amount", 0) else "mismatch",
        "notes": data.get("notes", ""),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_reconciliations.insert_one(reconciliation)
    reconciliation.pop("_id", None)
    return {"success": True, "data": reconciliation}


@router.post("/close/adjustments")
async def create_closing_adjustment(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a closing adjustment"""
    db = get_db()
    adjustment = {
        "adjustment_id": f"ADJ-{uuid.uuid4().hex[:8].upper()}",
        "period": data.get("period"),
        "journal_id": data.get("journal_id"),
        "adjustment_type": data.get("adjustment_type"),  # accrual | provision | reclassification
        "reason": data.get("reason", ""),
        "amount": data.get("amount", 0),
        "approved_by": None,
        "status": "pending",  # pending | approved | posted
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_closing_adjustments.insert_one(adjustment)
    adjustment.pop("_id", None)
    return {"success": True, "data": adjustment}


@router.put("/close/periods/{period_id}/start-close")
async def start_period_close(period_id: str, current_user: dict = Depends(get_current_user)):
    """Start period close process"""
    db = get_db()
    result = await db.fin_accounting_periods.update_one(
        {"period_id": period_id, "org_id": current_user.get("org_id"), "status": "open"},
        {"$set": {
            "status": "closing",
            "close_started_at": datetime.now(timezone.utc).isoformat(),
            "close_started_by": current_user.get("user_id")
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Period not found or not open")
    return {"success": True, "message": "Period close started"}


@router.put("/close/periods/{period_id}/complete-close")
async def complete_period_close(period_id: str, current_user: dict = Depends(get_current_user)):
    """Complete period close and lock books"""
    db = get_db()
    
    # Get period
    period = await db.fin_accounting_periods.find_one(
        {"period_id": period_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not period or period.get("status") != "closing":
        raise HTTPException(status_code=400, detail="Period not in closing state")
    
    # Verify checklist
    checklist = await get_close_checklist(period.get("period"), current_user)
    if not checklist["data"]["ready_to_close"]:
        raise HTTPException(status_code=400, detail="Close checklist not complete")
    
    # Close the period
    await db.fin_accounting_periods.update_one(
        {"period_id": period_id},
        {"$set": {
            "status": "closed",
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "closed_by": current_user.get("user_id")
        }}
    )
    
    return {"success": True, "message": "Period closed successfully"}


# ==================== SEED DATA ====================

@router.post("/seed")
async def seed_finance_data(current_user: dict = Depends(get_current_user)):
    """Seed sample IB Finance data"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Clear existing data
    collections = [
        "fin_billing_records", "fin_receivables", "fin_payables", "fin_payment_receipts",
        "fin_cash_applications", "fin_accounts", "fin_journal_entries", "fin_journal_lines",
        "fin_assets", "fin_depreciation_schedules", "fin_tax_transactions",
        "fin_accounting_periods", "fin_reconciliations"
    ]
    for coll in collections:
        await db[coll].delete_many({"org_id": org_id})
    
    # Seed Chart of Accounts
    accounts = [
        {"account_id": "ACC-1000", "account_code": "1000", "account_name": "Cash & Bank", "account_type": "asset", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-1100", "account_code": "1100", "account_name": "Accounts Receivable", "account_type": "asset", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-1200", "account_code": "1200", "account_name": "Fixed Assets", "account_type": "asset", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-1210", "account_code": "1210", "account_name": "Accumulated Depreciation", "account_type": "asset", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-2000", "account_code": "2000", "account_name": "Accounts Payable", "account_type": "liability", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-2100", "account_code": "2100", "account_name": "GST Payable", "account_type": "liability", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-2200", "account_code": "2200", "account_name": "GST Receivable (Input)", "account_type": "asset", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-3000", "account_code": "3000", "account_name": "Share Capital", "account_type": "equity", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-3100", "account_code": "3100", "account_name": "Retained Earnings", "account_type": "equity", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-4000", "account_code": "4000", "account_name": "Revenue - Services", "account_type": "income", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-4100", "account_code": "4100", "account_name": "Revenue - Products", "account_type": "income", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-5000", "account_code": "5000", "account_name": "Cost of Services", "account_type": "expense", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-5100", "account_code": "5100", "account_name": "Salaries & Wages", "account_type": "expense", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-5200", "account_code": "5200", "account_name": "Rent & Utilities", "account_type": "expense", "is_active": True, "org_id": org_id},
        {"account_id": "ACC-5300", "account_code": "5300", "account_name": "Depreciation Expense", "account_type": "expense", "is_active": True, "org_id": org_id},
    ]
    await db.fin_accounts.insert_many(accounts)
    
    # Seed Billing Records
    billing_records = [
        {
            "billing_id": "BIL-001",
            "billing_type": "milestone",
            "contract_id": "CTR-2025-001",
            "party_id": "CUST-001",
            "party_name": "Tata Motors Ltd",
            "billing_period": "2025-01",
            "currency": "INR",
            "gross_amount": 500000,
            "tax_code": "GST-18",
            "tax_amount": 90000,
            "net_amount": 590000,
            "description": "ERP Implementation - Phase 1 Milestone",
            "status": "issued",
            "invoice_number": "INV-202501-0001",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "billing_id": "BIL-002",
            "billing_type": "subscription",
            "contract_id": "CTR-2025-002",
            "party_id": "CUST-002",
            "party_name": "Reliance Industries",
            "billing_period": "2025-01",
            "currency": "INR",
            "gross_amount": 100000,
            "tax_code": "GST-18",
            "tax_amount": 18000,
            "net_amount": 118000,
            "description": "Monthly IT Support - January 2025",
            "status": "approved",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "billing_id": "BIL-003",
            "billing_type": "usage",
            "contract_id": "CTR-2025-003",
            "party_id": "CUST-003",
            "party_name": "Infosys Limited",
            "billing_period": "2025-01",
            "currency": "INR",
            "gross_amount": 250000,
            "tax_code": "GST-18",
            "tax_amount": 45000,
            "net_amount": 295000,
            "description": "Cloud Usage - January 2025",
            "status": "draft",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_billing_records.insert_many(billing_records)
    
    # Seed Receivables
    receivables = [
        {
            "receivable_id": "RCV-001",
            "invoice_id": "BIL-001",
            "invoice_number": "INV-202501-0001",
            "customer_id": "CUST-001",
            "customer_name": "Tata Motors Ltd",
            "invoice_date": "2025-01-15T00:00:00Z",
            "due_date": "2025-02-15T00:00:00Z",
            "invoice_amount": 590000,
            "outstanding_amount": 590000,
            "currency": "INR",
            "status": "open",
            "aging_bucket": "0-30",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_receivables.insert_many(receivables)
    
    # Seed Payables
    payables = [
        {
            "payable_id": "PAY-001",
            "vendor_id": "VND-001",
            "vendor_name": "Tech Solutions Inc",
            "bill_number": "VB-2025-0045",
            "bill_date": "2025-01-10T00:00:00Z",
            "due_date": "2025-02-10T00:00:00Z",
            "bill_amount": 150000,
            "outstanding_amount": 150000,
            "currency": "INR",
            "status": "open",
            "match_status": "matched",
            "aging_bucket": "0-30",
            "approved_for_payment": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "payable_id": "PAY-002",
            "vendor_id": "VND-002",
            "vendor_name": "Office Supplies Co",
            "bill_number": "VB-2025-0089",
            "bill_date": "2024-12-15T00:00:00Z",
            "due_date": "2025-01-15T00:00:00Z",
            "bill_amount": 25000,
            "outstanding_amount": 25000,
            "currency": "INR",
            "status": "overdue",
            "match_status": "pending",
            "aging_bucket": "31-60",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_payables.insert_many(payables)
    
    # Seed Assets
    assets = [
        {
            "asset_id": "AST-001",
            "asset_name": "Dell Server Rack",
            "asset_type": "tangible",
            "asset_category": "IT Equipment",
            "acquisition_date": "2024-06-01T00:00:00Z",
            "capitalization_value": 500000,
            "useful_life_months": 60,
            "depreciation_method": "straight_line",
            "residual_value": 50000,
            "accumulated_depreciation": 52500,
            "net_book_value": 447500,
            "status": "active",
            "serial_number": "DELL-SRV-2024-001",
            "location": "Data Center - Mumbai",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "asset_id": "AST-002",
            "asset_name": "ERP Software License",
            "asset_type": "intangible",
            "asset_category": "Software",
            "acquisition_date": "2024-01-01T00:00:00Z",
            "capitalization_value": 1200000,
            "useful_life_months": 36,
            "depreciation_method": "straight_line",
            "residual_value": 0,
            "accumulated_depreciation": 400000,
            "net_book_value": 800000,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_assets.insert_many(assets)
    
    # Seed Accounting Periods
    periods = [
        {
            "period_id": "PRD-202501",
            "period": "2025-01",
            "start_date": "2025-01-01T00:00:00Z",
            "end_date": "2025-01-31T23:59:59Z",
            "status": "open",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "period_id": "PRD-202412",
            "period": "2024-12",
            "start_date": "2024-12-01T00:00:00Z",
            "end_date": "2024-12-31T23:59:59Z",
            "status": "closed",
            "closed_at": "2025-01-05T00:00:00Z",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_accounting_periods.insert_many(periods)
    
    # Seed Tax Transactions
    tax_transactions = [
        {
            "tax_txn_id": "TAX-001",
            "source_module": "billing",
            "source_reference_id": "BIL-001",
            "tax_type": "GST",
            "taxable_amount": 500000,
            "tax_rate": 18,
            "tax_amount": 90000,
            "jurisdiction": "Maharashtra",
            "direction": "output",
            "status": "final",
            "period": "2025-01",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        },
        {
            "tax_txn_id": "TAX-002",
            "source_module": "payables",
            "source_reference_id": "PAY-001",
            "tax_type": "GST",
            "taxable_amount": 127119,
            "tax_rate": 18,
            "tax_amount": 22881,
            "jurisdiction": "Maharashtra",
            "direction": "input",
            "status": "final",
            "period": "2025-01",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
    ]
    await db.fin_tax_transactions.insert_many(tax_transactions)
    
    return {"success": True, "message": "IB Finance data seeded successfully"}

@router.post("/integrate/contract-handoff")
async def create_billing_from_contract(data: dict, current_user: dict = Depends(get_current_user)):
    """Create billing record from Commerce contract handoff"""
    db = get_db()
    
    contract_id = data.get("contract_id")
    party_id = data.get("party_id")
    party_name = data.get("party_name")
    amount = data.get("amount", 0)
    tax_rate = data.get("tax_rate", 18)
    description = data.get("description", "")
    billing_type = data.get("billing_type", "milestone")
    
    tax_amount = amount * (tax_rate / 100)
    net_amount = amount + tax_amount
    
    billing_record = {
        "billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}",
        "billing_type": billing_type,
        "source_event_id": data.get("source_event_id"),
        "contract_id": contract_id,
        "party_id": party_id,
        "party_name": party_name,
        "billing_period": datetime.now().strftime("%Y-%m"),
        "currency": data.get("currency", "INR"),
        "gross_amount": amount,
        "tax_code": f"GST-{int(tax_rate)}",
        "tax_amount": tax_amount,
        "net_amount": net_amount,
        "description": description,
        "line_items": data.get("line_items", []),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id"),
        "auto_created": True,
        "source": "commerce_handoff"
    }
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    return {"success": True, "data": billing_record, "message": "Billing record created from contract handoff"}


@router.post("/integrate/milestone-complete")
async def create_billing_from_milestone(data: dict, current_user: dict = Depends(get_current_user)):
    """Create billing record from Operations milestone completion"""
    db = get_db()
    
    project_id = data.get("project_id")
    milestone_id = data.get("milestone_id")
    milestone_name = data.get("milestone_name")
    amount = data.get("amount", 0)
    party_id = data.get("party_id")
    party_name = data.get("party_name")
    contract_id = data.get("contract_id")
    
    tax_rate = data.get("tax_rate", 18)
    tax_amount = amount * (tax_rate / 100)
    net_amount = amount + tax_amount
    
    billing_record = {
        "billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}",
        "billing_type": "milestone",
        "source_event_id": f"MILE-{milestone_id}",
        "contract_id": contract_id,
        "party_id": party_id,
        "party_name": party_name,
        "billing_period": datetime.now().strftime("%Y-%m"),
        "currency": data.get("currency", "INR"),
        "gross_amount": amount,
        "tax_code": f"GST-{int(tax_rate)}",
        "tax_amount": tax_amount,
        "net_amount": net_amount,
        "description": f"Milestone: {milestone_name} (Project: {project_id})",
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id"),
        "auto_created": True,
        "source": "operations_milestone"
    }
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    return {"success": True, "data": billing_record}


@router.post("/integrate/vendor-invoice")
async def create_payable_from_vendor(data: dict, current_user: dict = Depends(get_current_user)):
    """Create payable from vendor invoice (Procurement integration)"""
    db = get_db()
    
    payable = {
        "payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": data.get("vendor_id"),
        "vendor_name": data.get("vendor_name"),
        "bill_number": data.get("bill_number"),
        "bill_date": data.get("bill_date", datetime.now(timezone.utc).isoformat()),
        "due_date": data.get("due_date"),
        "bill_amount": data.get("bill_amount", 0),
        "outstanding_amount": data.get("bill_amount", 0),
        "currency": data.get("currency", "INR"),
        "status": "open",
        "source_reference": data.get("source_reference", "procurement"),
        "source_reference_id": data.get("po_id"),
        "match_status": "pending",
        "line_items": data.get("line_items", []),
        "aging_bucket": "0-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id"),
        "auto_created": True,
        "source": "procurement"
    }
    await db.fin_payables.insert_one(payable)
    payable.pop("_id", None)
    return {"success": True, "data": payable}


# ==================== NOTIFICATIONS & ALERTS ====================

@router.get("/alerts")
async def get_finance_alerts(current_user: dict = Depends(get_current_user)):
    """Get real-time finance alerts for SLA breaches"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    alerts = []
    
    # Check for overdue receivables
    overdue_rcv = await db.fin_receivables.count_documents({
        "org_id": org_id, 
        "status": "overdue"
    })
    if overdue_rcv > 0:
        alerts.append({
            "alert_id": "ALERT-RCV-OVERDUE",
            "type": "warning",
            "module": "receivables",
            "title": "Overdue Receivables",
            "message": f"{overdue_rcv} receivable(s) are overdue",
            "count": overdue_rcv,
            "action_url": "/ib-finance/receivables?status=overdue"
        })
    
    # Check for overdue payables
    overdue_pay = await db.fin_payables.count_documents({
        "org_id": org_id, 
        "status": "overdue"
    })
    if overdue_pay > 0:
        alerts.append({
            "alert_id": "ALERT-PAY-OVERDUE",
            "type": "critical",
            "module": "payables",
            "title": "Overdue Payables",
            "message": f"{overdue_pay} payable(s) are overdue - immediate attention required",
            "count": overdue_pay,
            "action_url": "/ib-finance/payables?status=overdue"
        })
    
    # Check for unmatched payables
    unmatched = await db.fin_payables.count_documents({
        "org_id": org_id,
        "match_status": "pending"
    })
    if unmatched > 0:
        alerts.append({
            "alert_id": "ALERT-PAY-UNMATCHED",
            "type": "info",
            "module": "payables",
            "title": "Unmatched Bills",
            "message": f"{unmatched} bill(s) pending matching",
            "count": unmatched,
            "action_url": "/ib-finance/payables?match_status=pending"
        })
    
    # Check for pending billing approvals
    pending_billing = await db.fin_billing_records.count_documents({
        "org_id": org_id,
        "status": "draft"
    })
    if pending_billing > 0:
        alerts.append({
            "alert_id": "ALERT-BILL-PENDING",
            "type": "info",
            "module": "billing",
            "title": "Pending Billing",
            "message": f"{pending_billing} billing record(s) awaiting approval",
            "count": pending_billing,
            "action_url": "/ib-finance/billing?status=draft"
        })
    
    # Check for unapplied payments
    unapplied = await db.fin_payment_receipts.count_documents({
        "org_id": org_id,
        "status": "unapplied"
    })
    if unapplied > 0:
        alerts.append({
            "alert_id": "ALERT-PAYMENT-UNAPPLIED",
            "type": "warning",
            "module": "receivables",
            "title": "Unapplied Payments",
            "message": f"{unapplied} payment(s) need to be applied to invoices",
            "count": unapplied,
            "action_url": "/ib-finance/receivables"
        })
    
    return {"success": True, "data": alerts, "count": len(alerts)}
