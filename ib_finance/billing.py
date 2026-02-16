"""
IB Finance - Billing Routes
Handles billing records, invoice generation, and billing workflows
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Billing"])


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
        "billing_type": data.get("billing_type", "milestone"),
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
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    return {"success": True, "data": billing_record}


@router.put("/billing/{billing_id}")
async def update_billing_record(billing_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a billing record"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["billing_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["updated_by"] = current_user.get("user_id")
    
    result = await db.fin_billing_records.update_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id"), "status": "draft"},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Billing record not found or cannot be updated")
    
    updated = await db.fin_billing_records.find_one({"billing_id": billing_id}, {"_id": 0})
    return {"success": True, "data": updated}


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
    
    record = await db.fin_billing_records.find_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not record or record.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Billing must be approved before issuing")
    
    count = await db.fin_billing_records.count_documents({"org_id": current_user.get("org_id"), "invoice_number": {"$exists": True}})
    invoice_number = f"INV-{datetime.now().strftime('%Y%m')}-{str(count + 1).zfill(4)}"
    
    await db.fin_billing_records.update_one(
        {"billing_id": billing_id},
        {"$set": {
            "status": "issued",
            "invoice_number": invoice_number,
            "issued_at": datetime.now(timezone.utc).isoformat(),
            "issued_by": current_user.get("user_id")
        }}
    )
    
    receivable = {
        "receivable_id": f"RCV-{uuid.uuid4().hex[:8].upper()}",
        "invoice_id": billing_id,
        "invoice_number": invoice_number,
        "customer_id": record.get("party_id"),
        "customer_name": record.get("party_name"),
        "invoice_date": datetime.now(timezone.utc).isoformat(),
        "due_date": datetime.now(timezone.utc).isoformat(),
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


@router.delete("/billing/{billing_id}")
async def delete_billing(billing_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a billing record (only if draft)"""
    db = get_db()
    result = await db.fin_billing_records.delete_one(
        {"billing_id": billing_id, "org_id": current_user.get("org_id"), "status": "draft"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Billing record not found or cannot be deleted")
    return {"success": True, "message": "Billing record deleted"}


@router.post("/billing/with-tax")
async def create_billing_with_tax(data: dict, current_user: dict = Depends(get_current_user)):
    """Create billing record with automatic tax calculation"""
    db = get_db()
    
    gross_amount = data.get("gross_amount", 0)
    tax_rate = data.get("tax_rate", 18)
    tax_amount = round(gross_amount * tax_rate / 100, 2)
    net_amount = gross_amount + tax_amount
    
    billing_record = {
        "billing_id": f"BIL-{uuid.uuid4().hex[:8].upper()}",
        "billing_type": data.get("billing_type", "milestone"),
        "source_event_id": data.get("source_event_id"),
        "contract_id": data.get("contract_id"),
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "billing_period": data.get("billing_period"),
        "currency": data.get("currency", "INR"),
        "gross_amount": gross_amount,
        "tax_rate": tax_rate,
        "tax_code": data.get("tax_code", "GST18"),
        "tax_amount": tax_amount,
        "net_amount": net_amount,
        "description": data.get("description", ""),
        "line_items": data.get("line_items", []),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    
    await db.fin_billing_records.insert_one(billing_record)
    billing_record.pop("_id", None)
    
    # Create tax transaction
    tax_txn = {
        "tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}",
        "source_type": "billing",
        "source_id": billing_record["billing_id"],
        "transaction_date": datetime.now(timezone.utc).isoformat(),
        "tax_type": "GST",
        "tax_code": billing_record["tax_code"],
        "taxable_amount": gross_amount,
        "tax_rate": tax_rate,
        "tax_amount": tax_amount,
        "direction": "output",
        "status": "pending",
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_tax_transactions.insert_one(tax_txn)
    
    return {"success": True, "data": billing_record, "tax_transaction": tax_txn["tax_txn_id"]}
