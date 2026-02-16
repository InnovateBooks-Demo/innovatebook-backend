"""
INNOVATE BOOKS - REPORTS BUILDER API
Custom report generation with drag-drop fields
"""

from fastapi import APIRouter, Depends, Query, HTTPException, BackgroundTasks
from typing import Optional, List, Any
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid
import json

router = APIRouter(prefix="/api/reports-builder", tags=["reports-builder"])

def get_db():
    from server import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default"), "full_name": payload.get("full_name", "User"), "email": payload.get("email")}

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

# Available data sources and their fields
DATA_SOURCES = {
    "leads": {
        "name": "Leads",
        "collection": "leads",
        "fields": [
            {"name": "lead_id", "label": "Lead ID", "type": "string"},
            {"name": "first_name", "label": "First Name", "type": "string"},
            {"name": "last_name", "label": "Last Name", "type": "string"},
            {"name": "email", "label": "Email", "type": "string"},
            {"name": "company", "label": "Company", "type": "string"},
            {"name": "lead_status", "label": "Status", "type": "string"},
            {"name": "lead_source", "label": "Source", "type": "string"},
            {"name": "annual_revenue", "label": "Annual Revenue", "type": "number"},
            {"name": "lead_owner", "label": "Owner", "type": "string"},
            {"name": "created_at", "label": "Created Date", "type": "date"}
        ]
    },
    "customers": {
        "name": "Customers",
        "collection": "customers",
        "fields": [
            {"name": "customer_id", "label": "Customer ID", "type": "string"},
            {"name": "name", "label": "Name", "type": "string"},
            {"name": "email", "label": "Email", "type": "string"},
            {"name": "phone", "label": "Phone", "type": "string"},
            {"name": "status", "label": "Status", "type": "string"},
            {"name": "created_at", "label": "Created Date", "type": "date"}
        ]
    },
    "invoices": {
        "name": "Invoices",
        "collection": "invoices",
        "fields": [
            {"name": "invoice_id", "label": "Invoice ID", "type": "string"},
            {"name": "invoice_number", "label": "Invoice Number", "type": "string"},
            {"name": "customer_name", "label": "Customer", "type": "string"},
            {"name": "total", "label": "Total Amount", "type": "number"},
            {"name": "status", "label": "Status", "type": "string"},
            {"name": "invoice_date", "label": "Invoice Date", "type": "date"},
            {"name": "due_date", "label": "Due Date", "type": "date"}
        ]
    },
    "bills": {
        "name": "Bills",
        "collection": "bills",
        "fields": [
            {"name": "bill_id", "label": "Bill ID", "type": "string"},
            {"name": "bill_number", "label": "Bill Number", "type": "string"},
            {"name": "vendor_name", "label": "Vendor", "type": "string"},
            {"name": "total", "label": "Total Amount", "type": "number"},
            {"name": "status", "label": "Status", "type": "string"},
            {"name": "bill_date", "label": "Bill Date", "type": "date"},
            {"name": "due_date", "label": "Due Date", "type": "date"}
        ]
    },
    "projects": {
        "name": "Projects",
        "collection": "ops_projects",
        "fields": [
            {"name": "project_id", "label": "Project ID", "type": "string"},
            {"name": "name", "label": "Project Name", "type": "string"},
            {"name": "customer_name", "label": "Customer", "type": "string"},
            {"name": "status", "label": "Status", "type": "string"},
            {"name": "budget", "label": "Budget", "type": "number"},
            {"name": "start_date", "label": "Start Date", "type": "date"},
            {"name": "end_date", "label": "End Date", "type": "date"}
        ]
    },
    "tasks": {
        "name": "Tasks",
        "collection": "workspace_tasks",
        "fields": [
            {"name": "task_id", "label": "Task ID", "type": "string"},
            {"name": "title", "label": "Title", "type": "string"},
            {"name": "status", "label": "Status", "type": "string"},
            {"name": "priority", "label": "Priority", "type": "string"},
            {"name": "assigned_to", "label": "Assigned To", "type": "string"},
            {"name": "due_date", "label": "Due Date", "type": "date"}
        ]
    },
    "people": {
        "name": "People",
        "collection": "wf_people",
        "fields": [
            {"name": "person_id", "label": "Person ID", "type": "string"},
            {"name": "full_name", "label": "Name", "type": "string"},
            {"name": "email", "label": "Email", "type": "string"},
            {"name": "department", "label": "Department", "type": "string"},
            {"name": "designation", "label": "Designation", "type": "string"},
            {"name": "employment_status", "label": "Status", "type": "string"},
            {"name": "hire_date", "label": "Hire Date", "type": "date"}
        ]
    }
}

