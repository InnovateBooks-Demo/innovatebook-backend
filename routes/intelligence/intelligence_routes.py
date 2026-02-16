"""
IB Intelligence - Enterprise Intelligence Layer (Enhanced)
Features:
- Multi-tenancy with org_id filtering
- Real-time WebSocket for signal broadcasting
- ML-powered analysis and recommendations (GPT-5.2)
- Live data connection from other solutions
- Auto-generated recommendations from risk analysis
- Executive dashboard with KPIs from all solutions
"""
from fastapi import APIRouter, HTTPException, Depends, Query, WebSocket, WebSocketDisconnect, BackgroundTasks
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import uuid
import json
import asyncio
import os
import jwt
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/intelligence", tags=["Intelligence"])

# Import shared dependencies
from server import db

# JWT configuration
JWT_SECRET = os.environ["JWT_SECRET_KEY"]  # must be set in backend/.env
JWT_ALGORITHM = os.environ.get('JWT_ALGORITHM', 'HS256')
security = HTTPBearer()

# ==================== WEBSOCKET CONNECTION MANAGER ====================

class IntelligenceConnectionManager:
    """Manages WebSocket connections for real-time intelligence updates"""
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}  # org_id -> connections
        self.global_connections: List[WebSocket] = []  # super admin connections
    
    async def connect(self, websocket: WebSocket, org_id: str = None, is_super_admin: bool = False):
        await websocket.accept()
        if is_super_admin:
            self.global_connections.append(websocket)
        elif org_id:
            if org_id not in self.active_connections:
                self.active_connections[org_id] = []
            self.active_connections[org_id].append(websocket)
    
    def disconnect(self, websocket: WebSocket, org_id: str = None, is_super_admin: bool = False):
        if is_super_admin:
            if websocket in self.global_connections:
                self.global_connections.remove(websocket)
        elif org_id and org_id in self.active_connections:
            if websocket in self.active_connections[org_id]:
                self.active_connections[org_id].remove(websocket)
    
    async def broadcast_to_org(self, org_id: str, message: dict):
        """Broadcast message to all connections in an organization"""
        connections = self.active_connections.get(org_id, [])
        for connection in connections:
            try:
                await connection.send_json(message)
            except:
                pass
        # Also send to super admins
        for connection in self.global_connections:
            try:
                await connection.send_json({**message, "org_id": org_id})
            except:
                pass
    
    async def broadcast_global(self, message: dict):
        """Broadcast to all super admin connections"""
        for connection in self.global_connections:
            try:
                await connection.send_json(message)
            except:
                pass

ws_manager = IntelligenceConnectionManager()

# ==================== ML INTEGRATION ====================

async def get_ai_analysis(prompt: str, context: dict = None) -> dict:
    """Get AI-powered analysis using GPT-5.2"""
    try:
        # from emergentintegrations.llm.chat import LlmChat, UserMessage
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage
        except ImportError:
            LlmChat = None
            UserMessage = None

        
        api_key = os.environ.get('EMERGENT_LLM_KEY')
        if not api_key:
            return {"error": "AI service not configured", "fallback": True}
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"intel-{uuid.uuid4().hex[:8]}",
            system_message="""You are an enterprise intelligence analyst. Analyze business data and provide:
1. Key insights and patterns
2. Risk assessments with probability scores
3. Actionable recommendations with priorities
4. Forecast predictions with confidence levels

Always respond in valid JSON format with structure:
{
    "insights": [{"title": "", "description": "", "severity": "info|warning|critical"}],
    "risks": [{"title": "", "probability": 0.0-1.0, "impact": 0-10, "description": ""}],
    "recommendations": [{"action": "", "priority": 1-5, "rationale": "", "risk_if_ignored": ""}],
    "forecast": {"metric": "", "value": 0, "confidence_lower": 0, "confidence_upper": 0}
}"""
        ).with_model("openai", "gpt-5.2")
        
        full_prompt = prompt
        if context:
            full_prompt += f"\n\nContext data:\n{json.dumps(context, indent=2)}"
        
        user_message = UserMessage(text=full_prompt)
        response = await chat.send_message(user_message)
        
        # Try to parse as JSON
        try:
            # Find JSON in response
            start = response.find('{')
            end = response.rfind('}') + 1
            if start >= 0 and end > start:
                return json.loads(response[start:end])
        except:
            pass
        
        return {"raw_response": response, "fallback": True}
    except Exception as e:
        return {"error": str(e), "fallback": True}

