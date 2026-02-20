from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException, Depends, UploadFile, File
from typing import List, Dict, Set, Optional
from datetime import datetime, timezone
import uuid
import json
from motor.motor_asyncio import AsyncIOMotorDatabase
from auth_models import User
from chat_models import (
    Channel, ChannelCreate, ChannelType,
    Message, MessageCreate, MessageType, Reaction,
    UserPresence, UserStatus,
    WSMessage, WSMessageType
)
from server import get_database, get_current_user
import os

router = APIRouter(prefix="/api/chat", tags=["chat"])

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, Set[WebSocket]] = {}  # channel_id -> Set of websockets
        self.user_connections: Dict[str, WebSocket] = {}  # user_id -> websocket
        
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.user_connections[user_id] = websocket
        
    def disconnect(self, user_id: str):
        if user_id in self.user_connections:
            del self.user_connections[user_id]
            
    async def join_channel(self, channel_id: str, user_id: str):
        if channel_id not in self.active_connections:
            self.active_connections[channel_id] = set()
        if user_id in self.user_connections:
            self.active_connections[channel_id].add(self.user_connections[user_id])
            
    async def leave_channel(self, channel_id: str, user_id: str):
        if channel_id in self.active_connections and user_id in self.user_connections:
            ws = self.user_connections[user_id]
            self.active_connections[channel_id].discard(ws)
            
    async def broadcast_to_channel(self, channel_id: str, message: dict):
        if channel_id in self.active_connections:
            for connection in self.active_connections[channel_id]:
                try:
                    await connection.send_json(message)
                except:
                    pass
                    
    async def send_to_user(self, user_id: str, message: dict):
        if user_id in self.user_connections:
            try:
                await self.user_connections[user_id].send_json(message)
            except:
                pass

manager = ConnectionManager()

# Helper function to check channel membership
async def check_channel_membership(db: AsyncIOMotorDatabase, channel_id: str, user_id: str) -> bool:
    channel = await db.channels.find_one({"_id": channel_id})
    if not channel:
        return False
    return user_id in channel.get("members", [])

# ============= CHANNEL ROUTES =============