class ReportConfig(BaseModel):
    name: str
    description: Optional[str] = None
    data_source: str
    columns: List[str]
    filters: Optional[List[dict]] = []
    sort_by: Optional[str] = None
    sort_order: str = "asc"
    group_by: Optional[str] = None
    aggregations: Optional[List[dict]] = []
    chart_type: Optional[str] = None  # bar, line, pie, table
    is_public: bool = False
    schedule: Optional[dict] = None  # {"frequency": "daily", "time": "09:00", "recipients": []}

@router.get("/data-sources")
async def get_data_sources():
    """Get available data sources and their fields"""
    return {"data_sources": DATA_SOURCES}

@router.post("/")
async def create_report(
    report: ReportConfig,
    current_user: dict = Depends(get_current_user_simple)
):
    """Create a new custom report"""
    db = get_db()
    
    if report.data_source not in DATA_SOURCES:
        raise HTTPException(status_code=400, detail=f"Invalid data source: {report.data_source}")
    
    report_doc = {
        "report_id": generate_id("RPT"),
        "org_id": current_user.get("org_id"),
        **report.dict(),
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "created_by_name": current_user.get("full_name"),
        "last_run_at": None,
        "run_count": 0
    }
    
    await db.custom_reports.insert_one(report_doc)
    report_doc.pop("_id", None)
    
    return {"success": True, "report": report_doc}

