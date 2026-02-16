"""
IB Commerce - Parties Module Routes
Complete CRUD operations for all party types
"""
from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional, List
import os
from uuid import uuid4

from parties_models import (
    CustomerCreate, Customer,
    VendorCreate, Vendor,
    PartnerCreate, Partner,
    ChannelCreate, Channel,
    ProfileCreate, Profile,
    PartyCategory
)

from enterprise_middleware import (
    get_org_scope,
    require_permission,
    require_active_subscription
)

from motor.motor_asyncio import AsyncIOMotorClient

# router = APIRouter(prefix="/api/commerce/parties", tags=["Parties"])
from enterprise_middleware import subscription_guard


router = APIRouter(
    prefix="/api/commerce/parties",
    tags=["Parties"],
    dependencies=[Depends(subscription_guard)]
)


# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ['DB_NAME']
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

@router.get("/__debug/db")
async def debug_db():
    return {
        "db_name": db.name,
        "collections": await db.list_collection_names()
    }

# ==================== CUSTOMERS ====================


# @router.get("/customers", dependencies=[Depends(require_permission("customers", "view"))])
# async def get_customers(
#     org_id: Optional[str] = Depends(get_org_scope),
#     search: Optional[str] = None,
#     status: Optional[str] = None,
#     customer_type: Optional[str] = None
# ):
#     # print("ORG FROM TOKEN:", org_id)
#     # print("DB NAME:",db.name)
#     # print(await db.list)
#     print("ORG FROM TOKEN:", org_id)
#     print("DB NAME:", db.name)
#     print("COLLECTIONS:", await db.list_collection_names())
  

#     try:
#         query = {"org_id": org_id} if org_id else {}

#         if search:
#             query["$or"] = [
#                 {"name": {"$regex": search, "$options": "i"}},
#                 {"company_name": {"$regex": search, "$options": "i"}},
#                 {"customer_id": {"$regex": search, "$options": "i"}}
#             ]

#         if status:
#             query["status"] = status

#         customers = await db.parties_customers.find(
#             query, {"_id": 0}
#         ).sort("created_at", -1).to_list(1000)

#         return {
#             "success": True,
#             "customers": customers,
#             "count": len(customers)
#         }

#     except Exception as e:
#         return {
#             "success": False,
#             "customers": [],
#             "error": str(e)
#         }

@router.get("/customers", dependencies=[Depends(require_permission("customers", "view"))])
async def get_customers(
    org_id: Optional[str] = Depends(get_org_scope),
):
    try:
        print("ORG FROM TOKEN:", org_id)

        query = {"org_id": org_id} if org_id else {}

        customers = await db.parties_customers.find(
            query, {"_id": 0}
        ).sort("created_at", -1).to_list(1000)

        print("CUSTOMER COUNT:", len(customers))

        return {
            "success": True,
            "customers": customers,
            "count": len(customers)
        }
    except Exception as e:
        return {
            "success": False,
            "customers": [],
            "error": str(e)
        }




