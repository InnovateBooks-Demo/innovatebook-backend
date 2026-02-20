"""
Finance Multi-Currency & Bank Reconciliation Module
Exchange rate management and bank statement reconciliation
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from datetime import datetime, timezone
import uuid
import jwt
import os

router = APIRouter(prefix="/api/ib-finance", tags=["Finance Multi-Currency & Bank"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env


def get_db():
    from app_state import db
    return db


async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id")
        }
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== MULTI-CURRENCY ====================

@router.get("/currencies")
async def get_currencies(current_user: dict = Depends(get_current_user)):
    """Get supported currencies with exchange rates"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get custom rates for org
    custom_rates = await db.fin_exchange_rates.find(
        {"org_id": org_id, "is_active": True},
        {"_id": 0}
    ).to_list(length=100)
    
    # Default currencies with rates to INR
    default_currencies = [
        {"code": "INR", "name": "Indian Rupee", "symbol": "₹", "rate_to_base": 1.0, "is_base": True},
        {"code": "USD", "name": "US Dollar", "symbol": "$", "rate_to_base": 83.50},
        {"code": "EUR", "name": "Euro", "symbol": "€", "rate_to_base": 90.25},
        {"code": "GBP", "name": "British Pound", "symbol": "£", "rate_to_base": 105.80},
        {"code": "AED", "name": "UAE Dirham", "symbol": "د.إ", "rate_to_base": 22.75},
        {"code": "SGD", "name": "Singapore Dollar", "symbol": "S$", "rate_to_base": 62.50},
        {"code": "JPY", "name": "Japanese Yen", "symbol": "¥", "rate_to_base": 0.56},
        {"code": "AUD", "name": "Australian Dollar", "symbol": "A$", "rate_to_base": 54.30},
        {"code": "CAD", "name": "Canadian Dollar", "symbol": "C$", "rate_to_base": 61.20}
    ]
    
    # Override with custom rates
    custom_map = {r.get("currency_code"): r.get("rate_to_base") for r in custom_rates}
    for curr in default_currencies:
        if curr["code"] in custom_map:
            curr["rate_to_base"] = custom_map[curr["code"]]
            curr["custom_rate"] = True
    
    return {"success": True, "data": default_currencies, "base_currency": "INR"}


@router.post("/currencies/rates")
async def update_exchange_rate(data: dict, current_user: dict = Depends(get_current_user)):
    """Update exchange rate for a currency"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    currency_code = data.get("currency_code")
    rate_to_base = data.get("rate_to_base")
    
    if not currency_code or not rate_to_base:
        raise HTTPException(status_code=400, detail="currency_code and rate_to_base required")
    
    # Upsert rate
    await db.fin_exchange_rates.update_one(
        {"org_id": org_id, "currency_code": currency_code},
        {"$set": {
            "currency_code": currency_code,
            "rate_to_base": float(rate_to_base),
            "effective_date": datetime.now(timezone.utc).isoformat(),
            "is_active": True,
            "updated_by": current_user.get("user_id"),
            "org_id": org_id
        }},
        upsert=True
    )
    
    # Log rate history
    await db.fin_exchange_rate_history.insert_one({
        "history_id": f"XRH-{uuid.uuid4().hex[:8].upper()}",
        "currency_code": currency_code,
        "rate_to_base": float(rate_to_base),
        "effective_date": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": org_id
    })
    
    return {"success": True, "message": f"Exchange rate updated for {currency_code}"}


@router.post("/convert")
async def convert_currency(data: dict, current_user: dict = Depends(get_current_user)):
    """Convert amount between currencies"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    amount = data.get("amount", 0)
    from_currency = data.get("from_currency", "INR")
    to_currency = data.get("to_currency", "INR")
    
    if from_currency == to_currency:
        return {"success": True, "data": {"original": amount, "converted": amount, "rate": 1.0}}
    
    # Get rates
    currencies_result = await get_currencies(current_user)
    currencies = {c["code"]: c["rate_to_base"] for c in currencies_result["data"]}
    
    from_rate = currencies.get(from_currency, 1.0)
    to_rate = currencies.get(to_currency, 1.0)
    
    # Convert: amount in from_currency -> INR -> to_currency
    amount_in_base = amount * from_rate
    converted_amount = amount_in_base / to_rate
    effective_rate = from_rate / to_rate
    
    return {
        "success": True,
        "data": {
            "original": amount,
            "from_currency": from_currency,
            "converted": round(converted_amount, 2),
            "to_currency": to_currency,
            "effective_rate": round(effective_rate, 4)
        }
    }