# ==================== AUTH ====================

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from JWT token with org_id for multi-tenancy"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub") or payload.get("user_id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {
            "user_id": user_id,
            "org_id": payload.get("org_id"),
            "role": payload.get("role_id") or payload.get("role"),
            "is_super_admin": payload.get("is_super_admin", False)
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def get_org_filter(current_user: dict) -> dict:
    """Get MongoDB filter for multi-tenancy"""
    if current_user.get("is_super_admin"):
        return {}  # Super admins see all
    org_id = current_user.get("org_id")
    if org_id:
        return {"org_id": org_id}
    return {"org_id": {"$exists": False}}  # Legacy data without org_id

# ==================== ENUMS ====================

class SignalSeverity(str, Enum):
    INFO = "info"
    WARNING = "warning"
    CRITICAL = "critical"

class SignalType(str, Enum):
    MARGIN_EROSION = "margin_erosion"
    SCHEDULE_SLIP = "schedule_slip"
    CASH_STRESS = "cash_stress"
    CAPACITY_OVERLOAD = "capacity_overload"
    COVENANT_RISK = "covenant_risk"
    GOVERNANCE_DELAY = "governance_delay"
    PAYMENT_OVERDUE = "payment_overdue"
    DEAL_DISCOUNT = "deal_discount"
    PROJECT_DELAY = "project_delay"
    OVER_ALLOCATION = "over_allocation"
    APPROVAL_DELAY = "approval_delay"
    AI_DETECTED = "ai_detected"

class RiskStatus(str, Enum):
    OPEN = "open"
    ESCALATING = "escalating"
    MITIGATED = "mitigated"
    CLOSED = "closed"

class RiskType(str, Enum):
    REVENUE = "revenue"
    DELIVERY = "delivery"
    LIQUIDITY = "liquidity"
    COMPLIANCE = "compliance"
    CAPITAL = "capital"
    WORKFORCE = "workforce"

class RecommendationType(str, Enum):
    REVIEW = "review"
    PAUSE = "pause"
    ACCELERATE = "accelerate"
    ESCALATE = "escalate"
    INVESTIGATE = "investigate"
    APPROVE = "approve"

# ==================== MODELS ====================

class SignalCreate(BaseModel):
    source_solution: str
    source_module: str
    signal_type: str
    severity: SignalSeverity
    entity_reference: Optional[str] = None
    entity_type: Optional[str] = None
    title: str
    description: str
    metadata: Optional[Dict[str, Any]] = {}

class MetricCreate(BaseModel):
    name: str
    domain: str
    formula: Optional[str] = None
    value: float
    unit: Optional[str] = None
    period: str
    confidence_level: Optional[float] = 0.9

class RiskCreate(BaseModel):
    domain: str
    risk_type: RiskType
    title: str
    description: str
    probability_score: float = Field(ge=0, le=1)
    impact_score: float = Field(ge=0, le=10)
    affected_entities: List[Dict[str, str]] = []

class ForecastCreate(BaseModel):
    domain: str
    metric_name: str
    horizon: str
    projected_value: float
    confidence_lower: float
    confidence_upper: float
    assumptions: List[str] = []

class RecommendationCreate(BaseModel):
    action_type: RecommendationType
    target_module: str
    target_entity_id: Optional[str] = None
    title: str
    explanation: str
    risk_if_ignored: str
    confidence_score: float = Field(ge=0, le=1)
    priority: int = Field(ge=1, le=5)

# ==================== HELPER FUNCTIONS ====================

def generate_id(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

# ==================== WEBSOCKET ENDPOINT ====================

@router.websocket("/ws/{org_id}")
async def intelligence_websocket(websocket: WebSocket, org_id: str):
    """WebSocket endpoint for real-time intelligence updates"""
    await ws_manager.connect(websocket, org_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, org_id)

@router.websocket("/ws/admin/global")
async def admin_websocket(websocket: WebSocket):
    """WebSocket endpoint for super admin global updates"""
    await ws_manager.connect(websocket, is_super_admin=True)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            if message.get("type") == "ping":
                await websocket.send_json({"type": "pong"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, is_super_admin=True)

# ==================== SIGNALS ENDPOINTS ====================

@router.get("/signals")
async def get_signals(
    severity: Optional[str] = None,
    source_solution: Optional[str] = None,
    signal_type: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    skip: int = 0,
    current_user: dict = Depends(get_current_user)
):
    """Get signals filtered by org_id (multi-tenant)"""
    query = get_org_filter(current_user)
    if severity:
        query["severity"] = severity
    if source_solution:
        query["source_solution"] = source_solution
    if signal_type:
        query["signal_type"] = signal_type
    
    signals = await db.intel_signals.find(query, {"_id": 0}).sort("detected_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.intel_signals.count_documents(query)
    
    # Severity counts for this org
    base_query = get_org_filter(current_user)
    severity_counts = {
        "info": await db.intel_signals.count_documents({**base_query, "severity": "info"}),
        "warning": await db.intel_signals.count_documents({**base_query, "severity": "warning"}),
        "critical": await db.intel_signals.count_documents({**base_query, "severity": "critical"})
    }
    
    return {"signals": signals, "total": total, "severity_counts": severity_counts}

@router.post("/signals")
async def create_signal(
    signal: SignalCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new signal and broadcast via WebSocket"""
    org_id = current_user.get("org_id")
    
    signal_doc = {
        "signal_id": generate_id("SIG"),
        "org_id": org_id,
        **signal.dict(),
        "detected_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "acknowledged": False,
        "acknowledged_by": None,
        "acknowledged_at": None
    }
    
    await db.intel_signals.insert_one(signal_doc)
    
    # Broadcast via WebSocket
    ws_message = {
        "type": "SIGNAL_CREATED",
        "signal": {k: v for k, v in signal_doc.items() if k != "_id"},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, ws_message)
    
    # Auto-generate recommendation if critical
    if signal.severity == SignalSeverity.CRITICAL:
        background_tasks.add_task(auto_generate_recommendation_for_signal, signal_doc, current_user)
    
    return {"success": True, "signal_id": signal_doc["signal_id"]}

@router.post("/signals/{signal_id}/acknowledge")
async def acknowledge_signal(
    signal_id: str,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Acknowledge a signal"""
    query = {"signal_id": signal_id, **get_org_filter(current_user)}
    
    result = await db.intel_signals.update_one(
        query,
        {"$set": {
            "acknowledged": True,
            "acknowledged_by": current_user.get("user_id"),
            "acknowledged_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Signal not found")
    
    # Broadcast acknowledgment
    org_id = current_user.get("org_id")
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "SIGNAL_ACKNOWLEDGED",
            "signal_id": signal_id,
            "acknowledged_by": current_user.get("user_id"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "message": "Signal acknowledged"}

@router.get("/signals/summary")
async def get_signals_summary(current_user: dict = Depends(get_current_user)):
    """Get signals summary by source and severity"""
    base_query = get_org_filter(current_user)
    
    pipeline = [
        {"$match": base_query},
        {"$group": {
            "_id": {"source": "$source_solution", "severity": "$severity"},
            "count": {"$sum": 1}
        }}
    ]
    
    results = await db.intel_signals.aggregate(pipeline).to_list(100)
    
    by_source = {}
    by_severity = {"info": 0, "warning": 0, "critical": 0}
    
    for r in results:
        source = r["_id"]["source"]
        severity = r["_id"]["severity"]
        count = r["count"]
        
        if source not in by_source:
            by_source[source] = {"info": 0, "warning": 0, "critical": 0, "total": 0}
        by_source[source][severity] = count
        by_source[source]["total"] += count
        by_severity[severity] += count
    
    recent_critical = await db.intel_signals.find(
        {**base_query, "severity": "critical", "acknowledged": False},
        {"_id": 0}
    ).sort("detected_at", -1).limit(5).to_list(5)
    
    return {
        "by_source": by_source,
        "by_severity": by_severity,
        "total": sum(by_severity.values()),
        "unacknowledged_critical": len(recent_critical),
        "recent_critical": recent_critical
    }

# ==================== METRICS ENDPOINTS ====================

@router.get("/metrics")
async def get_metrics(
    domain: Optional[str] = None,
    period: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Get metrics filtered by org_id"""
    query = get_org_filter(current_user)
    if domain:
        query["domain"] = domain
    if period:
        query["period"] = period
    
    metrics = await db.intel_metrics.find(query, {"_id": 0}).sort("updated_at", -1).limit(limit).to_list(limit)
    return {"metrics": metrics, "total": len(metrics)}

@router.post("/metrics")
async def create_or_update_metric(
    metric: MetricCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create or update a metric with org_id"""
    now = datetime.now(timezone.utc).isoformat()
    org_id = current_user.get("org_id")
    
    existing = await db.intel_metrics.find_one({
        "name": metric.name, 
        "domain": metric.domain,
        **get_org_filter(current_user)
    })
    
    if existing:
        history_entry = {"value": existing.get("value"), "recorded_at": existing.get("updated_at")}
        
        await db.intel_metrics.update_one(
            {"metric_id": existing["metric_id"]},
            {
                "$set": {"value": metric.value, "updated_at": now, "confidence_level": metric.confidence_level},
                "$push": {"history": {"$each": [history_entry], "$slice": -30}}
            }
        )
        return {"success": True, "metric_id": existing["metric_id"], "action": "updated"}
    else:
        metric_doc = {
            "metric_id": generate_id("MET"),
            "org_id": org_id,
            **metric.dict(),
            "created_at": now,
            "updated_at": now,
            "history": []
        }
        await db.intel_metrics.insert_one(metric_doc)
        return {"success": True, "metric_id": metric_doc["metric_id"], "action": "created"}

@router.get("/metrics/dashboard")
async def get_metrics_dashboard(current_user: dict = Depends(get_current_user)):
    """Get metrics dashboard with KPIs by domain"""
    base_query = get_org_filter(current_user)
    domains = ["commercial", "operational", "financial", "workforce", "capital"]
    
    dashboard = {}
    for domain in domains:
        metrics = await db.intel_metrics.find(
            {**base_query, "domain": domain},
            {"_id": 0, "history": 0}
        ).sort("updated_at", -1).limit(10).to_list(10)
        
        dashboard[domain] = {"metrics": metrics, "count": len(metrics)}
    
    total_metrics = await db.intel_metrics.count_documents(base_query)
    
    return {
        "domains": dashboard,
        "total_metrics": total_metrics,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

@router.get("/metrics/{metric_id}/history")
async def get_metric_history(metric_id: str, current_user: dict = Depends(get_current_user)):
    """Get historical values for a metric"""
    query = {"metric_id": metric_id, **get_org_filter(current_user)}
    metric = await db.intel_metrics.find_one(query, {"_id": 0})
    
    if not metric:
        raise HTTPException(status_code=404, detail="Metric not found")
    
    return {
        "metric_id": metric_id,
        "name": metric.get("name"),
        "current_value": metric.get("value"),
        "history": metric.get("history", [])
    }

# ==================== RISK ENDPOINTS ====================

@router.get("/risks")
async def get_risks(
    domain: Optional[str] = None,
    risk_type: Optional[str] = None,
    status: Optional[str] = None,
    min_score: Optional[float] = None,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Get risks filtered by org_id"""
    query = get_org_filter(current_user)
    if domain:
        query["domain"] = domain
    if risk_type:
        query["risk_type"] = risk_type
    if status:
        query["status"] = status
    if min_score is not None:
        query["risk_score"] = {"$gte": min_score}
    
    risks = await db.intel_risks.find(query, {"_id": 0}).sort("risk_score", -1).limit(limit).to_list(limit)
    return {"risks": risks, "total": len(risks)}

@router.post("/risks")
async def create_risk(
    risk: RiskCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new risk with org_id"""
    risk_score = risk.probability_score * risk.impact_score
    org_id = current_user.get("org_id")
    
    risk_doc = {
        "risk_id": generate_id("RSK"),
        "org_id": org_id,
        **risk.dict(),
        "risk_score": round(risk_score, 2),
        "status": RiskStatus.OPEN.value,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "history": []
    }
    
    await db.intel_risks.insert_one(risk_doc)
    
    # Auto-generate recommendation for high-risk items
    if risk_score >= 5:
        background_tasks.add_task(auto_generate_recommendation_for_risk, risk_doc, current_user)
    
    # Broadcast via WebSocket
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "RISK_CREATED",
            "risk_id": risk_doc["risk_id"],
            "risk_score": risk_score,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "risk_id": risk_doc["risk_id"], "risk_score": risk_score}

@router.put("/risks/{risk_id}/status")
async def update_risk_status(
    risk_id: str,
    status: RiskStatus,
    notes: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Update risk status"""
    now = datetime.now(timezone.utc).isoformat()
    query = {"risk_id": risk_id, **get_org_filter(current_user)}
    
    result = await db.intel_risks.update_one(
        query,
        {
            "$set": {"status": status.value, "updated_at": now},
            "$push": {"history": {
                "action": f"Status changed to {status.value}",
                "notes": notes,
                "by": current_user.get("user_id"),
                "at": now
            }}
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Risk not found")
    
    # Broadcast
    org_id = current_user.get("org_id")
    if org_id and background_tasks:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "RISK_STATUS_CHANGED",
            "risk_id": risk_id,
            "new_status": status.value,
            "timestamp": now
        })
    
    return {"success": True, "message": f"Risk status updated to {status.value}"}

@router.get("/risks/heatmap")
async def get_risk_heatmap(current_user: dict = Depends(get_current_user)):
    """Get risk heatmap data"""
    base_query = get_org_filter(current_user)
    
    risks = await db.intel_risks.find(
        {**base_query, "status": {"$ne": "closed"}},
        {"_id": 0, "risk_id": 1, "title": 1, "domain": 1, "risk_type": 1, 
         "probability_score": 1, "impact_score": 1, "risk_score": 1, "status": 1}
    ).to_list(100)
    
    heatmap = {
        "high_high": [], "high_medium": [], "high_low": [],
        "medium_high": [], "medium_medium": [], "medium_low": [],
        "low_high": [], "low_medium": [], "low_low": []
    }
    
    for risk in risks:
        prob = risk.get("probability_score", 0)
        impact = risk.get("impact_score", 0)
        
        prob_level = "high" if prob > 0.66 else "medium" if prob > 0.33 else "low"
        impact_level = "high" if impact > 6.6 else "medium" if impact > 3.3 else "low"
        
        key = f"{prob_level}_{impact_level}"
        heatmap[key].append(risk)
    
    by_domain = {}
    by_type = {}
    for risk in risks:
        domain = risk.get("domain", "unknown")
        rtype = risk.get("risk_type", "unknown")
        by_domain[domain] = by_domain.get(domain, 0) + 1
        by_type[rtype] = by_type.get(rtype, 0) + 1
    
    return {
        "heatmap": heatmap,
        "by_domain": by_domain,
        "by_type": by_type,
        "total_open": len(risks),
        "critical_count": len([r for r in risks if r.get("risk_score", 0) >= 7])
    }

# ==================== FORECAST ENDPOINTS ====================

@router.get("/forecasts")
async def get_forecasts(
    domain: Optional[str] = None,
    horizon: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Get forecasts filtered by org_id"""
    query = get_org_filter(current_user)
    if domain:
        query["domain"] = domain
    if horizon:
        query["horizon"] = horizon
    
    forecasts = await db.intel_forecasts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    return {"forecasts": forecasts, "total": len(forecasts)}

@router.post("/forecasts")
async def create_forecast(
    forecast: ForecastCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new forecast with org_id"""
    org_id = current_user.get("org_id")
    
    forecast_doc = {
        "forecast_id": generate_id("FCT"),
        "org_id": org_id,
        **forecast.dict(),
        "confidence_band": {
            "lower": forecast.confidence_lower,
            "upper": forecast.confidence_upper,
            "range": forecast.confidence_upper - forecast.confidence_lower
        },
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "status": "active",
        "actual_value": None,
        "accuracy": None
    }
    
    await db.intel_forecasts.insert_one(forecast_doc)
    return {"success": True, "forecast_id": forecast_doc["forecast_id"]}

@router.post("/forecasts/{forecast_id}/actual")
async def record_actual_value(
    forecast_id: str,
    actual_value: float,
    current_user: dict = Depends(get_current_user)
):
    """Record actual value for a forecast"""
    query = {"forecast_id": forecast_id, **get_org_filter(current_user)}
    forecast = await db.intel_forecasts.find_one(query)
    
    if not forecast:
        raise HTTPException(status_code=404, detail="Forecast not found")
    
    projected = forecast.get("projected_value", 0)
    accuracy = 1 - abs(projected - actual_value) / max(projected, actual_value, 1) if projected else 0
    
    await db.intel_forecasts.update_one(
        {"forecast_id": forecast_id},
        {"$set": {
            "actual_value": actual_value,
            "accuracy": round(accuracy, 4),
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat()
        }}
    )
    
    # Create learning record
    await db.intel_learning.insert_one({
        "record_id": generate_id("LRN"),
        "org_id": current_user.get("org_id"),
        "model_id": "forecast_engine",
        "prediction_type": forecast.get("domain"),
        "prediction_value": projected,
        "actual_outcome": actual_value,
        "deviation": projected - actual_value,
        "accuracy": accuracy,
        "forecast_id": forecast_id,
        "recorded_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "accuracy": round(accuracy * 100, 1), "deviation": projected - actual_value}

@router.get("/forecasts/scenarios")
async def get_forecast_scenarios(current_user: dict = Depends(get_current_user)):
    """Get what-if scenario templates"""
    scenarios = [
        {
            "id": "hiring_change",
            "name": "Hiring Change Impact",
            "description": "Simulate impact of changing hiring plans",
            "parameters": [
                {"name": "headcount_delta", "type": "number", "default": 0},
                {"name": "avg_salary", "type": "number", "default": 1200000}
            ],
            "affected_metrics": ["burn_rate", "runway", "capacity_utilization"]
        },
        {
            "id": "pricing_change",
            "name": "Pricing Strategy Change",
            "description": "Simulate impact of pricing adjustments",
            "parameters": [
                {"name": "price_change_percent", "type": "number", "default": 0},
                {"name": "expected_volume_impact", "type": "number", "default": 0}
            ],
            "affected_metrics": ["revenue", "margin", "deal_conversion"]
        },
        {
            "id": "funding_timing",
            "name": "Funding Timeline",
            "description": "Simulate different funding scenarios",
            "parameters": [
                {"name": "funding_amount", "type": "number", "default": 0},
                {"name": "months_until_close", "type": "number", "default": 3}
            ],
            "affected_metrics": ["runway", "cash_coverage", "dilution"]
        },
        {
            "id": "capacity_reallocation",
            "name": "Capacity Reallocation",
            "description": "Simulate resource reallocation impact",
            "parameters": [
                {"name": "from_project", "type": "string", "default": ""},
                {"name": "to_project", "type": "string", "default": ""},
                {"name": "fte_count", "type": "number", "default": 1}
            ],
            "affected_metrics": ["delivery_variance", "utilization", "project_margin"]
        }
    ]
    return {"scenarios": scenarios}

@router.post("/forecasts/simulate")
async def run_forecast_simulation(
    scenario_id: str,
    parameters: Dict[str, Any],
    current_user: dict = Depends(get_current_user)
):
    """Run a what-if simulation with optional AI enhancement"""
    base_metrics = {
        "burn_rate": 8500000,
        "runway": 18,
        "capacity_utilization": 0.82,
        "revenue": 24500000,
        "margin": 0.35,
        "deal_conversion": 0.28
    }
    
    results = {"base": base_metrics.copy(), "simulated": base_metrics.copy()}
    
    if scenario_id == "hiring_change":
        delta = parameters.get("headcount_delta", 0)
        salary = parameters.get("avg_salary", 1200000)
        monthly_impact = (delta * salary) / 12
        results["simulated"]["burn_rate"] += monthly_impact
        if results["simulated"]["burn_rate"] > 0:
            results["simulated"]["runway"] = round(base_metrics["runway"] * base_metrics["burn_rate"] / results["simulated"]["burn_rate"], 1)
        results["simulated"]["capacity_utilization"] = min(1.0, base_metrics["capacity_utilization"] * (1 - delta * 0.05))
    
    elif scenario_id == "pricing_change":
        price_change = parameters.get("price_change_percent", 0) / 100
        volume_impact = parameters.get("expected_volume_impact", 0) / 100
        results["simulated"]["revenue"] = base_metrics["revenue"] * (1 + price_change) * (1 + volume_impact)
        results["simulated"]["margin"] = base_metrics["margin"] + (price_change * 0.5)
    
    # Try AI enhancement
    ai_insights = await get_ai_analysis(
        f"Analyze this business scenario simulation: {scenario_id} with parameters {parameters}. Base metrics: {base_metrics}. Simulated results: {results['simulated']}. Provide insights on potential risks and recommendations.",
        {"scenario": scenario_id, "parameters": parameters, "base": base_metrics, "simulated": results["simulated"]}
    )
    
    return {
        "scenario_id": scenario_id,
        "parameters": parameters,
        "results": results,
        "impact_summary": {
            "positive": [k for k, v in results["simulated"].items() if v > results["base"].get(k, 0)],
            "negative": [k for k, v in results["simulated"].items() if v < results["base"].get(k, 0)],
            "neutral": [k for k, v in results["simulated"].items() if v == results["base"].get(k, 0)]
        },
        "ai_insights": ai_insights if not ai_insights.get("fallback") else None,
        "simulated_at": datetime.now(timezone.utc).isoformat()
    }

@router.post("/forecasts/ai-generate")
async def ai_generate_forecast(
    domain: str,
    metric_name: str,
    horizon: str = "90d",
    current_user: dict = Depends(get_current_user)
):
    """Use AI to generate a forecast based on historical data"""
    base_query = get_org_filter(current_user)
    
    # Get historical metrics
    historical = await db.intel_metrics.find(
        {**base_query, "domain": domain},
        {"_id": 0}
    ).sort("updated_at", -1).limit(30).to_list(30)
    
    # Get recent signals for context
    signals = await db.intel_signals.find(
        {**base_query, "source_solution": domain},
        {"_id": 0}
    ).sort("detected_at", -1).limit(10).to_list(10)
    
    # AI analysis
    ai_response = await get_ai_analysis(
        f"Generate a {horizon} forecast for {metric_name} in the {domain} domain. Use the historical data and signals to predict future values with confidence bounds.",
        {"historical_metrics": historical, "recent_signals": signals}
    )
    
    if ai_response.get("forecast"):
        forecast = ai_response["forecast"]
        forecast_doc = {
            "forecast_id": generate_id("FCT"),
            "org_id": current_user.get("org_id"),
            "domain": domain,
            "metric_name": forecast.get("metric", metric_name),
            "horizon": horizon,
            "projected_value": forecast.get("value", 0),
            "confidence_lower": forecast.get("confidence_lower", 0),
            "confidence_upper": forecast.get("confidence_upper", 0),
            "confidence_band": {
                "lower": forecast.get("confidence_lower", 0),
                "upper": forecast.get("confidence_upper", 0),
                "range": forecast.get("confidence_upper", 0) - forecast.get("confidence_lower", 0)
            },
            "assumptions": ["AI-generated based on historical data"],
            "ai_generated": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get("user_id"),
            "status": "active"
        }
        await db.intel_forecasts.insert_one(forecast_doc)
        return {"success": True, "forecast": {k: v for k, v in forecast_doc.items() if k != "_id"}}
    
    return {"success": False, "message": "AI could not generate forecast", "fallback_response": ai_response}

# ==================== RECOMMENDATIONS ENDPOINTS ====================

@router.get("/recommendations")
async def get_recommendations(
    action_type: Optional[str] = None,
    target_module: Optional[str] = None,
    priority: Optional[int] = None,
    status: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    current_user: dict = Depends(get_current_user)
):
    """Get recommendations filtered by org_id"""
    query = {**get_org_filter(current_user), "status": {"$ne": "dismissed"}}
    if action_type:
        query["action_type"] = action_type
    if target_module:
        query["target_module"] = target_module
    if priority:
        query["priority"] = priority
    if status:
        query["status"] = status
    
    recommendations = await db.intel_recommendations.find(query, {"_id": 0}).sort([("priority", 1), ("created_at", -1)]).limit(limit).to_list(limit)
    return {"recommendations": recommendations, "total": len(recommendations)}

@router.post("/recommendations")
async def create_recommendation(
    recommendation: RecommendationCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Create a new recommendation with org_id"""
    org_id = current_user.get("org_id")
    
    rec_doc = {
        "recommendation_id": generate_id("REC"),
        "org_id": org_id,
        **recommendation.dict(),
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "created_by": current_user.get("user_id"),
        "acted_on": False,
        "acted_by": None,
        "acted_at": None,
        "action_taken": None,
        "ai_generated": False
    }
    
    await db.intel_recommendations.insert_one(rec_doc)
    
    # Broadcast
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "RECOMMENDATION_CREATED",
            "recommendation_id": rec_doc["recommendation_id"],
            "priority": recommendation.priority,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {"success": True, "recommendation_id": rec_doc["recommendation_id"]}

@router.post("/recommendations/{rec_id}/act")
async def act_on_recommendation(
    rec_id: str,
    action: str,
    notes: Optional[str] = None,
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user)
):
    """Record action taken on a recommendation"""
    now = datetime.now(timezone.utc).isoformat()
    query = {"recommendation_id": rec_id, **get_org_filter(current_user)}
    
    result = await db.intel_recommendations.update_one(
        query,
        {"$set": {
            "status": action,
            "acted_on": True,
            "acted_by": current_user.get("user_id"),
            "acted_at": now,
            "action_taken": notes
        }}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Recommendation not found")
    
    # Learning record
    rec = await db.intel_recommendations.find_one({"recommendation_id": rec_id}, {"_id": 0})
    if rec:
        await db.intel_learning.insert_one({
            "record_id": generate_id("LRN"),
            "org_id": current_user.get("org_id"),
            "model_id": "recommendation_engine",
            "prediction_type": rec.get("action_type"),
            "prediction_value": rec.get("confidence_score"),
            "feedback": action,
            "recommendation_id": rec_id,
            "recorded_at": now
        })
    
    # Broadcast
    org_id = current_user.get("org_id")
    if org_id and background_tasks:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "RECOMMENDATION_ACTED",
            "recommendation_id": rec_id,
            "action": action,
            "timestamp": now
        })
    
    return {"success": True, "message": f"Recommendation marked as {action}"}

@router.get("/recommendations/summary")
async def get_recommendations_summary(current_user: dict = Depends(get_current_user)):
    """Get recommendations summary"""
    base_query = get_org_filter(current_user)
    
    pending = await db.intel_recommendations.count_documents({**base_query, "status": "pending"})
    accepted = await db.intel_recommendations.count_documents({**base_query, "status": "accepted"})
    dismissed = await db.intel_recommendations.count_documents({**base_query, "status": "dismissed"})
    deferred = await db.intel_recommendations.count_documents({**base_query, "status": "deferred"})
    
    high_priority = await db.intel_recommendations.find(
        {**base_query, "status": "pending", "priority": {"$lte": 2}},
        {"_id": 0}
    ).sort("priority", 1).limit(5).to_list(5)
    
    pipeline = [
        {"$match": {**base_query, "status": "pending"}},
        {"$group": {"_id": "$action_type", "count": {"$sum": 1}}}
    ]
    by_type = await db.intel_recommendations.aggregate(pipeline).to_list(10)
    
    return {
        "counts": {
            "pending": pending,
            "accepted": accepted,
            "dismissed": dismissed,
            "deferred": deferred,
            "total": pending + accepted + dismissed + deferred
        },
        "high_priority": high_priority,
        "by_action_type": {r["_id"]: r["count"] for r in by_type},
        "acceptance_rate": round(accepted / max(accepted + dismissed, 1) * 100, 1)
    }

# ==================== AUTO-GENERATION HELPERS ====================

async def auto_generate_recommendation_for_signal(signal: dict, user: dict):
    """Auto-generate a recommendation when a critical signal is detected"""
    # Try AI-powered recommendation
    ai_response = await get_ai_analysis(
        f"A critical signal has been detected: '{signal.get('title')}'. Description: {signal.get('description')}. Source: {signal.get('source_solution')}/{signal.get('source_module')}. Generate an actionable recommendation to address this issue.",
        signal
    )
    
    if ai_response.get("recommendations") and len(ai_response["recommendations"]) > 0:
        ai_rec = ai_response["recommendations"][0]
        rec_doc = {
            "recommendation_id": generate_id("REC"),
            "org_id": user.get("org_id"),
            "action_type": ai_rec.get("action", "investigate").lower(),
            "target_module": f"{signal.get('source_solution')}/{signal.get('source_module')}",
            "target_entity_id": signal.get("entity_reference"),
            "title": ai_rec.get("action", f"Address: {signal.get('title')}"),
            "explanation": ai_rec.get("rationale", signal.get("description")),
            "risk_if_ignored": ai_rec.get("risk_if_ignored", "Potential business impact if not addressed"),
            "confidence_score": 0.85,
            "priority": ai_rec.get("priority", 2),
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
            "ai_generated": True,
            "source_signal_id": signal.get("signal_id")
        }
    else:
        # Fallback to simple recommendation
        rec_doc = {
            "recommendation_id": generate_id("REC"),
            "org_id": user.get("org_id"),
            "action_type": "investigate",
            "target_module": f"{signal.get('source_solution')}/{signal.get('source_module')}",
            "target_entity_id": signal.get("entity_reference"),
            "title": f"Investigate: {signal.get('title')}",
            "explanation": f"Critical signal detected: {signal.get('description')}",
            "risk_if_ignored": "Potential business impact if not addressed promptly",
            "confidence_score": 0.75,
            "priority": 1,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
            "ai_generated": False,
            "source_signal_id": signal.get("signal_id")
        }
    
    await db.intel_recommendations.insert_one(rec_doc)
    
    # Broadcast
    org_id = user.get("org_id")
    if org_id:
        await ws_manager.broadcast_to_org(org_id, {
            "type": "AUTO_RECOMMENDATION_CREATED",
            "recommendation_id": rec_doc["recommendation_id"],
            "source": "signal",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })

async def auto_generate_recommendation_for_risk(risk: dict, user: dict):
    """Auto-generate a recommendation for high-risk items"""
    ai_response = await get_ai_analysis(
        f"A high-risk item has been identified: '{risk.get('title')}'. Domain: {risk.get('domain')}, Type: {risk.get('risk_type')}, Risk Score: {risk.get('risk_score')}. Description: {risk.get('description')}. Generate a mitigation recommendation.",
        risk
    )
    
    if ai_response.get("recommendations") and len(ai_response["recommendations"]) > 0:
        ai_rec = ai_response["recommendations"][0]
        action_type = ai_rec.get("action", "review").lower()
        if action_type not in ["review", "pause", "accelerate", "escalate", "investigate", "approve"]:
            action_type = "review"
        
        rec_doc = {
            "recommendation_id": generate_id("REC"),
            "org_id": user.get("org_id"),
            "action_type": action_type,
            "target_module": f"risk/{risk.get('domain')}",
            "title": ai_rec.get("action", f"Mitigate Risk: {risk.get('title')}"),
            "explanation": ai_rec.get("rationale", f"Risk mitigation needed for: {risk.get('description')}"),
            "risk_if_ignored": ai_rec.get("risk_if_ignored", f"Risk score of {risk.get('risk_score')} may escalate"),
            "confidence_score": 0.80,
            "priority": 1 if risk.get("risk_score", 0) >= 7 else 2,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
            "ai_generated": True,
            "source_risk_id": risk.get("risk_id")
        }
    else:
        rec_doc = {
            "recommendation_id": generate_id("REC"),
            "org_id": user.get("org_id"),
            "action_type": "escalate" if risk.get("risk_score", 0) >= 7 else "review",
            "target_module": f"risk/{risk.get('domain')}",
            "title": f"Mitigate Risk: {risk.get('title')}",
            "explanation": f"Risk identified with score {risk.get('risk_score')}: {risk.get('description')}",
            "risk_if_ignored": f"Risk may escalate, current score: {risk.get('risk_score')}",
            "confidence_score": 0.70,
            "priority": 1 if risk.get("risk_score", 0) >= 7 else 2,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": "system",
            "ai_generated": False,
            "source_risk_id": risk.get("risk_id")
        }
    
    await db.intel_recommendations.insert_one(rec_doc)

# ==================== LIVE DATA CONNECTION ====================

@router.post("/scan-solutions")
async def scan_solutions_for_signals(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Scan all solutions for potential signals - connects Intelligence to live data"""
    org_id = current_user.get("org_id")
    signals_created = []
    
    # Scan Commerce - Overdue Invoices
    overdue_invoices = await db.fin_invoices.find({
        "status": "overdue",
        "due_date": {"$lt": datetime.now(timezone.utc).isoformat()}
    }, {"_id": 0}).to_list(50)
    
    for inv in overdue_invoices:
        existing = await db.intel_signals.find_one({
            "entity_reference": inv.get("invoice_id"),
            "signal_type": "payment_overdue"
        })
        if not existing:
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "finance",
                "source_module": "receivables",
                "signal_type": "payment_overdue",
                "severity": "critical" if inv.get("amount", 0) > 500000 else "warning",
                "entity_reference": inv.get("invoice_id"),
                "entity_type": "invoice",
                "title": f"Invoice Overdue: {inv.get('invoice_id')}",
                "description": f"Invoice {inv.get('invoice_id')} for ₹{inv.get('amount', 0):,.0f} is overdue",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system",
                "acknowledged": False,
                "metadata": {"amount": inv.get("amount"), "customer": inv.get("customer_name")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # Scan Workforce - Over-allocation
    over_allocated = await db.wf_allocations.find({
        "allocation_percentage": {"$gt": 100}
    }, {"_id": 0}).to_list(50)
    
    for alloc in over_allocated:
        existing = await db.intel_signals.find_one({
            "entity_reference": alloc.get("person_id"),
            "signal_type": "over_allocation",
            "detected_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()}
        })
        if not existing:
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "workforce",
                "source_module": "capacity",
                "signal_type": "over_allocation",
                "severity": "warning",
                "entity_reference": alloc.get("person_id"),
                "entity_type": "employee",
                "title": f"Resource Over-allocated: {alloc.get('person_name', 'Unknown')}",
                "description": f"Allocated at {alloc.get('allocation_percentage')}%",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system",
                "acknowledged": False,
                "metadata": {"allocation": alloc.get("allocation_percentage")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # Scan Operations - Project Delays
    delayed_projects = await db.ops_projects.find({
        "status": "in_progress",
        "end_date": {"$lt": datetime.now(timezone.utc).isoformat()},
        "actual_end_date": {"$exists": False}
    }, {"_id": 0}).to_list(50)
    
    for proj in delayed_projects:
        existing = await db.intel_signals.find_one({
            "entity_reference": proj.get("project_id"),
            "signal_type": "project_delay"
        })
        if not existing:
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "operations",
                "source_module": "projects",
                "signal_type": "project_delay",
                "severity": "critical",
                "entity_reference": proj.get("project_id"),
                "entity_type": "project",
                "title": f"Project Delayed: {proj.get('name', proj.get('project_id'))}",
                "description": f"Project past expected end date",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system",
                "acknowledged": False,
                "metadata": {"end_date": proj.get("end_date")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # Scan Commerce - Low Margin Deals
    low_margin_deals = await db.deals.find({
        "status": "in_progress",
        "margin": {"$lt": 20}
    }, {"_id": 0}).to_list(50)
    
    for deal in low_margin_deals:
        existing = await db.intel_signals.find_one({
            "entity_reference": deal.get("deal_id"),
            "signal_type": "margin_erosion"
        })
        if not existing:
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "commerce",
                "source_module": "revenue",
                "signal_type": "margin_erosion",
                "severity": "warning",
                "entity_reference": deal.get("deal_id"),
                "entity_type": "deal",
                "title": f"Low Margin Deal: {deal.get('deal_id')}",
                "description": f"Deal margin at {deal.get('margin', 0)}%, below 20% threshold",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "system",
                "acknowledged": False,
                "metadata": {"margin": deal.get("margin")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # Broadcast new signals
    if org_id and signals_created:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "SCAN_COMPLETED",
            "signals_created": len(signals_created),
            "signal_ids": signals_created,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "success": True,
        "signals_created": len(signals_created),
        "signal_ids": signals_created,
        "scanned_solutions": ["finance", "workforce", "operations", "commerce"]
    }

@router.post("/auto-analyze")
async def auto_analyze_and_recommend(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Use AI to analyze all data and generate recommendations"""
    base_query = get_org_filter(current_user)
    
    # Gather context
    signals = await db.intel_signals.find({**base_query, "acknowledged": False}, {"_id": 0}).limit(20).to_list(20)
    risks = await db.intel_risks.find({**base_query, "status": {"$in": ["open", "escalating"]}}, {"_id": 0}).limit(20).to_list(20)
    metrics = await db.intel_metrics.find(base_query, {"_id": 0, "history": 0}).limit(30).to_list(30)
    
    context = {
        "unacknowledged_signals": len(signals),
        "open_risks": len(risks),
        "metrics_count": len(metrics),
        "signals": signals,
        "risks": risks,
        "metrics": metrics
    }
    
    # AI Analysis
    ai_response = await get_ai_analysis(
        "Analyze the current business intelligence data and generate prioritized recommendations. Focus on: 1) Critical issues requiring immediate attention, 2) Risk mitigation strategies, 3) Performance improvement opportunities.",
        context
    )
    
    recommendations_created = []
    
    if ai_response.get("recommendations"):
        for i, ai_rec in enumerate(ai_response["recommendations"][:5]):  # Max 5 recommendations
            action_type = ai_rec.get("action", "review").lower()
            if action_type not in ["review", "pause", "accelerate", "escalate", "investigate", "approve"]:
                action_type = "review"
            
            rec_doc = {
                "recommendation_id": generate_id("REC"),
                "org_id": current_user.get("org_id"),
                "action_type": action_type,
                "target_module": "intelligence/analysis",
                "title": ai_rec.get("action", f"AI Recommendation #{i+1}"),
                "explanation": ai_rec.get("rationale", "AI-generated recommendation based on data analysis"),
                "risk_if_ignored": ai_rec.get("risk_if_ignored", "Potential business impact"),
                "confidence_score": 0.85,
                "priority": ai_rec.get("priority", i + 1),
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "ai_engine",
                "ai_generated": True
            }
            await db.intel_recommendations.insert_one(rec_doc)
            recommendations_created.append(rec_doc["recommendation_id"])
    
    # Also extract risks from AI analysis
    risks_created = []
    if ai_response.get("risks"):
        for ai_risk in ai_response["risks"][:3]:  # Max 3 new risks
            risk_doc = {
                "risk_id": generate_id("RSK"),
                "org_id": current_user.get("org_id"),
                "domain": "intelligence",
                "risk_type": "revenue",
                "title": ai_risk.get("title", "AI-Identified Risk"),
                "description": ai_risk.get("description", "Risk identified through AI analysis"),
                "probability_score": ai_risk.get("probability", 0.5),
                "impact_score": ai_risk.get("impact", 5),
                "risk_score": ai_risk.get("probability", 0.5) * ai_risk.get("impact", 5),
                "status": "open",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "ai_engine",
                "ai_generated": True,
                "affected_entities": [],
                "history": []
            }
            await db.intel_risks.insert_one(risk_doc)
            risks_created.append(risk_doc["risk_id"])
    
    return {
        "success": True,
        "recommendations_created": len(recommendations_created),
        "recommendation_ids": recommendations_created,
        "risks_created": len(risks_created),
        "risk_ids": risks_created,
        "ai_insights": ai_response.get("insights", []) if not ai_response.get("fallback") else None
    }

# ==================== LEARNING ENDPOINTS ====================

@router.get("/learning/records")
async def get_learning_records(
    model_id: Optional[str] = None,
    limit: int = Query(default=100, le=500),
    current_user: dict = Depends(get_current_user)
):
    """Get learning records filtered by org_id"""
    query = get_org_filter(current_user)
    if model_id:
        query["model_id"] = model_id
    
    records = await db.intel_learning.find(query, {"_id": 0}).sort("recorded_at", -1).limit(limit).to_list(limit)
    return {"records": records, "total": len(records)}

@router.get("/learning/accuracy")
async def get_model_accuracy(current_user: dict = Depends(get_current_user)):
    """Get accuracy metrics for intelligence models"""
    base_query = get_org_filter(current_user)
    
    forecast_pipeline = [
        {"$match": {**base_query, "model_id": "forecast_engine", "accuracy": {"$exists": True}}},
        {"$group": {
            "_id": "$prediction_type",
            "avg_accuracy": {"$avg": "$accuracy"},
            "count": {"$sum": 1}
        }}
    ]
    forecast_accuracy = await db.intel_learning.aggregate(forecast_pipeline).to_list(20)
    
    rec_pipeline = [
        {"$match": {**base_query, "model_id": "recommendation_engine"}},
        {"$group": {"_id": "$feedback", "count": {"$sum": 1}}}
    ]
    rec_feedback = await db.intel_learning.aggregate(rec_pipeline).to_list(10)
    
    return {
        "forecast_accuracy": {r["_id"]: {"accuracy": round(r["avg_accuracy"] * 100, 1), "samples": r["count"]} for r in forecast_accuracy},
        "recommendation_feedback": {r["_id"]: r["count"] for r in rec_feedback},
        "overall_metrics": {
            "forecast_samples": sum(r["count"] for r in forecast_accuracy),
            "recommendation_samples": sum(r["count"] for r in rec_feedback)
        }
    }

@router.post("/learning/feedback")
async def submit_feedback(
    model_id: str,
    prediction_type: str,
    prediction_value: float,
    actual_outcome: Optional[float] = None,
    feedback: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Submit feedback for learning"""
    deviation = None
    if actual_outcome is not None and prediction_value:
        deviation = prediction_value - actual_outcome
    
    learning_doc = {
        "record_id": generate_id("LRN"),
        "org_id": current_user.get("org_id"),
        "model_id": model_id,
        "prediction_type": prediction_type,
        "prediction_value": prediction_value,
        "actual_outcome": actual_outcome,
        "deviation": deviation,
        "feedback": feedback,
        "recorded_at": datetime.now(timezone.utc).isoformat(),
        "submitted_by": current_user.get("user_id")
    }
    
    await db.intel_learning.insert_one(learning_doc)
    return {"success": True, "record_id": learning_doc["record_id"]}

# ==================== EXECUTIVE DASHBOARD ====================

@router.get("/executive-dashboard")
async def get_executive_dashboard(current_user: dict = Depends(get_current_user)):
    """Comprehensive executive dashboard pulling data from all solutions"""
    base_query = get_org_filter(current_user)
    
    # Intelligence Summary
    signals_critical = await db.intel_signals.count_documents({**base_query, "severity": "critical", "acknowledged": False})
    signals_warning = await db.intel_signals.count_documents({**base_query, "severity": "warning", "acknowledged": False})
    risks_open = await db.intel_risks.count_documents({**base_query, "status": {"$in": ["open", "escalating"]}})
    recs_pending = await db.intel_recommendations.count_documents({**base_query, "status": "pending"})
    
    # Commerce KPIs
    total_revenue = 0
    total_deals = await db.deals.count_documents({})
    active_deals = await db.deals.count_documents({"status": "in_progress"})
    
    # Finance KPIs
    outstanding_ar = await db.fin_invoices.find({"status": {"$in": ["pending", "overdue"]}}).to_list(1000)
    total_ar = sum(inv.get("amount", 0) for inv in outstanding_ar)
    overdue_ar = sum(inv.get("amount", 0) for inv in outstanding_ar if inv.get("status") == "overdue")
    
    # Workforce KPIs
    total_people = await db.wf_people.count_documents({})
    
    # Operations KPIs
    active_projects = await db.ops_projects.count_documents({"status": "in_progress"})
    
    # Capital KPIs
    total_funding = 0
    funding_rounds = await db.ic_funding_rounds.find({}, {"_id": 0, "amount": 1}).to_list(100)
    for f in funding_rounds:
        total_funding += f.get("amount", 0)
    
    # Key Metrics
    key_metrics = await db.intel_metrics.find(base_query, {"_id": 0, "history": 0}).sort("updated_at", -1).limit(10).to_list(10)
    
    # Recent Activity
    recent_signals = await db.intel_signals.find(base_query, {"_id": 0}).sort("detected_at", -1).limit(5).to_list(5)
    recent_recommendations = await db.intel_recommendations.find({**base_query, "status": "pending"}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    
    return {
        "intelligence_health": {
            "status": "critical" if signals_critical > 0 else "warning" if signals_warning > 2 or risks_open > 3 else "healthy",
            "signals": {"critical": signals_critical, "warning": signals_warning},
            "risks_open": risks_open,
            "recommendations_pending": recs_pending
        },
        "commerce": {
            "total_deals": total_deals,
            "active_deals": active_deals,
            "pipeline_value": total_revenue
        },
        "finance": {
            "outstanding_ar": total_ar,
            "overdue_ar": overdue_ar,
            "ar_health": "critical" if overdue_ar > total_ar * 0.3 else "warning" if overdue_ar > total_ar * 0.15 else "healthy"
        },
        "workforce": {
            "total_people": total_people,
            "utilization": 82  # Would be calculated from actual allocation data
        },
        "operations": {
            "active_projects": active_projects,
            "on_track_percentage": 75  # Would be calculated from actual project data
        },
        "capital": {
            "total_funding_raised": total_funding,
            "runway_months": 18  # Would be calculated from burn rate
        },
        "key_metrics": key_metrics,
        "recent_activity": {
            "signals": recent_signals,
            "recommendations": recent_recommendations
        },
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

# ==================== DASHBOARD ====================

@router.get("/dashboard")
async def get_intelligence_dashboard(current_user: dict = Depends(get_current_user)):
    """Get comprehensive intelligence dashboard"""
    base_query = get_org_filter(current_user)
    
    signals_critical = await db.intel_signals.count_documents({**base_query, "severity": "critical", "acknowledged": False})
    signals_warning = await db.intel_signals.count_documents({**base_query, "severity": "warning", "acknowledged": False})
    
    risks_open = await db.intel_risks.count_documents({**base_query, "status": {"$in": ["open", "escalating"]}})
    risks_critical = await db.intel_risks.count_documents({**base_query, "status": {"$in": ["open", "escalating"]}, "risk_score": {"$gte": 7}})
    
    recs_pending = await db.intel_recommendations.count_documents({**base_query, "status": "pending"})
    recs_high_priority = await db.intel_recommendations.count_documents({**base_query, "status": "pending", "priority": {"$lte": 2}})
    
    recent_signals = await db.intel_signals.find(base_query, {"_id": 0}).sort("detected_at", -1).limit(5).to_list(5)
    recent_recommendations = await db.intel_recommendations.find({**base_query, "status": "pending"}, {"_id": 0}).sort("created_at", -1).limit(5).to_list(5)
    key_metrics = await db.intel_metrics.find(base_query, {"_id": 0, "history": 0}).sort("updated_at", -1).limit(8).to_list(8)
    
    return {
        "summary": {
            "signals": {
                "critical": signals_critical,
                "warning": signals_warning,
                "status": "critical" if signals_critical > 0 else "warning" if signals_warning > 3 else "healthy"
            },
            "risks": {
                "open": risks_open,
                "critical": risks_critical,
                "status": "critical" if risks_critical > 0 else "warning" if risks_open > 5 else "healthy"
            },
            "recommendations": {
                "pending": recs_pending,
                "high_priority": recs_high_priority,
                "status": "attention" if recs_high_priority > 0 else "normal"
            }
        },
        "recent_signals": recent_signals,
        "recent_recommendations": recent_recommendations,
        "key_metrics": key_metrics,
        "last_updated": datetime.now(timezone.utc).isoformat()
    }

# ==================== SEED DATA ====================

@router.post("/seed")
async def seed_intelligence_data(current_user: dict = Depends(get_current_user)):
    """Seed sample intelligence data for demo"""
    now = datetime.now(timezone.utc)
    org_id = current_user.get("org_id")
    
    # Clear existing data for this org
    await db.intel_signals.delete_many(get_org_filter(current_user))
    await db.intel_metrics.delete_many(get_org_filter(current_user))
    await db.intel_risks.delete_many(get_org_filter(current_user))
    await db.intel_forecasts.delete_many(get_org_filter(current_user))
    await db.intel_recommendations.delete_many(get_org_filter(current_user))
    
    # Sample signals
    signals = [
        {"source_solution": "commerce", "source_module": "revenue", "signal_type": "margin_erosion", "severity": "warning", "title": "Deal Margin Below Threshold", "description": "Deal #D-2341 has margin of 18%, below 20% threshold", "entity_reference": "D-2341", "entity_type": "deal"},
        {"source_solution": "operations", "source_module": "projects", "signal_type": "schedule_slip", "severity": "critical", "title": "Project Behind Schedule", "description": "Project Phoenix is 15 days behind milestone M3", "entity_reference": "PRJ-001", "entity_type": "project"},
        {"source_solution": "finance", "source_module": "receivables", "signal_type": "payment_overdue", "severity": "warning", "title": "Invoice Overdue", "description": "Invoice #INV-5621 overdue by 45 days, amount ₹12.5L", "entity_reference": "INV-5621", "entity_type": "invoice"},
        {"source_solution": "workforce", "source_module": "capacity", "signal_type": "over_allocation", "severity": "info", "title": "Resource Over-allocated", "description": "Priya Sharma allocated at 125% for next 2 weeks", "entity_reference": "EMP-089", "entity_type": "employee"},
        {"source_solution": "capital", "source_module": "treasury", "signal_type": "cash_stress", "severity": "critical", "title": "Cash Reserve Low", "description": "Cash reserves at 2.1 months runway, below 3 month threshold", "entity_reference": None, "entity_type": None},
    ]
    
    import random
    for s in signals:
        s["signal_id"] = generate_id("SIG")
        s["org_id"] = org_id
        s["detected_at"] = (now - timedelta(hours=random.randint(1, 72))).isoformat()
        s["acknowledged"] = False
        s["metadata"] = {}
        s["created_by"] = "seed"
    
    # Sample metrics
    metrics = [
        {"name": "Conversion Rate", "domain": "commercial", "value": 28.5, "unit": "%", "period": "monthly", "formula": "won_deals / total_leads * 100"},
        {"name": "Average Deal Size", "domain": "commercial", "value": 420000, "unit": "INR", "period": "monthly", "formula": "total_revenue / deal_count"},
        {"name": "Gross Margin", "domain": "commercial", "value": 35.2, "unit": "%", "period": "monthly", "formula": "(revenue - cogs) / revenue * 100"},
        {"name": "Delivery Variance", "domain": "operational", "value": -8.5, "unit": "%", "period": "weekly", "formula": "(actual - planned) / planned * 100"},
        {"name": "Utilization Rate", "domain": "operational", "value": 82, "unit": "%", "period": "weekly", "formula": "billable_hours / available_hours * 100"},
        {"name": "Burn Rate", "domain": "financial", "value": 8500000, "unit": "INR/month", "period": "monthly", "formula": "total_expenses / months"},
        {"name": "Cash Runway", "domain": "financial", "value": 18.5, "unit": "months", "period": "monthly", "formula": "cash_balance / burn_rate"},
        {"name": "AR Days", "domain": "financial", "value": 52, "unit": "days", "period": "monthly", "formula": "(receivables / revenue) * 365"},
        {"name": "Capacity Utilization", "domain": "workforce", "value": 87, "unit": "%", "period": "weekly", "formula": "allocated_hours / total_capacity * 100"},
        {"name": "Attrition Risk Index", "domain": "workforce", "value": 12, "unit": "%", "period": "quarterly", "formula": "at_risk_employees / total_employees * 100"},
        {"name": "Dilution Percentage", "domain": "capital", "value": 22.5, "unit": "%", "period": "quarterly", "formula": "shares_issued / total_shares * 100"},
        {"name": "Debt to Equity", "domain": "capital", "value": 0.35, "unit": "ratio", "period": "quarterly", "formula": "total_debt / total_equity"},
    ]
    
    for m in metrics:
        m["metric_id"] = generate_id("MET")
        m["org_id"] = org_id
        m["created_at"] = now.isoformat()
        m["updated_at"] = now.isoformat()
        m["confidence_level"] = 0.95
        m["history"] = []
    
    # Sample risks
    risks = [
        {"domain": "commercial", "risk_type": "revenue", "title": "Q4 Revenue Shortfall Risk", "description": "Pipeline coverage at 2.1x, below 3x threshold for Q4 target", "probability_score": 0.45, "impact_score": 8.0},
        {"domain": "operational", "risk_type": "delivery", "title": "Project Phoenix Delay Risk", "description": "Critical path dependencies at risk due to resource constraints", "probability_score": 0.65, "impact_score": 7.5},
        {"domain": "financial", "risk_type": "liquidity", "title": "Cash Flow Timing Risk", "description": "Large receivable collection timing may cause temporary cash stress", "probability_score": 0.35, "impact_score": 6.0},
        {"domain": "workforce", "risk_type": "workforce", "title": "Key Person Dependency", "description": "3 critical projects depend on single architect", "probability_score": 0.25, "impact_score": 9.0},
    ]
    
    for r in risks:
        r["risk_id"] = generate_id("RSK")
        r["org_id"] = org_id
        r["risk_score"] = round(r["probability_score"] * r["impact_score"], 2)
        r["status"] = "open"
        r["created_at"] = now.isoformat()
        r["updated_at"] = now.isoformat()
        r["affected_entities"] = []
        r["history"] = []
        r["created_by"] = "seed"
    
    # Sample forecasts
    forecasts = [
        {"domain": "financial", "metric_name": "Revenue", "horizon": "90d", "projected_value": 28500000, "confidence_lower": 25000000, "confidence_upper": 32000000, "assumptions": ["Current pipeline converts at historical rate", "No major deal slippage"]},
        {"domain": "financial", "metric_name": "Cash Runway", "horizon": "12m", "projected_value": 14, "confidence_lower": 11, "confidence_upper": 18, "assumptions": ["Current burn rate maintained", "No additional funding"]},
        {"domain": "operational", "metric_name": "Delivery On-Time Rate", "horizon": "30d", "projected_value": 78, "confidence_lower": 72, "confidence_upper": 85, "assumptions": ["Current resource allocation", "No scope changes"]},
    ]
    
    for f in forecasts:
        f["forecast_id"] = generate_id("FCT")
        f["org_id"] = org_id
        f["confidence_band"] = {"lower": f["confidence_lower"], "upper": f["confidence_upper"], "range": f["confidence_upper"] - f["confidence_lower"]}
        f["created_at"] = now.isoformat()
        f["status"] = "active"
        f["actual_value"] = None
        f["created_by"] = "seed"
    
    # Sample recommendations
    recommendations = [
        {"action_type": "review", "target_module": "commerce/deals", "title": "Review Low-Margin Deals", "explanation": "5 deals in pipeline have margins below 20%. Review pricing or scope to improve margins.", "risk_if_ignored": "Continued margin erosion impacting profitability", "confidence_score": 0.85, "priority": 2},
        {"action_type": "escalate", "target_module": "operations/projects", "title": "Escalate Project Phoenix", "explanation": "Project is 15 days behind with no recovery plan. Needs leadership attention.", "risk_if_ignored": "Potential customer penalty and reputation damage", "confidence_score": 0.92, "priority": 1},
        {"action_type": "accelerate", "target_module": "finance/collections", "title": "Accelerate Collections", "explanation": "AR days trending up. Accelerate collection on top 10 overdue invoices totaling ₹45L.", "risk_if_ignored": "Cash flow stress in next 30 days", "confidence_score": 0.78, "priority": 2},
        {"action_type": "investigate", "target_module": "workforce/attrition", "title": "Investigate Attrition Signals", "explanation": "3 senior engineers showing disengagement patterns. Early intervention recommended.", "risk_if_ignored": "Potential loss of critical talent", "confidence_score": 0.65, "priority": 3},
    ]
    
    for rec in recommendations:
        rec["recommendation_id"] = generate_id("REC")
        rec["org_id"] = org_id
        rec["status"] = "pending"
        rec["created_at"] = now.isoformat()
        rec["acted_on"] = False
        rec["ai_generated"] = False
        rec["created_by"] = "seed"
    
    # Insert all data
    if signals:
        await db.intel_signals.insert_many(signals)
    if metrics:
        await db.intel_metrics.insert_many(metrics)
    if risks:
        await db.intel_risks.insert_many(risks)
    if forecasts:
        await db.intel_forecasts.insert_many(forecasts)
    if recommendations:
        await db.intel_recommendations.insert_many(recommendations)
    
    return {
        "success": True,
        "seeded": {
            "signals": len(signals),
            "metrics": len(metrics),
            "risks": len(risks),
            "forecasts": len(forecasts),
            "recommendations": len(recommendations)
        }
    }

# ==================== LIVE DATA CONNECTORS ====================

@router.post("/connect/finance")
async def connect_finance_data(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Connect to Finance module and generate intelligence from live data"""
    org_id = current_user.get("org_id")
    signals_created = []
    recommendations_created = []
    metrics_updated = []
    
    # 1. Scan Receivables for Overdue Invoices
    overdue_receivables = await db.fin_receivables.find({
        "status": "overdue"
    }, {"_id": 0}).to_list(100)
    
    for rec in overdue_receivables:
        existing = await db.intel_signals.find_one({
            "entity_reference": rec.get("receivable_id"),
            "signal_type": "payment_overdue",
            "detected_at": {"$gte": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat()}
        })
        if not existing:
            amount = rec.get("amount", 0)
            severity = "critical" if amount > 500000 else "warning"
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "finance",
                "source_module": "receivables",
                "signal_type": "payment_overdue",
                "severity": severity,
                "entity_reference": rec.get("receivable_id"),
                "entity_type": "receivable",
                "title": f"Overdue Receivable: ₹{amount:,.0f}",
                "description": f"Receivable from {rec.get('customer_name', 'Customer')} is overdue. Days overdue: {rec.get('days_overdue', 0)}",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "finance_connector",
                "acknowledged": False,
                "metadata": {"amount": amount, "customer": rec.get("customer_name"), "days_overdue": rec.get("days_overdue")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
            
            # Auto-generate recommendation for high-value overdue
            if severity == "critical":
                rec_doc = {
                    "recommendation_id": generate_id("REC"),
                    "org_id": org_id,
                    "action_type": "escalate",
                    "target_module": "finance/receivables",
                    "target_entity_id": rec.get("receivable_id"),
                    "title": f"Escalate Collection: {rec.get('customer_name', 'Customer')}",
                    "explanation": f"High-value receivable (₹{amount:,.0f}) is overdue. Recommend immediate follow-up with customer.",
                    "risk_if_ignored": f"Potential bad debt exposure of ₹{amount:,.0f}",
                    "confidence_score": 0.9,
                    "priority": 1,
                    "status": "pending",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "created_by": "finance_connector",
                    "ai_generated": False,
                    "source_signal_id": signal["signal_id"]
                }
                await db.intel_recommendations.insert_one(rec_doc)
                recommendations_created.append(rec_doc["recommendation_id"])
    
    # 2. Scan Payables for Payment Due Soon
    upcoming_payables = await db.fin_payables.find({
        "status": "approved",
        "due_date": {"$lte": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for pay in upcoming_payables:
        existing = await db.intel_signals.find_one({
            "entity_reference": pay.get("payable_id"),
            "signal_type": "payment_due"
        })
        if not existing:
            amount = pay.get("amount", 0)
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "finance",
                "source_module": "payables",
                "signal_type": "payment_due",
                "severity": "info",
                "entity_reference": pay.get("payable_id"),
                "entity_type": "payable",
                "title": f"Payment Due: ₹{amount:,.0f} to {pay.get('vendor_name', 'Vendor')}",
                "description": f"Payment to {pay.get('vendor_name', 'Vendor')} due on {pay.get('due_date', 'N/A')}",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "finance_connector",
                "acknowledged": False,
                "metadata": {"amount": amount, "vendor": pay.get("vendor_name"), "due_date": pay.get("due_date")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # 3. Calculate and Update Finance Metrics
    total_receivables = await db.fin_receivables.find({"status": {"$in": ["open", "overdue"]}}, {"_id": 0, "amount": 1}).to_list(1000)
    total_ar = sum(r.get("amount", 0) for r in total_receivables)
    
    total_payables = await db.fin_payables.find({"status": {"$in": ["pending", "approved"]}}, {"_id": 0, "amount": 1}).to_list(1000)
    total_ap = sum(p.get("amount", 0) for p in total_payables)
    
    # Update AR metric
    ar_metric = await db.intel_metrics.find_one({"name": "Total AR", "org_id": org_id})
    if ar_metric:
        await db.intel_metrics.update_one(
            {"metric_id": ar_metric["metric_id"]},
            {"$set": {"value": total_ar, "updated_at": datetime.now(timezone.utc).isoformat()},
             "$push": {"history": {"$each": [{"value": ar_metric.get("value"), "recorded_at": ar_metric.get("updated_at")}], "$slice": -30}}}
        )
    else:
        await db.intel_metrics.insert_one({
            "metric_id": generate_id("MET"),
            "org_id": org_id,
            "name": "Total AR",
            "domain": "financial",
            "value": total_ar,
            "unit": "INR",
            "period": "current",
            "formula": "Sum of all open/overdue receivables",
            "confidence_level": 1.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "history": []
        })
    metrics_updated.append("Total AR")
    
    # Update AP metric
    ap_metric = await db.intel_metrics.find_one({"name": "Total AP", "org_id": org_id})
    if ap_metric:
        await db.intel_metrics.update_one(
            {"metric_id": ap_metric["metric_id"]},
            {"$set": {"value": total_ap, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.intel_metrics.insert_one({
            "metric_id": generate_id("MET"),
            "org_id": org_id,
            "name": "Total AP",
            "domain": "financial",
            "value": total_ap,
            "unit": "INR",
            "period": "current",
            "formula": "Sum of all pending/approved payables",
            "confidence_level": 1.0,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "history": []
        })
    metrics_updated.append("Total AP")
    
    # Broadcast updates
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "FINANCE_SYNC_COMPLETED",
            "signals_created": len(signals_created),
            "recommendations_created": len(recommendations_created),
            "metrics_updated": metrics_updated,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "success": True,
        "signals_created": len(signals_created),
        "recommendations_created": len(recommendations_created),
        "metrics_updated": metrics_updated,
        "source": "finance"
    }

@router.post("/connect/commerce")
async def connect_commerce_data(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Connect to Commerce module and generate intelligence from live data"""
    org_id = current_user.get("org_id")
    signals_created = []
    recommendations_created = []
    metrics_updated = []
    
    # 1. Scan Leads for Stale Leads
    stale_leads = await db.leads.find({
        "lead_status": {"$in": ["New", "Contacted"]},
        "created_at": {"$lt": (datetime.now(timezone.utc) - timedelta(days=14)).isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for lead in stale_leads:
        existing = await db.intel_signals.find_one({
            "entity_reference": lead.get("lead_id"),
            "signal_type": "stale_lead"
        })
        if not existing:
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "commerce",
                "source_module": "leads",
                "signal_type": "stale_lead",
                "severity": "warning",
                "entity_reference": lead.get("lead_id"),
                "entity_type": "lead",
                "title": f"Stale Lead: {lead.get('company', lead.get('lead_id'))}",
                "description": f"Lead from {lead.get('company', 'Unknown')} has been in {lead.get('lead_status', 'New')} status for over 14 days",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "commerce_connector",
                "acknowledged": False,
                "metadata": {"company": lead.get("company"), "status": lead.get("lead_status"), "owner": lead.get("lead_owner")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
    
    # 2. Scan Contracts Nearing Expiry
    expiring_contracts = await db.contracts.find({
        "status": "active",
        "end_date": {"$lte": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()}
    }, {"_id": 0}).to_list(100)
    
    for contract in expiring_contracts:
        existing = await db.intel_signals.find_one({
            "entity_reference": contract.get("contract_id"),
            "signal_type": "contract_expiring"
        })
        if not existing:
            value = contract.get("value", 0)
            severity = "critical" if value > 1000000 else "warning"
            signal = {
                "signal_id": generate_id("SIG"),
                "org_id": org_id,
                "source_solution": "commerce",
                "source_module": "contracts",
                "signal_type": "contract_expiring",
                "severity": severity,
                "entity_reference": contract.get("contract_id"),
                "entity_type": "contract",
                "title": f"Contract Expiring: {contract.get('customer_name', contract.get('contract_id'))}",
                "description": f"Contract worth ₹{value:,.0f} expires on {contract.get('end_date', 'N/A')}",
                "detected_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "commerce_connector",
                "acknowledged": False,
                "metadata": {"value": value, "customer": contract.get("customer_name"), "end_date": contract.get("end_date")}
            }
            await db.intel_signals.insert_one(signal)
            signals_created.append(signal["signal_id"])
            
            # Auto-generate recommendation for renewal
            rec_doc = {
                "recommendation_id": generate_id("REC"),
                "org_id": org_id,
                "action_type": "review",
                "target_module": "commerce/contracts",
                "target_entity_id": contract.get("contract_id"),
                "title": f"Initiate Renewal: {contract.get('customer_name', 'Customer')}",
                "explanation": f"Contract worth ₹{value:,.0f} is expiring within 30 days. Recommend initiating renewal discussions.",
                "risk_if_ignored": f"Potential revenue loss of ₹{value:,.0f} if contract not renewed",
                "confidence_score": 0.95,
                "priority": 2 if severity == "critical" else 3,
                "status": "pending",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "created_by": "commerce_connector",
                "ai_generated": False,
                "source_signal_id": signal["signal_id"]
            }
            await db.intel_recommendations.insert_one(rec_doc)
            recommendations_created.append(rec_doc["recommendation_id"])
    
    # 3. Scan Revenue Pipeline for Low Conversion
    total_leads = await db.leads.count_documents({})
    qualified_leads = await db.leads.count_documents({"lead_status": {"$in": ["Qualified", "Proposal Sent", "Negotiation"]}})
    converted_leads = await db.leads.count_documents({"lead_status": "Converted"})
    
    if total_leads > 0:
        conversion_rate = (converted_leads / total_leads) * 100
        qualification_rate = (qualified_leads / total_leads) * 100
        
        # Update Conversion Rate metric
        conv_metric = await db.intel_metrics.find_one({"name": "Lead Conversion Rate", "org_id": org_id})
        if conv_metric:
            await db.intel_metrics.update_one(
                {"metric_id": conv_metric["metric_id"]},
                {"$set": {"value": round(conversion_rate, 1), "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
        else:
            await db.intel_metrics.insert_one({
                "metric_id": generate_id("MET"),
                "org_id": org_id,
                "name": "Lead Conversion Rate",
                "domain": "commercial",
                "value": round(conversion_rate, 1),
                "unit": "%",
                "period": "all-time",
                "formula": "converted_leads / total_leads * 100",
                "confidence_level": 1.0,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat(),
                "history": []
            })
        metrics_updated.append("Lead Conversion Rate")
        
        # Check for low conversion rate
        if conversion_rate < 15:
            existing_risk = await db.intel_risks.find_one({
                "org_id": org_id,
                "title": {"$regex": "Lead Conversion.*Low"}
            })
            if not existing_risk:
                risk_doc = {
                    "risk_id": generate_id("RSK"),
                    "org_id": org_id,
                    "domain": "commercial",
                    "risk_type": "revenue",
                    "title": "Lead Conversion Rate Low",
                    "description": f"Current conversion rate of {conversion_rate:.1f}% is below 15% threshold",
                    "probability_score": 0.7,
                    "impact_score": 6.0,
                    "risk_score": 4.2,
                    "status": "open",
                    "created_at": datetime.now(timezone.utc).isoformat(),
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "created_by": "commerce_connector",
                    "affected_entities": [],
                    "history": []
                }
                await db.intel_risks.insert_one(risk_doc)
    
    # 4. Calculate Pipeline Value
    active_leads = await db.leads.find({"lead_status": {"$in": ["Qualified", "Proposal Sent", "Negotiation"]}}, {"_id": 0, "annual_revenue": 1}).to_list(1000)
    pipeline_value = sum(l.get("annual_revenue", 0) for l in active_leads)
    
    pipeline_metric = await db.intel_metrics.find_one({"name": "Pipeline Value", "org_id": org_id})
    if pipeline_metric:
        await db.intel_metrics.update_one(
            {"metric_id": pipeline_metric["metric_id"]},
            {"$set": {"value": pipeline_value, "updated_at": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        await db.intel_metrics.insert_one({
            "metric_id": generate_id("MET"),
            "org_id": org_id,
            "name": "Pipeline Value",
            "domain": "commercial",
            "value": pipeline_value,
            "unit": "INR",
            "period": "current",
            "formula": "Sum of expected revenue from qualified leads",
            "confidence_level": 0.8,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "history": []
        })
    metrics_updated.append("Pipeline Value")
    
    # Broadcast updates
    if org_id:
        background_tasks.add_task(ws_manager.broadcast_to_org, org_id, {
            "type": "COMMERCE_SYNC_COMPLETED",
            "signals_created": len(signals_created),
            "recommendations_created": len(recommendations_created),
            "metrics_updated": metrics_updated,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    
    return {
        "success": True,
        "signals_created": len(signals_created),
        "recommendations_created": len(recommendations_created),
        "metrics_updated": metrics_updated,
        "source": "commerce"
    }

@router.post("/connect/all")
async def connect_all_live_data(
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(get_current_user)
):
    """Connect to all modules and sync intelligence data"""
    results = {
        "finance": None,
        "commerce": None,
        "total_signals": 0,
        "total_recommendations": 0,
        "total_metrics": []
    }
    
    # Finance sync
    try:
        finance_result = await connect_finance_data(background_tasks, current_user)
        results["finance"] = finance_result
        results["total_signals"] += finance_result.get("signals_created", 0)
        results["total_recommendations"] += finance_result.get("recommendations_created", 0)
        results["total_metrics"].extend(finance_result.get("metrics_updated", []))
    except Exception as e:
        results["finance"] = {"error": str(e)}
    
    # Commerce sync
    try:
        commerce_result = await connect_commerce_data(background_tasks, current_user)
        results["commerce"] = commerce_result
        results["total_signals"] += commerce_result.get("signals_created", 0)
        results["total_recommendations"] += commerce_result.get("recommendations_created", 0)
        results["total_metrics"].extend(commerce_result.get("metrics_updated", []))
    except Exception as e:
        results["commerce"] = {"error": str(e)}
    
    return {
        "success": True,
        "results": results,
        "summary": {
            "total_signals_created": results["total_signals"],
            "total_recommendations_created": results["total_recommendations"],
            "metrics_updated": list(set(results["total_metrics"]))
        }
    }
