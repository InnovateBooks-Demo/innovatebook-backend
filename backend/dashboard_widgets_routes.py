"""
INNOVATE BOOKS - DASHBOARD WIDGETS API
Customizable dashboard with drag-drop widgets
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
import uuid

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

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
    return {"user_id": payload.get("user_id") or payload.get("sub"), 
            "org_id": payload.get("org_id", "default")}

class WidgetConfig(BaseModel):
    widget_id: str
    widget_type: str
    title: str
    position: dict  # {x, y, w, h}
    config: dict = {}
    visible: bool = True

class DashboardLayout(BaseModel):
    widgets: List[WidgetConfig]

# Available widget types
WIDGET_TYPES = {
    "kpi_card": {"name": "KPI Card", "description": "Single metric display", "default_size": {"w": 1, "h": 1}},
    "chart_line": {"name": "Line Chart", "description": "Trend over time", "default_size": {"w": 2, "h": 2}},
    "chart_bar": {"name": "Bar Chart", "description": "Comparison chart", "default_size": {"w": 2, "h": 2}},
    "chart_pie": {"name": "Pie Chart", "description": "Distribution chart", "default_size": {"w": 2, "h": 2}},
    "recent_activity": {"name": "Recent Activity", "description": "Activity feed", "default_size": {"w": 2, "h": 2}},
    "tasks_list": {"name": "My Tasks", "description": "Pending tasks", "default_size": {"w": 2, "h": 2}},
    "approvals_list": {"name": "Pending Approvals", "description": "Approvals waiting", "default_size": {"w": 2, "h": 2}},
    "signals_list": {"name": "Intelligence Signals", "description": "Active alerts", "default_size": {"w": 2, "h": 2}},
    "pipeline_funnel": {"name": "Sales Pipeline", "description": "Lead funnel", "default_size": {"w": 2, "h": 2}},
    "revenue_summary": {"name": "Revenue Summary", "description": "Revenue metrics", "default_size": {"w": 2, "h": 1}},
    "calendar_mini": {"name": "Calendar", "description": "Upcoming events", "default_size": {"w": 2, "h": 2}},
    "quick_actions": {"name": "Quick Actions", "description": "Common actions", "default_size": {"w": 1, "h": 1}},
}

@router.get("/widgets/available")
async def get_available_widgets():
    """Get list of available widget types"""
    return {"widgets": WIDGET_TYPES}

@router.get("/layout")
async def get_dashboard_layout(current_user: dict = Depends(get_current_user_simple)):
    """Get user's dashboard layout"""
    db = get_db()
    
    layout = await db.dashboard_layouts.find_one(
        {"user_id": current_user.get("user_id")},
        {"_id": 0}
    )
    
    if not layout:
        # Return default layout
        layout = {
            "user_id": current_user.get("user_id"),
            "widgets": [
                {"widget_id": "w1", "widget_type": "kpi_card", "title": "Total Revenue", "position": {"x": 0, "y": 0, "w": 1, "h": 1}, "config": {"metric": "revenue"}, "visible": True},
                {"widget_id": "w2", "widget_type": "kpi_card", "title": "Active Leads", "position": {"x": 1, "y": 0, "w": 1, "h": 1}, "config": {"metric": "leads"}, "visible": True},
                {"widget_id": "w3", "widget_type": "kpi_card", "title": "Pending Tasks", "position": {"x": 2, "y": 0, "w": 1, "h": 1}, "config": {"metric": "tasks"}, "visible": True},
                {"widget_id": "w4", "widget_type": "kpi_card", "title": "Open Signals", "position": {"x": 3, "y": 0, "w": 1, "h": 1}, "config": {"metric": "signals"}, "visible": True},
                {"widget_id": "w5", "widget_type": "recent_activity", "title": "Recent Activity", "position": {"x": 0, "y": 1, "w": 2, "h": 2}, "config": {}, "visible": True},
                {"widget_id": "w6", "widget_type": "tasks_list", "title": "My Tasks", "position": {"x": 2, "y": 1, "w": 2, "h": 2}, "config": {}, "visible": True},
                {"widget_id": "w7", "widget_type": "pipeline_funnel", "title": "Sales Pipeline", "position": {"x": 0, "y": 3, "w": 2, "h": 2}, "config": {}, "visible": True},
                {"widget_id": "w8", "widget_type": "signals_list", "title": "Intelligence Alerts", "position": {"x": 2, "y": 3, "w": 2, "h": 2}, "config": {}, "visible": True},
            ]
        }
    
    return layout