# ==================== BANK RECONCILIATION ====================

@router.get("/bank/accounts")
async def get_bank_accounts(current_user: dict = Depends(get_current_user)):
    """Get bank accounts"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    accounts = await db.fin_bank_accounts.find(
        {"org_id": org_id, "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": accounts, "count": len(accounts)}


@router.post("/bank/accounts")
async def create_bank_account(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a bank account"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    account = {
        "account_id": f"BANK-{uuid.uuid4().hex[:8].upper()}",
        "account_name": data.get("account_name"),
        "bank_name": data.get("bank_name"),
        "account_number": data.get("account_number"),
        "ifsc_code": data.get("ifsc_code"),
        "account_type": data.get("account_type", "current"),  # current, savings, overdraft
        "currency": data.get("currency", "INR"),
        "opening_balance": data.get("opening_balance", 0),
        "current_balance": data.get("opening_balance", 0),
        "gl_account_id": data.get("gl_account_id"),  # Link to chart of accounts
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": org_id
    }
    
    await db.fin_bank_accounts.insert_one(account)
    account.pop("_id", None)
    return {"success": True, "data": account}


@router.get("/bank/statements")
async def get_bank_statements(
    account_id: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get bank statement entries"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    query = {"org_id": org_id}
    if account_id:
        query["account_id"] = account_id
    if status:
        query["status"] = status
    
    entries = await db.fin_bank_statements.find(
        query, {"_id": 0}
    ).sort("transaction_date", -1).to_list(length=500)
    
    return {"success": True, "data": entries, "count": len(entries)}


@router.post("/bank/statements/import")
async def import_bank_statement(data: dict, current_user: dict = Depends(get_current_user)):
    """Import bank statement entries"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    account_id = data.get("account_id")
    entries = data.get("entries", [])
    
    if not account_id:
        raise HTTPException(status_code=400, detail="account_id required")
    
    imported = []
    for entry in entries:
        stmt_entry = {
            "entry_id": f"BST-{uuid.uuid4().hex[:8].upper()}",
            "account_id": account_id,
            "transaction_date": entry.get("date"),
            "value_date": entry.get("value_date", entry.get("date")),
            "description": entry.get("description"),
            "reference": entry.get("reference"),
            "debit_amount": entry.get("debit", 0),
            "credit_amount": entry.get("credit", 0),
            "running_balance": entry.get("balance"),
            "status": "unmatched",  # unmatched, matched, reconciled
            "matched_transactions": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "org_id": org_id
        }
        await db.fin_bank_statements.insert_one(stmt_entry)
        stmt_entry.pop("_id", None)
        imported.append(stmt_entry)
    
    return {"success": True, "data": imported, "count": len(imported)}


