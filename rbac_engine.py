"""
RBAC Engine - Role-Based Access Control
Handles permission checks at module + submodule level
"""
import logging
from typing import Dict, List, Optional

logger = logging.getLogger(__name__)

# System-level roles
SYSTEM_ROLES = {
    "super_admin": {
        "role_name": "Super Admin",
        "is_system_role": True,
        "permissions": ["*"]  # All permissions
    },
    "org_admin": {
        "role_name": "Organization Admin",
        "is_system_role": True,
        "permissions": ["*"]  # All permissions within org
    }
}

# Module definitions
MODULES = [
    {"module_name": "commerce", "display_name": "Commerce"},
    {"module_name": "finance", "display_name": "Finance"},
    {"module_name": "workforce", "display_name": "Workforce"},
    {"module_name": "operations", "display_name": "Operations"},
    {"module_name": "capital", "display_name": "Capital"},
    {"module_name": "manufacturing", "display_name": "Manufacturing"},
    {"module_name": "admin", "display_name": "Admin Panel"}
]

# Submodule definitions (module.action)
SUBMODULES = {
    "commerce": [
        {"name": "leads.view", "action": "view", "display": "View Leads"},
        {"name": "leads.create", "action": "create", "display": "Create Leads"},
        {"name": "leads.edit", "action": "edit", "display": "Edit Leads"},
        {"name": "leads.delete", "action": "delete", "display": "Delete Leads"},
        {"name": "customers.view", "action": "view", "display": "View Customers"},
        {"name": "customers.create", "action": "create", "display": "Create Customers"},
        {"name": "customers.edit", "action": "edit", "display": "Edit Customers"},
        {"name": "customers.delete", "action": "delete", "display": "Delete Customers"},
        {"name": "vendors.view", "action": "view", "display": "View Vendors"},
        {"name": "vendors.create", "action": "create", "display": "Create Vendors"},
        {"name": "vendors.edit", "action": "edit", "display": "Edit Vendors"},
        {"name": "vendors.delete", "action": "delete", "display": "Delete Vendors"},
        {"name": "partners.view", "action": "view", "display": "View Partners"},
        {"name": "partners.create", "action": "create", "display": "Create Partners"},
        {"name": "partners.edit", "action": "edit", "display": "Edit Partners"},
        {"name": "partners.delete", "action": "delete", "display": "Delete Partners"},
        {"name": "channels.view", "action": "view", "display": "View Channels"},
        {"name": "channels.create", "action": "create", "display": "Create Channels"},
        {"name": "channels.edit", "action": "edit", "display": "Edit Channels"},
        {"name": "channels.delete", "action": "delete", "display": "Delete Channels"},
        {"name": "profiles.view", "action": "view", "display": "View Profiles"},
        {"name": "profiles.create", "action": "create", "display": "Create Profiles"},
        {"name": "profiles.edit", "action": "edit", "display": "Edit Profiles"},
        {"name": "profiles.delete", "action": "delete", "display": "Delete Profiles"},
    ],
    "finance": [
        {"name": "customers.view", "action": "view", "display": "View Customers"},
        {"name": "customers.create", "action": "create", "display": "Create Customers"},
        {"name": "customers.edit", "action": "edit", "display": "Edit Customers"},
        {"name": "customers.delete", "action": "delete", "display": "Delete Customers"},
        {"name": "vendors.view", "action": "view", "display": "View Vendors"},
        {"name": "vendors.create", "action": "create", "display": "Create Vendors"},
        {"name": "vendors.edit", "action": "edit", "display": "Edit Vendors"},
        {"name": "vendors.delete", "action": "delete", "display": "Delete Vendors"},
        {"name": "receivables.view", "action": "view", "display": "View Receivables"},
        {"name": "receivables.create", "action": "create", "display": "Create Receivables"},
        {"name": "receivables.edit", "action": "edit", "display": "Edit Receivables"},
        {"name": "receivables.delete", "action": "delete", "display": "Delete Receivables"},
        {"name": "invoices.view", "action": "view", "display": "View Invoices"},
        {"name": "invoices.create", "action": "create", "display": "Create Invoices"},
        {"name": "invoices.edit", "action": "edit", "display": "Edit Invoices"},
        {"name": "invoices.delete", "action": "delete", "display": "Delete Invoices"},
        {"name": "bills.view", "action": "view", "display": "View Bills"},
        {"name": "bills.create", "action": "create", "display": "Create Bills"},
        {"name": "bills.edit", "action": "edit", "display": "Edit Bills"},
        {"name": "bills.delete", "action": "delete", "display": "Delete Bills"},
        {"name": "collections.view", "action": "view", "display": "View Collections"},
        {"name": "collections.create", "action": "create", "display": "Create Collections"},
        {"name": "aging.view", "action": "view", "display": "View Aging & DSO"},
    ],
    "workforce": [
        {"name": "employees.view", "action": "view", "display": "View Employees"},
        {"name": "employees.create", "action": "create", "display": "Create Employees"},
        {"name": "employees.edit", "action": "edit", "display": "Edit Employees"},
        {"name": "employees.delete", "action": "delete", "display": "Delete Employees"},
    ],
    "operations": [
        {"name": "operations.view", "action": "view", "display": "View Operations"},
        {"name": "operations.create", "action": "create", "display": "Create Operations"},
        {"name": "operations.edit", "action": "edit", "display": "Edit Operations"},
    ],
    "capital": [
        {"name": "capital.view", "action": "view", "display": "View Capital"},
        {"name": "capital.create", "action": "create", "display": "Create Capital"},
    ],
    "manufacturing": [
        {"name": "manufacturing.view", "action": "view", "display": "View Manufacturing"},
        {"name": "manufacturing.create", "action": "create", "display": "Create Manufacturing"},
        {"name": "manufacturing.edit", "action": "edit", "display": "Edit Manufacturing"},
    ],
    "admin": [
        {"name": "roles.manage", "action": "manage", "display": "Manage Roles"},
        {"name": "users.manage", "action": "manage", "display": "Manage Users"},
        {"name": "permissions.manage", "action": "manage", "display": "Manage Permissions"},
    ]
}

