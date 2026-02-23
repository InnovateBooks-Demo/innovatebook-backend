"""
WebRTC Signaling Routes for Audio/Video Calls
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
import json
import logging
from datetime import datetime, timezone
import uuid
import jwt

router = APIRouter(prefix="/api/webrtc", tags=["WebRTC"])

logger = logging.getLogger(__name__)

from workspace_routes import JWT_SECRET, JWT_ALGORITHM

# Store active WebRTC connections
webrtc_connections = {}  # user_id -> WebSocket
active_calls = {}        # call_id -> dict


class CallManager:
    @staticmethod
    async def create_call(caller_id: str, callee_id: str, call_type: str):
        call_id = str(uuid.uuid4())
        active_calls[call_id] = {
            "id": call_id,
            "caller_id": caller_id,
            "callee_id": callee_id,
            "type": call_type,
            "status": "ringing",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        return call_id

    @staticmethod
    async def end_call(call_id: str):
        if call_id in active_calls:
            del active_calls[call_id]

    @staticmethod
    def get_call(call_id: str):
        return active_calls.get(call_id)


call_manager = CallManager()


@router.websocket("/ws/{user_id}")
async def webrtc_websocket(websocket: WebSocket, user_id: str, token: str = Query(None)):
    """
    WebRTC signaling WebSocket endpoint
    Requires token query param: ?token=...
    """
    logger.info(f"WebRTC WS attempt for user_id={user_id} token_present={bool(token)}")
    
    if not token:
        logger.warning(f"WebRTC WS rejected: No token for user_id={user_id}")
        await websocket.close(code=1008)
        return

    # Decode token manually (exactly like workspace_routes.py)
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception as e:
        logger.warning(f"WebRTC WS rejected: Invalid token for user_id={user_id} err={e}")
        await websocket.close(code=1008)
        return

    token_user_id = payload.get("user_id") or payload.get("sub")
    if not token_user_id:
        logger.warning(f"WebRTC WS rejected: Missing user_id in token for user_id={user_id}")
        await websocket.close(code=1008)
        return

    if str(token_user_id) != str(user_id):
        logger.warning(f"WebRTC WS rejected: User mismatch path={user_id} token={token_user_id}")
        await websocket.close(code=1008)
        return

    # Only after validation do we accept the connection
    await websocket.accept()

    # Replace existing connection if any (important for refresh / multiple tabs)
    if user_id in webrtc_connections:
        old_ws = webrtc_connections[user_id]
        if old_ws != websocket:
            try:
                await old_ws.close(code=1000)
            except:
                pass

    webrtc_connections[user_id] = websocket
    logger.info(f"WebRTC connection established for user {user_id}")

    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            await handle_signaling_message(user_id, message)

    except WebSocketDisconnect:
        logger.info(f"WebRTC connection closed for user {user_id}")
    except Exception as e:
        logger.error(f"WebRTC error for user {user_id}: {e}")
    finally:
        # Cleanup connection safely - only delete if it's the SAME websocket instance
        if webrtc_connections.get(user_id) is websocket:
            del webrtc_connections[user_id]


async def handle_signaling_message(user_id: str, message: dict):
    message_type = message.get("type")

    if message_type == "call-offer":
        callee_id = message.get("to")
        call_type = message.get("callType", "audio")
        offer = message.get("offer")

        call_id = await call_manager.create_call(user_id, callee_id, call_type)

        # Send offer to callee
        if callee_id in webrtc_connections:
            await webrtc_connections[callee_id].send_json({
                "type": "incoming-call",
                "callId": call_id,
                "from": user_id,
                "callType": call_type,
                "offer": offer,
            })
        else:
            # Callee offline
            if user_id in webrtc_connections:
                await webrtc_connections[user_id].send_json({
                    "type": "call-failed",
                    "reason": "User is offline",
                })

    elif message_type == "call-answer":
        call_id = message.get("callId")
        caller_id = message.get("to")
        answer = message.get("answer")

        call = call_manager.get_call(call_id)
        if call:
            call["status"] = "active"

        if caller_id in webrtc_connections:
            await webrtc_connections[caller_id].send_json({
                "type": "call-answered",
                "callId": call_id,
                "answer": answer,
            })

    elif message_type == "ice-candidate":
        target_id = message.get("to")
        candidate = message.get("candidate")

        if target_id in webrtc_connections:
            await webrtc_connections[target_id].send_json({
                "type": "ice-candidate",
                "from": user_id,
                "candidate": candidate,
            })

    elif message_type == "call-reject":
        call_id = message.get("callId")
        caller_id = message.get("to")

        await call_manager.end_call(call_id)

        if caller_id in webrtc_connections:
            await webrtc_connections[caller_id].send_json({
                "type": "call-rejected",
                "callId": call_id,
            })

    elif message_type == "call-end":
        call_id = message.get("callId")
        target_id = message.get("to")

        await call_manager.end_call(call_id)

        if target_id in webrtc_connections:
            await webrtc_connections[target_id].send_json({
                "type": "call-ended",
                "callId": call_id,
            })


@router.get("/active-calls")
async def get_active_calls():
    return {"calls": list(active_calls.values())}