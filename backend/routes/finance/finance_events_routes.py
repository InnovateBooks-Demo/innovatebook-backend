"""
Finance Real-Time Notifications & Events
WebSocket events for period close alerts and finance notifications
"""

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Header, HTTPException
from typing import Dict, List, Set
import json
import asyncio
from datetime import datetime, timezone
import jwt
import os

router = APIRouter(prefix="/api/finance-events", tags=["Finance Events"])

JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env

# Store active WebSocket connections per organization
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # org_id -> [websockets]
    
    async def connect(self, websocket: WebSocket, org_id: str):
        await websocket.accept()
        if org_id not in self.active_connections:
            self.active_connections[org_id] = []
        self.active_connections[org_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, org_id: str):
        if org_id in self.active_connections:
            if websocket in self.active_connections[org_id]:
                self.active_connections[org_id].remove(websocket)
    
    async def broadcast_to_org(self, org_id: str, message: dict):
        if org_id in self.active_connections:
            for connection in self.active_connections[org_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
    
    async def broadcast_all(self, message: dict):
        for org_id in self.active_connections:
            await self.broadcast_to_org(org_id, message)

manager = ConnectionManager()


def get_db():
    from app_state import db
    return db


async def get_ws_user(token: str):
    """Validate WebSocket token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "user_id": payload.get("user_id"),
            "org_id": payload.get("org_id"),
            "role_id": payload.get("role_id")
        }
    except:
        return None


@router.websocket("/ws/{token}")
async def finance_websocket(websocket: WebSocket, token: str):
    """WebSocket endpoint for real-time finance notifications"""
    user = await get_ws_user(token)
    if not user:
        await websocket.close(code=4001)
        return
    
    org_id = user.get("org_id")
    await manager.connect(websocket, org_id)
    
    try:
        from websockets.exceptions import ConnectionClosedError
    except ImportError:
        class ConnectionClosedError(Exception): pass

    try:
        # Send initial connection message
        await websocket.send_json({
            "type": "connected",
            "message": "Connected to finance events",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        while True:
            # Keep connection alive and listen for messages
            data = await websocket.receive_text()
            
            # Handle ping/pong
            if data == "ping":
                await websocket.send_text("pong")
            
    except (WebSocketDisconnect, ConnectionClosedError):
        manager.disconnect(websocket, org_id)
    except Exception as e:
        # Log other errors but don't crash server console
        # logger.error(f"WebSocket error: {e}") 
        manager.disconnect(websocket, org_id)
    finally:
        pass # manager.disconnect handles cleaning up references


# ==================== EVENT TRIGGERS ====================

async def trigger_period_close_alert(org_id: str, period: str, checklist_status: dict):
    """Trigger period close alert to all connected users"""
    await manager.broadcast_to_org(org_id, {
        "type": "period_close_alert",
        "period": period,
        "checklist": checklist_status,
        "message": f"Period {period} close in progress",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def trigger_overdue_receivable_alert(org_id: str, receivable_id: str, customer_name: str, amount: float, days_overdue: int):
    """Trigger overdue receivable alert"""
    await manager.broadcast_to_org(org_id, {
        "type": "overdue_receivable",
        "receivable_id": receivable_id,
        "customer_name": customer_name,
        "amount": amount,
        "days_overdue": days_overdue,
        "severity": "critical" if days_overdue > 90 else "warning",
        "message": f"Receivable from {customer_name} overdue by {days_overdue} days",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def trigger_payment_due_alert(org_id: str, payable_id: str, vendor_name: str, amount: float, days_to_due: int):
    """Trigger payment due alert"""
    await manager.broadcast_to_org(org_id, {
        "type": "payment_due",
        "payable_id": payable_id,
        "vendor_name": vendor_name,
        "amount": amount,
        "days_to_due": days_to_due,
        "severity": "warning" if days_to_due <= 3 else "info",
        "message": f"Payment to {vendor_name} due in {days_to_due} days",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def trigger_billing_approved(org_id: str, billing_id: str, amount: float, party_name: str):
    """Trigger billing approved notification"""
    await manager.broadcast_to_org(org_id, {
        "type": "billing_approved",
        "billing_id": billing_id,
        "amount": amount,
        "party_name": party_name,
        "message": f"Billing {billing_id} for {party_name} approved",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


async def trigger_period_closed(org_id: str, period: str):
    """Trigger period closed notification"""
    await manager.broadcast_to_org(org_id, {
        "type": "period_closed",
        "period": period,
        "message": f"Period {period} has been closed successfully",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })


# ==================== REST ENDPOINTS ====================

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
    except:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/notifications")
async def get_finance_notifications(current_user: dict = Depends(get_current_user)):
    """Get finance notifications for current user"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    # Check for overdue receivables
    from datetime import timedelta
    today = datetime.now(timezone.utc)
    
    overdue_rcv = await db.fin_receivables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "overdue"]},
        "due_date": {"$lt": today.isoformat()}
    }, {"_id": 0}).to_list(length=10)
    
    # Check for upcoming payables (due in 7 days)
    week_later = (today + timedelta(days=7)).isoformat()
    upcoming_pay = await db.fin_payables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "approved"]},
        "due_date": {"$lte": week_later, "$gte": today.isoformat()}
    }, {"_id": 0}).to_list(length=10)
    
    # Check for pending billing approvals
    pending_billing = await db.fin_billing_records.find({
        "org_id": org_id,
        "status": "draft"
    }, {"_id": 0}).to_list(length=10)
    
    # Check for open periods that need closing
    open_periods = await db.fin_accounting_periods.find({
        "org_id": org_id,
        "status": "open"
    }, {"_id": 0}).to_list(length=5)
    
    notifications = []
    
    def parse_date(date_str, default):
        """Safely parse date string to timezone-aware datetime"""
        if not date_str:
            return default
        try:
            dt = datetime.fromisoformat(date_str.replace("Z", "+00:00"))
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt
        except:
            return default
    
    for rcv in overdue_rcv:
        due_date = parse_date(rcv.get("due_date"), today)
        days_overdue = (today - due_date).days
        notifications.append({
            "type": "overdue_receivable",
            "severity": "critical" if days_overdue > 90 else "warning",
            "title": f"Overdue: {rcv.get('customer_name')}",
            "message": f"₹{rcv.get('outstanding_amount', 0):,.0f} overdue by {days_overdue} days",
            "action_url": f"/ib-finance/receivables/{rcv.get('receivable_id')}",
            "created_at": today.isoformat()
        })
    
    for pay in upcoming_pay:
        due_date = parse_date(pay.get("due_date"), today)
        days_to_due = (due_date - today).days
        notifications.append({
            "type": "payment_due",
            "severity": "warning" if days_to_due <= 3 else "info",
            "title": f"Payment Due: {pay.get('vendor_name')}",
            "message": f"₹{pay.get('outstanding_amount', 0):,.0f} due in {days_to_due} days",
            "action_url": f"/ib-finance/payables/{pay.get('payable_id')}",
            "created_at": today.isoformat()
        })
    
    for bill in pending_billing:
        notifications.append({
            "type": "pending_approval",
            "severity": "info",
            "title": f"Pending: {bill.get('party_name')}",
            "message": f"Billing ₹{bill.get('net_amount', 0):,.0f} awaiting approval",
            "action_url": f"/ib-finance/billing/{bill.get('billing_id')}",
            "created_at": today.isoformat()
        })
    
    for period in open_periods:
        notifications.append({
            "type": "period_open",
            "severity": "info",
            "title": f"Period Open: {period.get('period')}",
            "message": "Consider running period close checklist",
            "action_url": f"/ib-finance/close",
            "created_at": today.isoformat()
        })
    
    return {
        "success": True,
        "data": notifications,
        "count": len(notifications)
    }


