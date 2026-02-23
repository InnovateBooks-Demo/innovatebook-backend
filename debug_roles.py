import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def check_all_roles():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Check all roles
    roles = await db.roles.find({}).to_list(100)
    print('All Roles:')
    for role in roles:
        print(f'  - {role.get("role_id")}: {role.get("role_name")}')
    
    print('\n' + '='*80)
    
    # Check permissions for admin role
    admin_perms = await db.role_permissions.find({'role_id': 'admin'}).to_list(1000)
    print(f'\nAdmin role permissions: {len(admin_perms)} total')
    for perm in admin_perms[:20]:
        print(f'  - Submodule: {perm.get("submodule_id")}, Granted: {perm.get("granted")}')
    
    print('\n' + '='*80)
    
    # Check permissions for member role
    member_perms = await db.role_permissions.find({'role_id': 'member'}).to_list(1000)
    print(f'\nMember role permissions: {len(member_perms)} total')
    for perm in member_perms:
        print(f'  - Submodule: {perm.get("submodule_id")}, Granted: {perm.get("granted")}')
    
    print('\n' + '='*80)
    
    # Check if admin role has customers.view permission
    admin_customer_view = await db.role_permissions.find_one({
        'role_id': 'admin',
        'submodule_id': 'customers.view'
    })
    print(f'\nAdmin has customers.view permission: {admin_customer_view}')

asyncio.run(check_all_roles())
