"""
ML-Powered Bank Reconciliation Module
Uses Gemini 3 Flash for intelligent transaction matching
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import jwt
import os
import json
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/api/ib-finance/ml-reconcile", tags=["ML Bank Reconciliation"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')


def get_db():
    from main import db
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


class MLMatchRequest(BaseModel):
    bank_entries: List[dict]
    accounting_records: List[dict]


class MLMatchResult(BaseModel):
    bank_entry_id: str
    suggested_matches: List[dict]
    confidence_score: float
    reasoning: str


async def analyze_transactions_with_ml(bank_entries: List[dict], accounting_records: List[dict]) -> List[dict]:
    """Use Gemini 3 Flash to analyze and match transactions"""
    # from emergentintegrations.llm.chat import LlmChat, UserMessage
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage
    except ImportError:
        LlmChat = None
        UserMessage = None

    
    
    if not EMERGENT_LLM_KEY:
        # Fallback to rule-based matching if no API key
        return rule_based_matching(bank_entries, accounting_records)
    
    # Prepare data for ML analysis
    bank_data = json.dumps([{
        "id": e.get("entry_id", e.get("id", str(i))),
        "date": e.get("date", e.get("transaction_date", "")),
        "description": e.get("description", ""),
        "amount": e.get("amount", 0),
        "type": e.get("type", e.get("entry_type", ""))
    } for i, e in enumerate(bank_entries)], indent=2)
    
    accounting_data = json.dumps([{
        "id": r.get("id", r.get("receivable_id", r.get("payable_id", str(i)))),
        "party": r.get("party_name", r.get("vendor_name", r.get("customer_name", ""))),
        "description": r.get("description", r.get("reference", "")),
        "amount": r.get("amount", r.get("bill_amount", r.get("invoice_amount", 0))),
        "type": r.get("type", "receivable" if "receivable_id" in r else "payable"),
        "reference": r.get("invoice_number", r.get("bill_number", ""))
    } for i, r in enumerate(accounting_records)], indent=2)
    
    system_prompt = """You are a financial reconciliation expert. Analyze bank statement entries and accounting records to find matches.

For each bank entry, identify the most likely matching accounting record(s) based on:
1. Amount similarity (exact match or within 5% tolerance)
2. Date proximity (within 7 days)
3. Description matching (company names, invoice numbers, references)
4. Transaction type alignment (credits with receivables, debits with payables)

Return a JSON array with this structure for each bank entry:
{
  "bank_entry_id": "string",
  "matches": [
    {
      "accounting_id": "string",
      "confidence": 0.0-1.0,
      "match_reasons": ["reason1", "reason2"]
    }
  ],
  "reasoning": "brief explanation"
}

Only include matches with confidence > 0.5. Return empty matches array if no good match found."""

    try:
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=f"recon-{uuid.uuid4().hex[:8]}",
            system_message=system_prompt
        ).with_model("gemini", "gemini-3-flash-preview")
        
        user_message = UserMessage(
            text=f"""Analyze these transactions for matching:

BANK STATEMENT ENTRIES:
{bank_data}

ACCOUNTING RECORDS (Receivables/Payables):
{accounting_data}

