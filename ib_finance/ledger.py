"""
IB Finance - Ledger Routes
Handles chart of accounts, journal entries, and trial balance
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Ledger"])


@router.get("/ledger/accounts")
async def get_accounts(
    account_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get chart of accounts"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if account_type:
        query["account_type"] = account_type
    
    cursor = db.fin_accounts.find(query, {"_id": 0}).sort("account_code", 1)
    accounts = await cursor.to_list(length=1000)
    return {"success": True, "data": accounts, "count": len(accounts)}


@router.post("/ledger/accounts")
async def create_account(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new account"""
    db = get_db()
    account = {
        "account_id": f"ACC-{uuid.uuid4().hex[:8].upper()}",
        "account_code": data.get("account_code"),
        "account_name": data.get("account_name"),
        "account_type": data.get("account_type"),  # asset | liability | equity | revenue | expense
        "parent_account_id": data.get("parent_account_id"),
        "currency": data.get("currency", "INR"),
        "balance": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.fin_accounts.insert_one(account)
    account.pop("_id", None)
    return {"success": True, "data": account}


@router.put("/ledger/accounts/{account_id}")
async def update_account(account_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update an account"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["account_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fin_accounts.update_one(
        {"account_id": account_id, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Account not found")
    
    updated = await db.fin_accounts.find_one({"account_id": account_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.get("/ledger/journals")
async def get_journals(
    status: Optional[str] = None,
    journal_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get journal entries"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if journal_type:
        query["journal_type"] = journal_type
    
    cursor = db.fin_journals.find(query, {"_id": 0}).sort("journal_date", -1)
    journals = await cursor.to_list(length=1000)
    return {"success": True, "data": journals, "count": len(journals)}


@router.get("/ledger/journals/{journal_id}")
async def get_journal(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Get journal entry details"""
    db = get_db()
    journal = await db.fin_journals.find_one(
        {"journal_id": journal_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not journal:
        raise HTTPException(status_code=404, detail="Journal entry not found")
    return {"success": True, "data": journal}


@router.post("/ledger/journals")
async def create_journal(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new journal entry"""
    db = get_db()
    
    # Validate debits = credits
    lines = data.get("lines", [])
    total_debit = sum(line.get("debit_amount", 0) for line in lines)
    total_credit = sum(line.get("credit_amount", 0) for line in lines)
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail="Debits must equal credits")
    
    journal = {
        "journal_id": f"JNL-{uuid.uuid4().hex[:8].upper()}",
        "journal_type": data.get("journal_type", "general"),
        "journal_date": data.get("journal_date", datetime.now(timezone.utc).isoformat()),
        "reference": data.get("reference"),
        "description": data.get("description"),
        "lines": lines,
        "total_debit": total_debit,
        "total_credit": total_credit,
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_journals.insert_one(journal)
    journal.pop("_id", None)
    return {"success": True, "data": journal}


@router.put("/ledger/journals/{journal_id}")
async def update_journal(journal_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a journal entry"""
    db = get_db()
    
    existing = await db.fin_journals.find_one({"journal_id": journal_id}, {"_id": 0})
    if not existing or existing.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Only draft journals can be updated")
    
    lines = data.get("lines", existing.get("lines", []))
    total_debit = sum(line.get("debit_amount", 0) for line in lines)
    total_credit = sum(line.get("credit_amount", 0) for line in lines)
    
    if abs(total_debit - total_credit) > 0.01:
        raise HTTPException(status_code=400, detail="Debits must equal credits")
    
    update_data = {k: v for k, v in data.items() if k not in ["journal_id", "org_id", "created_at"]}
    update_data["total_debit"] = total_debit
    update_data["total_credit"] = total_credit
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    await db.fin_journals.update_one({"journal_id": journal_id}, {"$set": update_data})
    updated = await db.fin_journals.find_one({"journal_id": journal_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.put("/ledger/journals/{journal_id}/post")
async def post_journal(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Post a journal entry to the ledger"""
    db = get_db()
    
    journal = await db.fin_journals.find_one({"journal_id": journal_id}, {"_id": 0})
    if not journal or journal.get("status") != "draft":
        raise HTTPException(status_code=400, detail="Journal not found or already posted")
    
    # Update account balances
    for line in journal.get("lines", []):
        account_id = line.get("account_id")
        debit = line.get("debit_amount", 0)
        credit = line.get("credit_amount", 0)
        
        account = await db.fin_accounts.find_one({"account_id": account_id}, {"_id": 0})
        if account:
            account_type = account.get("account_type")
            # Assets & Expenses increase with debits
            # Liabilities, Equity & Revenue increase with credits
            if account_type in ["asset", "expense"]:
                balance_change = debit - credit
            else:
                balance_change = credit - debit
            
            await db.fin_accounts.update_one(
                {"account_id": account_id},
                {"$inc": {"balance": balance_change}}
            )
    
    # Update journal status
    await db.fin_journals.update_one(
        {"journal_id": journal_id},
        {"$set": {
            "status": "posted",
            "posted_by": current_user.get("user_id"),
            "posted_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Journal posted successfully"}


@router.put("/ledger/journals/{journal_id}/reverse")
async def reverse_journal(journal_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Create a reversing entry"""
    db = get_db()
    
    original = await db.fin_journals.find_one({"journal_id": journal_id}, {"_id": 0})
    if not original or original.get("status") != "posted":
        raise HTTPException(status_code=400, detail="Can only reverse posted journals")
    
    # Create reversed lines
    reversed_lines = []
    for line in original.get("lines", []):
        reversed_lines.append({
            **line,
            "debit_amount": line.get("credit_amount", 0),
            "credit_amount": line.get("debit_amount", 0)
        })
    
    reversal = {
        "journal_id": f"JNL-{uuid.uuid4().hex[:8].upper()}",
        "journal_type": "reversal",
        "journal_date": data.get("reversal_date", datetime.now(timezone.utc).isoformat()),
        "reference": f"Reversal of {journal_id}",
        "description": data.get("reason", f"Reversal of {journal_id}"),
        "original_journal_id": journal_id,
        "lines": reversed_lines,
        "total_debit": original.get("total_credit"),
        "total_credit": original.get("total_debit"),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_journals.insert_one(reversal)
    
    # Mark original as reversed
    await db.fin_journals.update_one(
        {"journal_id": journal_id},
        {"$set": {"reversed_by": reversal["journal_id"], "reversed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    reversal.pop("_id", None)
    return {"success": True, "data": reversal}


@router.delete("/ledger/journals/{journal_id}")
async def delete_journal(journal_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a draft journal"""
    db = get_db()
    result = await db.fin_journals.delete_one(
        {"journal_id": journal_id, "org_id": current_user.get("org_id"), "status": "draft"}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Journal not found or cannot be deleted")
    return {"success": True, "message": "Journal deleted"}


@router.get("/ledger/trial-balance")
async def get_trial_balance(
    as_of_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get trial balance"""
    db = get_db()
    
    accounts = await db.fin_accounts.find(
        {"org_id": current_user.get("org_id"), "is_active": True},
        {"_id": 0}
    ).to_list(length=1000)
    
    trial_balance = []
    total_debit = 0
    total_credit = 0
    
    for account in accounts:
        balance = account.get("balance", 0)
        account_type = account.get("account_type")
        
        if account_type in ["asset", "expense"]:
            debit = balance if balance > 0 else 0
            credit = abs(balance) if balance < 0 else 0
        else:
            credit = balance if balance > 0 else 0
            debit = abs(balance) if balance < 0 else 0
        
        if debit != 0 or credit != 0:
            trial_balance.append({
                "account_id": account.get("account_id"),
                "account_code": account.get("account_code"),
                "account_name": account.get("account_name"),
                "account_type": account_type,
                "debit": debit,
                "credit": credit
            })
            total_debit += debit
            total_credit += credit
    
    return {
        "success": True,
        "data": {
            "as_of_date": as_of_date or datetime.now(timezone.utc).isoformat(),
            "accounts": trial_balance,
            "total_debit": total_debit,
            "total_credit": total_credit,
            "is_balanced": abs(total_debit - total_credit) < 0.01
        }
    }
