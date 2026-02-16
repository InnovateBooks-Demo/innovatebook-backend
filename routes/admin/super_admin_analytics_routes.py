"""
Super Admin Analytics Routes
Provides comprehensive analytics for organizations dashboard
"""
from fastapi import APIRouter, HTTPException, Depends
import logging
from datetime import datetime, timezone, timedelta
import os
from motor.motor_asyncio import AsyncIOMotorClient
from enterprise_middleware import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/super-admin/analytics", tags=["Super Admin Analytics"])

# Direct MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

def require_super_admin(token_payload: dict = Depends(verify_token)):
    """Middleware to ensure user is super admin"""
    if not token_payload.get("is_super_admin"):
        raise HTTPException(status_code=403, detail="Super admin access required")
    return token_payload

# ==================== ORGANIZATIONS OVERVIEW ====================

@router.get("/organizations/overview")
async def get_organizations_overview(token_payload: dict = Depends(require_super_admin)):
    """
    Get comprehensive overview of all organizations
    Includes: org details, user counts, subscription status, activity metrics
    """
    try:
        # Get all organizations
        orgs = await db.organizations.find({}, {"_id": 0}).to_list(None)
        
        enriched_orgs = []
        
        for org in orgs:
            org_id = org["org_id"]
            
            # Get user counts
            total_users = await db.enterprise_users.count_documents({"org_id": org_id})
            active_users = await db.enterprise_users.count_documents({"org_id": org_id, "is_active": True})
            inactive_users = total_users - active_users
            
            # Get subscription details
            subscription = await db.subscriptions.find_one({"org_id": org_id}, {"_id": 0})
            
            # Get activity metrics (last 30 days)
            thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
            
            # Count data created in last 30 days
            customers_count = await db.customers.count_documents({"org_id": org_id})
            invoices_count = await db.invoices.count_documents({"org_id": org_id})
            leads_count = await db.commerce_leads.count_documents({"org_id": org_id})
            
            # Calculate revenue (if subscription exists)
            mrr = 0
            if subscription and subscription.get("status") == "active":
                # Mock MRR calculation (in production, get from Razorpay)
                mrr = 999  # ₹9.99 per month
            
            # Days since creation
            created_date = org.get("created_at", datetime.now(timezone.utc))
            if created_date.tzinfo is None:
                created_date = created_date.replace(tzinfo=timezone.utc)
            days_active = (datetime.now(timezone.utc) - created_date).days
            
            # Trial status
            is_trial = org.get("subscription_status") == "trial"
            trial_ends_at = org.get("trial_ends_at")
            days_until_trial_end = None
            if trial_ends_at and is_trial:
                if trial_ends_at.tzinfo is None:
                    trial_ends_at = trial_ends_at.replace(tzinfo=timezone.utc)
                days_until_trial_end = (trial_ends_at - datetime.now(timezone.utc)).days
            
            enriched_org = {
                **org,
                "users": {
                    "total": total_users,
                    "active": active_users,
                    "inactive": inactive_users
                },
                "subscription_details": subscription,
                "metrics": {
                    "customers": customers_count,
                    "invoices": invoices_count,
                    "leads": leads_count,
                    "mrr": mrr,
                    "days_active": days_active,
                    "days_until_trial_end": days_until_trial_end
                },
                "health_score": calculate_health_score(
                    total_users, active_users, days_active, 
                    customers_count, invoices_count, is_trial
                )
            }
            
            enriched_orgs.append(enriched_org)
        
        # Calculate platform-wide statistics
        total_orgs = len(enriched_orgs)
        total_platform_users = sum(o["users"]["total"] for o in enriched_orgs)
        active_orgs = len([o for o in enriched_orgs if o["subscription_status"] == "active"])
        trial_orgs = len([o for o in enriched_orgs if o["subscription_status"] == "trial"])
        expired_orgs = len([o for o in enriched_orgs if o["subscription_status"] in ["expired", "cancelled"]])
        total_mrr = sum(o["metrics"]["mrr"] for o in enriched_orgs)
        
        return {
            "success": True,
            "organizations": enriched_orgs,
            "platform_stats": {
                "total_organizations": total_orgs,
                "active_organizations": active_orgs,
                "trial_organizations": trial_orgs,
                "expired_organizations": expired_orgs,
                "total_platform_users": total_platform_users,
                "total_mrr": total_mrr,
                "arr": total_mrr * 12  # Annual Recurring Revenue
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Get organizations overview failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def calculate_health_score(total_users, active_users, days_active, customers, invoices, is_trial):
    """Calculate organization health score (0-100)"""
    score = 0
    
    # User engagement (30 points)
    if total_users > 0:
        user_engagement = (active_users / total_users) * 30
        score += user_engagement
    
    # Activity level (30 points)
    activity_score = min((customers + invoices) / 10, 1) * 30
    score += activity_score
    
    # Longevity (20 points)
    longevity_score = min(days_active / 30, 1) * 20
    score += longevity_score
    
    # Subscription status (20 points)
    if not is_trial:
        score += 20
    else:
        score += 10  # Trial gets half points
    
    return round(score, 1)

# ==================== PLATFORM ANALYTICS ====================

@router.get("/platform/growth")
async def get_platform_growth(token_payload: dict = Depends(require_super_admin)):
    """Get platform growth metrics over time"""
    try:
        # Get orgs created per month (last 12 months)
        twelve_months_ago = datetime.now(timezone.utc) - timedelta(days=365)
        
        orgs = await db.organizations.find(
            {"created_at": {"$gte": twelve_months_ago}},
            {"_id": 0, "created_at": 1, "org_id": 1}
        ).to_list(None)
        
        # Group by month
        monthly_signups = {}
        for org in orgs:
            created = org.get("created_at", datetime.now(timezone.utc))
            month_key = created.strftime("%Y-%m")
            monthly_signups[month_key] = monthly_signups.get(month_key, 0) + 1
        
        # Get user growth
        users = await db.enterprise_users.find(
            {"created_at": {"$gte": twelve_months_ago}, "is_super_admin": False},
            {"_id": 0, "created_at": 1}
        ).to_list(None)
        
        monthly_user_signups = {}
        for user in users:
            created = user.get("created_at", datetime.now(timezone.utc))
            month_key = created.strftime("%Y-%m")
            monthly_user_signups[month_key] = monthly_user_signups.get(month_key, 0) + 1
        
        return {
            "success": True,
            "monthly_org_signups": monthly_signups,
            "monthly_user_signups": monthly_user_signups
        }
        
    except Exception as e:
        logger.error(f"❌ Get platform growth failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== ORGANIZATION DETAILS ====================

@router.get("/organizations/{org_id}/details")
async def get_organization_details(org_id: str, token_payload: dict = Depends(require_super_admin)):
    """Get detailed information about a specific organization"""
    try:
        org = await db.organizations.find_one({"org_id": org_id}, {"_id": 0})
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        
        # Get all users
        users = await db.enterprise_users.find({"org_id": org_id}, {"_id": 0, "password_hash": 0}).to_list(None)
        
        # Get subscription
        subscription = await db.subscriptions.find_one({"org_id": org_id}, {"_id": 0})
        
        # Get all data counts
        data_metrics = {
            "customers": await db.customers.count_documents({"org_id": org_id}),
            "vendors": await db.vendors.count_documents({"org_id": org_id}),
            "invoices": await db.invoices.count_documents({"org_id": org_id}),
            "bills": await db.bills.count_documents({"org_id": org_id}),
            "leads": await db.commerce_leads.count_documents({"org_id": org_id}),
            "employees": await db.employees.count_documents({"org_id": org_id})
        }
        
        return {
            "success": True,
            "organization": org,
            "users": users,
            "subscription": subscription,
            "data_metrics": data_metrics
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get organization details failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ==================== USER ACTIVITY ====================

@router.get("/users/activity")
async def get_user_activity(token_payload: dict = Depends(require_super_admin)):
    """Get platform-wide user activity metrics"""
    try:
        total_users = await db.enterprise_users.count_documents({"is_super_admin": False})
        active_users = await db.enterprise_users.count_documents({"is_super_admin": False, "is_active": True})
        
        # Get users by org
        orgs = await db.organizations.find({}, {"_id": 0, "org_id": 1, "org_name": 1}).to_list(None)
        
        user_distribution = []
        for org in orgs:
            count = await db.enterprise_users.count_documents({"org_id": org["org_id"]})
            user_distribution.append({
                "org_name": org["org_name"],
                "user_count": count
            })
        
        return {
            "success": True,
            "total_users": total_users,
            "active_users": active_users,
            "inactive_users": total_users - active_users,
            "user_distribution": user_distribution
        }
        
    except Exception as e:
        logger.error(f"❌ Get user activity failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
