"""
Workflow Builder Module
Visual automation for cross-module processes
"""

from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
import uuid
import jwt
import os
from motor.motor_asyncio import AsyncIOMotorClient

router = APIRouter(prefix="/api/workflows", tags=["Workflow Builder"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'innovate_books_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env


async def get_current_user(authorization: str = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {"user_id": payload.get("user_id"), "org_id": payload.get("org_id")}
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


def serialize_doc(doc):
    if doc and "_id" in doc:
        del doc["_id"]
    return doc


def serialize_docs(docs):
    return [serialize_doc(d) for d in docs]


# Collections
workflows_col = db.workflow_definitions
workflow_runs_col = db.workflow_runs
workflow_steps_col = db.workflow_step_logs


# ============== PYDANTIC MODELS ==============

class TriggerConfig(BaseModel):
    type: str  # event, schedule, manual, webhook
    event_type: Optional[str] = None  # invoice_overdue, payment_received, etc.
    schedule: Optional[str] = None  # cron expression
    conditions: List[Dict[str, Any]] = []


class ActionConfig(BaseModel):
    type: str  # create_task, send_email, update_record, send_notification, api_call
    target_module: Optional[str] = None
    parameters: Dict[str, Any] = {}


class WorkflowStep(BaseModel):
    step_id: str
    name: str
    step_type: str  # trigger, condition, action, delay, branch
    config: Dict[str, Any] = {}
    next_steps: List[str] = []  # IDs of next steps
    position: Dict[str, int] = {"x": 0, "y": 0}  # For visual builder


class WorkflowCreate(BaseModel):
    name: str
    description: Optional[str] = None
    trigger: TriggerConfig
    steps: List[WorkflowStep] = []
    is_active: bool = False


# ============== WORKFLOW CRUD ==============

@router.get("/list")
async def list_workflows(status: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """List all workflows"""
    org_id = current_user.get("org_id")
    query = {"org_id": org_id, "deleted": {"$ne": True}}
    if status == "active":
        query["is_active"] = True
    elif status == "inactive":
        query["is_active"] = False
    
    workflows = await workflows_col.find(query).sort("created_at", -1).to_list(100)
    
    # Add run counts
    for wf in workflows:
        run_count = await workflow_runs_col.count_documents({"workflow_id": wf.get("workflow_id")})
        wf["run_count"] = run_count
    
    return {"workflows": serialize_docs(workflows)}


@router.post("/create")
async def create_workflow(workflow: WorkflowCreate, current_user: dict = Depends(get_current_user)):
    """Create a new workflow"""
    org_id = current_user.get("org_id")
    
    new_workflow = {
        "workflow_id": f"WF-{uuid.uuid4().hex[:8].upper()}",
        "org_id": org_id,
        "name": workflow.name,
        "description": workflow.description,
        "trigger": workflow.trigger.dict(),
        "steps": [s.dict() for s in workflow.steps],
        "is_active": workflow.is_active,
        "version": 1,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "run_count": 0,
        "last_run_at": None
    }
    
    await workflows_col.insert_one(new_workflow)
    return serialize_doc(new_workflow)


@router.get("/{workflow_id}")
async def get_workflow(workflow_id: str, current_user: dict = Depends(get_current_user)):
    """Get workflow details"""
    org_id = current_user.get("org_id")
    workflow = await workflows_col.find_one({"workflow_id": workflow_id, "org_id": org_id})
    
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Get recent runs
    runs = await workflow_runs_col.find({"workflow_id": workflow_id}).sort("started_at", -1).limit(10).to_list(10)
    workflow["recent_runs"] = serialize_docs(runs)
    
    return serialize_doc(workflow)


@router.put("/{workflow_id}")
async def update_workflow(workflow_id: str, data: dict, current_user: dict = Depends(get_current_user)):
    """Update a workflow"""
    org_id = current_user.get("org_id")
    
    workflow = await workflows_col.find_one({"workflow_id": workflow_id, "org_id": org_id})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    allowed_fields = ["name", "description", "trigger", "steps", "is_active"]
    update_data = {k: v for k, v in data.items() if k in allowed_fields}
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    update_data["version"] = workflow.get("version", 1) + 1
    
    await workflows_col.update_one({"workflow_id": workflow_id}, {"$set": update_data})
    
    updated = await workflows_col.find_one({"workflow_id": workflow_id})
    return serialize_doc(updated)


@router.delete("/{workflow_id}")
async def delete_workflow(workflow_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a workflow"""
    org_id = current_user.get("org_id")
    result = await workflows_col.update_one(
        {"workflow_id": workflow_id, "org_id": org_id},
        {"$set": {"deleted": True, "deleted_at": datetime.now(timezone.utc).isoformat(), "is_active": False}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    return {"success": True, "message": "Workflow deleted"}


@router.post("/{workflow_id}/toggle")
async def toggle_workflow(workflow_id: str, current_user: dict = Depends(get_current_user)):
    """Toggle workflow active status"""
    org_id = current_user.get("org_id")
    
    workflow = await workflows_col.find_one({"workflow_id": workflow_id, "org_id": org_id})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    new_status = not workflow.get("is_active", False)
    await workflows_col.update_one(
        {"workflow_id": workflow_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "is_active": new_status}


# ============== WORKFLOW EXECUTION ==============

@router.post("/{workflow_id}/run")
async def run_workflow_manual(workflow_id: str, data: dict, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Manually trigger a workflow run"""
    org_id = current_user.get("org_id")
    
    workflow = await workflows_col.find_one({"workflow_id": workflow_id, "org_id": org_id})
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    # Create run record
    run = {
        "run_id": f"RUN-{uuid.uuid4().hex[:8].upper()}",
        "workflow_id": workflow_id,
        "org_id": org_id,
        "trigger_type": "manual",
        "trigger_data": data.get("trigger_data", {}),
        "status": "running",
        "started_at": datetime.now(timezone.utc).isoformat(),
        "started_by": current_user.get("user_id"),
        "steps_completed": 0,
        "steps_total": len(workflow.get("steps", []))
    }
    
    await workflow_runs_col.insert_one(run)
    
    # Execute workflow in background
    background_tasks.add_task(execute_workflow, workflow, run.get("run_id"), data.get("trigger_data", {}))
    
    return {"success": True, "run_id": run.get("run_id"), "message": "Workflow execution started"}


async def execute_workflow(workflow: dict, run_id: str, trigger_data: dict):
    """Execute workflow steps"""
    import asyncio
    
    steps = workflow.get("steps", [])
    context = {"trigger_data": trigger_data, "results": {}}
    
    try:
        for i, step in enumerate(steps):
            step_log = {
                "log_id": f"LOG-{uuid.uuid4().hex[:8].upper()}",
                "run_id": run_id,
                "step_id": step.get("step_id"),
                "step_name": step.get("name"),
                "step_type": step.get("step_type"),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "status": "running"
            }
            
            await workflow_steps_col.insert_one(step_log)
            
            try:
                # Execute step based on type
                result = await execute_step(step, context)
                context["results"][step.get("step_id")] = result
                
                await workflow_steps_col.update_one(
                    {"log_id": step_log.get("log_id")},
                    {"$set": {
                        "status": "completed",
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                        "result": result
                    }}
                )
                
                await workflow_runs_col.update_one(
                    {"run_id": run_id},
                    {"$inc": {"steps_completed": 1}}
                )
                
            except Exception as e:
                await workflow_steps_col.update_one(
                    {"log_id": step_log.get("log_id")},
                    {"$set": {
                        "status": "failed",
                        "completed_at": datetime.now(timezone.utc).isoformat(),
                        "error": str(e)
                    }}
                )
                raise
            
            # Small delay between steps
            await asyncio.sleep(0.1)
        
        # Mark run as completed
        await workflow_runs_col.update_one(
            {"run_id": run_id},
            {"$set": {
                "status": "completed",
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Update workflow stats
        await workflows_col.update_one(
            {"workflow_id": workflow.get("workflow_id")},
            {"$inc": {"run_count": 1}, "$set": {"last_run_at": datetime.now(timezone.utc).isoformat()}}
        )
        
    except Exception as e:
        await workflow_runs_col.update_one(
            {"run_id": run_id},
            {"$set": {
                "status": "failed",
                "completed_at": datetime.now(timezone.utc).isoformat(),
                "error": str(e)
            }}
        )


async def execute_step(step: dict, context: dict) -> dict:
    """Execute a single workflow step"""
    step_type = step.get("step_type")
    config = step.get("config", {})
    
    if step_type == "condition":
        # Evaluate condition
        return await execute_condition(config, context)
    
    elif step_type == "action":
        return await execute_action(config, context)
    
    elif step_type == "delay":
        # Wait for specified time
        import asyncio
        delay_seconds = config.get("delay_seconds", 0)
        await asyncio.sleep(min(delay_seconds, 60))  # Max 60s delay in demo
        return {"delayed": delay_seconds}
    
    elif step_type == "branch":
        # Branch logic
        return {"branch": "default"}
    
    return {"executed": True}


async def execute_condition(config: dict, context: dict) -> dict:
    """Evaluate a condition"""
    field = config.get("field", "")
    operator = config.get("operator", "equals")
    value = config.get("value")
    
    # Get field value from context
    field_value = context.get("trigger_data", {}).get(field)
    
    result = False
    if operator == "equals":
        result = field_value == value
    elif operator == "not_equals":
        result = field_value != value
    elif operator == "greater_than":
        result = float(field_value or 0) > float(value or 0)
    elif operator == "less_than":
        result = float(field_value or 0) < float(value or 0)
    elif operator == "contains":
        result = str(value) in str(field_value or "")
    elif operator == "is_empty":
        result = not field_value
    elif operator == "is_not_empty":
        result = bool(field_value)
    
    return {"condition_met": result, "field": field, "operator": operator, "value": value, "actual": field_value}


async def execute_action(config: dict, context: dict) -> dict:
    """Execute an action step"""
    action_type = config.get("type")
    
    if action_type == "create_task":
        # Create a task in the system
        task_data = {
            "task_id": f"TSK-{uuid.uuid4().hex[:8].upper()}",
            "title": config.get("title", "Auto-generated task"),
            "description": config.get("description", ""),
            "assignee": config.get("assignee"),
            "due_date": config.get("due_date"),
            "priority": config.get("priority", "medium"),
            "source": "workflow",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.tasks.insert_one(task_data)
        return {"action": "create_task", "task_id": task_data.get("task_id")}
    
    elif action_type == "send_notification":
        # Create notification
        notification = {
            "notification_id": f"NTF-{uuid.uuid4().hex[:8].upper()}",
            "type": config.get("notification_type", "info"),
            "title": config.get("title", "Workflow Notification"),
            "message": config.get("message", ""),
            "recipient": config.get("recipient"),
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notification)
        return {"action": "send_notification", "notification_id": notification.get("notification_id")}
    
    elif action_type == "update_record":
        # Update a record in specified collection
        collection_name = config.get("collection")
        record_id_field = config.get("id_field", "id")
        record_id = config.get("record_id") or context.get("trigger_data", {}).get(record_id_field)
        updates = config.get("updates", {})
        
        if collection_name and record_id and updates:
            await db[collection_name].update_one(
                {record_id_field: record_id},
                {"$set": updates}
            )
            return {"action": "update_record", "collection": collection_name, "record_id": record_id}
    
    elif action_type == "send_email":
        # Queue email (simulated)
        return {"action": "send_email", "to": config.get("to"), "subject": config.get("subject"), "queued": True}
    
    return {"action": action_type, "executed": True}


# ============== WORKFLOW RUNS ==============

@router.get("/{workflow_id}/runs")
async def list_workflow_runs(workflow_id: str, current_user: dict = Depends(get_current_user)):
    """List all runs for a workflow"""
    org_id = current_user.get("org_id")
    
    runs = await workflow_runs_col.find({"workflow_id": workflow_id, "org_id": org_id}).sort("started_at", -1).to_list(100)
    return {"runs": serialize_docs(runs)}


@router.get("/runs/{run_id}")
async def get_run_details(run_id: str, current_user: dict = Depends(get_current_user)):
    """Get details of a specific run"""
    org_id = current_user.get("org_id")
    
    run = await workflow_runs_col.find_one({"run_id": run_id, "org_id": org_id})
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Get step logs
    step_logs = await workflow_steps_col.find({"run_id": run_id}).sort("started_at", 1).to_list(100)
    run["step_logs"] = serialize_docs(step_logs)
    
    return serialize_doc(run)


# ============== TEMPLATES ==============

@router.get("/templates/list")
async def list_workflow_templates():
    """Get pre-built workflow templates"""
    templates = [
        {
            "id": "invoice_overdue_reminder",
            "name": "Invoice Overdue Reminder",
            "description": "Automatically create a task and send notification when invoice is overdue",
            "category": "finance",
            "trigger": {
                "type": "event",
                "event_type": "invoice_overdue",
                "conditions": [{"field": "days_overdue", "operator": "greater_than", "value": 30}]
            },
            "steps": [
                {
                    "step_id": "s1",
                    "name": "Check Overdue Days",
                    "step_type": "condition",
                    "config": {"field": "days_overdue", "operator": "greater_than", "value": 30},
                    "next_steps": ["s2"],
                    "position": {"x": 100, "y": 100}
                },
                {
                    "step_id": "s2",
                    "name": "Create Follow-up Task",
                    "step_type": "action",
                    "config": {
                        "type": "create_task",
                        "title": "Follow up on overdue invoice",
                        "description": "Invoice {{invoice_number}} is {{days_overdue}} days overdue",
                        "priority": "high"
                    },
                    "next_steps": ["s3"],
                    "position": {"x": 100, "y": 200}
                },
                {
                    "step_id": "s3",
                    "name": "Notify Account Manager",
                    "step_type": "action",
                    "config": {
                        "type": "send_notification",
                        "title": "Overdue Invoice Alert",
                        "message": "Invoice {{invoice_number}} is {{days_overdue}} days overdue",
                        "notification_type": "warning"
                    },
                    "next_steps": [],
                    "position": {"x": 100, "y": 300}
                }
            ]
        },
        {
            "id": "payment_received_notification",
            "name": "Payment Received Notification",
            "description": "Notify team when payment is received",
            "category": "finance",
            "trigger": {
                "type": "event",
                "event_type": "payment_received",
                "conditions": []
            },
            "steps": [
                {
                    "step_id": "s1",
                    "name": "Send Notification",
                    "step_type": "action",
                    "config": {
                        "type": "send_notification",
                        "title": "Payment Received",
                        "message": "Payment of {{amount}} received from {{customer_name}}",
                        "notification_type": "success"
                    },
                    "next_steps": [],
                    "position": {"x": 100, "y": 100}
                }
            ]
        },
        {
            "id": "new_lead_assignment",
            "name": "New Lead Assignment",
            "description": "Auto-assign new leads and create follow-up task",
            "category": "sales",
            "trigger": {
                "type": "event",
                "event_type": "lead_created",
                "conditions": []
            },
            "steps": [
                {
                    "step_id": "s1",
                    "name": "Create Introduction Task",
                    "step_type": "action",
                    "config": {
                        "type": "create_task",
                        "title": "Initial contact with {{lead_name}}",
                        "description": "Reach out to new lead {{lead_name}} from {{company_name}}",
                        "priority": "high"
                    },
                    "next_steps": ["s2"],
                    "position": {"x": 100, "y": 100}
                },
                {
                    "step_id": "s2",
                    "name": "Wait 24 Hours",
                    "step_type": "delay",
                    "config": {"delay_seconds": 86400},
                    "next_steps": ["s3"],
                    "position": {"x": 100, "y": 200}
                },
                {
                    "step_id": "s3",
                    "name": "Create Follow-up Task",
                    "step_type": "action",
                    "config": {
                        "type": "create_task",
                        "title": "Follow-up with {{lead_name}}",
                        "description": "Second attempt to reach {{lead_name}}",
                        "priority": "medium"
                    },
                    "next_steps": [],
                    "position": {"x": 100, "y": 300}
                }
            ]
        },
        {
            "id": "contract_expiry_alert",
            "name": "Contract Expiry Alert",
            "description": "Alert team 30 days before contract expires",
            "category": "operations",
            "trigger": {
                "type": "schedule",
                "schedule": "0 9 * * *",
                "conditions": [{"field": "days_until_expiry", "operator": "less_than", "value": 30}]
            },
            "steps": [
                {
                    "step_id": "s1",
                    "name": "Check Expiry",
                    "step_type": "condition",
                    "config": {"field": "days_until_expiry", "operator": "less_than", "value": 30},
                    "next_steps": ["s2"],
                    "position": {"x": 100, "y": 100}
                },
                {
                    "step_id": "s2",
                    "name": "Create Renewal Task",
                    "step_type": "action",
                    "config": {
                        "type": "create_task",
                        "title": "Renew contract for {{customer_name}}",
                        "description": "Contract expires in {{days_until_expiry}} days",
                        "priority": "high"
                    },
                    "next_steps": ["s3"],
                    "position": {"x": 100, "y": 200}
                },
                {
                    "step_id": "s3",
                    "name": "Notify Sales Team",
                    "step_type": "action",
                    "config": {
                        "type": "send_notification",
                        "title": "Contract Expiry Alert",
                        "message": "Contract for {{customer_name}} expires in {{days_until_expiry}} days",
                        "notification_type": "warning"
                    },
                    "next_steps": [],
                    "position": {"x": 100, "y": 300}
                }
            ]
        }
    ]
    
    return {"templates": templates}


@router.post("/templates/{template_id}/use")
async def use_workflow_template(template_id: str, current_user: dict = Depends(get_current_user)):
    """Create a workflow from a template"""
    templates = (await list_workflow_templates())["templates"]
    template = next((t for t in templates if t["id"] == template_id), None)
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    org_id = current_user.get("org_id")
    
    new_workflow = {
        "workflow_id": f"WF-{uuid.uuid4().hex[:8].upper()}",
        "org_id": org_id,
        "name": template["name"],
        "description": template["description"],
        "trigger": template["trigger"],
        "steps": template["steps"],
        "is_active": False,
        "version": 1,
        "template_source": template_id,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "run_count": 0,
        "last_run_at": None
    }
    
    await workflows_col.insert_one(new_workflow)
    return serialize_doc(new_workflow)


# ============== EVENT TRIGGERS ==============

@router.post("/trigger-event")
async def trigger_event(data: dict, background_tasks: BackgroundTasks, current_user: dict = Depends(get_current_user)):
    """Trigger workflows based on an event"""
    org_id = current_user.get("org_id")
    event_type = data.get("event_type")
    event_data = data.get("data", {})
    
    if not event_type:
        raise HTTPException(status_code=400, detail="event_type required")
    
    # Find active workflows with matching event trigger
    workflows = await workflows_col.find({
        "org_id": org_id,
        "is_active": True,
        "trigger.type": "event",
        "trigger.event_type": event_type
    }).to_list(100)
    
    triggered = []
    for workflow in workflows:
        # Create run
        run = {
            "run_id": f"RUN-{uuid.uuid4().hex[:8].upper()}",
            "workflow_id": workflow.get("workflow_id"),
            "org_id": org_id,
            "trigger_type": "event",
            "trigger_data": event_data,
            "status": "running",
            "started_at": datetime.now(timezone.utc).isoformat(),
            "steps_completed": 0,
            "steps_total": len(workflow.get("steps", []))
        }
        
        await workflow_runs_col.insert_one(run)
        background_tasks.add_task(execute_workflow, workflow, run.get("run_id"), event_data)
        triggered.append({"workflow_id": workflow.get("workflow_id"), "run_id": run.get("run_id")})
    
    return {"success": True, "triggered_workflows": len(triggered), "runs": triggered}