@router.get("/customers/{customer_id}", dependencies=[Depends(require_permission("customers", "view"))])
async def get_customer(customer_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get customer by ID (org-scoped)"""
    try:
        query = {"customer_id": customer_id}   # ✅ FIXED
        if org_id:
            query["org_id"] = org_id

        customer = await db.parties_customers.find_one(query, {"_id": 0})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        return {"success": True, "customer": customer}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.post("/customers", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "create"))])
async def create_customer(
    customer_data: CustomerCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    
    
    """Create new customer"""
    try:
        customer_id = f"CUST-{uuid4().hex[:8].upper()}"
        party_id = f"PARTY-{uuid4().hex[:8].upper()}"
        
        customer_doc = customer_data.model_dump()
        customer_doc.update({
            "customer_id": customer_id,
            "party_id": party_id,
            "party_category": PartyCategory.CUSTOMER,
            "org_id": org_id,
            "created_by": "system",
            "created_at": datetime.now(timezone.utc),
            "last_modified_by": "system",
            "last_modified_at": datetime.now(timezone.utc)
        })
        
        await db.parties_customers.insert_one(customer_doc)
        
        return {
            "success": True,
            "message": "Customer created successfully",
            "customer": {**customer_doc, "_id": None}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/customers/{customer_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "edit"))])
async def update_customer(
    customer_id: str,
    customer_data: CustomerCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Update customer"""
    try:
        query = {"customer_id": customer_id}
        if org_id:
            query["org_id"] = org_id
        
        existing = await db.parties_customers.find_one(query, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        update_data = customer_data.dict()
        update_data["last_modified_by"] = "system"
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        await db.parties_customers.update_one(query, {"$set": update_data})
        
        return {"success": True, "message": "Customer updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/customers/{customer_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "delete"))])
async def delete_customer(
    customer_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Delete customer"""
    try:
        query = {"customer_id": customer_id}
        if org_id:
            query["org_id"] = org_id
        
        result = await db.parties_customers.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        return {"success": True, "message": "Customer deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VENDORS ====================

@router.get("/vendors", dependencies=[Depends(require_permission("vendors", "view"))])
async def get_vendors(
    org_id: Optional[str] = Depends(get_org_scope),
    search: Optional[str] = None,
    status: Optional[str] = None,
    vendor_type: Optional[str] = None
):
    """Get all vendors"""
    try:
        query = {"org_id": org_id} if org_id else {}
        
        if search:
            query["$or"] = [
                {"display_name": {"$regex": search, "$options": "i"}},
                {"legal_name": {"$regex": search, "$options": "i"}},
                {"vendor_id": {"$regex": search, "$options": "i"}}
            ]
        
        if status:
            query["status"] = status
        
        if vendor_type:
            query["vendor_type"] = vendor_type
        
        vendors = await db.vendors.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "vendors": vendors, "count": len(vendors)}
    except Exception as e:
        return {"success": False, "vendors": [], "error": str(e)}

@router.post("/vendors", dependencies=[Depends(require_active_subscription), Depends(require_permission("vendors", "create"))])
async def create_vendor(
    vendor_data: VendorCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Create new vendor"""
    try:
        vendor_id = f"VEND-{uuid4().hex[:8].upper()}"
        party_id = f"PARTY-{uuid4().hex[:8].upper()}"
        
        vendor_doc = vendor_data.dict()
        vendor_doc.update({
            "vendor_id": vendor_id,
            "party_id": party_id,
            "party_category": PartyCategory.VENDOR,
            "org_id": org_id,
            "created_by": "system",
            "created_at": datetime.now(timezone.utc),
            "last_modified_by": "system",
            "last_modified_at": datetime.now(timezone.utc)
        })
        
        await db.vendors.insert_one(vendor_doc)
        
        return {"success": True, "message": "Vendor created successfully", "vendor": {**vendor_doc, "_id": None}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PARTNERS ====================

@router.get("/partners", dependencies=[Depends(require_permission("partners", "view"))])
async def get_partners(
    org_id: Optional[str] = Depends(get_org_scope),
    search: Optional[str] = None,
    status: Optional[str] = None,
    partner_type: Optional[str] = None
):
    """Get all partners"""
    try:
        query = {"org_id": org_id} if org_id else {}
        
        if search:
            query["$or"] = [
                {"display_name": {"$regex": search, "$options": "i"}},
                {"legal_name": {"$regex": search, "$options": "i"}},
                {"partner_id": {"$regex": search, "$options": "i"}}
            ]
        
        if status:
            query["status"] = status
            
        if partner_type:
            query["partner_type"] = partner_type
        
        partners = await db.partners.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "partners": partners, "count": len(partners)}
    except Exception as e:
        return {"success": False, "partners": [], "error": str(e)}

@router.get("/partners/{partner_id}", dependencies=[Depends(require_permission("partners", "view"))])
async def get_partner(
    partner_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Get partner by ID"""
    try:
        query = {"partner_id": partner_id}
        if org_id:
            query["org_id"] = org_id
        
        partner = await db.partners.find_one(query, {"_id": 0})
        if not partner:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        return {"success": True, "partner": partner}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/partners", dependencies=[Depends(require_active_subscription), Depends(require_permission("partners", "create"))])
async def create_partner(
    partner_data: PartnerCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Create new partner"""
    try:
        partner_id = f"PART-{uuid4().hex[:8].upper()}"
        party_id = f"PARTY-{uuid4().hex[:8].upper()}"
        
        partner_doc = partner_data.dict()
        partner_doc.update({
            "partner_id": partner_id,
            "party_id": party_id,
            "party_category": PartyCategory.PARTNER,
            "org_id": org_id,
            "created_by": "system",
            "created_at": datetime.now(timezone.utc),
            "last_modified_by": "system",
            "last_modified_at": datetime.now(timezone.utc)
        })
        
        await db.partners.insert_one(partner_doc)
        return {"success": True, "message": "Partner created successfully", "partner": {**partner_doc, "_id": None}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/partners/{partner_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("partners", "edit"))])
async def update_partner(
    partner_id: str,
    partner_data: PartnerCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Update partner"""
    try:
        query = {"partner_id": partner_id}
        if org_id:
            query["org_id"] = org_id
        
        existing = await db.partners.find_one(query, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        update_data = partner_data.dict()
        update_data["last_modified_by"] = "system"
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        await db.partners.update_one(query, {"$set": update_data})
        
        return {"success": True, "message": "Partner updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/partners/{partner_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("partners", "delete"))])
async def delete_partner(
    partner_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Delete partner"""
    try:
        query = {"partner_id": partner_id}
        if org_id:
            query["org_id"] = org_id
        
        result = await db.partners.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Partner not found")
        
        return {"success": True, "message": "Partner deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== CHANNELS ====================

@router.get("/channels", dependencies=[Depends(require_permission("channels", "view"))])
async def get_channels(
    org_id: Optional[str] = Depends(get_org_scope),
    search: Optional[str] = None,
    status: Optional[str] = None,
    channel_type: Optional[str] = None
):
    """Get all channels"""
    try:
        query = {"org_id": org_id} if org_id else {}
        
        if search:
            query["$or"] = [
                {"channel_name": {"$regex": search, "$options": "i"}},
                {"channel_id": {"$regex": search, "$options": "i"}}
            ]
        
        if status:
            query["status"] = status
            
        if channel_type:
            query["channel_type"] = channel_type
        
        channels = await db.channels.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "channels": channels, "count": len(channels)}
    except Exception as e:
        return {"success": False, "channels": [], "error": str(e)}

@router.get("/channels/{channel_id}", dependencies=[Depends(require_permission("channels", "view"))])
async def get_channel(
    channel_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Get channel by ID"""
    try:
        query = {"channel_id": channel_id}
        if org_id:
            query["org_id"] = org_id
        
        channel = await db.channels.find_one(query, {"_id": 0})
        if not channel:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        return {"success": True, "channel": channel}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/channels", dependencies=[Depends(require_active_subscription), Depends(require_permission("channels", "create"))])
async def create_channel(
    channel_data: ChannelCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Create new channel"""
    try:
        channel_id = f"CHAN-{uuid4().hex[:8].upper()}"
        
        channel_doc = channel_data.dict()
        channel_doc.update({
            "channel_id": channel_id,
            "org_id": org_id,
            "created_by": "system",
            "created_at": datetime.now(timezone.utc),
            "last_modified_by": "system",
            "last_modified_at": datetime.now(timezone.utc)
        })
        
        await db.channels.insert_one(channel_doc)
        return {"success": True, "message": "Channel created successfully", "channel": {**channel_doc, "_id": None}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/channels/{channel_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("channels", "edit"))])
async def update_channel(
    channel_id: str,
    channel_data: ChannelCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Update channel"""
    try:
        query = {"channel_id": channel_id}
        if org_id:
            query["org_id"] = org_id
        
        existing = await db.channels.find_one(query, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        update_data = channel_data.dict()
        update_data["last_modified_by"] = "system"
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        await db.channels.update_one(query, {"$set": update_data})
        
        return {"success": True, "message": "Channel updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/channels/{channel_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("channels", "delete"))])
async def delete_channel(
    channel_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Delete channel"""
    try:
        query = {"channel_id": channel_id}
        if org_id:
            query["org_id"] = org_id
        
        result = await db.channels.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Channel not found")
        
        return {"success": True, "message": "Channel deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== PROFILES ====================

@router.get("/profiles", dependencies=[Depends(require_permission("profiles", "view"))])
async def get_profiles(
    org_id: Optional[str] = Depends(get_org_scope),
    search: Optional[str] = None,
    profile_type: Optional[str] = None,
    status: Optional[str] = None
):
    """Get all profiles"""
    try:
        query = {"org_id": org_id} if org_id else {}
        
        if search:
            query["$or"] = [
                {"profile_name": {"$regex": search, "$options": "i"}},
                {"profile_id": {"$regex": search, "$options": "i"}}
            ]
        
        if profile_type:
            query["profile_type"] = profile_type
            
        if status:
            query["status"] = status
        
        profiles = await db.profiles.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        return {"success": True, "profiles": profiles, "count": len(profiles)}
    except Exception as e:
        return {"success": False, "profiles": [], "error": str(e)}

@router.get("/profiles/{profile_id}", dependencies=[Depends(require_permission("profiles", "view"))])
async def get_profile(
    profile_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Get profile by ID"""
    try:
        query = {"profile_id": profile_id}
        if org_id:
            query["org_id"] = org_id
        
        profile = await db.profiles.find_one(query, {"_id": 0})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {"success": True, "profile": profile}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/profiles", dependencies=[Depends(require_active_subscription), Depends(require_permission("profiles", "create"))])
async def create_profile(
    profile_data: ProfileCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Create new profile"""
    try:
        profile_id = f"PROF-{uuid4().hex[:8].upper()}"
        
        profile_doc = profile_data.dict()
        profile_doc.update({
            "profile_id": profile_id,
            "org_id": org_id,
            "created_by": "system",
            "created_at": datetime.now(timezone.utc),
            "last_modified_by": "system",
            "last_modified_at": datetime.now(timezone.utc)
        })
        
        await db.profiles.insert_one(profile_doc)
        return {"success": True, "message": "Profile created successfully", "profile": {**profile_doc, "_id": None}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/profiles/{profile_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("profiles", "edit"))])
async def update_profile(
    profile_id: str,
    profile_data: ProfileCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Update profile"""
    try:
        query = {"profile_id": profile_id}
        if org_id:
            query["org_id"] = org_id
        
        existing = await db.profiles.find_one(query, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        update_data = profile_data.dict()
        update_data["last_modified_by"] = "system"
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        await db.profiles.update_one(query, {"$set": update_data})
        
        return {"success": True, "message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/profiles/{profile_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("profiles", "delete"))])
async def delete_profile(
    profile_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Delete profile"""
    try:
        query = {"profile_id": profile_id}
        if org_id:
            query["org_id"] = org_id
        
        result = await db.profiles.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        return {"success": True, "message": "Profile deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==================== VENDORS DETAIL/UPDATE/DELETE ====================

@router.get("/vendors/{vendor_id}", dependencies=[Depends(require_permission("vendors", "view"))])
async def get_vendor(
    vendor_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Get vendor by ID"""
    try:
        query = {"vendor_id": vendor_id}
        if org_id:
            query["org_id"] = org_id
        
        vendor = await db.vendors.find_one(query, {"_id": 0})
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        return {"success": True, "vendor": vendor}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/vendors/{vendor_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("vendors", "edit"))])
async def update_vendor(
    vendor_id: str,
    vendor_data: VendorCreate,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Update vendor"""
    try:
        query = {"vendor_id": vendor_id}
        if org_id:
            query["org_id"] = org_id
        
        existing = await db.vendors.find_one(query, {"_id": 0})
        if not existing:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        update_data = vendor_data.dict()
        update_data["last_modified_by"] = "system"
        update_data["last_modified_at"] = datetime.now(timezone.utc)
        
        await db.vendors.update_one(query, {"$set": update_data})
        
        return {"success": True, "message": "Vendor updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/vendors/{vendor_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("vendors", "delete"))])
async def delete_vendor(
    vendor_id: str,
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Delete vendor"""
    try:
        query = {"vendor_id": vendor_id}
        if org_id:
            query["org_id"] = org_id
        
        result = await db.vendors.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vendor not found")
        
        return {"success": True, "message": "Vendor deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



# ==================== DASHBOARD & BULK OPERATIONS ====================

@router.get("/dashboard/stats", dependencies=[Depends(require_permission("customers", "view"))])
async def get_dashboard_stats(
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Get dashboard statistics for all party types"""
    try:
        query = {"org_id": org_id} if org_id else {}
        
        # Get counts for each party type
        customers = await db.parties_customers.count_documents(query)
        vendors = await db.vendors.count_documents(query)
        partners = await db.partners.count_documents(query)
        channels = await db.channels.count_documents(query)
        profiles = await db.profiles.count_documents(query)
        
        # Get active counts
        active_query = {**query, "status": "active"}
        customers_active = await db.parties_customers.count_documents(active_query)
        vendors_active = await db.vendors.count_documents(active_query)
        partners_active = await db.partners.count_documents(active_query)
        channels_active = await db.channels.count_documents(active_query)
        profiles_active = await db.profiles.count_documents(active_query)
        
        # Get critical vendors
        critical_query = {**query, "critical_vendor_flag": True}
        critical_vendors = await db.vendors.count_documents(critical_query)
        
        return {
            "success": True,
            "stats": {
                "customers": {"total": customers, "active": customers_active},
                "vendors": {"total": vendors, "active": vendors_active, "critical": critical_vendors},
                "partners": {"total": partners, "active": partners_active},
                "channels": {"total": channels, "active": channels_active},
                "profiles": {"total": profiles, "active": profiles_active}
            }
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

@router.post("/bulk/customers", dependencies=[Depends(require_active_subscription), Depends(require_permission("customers", "create"))])
async def bulk_create_customers(
    customers_data: List[CustomerCreate],
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Bulk create customers"""
    try:
        created = []
        errors = []
        
        for idx, customer_data in enumerate(customers_data):
            try:
                customer_id = f"CUST-{uuid4().hex[:8].upper()}"
                party_id = f"PARTY-{uuid4().hex[:8].upper()}"
                
                customer_doc = customer_data.dict()
                customer_doc.update({
                    "customer_id": customer_id,
                    "party_id": party_id,
                    "party_category": PartyCategory.CUSTOMER,
                    "org_id": org_id,
                    "created_by": "system",
                    "created_at": datetime.now(timezone.utc)
                })
                
                await db.parties_customers.insert_one(customer_doc)
                created.append(customer_id)
            except Exception as e:
                errors.append({"index": idx, "error": str(e)})
        
        return {
            "success": True,
            "message": f"Created {len(created)} customers",
            "created": created,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk/vendors", dependencies=[Depends(require_active_subscription), Depends(require_permission("vendors", "create"))])
async def bulk_create_vendors(
    vendors_data: List[VendorCreate],
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Bulk create vendors"""
    try:
        created = []
        errors = []
        
        for idx, vendor_data in enumerate(vendors_data):
            try:
                vendor_id = f"VEND-{uuid4().hex[:8].upper()}"
                party_id = f"PARTY-{uuid4().hex[:8].upper()}"
                
                vendor_doc = vendor_data.dict()
                vendor_doc.update({
                    "vendor_id": vendor_id,
                    "party_id": party_id,
                    "party_category": PartyCategory.VENDOR,
                    "org_id": org_id,
                    "created_by": "system",
                    "created_at": datetime.now(timezone.utc)
                })
                
                await db.vendors.insert_one(vendor_doc)
                created.append(vendor_id)
            except Exception as e:
                errors.append({"index": idx, "error": str(e)})
        
        return {
            "success": True,
            "message": f"Created {len(created)} vendors",
            "created": created,
            "errors": errors
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/bulk/delete", dependencies=[Depends(require_active_subscription)])
async def bulk_delete_parties(
    party_type: str,
    party_ids: List[str],
    org_id: Optional[str] = Depends(get_org_scope)
):
    """Bulk delete parties"""
    try:
        collection_map = {
            "customers": ("customers", "customer_id"),
            "vendors": ("vendors", "vendor_id"),
            "partners": ("partners", "partner_id"),
            "channels": ("channels", "channel_id"),
            "profiles": ("profiles", "profile_id")
        }
        
        if party_type not in collection_map:
            raise HTTPException(status_code=400, detail="Invalid party type")
        
        collection_name, id_field = collection_map[party_type]
        collection = db[collection_name]
        
        query = {id_field: {"$in": party_ids}}
        if org_id:
            query["org_id"] = org_id
        
        result = await collection.delete_many(query)
        
        return {
            "success": True,
            "message": f"Deleted {result.deleted_count} {party_type}",
            "deleted_count": result.deleted_count
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
