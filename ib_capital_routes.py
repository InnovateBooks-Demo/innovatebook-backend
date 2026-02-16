"""
IB Capital - Ownership, Funding & Capital Governance Engine
Modules: Ownership, Equity, Debt, Treasury, Returns, Governance
MongoDB-backed version
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from enum import Enum
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/ib-capital", tags=["IB Capital"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'innovate_books_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Collections
owners_col = db.capital_owners
instruments_col = db.capital_instruments
ownership_lots_col = db.capital_ownership_lots
funding_rounds_col = db.capital_funding_rounds
equity_issues_col = db.capital_equity_issues
debts_col = db.capital_debts
covenants_col = db.capital_covenants
treasury_accounts_col = db.capital_treasury_accounts
cash_inflows_col = db.capital_cash_inflows
cash_outflows_col = db.capital_cash_outflows
return_declarations_col = db.capital_returns
governance_rules_col = db.capital_governance_rules
approvals_col = db.capital_approvals

# ============== ENUMS ==============

class OwnerType(str, Enum):
    individual = "individual"
    entity = "entity"
    trust = "trust"
    esop_pool = "esop_pool"

class InstrumentType(str, Enum):
    common = "common"
    preferred = "preferred"
    esop = "esop"
    warrant = "warrant"
    convertible = "convertible"

class RoundStatus(str, Enum):
    planned = "planned"
    open = "open"
    closed = "closed"
    cancelled = "cancelled"

class DebtType(str, Enum):
    term_loan = "term_loan"
    working_capital = "working_capital"
    convertible_note = "convertible_note"
    debenture = "debenture"
    credit_line = "credit_line"
    vendor_financing = "vendor_financing"

class DebtStatus(str, Enum):
    planned = "planned"
    active = "active"
    repaid = "repaid"
    defaulted = "defaulted"

class CovenantType(str, Enum):
    financial = "financial"
    operational = "operational"
    reporting = "reporting"

class AccountType(str, Enum):
    operating = "operating"
    capital = "capital"
    escrow = "escrow"

class ReturnType(str, Enum):
    dividend = "dividend"
    interest = "interest"
    buyback = "buyback"
    redemption = "redemption"

# ============== PYDANTIC MODELS ==============

class OwnerCreate(BaseModel):
    owner_type: OwnerType
    name: str
    country: str = "India"
    tax_identifier: Optional[str] = None
    email: Optional[str] = None

class InstrumentCreate(BaseModel):
    instrument_type: InstrumentType
    class_name: str
    par_value: float = 10.0
    voting_rights: bool = True
    dividend_rights: bool = True
    liquidation_preference: float = 1.0
    conversion_ratio: Optional[float] = None

class FundingRoundCreate(BaseModel):
    round_name: str
    instrument_id: str
    pre_money_valuation: float
    target_amount: float
    currency: str = "INR"

class EquityIssueCreate(BaseModel):
    round_id: str
    investor_id: str
    shares_issued: int
    price_per_share: float

class DebtCreate(BaseModel):
    lender_id: str
    lender_name: str
    debt_type: DebtType
    principal_amount: float
    currency: str = "INR"
    interest_rate: float
    interest_type: str = "fixed"
    start_date: str
    maturity_date: str

class CovenantCreate(BaseModel):
    debt_id: str
    covenant_type: CovenantType
    description: str
    threshold: str
    measurement_frequency: str = "quarterly"

class TreasuryAccountCreate(BaseModel):
    bank_name: str
    account_number: str
    account_type: AccountType
    currency: str = "INR"
    initial_balance: float = 0

class CashInflowCreate(BaseModel):
    source_type: str
    source_reference_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    treasury_account_id: str
    description: Optional[str] = None

class CashOutflowCreate(BaseModel):
    purpose_type: str
    reference_id: Optional[str] = None
    amount: float
    currency: str = "INR"
    treasury_account_id: str
    description: Optional[str] = None

class ReturnDeclarationCreate(BaseModel):
    return_type: ReturnType
    source_id: str
    declared_amount: float
    currency: str = "INR"
    record_date: Optional[str] = None
    payment_date: Optional[str] = None

class GovernanceRuleCreate(BaseModel):
    rule_name: str
    rule_type: str
    applies_to: str
    condition_expression: str
    enforcement_action: str
    required_role: str

class ApprovalCreate(BaseModel):
    action_type: str
    action_reference_id: str
    requested_by: str
    description: str

# Helper to convert MongoDB documents
def serialize_doc(doc):
    if doc is None:
        return None
    doc.pop('_id', None)
    return doc

def serialize_docs(docs):
    return [serialize_doc(doc) for doc in docs]

# ============== DASHBOARD ==============

@router.get("/dashboard")
async def get_capital_dashboard():
    """Get IB Capital dashboard overview"""
    # Get totals from MongoDB
    owners = await owners_col.find({"status": "active"}).to_list(1000)
    lots = await ownership_lots_col.find({"status": "active"}).to_list(1000)
    debts = await debts_col.find({"status": "active"}).to_list(1000)
    accounts = await treasury_accounts_col.find({"status": "active"}).to_list(1000)
    covenants = await covenants_col.find().to_list(1000)
    pending_approvals = await approvals_col.find({"decision": "pending"}).to_list(100)
    recent_rounds = await funding_rounds_col.find().sort("created_at", -1).to_list(5)
    
    total_equity = sum(lot.get("quantity", 0) * 10 for lot in lots)
    total_debt = sum(d.get("outstanding_principal", 0) for d in debts)
    total_cash = sum(acc.get("balance", 0) for acc in accounts)
    
    # Ownership distribution
    ownership_by_type = {}
    for lot in lots:
        owner = next((o for o in owners if o.get("owner_id") == lot.get("owner_id")), None)
        if owner:
            owner_type = owner.get("owner_type", "unknown")
            ownership_by_type[owner_type] = ownership_by_type.get(owner_type, 0) + lot.get("quantity", 0)
    
    return {
        "summary": {
            "total_equity_value": total_equity,
            "total_debt_outstanding": total_debt,
            "total_cash_position": total_cash,
            "net_capital_position": total_equity + total_cash - total_debt,
            "total_shareholders": len(owners),
            "active_debt_instruments": len(debts),
            "pending_approvals": len(pending_approvals)
        },
        "ownership_distribution": ownership_by_type,
        "recent_rounds": serialize_docs(recent_rounds),
        "pending_approvals": serialize_docs(pending_approvals[:5]),
        "covenant_status": {
            "compliant": len([c for c in covenants if c.get("current_status") == "compliant"]),
            "warning": len([c for c in covenants if c.get("current_status") == "warning"]),
            "breach": len([c for c in covenants if c.get("current_status") == "breach"])
        }
    }

# ============== OWNERSHIP ENDPOINTS ==============

@router.get("/owners")
async def get_owners(status: Optional[str] = None, owner_type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if owner_type:
        query["owner_type"] = owner_type
    owners = await owners_col.find(query).to_list(1000)
    return {"owners": serialize_docs(owners), "total": len(owners)}

@router.get("/owners/{owner_id}")
async def get_owner(owner_id: str):
    owner = await owners_col.find_one({"owner_id": owner_id})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    holdings = await ownership_lots_col.find({"owner_id": owner_id, "status": "active"}).to_list(1000)
    all_lots = await ownership_lots_col.find({"status": "active"}).to_list(1000)
    
    total_shares = sum(h.get("quantity", 0) for h in holdings)
    total_all_shares = sum(lot.get("quantity", 0) for lot in all_lots)
    ownership_pct = (total_shares / total_all_shares * 100) if total_all_shares > 0 else 0
    
    result = serialize_doc(owner)
    result["holdings"] = serialize_docs(holdings)
    result["total_shares"] = total_shares
    result["ownership_percentage"] = round(ownership_pct, 2)
    return result

@router.post("/owners")
async def create_owner(owner: OwnerCreate):
    new_owner = {
        "owner_id": str(uuid.uuid4())[:8],
        **owner.dict(),
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await owners_col.insert_one(new_owner)
    return serialize_doc(new_owner)

@router.put("/owners/{owner_id}")
async def update_owner(owner_id: str, owner: OwnerCreate):
    result = await owners_col.update_one(
        {"owner_id": owner_id},
        {"$set": owner.dict()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Owner not found")
    updated = await owners_col.find_one({"owner_id": owner_id})
    return serialize_doc(updated)

@router.get("/cap-table")
async def get_cap_table():
    owners = await owners_col.find({"status": "active"}).to_list(1000)
    lots = await ownership_lots_col.find({"status": "active"}).to_list(1000)
    
    total_shares = sum(lot.get("quantity", 0) for lot in lots)
    
    cap_table = []
    for owner in owners:
        holdings = [lot for lot in lots if lot.get("owner_id") == owner.get("owner_id")]
        shares = sum(h.get("quantity", 0) for h in holdings)
        if shares > 0:
            cap_table.append({
                "owner_id": owner.get("owner_id"),
                "owner_name": owner.get("name"),
                "owner_type": owner.get("owner_type"),
                "shares": shares,
                "ownership_percentage": round((shares / total_shares * 100) if total_shares > 0 else 0, 2),
                "instruments": list(set(h.get("instrument_id") for h in holdings))
            })
    
    cap_table.sort(key=lambda x: x.get("ownership_percentage", 0), reverse=True)
    
    return {
        "cap_table": cap_table,
        "total_shares": total_shares,
        "total_owners": len(cap_table),
        "snapshot_date": datetime.now(timezone.utc).isoformat()
    }

@router.get("/instruments")
async def get_instruments():
    instruments = await instruments_col.find().to_list(1000)
    return {"instruments": serialize_docs(instruments)}

@router.post("/instruments")
async def create_instrument(instrument: InstrumentCreate):
    new_instrument = {
        "instrument_id": str(uuid.uuid4())[:8],
        **instrument.dict(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await instruments_col.insert_one(new_instrument)
    return serialize_doc(new_instrument)

@router.get("/ownership-lots")
async def get_ownership_lots(owner_id: Optional[str] = None):
    query = {}
    if owner_id:
        query["owner_id"] = owner_id
    lots = await ownership_lots_col.find(query).to_list(1000)
    return {"lots": serialize_docs(lots)}

# ============== EQUITY ENDPOINTS ==============

@router.get("/funding-rounds")
async def get_funding_rounds(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    rounds = await funding_rounds_col.find(query).to_list(1000)
    return {"rounds": serialize_docs(rounds), "total": len(rounds)}

@router.get("/funding-rounds/{round_id}")
async def get_funding_round(round_id: str):
    round_data = await funding_rounds_col.find_one({"round_id": round_id})
    if not round_data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    
    issues = await equity_issues_col.find({"round_id": round_id}).to_list(1000)
    result = serialize_doc(round_data)
    result["equity_issues"] = serialize_docs(issues)
    result["total_issued"] = sum(i.get("shares_issued", 0) for i in issues)
    return result

@router.post("/funding-rounds")
async def create_funding_round(round_data: FundingRoundCreate):
    new_round = {
        "round_id": str(uuid.uuid4())[:8],
        **round_data.dict(),
        "post_money_valuation": round_data.pre_money_valuation + round_data.target_amount,
        "raised_amount": 0,
        "status": "planned",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await funding_rounds_col.insert_one(new_round)
    return serialize_doc(new_round)

@router.put("/funding-rounds/{round_id}")
async def update_funding_round(round_id: str, round_data: FundingRoundCreate):
    existing = await funding_rounds_col.find_one({"round_id": round_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Funding round not found")
    if existing.get("status") == "closed":
        raise HTTPException(status_code=400, detail="Cannot modify closed round")
    
    update_data = round_data.dict()
    update_data["post_money_valuation"] = round_data.pre_money_valuation + round_data.target_amount
    await funding_rounds_col.update_one({"round_id": round_id}, {"$set": update_data})
    updated = await funding_rounds_col.find_one({"round_id": round_id})
    return serialize_doc(updated)

@router.post("/funding-rounds/{round_id}/open")
async def open_funding_round(round_id: str):
    round_data = await funding_rounds_col.find_one({"round_id": round_id})
    if not round_data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    if round_data.get("status") != "planned":
        raise HTTPException(status_code=400, detail="Only planned rounds can be opened")
    
    await funding_rounds_col.update_one({"round_id": round_id}, {"$set": {"status": "open"}})
    updated = await funding_rounds_col.find_one({"round_id": round_id})
    return serialize_doc(updated)

@router.post("/funding-rounds/{round_id}/close")
async def close_funding_round(round_id: str):
    round_data = await funding_rounds_col.find_one({"round_id": round_id})
    if not round_data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    if round_data.get("status") != "open":
        raise HTTPException(status_code=400, detail="Only open rounds can be closed")
    
    await funding_rounds_col.update_one({"round_id": round_id}, {"$set": {"status": "closed"}})
    updated = await funding_rounds_col.find_one({"round_id": round_id})
    return serialize_doc(updated)

@router.get("/equity-issues")
async def get_equity_issues(round_id: Optional[str] = None):
    query = {}
    if round_id:
        query["round_id"] = round_id
    issues = await equity_issues_col.find(query).to_list(1000)
    return {"issues": serialize_docs(issues)}

@router.post("/equity-issues")
async def create_equity_issue(issue: EquityIssueCreate):
    round_data = await funding_rounds_col.find_one({"round_id": issue.round_id})
    if not round_data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    if round_data.get("status") != "open":
        raise HTTPException(status_code=400, detail="Funding round is not open")
    
    new_issue = {
        "issue_id": str(uuid.uuid4())[:8],
        **issue.dict(),
        "issue_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "status": "issued",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await equity_issues_col.insert_one(new_issue)
    
    # Create ownership lot
    new_lot = {
        "lot_id": str(uuid.uuid4())[:8],
        "owner_id": issue.investor_id,
        "instrument_id": round_data.get("instrument_id"),
        "quantity": issue.shares_issued,
        "issue_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_event_id": new_issue["issue_id"],
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await ownership_lots_col.insert_one(new_lot)
    
    # Update round raised amount
    new_raised = round_data.get("raised_amount", 0) + (issue.shares_issued * issue.price_per_share)
    await funding_rounds_col.update_one({"round_id": issue.round_id}, {"$set": {"raised_amount": new_raised}})
    
    return serialize_doc(new_issue)

@router.get("/dilution-analysis/{round_id}")
async def get_dilution_analysis(round_id: str):
    round_data = await funding_rounds_col.find_one({"round_id": round_id})
    if not round_data:
        raise HTTPException(status_code=404, detail="Funding round not found")
    
    issues = await equity_issues_col.find({"round_id": round_id}).to_list(1000)
    issue_ids = [i.get("issue_id") for i in issues]
    
    all_lots = await ownership_lots_col.find({"status": "active"}).to_list(1000)
    pre_round_shares = sum(lot.get("quantity", 0) for lot in all_lots if lot.get("source_event_id") not in issue_ids)
    round_shares = sum(i.get("shares_issued", 0) for i in issues)
    post_round_shares = pre_round_shares + round_shares
    dilution_pct = (round_shares / post_round_shares * 100) if post_round_shares > 0 else 0
    
    return {
        "round_id": round_id,
        "round_name": round_data.get("round_name"),
        "pre_round_shares": pre_round_shares,
        "new_shares_issued": round_shares,
        "post_round_shares": post_round_shares,
        "dilution_percentage": round(dilution_pct, 2),
        "pre_money_valuation": round_data.get("pre_money_valuation"),
        "post_money_valuation": round_data.get("post_money_valuation")
    }

# ============== DEBT ENDPOINTS ==============

@router.get("/debts")
async def get_debts(status: Optional[str] = None, debt_type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if debt_type:
        query["debt_type"] = debt_type
    debts = await debts_col.find(query).to_list(1000)
    return {"debts": serialize_docs(debts), "total": len(debts)}

# Alias for frontend compatibility - /debt/instruments maps to /debts
@router.get("/debt/instruments")
async def get_debt_instruments(status: Optional[str] = None, debt_type: Optional[str] = None):
    """Alias endpoint for frontend compatibility"""
    query = {}
    if status:
        query["status"] = status
    if debt_type:
        query["debt_type"] = debt_type
    debts = await debts_col.find(query).to_list(1000)
    return {"debts": serialize_docs(debts), "total": len(debts)}

@router.get("/debts/{debt_id}")
async def get_debt(debt_id: str):
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    debt_covenants = await covenants_col.find({"debt_id": debt_id}).to_list(1000)
    result = serialize_doc(debt)
    result["covenants"] = serialize_docs(debt_covenants)
    result["repayment_schedule"] = []  # Can be extended
    return result

# Alias for frontend compatibility - /debt/instruments/{debt_id} maps to /debts/{debt_id}
@router.get("/debt/instruments/{debt_id}")
async def get_debt_instrument(debt_id: str):
    """Alias endpoint for frontend compatibility"""
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    debt_covenants = await covenants_col.find({"debt_id": debt_id}).to_list(1000)
    result = serialize_doc(debt)
    result["covenants"] = serialize_docs(debt_covenants)
    result["repayment_schedule"] = []  # Can be extended
    return result

@router.post("/debts")
async def create_debt(debt: DebtCreate):
    new_debt = {
        "debt_id": str(uuid.uuid4())[:8],
        **debt.dict(),
        "outstanding_principal": debt.principal_amount,
        "accrued_interest": 0,
        "status": "planned",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await debts_col.insert_one(new_debt)
    return serialize_doc(new_debt)

@router.put("/debts/{debt_id}")
async def update_debt(debt_id: str, debt: DebtCreate):
    existing = await debts_col.find_one({"debt_id": debt_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    await debts_col.update_one({"debt_id": debt_id}, {"$set": debt.dict()})
    updated = await debts_col.find_one({"debt_id": debt_id})
    return serialize_doc(updated)

@router.post("/debts/{debt_id}/activate")
async def activate_debt(debt_id: str):
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    await debts_col.update_one({"debt_id": debt_id}, {"$set": {"status": "active"}})
    updated = await debts_col.find_one({"debt_id": debt_id})
    return serialize_doc(updated)

@router.post("/debts/{debt_id}/repay")
async def record_repayment(debt_id: str, amount: float):
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")
    
    new_outstanding = max(0, debt.get("outstanding_principal", 0) - amount)
    new_status = "repaid" if new_outstanding == 0 else debt.get("status")
    await debts_col.update_one({"debt_id": debt_id}, {"$set": {"outstanding_principal": new_outstanding, "status": new_status}})
    updated = await debts_col.find_one({"debt_id": debt_id})
    return serialize_doc(updated)

@router.get("/covenants")
async def get_covenants(debt_id: Optional[str] = None, status: Optional[str] = None):
    query = {}
    if debt_id:
        query["debt_id"] = debt_id
    if status:
        query["current_status"] = status
    covenants = await covenants_col.find(query).to_list(1000)
    return {"covenants": serialize_docs(covenants)}

@router.post("/covenants")
async def create_covenant(covenant: CovenantCreate):
    new_covenant = {
        "covenant_id": str(uuid.uuid4())[:8],
        **covenant.dict(),
        "current_status": "compliant",
        "last_checked": None
    }
    await covenants_col.insert_one(new_covenant)
    return serialize_doc(new_covenant)

# ============== TREASURY ENDPOINTS ==============

@router.get("/treasury/accounts")
async def get_treasury_accounts():
    accounts = await treasury_accounts_col.find().to_list(1000)
    return {"accounts": serialize_docs(accounts)}

@router.get("/treasury/accounts/{account_id}")
async def get_treasury_account(account_id: str):
    account = await treasury_accounts_col.find_one({"account_id": account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    inflows = await cash_inflows_col.find({"treasury_account_id": account_id}).to_list(1000)
    outflows = await cash_outflows_col.find({"treasury_account_id": account_id}).to_list(1000)
    
    result = serialize_doc(account)
    result["inflows"] = serialize_docs(inflows)
    result["outflows"] = serialize_docs(outflows)
    return result

@router.post("/treasury/accounts")
async def create_treasury_account(account: TreasuryAccountCreate):
    new_account = {
        "account_id": str(uuid.uuid4())[:8],
        **account.dict(),
        "balance": account.initial_balance,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await treasury_accounts_col.insert_one(new_account)
    return serialize_doc(new_account)

@router.get("/treasury/inflows")
async def get_cash_inflows():
    inflows = await cash_inflows_col.find().to_list(1000)
    return {"inflows": serialize_docs(inflows)}

@router.post("/treasury/inflows")
async def record_cash_inflow(inflow: CashInflowCreate):
    account = await treasury_accounts_col.find_one({"account_id": inflow.treasury_account_id})
    if not account:
        raise HTTPException(status_code=404, detail="Treasury account not found")
    
    new_inflow = {
        "inflow_id": str(uuid.uuid4())[:8],
        **inflow.dict(),
        "received_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await cash_inflows_col.insert_one(new_inflow)
    
    # Update balance
    new_balance = account.get("balance", 0) + inflow.amount
    await treasury_accounts_col.update_one({"account_id": inflow.treasury_account_id}, {"$set": {"balance": new_balance}})
    
    return serialize_doc(new_inflow)

@router.get("/treasury/outflows")
async def get_cash_outflows(status: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    outflows = await cash_outflows_col.find(query).to_list(1000)
    return {"outflows": serialize_docs(outflows)}

@router.post("/treasury/outflows")
async def request_cash_outflow(outflow: CashOutflowCreate):
    new_outflow = {
        "outflow_id": str(uuid.uuid4())[:8],
        **outflow.dict(),
        "status": "requested",
        "requested_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "approved_by": None,
        "executed_date": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await cash_outflows_col.insert_one(new_outflow)
    return serialize_doc(new_outflow)

@router.post("/treasury/outflows/{outflow_id}/approve")
async def approve_cash_outflow(outflow_id: str, approved_by: str = "CFO"):
    outflow = await cash_outflows_col.find_one({"outflow_id": outflow_id})
    if not outflow:
        raise HTTPException(status_code=404, detail="Outflow not found")
    
    await cash_outflows_col.update_one({"outflow_id": outflow_id}, {"$set": {"status": "approved", "approved_by": approved_by}})
    updated = await cash_outflows_col.find_one({"outflow_id": outflow_id})
    return serialize_doc(updated)

@router.post("/treasury/outflows/{outflow_id}/execute")
async def execute_cash_outflow(outflow_id: str):
    outflow = await cash_outflows_col.find_one({"outflow_id": outflow_id})
    if not outflow:
        raise HTTPException(status_code=404, detail="Outflow not found")
    if outflow.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Outflow must be approved first")
    
    account = await treasury_accounts_col.find_one({"account_id": outflow.get("treasury_account_id")})
    if account and account.get("balance", 0) < outflow.get("amount", 0):
        await cash_outflows_col.update_one({"outflow_id": outflow_id}, {"$set": {"status": "blocked"}})
        return {"error": "Insufficient funds", "outflow": serialize_doc(outflow)}
    
    await cash_outflows_col.update_one({"outflow_id": outflow_id}, {"$set": {
        "status": "executed",
        "executed_date": datetime.now(timezone.utc).strftime("%Y-%m-%d")
    }})
    
    if account:
        new_balance = account.get("balance", 0) - outflow.get("amount", 0)
        await treasury_accounts_col.update_one({"account_id": outflow.get("treasury_account_id")}, {"$set": {"balance": new_balance}})
    
    updated = await cash_outflows_col.find_one({"outflow_id": outflow_id})
    return serialize_doc(updated)

@router.get("/treasury/liquidity")
async def get_liquidity_position():
    accounts = await treasury_accounts_col.find({"status": "active"}).to_list(1000)
    
    total_cash = sum(a.get("balance", 0) for a in accounts)
    restricted_cash = sum(a.get("balance", 0) for a in accounts if a.get("account_type") == "escrow")
    available_cash = total_cash - restricted_cash
    
    monthly_burn = 5000000
    runway_months = available_cash / monthly_burn if monthly_burn > 0 else 0
    
    return {
        "total_cash": total_cash,
        "restricted_cash": restricted_cash,
        "available_cash": available_cash,
        "estimated_monthly_burn": monthly_burn,
        "runway_months": round(runway_months, 1),
        "snapshot_date": datetime.now(timezone.utc).isoformat()
    }

# ============== RETURNS ENDPOINTS ==============

@router.get("/returns")
async def get_returns(status: Optional[str] = None, return_type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if return_type:
        query["return_type"] = return_type
    returns = await return_declarations_col.find(query).to_list(1000)
    return {"returns": serialize_docs(returns)}

@router.get("/returns/{return_id}")
async def get_return(return_id: str):
    return_decl = await return_declarations_col.find_one({"return_id": return_id})
    if not return_decl:
        raise HTTPException(status_code=404, detail="Return declaration not found")
    
    # Calculate entitlements
    owners = await owners_col.find({"status": "active"}).to_list(1000)
    lots = await ownership_lots_col.find({"status": "active"}).to_list(1000)
    total_shares = sum(lot.get("quantity", 0) for lot in lots)
    
    entitlements = []
    for owner in owners:
        owner_shares = sum(lot.get("quantity", 0) for lot in lots if lot.get("owner_id") == owner.get("owner_id"))
        if owner_shares > 0:
            pct = owner_shares / total_shares if total_shares > 0 else 0
            entitlements.append({
                "owner_id": owner.get("owner_id"),
                "owner_name": owner.get("name"),
                "ownership_percentage": round(pct * 100, 2),
                "entitled_amount": round(return_decl.get("declared_amount", 0) * pct, 2)
            })
    
    result = serialize_doc(return_decl)
    result["entitlements"] = entitlements
    return result

@router.post("/returns")
async def declare_return(return_decl: ReturnDeclarationCreate):
    new_return = {
        "return_id": str(uuid.uuid4())[:8],
        **return_decl.dict(),
        "status": "declared",
        "declaration_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "settled_amount": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await return_declarations_col.insert_one(new_return)
    return serialize_doc(new_return)

@router.post("/returns/{return_id}/approve")
async def approve_return(return_id: str):
    return_decl = await return_declarations_col.find_one({"return_id": return_id})
    if not return_decl:
        raise HTTPException(status_code=404, detail="Return declaration not found")
    
    await return_declarations_col.update_one({"return_id": return_id}, {"$set": {"status": "approved"}})
    updated = await return_declarations_col.find_one({"return_id": return_id})
    return serialize_doc(updated)

@router.post("/returns/{return_id}/settle")
async def settle_return(return_id: str):
    return_decl = await return_declarations_col.find_one({"return_id": return_id})
    if not return_decl:
        raise HTTPException(status_code=404, detail="Return declaration not found")
    if return_decl.get("status") != "approved":
        raise HTTPException(status_code=400, detail="Return must be approved first")
    
    await return_declarations_col.update_one({"return_id": return_id}, {"$set": {
        "status": "settled",
        "settled_amount": return_decl.get("declared_amount", 0)
    }})
    updated = await return_declarations_col.find_one({"return_id": return_id})
    return serialize_doc(updated)

# ============== ESOP VESTING ENDPOINTS ==============

# New collections for ESOP
esop_grants_col = db.capital_esop_grants
esop_vesting_events_col = db.capital_esop_vesting_events

class ESOPGrantCreate(BaseModel):
    employee_id: str
    employee_name: str
    instrument_id: str
    total_options: int
    exercise_price: float
    grant_date: str
    vesting_schedule: str  # cliff_1yr_monthly_4yr, monthly_4yr, annual_4yr
    cliff_months: Optional[int] = 12
    vesting_period_months: Optional[int] = 48
    notes: Optional[str] = None

@router.get("/esop/grants")
async def get_esop_grants(status: Optional[str] = None, employee_id: Optional[str] = None):
    """Get all ESOP grants with vesting status"""
    query = {}
    if status:
        query["status"] = status
    if employee_id:
        query["employee_id"] = employee_id
    
    grants = await esop_grants_col.find(query).to_list(1000)
    
    # Calculate vested/unvested for each grant
    for grant in grants:
        vesting_events = await esop_vesting_events_col.find({"grant_id": grant.get("grant_id")}).to_list(1000)
        total_vested = sum(e.get("vested_options", 0) for e in vesting_events)
        grant["vested_options"] = total_vested
        grant["unvested_options"] = grant.get("total_options", 0) - total_vested
        grant["vested_percentage"] = round((total_vested / grant.get("total_options", 1)) * 100, 2)
    
    return {"grants": serialize_docs(grants)}

@router.get("/esop/grants/{grant_id}")
async def get_esop_grant(grant_id: str):
    """Get a specific ESOP grant with vesting schedule"""
    grant = await esop_grants_col.find_one({"grant_id": grant_id})
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Get vesting events
    vesting_events = await esop_vesting_events_col.find({"grant_id": grant_id}).to_list(1000)
    total_vested = sum(e.get("vested_options", 0) for e in vesting_events)
    
    grant["vested_options"] = total_vested
    grant["unvested_options"] = grant.get("total_options", 0) - total_vested
    grant["vested_percentage"] = round((total_vested / grant.get("total_options", 1)) * 100, 2)
    grant["vesting_events"] = serialize_docs(vesting_events)
    
    # Generate upcoming vesting schedule
    grant["upcoming_vesting"] = calculate_upcoming_vesting(grant)
    
    return serialize_doc(grant)

def calculate_upcoming_vesting(grant):
    """Calculate upcoming vesting dates and amounts"""
    from datetime import datetime, timedelta
    
    schedule = []
    grant_date_str = grant.get("grant_date", datetime.now().strftime("%Y-%m-%d"))
    
    # Parse grant_date - handle both date-only and datetime formats
    try:
        if "T" in grant_date_str:
            grant_date = datetime.fromisoformat(grant_date_str.replace("Z", "+00:00"))
        else:
            grant_date = datetime.strptime(grant_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
    except:
        grant_date = datetime.now(timezone.utc)
    
    # Ensure grant_date is timezone-aware
    if grant_date.tzinfo is None:
        grant_date = grant_date.replace(tzinfo=timezone.utc)
    
    total_options = grant.get("total_options", 0)
    cliff_months = grant.get("cliff_months", 12)
    vesting_period = grant.get("vesting_period_months", 48)
    vesting_schedule = grant.get("vesting_schedule", "cliff_1yr_monthly_4yr")
    
    vested_so_far = grant.get("vested_options", 0)
    now = datetime.now(timezone.utc)
    
    if vesting_schedule == "cliff_1yr_monthly_4yr":
        # 25% after 1 year cliff, then monthly
        cliff_options = int(total_options * 0.25)
        monthly_options = int((total_options - cliff_options) / max(vesting_period - cliff_months, 1))
        
        # Cliff vesting
        cliff_date = grant_date + timedelta(days=cliff_months * 30)
        if cliff_date > now and vested_so_far < cliff_options:
            schedule.append({
                "date": cliff_date.strftime("%Y-%m-%d"),
                "type": "cliff",
                "options": cliff_options - vested_so_far,
                "cumulative": cliff_options
            })
        
        # Monthly vesting after cliff
        for month in range(cliff_months + 1, vesting_period + 1):
            vest_date = grant_date + timedelta(days=month * 30)
            cumulative = cliff_options + monthly_options * (month - cliff_months)
            if vest_date > now and cumulative > vested_so_far:
                schedule.append({
                    "date": vest_date.strftime("%Y-%m-%d"),
                    "type": "monthly",
                    "options": monthly_options,
                    "cumulative": min(cumulative, total_options)
                })
            if len(schedule) >= 12:  # Show next 12 vesting events
                break
    
    return schedule[:12]

@router.post("/esop/grants")
async def create_esop_grant(grant: ESOPGrantCreate):
    """Create a new ESOP grant"""
    new_grant = {
        "grant_id": f"ESOP-{uuid.uuid4().hex[:8].upper()}",
        **grant.dict(),
        "status": "active",
        "exercised_options": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await esop_grants_col.insert_one(new_grant)
    return serialize_doc(new_grant)

@router.post("/esop/grants/{grant_id}/vest")
async def process_vesting(grant_id: str, options_to_vest: Optional[int] = None):
    """Process vesting for a grant (manual or automatic)"""
    grant = await esop_grants_col.find_one({"grant_id": grant_id})
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Calculate what should vest
    vesting_events = await esop_vesting_events_col.find({"grant_id": grant_id}).to_list(1000)
    total_vested = sum(e.get("vested_options", 0) for e in vesting_events)
    
    if options_to_vest is None:
        # Auto-calculate based on schedule
        options_to_vest = calculate_auto_vest_amount(grant, total_vested)
    
    if options_to_vest <= 0:
        return {"message": "No options available to vest at this time", "vested_options": total_vested}
    
    # Ensure we don't over-vest
    max_vestable = grant.get("total_options", 0) - total_vested
    options_to_vest = min(options_to_vest, max_vestable)
    
    # Create vesting event
    vesting_event = {
        "event_id": f"VEST-{uuid.uuid4().hex[:8].upper()}",
        "grant_id": grant_id,
        "vesting_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "vested_options": options_to_vest,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await esop_vesting_events_col.insert_one(vesting_event)
    
    return {
        "message": f"Successfully vested {options_to_vest} options",
        "event": serialize_doc(vesting_event),
        "total_vested": total_vested + options_to_vest
    }

def calculate_auto_vest_amount(grant, already_vested):
    """Calculate how many options should vest based on schedule and current date"""
    from datetime import datetime, timedelta
    
    grant_date = datetime.fromisoformat(grant.get("grant_date", datetime.now().isoformat()).replace("Z", "+00:00"))
    now = datetime.now(timezone.utc)
    months_elapsed = (now.year - grant_date.year) * 12 + (now.month - grant_date.month)
    
    total_options = grant.get("total_options", 0)
    cliff_months = grant.get("cliff_months", 12)
    vesting_period = grant.get("vesting_period_months", 48)
    
    if months_elapsed < cliff_months:
        return 0  # Still in cliff period
    
    # Calculate expected vested amount
    cliff_options = int(total_options * 0.25)
    remaining_options = total_options - cliff_options
    remaining_months = vesting_period - cliff_months
    
    if months_elapsed >= cliff_months:
        months_after_cliff = months_elapsed - cliff_months
        monthly_vest = remaining_options / remaining_months
        expected_vested = cliff_options + int(monthly_vest * min(months_after_cliff, remaining_months))
        return int(min(expected_vested, total_options) - already_vested)
    
    return 0

@router.post("/esop/grants/{grant_id}/exercise")
async def exercise_options(grant_id: str, options_to_exercise: int):
    """Exercise vested options"""
    grant = await esop_grants_col.find_one({"grant_id": grant_id})
    if not grant:
        raise HTTPException(status_code=404, detail="Grant not found")
    
    # Calculate vested options
    vesting_events = await esop_vesting_events_col.find({"grant_id": grant_id}).to_list(1000)
    total_vested = sum(e.get("vested_options", 0) for e in vesting_events)
    already_exercised = grant.get("exercised_options", 0)
    available_to_exercise = total_vested - already_exercised
    
    if options_to_exercise > available_to_exercise:
        raise HTTPException(status_code=400, detail=f"Only {available_to_exercise} vested options available to exercise")
    
    # Update grant
    await esop_grants_col.update_one(
        {"grant_id": grant_id},
        {"$set": {"exercised_options": already_exercised + options_to_exercise}}
    )
    
    # Create ownership lot for exercised shares
    exercise_value = options_to_exercise * grant.get("exercise_price", 0)
    lot = {
        "lot_id": f"LOT-EX-{uuid.uuid4().hex[:8].upper()}",
        "owner_id": grant.get("employee_id"),
        "instrument_id": grant.get("instrument_id"),
        "quantity": options_to_exercise,
        "issue_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_event_id": grant_id,
        "status": "active",
        "exercise_price": grant.get("exercise_price"),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await ownership_lots_col.insert_one(lot)
    
    return {
        "message": f"Successfully exercised {options_to_exercise} options for ₹{exercise_value:,.0f}",
        "ownership_lot": serialize_doc(lot),
        "remaining_exercisable": available_to_exercise - options_to_exercise
    }

@router.get("/esop/dashboard")
async def get_esop_dashboard():
    """Get ESOP dashboard metrics"""
    grants = await esop_grants_col.find({}).to_list(1000)
    
    total_pool = 0
    total_granted = 0
    total_vested = 0
    total_exercised = 0
    
    for grant in grants:
        total_granted += grant.get("total_options", 0)
        total_exercised += grant.get("exercised_options", 0)
        # Get vesting events for this grant
        vesting_events = await esop_vesting_events_col.find({"grant_id": grant.get("grant_id")}).to_list(1000)
        total_vested += sum(e.get("vested_options", 0) for e in vesting_events)
    
    # Get ESOP pool from instruments
    esop_instrument = await instruments_col.find_one({"instrument_type": "esop"})
    if esop_instrument:
        esop_lot = await ownership_lots_col.find_one({"instrument_id": esop_instrument.get("instrument_id")})
        if esop_lot:
            total_pool = esop_lot.get("quantity", 0)
    
    return {
        "total_pool": total_pool,
        "granted": total_granted,
        "available": total_pool - total_granted,
        "vested": total_vested,
        "unvested": total_granted - total_vested,
        "exercised": total_exercised,
        "exercisable": total_vested - total_exercised,
        "grants_count": len(grants),
        "utilization_percentage": round((total_granted / max(total_pool, 1)) * 100, 2)
    }

# ============== CONVERTIBLE NOTE CONVERSION ENDPOINTS ==============

@router.post("/debt/{debt_id}/convert")
async def convert_debt_to_equity(debt_id: str, conversion_data: dict):
    """Convert a convertible note to equity"""
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt instrument not found")
    
    if debt.get("debt_type") != "convertible_note":
        raise HTTPException(status_code=400, detail="Only convertible notes can be converted")
    
    if debt.get("status") == "converted":
        raise HTTPException(status_code=400, detail="This note has already been converted")
    
    # Calculate conversion
    principal = debt.get("outstanding_principal", 0)
    accrued_interest = debt.get("accrued_interest", 0)
    total_to_convert = principal + accrued_interest
    
    # Get conversion terms (from conversion_data or debt record)
    valuation_cap = conversion_data.get("valuation_cap", debt.get("valuation_cap", 100000000))
    discount_rate = conversion_data.get("discount_rate", debt.get("discount_rate", 20))  # percentage
    conversion_price = conversion_data.get("conversion_price")
    
    # If no explicit conversion price, calculate based on cap or discount
    if not conversion_price:
        # Use valuation cap to determine price per share
        # Assuming 10M fully diluted shares
        fully_diluted_shares = 10000000
        cap_price = valuation_cap / fully_diluted_shares
        
        # Apply discount if there's a qualified financing round
        discounted_price = cap_price * (1 - discount_rate / 100)
        conversion_price = min(cap_price, discounted_price)
    
    # Calculate shares to issue
    shares_to_issue = int(total_to_convert / conversion_price)
    
    # Create or get the instrument for converted shares
    instrument_id = conversion_data.get("instrument_id", "INS002")  # Default to preferred
    
    # Create ownership lot for the converted shares
    lot = {
        "lot_id": f"LOT-CONV-{uuid.uuid4().hex[:8].upper()}",
        "owner_id": debt.get("lender_id"),
        "instrument_id": instrument_id,
        "quantity": shares_to_issue,
        "issue_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "source_event_id": f"CONV-{debt_id}",
        "conversion_price": conversion_price,
        "original_debt_id": debt_id,
        "status": "active",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await ownership_lots_col.insert_one(lot)
    
    # Create owner record if doesn't exist
    existing_owner = await owners_col.find_one({"owner_id": debt.get("lender_id")})
    if not existing_owner:
        new_owner = {
            "owner_id": debt.get("lender_id"),
            "owner_type": "entity",
            "name": debt.get("lender_name"),
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await owners_col.insert_one(new_owner)
    
    # Update debt status
    await debts_col.update_one(
        {"debt_id": debt_id},
        {"$set": {
            "status": "converted",
            "outstanding_principal": 0,
            "accrued_interest": 0,
            "conversion_date": datetime.now(timezone.utc).isoformat(),
            "converted_shares": shares_to_issue,
            "conversion_price": conversion_price,
            "converted_lot_id": lot["lot_id"]
        }}
    )
    
    return {
        "message": f"Successfully converted ₹{total_to_convert:,.0f} debt to {shares_to_issue:,} shares",
        "conversion_details": {
            "principal_converted": principal,
            "interest_converted": accrued_interest,
            "total_converted": total_to_convert,
            "conversion_price": conversion_price,
            "shares_issued": shares_to_issue,
            "valuation_cap": valuation_cap,
            "discount_rate": discount_rate
        },
        "ownership_lot": serialize_doc(lot)
    }

@router.get("/debt/{debt_id}/conversion-preview")
async def preview_debt_conversion(debt_id: str, valuation_cap: Optional[int] = None, discount_rate: Optional[int] = None):
    """Preview what a convertible note conversion would look like"""
    debt = await debts_col.find_one({"debt_id": debt_id})
    if not debt:
        raise HTTPException(status_code=404, detail="Debt instrument not found")
    
    if debt.get("debt_type") != "convertible_note":
        raise HTTPException(status_code=400, detail="Only convertible notes can be converted")
    
    principal = debt.get("outstanding_principal", 0)
    accrued_interest = debt.get("accrued_interest", 0)
    total_to_convert = principal + accrued_interest
    
    cap = valuation_cap or debt.get("valuation_cap", 100000000)
    discount = discount_rate or debt.get("discount_rate", 20)
    
    fully_diluted_shares = 10000000
    cap_price = cap / fully_diluted_shares
    discounted_price = cap_price * (1 - discount / 100)
    conversion_price = min(cap_price, discounted_price)
    shares_to_issue = int(total_to_convert / conversion_price)
    
    # Calculate ownership percentage
    total_shares_after = fully_diluted_shares + shares_to_issue
    ownership_percentage = (shares_to_issue / total_shares_after) * 100
    
    return {
        "debt_id": debt_id,
        "lender": debt.get("lender_name"),
        "principal": principal,
        "accrued_interest": accrued_interest,
        "total_to_convert": total_to_convert,
        "valuation_cap": cap,
        "discount_rate": discount,
        "cap_price_per_share": cap_price,
        "discounted_price_per_share": discounted_price,
        "conversion_price": conversion_price,
        "shares_to_issue": shares_to_issue,
        "post_conversion_ownership_percentage": round(ownership_percentage, 2)
    }

@router.get("/governance/rules")
async def get_governance_rules(applies_to: Optional[str] = None):
    query = {}
    if applies_to:
        query["applies_to"] = applies_to
    rules = await governance_rules_col.find(query).to_list(1000)
    return {"rules": serialize_docs(rules)}

@router.post("/governance/rules")
async def create_governance_rule(rule: GovernanceRuleCreate):
    new_rule = {
        "rule_id": str(uuid.uuid4())[:8],
        **rule.dict(),
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await governance_rules_col.insert_one(new_rule)
    return serialize_doc(new_rule)

@router.put("/governance/rules/{rule_id}")
async def update_governance_rule(rule_id: str, rule: GovernanceRuleCreate):
    existing = await governance_rules_col.find_one({"rule_id": rule_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    await governance_rules_col.update_one({"rule_id": rule_id}, {"$set": rule.dict()})
    updated = await governance_rules_col.find_one({"rule_id": rule_id})
    return serialize_doc(updated)

@router.delete("/governance/rules/{rule_id}")
async def deactivate_governance_rule(rule_id: str):
    rule = await governance_rules_col.find_one({"rule_id": rule_id})
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
    
    await governance_rules_col.update_one({"rule_id": rule_id}, {"$set": {"is_active": False}})
    updated = await governance_rules_col.find_one({"rule_id": rule_id})
    return serialize_doc(updated)

@router.get("/governance/approvals")
async def get_approvals(decision: Optional[str] = None):
    query = {}
    if decision:
        query["decision"] = decision
    approvals = await approvals_col.find(query).to_list(1000)
    return {"approvals": serialize_docs(approvals)}

@router.get("/governance/approvals/{approval_id}")
async def get_approval(approval_id: str):
    approval = await approvals_col.find_one({"approval_id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    return serialize_doc(approval)

@router.post("/governance/approvals")
async def create_approval(approval: ApprovalCreate):
    new_approval = {
        "approval_id": str(uuid.uuid4())[:8],
        **approval.dict(),
        "decision": "pending",
        "decided_by": None,
        "decision_date": None,
        "remarks": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await approvals_col.insert_one(new_approval)
    return serialize_doc(new_approval)

@router.post("/governance/approvals/{approval_id}/decide")
async def decide_approval(approval_id: str, decision: str, decided_by: str, remarks: Optional[str] = None):
    approval = await approvals_col.find_one({"approval_id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")
    
    await approvals_col.update_one({"approval_id": approval_id}, {"$set": {
        "decision": decision,
        "decided_by": decided_by,
        "decision_date": datetime.now(timezone.utc).isoformat(),
        "remarks": remarks
    }})
    updated = await approvals_col.find_one({"approval_id": approval_id})
    return serialize_doc(updated)

@router.get("/governance/authority-matrix")
async def get_authority_matrix():
    return {
        "matrix": [
            {"action": "issue_equity", "threshold": "Any amount", "required_approval": "Board + Founders", "level": "majority"},
            {"action": "draw_debt", "threshold": "> ₹1 Cr", "required_approval": "Board", "level": "majority"},
            {"action": "declare_dividend", "threshold": "Any amount", "required_approval": "Board + Investor consent", "level": "unanimous"},
            {"action": "buyback_shares", "threshold": "Any amount", "required_approval": "Board", "level": "majority"},
            {"action": "capital_expenditure", "threshold": "> ₹50 L", "required_approval": "CFO + Board", "level": "single"},
            {"action": "treasury_transfer", "threshold": "> ₹25 L", "required_approval": "CFO", "level": "single"}
        ]
    }

# ============== SEED DATA ==============

@router.post("/seed")
async def seed_capital_data():
    """Seed sample capital data into MongoDB"""
    # Clear existing data
    await owners_col.delete_many({})
    await instruments_col.delete_many({})
    await ownership_lots_col.delete_many({})
    await funding_rounds_col.delete_many({})
    await equity_issues_col.delete_many({})
    await debts_col.delete_many({})
    await covenants_col.delete_many({})
    await treasury_accounts_col.delete_many({})
    await cash_inflows_col.delete_many({})
    await cash_outflows_col.delete_many({})
    await return_declarations_col.delete_many({})
    await governance_rules_col.delete_many({})
    await approvals_col.delete_many({})
    
    now = datetime.now(timezone.utc).isoformat()
    
    # Insert instruments
    instruments = [
        {"instrument_id": "INS001", "instrument_type": "common", "class_name": "Common Shares", "par_value": 10, "voting_rights": True, "dividend_rights": True, "liquidation_preference": 1.0, "created_at": now},
        {"instrument_id": "INS002", "instrument_type": "preferred", "class_name": "Series A Preferred", "par_value": 100, "voting_rights": True, "dividend_rights": True, "liquidation_preference": 1.5, "created_at": now},
        {"instrument_id": "INS003", "instrument_type": "esop", "class_name": "ESOP Pool", "par_value": 10, "voting_rights": False, "dividend_rights": True, "liquidation_preference": 1.0, "created_at": now},
    ]
    await instruments_col.insert_many(instruments)
    
    # Insert owners
    owners = [
        {"owner_id": "OWN001", "owner_type": "individual", "name": "Rajesh Kumar (Founder & CEO)", "country": "India", "tax_identifier": "ABCPK1234A", "email": "rajesh@innovatebooks.com", "status": "active", "created_at": now},
        {"owner_id": "OWN002", "owner_type": "individual", "name": "Priya Sharma (Co-Founder & CTO)", "country": "India", "tax_identifier": "XYZPS5678B", "email": "priya@innovatebooks.com", "status": "active", "created_at": now},
        {"owner_id": "OWN003", "owner_type": "entity", "name": "Sequoia Capital India", "country": "India", "tax_identifier": "SEQIN2020A", "email": "investments@sequoiacap.in", "status": "active", "created_at": now},
        {"owner_id": "OWN004", "owner_type": "entity", "name": "Accel Partners", "country": "India", "tax_identifier": "ACCEL2021B", "email": "india@accel.com", "status": "active", "created_at": now},
        {"owner_id": "OWN005", "owner_type": "trust", "name": "IB ESOP Trust", "country": "India", "tax_identifier": "IBESOP2022", "email": "esop@innovatebooks.com", "status": "active", "created_at": now},
        {"owner_id": "OWN006", "owner_type": "individual", "name": "Angel Investor - Ratan Tata", "country": "India", "tax_identifier": "RTATA1940A", "email": "office@rntata.com", "status": "active", "created_at": now},
    ]
    await owners_col.insert_many(owners)
    
    # Insert ownership lots
    lots = [
        {"lot_id": "LOT001", "owner_id": "OWN001", "instrument_id": "INS001", "quantity": 4000000, "issue_date": "2020-01-15", "source_event_id": "FOUND", "status": "active", "created_at": now},
        {"lot_id": "LOT002", "owner_id": "OWN002", "instrument_id": "INS001", "quantity": 3000000, "issue_date": "2020-01-15", "source_event_id": "FOUND", "status": "active", "created_at": now},
        {"lot_id": "LOT003", "owner_id": "OWN005", "instrument_id": "INS003", "quantity": 1000000, "issue_date": "2020-06-01", "source_event_id": "ESOP", "status": "active", "created_at": now},
        {"lot_id": "LOT004", "owner_id": "OWN006", "instrument_id": "INS001", "quantity": 500000, "issue_date": "2021-03-01", "source_event_id": "ANGEL", "status": "active", "created_at": now},
        {"lot_id": "LOT005", "owner_id": "OWN003", "instrument_id": "INS002", "quantity": 1200000, "issue_date": "2023-06-15", "source_event_id": "SERA001", "status": "active", "created_at": now},
        {"lot_id": "LOT006", "owner_id": "OWN004", "instrument_id": "INS002", "quantity": 800000, "issue_date": "2023-06-15", "source_event_id": "SERA002", "status": "active", "created_at": now},
    ]
    await ownership_lots_col.insert_many(lots)
    
    # Insert funding rounds
    rounds = [
        {"round_id": "RND001", "round_name": "Seed Round", "instrument_id": "INS001", "pre_money_valuation": 50000000, "target_amount": 10000000, "currency": "INR", "post_money_valuation": 60000000, "raised_amount": 10000000, "status": "closed", "created_at": "2021-03-01T00:00:00Z"},
        {"round_id": "RND002", "round_name": "Series A", "instrument_id": "INS002", "pre_money_valuation": 400000000, "target_amount": 200000000, "currency": "INR", "post_money_valuation": 600000000, "raised_amount": 200000000, "status": "closed", "created_at": "2023-06-15T00:00:00Z"},
        {"round_id": "RND003", "round_name": "Series B", "instrument_id": "INS002", "pre_money_valuation": 1500000000, "target_amount": 500000000, "currency": "INR", "post_money_valuation": 2000000000, "raised_amount": 0, "status": "planned", "created_at": now},
    ]
    await funding_rounds_col.insert_many(rounds)
    
    # Insert equity issues
    issues = [
        {"issue_id": "ISS001", "round_id": "RND001", "investor_id": "OWN006", "shares_issued": 500000, "price_per_share": 20, "issue_date": "2021-03-01", "status": "issued", "created_at": "2021-03-01T00:00:00Z"},
        {"issue_id": "ISS002", "round_id": "RND002", "investor_id": "OWN003", "shares_issued": 1200000, "price_per_share": 100, "issue_date": "2023-06-15", "status": "issued", "created_at": "2023-06-15T00:00:00Z"},
        {"issue_id": "ISS003", "round_id": "RND002", "investor_id": "OWN004", "shares_issued": 800000, "price_per_share": 100, "issue_date": "2023-06-15", "status": "issued", "created_at": "2023-06-15T00:00:00Z"},
    ]
    await equity_issues_col.insert_many(issues)
    
    # Insert debts
    debts = [
        {"debt_id": "DBT001", "lender_id": "HDFC001", "lender_name": "HDFC Bank", "debt_type": "term_loan", "principal_amount": 50000000, "currency": "INR", "interest_rate": 12.5, "interest_type": "fixed", "start_date": "2023-01-01", "maturity_date": "2026-01-01", "outstanding_principal": 35000000, "accrued_interest": 1500000, "status": "active", "created_at": now},
        {"debt_id": "DBT002", "lender_id": "ICICI001", "lender_name": "ICICI Bank", "debt_type": "working_capital", "principal_amount": 20000000, "currency": "INR", "interest_rate": 11.0, "interest_type": "floating", "start_date": "2024-01-01", "maturity_date": "2025-01-01", "outstanding_principal": 20000000, "accrued_interest": 500000, "status": "active", "created_at": now},
        {"debt_id": "DBT003", "lender_id": "VC001", "lender_name": "Venture Debt Fund", "debt_type": "convertible_note", "principal_amount": 30000000, "currency": "INR", "interest_rate": 8.0, "interest_type": "fixed", "start_date": "2024-06-01", "maturity_date": "2026-06-01", "outstanding_principal": 30000000, "accrued_interest": 800000, "status": "active", "created_at": now},
    ]
    await debts_col.insert_many(debts)
    
    # Insert covenants
    covenants = [
        {"covenant_id": "COV001", "debt_id": "DBT001", "covenant_type": "financial", "description": "Debt Service Coverage Ratio >= 1.5x", "threshold": "DSCR >= 1.5", "measurement_frequency": "quarterly", "current_status": "compliant", "last_checked": "2024-09-30"},
        {"covenant_id": "COV002", "debt_id": "DBT001", "covenant_type": "financial", "description": "Current Ratio >= 1.2x", "threshold": "CR >= 1.2", "measurement_frequency": "quarterly", "current_status": "compliant", "last_checked": "2024-09-30"},
        {"covenant_id": "COV003", "debt_id": "DBT002", "covenant_type": "operational", "description": "No dividend without lender consent", "threshold": "Dividend = 0 OR Consent", "measurement_frequency": "annual", "current_status": "compliant", "last_checked": "2024-12-31"},
        {"covenant_id": "COV004", "debt_id": "DBT001", "covenant_type": "reporting", "description": "Quarterly financial statements within 45 days", "threshold": "Filing <= 45 days", "measurement_frequency": "quarterly", "current_status": "warning", "last_checked": "2024-09-30"},
    ]
    await covenants_col.insert_many(covenants)
    
    # Insert treasury accounts
    accounts = [
        {"account_id": "ACC001", "bank_name": "HDFC Bank", "account_number": "50100XXXXX001", "account_type": "operating", "currency": "INR", "balance": 45000000, "status": "active", "created_at": now},
        {"account_id": "ACC002", "bank_name": "ICICI Bank", "account_number": "00240XXXXX002", "account_type": "capital", "currency": "INR", "balance": 120000000, "status": "active", "created_at": now},
        {"account_id": "ACC003", "bank_name": "Yes Bank", "account_number": "12340XXXXX003", "account_type": "escrow", "currency": "INR", "balance": 15000000, "status": "active", "created_at": now},
    ]
    await treasury_accounts_col.insert_many(accounts)
    
    # Insert cash flows
    inflows = [
        {"inflow_id": "INF001", "source_type": "equity", "source_reference_id": "RND002", "amount": 200000000, "currency": "INR", "treasury_account_id": "ACC002", "description": "Series A funding", "received_date": "2023-06-20", "created_at": now},
        {"inflow_id": "INF002", "source_type": "debt", "source_reference_id": "DBT001", "amount": 50000000, "currency": "INR", "treasury_account_id": "ACC001", "description": "HDFC Term Loan disbursement", "received_date": "2023-01-15", "created_at": now},
        {"inflow_id": "INF003", "source_type": "revenue", "source_reference_id": None, "amount": 25000000, "currency": "INR", "treasury_account_id": "ACC001", "description": "Q3 Collections", "received_date": "2024-10-15", "created_at": now},
    ]
    await cash_inflows_col.insert_many(inflows)
    
    outflows = [
        {"outflow_id": "OUT001", "purpose_type": "debt_repayment", "reference_id": "DBT001", "amount": 5000000, "currency": "INR", "treasury_account_id": "ACC001", "description": "HDFC Loan EMI", "status": "executed", "requested_date": "2024-10-01", "approved_by": "CFO", "executed_date": "2024-10-05", "created_at": now},
        {"outflow_id": "OUT002", "purpose_type": "capex", "reference_id": None, "amount": 10000000, "currency": "INR", "treasury_account_id": "ACC002", "description": "Office expansion", "status": "approved", "requested_date": "2024-11-01", "approved_by": "Board", "executed_date": None, "created_at": now},
        {"outflow_id": "OUT003", "purpose_type": "opex", "reference_id": None, "amount": 8000000, "currency": "INR", "treasury_account_id": "ACC001", "description": "Payroll - December", "status": "requested", "requested_date": "2024-12-20", "approved_by": None, "executed_date": None, "created_at": now},
    ]
    await cash_outflows_col.insert_many(outflows)
    
    # Insert returns
    returns = [
        {"return_id": "RET001", "return_type": "interest", "source_id": "DBT001", "declared_amount": 1500000, "currency": "INR", "record_date": "2024-09-30", "payment_date": "2024-10-05", "status": "settled", "declaration_date": "2024-09-25", "settled_amount": 1500000, "created_at": now},
        {"return_id": "RET002", "return_type": "dividend", "source_id": "RND002", "declared_amount": 5000000, "currency": "INR", "record_date": "2025-03-31", "payment_date": "2025-04-15", "status": "declared", "declaration_date": "2025-01-05", "settled_amount": 0, "created_at": now},
    ]
    await return_declarations_col.insert_many(returns)
    
    # Insert governance rules
    rules = [
        {"rule_id": "GR001", "rule_name": "Equity Issuance Approval", "rule_type": "approval", "applies_to": "equity", "condition_expression": "shares > 0", "enforcement_action": "require_approval", "required_role": "board", "is_active": True, "created_at": now},
        {"rule_id": "GR002", "rule_name": "Large Debt Approval", "rule_type": "approval", "applies_to": "debt", "condition_expression": "amount > 10000000", "enforcement_action": "require_approval", "required_role": "board", "is_active": True, "created_at": now},
        {"rule_id": "GR003", "rule_name": "Dividend Declaration", "rule_type": "approval", "applies_to": "returns", "condition_expression": "type == dividend", "enforcement_action": "require_approval", "required_role": "board", "is_active": True, "created_at": now},
        {"rule_id": "GR004", "rule_name": "Treasury Release Limit", "rule_type": "restriction", "applies_to": "treasury", "condition_expression": "amount > 25000000", "enforcement_action": "require_approval", "required_role": "cfo", "is_active": True, "created_at": now},
    ]
    await governance_rules_col.insert_many(rules)
    
    # Insert approvals
    approvals = [
        {"approval_id": "APR001", "action_type": "equity_issue", "action_reference_id": "RND003", "requested_by": "CFO", "description": "Series B - New investor allocation", "decision": "pending", "decided_by": None, "decision_date": None, "remarks": None, "created_at": now},
        {"approval_id": "APR002", "action_type": "cash_outflow", "action_reference_id": "OUT003", "requested_by": "Finance Team", "description": "December payroll release", "decision": "pending", "decided_by": None, "decision_date": None, "remarks": None, "created_at": now},
    ]
    await approvals_col.insert_many(approvals)
    
    # Seed ESOP Grants
    await esop_grants_col.delete_many({})
    await esop_vesting_events_col.delete_many({})
    
    esop_grants = [
        {"grant_id": "ESOP-001", "employee_id": "EMP001", "employee_name": "Rahul Sharma", "instrument_id": "INS003", "total_options": 50000, "exercise_price": 10, "grant_date": "2024-01-15", "vesting_schedule": "cliff_1yr_monthly_4yr", "cliff_months": 12, "vesting_period_months": 48, "status": "active", "exercised_options": 0, "created_at": now},
        {"grant_id": "ESOP-002", "employee_id": "EMP002", "employee_name": "Priya Patel", "instrument_id": "INS003", "total_options": 30000, "exercise_price": 10, "grant_date": "2024-03-01", "vesting_schedule": "cliff_1yr_monthly_4yr", "cliff_months": 12, "vesting_period_months": 48, "status": "active", "exercised_options": 0, "created_at": now},
        {"grant_id": "ESOP-003", "employee_id": "EMP003", "employee_name": "Amit Kumar", "instrument_id": "INS003", "total_options": 20000, "exercise_price": 15, "grant_date": "2023-06-01", "vesting_schedule": "cliff_1yr_monthly_4yr", "cliff_months": 12, "vesting_period_months": 48, "status": "active", "exercised_options": 5000, "created_at": now},
    ]
    await esop_grants_col.insert_many(esop_grants)
    
    # Seed some vesting events for Amit Kumar (grant started 18 months ago)
    vesting_events = [
        {"event_id": "VEST-001", "grant_id": "ESOP-003", "vesting_date": "2024-06-01", "vested_options": 5000, "created_at": now},
        {"event_id": "VEST-002", "grant_id": "ESOP-003", "vesting_date": "2024-07-01", "vested_options": 417, "created_at": now},
        {"event_id": "VEST-003", "grant_id": "ESOP-003", "vesting_date": "2024-08-01", "vested_options": 417, "created_at": now},
        {"event_id": "VEST-004", "grant_id": "ESOP-003", "vesting_date": "2024-09-01", "vested_options": 417, "created_at": now},
        {"event_id": "VEST-005", "grant_id": "ESOP-003", "vesting_date": "2024-10-01", "vested_options": 417, "created_at": now},
        {"event_id": "VEST-006", "grant_id": "ESOP-003", "vesting_date": "2024-11-01", "vested_options": 417, "created_at": now},
    ]
    await esop_vesting_events_col.insert_many(vesting_events)
    
    return {
        "message": "IB Capital data seeded successfully to MongoDB",
        "summary": {
            "owners": 6,
            "instruments": 3,
            "ownership_lots": 6,
            "funding_rounds": 3,
            "equity_issues": 3,
            "debts": 3,
            "covenants": 4,
            "treasury_accounts": 3,
            "cash_inflows": 3,
            "cash_outflows": 3,
            "return_declarations": 2,
            "governance_rules": 4,
            "approvals": 2,
            "esop_grants": 3,
            "vesting_events": 6
        }
    }
