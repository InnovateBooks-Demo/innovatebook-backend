"""
IB Finance - Dashboard Routes
Main dashboard endpoint with aggregated metrics
"""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Dashboard"])


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
    current_period = await db.fin_periods.find_one(
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
