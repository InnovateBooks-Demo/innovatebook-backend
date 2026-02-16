"""
IB Operations - SLA Monitoring Engine
Real-time SLA monitoring and alert generation
"""

from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from typing import List, Optional
from datetime import datetime, timedelta
import uuid
import jwt
import os
import asyncio

router = APIRouter(prefix="/api/operations/sla", tags=["SLA Monitoring"])

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


# ==================== SLA MONITORING FUNCTIONS ====================

async def check_task_sla(db, org_id: str):
    """Check all tasks for SLA violations"""
    now = datetime.now()
    alerts_created = []
    
    # Find tasks that are overdue or at risk
    cursor = db.ops_tasks.find({
        "org_id": org_id,
        "status": {"$nin": ["completed", "cancelled"]},
        "sla_impact": {"$in": ["soft", "hard"]}
    }, {"_id": 0})
    
    tasks = await cursor.to_list(length=1000)
    
    for task in tasks:
        due_date = datetime.strptime(task.get("due_date", "2099-12-31"), "%Y-%m-%d")
        days_until_due = (due_date - now).days
        
        # Check for at-risk tasks (within 2 days of due date)
        if 0 < days_until_due <= 2 and task.get("status") not in ["completed"]:
            alert = await create_sla_alert(
                db, org_id,
                entity_type="task",
                entity_id=task["task_id"],
                entity_name=task.get("title"),
                severity="warning" if task.get("sla_impact") == "soft" else "critical",
                message=f"Task '{task.get('title')}' is due in {days_until_due} day(s)",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
        
        # Check for overdue tasks
        elif days_until_due < 0:
            alert = await create_sla_alert(
                db, org_id,
                entity_type="task",
                entity_id=task["task_id"],
                entity_name=task.get("title"),
                severity="critical" if task.get("sla_impact") == "hard" else "warning",
                message=f"Task '{task.get('title')}' is overdue by {abs(days_until_due)} day(s)",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
                
                # Create SLA breach record
                await create_sla_breach(
                    db, org_id,
                    entity_type="task",
                    entity_id=task["task_id"],
                    entity_name=task.get("title"),
                    breach_type=task.get("sla_impact", "soft"),
                    delay_duration=f"{abs(days_until_due)} days"
                )
    
    return alerts_created


async def check_project_sla(db, org_id: str):
    """Check all projects for SLA violations"""
    now = datetime.now()
    alerts_created = []
    
    # Find active projects
    cursor = db.ops_projects.find({
        "org_id": org_id,
        "status": {"$in": ["planned", "active"]}
    }, {"_id": 0})
    
    projects = await cursor.to_list(length=1000)
    
    for project in projects:
        target_date = datetime.strptime(project.get("target_end_date", "2099-12-31"), "%Y-%m-%d")
        days_until_due = (target_date - now).days
        progress = project.get("progress_percent", 0)
        
        # Calculate expected progress based on time elapsed
        start_date = datetime.strptime(project.get("start_date", now.strftime("%Y-%m-%d")), "%Y-%m-%d")
        total_days = (target_date - start_date).days or 1
        elapsed_days = (now - start_date).days
        expected_progress = min(100, (elapsed_days / total_days) * 100)
        
        # Check if project is behind schedule
        progress_gap = expected_progress - progress
        
        new_sla_status = "on_track"
        
        if progress_gap > 30 or days_until_due < 0:
            new_sla_status = "breached"
            alert = await create_sla_alert(
                db, org_id,
                entity_type="project",
                entity_id=project["project_id"],
                entity_name=project.get("name"),
                severity="critical",
                message=f"Project '{project.get('name')}' is significantly behind schedule ({progress}% vs expected {expected_progress:.0f}%)",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
        elif progress_gap > 15 or (0 < days_until_due <= 7):
            new_sla_status = "at_risk"
            alert = await create_sla_alert(
                db, org_id,
                entity_type="project",
                entity_id=project["project_id"],
                entity_name=project.get("name"),
                severity="warning",
                message=f"Project '{project.get('name')}' is at risk - {progress}% complete with {days_until_due} days remaining",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
        
        # Update project SLA status
        if project.get("sla_status") != new_sla_status:
            await db.ops_projects.update_one(
                {"project_id": project["project_id"]},
                {"$set": {"sla_status": new_sla_status}}
            )
    
    return alerts_created


async def check_service_sla(db, org_id: str):
    """Check all services for SLA violations"""
    alerts_created = []
    
    # Find active services
    cursor = db.ops_services.find({
        "org_id": org_id,
        "status": "active"
    }, {"_id": 0})
    
    services = await cursor.to_list(length=1000)
    
    for service in services:
        usage_current = service.get("usage_current", 0)
        usage_limit = service.get("usage_limit", 100)
        usage_percent = (usage_current / usage_limit) * 100 if usage_limit > 0 else 0
        
        new_sla_status = "on_track"
        
        # Check usage thresholds
        if usage_percent >= 100:
            new_sla_status = "breached"
            alert = await create_sla_alert(
                db, org_id,
                entity_type="service",
                entity_id=service["service_instance_id"],
                entity_name=service.get("service_name"),
                severity="critical",
                message=f"Service '{service.get('service_name')}' has exceeded usage limit ({usage_current}/{usage_limit})",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
        elif usage_percent >= 90:
            new_sla_status = "at_risk"
            alert = await create_sla_alert(
                db, org_id,
                entity_type="service",
                entity_id=service["service_instance_id"],
                entity_name=service.get("service_name"),
                severity="warning",
                message=f"Service '{service.get('service_name')}' is at {usage_percent:.0f}% of usage limit",
                alert_category="sla"
            )
            if alert:
                alerts_created.append(alert)
        
        # Update service SLA status
        if service.get("sla_status") != new_sla_status:
            await db.ops_services.update_one(
                {"service_instance_id": service["service_instance_id"]},
                {"$set": {"sla_status": new_sla_status}}
            )
    
    return alerts_created


async def check_resource_allocation(db, org_id: str):
    """Check for resource over-allocation"""
    alerts_created = []
    
    cursor = db.ops_resources.find({
        "org_id": org_id
    }, {"_id": 0})
    
    resources = await cursor.to_list(length=1000)
    
    for resource in resources:
        availability = resource.get("availability_percent", 100)
        
        if availability < 0:
            alert = await create_sla_alert(
                db, org_id,
                entity_type="resource",
                entity_id=resource["resource_id"],
                entity_name=resource.get("name"),
                severity="critical",
                message=f"Resource '{resource.get('name')}' is over-allocated by {abs(availability)}%",
                alert_category="resource"
            )
            if alert:
                alerts_created.append(alert)
        elif availability <= 10:
            alert = await create_sla_alert(
                db, org_id,
                entity_type="resource",
                entity_id=resource["resource_id"],
                entity_name=resource.get("name"),
                severity="warning",
                message=f"Resource '{resource.get('name')}' has only {availability}% availability remaining",
                alert_category="resource"
            )
            if alert:
                alerts_created.append(alert)
    
    return alerts_created


async def create_sla_alert(db, org_id: str, entity_type: str, entity_id: str, 
                          entity_name: str, severity: str, message: str, alert_category: str):
    """Create an alert if one doesn't already exist for this entity"""
    
    # Check if similar open alert exists
    existing = await db.ops_alerts.find_one({
        "org_id": org_id,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "status": "open",
        "alert_category": alert_category
    })
    
    if existing:
        return None  # Don't create duplicate
    
    alert = {
        "alert_id": f"ALT-{uuid.uuid4().hex[:8].upper()}",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "alert_category": alert_category,
        "severity": severity,
        "message": message,
        "status": "open",
        "raised_at": datetime.utcnow().isoformat(),
        "org_id": org_id
    }
    
    await db.ops_alerts.insert_one(alert)
    alert.pop("_id", None)
    return alert


async def create_sla_breach(db, org_id: str, entity_type: str, entity_id: str,
                           entity_name: str, breach_type: str, delay_duration: str):
    """Create an SLA breach record"""
    
    # Check if breach already recorded
    existing = await db.ops_sla_breaches.find_one({
        "org_id": org_id,
        "entity_type": entity_type,
        "entity_id": entity_id
    })
    
    if existing:
        return None
    
    breach = {
        "breach_id": f"BRH-{uuid.uuid4().hex[:8].upper()}",
        "entity_type": entity_type,
        "entity_id": entity_id,
        "entity_name": entity_name,
        "breach_type": breach_type,
        "delay_duration": delay_duration,
        "detected_at": datetime.utcnow().isoformat(),
        "org_id": org_id
    }
    
    await db.ops_sla_breaches.insert_one(breach)
    breach.pop("_id", None)
    return breach


# ==================== API ENDPOINTS ====================

@router.post("/check")
async def run_sla_check(current_user: dict = Depends(get_current_user)):
    """Run SLA check for the current organization"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    all_alerts = []
    
    # Run all checks
    task_alerts = await check_task_sla(db, org_id)
    all_alerts.extend(task_alerts)
    
    project_alerts = await check_project_sla(db, org_id)
    all_alerts.extend(project_alerts)
    
    service_alerts = await check_service_sla(db, org_id)
    all_alerts.extend(service_alerts)
    
    resource_alerts = await check_resource_allocation(db, org_id)
    all_alerts.extend(resource_alerts)
    
    return {
        "success": True,
        "message": f"SLA check completed - {len(all_alerts)} new alerts created",
        "alerts_created": len(all_alerts),
        "details": {
            "task_alerts": len(task_alerts),
            "project_alerts": len(project_alerts),
            "service_alerts": len(service_alerts),
            "resource_alerts": len(resource_alerts)
        }
    }


@router.get("/breaches")
async def get_sla_breaches(
    entity_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get all SLA breaches"""
    db = get_db()
    query = {"org_id": current_user.get("org_id")}
    if entity_type:
        query["entity_type"] = entity_type
    
    cursor = db.ops_sla_breaches.find(query, {"_id": 0}).sort("detected_at", -1)
    breaches = await cursor.to_list(length=1000)
    return {"success": True, "data": breaches, "count": len(breaches)}


@router.get("/summary")
async def get_sla_summary(current_user: dict = Depends(get_current_user)):
    """Get SLA summary dashboard data"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Count by status
    total_projects = await db.ops_projects.count_documents({"org_id": org_id, "status": {"$in": ["planned", "active"]}})
    on_track_projects = await db.ops_projects.count_documents({"org_id": org_id, "sla_status": "on_track", "status": {"$in": ["planned", "active"]}})
    at_risk_projects = await db.ops_projects.count_documents({"org_id": org_id, "sla_status": "at_risk"})
    breached_projects = await db.ops_projects.count_documents({"org_id": org_id, "sla_status": "breached"})
    
    total_services = await db.ops_services.count_documents({"org_id": org_id, "status": "active"})
    on_track_services = await db.ops_services.count_documents({"org_id": org_id, "sla_status": "on_track", "status": "active"})
    
    overdue_tasks = await db.ops_tasks.count_documents({
        "org_id": org_id,
        "status": {"$nin": ["completed", "cancelled"]},
        "due_date": {"$lt": datetime.now().strftime("%Y-%m-%d")}
    })
    
    total_breaches = await db.ops_sla_breaches.count_documents({"org_id": org_id})
    
    # Calculate compliance rate
    if total_projects > 0:
        project_compliance = (on_track_projects / total_projects) * 100
    else:
        project_compliance = 100
    
    return {
        "success": True,
        "data": {
            "projects": {
                "total": total_projects,
                "on_track": on_track_projects,
                "at_risk": at_risk_projects,
                "breached": breached_projects,
                "compliance_rate": round(project_compliance, 1)
            },
            "services": {
                "total": total_services,
                "on_track": on_track_services
            },
            "tasks": {
                "overdue": overdue_tasks
            },
            "breaches": {
                "total": total_breaches
            }
        }
    }
