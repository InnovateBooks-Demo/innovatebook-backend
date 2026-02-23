from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File, Query
from typing import List, Dict, Optional
from datetime import datetime, timezone
import uuid
import os

from jose import jwt, JWTError
from motor.motor_asyncio import AsyncIOMotorDatabase

from auth_models import User
from chat_models import (
    Channel, ChannelCreate, ChannelType,
    Message, MessageCreate, Reaction,
    UserPresence, UserStatus,
    WSMessage, WSMessageType
)
from main import get_database, get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

# ✅ JWT settings for WS auth (match your token generator settings)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", os.getenv("SECRET_KEY", "change-me"))
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


# =======================
# WebSocket Connection Manager
# =======================
class ConnectionManager:
    def __init__(self):
        # ✅ channel_id -> { user_id: websocket }
        self.active_connections: Dict[str, Dict[str, WebSocket]] = {}
        # ✅ user_id -> websocket
        self.user_connections: Dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.user_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        # remove from user map
        if user_id in self.user_connections:
            del self.user_connections[user_id]

        # remove from all channels
        for channel_id, conns in list(self.active_connections.items()):
            conns.pop(user_id, None)
            if not conns:
                self.active_connections.pop(channel_id, None)

    async def join_channel(self, channel_id: str, user_id: str):
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = {}
        ws = self.user_connections.get(user_id)
        if ws:
            self.active_connections[channel_id][user_id] = ws

    async def leave_channel(self, channel_id: str, user_id: str):
        if channel_id in self.active_connections:
            self.active_connections[channel_id].pop(user_id, None)
            if not self.active_connections[channel_id]:
                self.active_connections.pop(channel_id, None)

    async def broadcast_to_channel(self, channel_id: str, message: dict):
        conns = self.active_connections.get(channel_id, {})
        dead = []
        for uid, ws in conns.items():
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(uid)

        for uid in dead:
            conns.pop(uid, None)

        if channel_id in self.active_connections and not self.active_connections[channel_id]:
            self.active_connections.pop(channel_id, None)

    async def send_to_user(self, user_id: str, message: dict):
        ws = self.user_connections.get(user_id)
        if not ws:
            return
        try:
            await ws.send_json(message)
        except Exception:
            # cleanup dead connection
            self.disconnect(user_id)


manager = ConnectionManager()


# =======================
# Helper function to check channel membership
# =======================
async def check_channel_membership(db: AsyncIOMotorDatabase, channel_id: str, user_id: str) -> bool:
    channel = await db.channels.find_one({"_id": channel_id})
    if not channel:
        return False
    return user_id in channel.get("members", [])


