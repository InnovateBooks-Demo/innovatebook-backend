"""
IB Workforce Module - Human Capacity, Accountability & Compliance Engine
6 Core Modules: People, Roles, Capacity, Time, Payroll, Compliance
"""
from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime, timezone, timedelta
from typing import Optional
import uuid

router = APIRouter(prefix="/api/ib-workforce", tags=["IB Workforce"])

def get_db():
    from server import db
    return db

async def get_current_user():
    """Get current user - simplified for now"""
    return {"user_id": "admin", "org_id": "org_demo"}


# ==================== HELPER FUNCTIONS ====================

def generate_id(prefix: str) -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}"


# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_workforce_dashboard(current_user: dict = Depends(get_current_user)):
    """Get IB Workforce dashboard metrics"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # People stats
    people_total = await db.wf_people.count_documents({"org_id": org_id, "deleted": {"$ne": True}})
    people_active = await db.wf_people.count_documents({"org_id": org_id, "status": "active", "deleted": {"$ne": True}})
    people_draft = await db.wf_people.count_documents({"org_id": org_id, "status": "draft", "deleted": {"$ne": True}})
    
    # Roles stats
    roles_total = await db.wf_roles.count_documents({"org_id": org_id, "deleted": {"$ne": True}})
    roles_active = await db.wf_roles.count_documents({"org_id": org_id, "is_active": True, "deleted": {"$ne": True}})
    
    # Capacity stats
    capacity_total = await db.wf_capacity.count_documents({"org_id": org_id, "deleted": {"$ne": True}})
    allocations_active = await db.wf_allocations.count_documents({"org_id": org_id, "status": "active", "deleted": {"$ne": True}})
    
    # Time stats
    timesheets_pending = await db.wf_timesheets.count_documents({"org_id": org_id, "status": "submitted", "deleted": {"$ne": True}})
    attendance_today = await db.wf_attendance.count_documents({
        "org_id": org_id, 
        "date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "deleted": {"$ne": True}
    })
    
    # Payroll stats
    payruns_pending = await db.wf_payruns.count_documents({"org_id": org_id, "status": {"$in": ["draft", "calculated"]}, "deleted": {"$ne": True}})
    
    # Compliance stats
    violations_open = await db.wf_compliance_violations.count_documents({"org_id": org_id, "status": "open", "deleted": {"$ne": True}})
    docs_expiring = await db.wf_compliance_documents.count_documents({
        "org_id": org_id,
        "expiry_date": {"$lte": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()},
        "deleted": {"$ne": True}
    })
    
    return {
        "success": True,
        "data": {
            "people": {"total": people_total, "active": people_active, "draft": people_draft},
            "roles": {"total": roles_total, "active": roles_active},
            "capacity": {"profiles": capacity_total, "allocations": allocations_active},
            "time": {"pending_timesheets": timesheets_pending, "today_attendance": attendance_today},
            "payroll": {"pending_payruns": payruns_pending},
            "compliance": {"open_violations": violations_open, "expiring_docs": docs_expiring}
        }
    }


# ==================== PEOPLE MODULE ====================

@router.get("/people")
async def list_people(
    status: Optional[str] = None,
    person_type: Optional[str] = None,
    department: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all people with filters"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if status:
        query["status"] = status
    if person_type:
        query["person_type"] = person_type
    if department:
        query["department_id"] = department
    if search:
        query["$or"] = [
            {"first_name": {"$regex": search, "$options": "i"}},
            {"last_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    
    people = await db.wf_people.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": people, "count": len(people)}


@router.get("/people/{person_id}")
async def get_person(person_id: str, current_user: dict = Depends(get_current_user)):
    """Get person details with all profiles"""
    db = get_db()
    
    person = await db.wf_people.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    # Get related profiles
    employment_profile = await db.wf_employment_profiles.find_one({"person_id": person_id}, {"_id": 0})
    legal_profile = await db.wf_legal_profiles.find_one({"person_id": person_id}, {"_id": 0})
    contact_profile = await db.wf_contact_profiles.find_one({"person_id": person_id}, {"_id": 0})
    role_assignments = await db.wf_role_assignments.find(
        {"person_id": person_id, "status": "active", "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "success": True,
        "data": {
            **person,
            "employment_profile": employment_profile,
            "legal_profile": legal_profile,
            "contact_profile": contact_profile,
            "role_assignments": role_assignments
        }
    }


@router.post("/people")
async def create_person(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new person"""
    db = get_db()
    
    # Check for duplicate email
    existing = await db.wf_people.find_one({
        "email": data.get("email"),
        "org_id": current_user.get("org_id"),
        "deleted": {"$ne": True}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    person_id = generate_id("PER")
    now = datetime.now(timezone.utc).isoformat()
    
    person = {
        "person_id": person_id,
        "org_id": current_user.get("org_id"),
        "first_name": data.get("first_name"),
        "last_name": data.get("last_name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "person_type": data.get("person_type", "employee"),  # employee | contractor | vendor | external
        "employment_type": data.get("employment_type", "full_time"),  # full_time | part_time | contract
        "department_id": data.get("department_id"),
        "department_name": data.get("department_name"),
        "location": data.get("location"),
        "joining_date": data.get("joining_date"),
        "exit_date": None,
        "status": "draft",  # draft | active | suspended | exited
        "created_at": now,
        "created_by": current_user.get("user_id"),
        "updated_at": now
    }
    
    await db.wf_people.insert_one(person)
    
    # Create employment profile if provided
    if data.get("employee_code") or data.get("designation"):
        emp_profile = {
            "person_id": person_id,
            "org_id": current_user.get("org_id"),
            "employee_code": data.get("employee_code"),
            "designation": data.get("designation"),
            "reporting_manager_id": data.get("reporting_manager_id"),
            "cost_center": data.get("cost_center"),
            "employment_status": "pending_onboarding"
        }
        await db.wf_employment_profiles.insert_one(emp_profile)
    
    return {"success": True, "data": {**person, "_id": None}, "person_id": person_id}


@router.put("/people/{person_id}")
async def update_person(person_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update person details"""
    db = get_db()
    
    existing = await db.wf_people.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if existing.get("status") == "exited":
        raise HTTPException(status_code=400, detail="Cannot edit exited person")
    
    update_fields = {
        "first_name": data.get("first_name", existing.get("first_name")),
        "last_name": data.get("last_name", existing.get("last_name")),
        "phone": data.get("phone", existing.get("phone")),
        "person_type": data.get("person_type", existing.get("person_type")),
        "employment_type": data.get("employment_type", existing.get("employment_type")),
        "department_id": data.get("department_id", existing.get("department_id")),
        "department_name": data.get("department_name", existing.get("department_name")),
        "location": data.get("location", existing.get("location")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wf_people.update_one({"person_id": person_id}, {"$set": update_fields})
    
    updated = await db.wf_people.find_one({"person_id": person_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.post("/people/{person_id}/activate")
async def activate_person(person_id: str, current_user: dict = Depends(get_current_user)):
    """Activate a person (from draft or suspended)"""
    db = get_db()
    
    person = await db.wf_people.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if person.get("status") == "exited":
        raise HTTPException(status_code=400, detail="Cannot activate exited person")
    
    # Check if legal profile exists
    legal_profile = await db.wf_legal_profiles.find_one({"person_id": person_id})
    if not legal_profile:
        raise HTTPException(status_code=400, detail="Cannot activate without legal profile")
    
    await db.wf_people.update_one(
        {"person_id": person_id},
        {"$set": {"status": "active", "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Person activated successfully"}


@router.post("/people/{person_id}/suspend")
async def suspend_person(person_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Suspend a person"""
    db = get_db()
    
    person = await db.wf_people.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if person.get("status") != "active":
        raise HTTPException(status_code=400, detail="Only active persons can be suspended")
    
    await db.wf_people.update_one(
        {"person_id": person_id},
        {"$set": {
            "status": "suspended",
            "suspension_reason": data.get("reason"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {"success": True, "message": "Person suspended successfully"}


@router.post("/people/{person_id}/exit")
async def exit_person(person_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Exit a person (irreversible)"""
    db = get_db()
    
    person = await db.wf_people.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    if person.get("status") == "exited":
        raise HTTPException(status_code=400, detail="Person already exited")
    
    await db.wf_people.update_one(
        {"person_id": person_id},
        {"$set": {
            "status": "exited",
            "exit_date": data.get("exit_date", datetime.now(timezone.utc).strftime("%Y-%m-%d")),
            "exit_reason": data.get("reason"),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Revoke all active role assignments
    await db.wf_role_assignments.update_many(
        {"person_id": person_id, "status": "active"},
        {"$set": {"status": "revoked", "effective_to": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Person exited successfully"}


# ==================== ROLES MODULE ====================

@router.get("/roles")
async def list_roles(
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List all roles"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if category:
        query["role_category"] = category
    if is_active is not None:
        query["is_active"] = is_active
    if search:
        query["role_name"] = {"$regex": search, "$options": "i"}
    
    roles = await db.wf_roles.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    
    # Get assignment counts
    for role in roles:
        count = await db.wf_role_assignments.count_documents({
            "role_id": role["role_id"],
            "status": "active",
            "deleted": {"$ne": True}
        })
        role["assigned_count"] = count
    
    return {"success": True, "data": roles, "count": len(roles)}


@router.get("/roles/{role_id}")
async def get_role(role_id: str, current_user: dict = Depends(get_current_user)):
    """Get role details with permissions and assignments"""
    db = get_db()
    
    role = await db.wf_roles.find_one(
        {"role_id": role_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    
    # Get permissions
    permissions = await db.wf_role_permissions.find({"role_id": role_id}, {"_id": 0}).to_list(100)
    
    # Get assigned people
    assignments = await db.wf_role_assignments.find(
        {"role_id": role_id, "status": "active", "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    return {
        "success": True,
        "data": {
            **role,
            "permissions": permissions,
            "assignments": assignments
        }
    }


@router.post("/roles")
async def create_role(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new role"""
    db = get_db()
    
    role_id = generate_id("ROLE")
    now = datetime.now(timezone.utc).isoformat()
    
    role = {
        "role_id": role_id,
        "org_id": current_user.get("org_id"),
        "role_name": data.get("role_name"),
        "role_category": data.get("role_category", "operational"),  # operational | financial | governance | admin
        "description": data.get("description"),
        "is_active": True,
        "created_at": now,
        "created_by": current_user.get("user_id"),
        "updated_at": now
    }
    
    await db.wf_roles.insert_one(role)
    
    # Add permissions if provided
    if data.get("permissions"):
        for perm in data["permissions"]:
            permission = {
                "permission_id": generate_id("PERM"),
                "role_id": role_id,
                "module": perm.get("module"),
                "action": perm.get("action"),
                "resource": perm.get("resource")
            }
            await db.wf_role_permissions.insert_one(permission)
    
    return {"success": True, "data": {**role, "_id": None}, "role_id": role_id}


@router.put("/roles/{role_id}")
async def update_role(role_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a role"""
    db = get_db()
    
    existing = await db.wf_roles.find_one(
        {"role_id": role_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Role not found")
    
    update_fields = {
        "role_name": data.get("role_name", existing.get("role_name")),
        "role_category": data.get("role_category", existing.get("role_category")),
        "description": data.get("description", existing.get("description")),
        "is_active": data.get("is_active", existing.get("is_active")),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.wf_roles.update_one({"role_id": role_id}, {"$set": update_fields})
    
    updated = await db.wf_roles.find_one({"role_id": role_id}, {"_id": 0})
    return {"success": True, "data": updated}


@router.post("/roles/{role_id}/assign")
async def assign_role(role_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Assign a role to a person"""
    db = get_db()
    
    # Verify role exists
    role = await db.wf_roles.find_one(
        {"role_id": role_id, "org_id": current_user.get("org_id"), "is_active": True},
        {"_id": 0}
    )
    if not role:
        raise HTTPException(status_code=404, detail="Role not found or inactive")
    
    # Verify person exists and is active
    person = await db.wf_people.find_one(
        {"person_id": data.get("person_id"), "org_id": current_user.get("org_id"), "status": "active"},
        {"_id": 0}
    )
    if not person:
        raise HTTPException(status_code=404, detail="Person not found or not active")
    
    # Check SoD rules
    sod_violations = await check_sod_rules(db, data.get("person_id"), role_id, current_user.get("org_id"))
    if sod_violations:
        raise HTTPException(status_code=400, detail=f"Segregation of Duties violation: {sod_violations}")
    
    assignment_id = generate_id("ASGN")
    now = datetime.now(timezone.utc).isoformat()
    
    assignment = {
        "assignment_id": assignment_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "role_id": role_id,
        "effective_from": data.get("effective_from", now),
        "effective_to": data.get("effective_to"),
        "status": "active",
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_role_assignments.insert_one(assignment)
    
    return {"success": True, "data": {**assignment, "_id": None}, "assignment_id": assignment_id}


async def check_sod_rules(db, person_id: str, new_role_id: str, org_id: str) -> str:
    """Check Segregation of Duties rules"""
    # Get current role assignments for person
    current_assignments = await db.wf_role_assignments.find(
        {"person_id": person_id, "status": "active", "org_id": org_id},
        {"_id": 0}
    ).to_list(100)
    
    current_role_ids = [a["role_id"] for a in current_assignments]
    current_role_ids.append(new_role_id)
    
    # Check against SoD rules
    sod_rules = await db.wf_sod_rules.find({"org_id": org_id, "is_active": True}, {"_id": 0}).to_list(100)
    
    for rule in sod_rules:
        conflicting_roles = set(rule.get("conflicting_roles", []))
        if len(conflicting_roles.intersection(set(current_role_ids))) > 1:
            return f"Role conflict with rule: {rule.get('rule_name', 'SoD Rule')}"
    
    return ""


# ==================== CAPACITY MODULE ====================

@router.get("/capacity")
async def list_capacity_profiles(
    person_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List capacity profiles"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    
    profiles = await db.wf_capacity.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": profiles, "count": len(profiles)}


@router.get("/capacity/{person_id}")
async def get_capacity_profile(person_id: str, current_user: dict = Depends(get_current_user)):
    """Get capacity profile for a person"""
    db = get_db()
    
    profile = await db.wf_capacity.find_one(
        {"person_id": person_id, "org_id": current_user.get("org_id"), "deleted": {"$ne": True}},
        {"_id": 0}
    )
    
    # Get allocations
    allocations = await db.wf_allocations.find(
        {"person_id": person_id, "status": "active", "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(100)
    
    # Calculate utilization
    total_allocated = sum(a.get("allocated_hours", 0) for a in allocations)
    standard_hours = profile.get("standard_hours_per_day", 8) if profile else 8
    utilization = (total_allocated / (standard_hours * 5)) * 100 if standard_hours else 0
    
    return {
        "success": True,
        "data": {
            "profile": profile,
            "allocations": allocations,
            "utilization_percentage": round(utilization, 1),
            "total_allocated_hours": total_allocated
        }
    }


@router.post("/capacity")
async def create_capacity_profile(data: dict, current_user: dict = Depends(get_current_user)):
    """Create capacity profile for a person"""
    db = get_db()
    
    # Check if profile already exists
    existing = await db.wf_capacity.find_one({
        "person_id": data.get("person_id"),
        "org_id": current_user.get("org_id"),
        "deleted": {"$ne": True}
    })
    if existing:
        raise HTTPException(status_code=400, detail="Capacity profile already exists")
    
    capacity_id = generate_id("CAP")
    now = datetime.now(timezone.utc).isoformat()
    
    profile = {
        "capacity_id": capacity_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "standard_hours_per_day": data.get("standard_hours_per_day", 8),
        "working_days": data.get("working_days", ["Mon", "Tue", "Wed", "Thu", "Fri"]),
        "location": data.get("location"),
        "effective_from": data.get("effective_from", now),
        "effective_to": data.get("effective_to"),
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_capacity.insert_one(profile)
    
    return {"success": True, "data": {**profile, "_id": None}, "capacity_id": capacity_id}


@router.get("/allocations")
async def list_allocations(
    person_id: Optional[str] = None,
    allocation_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List allocations"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if allocation_type:
        query["allocation_type"] = allocation_type
    if status:
        query["status"] = status
    
    allocations = await db.wf_allocations.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": allocations, "count": len(allocations)}


@router.post("/allocations")
async def create_allocation(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new allocation"""
    db = get_db()
    
    # Check capacity
    capacity = await db.wf_capacity.find_one({
        "person_id": data.get("person_id"),
        "org_id": current_user.get("org_id"),
        "deleted": {"$ne": True}
    })
    if not capacity:
        raise HTTPException(status_code=400, detail="No capacity profile found for person")
    
    # Calculate current allocations
    current_allocations = await db.wf_allocations.find({
        "person_id": data.get("person_id"),
        "status": "active",
        "deleted": {"$ne": True}
    }, {"_id": 0}).to_list(100)
    
    total_allocated = sum(a.get("allocated_hours", 0) for a in current_allocations)
    new_hours = data.get("allocated_hours", 0)
    standard_hours = capacity.get("standard_hours_per_day", 8) * 5  # Weekly
    
    if data.get("commitment_type") == "hard" and (total_allocated + new_hours) > standard_hours:
        raise HTTPException(status_code=400, detail="Cannot exceed capacity for hard allocation")
    
    allocation_id = generate_id("ALLOC")
    now = datetime.now(timezone.utc).isoformat()
    
    allocation = {
        "allocation_id": allocation_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "allocation_type": data.get("allocation_type", "project"),  # project | service | internal
        "reference_id": data.get("reference_id"),
        "reference_name": data.get("reference_name"),
        "allocated_hours": new_hours,
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "commitment_type": data.get("commitment_type", "soft"),  # hard | soft
        "status": "active",
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_allocations.insert_one(allocation)
    
    return {"success": True, "data": {**allocation, "_id": None}, "allocation_id": allocation_id}


# ==================== TIME MODULE ====================

@router.get("/attendance")
async def list_attendance(
    person_id: Optional[str] = None,
    date: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List attendance records"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if date:
        query["date"] = date
    if status:
        query["attendance_status"] = status
    
    records = await db.wf_attendance.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return {"success": True, "data": records, "count": len(records)}


@router.post("/attendance/check-in")
async def check_in(data: dict, current_user: dict = Depends(get_current_user)):
    """Record check-in"""
    db = get_db()
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    person_id = data.get("person_id") or current_user.get("user_id")
    
    # Check if already checked in today
    existing = await db.wf_attendance.find_one({
        "person_id": person_id,
        "date": today,
        "org_id": current_user.get("org_id")
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already checked in today")
    
    attendance_id = generate_id("ATT")
    now = datetime.now(timezone.utc).isoformat()
    
    attendance = {
        "attendance_id": attendance_id,
        "org_id": current_user.get("org_id"),
        "person_id": person_id,
        "date": today,
        "check_in_time": now,
        "check_out_time": None,
        "attendance_status": "present",
        "created_at": now
    }
    
    await db.wf_attendance.insert_one(attendance)
    
    return {"success": True, "data": {**attendance, "_id": None}}


@router.post("/attendance/check-out")
async def check_out(data: dict, current_user: dict = Depends(get_current_user)):
    """Record check-out"""
    db = get_db()
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    person_id = data.get("person_id") or current_user.get("user_id")
    
    attendance = await db.wf_attendance.find_one({
        "person_id": person_id,
        "date": today,
        "org_id": current_user.get("org_id")
    })
    if not attendance:
        raise HTTPException(status_code=400, detail="No check-in found for today")
    
    if attendance.get("check_out_time"):
        raise HTTPException(status_code=400, detail="Already checked out")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.wf_attendance.update_one(
        {"attendance_id": attendance["attendance_id"]},
        {"$set": {"check_out_time": now}}
    )
    
    return {"success": True, "message": "Checked out successfully"}


@router.get("/time-entries")
async def list_time_entries(
    person_id: Optional[str] = None,
    status: Optional[str] = None,
    work_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List time entries"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if status:
        query["status"] = status
    if work_type:
        query["work_type"] = work_type
    
    entries = await db.wf_time_entries.find(query, {"_id": 0}).sort("date", -1).to_list(1000)
    return {"success": True, "data": entries, "count": len(entries)}


@router.post("/time-entries")
async def create_time_entry(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a time entry"""
    db = get_db()
    
    entry_id = generate_id("TIME")
    now = datetime.now(timezone.utc).isoformat()
    
    entry = {
        "time_entry_id": entry_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id") or current_user.get("user_id"),
        "date": data.get("date"),
        "hours": data.get("hours"),
        "work_type": data.get("work_type", "project"),  # project | service | internal
        "reference_id": data.get("reference_id"),
        "reference_name": data.get("reference_name"),
        "description": data.get("description"),
        "status": "draft",  # draft | submitted | approved | rejected
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_time_entries.insert_one(entry)
    
    return {"success": True, "data": {**entry, "_id": None}, "time_entry_id": entry_id}


@router.get("/timesheets")
async def list_timesheets(
    person_id: Optional[str] = None,
    status: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List timesheets"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if status:
        query["status"] = status
    if period:
        query["period"] = period
    
    timesheets = await db.wf_timesheets.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": timesheets, "count": len(timesheets)}


@router.post("/timesheets")
async def create_timesheet(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a timesheet"""
    db = get_db()
    
    timesheet_id = generate_id("TS")
    now = datetime.now(timezone.utc).isoformat()
    
    # Calculate total hours from time entries
    person_id = data.get("person_id") or current_user.get("user_id")
    period = data.get("period")
    
    entries = await db.wf_time_entries.find({
        "person_id": person_id,
        "date": {"$regex": f"^{period}"},
        "org_id": current_user.get("org_id")
    }, {"_id": 0}).to_list(1000)
    
    total_hours = sum(e.get("hours", 0) for e in entries)
    
    timesheet = {
        "timesheet_id": timesheet_id,
        "org_id": current_user.get("org_id"),
        "person_id": person_id,
        "period": period,
        "total_hours": total_hours,
        "status": "open",  # open | submitted | approved | locked
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_timesheets.insert_one(timesheet)
    
    return {"success": True, "data": {**timesheet, "_id": None}, "timesheet_id": timesheet_id}


@router.post("/timesheets/{timesheet_id}/submit")
async def submit_timesheet(timesheet_id: str, current_user: dict = Depends(get_current_user)):
    """Submit timesheet for approval"""
    db = get_db()
    
    timesheet = await db.wf_timesheets.find_one(
        {"timesheet_id": timesheet_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not timesheet:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    
    if timesheet.get("status") != "open":
        raise HTTPException(status_code=400, detail="Only open timesheets can be submitted")
    
    await db.wf_timesheets.update_one(
        {"timesheet_id": timesheet_id},
        {"$set": {"status": "submitted", "submitted_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": "Timesheet submitted for approval"}


@router.post("/timesheets/{timesheet_id}/approve")
async def approve_timesheet(timesheet_id: str, current_user: dict = Depends(get_current_user)):
    """Approve a timesheet"""
    db = get_db()
    
    timesheet = await db.wf_timesheets.find_one(
        {"timesheet_id": timesheet_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not timesheet:
        raise HTTPException(status_code=404, detail="Timesheet not found")
    
    if timesheet.get("status") != "submitted":
        raise HTTPException(status_code=400, detail="Only submitted timesheets can be approved")
    
    now = datetime.now(timezone.utc).isoformat()
    await db.wf_timesheets.update_one(
        {"timesheet_id": timesheet_id},
        {"$set": {
            "status": "approved",
            "approved_at": now,
            "approved_by": current_user.get("user_id")
        }}
    )
    
    # Update all related time entries
    await db.wf_time_entries.update_many(
        {"person_id": timesheet["person_id"], "date": {"$regex": f"^{timesheet['period']}"}},
        {"$set": {"status": "approved"}}
    )
    
    return {"success": True, "message": "Timesheet approved"}


# ==================== PAYROLL MODULE ====================

@router.get("/compensation")
async def list_compensation_profiles(
    person_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List compensation profiles"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    
    profiles = await db.wf_compensation.find(query, {"_id": 0}).to_list(1000)
    return {"success": True, "data": profiles, "count": len(profiles)}


@router.post("/compensation")
async def create_compensation_profile(data: dict, current_user: dict = Depends(get_current_user)):
    """Create compensation profile"""
    db = get_db()
    
    # Deactivate any existing active profile
    await db.wf_compensation.update_many(
        {"person_id": data.get("person_id"), "status": "active"},
        {"$set": {"status": "expired", "effective_to": datetime.now(timezone.utc).isoformat()}}
    )
    
    comp_id = generate_id("COMP")
    now = datetime.now(timezone.utc).isoformat()
    
    profile = {
        "compensation_id": comp_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "pay_type": data.get("pay_type", "salaried"),  # salaried | hourly | contract
        "base_pay": data.get("base_pay"),
        "currency": data.get("currency", "INR"),
        "pay_frequency": data.get("pay_frequency", "monthly"),  # monthly | bi-weekly | weekly
        "effective_from": data.get("effective_from", now),
        "effective_to": None,
        "status": "active",
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_compensation.insert_one(profile)
    
    return {"success": True, "data": {**profile, "_id": None}, "compensation_id": comp_id}


@router.get("/payruns")
async def list_payruns(
    status: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List pay runs"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if status:
        query["status"] = status
    if period:
        query["period"] = period
    
    payruns = await db.wf_payruns.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": payruns, "count": len(payruns)}


@router.get("/payruns/{payrun_id}")
async def get_payrun(payrun_id: str, current_user: dict = Depends(get_current_user)):
    """Get pay run details with payslips"""
    db = get_db()
    
    payrun = await db.wf_payruns.find_one(
        {"payrun_id": payrun_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not payrun:
        raise HTTPException(status_code=404, detail="Pay run not found")
    
    payslips = await db.wf_payslips.find({"payrun_id": payrun_id}, {"_id": 0}).to_list(1000)
    
    return {
        "success": True,
        "data": {
            **payrun,
            "payslips": payslips,
            "total_employees": len(payslips)
        }
    }


@router.post("/payruns")
async def create_payrun(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new pay run"""
    db = get_db()
    
    payrun_id = generate_id("PAY")
    now = datetime.now(timezone.utc).isoformat()
    
    payrun = {
        "payrun_id": payrun_id,
        "org_id": current_user.get("org_id"),
        "period": data.get("period"),
        "payroll_group": data.get("payroll_group", "default"),
        "status": "draft",  # draft | calculated | approved | posted
        "total_gross": 0,
        "total_deductions": 0,
        "total_net": 0,
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_payruns.insert_one(payrun)
    
    return {"success": True, "data": {**payrun, "_id": None}, "payrun_id": payrun_id}


@router.post("/payruns/{payrun_id}/calculate")
async def calculate_payrun(payrun_id: str, current_user: dict = Depends(get_current_user)):
    """Calculate payroll for all eligible employees"""
    db = get_db()
    
    payrun = await db.wf_payruns.find_one(
        {"payrun_id": payrun_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not payrun:
        raise HTTPException(status_code=404, detail="Pay run not found")
    
    if payrun.get("status") not in ["draft", "calculated"]:
        raise HTTPException(status_code=400, detail="Cannot recalculate approved/posted pay run")
    
    # Get all active people with compensation profiles
    org_id = current_user.get("org_id")
    active_people = await db.wf_people.find(
        {"org_id": org_id, "status": "active", "deleted": {"$ne": True}},
        {"_id": 0}
    ).to_list(1000)
    
    total_gross = 0
    total_deductions = 0
    total_net = 0
    
    # Delete existing payslips for this run
    await db.wf_payslips.delete_many({"payrun_id": payrun_id})
    
    for person in active_people:
        # Get compensation profile
        comp = await db.wf_compensation.find_one(
            {"person_id": person["person_id"], "status": "active"},
            {"_id": 0}
        )
        if not comp:
            continue
        
        # Get approved timesheet for period
        timesheet = await db.wf_timesheets.find_one({
            "person_id": person["person_id"],
            "period": payrun["period"],
            "status": "approved"
        })
        
        base_pay = comp.get("base_pay", 0)
        
        # Calculate earnings
        gross_pay = base_pay
        
        # Calculate deductions (simplified statutory)
        tax_deduction = gross_pay * 0.10  # 10% flat tax
        pf_deduction = gross_pay * 0.12  # 12% PF
        total_ded = tax_deduction + pf_deduction
        
        net_pay = gross_pay - total_ded
        
        payslip = {
            "payslip_id": generate_id("SLIP"),
            "payrun_id": payrun_id,
            "org_id": org_id,
            "person_id": person["person_id"],
            "person_name": f"{person.get('first_name', '')} {person.get('last_name', '')}",
            "period": payrun["period"],
            "gross_pay": gross_pay,
            "earnings": [
                {"component": "Basic", "amount": base_pay * 0.5},
                {"component": "HRA", "amount": base_pay * 0.3},
                {"component": "Special Allowance", "amount": base_pay * 0.2}
            ],
            "deductions": [
                {"component": "Income Tax", "amount": tax_deduction},
                {"component": "Provident Fund", "amount": pf_deduction}
            ],
            "total_deductions": total_ded,
            "net_pay": net_pay,
            "currency": comp.get("currency", "INR"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.wf_payslips.insert_one(payslip)
        
        total_gross += gross_pay
        total_deductions += total_ded
        total_net += net_pay
    
    # Update pay run
    await db.wf_payruns.update_one(
        {"payrun_id": payrun_id},
        {"$set": {
            "status": "calculated",
            "total_gross": total_gross,
            "total_deductions": total_deductions,
            "total_net": total_net,
            "calculated_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    return {
        "success": True,
        "message": "Payroll calculated successfully",
        "data": {
            "total_gross": total_gross,
            "total_deductions": total_deductions,
            "total_net": total_net,
            "employees_processed": len(active_people)
        }
    }


@router.post("/payruns/{payrun_id}/approve")
async def approve_payrun(payrun_id: str, current_user: dict = Depends(get_current_user)):
    """Approve pay run"""
    db = get_db()
    
    payrun = await db.wf_payruns.find_one(
        {"payrun_id": payrun_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not payrun:
        raise HTTPException(status_code=404, detail="Pay run not found")
    
    if payrun.get("status") != "calculated":
        raise HTTPException(status_code=400, detail="Only calculated pay runs can be approved")
    
    await db.wf_payruns.update_one(
        {"payrun_id": payrun_id},
        {"$set": {
            "status": "approved",
            "approved_at": datetime.now(timezone.utc).isoformat(),
            "approved_by": current_user.get("user_id")
        }}
    )
    
    return {"success": True, "message": "Pay run approved"}


@router.get("/payslips")
async def list_payslips(
    person_id: Optional[str] = None,
    period: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List payslips"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    
    if person_id:
        query["person_id"] = person_id
    if period:
        query["period"] = period
    
    payslips = await db.wf_payslips.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": payslips, "count": len(payslips)}


# ==================== COMPLIANCE MODULE ====================

@router.get("/compliance/dashboard")
async def get_compliance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get compliance dashboard"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Document stats
    total_docs = await db.wf_compliance_documents.count_documents({"org_id": org_id, "deleted": {"$ne": True}})
    verified_docs = await db.wf_compliance_documents.count_documents(
        {"org_id": org_id, "verification_status": "verified", "deleted": {"$ne": True}}
    )
    expiring_docs = await db.wf_compliance_documents.count_documents({
        "org_id": org_id,
        "expiry_date": {"$lte": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()},
        "deleted": {"$ne": True}
    })
    
    # Violation stats
    open_violations = await db.wf_compliance_violations.count_documents(
        {"org_id": org_id, "status": "open", "deleted": {"$ne": True}}
    )
    critical_violations = await db.wf_compliance_violations.count_documents(
        {"org_id": org_id, "severity": "critical", "status": "open", "deleted": {"$ne": True}}
    )
    
    # People compliance status
    compliant_count = await db.wf_compliance_profiles.count_documents(
        {"org_id": org_id, "compliance_status": "compliant"}
    )
    non_compliant_count = await db.wf_compliance_profiles.count_documents(
        {"org_id": org_id, "compliance_status": "non_compliant"}
    )
    
    return {
        "success": True,
        "data": {
            "documents": {
                "total": total_docs,
                "verified": verified_docs,
                "expiring_soon": expiring_docs
            },
            "violations": {
                "open": open_violations,
                "critical": critical_violations
            },
            "people": {
                "compliant": compliant_count,
                "non_compliant": non_compliant_count
            }
        }
    }


@router.get("/compliance/documents")
async def list_compliance_documents(
    person_id: Optional[str] = None,
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List compliance documents"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if document_type:
        query["document_type"] = document_type
    if status:
        query["verification_status"] = status
    
    docs = await db.wf_compliance_documents.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"success": True, "data": docs, "count": len(docs)}


@router.post("/compliance/documents")
async def create_compliance_document(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a compliance document record"""
    db = get_db()
    
    doc_id = generate_id("DOC")
    now = datetime.now(timezone.utc).isoformat()
    
    document = {
        "document_id": doc_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "document_type": data.get("document_type"),  # contract | id | visa | certificate
        "document_number": data.get("document_number"),
        "issue_date": data.get("issue_date"),
        "expiry_date": data.get("expiry_date"),
        "issuing_authority": data.get("issuing_authority"),
        "verification_status": "pending",  # pending | verified | rejected | expired
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_compliance_documents.insert_one(document)
    
    return {"success": True, "data": {**document, "_id": None}, "document_id": doc_id}


@router.post("/compliance/documents/{document_id}/verify")
async def verify_document(document_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Verify a compliance document"""
    db = get_db()
    
    doc = await db.wf_compliance_documents.find_one(
        {"document_id": document_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    status = data.get("status", "verified")  # verified | rejected
    
    await db.wf_compliance_documents.update_one(
        {"document_id": document_id},
        {"$set": {
            "verification_status": status,
            "verified_at": datetime.now(timezone.utc).isoformat(),
            "verified_by": current_user.get("user_id"),
            "verification_notes": data.get("notes")
        }}
    )
    
    return {"success": True, "message": f"Document {status}"}


@router.get("/compliance/violations")
async def list_violations(
    person_id: Optional[str] = None,
    severity: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """List compliance violations"""
    db = get_db()
    query = {"org_id": current_user.get("org_id"), "deleted": {"$ne": True}}
    
    if person_id:
        query["person_id"] = person_id
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
    
    violations = await db.wf_compliance_violations.find(query, {"_id": 0}).sort("detected_on", -1).to_list(1000)
    return {"success": True, "data": violations, "count": len(violations)}


@router.post("/compliance/violations")
async def create_violation(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a compliance violation"""
    db = get_db()
    
    violation_id = generate_id("VIOL")
    now = datetime.now(timezone.utc).isoformat()
    
    violation = {
        "violation_id": violation_id,
        "org_id": current_user.get("org_id"),
        "person_id": data.get("person_id"),
        "violation_type": data.get("violation_type"),
        "description": data.get("description"),
        "severity": data.get("severity", "medium"),  # low | medium | high | critical
        "detected_on": now,
        "status": "open",  # open | mitigated | closed
        "created_at": now,
        "created_by": current_user.get("user_id")
    }
    
    await db.wf_compliance_violations.insert_one(violation)
    
    # Update person compliance status
    await update_compliance_status(db, data.get("person_id"), current_user.get("org_id"))
    
    return {"success": True, "data": {**violation, "_id": None}, "violation_id": violation_id}


@router.post("/compliance/violations/{violation_id}/resolve")
async def resolve_violation(violation_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Resolve a violation"""
    db = get_db()
    
    violation = await db.wf_compliance_violations.find_one(
        {"violation_id": violation_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not violation:
        raise HTTPException(status_code=404, detail="Violation not found")
    
    status = data.get("status", "mitigated")  # mitigated | closed
    
    await db.wf_compliance_violations.update_one(
        {"violation_id": violation_id},
        {"$set": {
            "status": status,
            "resolved_at": datetime.now(timezone.utc).isoformat(),
            "resolved_by": current_user.get("user_id"),
            "resolution_notes": data.get("notes")
        }}
    )
    
    # Update person compliance status
    await update_compliance_status(db, violation["person_id"], current_user.get("org_id"))
    
    return {"success": True, "message": f"Violation {status}"}


async def update_compliance_status(db, person_id: str, org_id: str):
    """Update person compliance status based on violations and documents"""
    # Check for open violations
    open_violations = await db.wf_compliance_violations.count_documents({
        "person_id": person_id,
        "org_id": org_id,
        "status": "open"
    })
    
    # Check for expired/missing documents
    expired_docs = await db.wf_compliance_documents.count_documents({
        "person_id": person_id,
        "org_id": org_id,
        "verification_status": {"$in": ["expired", "rejected"]}
    })
    
    if open_violations > 0 or expired_docs > 0:
        status = "non_compliant"
    else:
        status = "compliant"
    
    await db.wf_compliance_profiles.update_one(
        {"person_id": person_id, "org_id": org_id},
        {"$set": {"compliance_status": status}},
        upsert=True
    )


# ==================== SEED DATA ====================

@router.post("/seed-data")
async def seed_workforce_data(current_user: dict = Depends(get_current_user)):
    """Seed sample workforce data"""
    db = get_db()
    org_id = current_user.get("org_id")
    now = datetime.now(timezone.utc).isoformat()
    
    # Sample People
    people_data = [
        {"first_name": "Rajesh", "last_name": "Kumar", "email": "rajesh.kumar@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "Engineering", "designation": "Senior Engineer", "location": "Mumbai"},
        {"first_name": "Priya", "last_name": "Sharma", "email": "priya.sharma@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "Finance", "designation": "Finance Manager", "location": "Delhi"},
        {"first_name": "Amit", "last_name": "Patel", "email": "amit.patel@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "Sales", "designation": "Sales Lead", "location": "Bangalore"},
        {"first_name": "Sneha", "last_name": "Reddy", "email": "sneha.reddy@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "HR", "designation": "HR Manager", "location": "Hyderabad"},
        {"first_name": "Vikram", "last_name": "Singh", "email": "vikram.singh@innovatebooks.com", "person_type": "contractor", "employment_type": "contract", "department_name": "Engineering", "designation": "DevOps Consultant", "location": "Remote"},
        {"first_name": "Ananya", "last_name": "Gupta", "email": "ananya.gupta@innovatebooks.com", "person_type": "employee", "employment_type": "part_time", "department_name": "Marketing", "designation": "Content Writer", "location": "Mumbai"},
        {"first_name": "Rahul", "last_name": "Verma", "email": "rahul.verma@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "Engineering", "designation": "Tech Lead", "location": "Pune"},
        {"first_name": "Kavita", "last_name": "Joshi", "email": "kavita.joshi@innovatebooks.com", "person_type": "employee", "employment_type": "full_time", "department_name": "Operations", "designation": "Operations Manager", "location": "Chennai"},
    ]
    
    created_people = []
    for p in people_data:
        person_id = generate_id("PER")
        person = {
            "person_id": person_id,
            "org_id": org_id,
            "status": "active",
            "joining_date": "2024-01-15",
            "created_at": now,
            "updated_at": now,
            **p
        }
        await db.wf_people.update_one(
            {"email": p["email"], "org_id": org_id},
            {"$set": person},
            upsert=True
        )
        created_people.append(person)
        
        # Create employment profile
        emp_profile = {
            "person_id": person_id,
            "org_id": org_id,
            "employee_code": f"EMP{str(len(created_people)).zfill(4)}",
            "designation": p["designation"],
            "cost_center": p["department_name"],
            "employment_status": "active"
        }
        await db.wf_employment_profiles.update_one(
            {"person_id": person_id},
            {"$set": emp_profile},
            upsert=True
        )
        
        # Create legal profile
        legal_profile = {
            "person_id": person_id,
            "org_id": org_id,
            "government_id_type": "PAN",
            "government_id_number": f"ABCDE{1234 + len(created_people)}F",
            "tax_identifier": f"GSTIN{len(created_people)}",
            "country_of_residence": "India",
            "verification_status": "verified"
        }
        await db.wf_legal_profiles.update_one(
            {"person_id": person_id},
            {"$set": legal_profile},
            upsert=True
        )
        
        # Create capacity profile
        capacity = {
            "capacity_id": generate_id("CAP"),
            "org_id": org_id,
            "person_id": person_id,
            "standard_hours_per_day": 8,
            "working_days": ["Mon", "Tue", "Wed", "Thu", "Fri"],
            "location": p["location"],
            "effective_from": now,
            "created_at": now
        }
        await db.wf_capacity.update_one(
            {"person_id": person_id},
            {"$set": capacity},
            upsert=True
        )
        
        # Create compensation profile
        base_pays = {"Senior Engineer": 150000, "Finance Manager": 180000, "Sales Lead": 140000, "HR Manager": 160000, "DevOps Consultant": 200000, "Content Writer": 60000, "Tech Lead": 200000, "Operations Manager": 170000}
        comp = {
            "compensation_id": generate_id("COMP"),
            "org_id": org_id,
            "person_id": person_id,
            "pay_type": "salaried",
            "base_pay": base_pays.get(p["designation"], 100000),
            "currency": "INR",
            "pay_frequency": "monthly",
            "effective_from": now,
            "status": "active",
            "created_at": now
        }
        await db.wf_compensation.update_one(
            {"person_id": person_id, "status": "active"},
            {"$set": comp},
            upsert=True
        )
        
        # Create compliance profile
        compliance = {
            "person_id": person_id,
            "org_id": org_id,
            "country": "India",
            "employment_category": p["employment_type"],
            "compliance_status": "compliant"
        }
        await db.wf_compliance_profiles.update_one(
            {"person_id": person_id},
            {"$set": compliance},
            upsert=True
        )
    
    # Sample Roles
    roles_data = [
        {"role_name": "System Administrator", "role_category": "admin", "description": "Full system access and configuration"},
        {"role_name": "Finance Approver", "role_category": "financial", "description": "Approve financial transactions up to limit"},
        {"role_name": "Project Manager", "role_category": "operational", "description": "Manage project teams and deliverables"},
        {"role_name": "HR Manager", "role_category": "governance", "description": "Manage workforce and compliance"},
        {"role_name": "Sales Manager", "role_category": "operational", "description": "Manage sales team and pipeline"},
        {"role_name": "Procurement Officer", "role_category": "operational", "description": "Handle vendor procurement"},
    ]
    
    for r in roles_data:
        role_id = generate_id("ROLE")
        role = {
            "role_id": role_id,
            "org_id": org_id,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
            **r
        }
        await db.wf_roles.update_one(
            {"role_name": r["role_name"], "org_id": org_id},
            {"$set": role},
            upsert=True
        )
    
    return {
        "success": True,
        "message": "Sample workforce data created",
        "data": {
            "people_created": len(created_people),
            "roles_created": len(roles_data)
        }
    }