@router.post("/channels", response_model=Channel)
async def create_channel(
    channel_data: ChannelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new channel (public/private/group)"""
    channel_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    # Add creator to members
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
    
    # Return without _id field
    channel_doc["id"] = channel_doc.pop("_id")
    channel_doc["created_at"] = now
    channel_doc["updated_at"] = now
    
    return Channel(**channel_doc)

@router.get("/channels", response_model=List[Channel])
async def get_user_channels(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all channels user is a member of"""
    channels = await db.channels.find({
        "members": current_user.id
    }).to_list(length=None)
    
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
    """Get messages from a channel"""
    # Check membership
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

# ============= MESSAGE ROUTES =============

@router.post("/messages", response_model=Message)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Send a message to a channel"""
    # Check membership
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
    
    # Broadcast to channel via WebSocket
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
    """Add reaction to a message"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    # Update reactions
    reactions = message.get("reactions", [])
    
    # Find existing reaction with this emoji
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
    
    await db.messages.update_one(
        {"_id": message_id},
        {"$set": {"reactions": reactions}}
    )
    
    # Broadcast reaction added
    ws_message = {
        "type": WSMessageType.REACTION_ADDED,
        "data": {
            "message_id": message_id,
            "emoji": emoji,
            "user_id": current_user.id
        },
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
    """Edit a message"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Can only edit your own messages")
    
    now = datetime.now(timezone.utc)
    await db.messages.update_one(
        {"_id": message_id},
        {"$set": {
            "content": content,
            "edited": True,
            "updated_at": now.isoformat()
        }}
    )
    
    # Broadcast update
    ws_message = {
        "type": WSMessageType.MESSAGE_UPDATED,
        "data": {
            "message_id": message_id,
            "content": content,
            "edited": True
        },
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
    """Delete a message"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message["user_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Can only delete your own messages")
    
    await db.messages.delete_one({"_id": message_id})
    
    # Broadcast deletion
    ws_message = {
        "type": WSMessageType.MESSAGE_DELETED,
        "data": {"message_id": message_id},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await manager.broadcast_to_channel(message["channel_id"], ws_message)
    
    return {"success": True}

# ============= WEBSOCKET =============

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    """WebSocket endpoint for real-time messaging"""
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            data = await websocket.receive_json()
            
            # Handle different message types
            if data.get("type") == "join_channel":
                await manager.join_channel(data["channel_id"], user_id)
                
            elif data.get("type") == "leave_channel":
                await manager.leave_channel(data["channel_id"], user_id)
                
            elif data.get("type") == "typing":
                # Broadcast typing indicator
                ws_message = {
                    "type": WSMessageType.USER_TYPING,
                    "data": {
                        "user_id": user_id,
                        "channel_id": data["channel_id"]
                    },
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }
                await manager.broadcast_to_channel(data["channel_id"], ws_message)
                
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# ============= SEARCH =============

@router.get("/search")
async def search_messages(
    q: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Search messages across all channels user has access to"""
    # Get user's channels
    user_channels = await db.channels.find({
        "members": current_user.id
    }).to_list(length=None)
    
    channel_ids = [ch["_id"] for ch in user_channels]
    
    # Search messages
    messages = await db.messages.find({
        "channel_id": {"$in": channel_ids},
        "content": {"$regex": q, "$options": "i"}
    }).limit(50).to_list(length=None)
    
    result = []
    for msg in messages:
        msg["id"] = msg.pop("_id")
        msg["created_at"] = datetime.fromisoformat(msg["created_at"])
        msg["updated_at"] = datetime.fromisoformat(msg["updated_at"])
        result.append(Message(**msg))
    
    return result

# ============= FILE UPLOAD =============

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    channel_id: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Upload a file for chat"""
    # Create uploads directory if not exists
    upload_dir = "/app/backend/uploads/chat"
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Store metadata in database
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
    """Get file by ID"""
    from fastapi.responses import FileResponse
    
    file_metadata = await db.chat_files.find_one({"_id": file_id})
    if not file_metadata:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if user has access to the channel
    if file_metadata.get("channel_id"):
        has_access = await check_channel_membership(db, file_metadata["channel_id"], current_user.id)
        if not has_access:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return FileResponse(
        file_metadata["file_path"],
        filename=file_metadata["filename"],
        media_type=file_metadata.get("content_type", "application/octet-stream")
    )

# ============= USER PROFILES =============

@router.get("/users/{user_id}/profile")
async def get_user_profile(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get user profile for chat"""
    from auth_models import User as UserModel
    
    user = await db.users.find_one({"_id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user presence
    presence = await db.user_presence.find_one({"user_id": user_id})
    
    return {
        "id": user["_id"],
        "full_name": user.get("full_name", "Unknown User"),
        "email": user.get("email", ""),
        "avatar_url": user.get("avatar_url"),
        "status": presence.get("status", "offline") if presence else "offline",
        "status_text": presence.get("status_text") if presence else None,
        "last_seen": presence.get("last_seen") if presence else None
    }

# ============= THREADED CONVERSATIONS =============

@router.get("/messages/{message_id}/replies", response_model=List[Message])
async def get_message_replies(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all replies to a message (thread)"""
    # Get parent message to check channel membership
    parent_message = await db.messages.find_one({"_id": message_id})
    if not parent_message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, parent_message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    # Get all replies
    replies = await db.messages.find({
        "parent_id": message_id
    }).sort("created_at", 1).to_list(length=None)
    
    result = []
    for msg in replies:
        msg["id"] = msg.pop("_id")
        msg["created_at"] = datetime.fromisoformat(msg["created_at"])
        msg["updated_at"] = datetime.fromisoformat(msg["updated_at"])
        result.append(Message(**msg))
    
    return result

@router.get("/messages/{message_id}/reply-count")
async def get_reply_count(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get count of replies to a message"""
    count = await db.messages.count_documents({"parent_id": message_id})
    return {"count": count}

# ============= READ RECEIPTS =============

@router.post("/messages/{message_id}/mark-read")
async def mark_message_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark a message as read"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    now = datetime.now(timezone.utc)
    
    # Store read receipt
    read_receipt = {
        "_id": str(uuid.uuid4()),
        "message_id": message_id,
        "user_id": current_user.id,
        "read_at": now.isoformat()
    }
    
    await db.read_receipts.update_one(
        {"message_id": message_id, "user_id": current_user.id},
        {"$set": read_receipt},
        upsert=True
    )
    
    # Broadcast read receipt
    ws_message = {
        "type": "read_receipt",
        "data": {
            "message_id": message_id,
            "user_id": current_user.id,
            "read_at": now.isoformat()
        },
        "timestamp": now.isoformat()
    }
    
    await manager.broadcast_to_channel(message["channel_id"], ws_message)
    
    return {"success": True}

@router.get("/messages/{message_id}/read-by")
async def get_message_read_by(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get list of users who read this message"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    read_receipts = await db.read_receipts.find({"message_id": message_id}).to_list(length=None)
    
    result = []
    for receipt in read_receipts:
        user = await db.users.find_one({"_id": receipt["user_id"]})
        if user:
            result.append({
                "user_id": user["_id"],
                "user_name": user.get("full_name", "Unknown User"),
                "read_at": receipt["read_at"]
            })
    
    return result

# ============= MESSAGE PINNING =============

@router.post("/messages/{message_id}/pin")
async def pin_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Pin a message to channel"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    now = datetime.now(timezone.utc)
    
    # Add to pinned messages
    pinned_msg = {
        "_id": str(uuid.uuid4()),
        "message_id": message_id,
        "channel_id": message["channel_id"],
        "pinned_by": current_user.id,
        "pinned_at": now.isoformat()
    }
    
    await db.pinned_messages.insert_one(pinned_msg)
    
    # Broadcast pin event
    ws_message = {
        "type": "message_pinned",
        "data": {
            "message_id": message_id,
            "pinned_by": current_user.id
        },
        "timestamp": now.isoformat()
    }
    
    await manager.broadcast_to_channel(message["channel_id"], ws_message)
    
    return {"success": True}

@router.delete("/messages/{message_id}/unpin")
async def unpin_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Unpin a message from channel"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    await db.pinned_messages.delete_one({"message_id": message_id})
    
    # Broadcast unpin event
    ws_message = {
        "type": "message_unpinned",
        "data": {"message_id": message_id},
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await manager.broadcast_to_channel(message["channel_id"], ws_message)
    
    return {"success": True}

@router.get("/channels/{channel_id}/pinned")
async def get_pinned_messages(
    channel_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all pinned messages in a channel"""
    # Check channel membership
    if not await check_channel_membership(db, channel_id, current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    pinned = await db.pinned_messages.find({"channel_id": channel_id}).to_list(length=None)
    
    result = []
    for pin in pinned:
        message = await db.messages.find_one({"_id": pin["message_id"]})
        if message:
            message["id"] = message.pop("_id")
            message["created_at"] = datetime.fromisoformat(message["created_at"])
            message["updated_at"] = datetime.fromisoformat(message["updated_at"])
            result.append(Message(**message))
    
    return result

# ============= STARRED MESSAGES =============

@router.post("/messages/{message_id}/star")
async def star_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Star/save a message for current user"""
    message = await db.messages.find_one({"_id": message_id})
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    # Check channel membership
    if not await check_channel_membership(db, message["channel_id"], current_user.id):
        raise HTTPException(status_code=403, detail="Not a member of this channel")
    
    starred_msg = {
        "_id": str(uuid.uuid4()),
        "message_id": message_id,
        "user_id": current_user.id,
        "starred_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.starred_messages.update_one(
        {"message_id": message_id, "user_id": current_user.id},
        {"$set": starred_msg},
        upsert=True
    )
    
    return {"success": True}

@router.delete("/messages/{message_id}/unstar")
async def unstar_message(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Unstar a message"""
    await db.starred_messages.delete_one({
        "message_id": message_id,
        "user_id": current_user.id
    })
    
    return {"success": True}

@router.get("/starred")
async def get_starred_messages(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all starred messages for current user"""
    starred = await db.starred_messages.find({
        "user_id": current_user.id
    }).to_list(length=None)
    
    result = []
    for star in starred:
        message = await db.messages.find_one({"_id": star["message_id"]})
        if message:
            message["id"] = message.pop("_id")
            message["created_at"] = datetime.fromisoformat(message["created_at"])
            message["updated_at"] = datetime.fromisoformat(message["updated_at"])
            result.append(Message(**message))
    
    return result

# ============= NOTIFICATIONS =============

@router.get("/notifications")
async def get_notifications(
    unread_only: bool = False,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get notifications for current user"""
    query = {"user_id": current_user.id}
    if unread_only:
        query["read"] = False
    
    notifications = await db.chat_notifications.find(query).sort("created_at", -1).limit(50).to_list(length=None)
    
    return notifications

@router.post("/notifications/{notification_id}/mark-read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark notification as read"""
    await db.chat_notifications.update_one(
        {"_id": notification_id, "user_id": current_user.id},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}

@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark all notifications as read"""
    await db.chat_notifications.update_many(
        {"user_id": current_user.id, "read": False},
        {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True}

# ============= WEBRTC SIGNALING =============

@router.post("/call/initiate")
async def initiate_call(
    recipient_id: str,
    call_type: str,  # 'audio' or 'video'
    channel_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Initiate a WebRTC call"""
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
    
    # Send call invitation to recipient
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
    """Answer a call"""
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.calls.update_one(
        {"_id": call_id},
        {"$set": {"status": "active"}}
    )
    
    # Notify caller that call was answered
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
    """Reject a call"""
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    now = datetime.now(timezone.utc)
    await db.calls.update_one(
        {"_id": call_id},
        {"$set": {"status": "rejected", "ended_at": now.isoformat()}}
    )
    
    # Notify caller that call was rejected
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
    """End a call"""
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call["caller_id"] != current_user.id and call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    now = datetime.now(timezone.utc)
    await db.calls.update_one(
        {"_id": call_id},
        {"$set": {"status": "ended", "ended_at": now.isoformat()}}
    )
    
    # Notify other participant
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
    """Forward WebRTC signaling data (SDP/ICE candidates)"""
    call = await db.calls.find_one({"_id": call_id})
    if not call:
        raise HTTPException(status_code=404, detail="Call not found")
    
    if call["caller_id"] != current_user.id and call["recipient_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Forward signal to other participant
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

@router.put("/users/me/status")
async def update_user_status(
    status: UserStatus,
    status_text: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update user presence status"""
    now = datetime.now(timezone.utc)
    
    presence_data = {
        "user_id": current_user.id,
        "status": status,
        "status_text": status_text,
        "last_seen": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.user_presence.update_one(
        {"user_id": current_user.id},
        {"$set": presence_data},
        upsert=True
    )
    
    # Broadcast status change to all active connections
    ws_message = {
        "type": WSMessageType.PRESENCE_CHANGED,
        "data": {
            "user_id": current_user.id,
            "status": status,
            "status_text": status_text
        },
        "timestamp": now.isoformat()
    }
    
    # Broadcast to all users
    for user_id, websocket in manager.user_connections.items():
        await manager.send_to_user(user_id, ws_message)
    
    return {"success": True}

# ============= DIRECT MESSAGES =============

@router.post("/dm/create")
async def create_direct_message(
    recipient_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create or get existing direct message channel"""
    # Check if DM already exists
    existing_dm = await db.channels.find_one({
        "type": ChannelType.DIRECT,
        "members": {"$all": [current_user.id, recipient_id], "$size": 2}
    })
    
    if existing_dm:
        existing_dm["id"] = existing_dm.pop("_id")
        existing_dm["created_at"] = datetime.fromisoformat(existing_dm["created_at"])
        existing_dm["updated_at"] = datetime.fromisoformat(existing_dm["updated_at"])
        return Channel(**existing_dm)
    
    # Get recipient name
    recipient = await db.users.find_one({"_id": recipient_id})
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create new DM
    channel_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    
    channel_doc = {
        "_id": channel_id,
        "name": recipient.get("full_name", "Direct Message"),
        "description": None,
        "type": ChannelType.DIRECT,
        "creator_id": current_user.id,
        "members": [current_user.id, recipient_id],
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.channels.insert_one(channel_doc)
    
    channel_doc["id"] = channel_doc.pop("_id")
    channel_doc["created_at"] = now
    channel_doc["updated_at"] = now
    
    return Channel(**channel_doc)

@router.get("/users/search")
async def search_users(
    q: str = "",
    current_user: User = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Search users for creating DMs"""
    # If no query, return all users with @innovatebooks.com
    if not q or q.strip() == "":
        users = await db.users.find({
            "email": {"$regex": "@innovatebooks.com"}
        }).limit(50).to_list(length=None)
    else:
        users = await db.users.find({
            "$or": [
                {"full_name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}}
            ]
        }).limit(20).to_list(length=None)
    
    result = []
    for user in users:
        user_id = str(user["_id"]) if not isinstance(user["_id"], str) else user["_id"]
        if user_id != current_user.id:  # Exclude current user
            result.append({
                "id": user_id,
                "full_name": user.get("full_name", "Unknown User"),
                "email": user.get("email", ""),
                "avatar_url": user.get("avatar_url")
            })
    
    return result
