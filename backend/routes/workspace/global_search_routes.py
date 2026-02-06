"""
INNOVATE BOOKS - GLOBAL SEARCH API
Federated search across all modules
"""

from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import re

router = APIRouter(prefix="/api/search", tags=["search"])

def get_db():
    from server import db
    return db

async def get_current_user_simple(credentials = Depends(__import__('fastapi.security', fromlist=['HTTPBearer']).HTTPBearer())):
    """Simple auth check"""
    import jwt
    import os
    token = credentials.credentials
    JWT_SECRET = os.environ.get("JWT_SECRET_KEY")
    if not JWT_SECRET:
        raise RuntimeError("JWT_SECRET_KEY is missing in environment")

    payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    return {"user_id": payload.get("user_id") or payload.get("sub"), "org_id": payload.get("org_id", "default")}

@router.get("/global")
async def global_search(
    q: str = Query(..., min_length=2, description="Search query"),
    modules: Optional[str] = Query(None, description="Comma-separated modules to search"),
    limit: int = Query(10, le=50),
    current_user: dict = Depends(get_current_user_simple)
):
    """
    Global federated search across all modules
    Searches: Leads, Customers, Vendors, Invoices, Bills, Projects, People, Tasks, Contracts
    """
    db = get_db()
    results = []
    search_regex = {"$regex": q, "$options": "i"}
    
    # Define which modules to search
    all_modules = ["leads", "customers", "vendors", "invoices", "bills", "projects", "people", "tasks", "contracts", "signals"]
    search_modules = modules.split(",") if modules else all_modules
    
    # Search Leads
    if "leads" in search_modules:
        leads = await db.leads.find({
            "$or": [
                {"company": search_regex},
                {"first_name": search_regex},
                {"last_name": search_regex},
                {"email": search_regex},
                {"lead_id": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for lead in leads:
            results.append({
                "type": "lead",
                "module": "Commerce",
                "id": lead.get("lead_id"),
                "title": f"{lead.get('first_name', '')} {lead.get('last_name', '')}".strip() or lead.get("company", "Unknown"),
                "subtitle": lead.get("company", ""),
                "status": lead.get("lead_status", "New"),
                "path": f"/commerce/revenue/leads/{lead.get('lead_id')}",
                "icon": "user-plus",
                "data": lead
            })
    
    # Search Customers
    if "customers" in search_modules:
        customers = await db.customers.find({
            "$or": [
                {"name": search_regex},
                {"email": search_regex},
                {"customer_id": search_regex},
                {"gstin": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for cust in customers:
            results.append({
                "type": "customer",
                "module": "Commerce",
                "id": cust.get("customer_id"),
                "title": cust.get("name", "Unknown"),
                "subtitle": cust.get("email", ""),
                "status": cust.get("status", "active"),
                "path": f"/commerce/parties/customers/{cust.get('customer_id')}",
                "icon": "building",
                "data": cust
            })
    
    # Search Vendors
    if "vendors" in search_modules:
        vendors = await db.vendors.find({
            "$or": [
                {"name": search_regex},
                {"email": search_regex},
                {"vendor_id": search_regex},
                {"gstin": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for vendor in vendors:
            results.append({
                "type": "vendor",
                "module": "Commerce",
                "id": vendor.get("vendor_id"),
                "title": vendor.get("name", "Unknown"),
                "subtitle": vendor.get("email", ""),
                "status": vendor.get("status", "active"),
                "path": f"/commerce/parties/vendors/{vendor.get('vendor_id')}",
                "icon": "truck",
                "data": vendor
            })
    
    # Search Invoices
    if "invoices" in search_modules:
        invoices = await db.invoices.find({
            "$or": [
                {"invoice_id": search_regex},
                {"invoice_number": search_regex},
                {"customer_name": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for inv in invoices:
            results.append({
                "type": "invoice",
                "module": "Finance",
                "id": inv.get("invoice_id"),
                "title": inv.get("invoice_number") or inv.get("invoice_id"),
                "subtitle": f"{inv.get('customer_name', '')} - ₹{inv.get('total', 0):,.0f}",
                "status": inv.get("status", "draft"),
                "path": f"/invoices/{inv.get('invoice_id')}",
                "icon": "file-text",
                "data": inv
            })
    
    # Search Bills
    if "bills" in search_modules:
        bills = await db.bills.find({
            "$or": [
                {"bill_id": search_regex},
                {"bill_number": search_regex},
                {"vendor_name": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for bill in bills:
            results.append({
                "type": "bill",
                "module": "Finance",
                "id": bill.get("bill_id"),
                "title": bill.get("bill_number") or bill.get("bill_id"),
                "subtitle": f"{bill.get('vendor_name', '')} - ₹{bill.get('total', 0):,.0f}",
                "status": bill.get("status", "draft"),
                "path": f"/bills/{bill.get('bill_id')}",
                "icon": "receipt",
                "data": bill
            })
    
    # Search Projects
    if "projects" in search_modules:
        projects = await db.ops_projects.find({
            "$or": [
                {"project_id": search_regex},
                {"name": search_regex},
                {"description": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for proj in projects:
            results.append({
                "type": "project",
                "module": "Operations",
                "id": proj.get("project_id"),
                "title": proj.get("name", proj.get("project_id")),
                "subtitle": proj.get("customer_name", ""),
                "status": proj.get("status", "active"),
                "path": f"/operations/projects/{proj.get('project_id')}",
                "icon": "folder",
                "data": proj
            })
    
    # Search People
    if "people" in search_modules:
        people = await db.wf_people.find({
            "$or": [
                {"person_id": search_regex},
                {"full_name": search_regex},
                {"email": search_regex},
                {"department": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for person in people:
            results.append({
                "type": "person",
                "module": "Workforce",
                "id": person.get("person_id"),
                "title": person.get("full_name", "Unknown"),
                "subtitle": f"{person.get('department', '')} - {person.get('designation', '')}",
                "status": person.get("employment_status", "active"),
                "path": f"/ib-workforce/people/{person.get('person_id')}",
                "icon": "user",
                "data": person
            })
    
    # Search Tasks
    if "tasks" in search_modules:
        tasks = await db.workspace_tasks.find({
            "$or": [
                {"task_id": search_regex},
                {"title": search_regex},
                {"description": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for task in tasks:
            results.append({
                "type": "task",
                "module": "Workspace",
                "id": task.get("task_id"),
                "title": task.get("title", "Untitled Task"),
                "subtitle": task.get("description", "")[:50],
                "status": task.get("status", "open"),
                "path": f"/workspace/tasks",
                "icon": "check-square",
                "data": task
            })
    
    # Search Contracts
    if "contracts" in search_modules:
        contracts = await db.contracts.find({
            "$or": [
                {"contract_id": search_regex},
                {"customer_name": search_regex},
                {"title": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for contract in contracts:
            results.append({
                "type": "contract",
                "module": "Commerce",
                "id": contract.get("contract_id"),
                "title": contract.get("title") or contract.get("contract_id"),
                "subtitle": contract.get("customer_name", ""),
                "status": contract.get("status", "draft"),
                "path": f"/commerce/revenue/contracts/{contract.get('contract_id')}",
                "icon": "file-signature",
                "data": contract
            })
    
    # Search Intelligence Signals
    if "signals" in search_modules:
        signals = await db.intel_signals.find({
            "$or": [
                {"signal_id": search_regex},
                {"title": search_regex},
                {"description": search_regex}
            ]
        }, {"_id": 0}).limit(limit).to_list(limit)
        
        for signal in signals:
            results.append({
                "type": "signal",
                "module": "Intelligence",
                "id": signal.get("signal_id"),
                "title": signal.get("title", "Signal"),
                "subtitle": signal.get("source_solution", ""),
                "status": signal.get("severity", "info"),
                "path": f"/intelligence/signals",
                "icon": "zap",
                "data": signal
            })
    
    # Sort by relevance (exact matches first)
    def relevance_score(item):
        title = item.get("title", "").lower()
        query = q.lower()
        if title == query:
            return 0
        if title.startswith(query):
            return 1
        if query in title:
            return 2
        return 3
    
    results.sort(key=relevance_score)
    
    return {
        "query": q,
        "total": len(results),
        "results": results[:limit * 2],  # Return more results for variety
        "modules_searched": search_modules
    }

@router.get("/recent")
async def get_recent_searches(
    current_user: dict = Depends(get_current_user_simple)
):
    """Get user's recent search history"""
    db = get_db()
    user_id = current_user.get("user_id")
    
    recent = await db.search_history.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("searched_at", -1).limit(10).to_list(10)
    
    return {"recent": recent}

@router.post("/log")
async def log_search(
    query: str,
    result_type: Optional[str] = None,
    result_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user_simple)
):
    """Log a search for history"""
    db = get_db()
    
    await db.search_history.insert_one({
        "user_id": current_user.get("user_id"),
        "query": query,
        "result_type": result_type,
        "result_id": result_id,
        "searched_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True}

@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=1),
    current_user: dict = Depends(get_current_user_simple)
):
    """Get search suggestions based on partial query"""
    db = get_db()
    suggestions = []
    search_regex = {"$regex": f"^{re.escape(q)}", "$options": "i"}
    
    # Get suggestions from various collections
    leads = await db.leads.find({"company": search_regex}, {"_id": 0, "company": 1}).limit(3).to_list(3)
    suggestions.extend([{"text": l["company"], "type": "lead"} for l in leads if l.get("company")])
    
    customers = await db.customers.find({"name": search_regex}, {"_id": 0, "name": 1}).limit(3).to_list(3)
    suggestions.extend([{"text": c["name"], "type": "customer"} for c in customers if c.get("name")])
    
    projects = await db.ops_projects.find({"name": search_regex}, {"_id": 0, "name": 1}).limit(3).to_list(3)
    suggestions.extend([{"text": p["name"], "type": "project"} for p in projects if p.get("name")])
    
    people = await db.wf_people.find({"full_name": search_regex}, {"_id": 0, "full_name": 1}).limit(3).to_list(3)
    suggestions.extend([{"text": p["full_name"], "type": "person"} for p in people if p.get("full_name")])
    
    # Remove duplicates
    seen = set()
    unique_suggestions = []
    for s in suggestions:
        if s["text"] not in seen:
            seen.add(s["text"])
            unique_suggestions.append(s)
    
    return {"suggestions": unique_suggestions[:8]}