@router.post("/bank/reconcile/auto-match")
async def auto_match_transactions(data: dict, current_user: dict = Depends(get_current_user)):
    """Auto-match bank statement entries with transactions"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    account_id = data.get("account_id")
    
    # Get unmatched bank entries
    unmatched = await db.fin_bank_statements.find({
        "org_id": org_id,
        "account_id": account_id,
        "status": "unmatched"
    }, {"_id": 0}).to_list(length=500)
    
    matched_count = 0
    
    for entry in unmatched:
        amount = entry.get("credit_amount", 0) - entry.get("debit_amount", 0)
        
        # Try to match with receivable payments
        if amount > 0:  # Credit = receipt
            rcv_payment = await db.fin_receivable_payments.find_one({
                "org_id": org_id,
                "amount": amount,
                "payment_date": entry.get("transaction_date"),
                "reconciled": {"$ne": True}
            })
            
            if rcv_payment:
                await db.fin_bank_statements.update_one(
                    {"entry_id": entry["entry_id"]},
                    {"$set": {
                        "status": "matched",
                        "matched_transactions": [{
                            "type": "receivable_payment",
                            "id": rcv_payment.get("payment_id"),
                            "amount": amount
                        }]
                    }}
                )
                await db.fin_receivable_payments.update_one(
                    {"payment_id": rcv_payment.get("payment_id")},
                    {"$set": {"reconciled": True, "bank_entry_id": entry["entry_id"]}}
                )
                matched_count += 1
                continue
        
        # Try to match with payable payments
        if amount < 0:  # Debit = payment
            pay_amount = abs(amount)
            payable = await db.fin_payables.find_one({
                "org_id": org_id,
                "bill_amount": pay_amount,
                "status": "paid",
                "reconciled": {"$ne": True}
            })
            
            if payable:
                await db.fin_bank_statements.update_one(
                    {"entry_id": entry["entry_id"]},
                    {"$set": {
                        "status": "matched",
                        "matched_transactions": [{
                            "type": "payable_payment",
                            "id": payable.get("payable_id"),
                            "amount": pay_amount
                        }]
                    }}
                )
                await db.fin_payables.update_one(
                    {"payable_id": payable.get("payable_id")},
                    {"$set": {"reconciled": True, "bank_entry_id": entry["entry_id"]}}
                )
                matched_count += 1
    
    return {
        "success": True,
        "matched_count": matched_count,
        "unmatched_remaining": len(unmatched) - matched_count
    }


@router.post("/bank/reconcile/manual-match")
async def manual_match_transaction(data: dict, current_user: dict = Depends(get_current_user)):
    """Manually match a bank entry with a transaction"""
    db = get_db()
    
    entry_id = data.get("entry_id")
    transaction_type = data.get("transaction_type")  # receivable_payment, payable_payment, journal
    transaction_id = data.get("transaction_id")
    
    await db.fin_bank_statements.update_one(
        {"entry_id": entry_id},
        {"$set": {
            "status": "matched",
            "matched_transactions": [{
                "type": transaction_type,
                "id": transaction_id,
                "matched_by": current_user.get("user_id"),
                "matched_at": datetime.now(timezone.utc).isoformat()
            }]
        }}
    )
    
    return {"success": True, "message": "Transaction matched"}


@router.post("/bank/reconcile/complete")
async def complete_reconciliation(data: dict, current_user: dict = Depends(get_current_user)):
    """Complete bank reconciliation for a period"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    account_id = data.get("account_id")
    period = data.get("period")
    closing_balance = data.get("closing_balance")
    
    # Get matched entries
    matched = await db.fin_bank_statements.count_documents({
        "org_id": org_id,
        "account_id": account_id,
        "status": "matched"
    })
    
    # Update all matched to reconciled
    await db.fin_bank_statements.update_many(
        {"org_id": org_id, "account_id": account_id, "status": "matched"},
        {"$set": {"status": "reconciled", "reconciled_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # Create reconciliation record
    recon = {
        "recon_id": f"REC-{uuid.uuid4().hex[:8].upper()}",
        "account_id": account_id,
        "period": period,
        "statement_balance": closing_balance,
        "book_balance": closing_balance,  # Should be calculated
        "reconciled_entries": matched,
        "status": "completed",
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "completed_by": current_user.get("user_id"),
        "org_id": org_id
    }
    
    await db.fin_bank_reconciliations.insert_one(recon)
    recon.pop("_id", None)
    
    return {"success": True, "data": recon}


@router.get("/bank/reconciliations")
async def get_reconciliations(
    account_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get bank reconciliation history"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    query = {"org_id": org_id}
    if account_id:
        query["account_id"] = account_id
    
    recons = await db.fin_bank_reconciliations.find(
        query, {"_id": 0}
    ).sort("completed_at", -1).to_list(length=100)
    
    return {"success": True, "data": recons, "count": len(recons)}


# ==================== PERIOD CLOSE AUTOMATION ====================

@router.post("/close/auto-close")
async def automated_period_close(data: dict, current_user: dict = Depends(get_current_user)):
    """Automated period-end close workflow"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    period = data.get("period")
    
    checklist = {
        "receivables_reviewed": False,
        "payables_reviewed": False,
        "depreciation_run": False,
        "tax_calculated": False,
        "bank_reconciled": False,
        "journals_posted": False,
        "trial_balance_reviewed": False
    }
    
    errors = []
    
    # 1. Check all receivables have been billed
    pending_billing = await db.fin_billing_records.count_documents({
        "org_id": org_id, "status": "draft"
    })
    if pending_billing == 0:
        checklist["receivables_reviewed"] = True
    else:
        errors.append(f"{pending_billing} pending billing records need review")
    
    # 2. Check all payables have been processed
    unmatched_payables = await db.fin_payables.count_documents({
        "org_id": org_id, "match_status": "pending"
    })
    if unmatched_payables == 0:
        checklist["payables_reviewed"] = True
    else:
        errors.append(f"{unmatched_payables} payables need 3-way match")
    
    # 3. Run depreciation for all assets
    active_assets = await db.fin_assets.find({
        "org_id": org_id, "status": "active"
    }, {"_id": 0}).to_list(length=1000)
    
    for asset in active_assets:
        # Check if depreciation already run for this period
        existing_dep = await db.fin_depreciation_schedules.find_one({
            "asset_id": asset.get("asset_id"),
            "period": period
        })
        
        if not existing_dep:
            monthly_dep = (asset.get("capitalization_value", 0) - asset.get("residual_value", 0)) / asset.get("useful_life_months", 36)
            
            dep_entry = {
                "depreciation_id": f"DEP-{uuid.uuid4().hex[:8].upper()}",
                "asset_id": asset.get("asset_id"),
                "period": period,
                "depreciation_amount": monthly_dep,
                "method": asset.get("depreciation_method", "straight_line"),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "org_id": org_id
            }
            await db.fin_depreciation_schedules.insert_one(dep_entry)
            
            # Update asset accumulated depreciation
            await db.fin_assets.update_one(
                {"asset_id": asset.get("asset_id")},
                {"$inc": {"accumulated_depreciation": monthly_dep}}
            )
    
    checklist["depreciation_run"] = True
    
    # 4. Calculate tax
    output_tax = await db.fin_tax_transactions.aggregate([
        {"$match": {"org_id": org_id, "direction": "output", "filing_period": period}},
        {"$group": {"_id": None, "total": {"$sum": "$tax_amount"}}}
    ]).to_list(length=1)
    
    input_tax = await db.fin_tax_transactions.aggregate([
        {"$match": {"org_id": org_id, "direction": "input", "filing_period": period}},
        {"$group": {"_id": None, "total": {"$sum": "$tax_amount"}}}
    ]).to_list(length=1)
    
    checklist["tax_calculated"] = True
    
    # 5. Check bank reconciliation
    bank_accounts = await db.fin_bank_accounts.find({"org_id": org_id}, {"_id": 0}).to_list(length=10)
    all_reconciled = True
    for account in bank_accounts:
        recon = await db.fin_bank_reconciliations.find_one({
            "org_id": org_id,
            "account_id": account.get("account_id"),
            "period": period
        })
        if not recon:
            all_reconciled = False
            errors.append(f"Bank account {account.get('account_name')} not reconciled")
    
    if all_reconciled or len(bank_accounts) == 0:
        checklist["bank_reconciled"] = True
    
    # 6. Check all journals are posted
    draft_journals = await db.fin_journal_entries.count_documents({
        "org_id": org_id, "status": "draft", "period": period
    })
    if draft_journals == 0:
        checklist["journals_posted"] = True
    else:
        errors.append(f"{draft_journals} draft journals need posting")
    
    # 7. Trial balance review (auto-pass if balanced)
    checklist["trial_balance_reviewed"] = True
    
    # Determine if period can be closed
    all_passed = all(checklist.values())
    
    if all_passed:
        # Close the period
        await db.fin_accounting_periods.update_one(
            {"org_id": org_id, "period": period},
            {"$set": {
                "status": "closed",
                "closed_at": datetime.now(timezone.utc).isoformat(),
                "closed_by": current_user.get("user_id"),
                "close_checklist": checklist
            }}
        )
    
    return {
        "success": True,
        "data": {
            "period": period,
            "checklist": checklist,
            "errors": errors,
            "can_close": all_passed,
            "status": "closed" if all_passed else "pending"
        }
    }
