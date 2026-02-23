import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_permissions():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    user_id = '75aa8f5a-7351-4851-b94a-3a4283c5b7a7'
    
    # Check user
    user = await db.enterprise_users.find_one({'user_id': user_id})
    print('User:', user)
    
    if not user:
        print('User not found!')
        return
    
    role_id = user.get('role_id')
    print(f'\nRole ID: {role_id}')
    print(f'Is Super Admin: {user.get("is_super_admin")}')
    
    # Check submodule
    submodule = await db.submodules.find_one({'submodule_name': 'customers.view'})
    print(f'\nSubmodule "customers.view":', submodule)
    
    if submodule:
        # Check permissions
        perms = await db.role_permissions.find({
            'role_id': role_id,
            'submodule_id': submodule['submodule_id']
        }).to_list(10)
        print(f'\nPermissions for role "{role_id}" on submodule "{submodule["submodule_id"]}":', perms)
    
    # Check all submodules with "customers" in name
    all_customer_submodules = await db.submodules.find({
        'submodule_name': {'$regex': 'customer', '$options': 'i'}
    }).to_list(100)
    print(f'\nAll customer-related submodules:')
    for sm in all_customer_submodules:
        print(f'  - {sm.get("submodule_name")} (ID: {sm.get("submodule_id")})')
    
    # Check all permissions for this role
    all_role_perms = await db.role_permissions.find({'role_id': role_id}).to_list(1000)
    print(f'\nAll permissions for role "{role_id}": {len(all_role_perms)} total')
    for perm in all_role_perms[:10]:
        print(f'  - {perm}')

asyncio.run(check_permissions())
