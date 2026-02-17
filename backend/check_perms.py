import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import json

load_dotenv()

async def main():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Get user
    user = await db.enterprise_users.find_one({'user_id': '75aa8f5a-7351-4851-b94a-3a4283c5b7a7'})
    print(f"User role: {user.get('role_id')}")
    print(f"User is_super_admin: {user.get('is_super_admin')}")
    print(f"User email: {user.get('email')}")
    
    # Count permissions by role
    for role_id in ['admin', 'member', 'manager']:
        count = await db.role_permissions.count_documents({'role_id': role_id, 'granted': True})
        print(f"\n{role_id} role has {count} granted permissions")
    
    # Check if customers.view exists
    submodule = await db.submodules.find_one({'submodule_name': 'customers.view'})
    if submodule:
        print(f"\nSubmodule 'customers.view' exists with ID: {submodule.get('submodule_id')}")
        
        # Check which roles have this permission
        for role_id in ['admin', 'member', 'manager']:
            perm = await db.role_permissions.find_one({
                'role_id': role_id,
                'submodule_id': submodule['submodule_id'],
                'granted': True
            })
            print(f"  {role_id}: {'✓ HAS' if perm else '✗ MISSING'}")

asyncio.run(main())
