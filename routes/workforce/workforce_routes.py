"""
Workforce Module API Routes - ENTERPRISE EDITION
Handles all HR and workforce-related endpoints with multi-tenant support
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from typing import Optional, List
import os
from uuid import uuid4

# Import enterprise middleware
from enterprise_middleware import (
    subscription_guard,
    require_active_subscription,
    require_permission,
    get_org_scope
)

router = APIRouter(prefix="/api/workforce", tags=["Workforce"])

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ['DB_NAME']
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ========================
# EMPLOYEES
# ========================

@router.get("/employees", dependencies=[Depends(require_permission("employees", "view"))])
async def get_employees(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all employees (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        employees = await db.employees.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "employees": employees}
    except Exception as e:
        return {"success": False, "employees": [], "error": str(e)}

@router.get("/employees/{employee_id}", dependencies=[Depends(require_permission("employees", "view"))])
async def get_employee(employee_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Get employee by ID (org-scoped)"""
    try:
        query = {"id": employee_id}
        if org_id:
            query["org_id"] = org_id
        employee = await db.employees.find_one(query, {"_id": 0})
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "employee": employee}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/employees", dependencies=[Depends(require_active_subscription), Depends(require_permission("employees", "create"))])
async def create_employee(employee_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Create new employee (org-scoped, requires active subscription)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        employee_data["id"] = str(uuid4())
        employee_data["employee_code"] = f"EMP-{str(await db.employees.count_documents(query) + 1001)}"
        employee_data["created_at"] = datetime.utcnow()
        if org_id:
            employee_data["org_id"] = org_id
        await db.employees.insert_one(employee_data)
        return {"success": True, "employee": employee_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/employees/{employee_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("employees", "edit"))])
async def update_employee(employee_id: str, employee_data: dict, org_id: Optional[str] = Depends(get_org_scope)):
    """Update employee (org-scoped, requires active subscription)"""
    try:
        query = {"id": employee_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.employees.update_one(query, {"$set": employee_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "message": "Employee updated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/employees/{employee_id}", dependencies=[Depends(require_active_subscription), Depends(require_permission("employees", "delete"))])
async def delete_employee(employee_id: str, org_id: Optional[str] = Depends(get_org_scope)):
    """Delete employee (org-scoped, requires active subscription)"""
    try:
        query = {"id": employee_id}
        if org_id:
            query["org_id"] = org_id
        result = await db.employees.delete_one(query)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"success": True, "message": "Employee deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ========================
# PAYROLL
# ========================

@router.get("/payroll", dependencies=[Depends(subscription_guard)])
async def get_payroll(org_id: Optional[str] = Depends(get_org_scope)):
    """Get all payroll records (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        payroll = await db.payroll.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "payroll": payroll}
    except Exception as e:
        return {"success": False, "payroll": [], "error": str(e)}

# ========================
# ATTENDANCE
# ========================

@router.get("/attendance", dependencies=[Depends(subscription_guard)])
async def get_attendance(org_id: Optional[str] = Depends(get_org_scope)):
    """Get attendance records (org-scoped)"""
    try:
        query = {"org_id": org_id} if org_id else {}
        attendance = await db.attendance.find(query, {"_id": 0}).to_list(1000)
        return {"success": True, "attendance": attendance}
    except Exception as e:
        return {"success": False, "attendance": [], "error": str(e)}
