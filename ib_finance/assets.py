"""
IB Finance - Assets Routes  
Handles fixed assets, depreciation, and disposal
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from datetime import datetime, timezone
import uuid
from . import get_db, get_current_user

router = APIRouter(tags=["IB Finance - Assets"])


@router.get("/assets")
async def get_assets(
    status: Optional[str] = None,
    asset_class: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all assets"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if asset_class:
        query["asset_class"] = asset_class
    
    cursor = db.fin_assets.find(query, {"_id": 0}).sort("created_at", -1)
    assets = await cursor.to_list(length=1000)
    return {"success": True, "data": assets, "count": len(assets)}


@router.get("/assets/{asset_id}")
async def get_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Get asset details with depreciation history"""
    db = get_db()
    asset = await db.fin_assets.find_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    depreciation = await db.fin_asset_depreciation.find(
        {"asset_id": asset_id},
        {"_id": 0}
    ).to_list(length=100)
    
    return {"success": True, "data": {**asset, "depreciation_history": depreciation}}


@router.post("/assets")
async def create_asset(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new asset"""
    db = get_db()
    asset = {
        "asset_id": f"AST-{uuid.uuid4().hex[:8].upper()}",
        "asset_name": data.get("asset_name"),
        "asset_class": data.get("asset_class"),  # land | building | plant | furniture | vehicle | computer | intangible
        "asset_tag": data.get("asset_tag"),
        "purchase_date": data.get("purchase_date"),
        "purchase_cost": data.get("purchase_cost", 0),
        "salvage_value": data.get("salvage_value", 0),
        "useful_life_months": data.get("useful_life_months", 60),
        "depreciation_method": data.get("depreciation_method", "straight_line"),  # straight_line | declining_balance | units_of_production
        "accumulated_depreciation": 0,
        "current_value": data.get("purchase_cost", 0),
        "location": data.get("location"),
        "custodian": data.get("custodian"),
        "status": "active",  # active | disposed | impaired
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_assets.insert_one(asset)
    asset.pop("_id", None)
    return {"success": True, "data": asset}


@router.put("/assets/{asset_id}")
async def update_asset(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update asset details"""
    db = get_db()
    update_data = {k: v for k, v in data.items() if k not in ["asset_id", "org_id", "created_at"]}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.fin_assets.update_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")},
        {"$set": update_data}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    updated = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.post("/assets/{asset_id}/depreciate")
async def run_depreciation(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Run depreciation for an asset"""
    db = get_db()
    
    asset = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset or asset.get("status") != "active":
        raise HTTPException(status_code=400, detail="Asset not found or not active")
    
    # Calculate depreciation
    purchase_cost = asset.get("purchase_cost", 0)
    salvage_value = asset.get("salvage_value", 0)
    useful_life = asset.get("useful_life_months", 60)
    method = asset.get("depreciation_method", "straight_line")
    accumulated = asset.get("accumulated_depreciation", 0)
    
    depreciable_amount = purchase_cost - salvage_value
    
    if method == "straight_line":
        monthly_depreciation = depreciable_amount / useful_life
    else:
        # For declining balance, use 2x straight line rate
        rate = (2 / useful_life)
        current_value = asset.get("current_value", purchase_cost)
        monthly_depreciation = current_value * rate
    
    # Don't depreciate below salvage value
    max_depreciation = purchase_cost - salvage_value - accumulated
    depreciation_amount = min(monthly_depreciation, max_depreciation)
    
    if depreciation_amount <= 0:
        return {"success": False, "message": "Asset fully depreciated"}
    
    # Create depreciation record
    depreciation_record = {
        "depreciation_id": f"DEP-{uuid.uuid4().hex[:8].upper()}",
        "asset_id": asset_id,
        "period": data.get("period", datetime.now().strftime("%Y-%m")),
        "depreciation_amount": round(depreciation_amount, 2),
        "method": method,
        "calculated_at": datetime.now(timezone.utc).isoformat(),
        "calculated_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_asset_depreciation.insert_one(depreciation_record)
    
    # Update asset
    new_accumulated = accumulated + depreciation_amount
    new_value = purchase_cost - new_accumulated
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": {
            "accumulated_depreciation": round(new_accumulated, 2),
            "current_value": round(new_value, 2),
            "last_depreciation_date": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    depreciation_record.pop("_id", None)
    return {"success": True, "data": depreciation_record}


@router.put("/assets/{asset_id}/dispose")
async def dispose_asset(asset_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Dispose of an asset"""
    db = get_db()
    
    asset = await db.fin_assets.find_one({"asset_id": asset_id}, {"_id": 0})
    if not asset or asset.get("status") != "active":
        raise HTTPException(status_code=400, detail="Asset not found or not active")
    
    disposal_amount = data.get("disposal_amount", 0)
    current_value = asset.get("current_value", 0)
    gain_loss = disposal_amount - current_value
    
    # Create disposal record
    disposal = {
        "disposal_id": f"DIS-{uuid.uuid4().hex[:8].upper()}",
        "asset_id": asset_id,
        "disposal_date": data.get("disposal_date", datetime.now(timezone.utc).isoformat()),
        "disposal_type": data.get("disposal_type", "sale"),  # sale | scrap | donation | loss
        "disposal_amount": disposal_amount,
        "book_value": current_value,
        "gain_loss": gain_loss,
        "buyer": data.get("buyer"),
        "reason": data.get("reason"),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "org_id": current_user.get("org_id")
    }
    await db.fin_asset_disposals.insert_one(disposal)
    
    # Update asset status
    await db.fin_assets.update_one(
        {"asset_id": asset_id},
        {"$set": {
            "status": "disposed",
            "disposed_at": datetime.now(timezone.utc).isoformat(),
            "disposal_id": disposal["disposal_id"]
        }}
    )
    
    disposal.pop("_id", None)
    return {"success": True, "data": disposal, "gain_loss": gain_loss}


@router.delete("/assets/{asset_id}")
async def delete_asset(asset_id: str, current_user: dict = Depends(get_current_user)):
    """Delete an asset (only if no depreciation recorded)"""
    db = get_db()
    
    # Check if depreciation exists
    dep_count = await db.fin_asset_depreciation.count_documents({"asset_id": asset_id})
    if dep_count > 0:
        raise HTTPException(status_code=400, detail="Cannot delete asset with depreciation history")
    
    result = await db.fin_assets.delete_one(
        {"asset_id": asset_id, "org_id": current_user.get("org_id")}
    )
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Asset not found")
    return {"success": True, "message": "Asset deleted"}
