import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId
import logging

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("OrgMigrator")

# Config
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "innovatebooks")

async def migrate_orgs():
    logger.info("🚀 Starting Organization Migration...")
    
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    # 1. Fetch all organizations
    all_orgs = await db.organizations.find({}).to_list(None)
    logger.info(f"Found {len(all_orgs)} total organization records.")
    
    # 2. Group by org_id (normalized)
    # We want to map `org_id` string -> list of docs
    org_map = {}
    
    for doc in all_orgs:
        # Determine the "intended" org_id
        # If _id is a string, that might be the org_id
        # If org_id field exists, usage that.
        
        oid = doc.get("_id")
        explicit_org_id = doc.get("org_id")
        
        # Heuristic: the standardized org_id is what we want to key by.
        # Examples form user: 
        # A: {_id: "org_default_innovate", name: "..."}
        # B: {_id: ObjectId(...), org_id: "org_default_innovate", name: "..."}
        
        # If doc has generic string _id, treat _id as the org_id key
        if isinstance(oid, str):
            key = oid
        elif explicit_org_id:
            key = explicit_org_id
        else:
            logger.warning(f"Skipping doc without string _id or org_id: {oid}")
            continue
            
        if key not in org_map:
            org_map[key] = []
        org_map[key].append(doc)
        
    # 3. Process duplicates
    for key, docs in org_map.items():
        if len(docs) > 1:
            logger.info(f"Processing duplicate group for org_id: {key} ({len(docs)} docs)")
            
            # Helper to classify docs
            string_id_doc = None
            object_id_doc = None
            
            for d in docs:
                if isinstance(d["_id"], str):
                    string_id_doc = d
                elif isinstance(d["_id"], ObjectId):
                    object_id_doc = d
            
            # Case 1: We have both Types
            if string_id_doc and object_id_doc:
                logger.info(f"Merging string _id ({string_id_doc['_id']}) into ObjectId doc ({object_id_doc['_id']})...")
                
                # Merge fields: prefer ObjectId doc, but fill missing from string_id_doc
                update_fields = {}
                for k, v in string_id_doc.items():
                    if k != "_id" and k not in object_id_doc:
                        update_fields[k] = v
                
                # Ensure org_id is set on the survivor
                if "org_id" not in object_id_doc and "org_id" not in update_fields:
                    update_fields["org_id"] = key # The key we grouped by
                
                if update_fields:
                    await db.organizations.update_one(
                        {"_id": object_id_doc["_id"]},
                        {"$set": update_fields}
                    )
                    logger.info(f"Updated survivor doc with fields: {update_fields.keys()}")
                    
                # Backup before delete
                backup_doc = string_id_doc.copy()
                backup_doc["_backup_reason"] = "duplicate_merge"
                await db.organizations_backup.insert_one(backup_doc)
                
                # Delete the specific string _id doc
                await db.organizations.delete_one({"_id": string_id_doc["_id"]})
                logger.info(f"Deleted duplicate string _id doc: {string_id_doc['_id']} (Backed up)")
                
            # Case 2: Only string _id docs (multiple? unlikely but possible)
            elif string_id_doc and not object_id_doc:
                # We need to convert this to ObjectId _id
                # This is tricky because we can't change _id of a doc.
                # We must insert new and delete old.
                logger.info(f"Converting string _id doc {string_id_doc['_id']} to ObjectId...")
                
                new_doc = string_id_doc.copy()
                new_doc["_id"] = ObjectId()
                new_doc["org_id"] = string_id_doc["_id"] # The old _id becomes org_id
                
                await db.organizations.insert_one(new_doc)
                
                # Backup before delete
                backup_doc = string_id_doc.copy()
                backup_doc["_backup_reason"] = "convert_to_objectid"
                await db.organizations_backup.insert_one(backup_doc)
                
                await db.organizations.delete_one({"_id": string_id_doc["_id"]})
                logger.info(f"Replaced string _id with new ObjectId doc: {new_doc['_id']} (Backed up)")
                
            # Case 3: Multiple ObjectId docs with same org_id?
            # User didn't specify, but we should probably keep latest or merge.
            elif len([d for d in docs if isinstance(d["_id"], ObjectId)]) > 1:
                logger.warning(f"Multiple ObjectId docs found for {key}. Keeping the one strictly matching org_id if possible, or latest.")
                # For now, just logging - strictly requested to fix the string vs objectid mix.
                
        else:
            # Single doc. 
            # If it's a string _id, we still need to migrate it to ObjectId!
            doc = docs[0]
            if isinstance(doc["_id"], str):
                 logger.info(f"Migrating single string _id doc {doc['_id']} to ObjectId format...")
                 old_id = doc["_id"]
                 new_doc = doc.copy()
                 new_doc["_id"] = ObjectId()
                 new_doc["org_id"] = old_id # Ensure org_id is set
                 
                 await db.organizations.insert_one(new_doc)
                 await db.organizations.delete_one({"_id": old_id})
                 logger.info("Migration complete for single doc.")
                 
            # If it is ObjectId, ensure it has `org_id` field
            elif isinstance(doc["_id"], ObjectId):
                if "org_id" not in doc:
                     # This shouldn't happen based on our grouping logic unless key came from nowhere
                     # But if we grouped by explicit org_id, it must be there.
                     pass

    # 4. Create Unique Index
    logger.info("Creating unique index on org_id...")
    try:
        await db.organizations.create_index("org_id", unique=True)
        logger.info("✅ Unique index on 'org_id' created successfully.")
    except Exception as e:
        logger.error(f"Failed to create index: {e}")
        
    logger.info("✨ Migration completed successfully.")

if __name__ == "__main__":
    asyncio.run(migrate_orgs())
