"""
IB Finance - Period Close Routes
Handles period closing, reconciliations, and adjustments
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Period Close"])


@router.get("/close/periods")
async def get_periods(current_user: dict = Depends(get_current_user)):
    """Get accounting periods"""
    db = get_db()
    periods = await db.fin_periods.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    ).sort("period_end", -1).to_list(length=100)
    return {"success": True, "data": periods}


@router.post("/close/periods")
async def create_period(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new accounting period"""
    db = get_db()
    period = {
        "period_id": f"PER-{uuid.uuid4().hex[:8].upper()}",
        "period_name": data.get("period_name"),
        "period_type": data.get("period_type", "monthly"),  # monthly | quarterly | annual
        "period_start": data.get("period_start"),
        "period_end": data.get("period_end"),
        "fiscal_year": data.get("fiscal_year"),
        "status": "open",  # open | closing | closed | locked
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_periods.insert_one(period)
    period.pop("_id", None)
    return {"success": True, "data": period}


@router.get("/close/checklist")
async def get_close_checklist(period_id: str, current_user: dict = Depends(get_current_user)):
    """Get period close checklist"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Check various items
    unposted_journals = await db.fin_journals.count_documents(
        {"org_id": org_id, "status": "draft"}
    )
    
    unapplied_receipts = await db.fin_payment_receipts.count_documents(
        {"org_id": org_id, "status": "unapplied"}
    )
    
    unmatched_payables = await db.fin_payables.count_documents(
        {"org_id": org_id, "three_way_match": "unmatched"}
    )
    
    pending_depreciation = await db.fin_assets.count_documents(
        {"org_id": org_id, "status": "active"}
    )
    
    checklist = [
        {"item": "Post all journal entries", "status": "complete" if unposted_journals == 0 else "pending", "count": unposted_journals},
        {"item": "Apply all cash receipts", "status": "complete" if unapplied_receipts == 0 else "pending", "count": unapplied_receipts},
        {"item": "Match all payables", "status": "complete" if unmatched_payables == 0 else "pending", "count": unmatched_payables},
        {"item": "Run depreciation", "status": "pending", "count": pending_depreciation},
        {"item": "Bank reconciliation", "status": "pending", "count": 0},
        {"item": "Review trial balance", "status": "pending", "count": 0},
        {"item": "Review financial statements", "status": "pending", "count": 0}
    ]
    
    return {"success": True, "data": checklist}


@router.get("/close/reconciliations")
async def get_reconciliations(current_user: dict = Depends(get_current_user)):
    """Get bank reconciliations"""
    db = get_db()
    reconciliations = await db.fin_reconciliations.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    ).sort("reconciliation_date", -1).to_list(length=100)
    return {"success": True, "data": reconciliations}


@router.post("/close/reconciliations")
async def create_reconciliation(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a bank reconciliation"""
    db = get_db()
    
    book_balance = data.get("book_balance", 0)
    bank_balance = data.get("bank_balance", 0)
    adjustments = data.get("adjustments", [])
    total_adjustments = sum(a.get("amount", 0) for a in adjustments)
    
    reconciliation = {
        "reconciliation_id": f"REC-{uuid.uuid4().hex[:8].upper()}",
        "bank_account_id": data.get("bank_account_id"),
        "bank_account_name": data.get("bank_account_name"),
        "reconciliation_date": data.get("reconciliation_date", datetime.now(timezone.utc).isoformat()),
        "period": data.get("period"),
        "book_balance": book_balance,
        "bank_balance": bank_balance,
        "adjustments": adjustments,
        "adjusted_balance": book_balance + total_adjustments,
        "difference": bank_balance - (book_balance + total_adjustments),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_reconciliations.insert_one(reconciliation)
    reconciliation.pop("_id", None)
    return {"success": True, "data": reconciliation}


@router.post("/close/adjustments")
async def create_adjustment(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a period-end adjustment"""
    db = get_db()
    
    adjustment = {
        "adjustment_id": f"ADJ-{uuid.uuid4().hex[:8].upper()}",
        "period_id": data.get("period_id"),
        "adjustment_type": data.get("adjustment_type"),  # accrual | prepaid | depreciation | provision
        "description": data.get("description"),
        "journal_id": data.get("journal_id"),
        "amount": data.get("amount", 0),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_adjustments.insert_one(adjustment)
    adjustment.pop("_id", None)
    return {"success": True, "data": adjustment}


@router.put("/close/periods/{period_id}/start-close")
async def start_period_close(period_id: str, current_user: dict = Depends(get_current_user)):
    """Start the period close process"""
    db = get_db()
    result = await db.fin_periods.update_one(
        {"period_id": period_id, "org_id": current_user.get("org_id"), "status": "open"},
        {"$set": {
            "status": "closing",
            "close_started_at": datetime.now(timezone.utc).isoformat(),
            "close_started_by": current_user.get("user_id")
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Period not found or already closing/closed")
    return {"success": True, "message": "Period close started"}


@router.put("/close/periods/{period_id}/complete-close")
async def complete_period_close(period_id: str, current_user: dict = Depends(get_current_user)):
    """Complete the period close"""
    db = get_db()
    
    # Verify period is in closing status
    period = await db.fin_periods.find_one({"period_id": period_id}, {"_id": 0})
    if not period or period.get("status") != "closing":
        raise HTTPException(status_code=400, detail="Period must be in closing status")
    
    # Update period status
    await db.fin_periods.update_one(
        {"period_id": period_id},
        {"$set": {
            "status": "closed",
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "closed_by": current_user.get("user_id")
        }}
    )
    
    return {"success": True, "message": "Period closed successfully"}
