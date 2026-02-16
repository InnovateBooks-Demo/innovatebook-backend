"""
Capital Module API Routes - ENTERPRISE EDITION
Handles all investment and asset management endpoints with multi-tenant support
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from typing import Optional, List
import os
from uuid import uuid4

# Import enterprise middleware
from enterprise_middleware import (
    subscription_guard,
    require_active_subscription,
    require_permission,
    get_org_scope
)

router = APIRouter(prefix="/api/capital", tags=["Capital"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ['DB_NAME']
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ========================
# PORTFOLIO
# ========================

@router.get("/portfolio", dependencies=[Depends(require_permission("capital", "view"))])
async def get_portfolio(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all portfolio items (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        portfolio = await db.portfolio.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "portfolio": portfolio}
    except Exception as e:
        return {"success": False, "portfolio": [], "error": str(e)}

@router.get("/portfolio/{portfolio_id}", dependencies=[Depends(require_permission("capital", "view"))])
async def get_portfolio_item(portfolio_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get portfolio item by ID (org-scoped)"""
    try:
        query = {"id": portfolio_id}
        if org_id:
            query["org_id"] = org_id
        item = await db.portfolio.find_one(query, {"_id": 0})
        if not item:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        return {"success": True, "portfolio_item": item}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/portfolio", dependencies=[Depends(require_active_subscription), Depends(require_permission("capital", "create"))])
async def create_portfolio_item(portfolio_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create portfolio item (org-scoped, requires active subscription)"""
    try:
        portfolio_data["id"] = str(uuid4())
        portfolio_data["created_at"] = datetime.utcnow()
        if org_id:
            portfolio_data["org_id"] = org_id
        await db.portfolio.insert_one(portfolio_data)
        return {"success": True, "portfolio_item": portfolio_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/portfolio/{portfolio_id}", dependencies=[Depends(require_active_subscription)])
async def update_portfolio_item(portfolio_id: str, portfolio_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update portfolio item (org-scoped, requires active subscription)"""
    try:
        query = {"id": portfolio_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.portfolio.update_one(query, {"$set": portfolio_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Portfolio item not found")
        return {"success": True, "message": "Portfolio item updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# INVESTMENTS
# ========================

@router.get("/investments", dependencies=[Depends(subscription_guard)])
async def get_investments(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all investments (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        investments = await db.investments.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "investments": investments}
    except Exception as e:
        return {"success": False, "investments": [], "error": str(e)}

# ========================
# ASSETS
# ========================

@router.get("/assets", dependencies=[Depends(subscription_guard)])
async def get_assets(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all assets (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        assets = await db.assets.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "assets": assets}
    except Exception as e:
        return {"success": False, "assets": [], "error": str(e)}
