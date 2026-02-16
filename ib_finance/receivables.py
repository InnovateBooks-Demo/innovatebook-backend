"""
IB Finance - Receivables Routes
Handles accounts receivable, cash applications, and collections
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Receivables"])


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
    
    pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {
            "_id": "$status",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    status_totals = await db.fin_receivables.aggregate(pipeline).to_list(length=10)
    
    aging_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["open", "partially_paid", "overdue"]}}},
        {"$group": {
            "_id": "$aging_bucket",
            "total_amount": {"$sum": "$outstanding_amount"},
            "count": {"$sum": 1}
        }}
    ]
    aging_totals = await db.fin_receivables.aggregate(aging_pipeline).to_list(length=10)
    
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
        "payment_mode": data.get("payment_mode", "bank"),
        "reference_number": data.get("reference_number"),
        "bank_account_id": data.get("bank_account_id"),
        "status": "unapplied",
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
    
    receipt = await db.fin_payment_receipts.find_one({"receipt_id": receipt_id}, {"_id": 0})
    if not receipt or receipt.get("unapplied_amount", 0) < amount:
        raise HTTPException(status_code=400, detail="Insufficient unapplied amount")
    
    receivable = await db.fin_receivables.find_one({"receivable_id": receivable_id}, {"_id": 0})
    if not receivable or receivable.get("outstanding_amount", 0) < amount:
        raise HTTPException(status_code=400, detail="Amount exceeds outstanding")
    
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
    
    new_unapplied = receipt.get("unapplied_amount", 0) - amount
    receipt_status = "applied" if new_unapplied == 0 else "partially_applied"
    await db.fin_payment_receipts.update_one(
        {"receipt_id": receipt_id},
        {"$set": {"unapplied_amount": new_unapplied, "status": receipt_status}}
    )
    
    new_outstanding = receivable.get("outstanding_amount", 0) - amount
    receivable_status = "paid" if new_outstanding == 0 else "partially_paid"
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id},
        {"$set": {"outstanding_amount": new_outstanding, "status": receivable_status}}
    )
    
    return {"success": True, "message": "Cash applied successfully"}


@router.put("/receivables/{receivable_id}")
async def update_receivable(receivable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a receivable"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["receivable_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fin_receivables.update_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Receivable not found")
    
    updated = await db.fin_receivables.find_one({"receivable_id": receivable_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/receivables/{receivable_id}/write-off")
async def write_off_receivable(receivable_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Write off a receivable"""
    db = get_db()
    
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
    
    await db.fin_receivables.update_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id")},
        {"$set": {"status": "written_off", "written_off_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Receivable written off"}


@router.delete("/receivables/{receivable_id}")
async def delete_receivable(receivable_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a receivable"""
    db = get_db()
    result = await db.fin_receivables.delete_one(
        {"receivable_id": receivable_id, "org_id": current_user.get("org_id"), "status": "open"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Receivable not found or cannot be deleted")
    return {"success": True, "message": "Receivable deleted"}