@router.put("/layout")
async def save_dashboard_layout(
    layout: DashboardLayout,
    current_user: dict = Depends(get_current_user_simple)
):
    """Save user's dashboard layout"""
    db = get_db()
    
    layout_doc = {
        "user_id": current_user.get("user_id"),
        "widgets": [w.dict() for w in layout.widgets],
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.dashboard_layouts.update_one(
        {"user_id": current_user.get("user_id")},
        {"$set": layout_doc},
        upsert=True
    )
    
    return {"success": True}

@router.get("/widget/{widget_type}/data")
async def get_widget_data(
    widget_type: str,
    config: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """Get data for a specific widget"""
    db = get_db()
    
    if widget_type == "kpi_card":
        # Return KPI metrics
        metric = config or "revenue"
        
        if metric == "revenue":
            invoices = await db.invoices.find({"status": "paid"}, {"_id": 0, "total": 1}).to_list(1000)
            value = sum(inv.get("total", 0) for inv in invoices)
            return {"value": value, "label": "Total Revenue", "format": "currency", "trend": 12.5}
        
        elif metric == "leads":
            count = await db.leads.count_documents({"lead_status": {"$in": ["New", "Contacted", "Qualified"]}})
            return {"value": count, "label": "Active Leads", "format": "number", "trend": 8}
        
        elif metric == "tasks":
            count = await db.workspace_tasks.count_documents({"status": "open"})
            return {"value": count, "label": "Pending Tasks", "format": "number", "trend": -5}
        
        elif metric == "signals":
            count = await db.intel_signals.count_documents({"acknowledged": False})
            return {"value": count, "label": "Open Signals", "format": "number", "trend": 0}
        
        elif metric == "projects":
            count = await db.ops_projects.count_documents({"status": "in_progress"})
            return {"value": count, "label": "Active Projects", "format": "number", "trend": 3}
        
        elif metric == "employees":
            count = await db.wf_people.count_documents({"employment_status": "active"})
            return {"value": count, "label": "Active Employees", "format": "number", "trend": 2}
    
    elif widget_type == "recent_activity":
        activities = await db.activity_feed.find(
            {}, {"_id": 0}
        ).sort("timestamp", -1).limit(10).to_list(10)
        return {"activities": activities}
    
    elif widget_type == "tasks_list":
        tasks = await db.workspace_tasks.find(
            {"status": "open"},
            {"_id": 0}
        ).sort("due_date", 1).limit(10).to_list(10)
        return {"tasks": tasks}
    
    elif widget_type == "approvals_list":
        approvals = await db.workspace_approvals.find(
            {"status": "pending"},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        return {"approvals": approvals}
    
    elif widget_type == "signals_list":
        signals = await db.intel_signals.find(
            {"acknowledged": False},
            {"_id": 0}
        ).sort("detected_at", -1).limit(10).to_list(10)
        return {"signals": signals}
    
    elif widget_type == "pipeline_funnel":
        pipeline = [
            {"$group": {"_id": "$lead_status", "count": {"$sum": 1}, "value": {"$sum": "$annual_revenue"}}},
            {"$sort": {"count": -1}}
        ]
        stages = await db.leads.aggregate(pipeline).to_list(20)
        return {"stages": [{"stage": s["_id"], "count": s["count"], "value": s.get("value", 0)} for s in stages]}
    
    elif widget_type == "revenue_summary":
        # Get revenue by month
        invoices = await db.invoices.find(
            {"status": "paid"},
            {"_id": 0, "total": 1, "created_at": 1, "invoice_date": 1}
        ).to_list(1000)
        
        total = sum(inv.get("total", 0) for inv in invoices)
        count = len(invoices)
        
        return {
            "total_revenue": total,
            "invoice_count": count,
            "average": total / count if count > 0 else 0
        }
    
    elif widget_type == "calendar_mini":
        # Get upcoming events/tasks
        now = datetime.now(timezone.utc).isoformat()
        tasks = await db.workspace_tasks.find(
            {"due_date": {"$gte": now}, "status": "open"},
            {"_id": 0, "task_id": 1, "title": 1, "due_date": 1}
        ).sort("due_date", 1).limit(5).to_list(5)
        
        return {"events": [{"id": t["task_id"], "title": t["title"], "date": t.get("due_date")} for t in tasks]}
    
    elif widget_type == "quick_actions":
        return {
            "actions": [
                {"id": "create_lead", "label": "New Lead", "path": "/commerce/revenue/leads/create", "icon": "user-plus"},
                {"id": "create_invoice", "label": "New Invoice", "path": "/invoices/create", "icon": "file-plus"},
                {"id": "create_task", "label": "New Task", "path": "/workspace/tasks", "icon": "check-square"},
                {"id": "view_reports", "label": "Reports", "path": "/reports", "icon": "bar-chart"}
            ]
        }
    
    return {"error": "Unknown widget type"}

@router.post("/widget/add")
async def add_widget(
    widget_type: str,
    title: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """Add a new widget to dashboard"""
    db = get_db()
    
    if widget_type not in WIDGET_TYPES:
        raise HTTPException(status_code=400, detail="Invalid widget type")
    
    widget_info = WIDGET_TYPES[widget_type]
    
    new_widget = {
        "widget_id": f"w-{uuid.uuid4().hex[:8]}",
        "widget_type": widget_type,
        "title": title or widget_info["name"],
        "position": {"x": 0, "y": 0, **widget_info["default_size"]},
        "config": {},
        "visible": True
    }
    
    await db.dashboard_layouts.update_one(
        {"user_id": current_user.get("user_id")},
        {"$push": {"widgets": new_widget}},
        upsert=True
    )
    
    return {"success": True, "widget": new_widget}

@router.delete("/widget/{widget_id}")
async def remove_widget(
    widget_id: str,
    current_user: dict = Depends(get_current_user_simple)
):
    """Remove a widget from dashboard"""
    db = get_db()
    
    await db.dashboard_layouts.update_one(
        {"user_id": current_user.get("user_id")},
        {"$pull": {"widgets": {"widget_id": widget_id}}}
    )
    
    return {"success": True}
