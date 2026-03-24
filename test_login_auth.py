import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

async def main():
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
    client = AsyncIOMotorClient(MONGO_URI)
    db = client.get_database("innovate_books_db")
    
    with open("fix_verification.txt", "w") as f:
        # 1. Final demo user org mappings
        f.write("=== Demo user org mappings (final state) ===\n")
        mappings = await db.org_users.find({"user_id": "demo_user_id"}).to_list(None)
        for m in mappings:
            f.write(f"  org_id={m.get('org_id')}, status={m.get('status')}, is_active={m.get('is_active')}, role={m.get('role')}\n")

        # 2. Simulate lead listing query for org_default_innovate
        f.write("\n=== Lead count that demo user can NOW see (org_default_innovate) ===\n")
        wf_count = await db.revenue_workflow_leads.count_documents({"org_id": "org_default_innovate"})
        rev_count = await db.revenue_leads.count_documents({"org_id": "org_default_innovate"})
        f.write(f"  revenue_workflow_leads: {wf_count}\n")
        f.write(f"  revenue_leads: {rev_count}\n")
        
        # 3. What login will give: org_id from org_users active + is_active mappings
        f.write("\n=== What single org_id login will resolve to ===\n")
        active_maps = await db.org_users.find({"user_id": "demo_user_id", "status": "active", "is_active": True}).to_list(50)
        f.write(f"  Number of active org mappings: {len(active_maps)}\n")
        for m in active_maps:
            f.write(f"  -> org_id: {m.get('org_id')} (role={m.get('role')})\n")
        if len(active_maps) == 1:
            f.write(f"\n  => Login will directly issue JWT with org_id={active_maps[0]['org_id']} (no tenant selection screen)\n")
        else:
            f.write(f"\n  => Login will show tenant selection to user\n")

if __name__ == "__main__":
    asyncio.run(main())
