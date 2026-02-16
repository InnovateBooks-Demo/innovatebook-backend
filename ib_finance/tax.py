"""
IB Finance - Tax Routes
Handles GST, TDS, and other tax management
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Tax"])


@router.get("/tax/registrations")
async def get_tax_registrations(current_user: dict = Depends(get_current_user)):
    """Get tax registrations (GST, TAN, etc.)"""
    db = get_db()
    registrations = await db.fin_tax_registrations.find(
        {"org_id": current_user.get("org_id")},
        {"_id": 0}
    ).to_list(length=100)
    return {"success": True, "data": registrations}


@router.get("/tax/transactions")
async def get_tax_transactions(
    tax_type: Optional[str] = None,
    direction: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get tax transactions"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if tax_type:
        query["tax_type"] = tax_type
    if direction:
        query["direction"] = direction
    
    cursor = db.fin_tax_transactions.find(query, {"_id": 0}).sort("transaction_date", -1)
    transactions = await cursor.to_list(length=1000)
    return {"success": True, "data": transactions, "count": len(transactions)}


@router.get("/tax/transactions/{tax_txn_id}")
async def get_tax_transaction(tax_txn_id: str, current_user: dict = Depends(get_current_user)):
    """Get tax transaction details"""
    db = get_db()
    txn = await db.fin_tax_transactions.find_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not txn:
        raise HTTPException(status_code=404, detail="Tax transaction not found")
    return {"success": True, "data": txn}


@router.get("/tax/dashboard")
async def get_tax_dashboard(current_user: dict = Depends(get_current_user)):
    """Get tax dashboard with summary"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get output tax (collected from customers)
    output_pipeline = [
        {"$match": {"org_id": org_id, "direction": "output", "status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": "$tax_type",
            "total_amount": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    output_totals = await db.fin_tax_transactions.aggregate(output_pipeline).to_list(length=10)
    
    # Get input tax (paid to vendors)
    input_pipeline = [
        {"$match": {"org_id": org_id, "direction": "input", "status": {"$ne": "cancelled"}}},
        {"$group": {
            "_id": "$tax_type",
            "total_amount": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    input_totals = await db.fin_tax_transactions.aggregate(input_pipeline).to_list(length=10)
    
    total_output = sum(t.get("total_amount", 0) for t in output_totals)
    total_input = sum(t.get("total_amount", 0) for t in input_totals)
    net_payable = total_output - total_input
    
    return {
        "success": True,
        "data": {
            "total_output_tax": total_output,
            "total_input_tax": total_input,
            "net_tax_payable": net_payable,
            "output_by_type": {t["_id"]: t["total_amount"] for t in output_totals},
            "input_by_type": {t["_id"]: t["total_amount"] for t in input_totals}
        }
    }


@router.post("/tax/transactions")
async def create_tax_transaction(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a tax transaction manually"""
    db = get_db()
    txn = {
        "tax_txn_id": f"TAX-{uuid.uuid4().hex[:8].upper()}",
        "source_type": data.get("source_type", "manual"),
        "source_id": data.get("source_id"),
        "transaction_date": data.get("transaction_date", datetime.now(timezone.utc).isoformat()),
        "tax_type": data.get("tax_type", "GST"),
        "tax_code": data.get("tax_code"),
        "taxable_amount": data.get("taxable_amount", 0),
        "tax_rate": data.get("tax_rate", 18),
        "tax_amount": data.get("tax_amount", 0),
        "direction": data.get("direction", "output"),
        "status": "pending",
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_tax_transactions.insert_one(txn)
    txn.pop("_id", None)
    return {"success": True, "data": txn}


@router.put("/tax/transactions/{tax_txn_id}")
async def update_tax_transaction(tax_txn_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a tax transaction"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["tax_txn_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fin_tax_transactions.update_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Tax transaction not found")
    
    updated = await db.fin_tax_transactions.find_one({"tax_txn_id": tax_txn_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.delete("/tax/transactions/{tax_txn_id}")
async def delete_tax_transaction(tax_txn_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a tax transaction"""
    db = get_db()
    result = await db.fin_tax_transactions.delete_one(
        {"tax_txn_id": tax_txn_id, "org_id": current_user.get("org_id"), "status": "pending"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Tax transaction not found or cannot be deleted")
    return {"success": True, "message": "Tax transaction deleted"}


@router.get("/tax/input-credits")
async def get_input_credits(current_user: dict = Depends(get_current_user)):
    """Get available input tax credits"""
    db = get_db()
    pipeline = [
        {"$match": {"org_id": current_user.get("org_id"), "direction": "input", "status": "claimed"}},
        {"$group": {
            "_id": "$tax_type",
            "available_credit": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    credits = await db.fin_tax_transactions.aggregate(pipeline).to_list(length=10)
    return {"success": True, "data": {c["_id"]: c["available_credit"] for c in credits}}


@router.get("/tax/reports/summary")
async def get_tax_summary_report(
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get tax summary report for a period"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    query = {"org_id": org_id}
    if period:
        query["period"] = period
    
    # Get transactions grouped by tax code and direction
    pipeline = [
        {"$match": query},
        {"$group": {
            "_id": {"tax_code": "$tax_code", "direction": "$direction"},
            "taxable_amount": {"$sum": "$taxable_amount"},
            "tax_amount": {"$sum": "$tax_amount"},
            "count": {"$sum": 1}
        }}
    ]
    summary = await db.fin_tax_transactions.aggregate(pipeline).to_list(length=100)
    
    return {
        "success": True,
        "data": {
            "period": period,
            "summary": summary,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }


@router.get("/tax/auto-summary")
async def get_auto_tax_summary(current_user: dict = Depends(get_current_user)):
    """Get automated tax summary from billing and payables"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Calculate from billing (output tax)
    billing_pipeline = [
        {"$match": {"org_id": org_id, "status": "issued"}},
        {"$group": {
            "_id": "$tax_code",
            "taxable_amount": {"$sum": "$gross_amount"},
            "tax_amount": {"$sum": "$tax_amount"}
        }}
    ]
    billing_tax = await db.fin_billing_records.aggregate(billing_pipeline).to_list(length=20)
    
    # Calculate from payables (input tax)
    payables_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["approved", "paid", "partially_paid"]}}},
        {"$group": {
            "_id": "$tax_code",
            "taxable_amount": {"$sum": "$gross_amount"},
            "tax_amount": {"$sum": "$tax_amount"}
        }}
    ]
    payables_tax = await db.fin_payables.aggregate(payables_pipeline).to_list(length=20)
    
    total_output = sum(t.get("tax_amount", 0) for t in billing_tax)
    total_input = sum(t.get("tax_amount", 0) for t in payables_tax)
    
    return {
        "success": True,
        "data": {
            "output_tax": {
                "total": total_output,
                "by_code": {t["_id"]: t["tax_amount"] for t in billing_tax if t["_id"]}
            },
            "input_tax": {
                "total": total_input,
                "by_code": {t["_id"]: t["tax_amount"] for t in payables_tax if t["_id"]}
            },
            "net_payable": total_output - total_input
        }
    }
