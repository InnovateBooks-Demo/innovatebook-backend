"""
IB Operations - Backend Routes
Execution, Delivery, Fulfillment & Control Layer
"""

from fastapi import APIRouter, HTTPException, Depends, Header
from typing import List, Optional
from datetime import datetime
import uuid
import jwt
import os

router = APIRouter(prefix="/api/operations", tags=["Operations"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

def get_db():
    """Get database instance from server"""
    from server import db
    return db

async def get_current_user(authorization: str = Header(None)):
    """Extract current user from JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id")
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# ==================== WORK INTAKE ROUTES ====================

@router.get("/work-intake")
async def get_work_orders(
    status: Optional[str] = None,
    delivery_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all work orders in the intake queue"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if delivery_type:
        query["delivery_type"] = delivery_type
    
    cursor = db.ops_work_orders.find(query, {"_id": 0}).sort("created_at", -1)
    work_orders = await cursor.to_list(length=1000)
    return {"success": True, "data": work_orders, "count": len(work_orders)}


@router.get("/work-intake/{work_order_id}")
async def get_work_order(work_order_id: str, current_user: dict = Depends(get_current_user)):
    """Get work order details"""
    db = get_db()
    work_order = await db.ops_work_orders.find_one(
        {"work_order_id": work_order_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not work_order:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"success": True, "data": work_order}


@router.post("/work-intake")
async def create_work_order(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new work order from contract"""
    db = get_db()
    work_order = {
        "work_order_id": f"WO-{uuid.uuid4().hex[:8].upper()}",
        "source_contract_id": data.get("source_contract_id"),
        "source_type": data.get("source_type", "revenue"),
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "delivery_type": data.get("delivery_type", "project"),
        "scope_snapshot": data.get("scope_snapshot", {}),
        "sla_snapshot": data.get("sla_snapshot", {}),
        "planned_start_date": data.get("planned_start_date"),
        "planned_end_date": data.get("planned_end_date"),
        "status": "pending",
        "risk_flag": False,
        "created_at": datetime.utcnow().isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.ops_work_orders.insert_one(work_order)
    work_order.pop("_id", None)
    return {"success": True, "data": work_order}


@router.put("/work-intake/{work_order_id}/accept")
async def accept_work_order(work_order_id: str, current_user: dict = Depends(get_current_user)):
    """Accept a work order and route to execution"""
    db = get_db()
    result = await db.ops_work_orders.update_one(
        {"work_order_id": work_order_id, "org_id": current_user.get("org_id")},
        {"$set": {
            "status": "accepted",
            "accepted_by": current_user.get("user_id"),
            "accepted_at": datetime.utcnow().isoformat()
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"success": True, "message": "Work order accepted"}


@router.put("/work-intake/{work_order_id}/block")
async def block_work_order(work_order_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Block a work order with reason"""
    db = get_db()
    result = await db.ops_work_orders.update_one(
        {"work_order_id": work_order_id, "org_id": current_user.get("org_id")},
        {"$set": {
            "status": "blocked",
            "blocked_reason": data.get("reason", "Validation failed"),
            "risk_flag": True
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Work order not found")
    return {"success": True, "message": "Work order blocked"}


# ==================== PROJECTS ROUTES ====================

@router.get("/projects")
async def get_projects(
    status: Optional[str] = None,
    project_type: Optional[str] = None,
    owner_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all projects"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if project_type:
        query["project_type"] = project_type
    if owner_id:
        query["owner_id"] = owner_id
    
    cursor = db.ops_projects.find(query, {"_id": 0}).sort("created_at", -1)
    projects = await cursor.to_list(length=1000)
    return {"success": True, "data": projects, "count": len(projects)}


@router.get("/projects/{project_id}")
async def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    """Get project details with milestones, tasks, resources"""
    db = get_db()
    project = await db.ops_projects.find_one(
        {"project_id": project_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get related data
    milestones = await db.ops_milestones.find({"project_id": project_id}, {"_id": 0}).sort("order_index", 1).to_list(length=100)
    tasks = await db.ops_tasks.find({"project_id": project_id}, {"_id": 0}).to_list(length=1000)
    resources = await db.ops_resource_assignments.find({"project_id": project_id}, {"_id": 0}).to_list(length=100)
    issues = await db.ops_project_issues.find({"project_id": project_id}, {"_id": 0}).to_list(length=100)
    inventory = await db.ops_inventory_allocations.find({"project_id": project_id}, {"_id": 0}).to_list(length=100)
    
    return {
        "success": True,
        "data": {
            **project,
            "milestones": milestones,
            "tasks": tasks,
            "resources": resources,
            "issues": issues,
            "inventory": inventory
        }
    }


@router.post("/projects")
async def create_project(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a project from work order"""
    db = get_db()
    project = {
        "project_id": f"PRJ-{uuid.uuid4().hex[:8].upper()}",
        "work_order_id": data.get("work_order_id"),
        "project_type": data.get("project_type", "client"),
        "name": data.get("name"),
        "description": data.get("description"),
        "start_date": data.get("start_date"),
        "target_end_date": data.get("target_end_date"),
        "status": "planned",
        "scope_snapshot": data.get("scope_snapshot", {}),
        "sla_snapshot": data.get("sla_snapshot", {}),
        "owner_id": data.get("owner_id", current_user.get("user_id")),
        "owner_name": data.get("owner_name"),
        "progress_percent": 0,
        "sla_status": "on_track",
        "created_at": datetime.utcnow().isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.ops_projects.insert_one(project)
    
    # Update work order status
    if data.get("work_order_id"):
        await db.ops_work_orders.update_one(
            {"work_order_id": data.get("work_order_id")},
            {"$set": {"status": "active"}}
        )
    
    project.pop("_id", None)
    return {"success": True, "data": project}


@router.put("/projects/{project_id}/status")
async def update_project_status(project_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update project status"""
    db = get_db()
    new_status = data.get("status")
    update = {"status": new_status}
    if new_status == "completed":
        update["actual_end_date"] = datetime.utcnow().isoformat()
    
    result = await db.ops_projects.update_one(
        {"project_id": project_id, "org_id": current_user.get("org_id")},
        {"$set": update}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "message": f"Project status updated to {new_status}"}


# ==================== TASKS ROUTES ====================

@router.get("/tasks")
async def get_all_tasks(
    status: Optional[str] = None,
    assignee_id: Optional[str] = None,
    project_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all tasks (My Tasks view)"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if assignee_id:
        query["assignee_id"] = assignee_id
    if project_id:
        query["project_id"] = project_id
    
    cursor = db.ops_tasks.find(query, {"_id": 0}).sort("due_date", 1)
    tasks = await cursor.to_list(length=1000)
    return {"success": True, "data": tasks, "count": len(tasks)}


@router.get("/tasks/my")
async def get_my_tasks(current_user: dict = Depends(get_current_user)):
    """Get tasks assigned to current user"""
    db = get_db()
    cursor = db.ops_tasks.find(
        {"assignee_id": current_user.get("user_id"), "org_id": current_user.get("org_id")},
        {"_id": 0}
    ).sort("due_date", 1)
    tasks = await cursor.to_list(length=1000)
    return {"success": True, "data": tasks, "count": len(tasks)}


@router.get("/tasks/{task_id}")
async def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    """Get task details"""
    db = get_db()
    task = await db.ops_tasks.find_one(
        {"task_id": task_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return {"success": True, "data": task}


@router.post("/tasks")
async def create_task(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a new task"""
    db = get_db()
    task = {
        "task_id": f"TSK-{uuid.uuid4().hex[:8].upper()}",
        "project_id": data.get("project_id"),
        "task_type": data.get("task_type", "manual"),
        "title": data.get("title"),
        "description": data.get("description"),
        "assignee_type": data.get("assignee_type", "internal"),
        "assignee_id": data.get("assignee_id"),
        "assignee_name": data.get("assignee_name"),
        "priority": data.get("priority", "medium"),
        "due_date": data.get("due_date"),
        "status": "created",
        "dependencies": data.get("dependencies", []),
        "sla_impact": data.get("sla_impact", "none"),
        "created_at": datetime.utcnow().isoformat(),
        "org_id": current_user.get("org_id")
    }
    
    # Check if dependencies are all completed
    if not task["dependencies"]:
        task["status"] = "ready"
    
    await db.ops_tasks.insert_one(task)
    task.pop("_id", None)
    return {"success": True, "data": task}


@router.put("/tasks/{task_id}/status")
async def update_task_status(task_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update task status"""
    db = get_db()
    new_status = data.get("status")
    update = {"status": new_status}
    
    if new_status == "in_progress":
        update["started_at"] = datetime.utcnow().isoformat()
    elif new_status == "completed":
        update["completed_at"] = datetime.utcnow().isoformat()
    elif new_status == "blocked":
        update["blocked_reason"] = data.get("reason")
    
    result = await db.ops_tasks.update_one(
        {"task_id": task_id, "org_id": current_user.get("org_id")},
        {"$set": update}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {"success": True, "message": f"Task status updated to {new_status}"}


# ==================== INVENTORY ROUTES ====================

@router.get("/inventory")
async def get_inventory(current_user: dict = Depends(get_current_user)):
    """Get all inventory items"""
    db = get_db()
    cursor = db.ops_inventory.find({"org_id": current_user.get("org_id")}, {"_id": 0})
    items = await cursor.to_list(length=1000)
    return {"success": True, "data": items, "count": len(items)}


@router.post("/inventory")
async def create_inventory_item(data: dict, current_user: dict = Depends(get_current_user)):
    """Create inventory item"""
    db = get_db()
    item = {
        "inventory_item_id": f"INV-{uuid.uuid4().hex[:8].upper()}",
        "name": data.get("name"),
        "inventory_type": data.get("inventory_type", "physical"),
        "unit_of_measure": data.get("unit_of_measure", "units"),
        "available_quantity": data.get("available_quantity", 0),
        "reserved_quantity": 0,
        "status": "active",
        "org_id": current_user.get("org_id")
    }
    await db.ops_inventory.insert_one(item)
    item.pop("_id", None)
    return {"success": True, "data": item}


# ==================== RESOURCES ROUTES ====================

@router.get("/resources")
async def get_resources(current_user: dict = Depends(get_current_user)):
    """Get all resources"""
    db = get_db()
    cursor = db.ops_resources.find({"org_id": current_user.get("org_id")}, {"_id": 0})
    resources = await cursor.to_list(length=1000)
    return {"success": True, "data": resources, "count": len(resources)}


@router.post("/resources")
async def create_resource(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a resource"""
    db = get_db()
    resource = {
        "resource_id": f"RES-{uuid.uuid4().hex[:8].upper()}",
        "name": data.get("name"),
        "resource_type": data.get("resource_type", "internal"),
        "skill_tags": data.get("skill_tags", []),
        "availability_percent": 100.0,
        "status": "available",
        "org_id": current_user.get("org_id")
    }
    await db.ops_resources.insert_one(resource)
    resource.pop("_id", None)
    return {"success": True, "data": resource}


# ==================== SERVICE DELIVERY ROUTES ====================

@router.get("/services")
async def get_services(
    status: Optional[str] = None,
    service_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all service instances"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if status:
        query["status"] = status
    if service_type:
        query["service_type"] = service_type
    
    cursor = db.ops_services.find(query, {"_id": 0}).sort("created_at", -1)
    services = await cursor.to_list(length=1000)
    return {"success": True, "data": services, "count": len(services)}


@router.get("/services/{service_instance_id}")
async def get_service(service_instance_id: str, current_user: dict = Depends(get_current_user)):
    """Get service instance details"""
    db = get_db()
    service = await db.ops_services.find_one(
        {"service_instance_id": service_instance_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    
    # Get usage history
    usage = await db.ops_service_usage.find({"service_instance_id": service_instance_id}, {"_id": 0}).to_list(length=100)
    
    return {"success": True, "data": {**service, "usage_history": usage}}


@router.post("/services")
async def create_service(data: dict, current_user: dict = Depends(get_current_user)):
    """Create a service instance"""
    db = get_db()
    service = {
        "service_instance_id": f"SVC-{uuid.uuid4().hex[:8].upper()}",
        "contract_id": data.get("contract_id"),
        "party_id": data.get("party_id"),
        "party_name": data.get("party_name"),
        "service_type": data.get("service_type", "subscription"),
        "service_name": data.get("service_name"),
        "start_date": data.get("start_date"),
        "end_date": data.get("end_date"),
        "delivery_frequency": data.get("delivery_frequency", "monthly"),
        "sla_snapshot": data.get("sla_snapshot", {}),
        "usage_metrics_definition": data.get("usage_metrics_definition", {}),
        "usage_current": 0,
        "usage_limit": data.get("usage_limit", 100),
        "status": "created",
        "sla_status": "on_track",
        "created_at": datetime.utcnow().isoformat(),
        "org_id": current_user.get("org_id")
    }
    await db.ops_services.insert_one(service)
    service.pop("_id", None)
    return {"success": True, "data": service}


@router.put("/services/{service_instance_id}/status")
async def update_service_status(service_instance_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update service status"""
    db = get_db()
    result = await db.ops_services.update_one(
        {"service_instance_id": service_instance_id, "org_id": current_user.get("org_id")},
        {"$set": {"status": data.get("status")}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "message": "Service status updated"}


# ==================== EXECUTION GOVERNANCE ROUTES ====================

@router.get("/governance/alerts")
async def get_alerts(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    category: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get execution alerts"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if severity:
        query["severity"] = severity
    if status:
        query["status"] = status
    if category:
        query["alert_category"] = category
    
    cursor = db.ops_alerts.find(query, {"_id": 0}).sort("raised_at", -1)
    alerts = await cursor.to_list(length=1000)
    return {"success": True, "data": alerts, "count": len(alerts)}


@router.get("/governance/alerts/{alert_id}")
async def get_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Get alert details"""
    db = get_db()
    alert = await db.ops_alerts.find_one(
        {"alert_id": alert_id, "org_id": current_user.get("org_id")},
        {"_id": 0}
    )
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "data": alert}


@router.put("/governance/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Acknowledge an alert"""
    db = get_db()
    result = await db.ops_alerts.update_one(
        {"alert_id": alert_id, "org_id": current_user.get("org_id")},
        {"$set": {"status": "acknowledged", "acknowledged_by": current_user.get("user_id")}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "message": "Alert acknowledged"}


@router.put("/governance/alerts/{alert_id}/resolve")
async def resolve_alert(alert_id: str, current_user: dict = Depends(get_current_user)):
    """Resolve an alert"""
    db = get_db()
    result = await db.ops_alerts.update_one(
        {"alert_id": alert_id, "org_id": current_user.get("org_id")},
        {"$set": {"status": "resolved", "resolved_at": datetime.utcnow().isoformat()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"success": True, "message": "Alert resolved"}


@router.get("/governance/dashboard")
async def get_governance_dashboard(current_user: dict = Depends(get_current_user)):
    """Get governance dashboard metrics"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Aggregate metrics
    open_alerts = await db.ops_alerts.count_documents({"org_id": org_id, "status": "open"})
    critical_alerts = await db.ops_alerts.count_documents({"org_id": org_id, "status": "open", "severity": "critical"})
    sla_breaches = await db.ops_sla_breaches.count_documents({"org_id": org_id})
    active_projects = await db.ops_projects.count_documents({"org_id": org_id, "status": "active"})
    at_risk_projects = await db.ops_projects.count_documents({"org_id": org_id, "sla_status": "at_risk"})
    
    return {
        "success": True,
        "data": {
            "open_alerts": open_alerts,
            "critical_alerts": critical_alerts,
            "sla_breaches": sla_breaches,
            "active_projects": active_projects,
            "at_risk_projects": at_risk_projects
        }
    }


# ==================== SEED DATA ROUTE ====================

@router.post("/seed")
async def seed_operations_data(current_user: dict = Depends(get_current_user)):
    """Seed sample operations data"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Clear existing data
    for collection in ["ops_work_orders", "ops_projects", "ops_tasks", "ops_milestones", 
                       "ops_inventory", "ops_resources", "ops_services", "ops_alerts"]:
        await db[collection].delete_many({"org_id": org_id})
    
    # Seed Work Orders
    work_orders = [
        {
            "work_order_id": "WO-001",
            "source_contract_id": "CTR-2025-001",
            "source_type": "revenue",
            "party_id": "CUST-001",
            "party_name": "Tata Motors Ltd",
            "delivery_type": "project",
            "scope_snapshot": {"deliverables": ["ERP Implementation", "Training", "Support"]},
            "sla_snapshot": {"response_time": "4h", "resolution_time": "24h", "duration_days": 90},
            "planned_start_date": "2025-01-15",
            "planned_end_date": "2025-04-15",
            "status": "accepted",
            "risk_flag": False,
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        },
        {
            "work_order_id": "WO-002",
            "source_contract_id": "CTR-2025-002",
            "source_type": "revenue",
            "party_id": "CUST-002",
            "party_name": "Reliance Industries",
            "delivery_type": "service",
            "scope_snapshot": {"service": "Managed IT Support", "hours_per_month": 100},
            "sla_snapshot": {"response_time": "2h", "uptime": "99.5%"},
            "planned_start_date": "2025-01-01",
            "planned_end_date": "2025-12-31",
            "status": "active",
            "risk_flag": False,
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        },
        {
            "work_order_id": "WO-003",
            "source_contract_id": "CTR-2025-003",
            "source_type": "procurement",
            "party_id": "VND-001",
            "party_name": "Tech Solutions Inc",
            "delivery_type": "project",
            "scope_snapshot": {"items": ["Server Hardware", "Network Equipment"]},
            "sla_snapshot": {"delivery_days": 30},
            "planned_start_date": "2025-01-20",
            "planned_end_date": "2025-02-20",
            "status": "pending",
            "risk_flag": True,
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        }
    ]
    await db.ops_work_orders.insert_many(work_orders)
    
    # Seed Projects
    projects = [
        {
            "project_id": "PRJ-001",
            "work_order_id": "WO-001",
            "project_type": "client",
            "name": "Tata Motors ERP Implementation",
            "description": "Full ERP implementation for automotive operations",
            "start_date": "2025-01-15",
            "target_end_date": "2025-04-15",
            "status": "active",
            "scope_snapshot": {"deliverables": ["ERP Implementation", "Training", "Support"]},
            "sla_snapshot": {"response_time": "4h", "resolution_time": "24h"},
            "owner_id": current_user.get("user_id"),
            "owner_name": "Rajesh Kumar",
            "progress_percent": 35,
            "sla_status": "on_track",
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        },
        {
            "project_id": "PRJ-002",
            "work_order_id": "WO-003",
            "project_type": "vendor",
            "name": "Infrastructure Procurement",
            "description": "Hardware procurement from Tech Solutions",
            "start_date": "2025-01-20",
            "target_end_date": "2025-02-20",
            "status": "planned",
            "scope_snapshot": {"items": ["Server Hardware", "Network Equipment"]},
            "sla_snapshot": {"delivery_days": 30},
            "owner_id": current_user.get("user_id"),
            "owner_name": "Priya Sharma",
            "progress_percent": 0,
            "sla_status": "on_track",
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        }
    ]
    await db.ops_projects.insert_many(projects)
    
    # Seed Tasks
    tasks = [
        {"task_id": "TSK-001", "project_id": "PRJ-001", "task_type": "manual", "title": "Kickoff Meeting", "assignee_name": "Rajesh Kumar", "priority": "high", "due_date": "2025-01-16", "status": "completed", "sla_impact": "soft", "org_id": org_id, "created_at": datetime.utcnow().isoformat()},
        {"task_id": "TSK-002", "project_id": "PRJ-001", "task_type": "external", "title": "Client Data Collection", "assignee_name": "Tata Motors Team", "priority": "high", "due_date": "2025-01-25", "status": "in_progress", "sla_impact": "hard", "org_id": org_id, "created_at": datetime.utcnow().isoformat()},
        {"task_id": "TSK-003", "project_id": "PRJ-001", "task_type": "manual", "title": "System Configuration", "assignee_name": "Amit Patel", "priority": "medium", "due_date": "2025-02-10", "status": "ready", "dependencies": ["TSK-002"], "sla_impact": "hard", "org_id": org_id, "created_at": datetime.utcnow().isoformat()},
        {"task_id": "TSK-004", "project_id": "PRJ-001", "task_type": "approval", "title": "Configuration Review", "assignee_name": "Priya Sharma", "priority": "high", "due_date": "2025-02-15", "status": "created", "dependencies": ["TSK-003"], "sla_impact": "soft", "org_id": org_id, "created_at": datetime.utcnow().isoformat()},
        {"task_id": "TSK-005", "project_id": "PRJ-001", "task_type": "manual", "title": "User Training", "assignee_name": "Training Team", "priority": "medium", "due_date": "2025-03-15", "status": "created", "sla_impact": "soft", "org_id": org_id, "created_at": datetime.utcnow().isoformat()}
    ]
    await db.ops_tasks.insert_many(tasks)
    
    # Seed Resources
    resources = [
        {"resource_id": "RES-001", "name": "Rajesh Kumar", "resource_type": "internal", "skill_tags": ["Project Management", "ERP"], "availability_percent": 40, "status": "partially_allocated", "org_id": org_id},
        {"resource_id": "RES-002", "name": "Amit Patel", "resource_type": "internal", "skill_tags": ["Technical Lead", "SAP"], "availability_percent": 20, "status": "partially_allocated", "org_id": org_id},
        {"resource_id": "RES-003", "name": "Priya Sharma", "resource_type": "internal", "skill_tags": ["Business Analyst", "Finance"], "availability_percent": 60, "status": "partially_allocated", "org_id": org_id},
        {"resource_id": "RES-004", "name": "External Consultant", "resource_type": "contractor", "skill_tags": ["SAP FICO", "Integration"], "availability_percent": 100, "status": "available", "org_id": org_id}
    ]
    await db.ops_resources.insert_many(resources)
    
    # Seed Services
    services = [
        {
            "service_instance_id": "SVC-001",
            "contract_id": "CTR-2025-002",
            "party_id": "CUST-002",
            "party_name": "Reliance Industries",
            "service_type": "retainer",
            "service_name": "Managed IT Support",
            "start_date": "2025-01-01",
            "end_date": "2025-12-31",
            "delivery_frequency": "monthly",
            "sla_snapshot": {"response_time": "2h", "resolution_time": "8h", "uptime": "99.5%"},
            "usage_current": 45,
            "usage_limit": 100,
            "status": "active",
            "sla_status": "on_track",
            "created_at": datetime.utcnow().isoformat(),
            "org_id": org_id
        }
    ]
    await db.ops_services.insert_many(services)
    
    # Seed Alerts
    alerts = [
        {"alert_id": "ALT-001", "entity_type": "task", "entity_id": "TSK-002", "entity_name": "Client Data Collection", "alert_category": "sla", "severity": "warning", "message": "Task approaching due date with incomplete data", "status": "open", "raised_at": datetime.utcnow().isoformat(), "org_id": org_id},
        {"alert_id": "ALT-002", "entity_type": "resource", "entity_id": "RES-002", "entity_name": "Amit Patel", "alert_category": "resource", "severity": "info", "message": "Resource utilization at 80%", "status": "acknowledged", "raised_at": datetime.utcnow().isoformat(), "org_id": org_id}
    ]
    await db.ops_alerts.insert_many(alerts)
    
    return {"success": True, "message": "Operations data seeded successfully"}
