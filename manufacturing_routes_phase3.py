"""
Manufacturing Lead Module - Phase 3 API Routes
Automation, Validation, Analytics endpoints
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import Phase 3 engines
from manufacturing_automation_engine import automation_engine
from manufacturing_validation_engine import validation_engine
from manufacturing_analytics import analytics_engine

router = APIRouter(prefix="/api/manufacturing", tags=["Manufacturing Phase 3"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(MONGO_URL)
db = client['innovate_books_db']


# ============================================================================
# VALIDATION ENDPOINTS
# ============================================================================

@router.post("/leads/{lead_id}/validate", response_model=dict)
async def validate_lead(lead_id: str, context: str = Query("create", description="Validation context")):
    """
    Validate lead against all validation rules
    
    Contexts: create, update, feasibility, costing, approval
    
    Returns:
        - is_valid: bool
        - errors: list
        - warnings: list
        - info: list
    """
    # Get lead data
    lead = await db['mfg_leads'].find_one({'lead_id': lead_id})
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Run validation
    validation_result = validation_engine.validate_lead(lead)
    
    return {
        "success": True,
        "lead_id": lead_id,
        "validation_context": context,
        "validation_result": validation_result,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/leads/{lead_id}/validation-history", response_model=dict)
async def get_validation_history(lead_id: str):
    """Get validation history for a lead"""
    validation_logs = await db['mfg_validation_logs'].find(
        {'lead_id': lead_id}
    ).sort('timestamp', -1).to_list(length=100)
    
    # Serialize
    for log in validation_logs:
        log['_id'] = str(log['_id'])
        if isinstance(log.get('timestamp'), datetime):
            log['timestamp'] = log['timestamp'].isoformat()
    
    return {
        "success": True,
        "lead_id": lead_id,
        "validation_logs": validation_logs,
        "total_validations": len(validation_logs)
    }


# ============================================================================
# AUTOMATION ENDPOINTS
# ============================================================================

@router.post("/leads/{lead_id}/trigger-automation", response_model=dict)
async def trigger_automation(lead_id: str, trigger: str = Query(..., description="Automation trigger")):
    """
    Manually trigger automation rules
    
    Triggers:
        - lead_created
        - stage_changed
        - bom_attached
        - costing_completed
        - sample_approved
        - lead_converted
        - task_check
        - info_check
        - production_feasibility_check
    """
    # Get lead data
    lead = await db['mfg_leads'].find_one({'lead_id': lead_id})
    
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Execute automation
    results = await automation_engine.execute_automation(trigger, lead)
    
    return {
        "success": True,
        "lead_id": lead_id,
        "trigger": trigger,
        "automation_results": results,
        "rules_executed": len(results),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/automation/logs", response_model=dict)
async def get_automation_logs(
    lead_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get automation logs"""
    query = {}
    if lead_id:
        query['lead_id'] = lead_id
    
    logs = await db['mfg_automation_logs'].find(query).sort(
        'timestamp', -1
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total_count = await db['mfg_automation_logs'].count_documents(query)
    
    # Serialize
    for log in logs:
        log['_id'] = str(log['_id'])
        if isinstance(log.get('timestamp'), datetime):
            log['timestamp'] = log['timestamp'].isoformat()
    
    return {
        "success": True,
        "logs": logs,
        "total_count": total_count,
        "skip": skip,
        "limit": limit
    }


# ============================================================================
# ANALYTICS ENDPOINTS
# ============================================================================

@router.get("/analytics/pipeline-summary", response_model=dict)
async def get_pipeline_summary(
    industry: Optional[str] = None,
    region: Optional[str] = None,
    plant_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """
    Get pipeline summary with stage-wise metrics
    
    Returns:
        - Total leads by stage
        - Lead value by stage
        - Conversion rates
        - Average deal size
    """
    filters = {}
    if industry:
        filters['industry'] = industry
    if region:
        filters['region'] = region
    if plant_id:
        filters['plant_id'] = plant_id
    if date_from:
        filters['date_from'] = date_from
    if date_to:
        filters['date_to'] = date_to
    
    summary = await analytics_engine.get_pipeline_summary(filters)
    
    return {
        "success": True,
        "summary": summary,
        "filters_applied": filters
    }


@router.get("/analytics/conversion-funnel", response_model=dict)
async def get_conversion_funnel(
    industry: Optional[str] = None,
    date_from: Optional[str] = None
):
    """
    Get conversion funnel metrics
    
    Returns:
        - Stage-wise conversion rates
        - Drop-off analysis
    """
    filters = {}
    if industry:
        filters['industry'] = industry
    if date_from:
        filters['date_from'] = date_from
    
    funnel = await analytics_engine.get_conversion_funnel(filters)
    
    return {
        "success": True,
        "funnel": funnel
    }


@router.get("/analytics/approval-bottlenecks", response_model=dict)
async def get_approval_bottlenecks(industry: Optional[str] = None):
    """
    Analyze approval bottlenecks
    
    Returns:
        - Average approval time by type
        - Pending approvals
        - Rejection rate
    """
    filters = {}
    if industry:
        filters['industry'] = industry
    
    analysis = await analytics_engine.get_approval_bottleneck_analysis(filters)
    
    return {
        "success": True,
        "approval_analysis": analysis
    }


@router.get("/analytics/time-to-conversion", response_model=dict)
async def get_time_to_conversion(
    industry: Optional[str] = None,
    date_from: Optional[str] = None
):
    """
    Calculate time to conversion metrics
    
    Returns:
        - Average time from Intake to Won
        - Fastest/Slowest deals
    """
    filters = {}
    if industry:
        filters['industry'] = industry
    if date_from:
        filters['date_from'] = date_from
    
    metrics = await analytics_engine.get_time_to_conversion_metrics(filters)
    
    return {
        "success": True,
        "conversion_metrics": metrics
    }


@router.get("/analytics/industry-performance", response_model=dict)
async def get_industry_performance():
    """
    Get performance metrics by industry
    
    Returns:
        - Lead count by industry
        - Conversion rate by industry
        - Average deal size by industry
    """
    performance = await analytics_engine.get_industry_performance()
    
    return {
        "success": True,
        "industry_performance": performance
    }


@router.get("/analytics/sales-rep-performance", response_model=dict)
async def get_sales_rep_performance():
    """
    Get performance metrics by sales rep
    
    Returns:
        - Lead count by rep
        - Conversion rate by rep
        - Total value by rep
    """
    performance = await analytics_engine.get_sales_rep_performance()
    
    return {
        "success": True,
        "sales_rep_performance": performance
    }


@router.get("/analytics/risk-analysis", response_model=dict)
async def get_risk_analysis():
    """
    Analyze leads by risk level
    
    Returns:
        - Count by risk level
        - High risk lead details
    """
    analysis = await analytics_engine.get_risk_analysis()
    
    return {
        "success": True,
        "risk_analysis": analysis
    }


@router.get("/analytics/plant-utilization", response_model=dict)
async def get_plant_utilization():
    """
    Get plant-wise lead distribution and value
    
    Returns:
        - Lead count by plant
        - Value by plant
    """
    utilization = await analytics_engine.get_plant_utilization()
    
    return {
        "success": True,
        "plant_utilization": utilization
    }


@router.get("/analytics/monthly-trend", response_model=dict)
async def get_monthly_trend(months: int = Query(6, description="Number of months")):
    """
    Get monthly trend of leads
    
    Returns:
        - Monthly lead count
        - Monthly conversion rate
        - Monthly value
    """
    trend = await analytics_engine.get_monthly_trend(months)
    
    return {
        "success": True,
        "monthly_trend": trend
    }


# ============================================================================
# EXCEPTION MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/exceptions", response_model=dict)
async def get_exceptions(
    lead_id: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get manufacturing exceptions"""
    query = {}
    if lead_id:
        query['lead_id'] = lead_id
    if status:
        query['status'] = status
    
    exceptions = await db['mfg_exceptions'].find(query).sort(
        'created_at', -1
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total_count = await db['mfg_exceptions'].count_documents(query)
    
    # Serialize
    for exc in exceptions:
        exc['_id'] = str(exc['_id'])
        if isinstance(exc.get('created_at'), datetime):
            exc['created_at'] = exc['created_at'].isoformat()
        if isinstance(exc.get('due_date'), datetime):
            exc['due_date'] = exc['due_date'].isoformat()
    
    return {
        "success": True,
        "exceptions": exceptions,
        "total_count": total_count,
        "skip": skip,
        "limit": limit
    }


@router.post("/exceptions/{exception_id}/resolve", response_model=dict)
async def resolve_exception(exception_id: str, resolution_notes: str):
    """Resolve an exception"""
    result = await db['mfg_exceptions'].update_one(
        {'exception_id': exception_id},
        {
            '$set': {
                'status': 'Resolved',
                'resolved_at': datetime.utcnow(),
                'resolution_notes': resolution_notes
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Exception not found")
    
    return {
        "success": True,
        "exception_id": exception_id,
        "status": "Resolved",
        "resolved_at": datetime.utcnow().isoformat()
    }


# ============================================================================
# DASHBOARD SUMMARY ENDPOINT
# ============================================================================

@router.get("/dashboard/summary", response_model=dict)
async def get_dashboard_summary():
    """
    Get comprehensive dashboard summary
    
    Returns aggregated data for dashboard widgets:
        - Pipeline summary
        - Recent activity
        - Pending approvals
        - High risk leads
        - Performance metrics
    """
    # Get pipeline summary
    pipeline_summary = await analytics_engine.get_pipeline_summary()
    
    # Get pending approvals count
    pending_approvals = await db['mfg_leads'].count_documents({
        'current_stage': 'Approval',
        'approval_status': 'Pending'
    })
    
    # Get high risk leads count
    high_risk_count = await db['mfg_leads'].count_documents({
        'risk_level': 'High',
        'current_stage': {'$in': ['Feasibility', 'Costing', 'Approval']}
    })
    
    # Get recent leads (last 24 hours)
    from datetime import timedelta
    recent_leads = await db['mfg_leads'].count_documents({
        'created_at': {'$gte': (datetime.utcnow() - timedelta(days=1)).isoformat()}
    })
    
    # Get overdue tasks
    overdue_tasks = await db['mfg_tasks'].count_documents({
        'status': 'Open',
        'due_date': {'$lt': datetime.utcnow().isoformat()}
    })
    
    # Get open exceptions
    open_exceptions = await db['mfg_exceptions'].count_documents({
        'status': 'Open'
    })
    
    return {
        "success": True,
        "dashboard": {
            "pipeline_summary": pipeline_summary,
            "pending_approvals": pending_approvals,
            "high_risk_leads": high_risk_count,
            "recent_leads_24h": recent_leads,
            "overdue_tasks": overdue_tasks,
            "open_exceptions": open_exceptions
        },
        "generated_at": datetime.utcnow().isoformat()
    }


# ============================================================================
# TASK MANAGEMENT ENDPOINTS
# ============================================================================

@router.get("/tasks", response_model=dict)
async def get_tasks(
    lead_id: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to_role: Optional[str] = None,
    skip: int = 0,
    limit: int = 50
):
    """Get manufacturing tasks"""
    query = {}
    if lead_id:
        query['lead_id'] = lead_id
    if status:
        query['status'] = status
    if assigned_to_role:
        query['assigned_to_role'] = assigned_to_role
    
    tasks = await db['mfg_tasks'].find(query).sort(
        'due_date', 1
    ).skip(skip).limit(limit).to_list(length=limit)
    
    total_count = await db['mfg_tasks'].count_documents(query)
    
    # Serialize
    for task in tasks:
        task['_id'] = str(task['_id'])
        if isinstance(task.get('created_at'), datetime):
            task['created_at'] = task['created_at'].isoformat()
    
    return {
        "success": True,
        "tasks": tasks,
        "total_count": total_count,
        "skip": skip,
        "limit": limit
    }


@router.patch("/tasks/{task_id}/complete", response_model=dict)
async def complete_task(task_id: str, completion_notes: Optional[str] = None):
    """Mark a task as complete"""
    result = await db['mfg_tasks'].update_one(
        {'id': task_id},
        {
            '$set': {
                'status': 'Completed',
                'completed_at': datetime.utcnow(),
                'completion_notes': completion_notes
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    return {
        "success": True,
        "task_id": task_id,
        "status": "Completed",
        "completed_at": datetime.utcnow().isoformat()
    }
