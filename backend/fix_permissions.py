"""
Fix Permission Issue - Two Solutions

ISSUE: User 'demo@innovatebooks.com' has role 'member' which has 0 permissions.
This causes 403 Forbidden errors when accessing protected endpoints.

SOLUTION 1 (Quick): Change user's role to 'admin'
SOLUTION 2 (Proper): Grant permissions to 'member' role
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def solution_1_change_user_to_admin():
    """Quick fix: Change user's role from 'member' to 'admin'"""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    user_id = '75aa8f5a-7351-4851-b94a-3a4283c5b7a7'
    
    result = await db.enterprise_users.update_one(
        {'user_id': user_id},
        {'$set': {'role_id': 'admin'}}
    )
    
    print(f"✓ Updated user role to 'admin' (matched: {result.matched_count}, modified: {result.modified_count})")
    
    # Verify
    user = await db.enterprise_users.find_one({'user_id': user_id})
    print(f"✓ User now has role: {user.get('role_id')}")

async def solution_2_grant_permissions_to_member():
    """Proper fix: Copy all admin permissions to member role"""
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Get all admin permissions
    admin_perms = await db.role_permissions.find({'role_id': 'admin', 'granted': True}).to_list(1000)
    
    print(f"Found {len(admin_perms)} admin permissions")
    
    # Create member permissions based on admin permissions
    member_perms = []
    for perm in admin_perms:
        member_perm = {
            'role_id': 'member',
            'submodule_id': perm['submodule_id'],
            'granted': True,
            'created_at': perm.get('created_at', '2026-02-16T00:00:00Z')
        }
        member_perms.append(member_perm)
    
    # Delete existing member permissions (if any)
    delete_result = await db.role_permissions.delete_many({'role_id': 'member'})
    print(f"✓ Deleted {delete_result.deleted_count} existing member permissions")
    
    # Insert new member permissions
    if member_perms:
        insert_result = await db.role_permissions.insert_many(member_perms)
        print(f"✓ Granted {len(insert_result.inserted_ids)} permissions to member role")
    
    # Verify
    count = await db.role_permissions.count_documents({'role_id': 'member', 'granted': True})
    print(f"✓ Member role now has {count} granted permissions")

async def main():
    print("="*80)
    print("PERMISSION FIX SCRIPT")
    print("="*80)
    print("\nChoose a solution:")
    print("1. Quick Fix: Change user to admin role")
    print("2. Proper Fix: Grant all permissions to member role")
    print("\nRunning SOLUTION 1 (Quick Fix)...")
    print("-"*80)
    
    await solution_1_change_user_to_admin()
    
    print("\n" + "="*80)
    print("DONE! The user should now be able to access /api/commerce/parties/customers")
    print("="*80)

if __name__ == "__main__":
    asyncio.run(main())