Return the JSON array of matches."""
        )
        
        response = await chat.send_message(user_message)
        
        # Parse ML response
        try:
            # Extract JSON from response
            json_start = response.find('[')
            json_end = response.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                matches = json.loads(response[json_start:json_end])
                return matches
        except json.JSONDecodeError:
            pass
        
        # Fallback to rule-based if ML parsing fails
        return rule_based_matching(bank_entries, accounting_records)
        
    except Exception as e:
        print(f"ML matching error: {e}")
        return rule_based_matching(bank_entries, accounting_records)


def rule_based_matching(bank_entries: List[dict], accounting_records: List[dict]) -> List[dict]:
    """Fallback rule-based matching algorithm"""
    results = []
    
    for entry in bank_entries:
        entry_id = entry.get("entry_id", entry.get("id", ""))
        entry_amount = abs(float(entry.get("amount", 0)))
        entry_desc = entry.get("description", "").lower()
        entry_type = entry.get("type", entry.get("entry_type", ""))
        
        matches = []
        
        for record in accounting_records:
            record_id = record.get("id", record.get("receivable_id", record.get("payable_id", "")))
            record_amount = abs(float(record.get("amount", record.get("bill_amount", record.get("invoice_amount", 0)))))
            record_party = record.get("party_name", record.get("vendor_name", record.get("customer_name", ""))).lower()
            record_ref = record.get("invoice_number", record.get("bill_number", "")).lower()
            record_type = record.get("type", "")
            
            confidence = 0.0
            reasons = []
            
            # Amount matching (40% weight)
            amount_diff = abs(entry_amount - record_amount)
            if amount_diff == 0:
                confidence += 0.4
                reasons.append("Exact amount match")
            elif amount_diff / max(entry_amount, record_amount, 1) < 0.05:
                confidence += 0.3
                reasons.append("Amount within 5% tolerance")
            elif amount_diff / max(entry_amount, record_amount, 1) < 0.1:
                confidence += 0.2
                reasons.append("Amount within 10% tolerance")
            
            # Description/Party matching (35% weight)
            if record_party and record_party in entry_desc:
                confidence += 0.35
                reasons.append(f"Party name '{record_party}' found in description")
            elif record_ref and record_ref in entry_desc:
                confidence += 0.3
                reasons.append(f"Reference '{record_ref}' found in description")
            
            # Type alignment (25% weight)
            is_credit = entry_type == "credit" or entry.get("amount", 0) > 0
            is_receivable = record_type == "receivable" or "receivable_id" in record
            
            if (is_credit and is_receivable) or (not is_credit and not is_receivable):
                confidence += 0.25
                reasons.append("Transaction type aligned")
            
            if confidence >= 0.5:
                matches.append({
                    "accounting_id": record_id,
                    "confidence": round(confidence, 2),
                    "match_reasons": reasons
                })
        
        # Sort matches by confidence
        matches.sort(key=lambda x: x["confidence"], reverse=True)
        
        results.append({
            "bank_entry_id": entry_id,
            "matches": matches[:3],  # Top 3 matches
            "reasoning": f"Found {len(matches)} potential matches" if matches else "No matches found"
        })
    
    return results


@router.post("/analyze")
async def ml_analyze_transactions(request: MLMatchRequest, current_user: dict = Depends(get_current_user)):
    """Analyze transactions using ML for intelligent matching suggestions"""
    
    if not request.bank_entries:
        return {"success": True, "data": [], "message": "No bank entries to analyze"}
    
    if not request.accounting_records:
        return {"success": True, "data": [], "message": "No accounting records to match against"}
    
    # Run ML analysis
    matches = await analyze_transactions_with_ml(request.bank_entries, request.accounting_records)
    
    return {
        "success": True,
        "data": matches,
        "total_analyzed": len(request.bank_entries),
        "matches_found": sum(1 for m in matches if m.get("matches")),
        "ml_powered": bool(EMERGENT_LLM_KEY)
    }


@router.post("/auto-match")
async def ml_auto_match(current_user: dict = Depends(get_current_user)):
    """Automatically match all unmatched bank entries using ML"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get unmatched bank statements
    bank_entries = await db.fin_bank_statements.find({
        "org_id": org_id,
        "matched": {"$ne": True}
    }, {"_id": 0}).to_list(100)
    
    if not bank_entries:
        return {"success": True, "message": "No unmatched bank entries found", "matched": 0}
    
    # Get open receivables and payables
    receivables = await db.fin_receivables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "partial"]}
    }, {"_id": 0}).to_list(500)
    
    payables = await db.fin_payables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "approved"]}
    }, {"_id": 0}).to_list(500)
    
    accounting_records = [
        {**r, "type": "receivable"} for r in receivables
    ] + [
        {**p, "type": "payable"} for p in payables
    ]
    
    if not accounting_records:
        return {"success": True, "message": "No accounting records to match against", "matched": 0}
    
    # Run ML analysis
    matches = await analyze_transactions_with_ml(bank_entries, accounting_records)
    
    # Auto-apply high confidence matches (>= 0.8)
    auto_matched = 0
    for match_result in matches:
        if match_result.get("matches"):
            top_match = match_result["matches"][0]
            if top_match.get("confidence", 0) >= 0.8:
                # Create reconciliation record
                recon_id = f"RECON-{uuid.uuid4().hex[:8].upper()}"
                await db.fin_reconciliations.insert_one({
                    "reconciliation_id": recon_id,
                    "org_id": org_id,
                    "bank_entry_id": match_result["bank_entry_id"],
                    "accounting_record_id": top_match["accounting_id"],
                    "confidence": top_match["confidence"],
                    "match_reasons": top_match["match_reasons"],
                    "status": "auto_matched",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "created_by": current_user.get("user_id")
                })
                
                # Mark bank entry as matched
                await db.fin_bank_statements.update_one(
                    {"entry_id": match_result["bank_entry_id"], "org_id": org_id},
                    {"$set": {"matched": True, "reconciliation_id": recon_id}}
                )
                
                auto_matched += 1
    
    return {
        "success": True,
        "message": f"ML analysis complete. Auto-matched {auto_matched} transactions.",
        "total_analyzed": len(bank_entries),
        "auto_matched": auto_matched,
        "pending_review": len(bank_entries) - auto_matched,
        "all_matches": matches
    }