@router.get("/")
async def list_reports(
    current_user: dict = Depends(get_current_user_simple)
):
    """List all custom reports"""
    db = get_db()
    
    reports = await db.custom_reports.find(
        {"$or": [{"org_id": current_user.get("org_id")}, {"is_public": True}]},
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    return {"reports": reports, "total": len(reports)}

@router.get("/{report_id}")
async def get_report(
    report_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get report configuration"""
    db = get_db()
    
    report = await db.custom_reports.find_one({"report_id": report_id}, {"_id": 0})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return report

@router.put("/{report_id}")
async def update_report(
    report_id: str,
    report: ReportConfig,
    current_user: dict = Depends(get_current_user_simple)
):
    """Update a report configuration"""
    db = get_db()
    
    result = await db.custom_reports.update_one(
        {"report_id": report_id},
        {"$set": {**report.dict(), "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"success": True}

@router.delete("/{report_id}")
async def delete_report(
    report_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Delete a report"""
    db = get_db()
    
    result = await db.custom_reports.delete_one({"report_id": report_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"success": True}

@router.post("/{report_id}/run")
async def run_report(
    report_id: str,
    limit: int = Query(1000, le=10000),
    current_user: dict = Depends(get_current_user_simple)
):
    """Execute a report and return results"""
    db = get_db()
    
    report = await db.custom_reports.find_one({"report_id": report_id})
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    data_source = DATA_SOURCES.get(report["data_source"])
    if not data_source:
        raise HTTPException(status_code=400, detail="Invalid data source")
    
    collection = db[data_source["collection"]]
    
    # Build query from filters
    query = {}
    for filter_item in report.get("filters", []):
        field = filter_item.get("field")
        operator = filter_item.get("operator", "eq")
        value = filter_item.get("value")
        
        if operator == "eq":
            query[field] = value
        elif operator == "ne":
            query[field] = {"$ne": value}
        elif operator == "gt":
            query[field] = {"$gt": value}
        elif operator == "gte":
            query[field] = {"$gte": value}
        elif operator == "lt":
            query[field] = {"$lt": value}
        elif operator == "lte":
            query[field] = {"$lte": value}
        elif operator == "contains":
            query[field] = {"$regex": value, "$options": "i"}
        elif operator == "in":
            query[field] = {"$in": value if isinstance(value, list) else [value]}
    
    # Build projection
    projection = {"_id": 0}
    for col in report.get("columns", []):
        projection[col] = 1
    
    # Build sort
    sort_field = report.get("sort_by")
    sort_order = 1 if report.get("sort_order") == "asc" else -1
    
    # Execute query
    cursor = collection.find(query, projection)
    if sort_field:
        cursor = cursor.sort(sort_field, sort_order)
    cursor = cursor.limit(limit)
    
    results = await cursor.to_list(limit)
    
    # Handle grouping if specified
    grouped_results = None
    if report.get("group_by"):
        grouped_results = {}
        for row in results:
            key = row.get(report["group_by"], "Other")
            if key not in grouped_results:
                grouped_results[key] = []
            grouped_results[key].append(row)
    
    # Calculate aggregations if specified
    aggregations_results = {}
    for agg in report.get("aggregations", []):
        field = agg.get("field")
        func = agg.get("function", "count")
        
        if func == "count":
            aggregations_results[f"{field}_count"] = len(results)
        elif func == "sum":
            aggregations_results[f"{field}_sum"] = sum(r.get(field, 0) or 0 for r in results)
        elif func == "avg":
            values = [r.get(field, 0) or 0 for r in results]
            aggregations_results[f"{field}_avg"] = sum(values) / len(values) if values else 0
        elif func == "min":
            values = [r.get(field, 0) or 0 for r in results]
            aggregations_results[f"{field}_min"] = min(values) if values else 0
        elif func == "max":
            values = [r.get(field, 0) or 0 for r in results]
            aggregations_results[f"{field}_max"] = max(values) if values else 0
    
    # Update run statistics
    await db.custom_reports.update_one(
        {"report_id": report_id},
        {
            "$set": {"last_run_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"run_count": 1}
        }
    )
    
    return {
        "report_id": report_id,
        "report_name": report.get("name"),
        "data": results,
        "grouped_data": grouped_results,
        "aggregations": aggregations_results,
        "total_rows": len(results),
        "columns": report.get("columns"),
        "executed_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/{report_id}/export")
async def export_report(
    report_id: str,
    format: str = Query("json", enum=["json", "csv"]),
    current_user: dict = Depends(get_current_user_simple)
):
    """Export report results"""
    # Run the report first
    result = await run_report(report_id, 10000, current_user)
    
    if format == "csv":
        import io
        import csv
        
        output = io.StringIO()
        if result["data"]:
            writer = csv.DictWriter(output, fieldnames=result["columns"])
            writer.writeheader()
            writer.writerows(result["data"])
        
        return {
            "format": "csv",
            "data": output.getvalue(),
            "filename": f"{result['report_name']}_{datetime.now().strftime('%Y%m%d')}.csv"
        }
    
    return {
        "format": "json",
        "data": result["data"],
        "filename": f"{result['report_name']}_{datetime.now().strftime('%Y%m%d')}.json"
    }

@router.post("/{report_id}/schedule")
async def schedule_report(
    report_id: str,
    frequency: str = Query(..., enum=["daily", "weekly", "monthly"]),
    time: str = Query("09:00"),
    recipients: List[str] = [],
    current_user: dict = Depends(get_current_user_simple)
):
    """Schedule a report to run automatically"""
    db = get_db()
    
    schedule = {
        "frequency": frequency,
        "time": time,
        "recipients": recipients,
        "enabled": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    result = await db.custom_reports.update_one(
        {"report_id": report_id},
        {"$set": {"schedule": schedule}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return {"success": True, "schedule": schedule}

@router.get("/templates/list")
async def list_report_templates():
    """Get pre-built report templates"""
    templates = [
        {
            "template_id": "tpl_sales_pipeline",
            "name": "Sales Pipeline Report",
            "description": "Overview of leads by status and source",
            "data_source": "leads",
            "columns": ["company", "lead_status", "lead_source", "annual_revenue", "lead_owner"],
            "group_by": "lead_status",
            "aggregations": [{"field": "annual_revenue", "function": "sum"}]
        },
        {
            "template_id": "tpl_ar_aging",
            "name": "Accounts Receivable Aging",
            "description": "Outstanding invoices by age",
            "data_source": "invoices",
            "columns": ["invoice_number", "customer_name", "total", "due_date", "status"],
            "filters": [{"field": "status", "operator": "in", "value": ["sent", "overdue"]}],
            "sort_by": "due_date",
            "aggregations": [{"field": "total", "function": "sum"}]
        },
        {
            "template_id": "tpl_project_status",
            "name": "Project Status Report",
            "description": "All projects with their current status",
            "data_source": "projects",
            "columns": ["name", "customer_name", "status", "budget", "start_date", "end_date"],
            "group_by": "status",
            "aggregations": [{"field": "budget", "function": "sum"}]
        },
        {
            "template_id": "tpl_team_tasks",
            "name": "Team Tasks Report",
            "description": "Tasks by assignee and status",
            "data_source": "tasks",
            "columns": ["title", "assigned_to", "status", "priority", "due_date"],
            "group_by": "assigned_to",
            "sort_by": "due_date"
        },
        {
            "template_id": "tpl_employee_directory",
            "name": "Employee Directory",
            "description": "All employees by department",
            "data_source": "people",
            "columns": ["full_name", "email", "department", "designation", "employment_status"],
            "group_by": "department"
        }
    ]
    
    return {"templates": templates}
