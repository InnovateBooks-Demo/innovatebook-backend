"""
WebRTC Signaling Routes for Audio/Video Calls
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, Set
import json
import logging
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/api/webrtc", tags=["WebRTC"])

# Import dependencies
from app_state import get_database

# Store active WebRTC connections
webrtc_connections: Dict[str, WebSocket] = {}
active_calls: Dict[str, dict] = {}

logger = logging.getLogger(__name__)

class CallManager:
    """Manage active calls and signaling"""
    
    @staticmethod
    async def create_call(caller_id: str, callee_id: str, call_type: str):
        """Create a new call"""
        call_id = str(uuid.uuid4())
        active_calls[call_id] = {
            "id": call_id,
            "caller_id": caller_id,
            "callee_id": callee_id,
            "type": call_type,
            "status": "ringing",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        return call_id
    
    @staticmethod
    async def end_call(call_id: str):
        """End an active call"""
        if call_id in active_calls:
            del active_calls[call_id]
    
    @staticmethod
    def get_call(call_id: str):
        """Get call details"""
        return active_calls.get(call_id)

call_manager = CallManager()

@router.websocket("/ws/{user_id}")
async def webrtc_websocket(websocket: WebSocket, user_id: str):
    """WebRTC signaling WebSocket endpoint"""
    await websocket.accept()
    webrtc_connections[user_id] = websocket
    
    logger.info(f"WebRTC connection established for user {user_id}")
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            await handle_signaling_message(user_id, message)
            
    except WebSocketDisconnect:
        logger.info(f"WebRTC connection closed for user {user_id}")
        if user_id in webrtc_connections:
            del webrtc_connections[user_id]
    except Exception as e:
        logger.error(f"WebRTC error for user {user_id}: {e}")
        if user_id in webrtc_connections:
            del webrtc_connections[user_id]

async def handle_signaling_message(user_id: str, message: dict):
    """Handle WebRTC signaling messages"""
    message_type = message.get("type")
    
    if message_type == "call-offer":
        # User is initiating a call
        callee_id = message.get("to")
        call_type = message.get("callType", "audio")
        offer = message.get("offer")
        
        # Create call record
        call_id = await call_manager.create_call(user_id, callee_id, call_type)
        
        # Send offer to callee
        if callee_id in webrtc_connections:
            await webrtc_connections[callee_id].send_json({
                "type": "incoming-call",
                "callId": call_id,
                "from": user_id,
                "callType": call_type,
                "offer": offer
            })
            logger.info(f"Call offer sent from {user_id} to {callee_id}")
        else:
            # Callee is offline
            if user_id in webrtc_connections:
                await webrtc_connections[user_id].send_json({
                    "type": "call-failed",
                    "reason": "User is offline"
                })
    
    elif message_type == "call-answer":
        # User is answering a call
        call_id = message.get("callId")
        caller_id = message.get("to")
        answer = message.get("answer")
        
        call = call_manager.get_call(call_id)
        if call:
            call["status"] = "active"
        
        # Send answer to caller
        if caller_id in webrtc_connections:
            await webrtc_connections[caller_id].send_json({
                "type": "call-answered",
                "callId": call_id,
                "answer": answer
            })
            logger.info(f"Call answered: {call_id}")
    
    elif message_type == "ice-candidate":
        # ICE candidate exchange
        target_id = message.get("to")
        candidate = message.get("candidate")
        
        if target_id in webrtc_connections:
            await webrtc_connections[target_id].send_json({
                "type": "ice-candidate",
                "from": user_id,
                "candidate": candidate
            })
    
    elif message_type == "call-reject":
        # User rejected the call
        call_id = message.get("callId")
        caller_id = message.get("to")
        
        await call_manager.end_call(call_id)
        
        if caller_id in webrtc_connections:
            await webrtc_connections[caller_id].send_json({
                "type": "call-rejected",
                "callId": call_id
            })
            logger.info(f"Call rejected: {call_id}")
    
    elif message_type == "call-end":
        # End call
        call_id = message.get("callId")
        target_id = message.get("to")
        
        await call_manager.end_call(call_id)
        
        if target_id in webrtc_connections:
            await webrtc_connections[target_id].send_json({
                "type": "call-ended",
                "callId": call_id
            })
            logger.info(f"Call ended: {call_id}")

@router.get("/active-calls")
async def get_active_calls():
    """Get list of active calls"""
    return {"calls": list(active_calls.values())}