@router.get("/suggestions/{entry_id}")
async def get_match_suggestions(entry_id: str, current_user: dict = Depends(get_current_user)):
    """Get ML-powered match suggestions for a specific bank entry"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Get the bank entry
    entry = await db.fin_bank_statements.find_one(
        {"entry_id": entry_id, "org_id": org_id},
        {"_id": 0}
    )
    
    if not entry:
        raise HTTPException(status_code=404, detail="Bank entry not found")
    
    # Get potential matches
    receivables = await db.fin_receivables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "partial"]}
    }, {"_id": 0}).to_list(100)
    
    payables = await db.fin_payables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "approved"]}
    }, {"_id": 0}).to_list(100)
    
    accounting_records = [
        {**r, "type": "receivable"} for r in receivables
    ] + [
        {**p, "type": "payable"} for p in payables
    ]
    
    # Run ML analysis for this single entry
    matches = await analyze_transactions_with_ml([entry], accounting_records)
    
    return {
        "success": True,
        "bank_entry": entry,
        "suggestions": matches[0] if matches else {"matches": [], "reasoning": "No matches found"}
    }


@router.post("/confirm-match")
async def confirm_match(data: dict, current_user: dict = Depends(get_current_user)):
    """Confirm an ML-suggested match"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    bank_entry_id = data.get("bank_entry_id")
    accounting_record_id = data.get("accounting_record_id")
    
    if not bank_entry_id or not accounting_record_id:
        raise HTTPException(status_code=400, detail="bank_entry_id and accounting_record_id required")
    
    # Verify bank entry exists
    entry = await db.fin_bank_statements.find_one(
        {"entry_id": bank_entry_id, "org_id": org_id}
    )
    if not entry:
        raise HTTPException(status_code=404, detail="Bank entry not found")
    
    # Create reconciliation record
    recon_id = f"RECON-{uuid.uuid4().hex[:8].upper()}"
    await db.fin_reconciliations.insert_one({
        "reconciliation_id": recon_id,
        "org_id": org_id,
        "bank_entry_id": bank_entry_id,
        "accounting_record_id": accounting_record_id,
        "status": "confirmed",
        "confirmed_by": current_user.get("user_id"),
        "created_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Mark bank entry as matched
    await db.fin_bank_statements.update_one(
        {"entry_id": bank_entry_id, "org_id": org_id},
        {"$set": {"matched": True, "reconciliation_id": recon_id}}
    )
    
    return {"success": True, "reconciliation_id": recon_id, "message": "Match confirmed"}
