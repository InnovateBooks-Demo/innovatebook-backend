import asyncio
import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

async def migrate_users():
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    db_name = os.environ.get('DB_NAME', 'innovatebook_cloud')
    
    # Use certifi for TLS verification, needed for some Atlas clusters
    client = AsyncIOMotorClient(mongo_url, tlsCAFile=certifi.where())
    db = client[db_name]

    logger.info("Starting enterprise_users to users migration...")

    ent_users = await db.enterprise_users.find({}).to_list(None)
    logger.info(f"Found {len(ent_users)} enterprise users to migrate.")

    migrated_count = 0
    skipped_count = 0

    for ent_user in ent_users:
        if not ent_user.get("email"):
            logger.warning(f"Enterprise user missing email: {ent_user.get('user_id')}")
            continue
            
        # Check if user already exists
        existing = await db.users.find_one({"email": ent_user["email"]})
        if existing:
            # Maybe update the existing one with enterprise flags
            update_data = {}
            if ent_user.get("is_super_admin"):
                update_data["is_super_admin"] = ent_user["is_super_admin"]
            if ent_user.get("role_id"):
                update_data["role_id"] = ent_user["role_id"]
                
            if update_data:
                await db.users.update_one(
                    {"_id": existing["_id"]},
                    {"$set": update_data}
                )
                logger.info(f"Updated existing user {existing['email']} with enterprise flags.")
            skipped_count += 1
            continue

        # Map to users schema
        user_doc = {
            "id": ent_user.get("user_id"),
            "user_id": ent_user.get("user_id"),
            "email": ent_user.get("email"),
            "full_name": ent_user.get("full_name"),
            "role": "admin", # Default role
            "role_id": ent_user.get("role_id"),
            "password_hash": ent_user.get("password_hash"),
            "email_verified": True,
            "status": "active" if ent_user.get("is_active", True) else "inactive",
            "is_active": ent_user.get("is_active", True),
            "created_at": ent_user.get("created_at"),
            "updated_at": ent_user.get("updated_at"),
            "org_id": ent_user.get("org_id"),
            "is_super_admin": ent_user.get("is_super_admin", False)
        }

        await db.users.insert_one(user_doc)
        migrated_count += 1
        logger.info(f"Migrated user {user_doc['email']}.")

    logger.info(f"Migration complete. Migrated: {migrated_count}, Skipped (already exist): {skipped_count}")

if __name__ == "__main__":
    asyncio.run(migrate_users())
