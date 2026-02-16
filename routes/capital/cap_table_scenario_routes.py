"""
IB Capital - Cap Table Scenario Modeling
Simulate dilution from future funding rounds
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
import uuid
import jwt
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/ib-capital/scenario", tags=["Cap Table Scenario Modeling"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'innovate_books_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env


async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"user_id": payload.get("user_id"), "org_id": payload.get("org_id")}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


def serialize_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


def serialize_docs(docs):
    return [serialize_doc(d) for d in docs]


# Collections
scenarios_col = db.capital_scenarios
scenario_rounds_col = db.capital_scenario_rounds


class ScenarioCreate(BaseModel):
    name: str
    description: Optional[str] = None
    base_valuation: float
    base_shares_outstanding: int


class ScenarioRoundCreate(BaseModel):
    scenario_id: str
    round_name: str
    round_type: str  # seed, series_a, series_b, series_c, etc.
    pre_money_valuation: float
    investment_amount: float
    option_pool_increase: float = 0  # Percentage to add to option pool


class DilutionAnalysis(BaseModel):
    scenario_id: str
    shareholder_id: Optional[str] = None  # If provided, analyze for specific shareholder


# ============== SCENARIO CRUD ==============

@router.get("/templates")
async def get_scenario_templates():
    """Get pre-built scenario templates"""
    templates = [
        {
            "id": "startup_seed_to_a",
            "name": "Startup: Seed to Series A",
            "description": "Typical startup journey from seed funding to Series A",
            "base_valuation": 5000000,
            "base_shares": 10000000,
            "rounds": [
                {"round_name": "Seed", "round_type": "seed", "pre_money": 5000000, "investment": 1000000, "option_pool": 10},
                {"round_name": "Series A", "round_type": "series_a", "pre_money": 20000000, "investment": 5000000, "option_pool": 5}
            ]
        },
        {
            "id": "growth_b_to_c",
            "name": "Growth: Series B to C",
            "description": "Growth stage company raising Series B and C",
            "base_valuation": 50000000,
            "base_shares": 50000000,
            "rounds": [
                {"round_name": "Series B", "round_type": "series_b", "pre_money": 50000000, "investment": 15000000, "option_pool": 3},
                {"round_name": "Series C", "round_type": "series_c", "pre_money": 150000000, "investment": 40000000, "option_pool": 2}
            ]
        },
        {
            "id": "bridge_round",
            "name": "Bridge Round",
            "description": "Quick bridge financing before major round",
            "base_valuation": 30000000,
            "base_shares": 30000000,
            "rounds": [
                {"round_name": "Bridge", "round_type": "bridge", "pre_money": 30000000, "investment": 3000000, "option_pool": 0}
            ]
        }
    ]
    
    return {"templates": templates}


@router.get("/list")
async def list_scenarios(current_user: dict = Depends(get_current_user)):
    """List all saved scenarios"""
    org_id = current_user.get("org_id")
    scenarios = await scenarios_col.find({"org_id": org_id, "deleted": {"$ne": True}}).to_list(100)
    return {"scenarios": serialize_docs(scenarios)}


@router.post("/create")
async def create_scenario(scenario: ScenarioCreate, current_user: dict = Depends(get_current_user)):
    """Create a new scenario"""
    org_id = current_user.get("org_id")
    
    new_scenario = {
        "scenario_id": f"SCN-{uuid.uuid4().hex[:8].upper()}",
        "org_id": org_id,
        **scenario.dict(),
        "status": "draft",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "rounds": []
    }
    
    await scenarios_col.insert_one(new_scenario)
    return serialize_doc(new_scenario)


@router.get("/{scenario_id}")
async def get_scenario(scenario_id: str, current_user: dict = Depends(get_current_user)):
    """Get scenario with all rounds"""
    org_id = current_user.get("org_id")
    scenario = await scenarios_col.find_one({"scenario_id": scenario_id, "org_id": org_id})
    
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Get all rounds for this scenario
    rounds = await scenario_rounds_col.find({"scenario_id": scenario_id}).sort("order", 1).to_list(20)
    scenario["rounds"] = serialize_docs(rounds)
    
    return serialize_doc(scenario)


@router.delete("/{scenario_id}")
async def delete_scenario(scenario_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a scenario"""
    org_id = current_user.get("org_id")
    result = await scenarios_col.update_one(
        {"scenario_id": scenario_id, "org_id": org_id},
        {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    return {"success": True, "message": "Scenario deleted"}


# ============== SCENARIO ROUNDS ==============

@router.post("/round/add")
async def add_scenario_round(round_data: ScenarioRoundCreate, current_user: dict = Depends(get_current_user)):
    """Add a funding round to a scenario"""
    org_id = current_user.get("org_id")
    
    # Verify scenario exists
    scenario = await scenarios_col.find_one({"scenario_id": round_data.scenario_id, "org_id": org_id})
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Get current round count for ordering
    existing_rounds = await scenario_rounds_col.count_documents({"scenario_id": round_data.scenario_id})
    
    # Calculate new shares issued
    price_per_share = round_data.pre_money_valuation / scenario.get("base_shares_outstanding", 1000000)
    new_shares = int(round_data.investment_amount / price_per_share)
    
    new_round = {
        "round_id": f"RND-{uuid.uuid4().hex[:8].upper()}",
        **round_data.dict(),
        "order": existing_rounds + 1,
        "price_per_share": price_per_share,
        "new_shares_issued": new_shares,
        "post_money_valuation": round_data.pre_money_valuation + round_data.investment_amount,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await scenario_rounds_col.insert_one(new_round)
    return serialize_doc(new_round)


@router.delete("/round/{round_id}")
async def delete_scenario_round(round_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a round from a scenario"""
    result = await scenario_rounds_col.delete_one({"round_id": round_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Round not found")
    
    return {"success": True, "message": "Round deleted"}


# ============== DILUTION ANALYSIS ==============

@router.post("/analyze")
async def analyze_dilution(request: DilutionAnalysis, current_user: dict = Depends(get_current_user)):
    """Analyze dilution across all rounds in a scenario"""
    org_id = current_user.get("org_id")
    
    # Get scenario
    scenario = await scenarios_col.find_one({"scenario_id": request.scenario_id, "org_id": org_id})
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    
    # Get current cap table
    owners = await db.capital_owners.find({"org_id": org_id}).to_list(100)
    ownership_lots = await db.capital_ownership_lots.find({"org_id": org_id}).to_list(1000)
    
    # Build initial ownership structure
    shareholder_shares = {}
    total_shares = 0
    
    for lot in ownership_lots:
        owner_id = lot.get("owner_id")
        shares = lot.get("shares", 0)
        shareholder_shares[owner_id] = shareholder_shares.get(owner_id, 0) + shares
        total_shares += shares
    
    # If no existing data, use scenario base
    if total_shares == 0:
        total_shares = scenario.get("base_shares_outstanding", 1000000)
    
    # Get scenario rounds
    rounds = await scenario_rounds_col.find({"scenario_id": request.scenario_id}).sort("order", 1).to_list(20)
    
    # Calculate dilution through each round
    analysis = {
        "scenario_id": request.scenario_id,
        "scenario_name": scenario.get("name"),
        "initial_shares": total_shares,
        "initial_ownership": {},
        "rounds_analysis": [],
        "final_ownership": {},
        "summary": {}
    }
    
    # Build initial ownership percentages
    owner_map = {o.get("owner_id"): o.get("name") for o in owners}
    for owner_id, shares in shareholder_shares.items():
        owner_name = owner_map.get(owner_id, owner_id)
        analysis["initial_ownership"][owner_name] = {
            "shares": shares,
            "percentage": round((shares / total_shares) * 100, 4) if total_shares > 0 else 0
        }
    
    # Process each round
    current_total = total_shares
    current_shares = shareholder_shares.copy()
    
    for round_data in rounds:
        round_name = round_data.get("round_name")
        new_shares = round_data.get("new_shares_issued", 0)
        option_pool_increase = round_data.get("option_pool_increase", 0)
        
        # Add option pool shares if specified
        option_pool_shares = int(current_total * option_pool_increase / 100) if option_pool_increase > 0 else 0
        
        post_round_total = current_total + new_shares + option_pool_shares
        
        round_analysis = {
            "round_name": round_name,
            "round_type": round_data.get("round_type"),
            "pre_money_valuation": round_data.get("pre_money_valuation"),
            "investment_amount": round_data.get("investment_amount"),
            "post_money_valuation": round_data.get("post_money_valuation"),
            "price_per_share": round_data.get("price_per_share"),
            "new_shares_issued": new_shares,
            "option_pool_shares": option_pool_shares,
            "pre_round_shares": current_total,
            "post_round_shares": post_round_total,
            "dilution_factor": round((current_total / post_round_total), 4) if post_round_total > 0 else 1,
            "ownership_after": {}
        }
        
        # Calculate post-round ownership for each shareholder
        for owner_id, shares in current_shares.items():
            owner_name = owner_map.get(owner_id, owner_id)
            new_pct = round((shares / post_round_total) * 100, 4) if post_round_total > 0 else 0
            old_pct = round((shares / current_total) * 100, 4) if current_total > 0 else 0
            round_analysis["ownership_after"][owner_name] = {
                "shares": shares,
                "percentage": new_pct,
                "dilution": round(old_pct - new_pct, 4)
            }
        
        # Add new investor
        round_analysis["ownership_after"][f"New Investor ({round_name})"] = {
            "shares": new_shares,
            "percentage": round((new_shares / post_round_total) * 100, 4) if post_round_total > 0 else 0,
            "dilution": 0
        }
        
        if option_pool_shares > 0:
            round_analysis["ownership_after"]["Option Pool (New)"] = {
                "shares": option_pool_shares,
                "percentage": round((option_pool_shares / post_round_total) * 100, 4) if post_round_total > 0 else 0,
                "dilution": 0
            }
        
        analysis["rounds_analysis"].append(round_analysis)
        
        # Update for next round
        current_total = post_round_total
        current_shares[f"investor_{round_data.get('round_id')}"] = new_shares
        if option_pool_shares > 0:
            current_shares["option_pool_new"] = current_shares.get("option_pool_new", 0) + option_pool_shares
    
    # Final ownership
    for owner_id, shares in current_shares.items():
        owner_name = owner_map.get(owner_id, owner_id)
        if owner_id.startswith("investor_"):
            # Get round name from ID
            for r in rounds:
                if r.get("round_id") in owner_id:
                    owner_name = f"New Investor ({r.get('round_name')})"
                    break
        elif owner_id == "option_pool_new":
            owner_name = "Option Pool (New)"
        
        initial_pct = analysis["initial_ownership"].get(owner_name, {}).get("percentage", 0)
        final_pct = round((shares / current_total) * 100, 4) if current_total > 0 else 0
        
        analysis["final_ownership"][owner_name] = {
            "shares": shares,
            "percentage": final_pct,
            "total_dilution": round(initial_pct - final_pct, 4) if owner_name in analysis["initial_ownership"] else 0
        }
    
    # Summary
    analysis["summary"] = {
        "total_rounds": len(rounds),
        "total_capital_raised": sum(r.get("investment_amount", 0) for r in rounds),
        "final_valuation": rounds[-1].get("post_money_valuation") if rounds else scenario.get("base_valuation"),
        "total_shares_after": current_total,
        "total_dilution_pct": round(((total_shares / current_total) - 1) * -100, 2) if current_total > total_shares else 0
    }
    
    return analysis


@router.post("/simulate-quick")
async def quick_simulation(data: dict, current_user: dict = Depends(get_current_user)):
    """Quick dilution simulation without saving"""
    
    current_shares = data.get("current_shares", 1000000)
    current_valuation = data.get("current_valuation", 10000000)
    investment_amount = data.get("investment_amount", 0)
    pre_money_valuation = data.get("pre_money_valuation", current_valuation)
    option_pool_increase = data.get("option_pool_increase", 0)
    
    if investment_amount <= 0:
        raise HTTPException(status_code=400, detail="Investment amount must be positive")
    
    # Calculate
    price_per_share = pre_money_valuation / current_shares
    new_shares = int(investment_amount / price_per_share)
    option_pool_shares = int(current_shares * option_pool_increase / 100) if option_pool_increase > 0 else 0
    post_round_shares = current_shares + new_shares + option_pool_shares
    post_money_valuation = pre_money_valuation + investment_amount
    
    dilution_factor = current_shares / post_round_shares
    
    return {
        "input": {
            "current_shares": current_shares,
            "current_valuation": current_valuation,
            "pre_money_valuation": pre_money_valuation,
            "investment_amount": investment_amount,
            "option_pool_increase": option_pool_increase
        },
        "output": {
            "price_per_share": round(price_per_share, 2),
            "new_shares_issued": new_shares,
            "option_pool_shares": option_pool_shares,
            "post_round_shares": post_round_shares,
            "post_money_valuation": post_money_valuation,
            "dilution_factor": round(dilution_factor, 4),
            "dilution_percentage": round((1 - dilution_factor) * 100, 2),
            "new_investor_ownership_pct": round((new_shares / post_round_shares) * 100, 2),
            "existing_ownership_pct": round((current_shares / post_round_shares) * 100, 2)
        }
    }
