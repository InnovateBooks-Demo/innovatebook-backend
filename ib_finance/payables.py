"""
IB Finance - Payables Routes
Handles accounts payable, vendor invoices, and payment processing
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Payables"])


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
    """Get payables dashboard"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {
            "_id": "$status",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    status_totals = await db.fin_payables.aggregate(pipeline).to_list(length=10)
    
    aging_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["pending", "approved", "overdue"]}}},
        {"$group": {
            "_id": "$aging_bucket",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    aging_totals = await db.fin_payables.aggregate(aging_pipeline).to_list(length=10)
    
    total_payable = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] in ["pending", "approved", "overdue"])
    total_overdue = sum(s.get("total_amount", 0) for s in status_totals if s["_id"] == "overdue")
    
    return {
        "success": True,
        "data": {
            "total_payable": total_payable,
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
    
    payments = await db.fin_vendor_payments.find(
        {"payable_id": payable_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": {**payable, "payments": payments}}


@router.post("/payables")
async def create_payable(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new payable"""
    db = get_db()
    payable = {
        "payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": data.get("vendor_id"),
        "vendor_name": data.get("vendor_name"),
        "invoice_number": data.get("invoice_number"),
        "invoice_date": data.get("invoice_date"),
        "due_date": data.get("due_date"),
        "po_number": data.get("po_number"),
        "currency": data.get("currency", "INR"),
        "gross_amount": data.get("gross_amount", 0),
        "tax_amount": data.get("tax_amount", 0),
        "net_amount": data.get("net_amount", 0),
        "outstanding_amount": data.get("net_amount", 0),
        "line_items": data.get("line_items", []),
        "status": "pending",
        "three_way_match": "unmatched",
        "aging_bucket": "0-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_payables.insert_one(payable)
    payable.pop("_id", None)
    return {"success": True, "data": payable}


@router.put("/payables/{payable_id}")
async def update_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a payable"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["payable_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fin_payables.update_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payable not found")
    
    updated = await db.fin_payables.find_one({"payable_id": payable_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/payables/{payable_id}/match")
async def three_way_match(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Perform three-way match"""
    db = get_db()
    match_result = data.get("match_result", "matched")
    
    result = await db.fin_payables.update_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"$set": {
            "three_way_match": match_result,
            "matched_po": data.get("po_number"),
            "matched_grn": data.get("grn_number"),
            "match_notes": data.get("notes"),
            "matched_at": datetime.now(timezone.utc).isoformat(),
            "matched_by": current_user.get("user_id")
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Payable not found")
    return {"success": True, "message": f"Match status: {match_result}"}


@router.put("/payables/{payable_id}/approve")
async def approve_payable(payable_id: str, current_user: dict = Depends(get_current_user)):
    """Approve payable for payment"""
    db = get_db()
    result = await db.fin_payables.update_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id"), "status": "pending"},
        {"$set": {
            "status": "approved",
            "approved_by": current_user.get("user_id"),
            "approved_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payable not found or already processed")
    return {"success": True, "message": "Payable approved"}


@router.put("/payables/{payable_id}/dispute")
async def dispute_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Mark payable as disputed"""
    db = get_db()
    result = await db.fin_payables.update_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id")},
        {"$set": {
            "status": "disputed",
            "dispute_reason": data.get("reason", ""),
            "dispute_amount": data.get("amount", 0),
            "disputed_by": current_user.get("user_id"),
            "disputed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Payable not found")
    return {"success": True, "message": "Payable marked as disputed"}


@router.post("/payables/{payable_id}/pay")
async def pay_payable(payable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Record payment for payable"""
    db = get_db()
    payable = await db.fin_payables.find_one({"payable_id": payable_id}, {"_id": 0})
    if not payable or payable.get("status") not in ["approved", "partially_paid"]:
        raise HTTPException(status_code=400, detail="Payable must be approved before payment")
    
    amount = data.get("amount", 0)
    
    payment = {
        "payment_id": f"VPY-{uuid.uuid4().hex[:8].upper()}",
        "payable_id": payable_id,
        "vendor_id": payable.get("vendor_id"),
        "vendor_name": payable.get("vendor_name"),
        "payment_date": data.get("payment_date", datetime.now(timezone.utc).isoformat()),
        "amount": amount,
        "currency": payable.get("currency", "INR"),
        "payment_mode": data.get("payment_mode", "bank"),
        "reference_number": data.get("reference_number"),
        "bank_account_id": data.get("bank_account_id"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_vendor_payments.insert_one(payment)
    
    new_outstanding = payable.get("outstanding_amount", 0) - amount
    new_status = "paid" if new_outstanding <= 0 else "partially_paid"
    await db.fin_payables.update_one(
        {"payable_id": payable_id},
        {"$set": {"outstanding_amount": max(0, new_outstanding), "status": new_status}}
    )
    
    payment.pop("_id", None)
    return {"success": True, "data": payment}


@router.delete("/payables/{payable_id}")
async def delete_payable(payable_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a payable"""
    db = get_db()
    result = await db.fin_payables.delete_one(
        {"payable_id": payable_id, "org_id": current_user.get("org_id"), "status": "pending"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Payable not found or cannot be deleted")
    return {"success": True, "message": "Payable deleted"}


@router.post("/payables/with-tax")
async def create_payable_with_tax(data: dict, current_user: dict = Depends(get_current_user)):
    """Create payable with automatic tax calculation"""
    db = get_db()
    
    gross_amount = data.get("gross_amount", 0)
    tax_rate = data.get("tax_rate", 18)
    tax_amount = round(gross_amount * tax_rate / 100, 2)
    net_amount = gross_amount + tax_amount
    
    payable = {
        "payable_id": f"PAY-{uuid.uuid4().hex[:8].upper()}",
        "vendor_id": data.get("vendor_id"),
        "vendor_name": data.get("vendor_name"),
        "invoice_number": data.get("invoice_number"),
        "invoice_date": data.get("invoice_date"),
        "due_date": data.get("due_date"),
        "po_number": data.get("po_number"),
        "currency": data.get("currency", "INR"),
        "gross_amount": gross_amount,
        "tax_rate": tax_rate,
        "tax_code": data.get("tax_code", "GST18"),
        "tax_amount": tax_amount,
        "net_amount": net_amount,
        "outstanding_amount": net_amount,
        "line_items": data.get("line_items", []),
        "status": "pending",
        "three_way_match": "unmatched",
        "aging_bucket": "0-30",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    
    await db.fin_payables.insert_one(payable)
    payable.pop("_id", None)
    
    # Create tax transaction (input credit)
    tax_txn = {
        "tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}",
        "source_type": "payable",
        "source_id": payable["payable_id"],
        "transaction_date": datetime.now(timezone.utc).isoformat(),
        "tax_type": "GST",
        "tax_code": payable["tax_code"],
        "taxable_amount": gross_amount,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "direction": "input",
        "status": "pending",
        "party_id": data.get("vendor_id"),
        "party_name": data.get("vendor_name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_tax_transactions.insert_one(tax_txn)
    
    return {"success": True, "data": payable, "tax_transaction": tax_txn["tax_txn_id"]}
