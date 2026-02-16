import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, date, timedelta
import uuid

mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'innovate_books')]

sample_executions = [
    {
        "id": str(uuid.uuid4()),
        "execution_id": "EXEC-2025-001",
        "commit_id": "COMM-2025-004",
        "order_id": "ORD-2025-001",
        "execution_type": "Service",
        "scheduled_date": date.today().isoformat(),
        "description": "TechVision Enterprise Software Deployment",
        "execution_status": "In Progress",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "execution_id": "EXEC-2025-002",
        "commit_id": "COMM-2025-003",
        "order_id": "ORD-2025-002",
        "execution_type": "Milestone",
        "scheduled_date": (date.today() + timedelta(days=7)).isoformat(),
        "description": "Retail King Platform Phase 1 Delivery",
        "execution_status": "Scheduled",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    },
    {
        "id": str(uuid.uuid4()),
        "execution_id": "EXEC-2025-003",
        "commit_id": "COMM-2025-002",
        "order_id": "ORD-2025-003",
        "execution_type": "Delivery",
        "scheduled_date": (date.today() - timedelta(days=10)).isoformat(),
        "description": "HC Plus Hospital System Installation",
        "execution_status": "Completed",
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
]

async def seed_executions():
    try:
        result = await db.commerce_execute.delete_many({})
        print(f"Cleared {result.deleted_count} existing executions")
        
        result = await db.commerce_execute.insert_many(sample_executions)
        print(f"✅ Successfully seeded {len(result.inserted_ids)} sample executions")
        
        count = await db.commerce_execute.count_documents({})
        print(f"Total executions in database: {count}")
        
        print("\nSeeded Executions Summary:")
        for execution in sample_executions:
            print(f"  - {execution['execution_id']}: {execution['description']} ({execution['execution_status']})")
        
    except Exception as e:
        print(f"❌ Error seeding executions: {str(e)}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(seed_executions())