async def initialize_modules_and_permissions(db):
    """
    Initialize modules and submodules in database
    Run this once on system setup
    """
    logger.info("🔧 Initializing modules and submodules...")
    
    # Insert modules
    for module_data in MODULES:
        existing = await db.modules.find_one(
            {"module_name": module_data["module_name"]},
            {"_id": 0}
        )
        if not existing:
            module_doc = {
                "module_id": f"mod_{module_data['module_name']}",
                "module_name": module_data["module_name"],
                "display_name": module_data["display_name"],
            }
            await db.modules.insert_one(module_doc)
            logger.info(f"✅ Created module: {module_data['display_name']}")
    
    # Insert submodules
    for module_name, submodules in SUBMODULES.items():
        # Get module_id
        module = await db.modules.find_one(
            {"module_name": module_name},
            {"_id": 0}
        )
        if not module:
            continue
        
        for sub in submodules:
            existing = await db.submodules.find_one(
                {"submodule_name": sub["name"]},
                {"_id": 0}
            )
            if not existing:
                submodule_doc = {
                    "submodule_id": f"sub_{sub['name'].replace('.', '_')}",
                    "module_id": module["module_id"],
                    "submodule_name": sub["name"],
                    "action_type": sub["action"],
                    "display_name": sub["display"]
                }
                await db.submodules.insert_one(submodule_doc)
                logger.info(f"✅ Created submodule: {sub['display']}")
    
    logger.info("🎉 Modules and submodules initialized!")

async def create_system_roles(db):
    """
    Create system-level roles (Org Admin)
    Super Admin is created separately
    """
    logger.info("🔧 Creating system roles...")
    
    for role_key, role_data in SYSTEM_ROLES.items():
        if role_key == "super_admin":
            continue  # Super admin is not an org role
        
        existing = await db.roles.find_one(
            {"role_name": role_data["role_name"], "is_system_role": True},
            {"_id": 0}
        )
        if not existing:
            role_doc = {
                "role_id": f"role_{role_key}",
                "org_id": None,
                "role_name": role_data["role_name"],
                "is_system_role": True
            }
            await db.roles.insert_one(role_doc)
            logger.info(f"✅ Created system role: {role_data['role_name']}")
    
    logger.info("🎉 System roles created!")

async def get_user_permissions(user_id: str, db) -> List[str]:
    """
    Get all permissions for a user
    Returns list of submodule_ids user has access to
    """
    user = await db.enterprise_users.find_one({"user_id": user_id}, {"_id": 0})
    if not user:
        return []
    
    # Super admin has all permissions
    if user.get("is_super_admin"):
        return ["*"]
    
    role_id = user.get("role_id")
    if not role_id:
        return []
    
    # Get permissions for role
    permissions = await db.role_permissions.find(
        {"role_id": role_id, "granted": True},
        {"_id": 0}
    ).to_list(None)
    
    return [p["submodule_id"] for p in permissions]

async def assign_permissions_to_role(role_id: str, submodule_ids: List[str], db):
    """
    Assign multiple permissions to a role
    Removes existing permissions and sets new ones
    """
    # Remove existing permissions
    await db.role_permissions.delete_many({"role_id": role_id})
    
    # Add new permissions
    for submodule_id in submodule_ids:
        permission_doc = {
            "permission_id": f"perm_{role_id}_{submodule_id}",
            "role_id": role_id,
            "submodule_id": submodule_id,
            "granted": True
        }
        await db.role_permissions.insert_one(permission_doc)
    
    logger.info(f"✅ Assigned {len(submodule_ids)} permissions to role {role_id}")
