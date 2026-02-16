
import os
import asyncio
import logging
import argparse
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Load env
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'innovate_books_db')

async def get_mapping(db):
    """
    Builds a mapping from legacy user_id -> canonical users._id
    Bridge: enterprise_users (user_id -> email) -> users (email -> _id)
    """
    mapping = {}
    email_to_canonical = {}

    # 1. Map email to canonical _id from 'users' collection
    async for user in db.users.find({}, {"_id": 1, "email": 1}):
        email = user.get("email")
        if email:
            email_to_canonical[email.strip().lower()] = user["_id"]

    # 2. Map legacy user_id to email from 'enterprise_users'
    async for ent_user in db.enterprise_users.find({}, {"user_id": 1, "email": 1}):
        legacy_id = ent_user.get("user_id")
        email = ent_user.get("email")
        if legacy_id and email:
            email = email.strip().lower()
            if email in email_to_canonical:
                mapping[legacy_id] = email_to_canonical[email]
    
    return mapping

def is_legacy(uid):
    if not uid: return False
    return isinstance(uid, str) and (uid.startswith("usr_") or uid.startswith("USR-"))

async def normalize_chats(db, mapping, dry_run=True):
    chats_to_update = []
    async for chat in db.workspace_chats.find({}):
        participants = chat.get("participants", [])
        new_participants = []
        changed = False

        for p in participants:
            if is_legacy(p):
                if p in mapping:
                    new_participants.append(mapping[p])
                    changed = True
                else:
                    logger.warning(f"No mapping found for legacy participant: {p} in chat {chat['_id']}")
                    new_participants.append(p)
            else:
                new_participants.append(p)
        
        # Deduplicate and sort (cast to str for consistent sorting)
        new_participants = sorted(list(set(str(p) for p in new_participants)))
        if len(new_participants) != len(participants) or changed:
            changed = True

        created_by = chat.get("created_by")
        new_created_by = created_by
        if is_legacy(created_by):
            if created_by in mapping:
                new_created_by = mapping[created_by]
                changed = True
            else:
                logger.warning(f"No mapping found for creator: {created_by} in chat {chat['_id']}")

        if changed:
            # Backfill org_id from context if missing
            org_id = chat.get("org_id")
            if not org_id:
                context = await db.workspace_contexts.find_one({"context_id": chat.get("context_id")}, {"org_id": 1})
                if context:
                    org_id = context.get("org_id")
            
            chats_to_update.append({
                "_id": chat["_id"],
                "participants": new_participants,
                "created_by": new_created_by,
                "org_id": org_id,
                "old_participants": participants,
                "context_id": chat.get("context_id")
            })

    logger.info(f"Found {len(chats_to_update)} chats to normalize.")

    if not dry_run:
        for update in chats_to_update:
            upd = {
                "participants": update["participants"],
                "created_by": update["created_by"],
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            if update.get("org_id"):
                upd["org_id"] = update["org_id"]

            await db.workspace_chats.update_one(
                {"_id": update["_id"]},
                {"$set": upd}
            )
        logger.info("Chat normalization complete.")
    else:
        for update in chats_to_update:
            logger.info(f"[DRY-RUN] Would update chat {update['_id']} (context: {update.get('context_id')}) participants: {update['old_participants']} -> {update['participants']} (org_id: {update.get('org_id')})")

    return chats_to_update

async def normalize_messages(db, mapping, dry_run=True):
    messages_to_update = []
    # Search for messages with legacy sender_id
    # We use a regex to find IDs starting with usr_ or USR-
    async for msg in db.workspace_chat_messages.find({
        "$or": [
            {"sender_id": {"$regex": "^(usr_|USR-)"}},
            {"delivered_to": {"$regex": "^(usr_|USR-)"}},
            {"read_by": {"$regex": "^(usr_|USR-)"}}
        ]
    }):
        sender_id = msg.get("sender_id")
        new_sender_id = sender_id
        changed = False

        if is_legacy(sender_id):
            if sender_id in mapping:
                new_sender_id = mapping[sender_id]
                changed = True
        
        delivered_to = msg.get("delivered_to", [])
        new_delivered_to = []
        for d in delivered_to:
            if is_legacy(d) and d in mapping:
                new_delivered_to.append(mapping[d])
                changed = True
            else:
                new_delivered_to.append(d)
        
        read_by = msg.get("read_by", [])
        new_read_by = []
        for r in read_by:
            if is_legacy(r) and r in mapping:
                new_read_by.append(mapping[r])
                changed = True
            else:
                new_read_by.append(r)

        if changed:
            messages_to_update.append({
                "_id": msg["_id"],
                "sender_id": new_sender_id,
                "delivered_to": list(set(new_delivered_to)),
                "read_by": list(set(new_read_by))
            })

    logger.info(f"Found {len(messages_to_update)} messages to normalize.")

    if not dry_run:
        for update in messages_to_update:
            await db.workspace_chat_messages.update_one(
                {"_id": update["_id"]},
                {"$set": {
                    "sender_id": update["sender_id"],
                    "delivered_to": update["delivered_to"],
                    "read_by": update["read_by"]
                }}
            )
        logger.info("Message normalization complete.")
    else:
        for update in messages_to_update:
            logger.info(f"[DRY-RUN] Would update message {update['_id']} sender: {update['sender_id']}")

async def deduplicate_chats(db, dry_run=True):
    """
    Find chats that have the same participants and context_id after normalization.
    """
    # This should be run AFTER normalization or as part of the analysis
    # For now, we'll just group by context_id and participants
    seen = {} # (context_id, tuple(participants)) -> chat_id
    duplicates = []

    async for chat in db.workspace_chats.find({}):
        participants = tuple(sorted(str(p) for p in chat.get("participants", [])))
        context_id = chat.get("context_id")
        key = (context_id, participants)

        if key in seen:
            duplicates.append({
                "keep": seen[key],
                "remove": chat["_id"],
                "context_id": context_id,
                "participants": participants
            })
        else:
            seen[key] = chat["_id"]

    logger.info(f"Found {len(duplicates)} duplicate chats.")

    if not dry_run:
        for dup in duplicates:
            # Transfer messages to the 'keep' chat
            await db.workspace_chat_messages.update_many(
                {"chat_id": str(dup["remove"])},
                {"$set": {"chat_id": str(dup["keep"])}}
            )
            # Remove the duplicate chat
            await db.workspace_chats.delete_one({"_id": dup["remove"]})
        logger.info("Deduplication complete.")
    else:
        for dup in duplicates:
            logger.info(f"[DRY-RUN] Would merge chat {dup['remove']} into {dup['keep']} (context: {dup['context_id']})")

async def main():
    parser = argparse.ArgumentParser(description="Normalize Chat IDs")
    parser.add_argument("--dry-run", action="store_true", default=True, help="Run without changes")
    parser.add_argument("--execute", action="store_false", dest="dry_run", help="Run with changes")
    args = parser.parse_args()

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    logger.info(f"Starting migration on {DB_NAME} (dry_run={args.dry_run})")

    mapping = await get_mapping(db)
    logger.info(f"Loaded {len(mapping)} user mappings.")

    await normalize_chats(db, mapping, args.dry_run)
    await normalize_messages(db, mapping, args.dry_run)
    await deduplicate_chats(db, args.dry_run)

    if not args.dry_run:
        logger.info("Creating indexes for future consistency...")
        await db.workspace_chats.create_index([("participants", 1)])
        await db.workspace_chats.create_index([("context_id", 1), ("org_id", 1)])
        await db.workspace_chat_messages.create_index([("chat_id", 1), ("created_at", 1)])
        logger.info("Indexes created.")

    logger.info("Migration process finished.")

if __name__ == "__main__":
    asyncio.run(main())