# =======================
# CHANNEL ROUTES
# =======================
@router.post("/channels", response_model=Channel)
async def create_channel(
    channel_data: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    channel_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    members = list(set([current_user.id] + channel_data.members))

    channel_doc = {
        "_id": channel_id,
        "name": channel_data.name,
        "description": channel_data.description,
        "type": channel_data.type,
        "creator_id": current_user.id,
        "members": members,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

    await db.channels.insert_one(channel_doc)

    channel_doc["id"] = channel_doc.pop("_id")
    channel_doc["created_at"] = now
    channel_doc["updated_at"] = now

    return Channel(**channel_doc)


@router.get("/channels", response_model=List[Channel])
async def get_user_channels(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    channels = await db.channels.find({"members": current_user.id}).to_list(length=None)

    result = []
    for ch in channels:
        ch["id"] = ch.pop("_id")
        ch["created_at"] = datetime.fromisoformat(ch["created_at"])
        ch["updated_at"] = datetime.fromisoformat(ch["updated_at"])
        result.append(Channel(**ch))

    return result


@router.get("/channels/{channel_id}/messages", response_model=List[Message])
async def get_channel_messages(
    channel_id: str,
    limit: int = 50,
    before: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not await check_channel_membership(db, channel_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    query = {"channel_id": channel_id}
    if before:
        query["created_at"] = {"$lt": before}

    messages = await db.messages.find(query).sort("created_at", -1).limit(limit).to_list(length=None)

    result = []
    for msg in messages:
        msg["id"] = msg.pop("_id")
        msg["created_at"] = datetime.fromisoformat(msg["created_at"])
        msg["updated_at"] = datetime.fromisoformat(msg["updated_at"])
        result.append(Message(**msg))

    return list(reversed(result))


# =======================
# MESSAGE ROUTES
# =======================
@router.post("/messages", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    if not await check_channel_membership(db, message_data.channel_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    message_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    message_doc = {
        "_id": message_id,
        "channel_id": message_data.channel_id,
        "user_id": current_user.id,
        "user_name": current_user.full_name,
        "user_avatar": None,
        "content": message_data.content,
        "type": message_data.type,
        "parent_id": message_data.parent_id,
        "mentions": message_data.mentions,
        "reactions": [],
        "file_url": message_data.file_url,
        "file_name": message_data.file_name,
        "edited": False,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }

    await db.messages.insert_one(message_doc)

    message_doc["id"] = message_doc.pop("_id")
    message_doc["created_at"] = now
    message_doc["updated_at"] = now

    ws_message = {
        "type": WSMessageType.NEW_MESSAGE,
        "data": message_doc,
        "timestamp": now.isoformat()
    }

    await manager.broadcast_to_channel(message_data.channel_id, ws_message)

    return Message(**message_doc)


@router.post("/messages/{message_id}/reactions")
async def add_reaction(
    message_id: str,
    emoji: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")

    reactions = message.get("reactions", [])

    reaction_found = False
    for reaction in reactions:
        if reaction["emoji"] == emoji:
            if current_user.id not in reaction["user_ids"]:
                reaction["user_ids"].append(current_user.id)
                reaction["count"] = len(reaction["user_ids"])
            reaction_found = True
            break

    if not reaction_found:
        reactions.append({
            "emoji": emoji,
            "user_ids": [current_user.id],
            "count": 1
        })

    await db.messages.update_one({"_id": message_id}, {"$set": {"reactions": reactions}})

    ws_message = {
        "type": WSMessageType.REACTION_ADDED,
        "data": {"message_id": message_id, "emoji": emoji, "user_id": current_user.id},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await manager.broadcast_to_channel(message["channel_id"], ws_message)

    return {"success": True}


@router.put("/messages/{message_id}")
async def edit_message(
    message_id: str,
    content: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Can only edit your own messages")

    now = datetime.now(timezone.utc)
    await db.messages.update_one(
        {"_id": message_id},
        {"$set": {"content": content, "edited": True, "updated_at": now.isoformat()}}
    )

    ws_message = {
        "type": WSMessageType.MESSAGE_UPDATED,
        "data": {"message_id": message_id, "content": content, "edited": True},
        "timestamp": now.isoformat()
    }

    await manager.broadcast_to_channel(message["channel_id"], ws_message)

    return {"success": True}


@router.delete("/messages/{message_id}")
async def delete_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")

    if message["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Can only delete your own messages")

    await db.messages.delete_one({"_id": message_id})

    ws_message = {
        "type": WSMessageType.MESSAGE_DELETED,
        "data": {"message_id": message_id},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await manager.broadcast_to_channel(message["channel_id"], ws_message)
    return {"success": True}


# =======================
# FILE UPLOAD
# =======================
@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    channel_id: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    upload_dir = "/app/backend/uploads/chat"
    os.makedirs(upload_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)

    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)

    file_metadata = {
        "_id": str(uuid.uuid4()),
        "filename": file.filename,
        "stored_filename": unique_filename,
        "file_path": file_path,
        "file_size": len(content),
        "content_type": file.content_type,
        "uploaded_by": current_user.id,
        "channel_id": channel_id,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }

    await db.chat_files.insert_one(file_metadata)

    return {
        "file_id": file_metadata["_id"],
        "filename": file.filename,
        "file_url": f"/api/chat/files/{file_metadata['_id']}",
        "file_size": file_metadata["file_size"],
        "content_type": file.content_type
    }


@router.get("/files/{file_id}")
async def get_file(
    file_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    from fastapi.responses import FileResponse

    file_metadata = await db.chat_files.find_one({"_id": file_id})
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")

    if file_metadata.get("channel_id"):
        has_access = await check_channel_membership(db, file_metadata["channel_id"], current_user.id)
        if not has_access:
            raise HTTPException(status_code=403, detail="Access denied")

    return FileResponse(
        file_metadata["file_path"],
        filename=file_metadata["filename"],
        media_type=file_metadata.get("content_type", "application/octet-stream")
    )


# =======================
# WEBRTC SIGNALING (HTTP -> WS forward)
# =======================
@router.post("/call/initiate")
async def initiate_call(
    recipient_id: str,
    call_type: str,
    channel_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    call_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)

    call_data = {
        "_id": call_id,
        "caller_id": current_user.id,
        "caller_name": current_user.full_name,
        "recipient_id": recipient_id,
        "call_type": call_type,
        "channel_id": channel_id,
        "status": "ringing",
        "started_at": now.isoformat(),
        "ended_at": None
    }

    await db.calls.insert_one(call_data)

    ws_message = {
        "type": "call_invitation",
        "data": {
            "call_id": call_id,
            "caller_id": current_user.id,
            "caller_name": current_user.full_name,
            "call_type": call_type,
            "channel_id": channel_id
        },
        "timestamp": now.isoformat()
    }

    await manager.send_to_user(recipient_id, ws_message)

    return {"call_id": call_id, "status": "ringing"}


@router.post("/call/{call_id}/answer")
async def answer_call(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    await db.calls.update_one({"_id": call_id}, {"$set": {"status": "active"}})

    ws_message = {
        "type": "call_answered",
        "data": {"call_id": call_id},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await manager.send_to_user(call["caller_id"], ws_message)

    return {"success": True}


@router.post("/call/{call_id}/reject")
async def reject_call(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    now = datetime.now(timezone.utc)
    await db.calls.update_one({"_id": call_id}, {"$set": {"status": "rejected", "ended_at": now.isoformat()}})

    ws_message = {
        "type": "call_rejected",
        "data": {"call_id": call_id},
        "timestamp": now.isoformat()
    }

    await manager.send_to_user(call["caller_id"], ws_message)

    return {"success": True}


@router.post("/call/{call_id}/end")
async def end_call(
    call_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if call["caller_id"] != current_user.id and call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    now = datetime.now(timezone.utc)
    await db.calls.update_one({"_id": call_id}, {"$set": {"status": "ended", "ended_at": now.isoformat()}})

    other_user_id = call["recipient_id"] if current_user.id == call["caller_id"] else call["caller_id"]
    ws_message = {
        "type": "call_ended",
        "data": {"call_id": call_id},
        "timestamp": now.isoformat()
    }

    await manager.send_to_user(other_user_id, ws_message)

    return {"success": True}


@router.post("/call/{call_id}/signal")
async def send_webrtc_signal(
    call_id: str,
    signal: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")

    if call["caller_id"] != current_user.id and call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    other_user_id = call["recipient_id"] if current_user.id == call["caller_id"] else call["caller_id"]

    ws_message = {
        "type": "webrtc_signal",
        "data": {
            "call_id": call_id,
            "signal": signal,
            "from_user_id": current_user.id
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    await manager.send_to_user(other_user_id, ws_message)

    return {"success": True}
