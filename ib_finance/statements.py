"""
IB Finance - Financial Statements Routes
Handles P&L, Balance Sheet, and Cash Flow statements
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Statements"])


@router.get("/statements/profit-loss")
async def get_profit_loss(
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get Profit & Loss statement"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get revenue accounts
    revenue_accounts = await db.fin_accounts.find(
        {"org_id": org_id, "account_type": "revenue", "is_active": True},
        {"_id": 0}
    ).to_list(length=100)
    
    # Get expense accounts
    expense_accounts = await db.fin_accounts.find(
        {"org_id": org_id, "account_type": "expense", "is_active": True},
        {"_id": 0}
    ).to_list(length=100)
    
    total_revenue = sum(acc.get("balance", 0) for acc in revenue_accounts)
    total_expenses = sum(acc.get("balance", 0) for acc in expense_accounts)
    net_income = total_revenue - total_expenses
    
    return {
        "success": True,
        "data": {
            "period": period or "Current",
            "revenue": {
                "accounts": revenue_accounts,
                "total": total_revenue
            },
            "expenses": {
                "accounts": expense_accounts,
                "total": total_expenses
            },
            "net_income": net_income,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }


@router.get("/statements/balance-sheet")
async def get_balance_sheet(
    as_of_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get Balance Sheet"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get all accounts by type
    accounts = await db.fin_accounts.find(
        {"org_id": org_id, "is_active": True},
        {"_id": 0}
    ).to_list(length=1000)
    
    assets = [a for a in accounts if a.get("account_type") == "asset"]
    liabilities = [a for a in accounts if a.get("account_type") == "liability"]
    equity = [a for a in accounts if a.get("account_type") == "equity"]
    
    total_assets = sum(a.get("balance", 0) for a in assets)
    total_liabilities = sum(a.get("balance", 0) for a in liabilities)
    total_equity = sum(a.get("balance", 0) for a in equity)
    
    # Add retained earnings (revenue - expenses)
    revenue_total = sum(a.get("balance", 0) for a in accounts if a.get("account_type") == "revenue")
    expense_total = sum(a.get("balance", 0) for a in accounts if a.get("account_type") == "expense")
    retained_earnings = revenue_total - expense_total
    total_equity += retained_earnings
    
    return {
        "success": True,
        "data": {
            "as_of_date": as_of_date or datetime.now(timezone.utc).isoformat(),
            "assets": {
                "accounts": assets,
                "total": total_assets
            },
            "liabilities": {
                "accounts": liabilities,
                "total": total_liabilities
            },
            "equity": {
                "accounts": equity,
                "retained_earnings": retained_earnings,
                "total": total_equity
            },
            "is_balanced": abs(total_assets - (total_liabilities + total_equity)) < 0.01,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }


@router.get("/statements/cash-flow")
async def get_cash_flow(
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get Cash Flow statement"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Operating activities - from receivables and payables
    receipts_pipeline = [
        {"$match": {"org_id": org_id, "status": {"$in": ["applied", "partially_applied"]}}},
        {"$group": {"_id": None, "total": {"$sum": "$amount_received"}}}
    ]
    receipts = await db.fin_payment_receipts.aggregate(receipts_pipeline).to_list(length=1)
    total_receipts = receipts[0]["total"] if receipts else 0
    
    payments_pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]
    payments = await db.fin_vendor_payments.aggregate(payments_pipeline).to_list(length=1)
    total_payments = payments[0]["total"] if payments else 0
    
    operating_cash_flow = total_receipts - total_payments
    
    # Investing activities - from asset purchases and disposals
    asset_purchases = await db.fin_assets.find(
        {"org_id": org_id, "status": "active"},
        {"_id": 0, "purchase_cost": 1}
    ).to_list(length=1000)
    total_asset_purchases = sum(a.get("purchase_cost", 0) for a in asset_purchases)
    
    disposal_proceeds_pipeline = [
        {"$match": {"org_id": org_id}},
        {"$group": {"_id": None, "total": {"$sum": "$disposal_amount"}}}
    ]
    disposals = await db.fin_asset_disposals.aggregate(disposal_proceeds_pipeline).to_list(length=1)
    total_disposals = disposals[0]["total"] if disposals else 0
    
    investing_cash_flow = total_disposals - total_asset_purchases
    
    # Financing activities (placeholder)
    financing_cash_flow = 0
    
    net_change = operating_cash_flow + investing_cash_flow + financing_cash_flow
    
    return {
        "success": True,
        "data": {
            "period": period or "Current",
            "operating_activities": {
                "receipts": total_receipts,
                "payments": total_payments,
                "total": operating_cash_flow
            },
            "investing_activities": {
                "asset_purchases": -total_asset_purchases,
                "asset_disposals": total_disposals,
                "total": investing_cash_flow
            },
            "financing_activities": {
                "total": financing_cash_flow
            },
            "net_change": net_change,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
    }