@router.post("/check-alerts")
async def check_and_send_alerts(current_user: dict = Depends(get_current_user)):
    """Check for alerts and broadcast via WebSocket"""
    db = get_db()
    org_id = current_user.get("org_id")
    
    today = datetime.now(timezone.utc)
    alerts_sent = 0
    
    # Check overdue receivables
    overdue_rcv = await db.fin_receivables.find({
        "org_id": org_id,
        "status": {"$in": ["open", "overdue"]},
        "due_date": {"$lt": today.isoformat()}
    }, {"_id": 0}).to_list(length=100)
    
    for rcv in overdue_rcv:
        due_date_str = rcv.get("due_date", today.isoformat())
        try:
            due_date = datetime.fromisoformat(due_date_str.replace("Z", "+00:00"))
            if due_date.tzinfo is None:
                due_date = due_date.replace(tzinfo=timezone.utc)
            days_overdue = (today - due_date).days
        except:
            days_overdue = 0
        await trigger_overdue_receivable_alert(
            org_id, 
            rcv.get("receivable_id"),
            rcv.get("customer_name"),
            rcv.get("outstanding_amount", 0),
            days_overdue
        )
        alerts_sent += 1
    
    return {
        "success": True,
        "alerts_sent": alerts_sent,
        "message": f"Sent {alerts_sent} alerts"
    }
