
"""
INNOVATE BOOKS - WORKSPACE LAYER API ROUTES
5 Module Model: Chats, Channels, Tasks, Approvals, Notifications
"""

from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
import shutil
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os
import uuid
from routes.deps import get_current_user, User, security, get_db, require_non_viewer, get_current_user_member
from auth_utils import verify_token

router = APIRouter(tags=["Workspace"])

@router.get("/roles/options")
async def get_role_options(current_user: User = Depends(get_current_user)):
    """Return available roles for selection"""
    return [
        "admin", "manager", "member", "viewer"
    ]
from typing import List, Optional, Dict, Any
# workspace_models imports

from workspace_models import (
    # Enums
    ChatType, VisibilityScope, SenderType, ContentType,
    ChannelType, TaskType, TaskStatus, TaskPriority, TaskSource,
    ApprovalDecision, ApprovalType, NotificationEventType,
    # Context
    Context, ContextCreate,
    # Chats
    WorkspaceChat, WorkspaceChatCreate, ChatMessage, ChatMessageCreate,
    # Channels
    WorkspaceChannel, WorkspaceChannelCreate, ChannelMessage, ChannelMessageCreate,
    # Tasks
    WorkspaceTask, WorkspaceTaskCreate, WorkspaceTaskUpdate,
    # Approvals
    WorkspaceApproval, WorkspaceApprovalCreate, ApprovalDecisionInput,
    # Notifications
    WorkspaceNotification, WorkspaceNotificationCreate,
    # External Users
    Client, ClientCreate, Vendor, VendorCreate,
    # Stats
    WorkspaceStats
)
from pydantic import BaseModel


# Auth moved to routes.deps

# ============= WEBSOCKET MANAGER =============
# Room format required: chat:{chat_id}

class WorkspaceConnectionManager:
    def __init__(self):
        # user_id -> List[WebSocket]
        self.user_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.user_connections.setdefault(user_id, []).append(websocket)
        print(f"DEBUG: WS ACCEPTED user_id={user_id} total_conns={len(self.user_connections[user_id])}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)
            if not self.user_connections[user_id]:
                del self.user_connections[user_id]
        print(f"DEBUG: WS LEFT user_id={user_id}")

    async def broadcast_to_users(self, user_ids: List[str], message: dict):
        unique_users = list(set(user_ids))
        for uid in unique_users:
            conns = self.user_connections.get(uid, [])
            if not conns:
                continue
            
            dead = []
            for ws in conns:
                try:
                    await ws.send_json(message)
                except Exception as e:
                    print(f"DEBUG: Send error user_id={uid}: {e}")
                    dead.append(ws)
            
            for ws in dead:
                self.disconnect(ws, uid)

    # Backward compatibility shim for old room-based calls
    async def broadcast(self, room_id: str, message: dict):
        # This will be replaced by specific DB lookups in the routes
        print(f"WARNING: Legacy broadcast called for {room_id}. Should use broadcast_to_users.")
        pass

manager = WorkspaceConnectionManager()


# get_db moved to routes.deps


# get_current_user moved to routes.deps


# ============= HELPER FUNCTIONS =============

async def get_or_create_context(
    db,
    object_type: str,
    object_id: str,
    org_id: str,
    object_name: Optional[str] = None
) -> str:
    """Get existing context or create new one"""
    existing = await db.workspace_contexts.find_one({
        "object_type": object_type,
        "object_id": object_id,
        "org_id": org_id
    })

    if existing:
        return existing["context_id"]

    context_id = f"CTX-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    context_doc = {
        "context_id": context_id,
        "object_type": object_type,
        "object_id": object_id,
        "object_name": object_name,
        "org_id": org_id,
        "created_at": now.isoformat(),
        "metadata": {}
    }

    await db.workspace_contexts.insert_one(context_doc)
    return context_id


async def create_notification_helper(
    db,
    user_id: str,
    event_type: NotificationEventType,
    title: str,
    message: str,
    context_id: Optional[str] = None,
    object_type: Optional[str] = None,
    object_id: Optional[str] = None,
    action_url: Optional[str] = None,
    metadata: Optional[dict] = None
):
    """Helper to create notifications"""
    notification_id = f"NOTIF-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    notification_doc = {
        "notification_id": notification_id,
        "user_id": user_id,
        "event_type": event_type,
        "context_id": context_id,
        "object_type": object_type,
        "object_id": object_id,
        "title": title,
        "message": message,
        "action_url": action_url,
        "read_status": False,
        "read_at": None,
        "created_at": now.isoformat(),
        "metadata": metadata or {}
    }

    await db.workspace_notifications.insert_one(notification_doc)
    return notification_id


# ============= CONTEXT ROUTES =============

@router.post("/contexts", response_model=Context)
async def create_context(
    data: ContextCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new context for a business object"""
    db = get_db()
    context_id = await get_or_create_context(
        db,
        data.object_type,
        data.object_id,
        current_user.org_id if hasattr(current_user, "org_id") else "default",
        data.object_name
    )

    context = await db.workspace_contexts.find_one({"context_id": context_id})
    context["created_at"] = datetime.fromisoformat(context["created_at"])
    return Context(**context)


@router.get("/contexts/{context_id}")
async def get_context(
    context_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get context details"""
    db = get_db()
    context = await db.workspace_contexts.find_one({
        "context_id": context_id,
        "org_id": current_user.org_id
    })
    if not context:
        raise HTTPException(status_code=404, detail="Context not found")

    context["created_at"] = datetime.fromisoformat(context["created_at"])
    return Context(**context)


# ============= TASK ROUTES =============

@router.post("/tasks", response_model=WorkspaceTask)
async def create_task(
    data: WorkspaceTaskCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new task"""
    db = get_db()
    task_id = f"TASK-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    task_doc = {
        "task_id": task_id,
        "context_id": data.context_id,
        "task_type": data.task_type,
        "title": data.title,
        "description": data.description,
        "assigned_to_user": data.assigned_to_user or current_user.id,
        "assigned_to_role": data.assigned_to_role,
        "due_at": data.due_at.isoformat() if data.due_at else None,
        "priority": data.priority,
        "status": TaskStatus.OPEN,
        "visibility_scope": data.visibility_scope,
        "source": data.source,
        "org_id": current_user.org_id,
        "created_by": current_user.id,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "completed_at": None,
        "completed_by": None,
        "notes": None
    }

    await db.workspace_tasks.insert_one(task_doc)

    # Notify assigned user if different
    if data.assigned_to_user and data.assigned_to_user != current_user.id:
        await create_notification_helper(
            db,
            data.assigned_to_user,
            NotificationEventType.TASK_ASSIGNED,
            f"New task: {data.title}",
            data.description or "You have been assigned a new task",
            context_id=data.context_id,
            object_type="task",
            object_id=task_id,
            action_url=f"/workspace/tasks/{task_id}"
        )

    task_doc["created_at"] = now
    task_doc["updated_at"] = now
    if task_doc["due_at"]:
        task_doc["due_at"] = data.due_at

    return WorkspaceTask(**task_doc)


@router.get("/tasks", response_model=List[WorkspaceTask])
async def get_tasks(
    status: Optional[TaskStatus] = None,
    priority: Optional[TaskPriority] = None,
    context_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get tasks with filters"""
    db = get_db()
    query = {
        "org_id": current_user.org_id,
        "$or": [
            {"assigned_to_user": current_user.id},
            {"created_by": current_user.id}
        ]
    }

    if status:
        query["status"] = status
    if priority:
        query["priority"] = priority
    if context_id:
        query["context_id"] = context_id

    tasks = await db.workspace_tasks.find(query).sort("created_at", -1).to_list(100)

    result = []
    for task in tasks:
        task["created_at"] = datetime.fromisoformat(task["created_at"])
        task["updated_at"] = datetime.fromisoformat(task["updated_at"])
        if task.get("due_at"):
            task["due_at"] = datetime.fromisoformat(task["due_at"])
        if task.get("completed_at"):
            task["completed_at"] = datetime.fromisoformat(task["completed_at"])
        result.append(WorkspaceTask(**task))

    return result


@router.get("/tasks/{task_id}", response_model=WorkspaceTask)
async def get_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get task details"""
    db = get_db()
    task = await db.workspace_tasks.find_one({
        "task_id": task_id,
        "org_id": current_user.org_id
    })
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task["created_at"] = datetime.fromisoformat(task["created_at"])
    task["updated_at"] = datetime.fromisoformat(task["updated_at"])
    if task.get("due_at"):
        task["due_at"] = datetime.fromisoformat(task["due_at"])
    if task.get("completed_at"):
        task["completed_at"] = datetime.fromisoformat(task["completed_at"])

    return WorkspaceTask(**task)


@router.put("/tasks/{task_id}", response_model=WorkspaceTask)
async def update_task(
    task_id: str,
    data: WorkspaceTaskUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update a task"""
    db = get_db()
    task = await db.workspace_tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    now = datetime.now(timezone.utc)
    update_data = {"updated_at": now.isoformat()}

    if data.title is not None:
        update_data["title"] = data.title
    if data.description is not None:
        update_data["description"] = data.description
    if data.assigned_to_user is not None:
        update_data["assigned_to_user"] = data.assigned_to_user
    if data.due_at is not None:
        update_data["due_at"] = data.due_at.isoformat()
    if data.priority is not None:
        update_data["priority"] = data.priority
    if data.status is not None:
        update_data["status"] = data.status
        if data.status == TaskStatus.COMPLETED:
            update_data["completed_at"] = now.isoformat()
            update_data["completed_by"] = current_user.id
    if data.notes is not None:
        update_data["notes"] = data.notes

    await db.workspace_tasks.update_one({"task_id": task_id}, {"$set": update_data})

    updated_task = await db.workspace_tasks.find_one({"task_id": task_id})
    updated_task["created_at"] = datetime.fromisoformat(updated_task["created_at"])
    updated_task["updated_at"] = datetime.fromisoformat(updated_task["updated_at"])
    if updated_task.get("due_at"):
        updated_task["due_at"] = datetime.fromisoformat(updated_task["due_at"])
    if updated_task.get("completed_at"):
        updated_task["completed_at"] = datetime.fromisoformat(updated_task["completed_at"])

    return WorkspaceTask(**updated_task)


@router.post("/tasks/{task_id}/complete")
async def complete_task(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a task as completed"""
    db = get_db()
    task = await db.workspace_tasks.find_one({"task_id": task_id})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    now = datetime.now(timezone.utc)

    await db.workspace_tasks.update_one(
        {"task_id": task_id},
        {"$set": {
            "status": TaskStatus.COMPLETED,
            "completed_at": now.isoformat(),
            "completed_by": current_user.id,
            "updated_at": now.isoformat()
        }}
    )

    return {"success": True, "message": "Task completed"}


# ============= APPROVAL ROUTES =============

@router.post("/approvals", response_model=WorkspaceApproval)
async def create_approval(
    data: WorkspaceApprovalCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new approval request"""
    db = get_db()
    approval_id = f"APPR-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    approval_doc = {
        "approval_id": approval_id,
        "context_id": data.context_id,
        "linked_task_id": data.linked_task_id,
        "approval_type": data.approval_type,
        "title": data.title,
        "description": data.description,
        "approver_role": data.approver_role,
        "approver_user": data.approver_user or current_user.id,
        "decision": ApprovalDecision.PENDING,
        "decision_reason": None,
        "decided_at": None,
        "decided_by": None,
        "context_snapshot": data.context_snapshot,
        "org_id": current_user.org_id,
        "requested_by": current_user.id,
        "created_at": now.isoformat(),
        "due_at": data.due_at.isoformat() if data.due_at else None,
        "priority": data.priority
    }

    await db.workspace_approvals.insert_one(approval_doc)

    if data.approver_user and data.approver_user != current_user.id:
        await create_notification_helper(
            db,
            data.approver_user,
            NotificationEventType.APPROVAL_REQUESTED,
            f"Approval requested: {data.title}",
            data.description or "You have a new approval request",
            context_id=data.context_id,
            object_type="approval",
            object_id=approval_id,
            action_url=f"/workspace/approvals/{approval_id}"
        )

    approval_doc["created_at"] = now
    if approval_doc["due_at"]:
        approval_doc["due_at"] = data.due_at

    return WorkspaceApproval(**approval_doc)


@router.get("/approvals", response_model=List[WorkspaceApproval])
async def get_approvals(
    decision: Optional[ApprovalDecision] = None,
    pending_for_me: bool = False,
    requested_by_me: bool = False,
    current_user: User = Depends(get_current_user)
):
    """Get approvals with filters"""
    db = get_db()
    query = {"org_id": current_user.org_id}

    if decision:
        query["decision"] = decision

    if pending_for_me:
        query["approver_user"] = current_user.id
        query["decision"] = ApprovalDecision.PENDING
    elif requested_by_me:
        query["requested_by"] = current_user.id
    else:
        query["$or"] = [
            {"approver_user": current_user.id},
            {"requested_by": current_user.id}
        ]

    approvals = await db.workspace_approvals.find(query).sort("created_at", -1).to_list(100)

    result = []
    for approval in approvals:
        approval["created_at"] = datetime.fromisoformat(approval["created_at"])
        if approval.get("due_at"):
            approval["due_at"] = datetime.fromisoformat(approval["due_at"])
        if approval.get("decided_at"):
            approval["decided_at"] = datetime.fromisoformat(approval["decided_at"])
        result.append(WorkspaceApproval(**approval))

    return result


@router.get("/approvals/{approval_id}", response_model=WorkspaceApproval)
async def get_approval(
    approval_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get approval details"""
    db = get_db()
    approval = await db.workspace_approvals.find_one({
        "approval_id": approval_id,
        "org_id": current_user.org_id
    })
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    approval["created_at"] = datetime.fromisoformat(approval["created_at"])
    if approval.get("due_at"):
        approval["due_at"] = datetime.fromisoformat(approval["due_at"])
    if approval.get("decided_at"):
        approval["decided_at"] = datetime.fromisoformat(approval["decided_at"])

    return WorkspaceApproval(**approval)


@router.post("/approvals/{approval_id}/decide", response_model=WorkspaceApproval)
async def decide_approval(
    approval_id: str,
    data: ApprovalDecisionInput,
    current_user: User = Depends(get_current_user)
):
    """Make a decision on an approval"""
    db = get_db()
    approval = await db.workspace_approvals.find_one({"approval_id": approval_id})
    if not approval:
        raise HTTPException(status_code=404, detail="Approval not found")

    if approval["approver_user"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to decide")

    if approval["decision"] != ApprovalDecision.PENDING:
        raise HTTPException(status_code=400, detail="Approval already decided")

    now = datetime.now(timezone.utc)

    await db.workspace_approvals.update_one(
        {"approval_id": approval_id},
        {"$set": {
            "decision": data.decision,
            "decision_reason": data.decision_reason,
            "decided_at": now.isoformat(),
            "decided_by": current_user.id
        }}
    )

    await create_notification_helper(
        db,
        approval["requested_by"],
        NotificationEventType.APPROVAL_DECISION,
        f"Approval {data.decision.value}: {approval['title']}",
        data.decision_reason or f"Decision by {current_user.full_name}",
        context_id=approval["context_id"],
        object_type="approval",
        object_id=approval_id,
        action_url=f"/workspace/approvals/{approval_id}"
    )

    updated_approval = await db.workspace_approvals.find_one({"approval_id": approval_id})
    updated_approval["created_at"] = datetime.fromisoformat(updated_approval["created_at"])
    if updated_approval.get("due_at"):
        updated_approval["due_at"] = datetime.fromisoformat(updated_approval["due_at"])
    if updated_approval.get("decided_at"):
        updated_approval["decided_at"] = datetime.fromisoformat(updated_approval["decided_at"])

    return WorkspaceApproval(**updated_approval)


# ============= CHANNEL ROUTES =============

@router.post("/channels", response_model=WorkspaceChannel)
async def create_channel(
    data: WorkspaceChannelCreate,
    current_user: User = Depends(get_current_user)
):
    """Create a new workspace channel"""
    db = get_db()
    channel_id = f"CH-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    member_users = list(set([current_user.id] + data.member_users))

    channel_doc = {
        "channel_id": channel_id,
        "channel_type": data.channel_type,
        "name": data.name,
        "description": data.description,
        "context_id": data.context_id,
        "member_roles": data.member_roles,
        "member_users": member_users,
        "visibility_scope": data.visibility_scope,
        "org_id": current_user.org_id,
        "created_by": current_user.id,
        "created_at": now.isoformat(),
        "is_active": True
    }

    await db.workspace_channels.insert_one(channel_doc)

    channel_doc["created_at"] = now
    return WorkspaceChannel(**channel_doc)


@router.get("/channels", response_model=List[WorkspaceChannel])
async def get_channels(
    channel_type: Optional[ChannelType] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all channels user has access to"""
    db = get_db()
    query = {
        "org_id": current_user.org_id,
        "is_active": True,
        "member_users": current_user.id
    }

    if channel_type:
        query["channel_type"] = channel_type

    channels = await db.workspace_channels.find(query).to_list(100)

    result = []
    for ch in channels:
        ch["created_at"] = datetime.fromisoformat(ch["created_at"])
        result.append(WorkspaceChannel(**ch))

    return result


@router.get("/channels/{channel_id}", response_model=WorkspaceChannel)
async def get_channel(
    channel_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get channel details"""
    db = get_db()
    channel = await db.workspace_channels.find_one({
        "channel_id": channel_id,
        "org_id": current_user.org_id
    })
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if current_user.id not in channel["member_users"]:
        raise HTTPException(status_code=403, detail="No access to this channel")

    channel["created_at"] = datetime.fromisoformat(channel["created_at"])
    return WorkspaceChannel(**channel)


@router.post("/channels/{channel_id}/messages", response_model=ChannelMessage)
async def send_channel_message(
    channel_id: str,
    data: ChannelMessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a channel"""
    db = get_db()
    channel = await db.workspace_channels.find_one({"channel_id": channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if current_user.id not in channel["member_users"]:
        raise HTTPException(status_code=403, detail="No access to this channel")

    message_id = f"CMSG-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    message_doc = {
        "message_id": message_id,
        "channel_id": channel_id,
        "sender_id": current_user.id,
        "sender_type": SenderType.INTERNAL,
        "sender_name": current_user.full_name,
        "content_type": data.content_type,
        "payload": data.payload,
        "mentions": data.mentions,
        "file_url": data.file_url,
        "file_name": data.file_name,
        "created_at": now.isoformat(),
        "edited": False
    }

    await db.workspace_channel_messages.insert_one(message_doc)

    # ===== Broadcast to channel room: channel:{channel_id} =====
    try:
        event = {
            "event": "message_created",
            "channel_id": channel_id,
            "message": {
                **message_doc,
                "created_at": message_doc["created_at"]
            }
        }
        # Broadcast to all members of the channel
        # Fetch channel members
        channel = await db.workspace_channels.find_one({"channel_id": channel_id})
        member_ids = channel.get("member_users", []) if channel else []
        
        await manager.broadcast_to_users(member_ids, event)
    except Exception as e:
        print(f"DEBUG: WS BROADCAST FAILED channel room={channel_id} err={e}")

    message_doc["created_at"] = now
    return ChannelMessage(**message_doc)


@router.get("/channels/{channel_id}/messages", response_model=List[ChannelMessage])
async def get_channel_messages(
    channel_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get messages from a channel"""
    db = get_db()
    channel = await db.workspace_channels.find_one({"channel_id": channel_id})
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")

    if current_user.id not in channel["member_users"]:
        raise HTTPException(status_code=403, detail="No access to this channel")

    messages = await db.workspace_channel_messages.find({"channel_id": channel_id}).sort("created_at", -1).limit(limit).to_list(limit)

    result = []
    for msg in messages:
        msg["created_at"] = datetime.fromisoformat(msg["created_at"])
        result.append(ChannelMessage(**msg))

    return list(reversed(result))


# ============= CHAT ROUTES =============

@router.post("/chats", response_model=WorkspaceChat)
async def create_chat(
    data: WorkspaceChatCreate,
    current_user: User = Depends(require_non_viewer)
):
    """Create a new context-bound chat"""
    db = get_db()

    # Deduplicate based on context if provided
    if data.context_id:
        existing_chat = await db.workspace_chats.find_one({
            "context_id": data.context_id,
            "chat_type": data.chat_type,
            "is_archived": False
        })

        if existing_chat:
            return WorkspaceChat(**existing_chat)

    chat_id = f"CHAT-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc)

    # Ensure creator is in participants
    input_participants = data.participants or []
    participants = list(set(input_participants + [current_user.id]))

    # Validate participants exist (strictly using user_id)
    valid_participants = []
    if participants:
        # Filter valid user_ids from the database
        async for u in db.users.find({"user_id": {"$in": participants}}, {"user_id": 1}):
            valid_participants.append(u["user_id"])
        
        # Cross-check for IDs that might be in _id but we want them to be user_id
        # However, per user request, we standardize on user_id as single source of truth.
    
    # Ensure creator is always included even if validation fails for others
    if current_user.id not in valid_participants:
        valid_participants.append(current_user.id)
    
    participants = list(set(valid_participants))

    chat_doc = {
        "_id": chat_id,
        "chat_id": chat_id,
        "context_id": data.context_id,
        "name": data.name,
        "chat_type": data.chat_type,
        "created_by": current_user.id,
        "participants": participants,
        "visibility_scope": data.visibility_scope,
        "org_id": current_user.org_id,
        "created_at": now.isoformat(),
        "is_archived": False,
        "last_message_at": None
    }

    print("CHAT ID:", chat_id)
    print("CHAT:", chat_doc)
    print("PARTICIPANTS:", chat_doc["participants"])

    await db.workspace_chats.insert_one(chat_doc)

    chat_doc["created_at"] = now
    return WorkspaceChat(**chat_doc)


@router.get("/chats", response_model=List[WorkspaceChat])
async def get_chats(
    context_id: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get all chats for current user"""
    db = get_db()
    query = {
        "org_id": current_user.org_id,
        "participants": {"$in": [current_user.id]},
        "is_archived": False
    }

    if context_id:
        query["context_id"] = context_id

    chats = await db.workspace_chats.find(query).sort("last_message_at", -1).to_list(100)

    result = []
    for chat in chats:
        chat["created_at"] = datetime.fromisoformat(chat["created_at"])
        if chat.get("last_message_at"):
            chat["last_message_at"] = datetime.fromisoformat(chat["last_message_at"])
        result.append(WorkspaceChat(**chat))

    return result


@router.get("/chats/{chat_id}", response_model=WorkspaceChat)
async def get_chat(
    chat_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get chat details"""
    db = get_db()
    chat = await db.workspace_chats.find_one({
        "_id": chat_id,
        "org_id": current_user.org_id
    })
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    participants = chat.get("participants", [])
    if current_user.id not in participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    chat["created_at"] = datetime.fromisoformat(chat["created_at"])
    if chat.get("last_message_at"):
        chat["last_message_at"] = datetime.fromisoformat(chat["last_message_at"])

    return WorkspaceChat(**chat)


@router.post("/chats/{chat_id}/messages", response_model=ChatMessage)
async def send_chat_message(
    chat_id: str,
    data: ChatMessageCreate,
    current_user: User = Depends(get_current_user)
):
    """Send a message in a chat (REST) + Broadcast real-time event"""
    db = get_db()
    chat = await db.workspace_chats.find_one({"_id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    participants = chat.get("participants", [])
    if current_user.id not in participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    message_id = f"MSG-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    message_doc = {
        "message_id": message_id,
        "chat_id": chat_id,
        "sender_id": current_user.id,
        "sender_type": SenderType.INTERNAL,
        "sender_name": current_user.full_name,
        "content_type": data.content_type,
        "payload": data.payload,       # DO NOT RENAME
        "file_url": data.file_url,
        "file_name": data.file_name,
        "created_at": now.isoformat(),
        "edited": False
    }

    await db.workspace_chat_messages.insert_one(message_doc)

    await db.workspace_chats.update_one(
        {"_id": chat_id},
        {"$set": {"last_message_at": now.isoformat()}}
    )

    # ===== Broadcast to chat room: chat:{chat_id} =====
    try:
        inserted = await db.workspace_chat_messages.find_one({"message_id": message_id})
        event = {
            "event": "message_created",
            "chat_id": chat_id,
            "message": {
                "message_id": inserted["message_id"],
                "chat_id": inserted["chat_id"],
                "sender_id": inserted["sender_id"],
                "sender_type": inserted["sender_type"],
                "sender_name": inserted["sender_name"],
                "content_type": inserted["content_type"],
                "payload": inserted["payload"],  # keep payload
                "file_url": inserted.get("file_url"),
                "file_name": inserted.get("file_name"),
                "created_at": inserted["created_at"],
                "edited": inserted.get("edited", False),
                "delivered_to": inserted.get("delivered_to", []),
                "read_by": inserted.get("read_by", []),
            }
        }

        room_id = f"chat:{chat_id}"
        print(f"DEBUG: WS BROADCAST room={room_id} message_id={message_id}")
        # Broadcast to all participants of the chat
        await manager.broadcast_to_users(chat.get("participants", []), event)
    except Exception as e:
        print(f"DEBUG: WS BROADCAST FAILED err={e}")

    message_doc["created_at"] = now
    return ChatMessage(**message_doc)


@router.get("/chats/{chat_id}/messages", response_model=List[ChatMessage])
async def get_chat_messages(
    chat_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get messages from a chat"""
    db = get_db()
    chat = await db.workspace_chats.find_one({"_id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    participants = chat.get("participants", [])
    if current_user.id not in participants:
        raise HTTPException(status_code=403, detail="Not a participant")

    messages = await db.workspace_chat_messages.find({"chat_id": chat_id}).sort("created_at", -1).limit(limit).to_list(limit)

    result = []
    for msg in messages:
        msg["created_at"] = datetime.fromisoformat(msg["created_at"])
        result.append(ChatMessage(**msg))

    return list(reversed(result))


# ==========================
# WEBSOCKET ENDPOINT (LIVE)
# ==========================
@router.websocket("/ws/workspace")
async def workspace_unified_ws(websocket: WebSocket, token: str = Query(None)):
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = verify_token(token, verify_type="access")
    except Exception as e:
        print(f"DEBUG: WS Auth failed: {e}")
        await websocket.close(code=1008)
        return

    user_id = payload.get("user_id")
    if not user_id:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    print(f"DEBUG: WS UNIFIED CONNECTED user_id={user_id}")

    try:
        while True:
            # Keep alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        print(f"DEBUG: WS UNIFIED DISCONNECT user_id={user_id}")
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"DEBUG: WS UNIFIED ERROR user_id={user_id} err={e}")
        manager.disconnect(websocket, user_id)


@router.websocket("/ws/{chat_id}")
async def workspace_chat_ws(websocket: WebSocket, chat_id: str, token: str = Query(None)):
    """DEPRECATED: Use /ws/workspace instead. Kept for short-term compatibility."""
    if not token:
        await websocket.close(code=1008)
        return

    try:
        payload = verify_token(token, verify_type="access")
    except Exception:
        await websocket.close(code=1008)
        return

    user_id = payload.get("user_id")
    if not user_id:
        await websocket.close(code=1008)
        return

    # Use user_id for connection even in legacy endpoint
    await manager.connect(websocket, user_id)
    
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception:
        manager.disconnect(websocket, user_id)


# ============= NOTIFICATION ROUTES =============

@router.get("/notifications", response_model=List[WorkspaceNotification])
async def get_notifications(
    unread_only: bool = False,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get notifications for current user"""
    db = get_db()
    query = {"user_id": current_user.id}

    if unread_only:
        query["read_status"] = False

    notifications = await db.workspace_notifications.find(query).sort("created_at", -1).limit(limit).to_list(limit)

    result = []
    for notif in notifications:
        notif["created_at"] = datetime.fromisoformat(notif["created_at"])
        if notif.get("read_at"):
            notif["read_at"] = datetime.fromisoformat(notif["read_at"])
        result.append(WorkspaceNotification(**notif))

    return result


@router.get("/notifications/unread-count")
async def get_unread_count(
    current_user: User = Depends(get_current_user)
):
    """Get count of unread notifications"""
    db = get_db()
    count = await db.workspace_notifications.count_documents({
        "user_id": current_user.id,
        "read_status": False
    })
    return {"count": count}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Mark a notification as read"""
    db = get_db()
    now = datetime.now(timezone.utc)

    result = await db.workspace_notifications.update_one(
        {"notification_id": notification_id, "user_id": current_user.id},
        {"$set": {"read_status": True, "read_at": now.isoformat()}}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True}


@router.post("/notifications/read-all")
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user)
):
    """Mark all notifications as read"""
    db = get_db()
    now = datetime.now(timezone.utc)

    await db.workspace_notifications.update_many(
        {"user_id": current_user.id, "read_status": False},
        {"$set": {"read_status": True, "read_at": now.isoformat()}}
    )

    return {"success": True}


@router.delete("/notifications/{notification_id}")
async def delete_notification(
    notification_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a notification"""
    db = get_db()
    result = await db.workspace_notifications.delete_one({
        "notification_id": notification_id,
        "user_id": current_user.id
    })

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")

    return {"success": True}


# ============= WORKSPACE STATS =============

@router.get("/stats", response_model=WorkspaceStats)
async def get_workspace_stats(
    current_user: User = Depends(get_current_user)
):
    """Get workspace statistics for dashboard"""
    db = get_db()
    now = datetime.now(timezone.utc)
    week_from_now = now + timedelta(days=7)

    active_tasks = await db.workspace_tasks.count_documents({
        "assigned_to_user": current_user.id,
        "status": {"$in": [TaskStatus.OPEN, TaskStatus.IN_PROGRESS]}
    })

    pending_approvals = await db.workspace_approvals.count_documents({
        "approver_user": current_user.id,
        "decision": ApprovalDecision.PENDING
    })

    due_this_week = await db.workspace_tasks.count_documents({
        "assigned_to_user": current_user.id,
        "status": {"$in": [TaskStatus.OPEN, TaskStatus.IN_PROGRESS]},
        "due_at": {"$lte": week_from_now.isoformat(), "$gte": now.isoformat()}
    })

    unread_messages = await db.workspace_notifications.count_documents({
        "user_id": current_user.id,
        "read_status": False
    })

    open_chats = await db.workspace_chats.count_documents({
        "participants": current_user.id,
        "is_archived": False
    })

    active_channels = await db.workspace_channels.count_documents({
        "is_active": True,
        "member_users": current_user.id
    })

    return WorkspaceStats(
        active_tasks=active_tasks,
        pending_approvals=pending_approvals,
        due_this_week=due_this_week,
        unread_messages=unread_messages,
        open_chats=open_chats,
        active_channels=active_channels
    )


# ============= SEED DATA =============

@router.get("/seed")
async def seed_workspace_data(
    current_user: User = Depends(get_current_user)
):
    """Seed sample workspace data"""
    db = get_db()
    now = datetime.now(timezone.utc)
    org_id = current_user.org_id if hasattr(current_user, "org_id") else "default"

    # Create sample contexts
    contexts = [
        {"object_type": "deal", "object_id": "DEAL-001", "object_name": "Enterprise Contract - Acme Corp"},
        {"object_type": "project", "object_id": "PROJ-001", "object_name": "Website Redesign"},
        {"object_type": "invoice", "object_id": "INV-001", "object_name": "Invoice #1234"},
        {"object_type": "lead", "object_id": "LEAD-001", "object_name": "Tech Solutions Inc."},
    ]

    created_contexts = []
    for ctx in contexts:
        context_id = await get_or_create_context(
            db, ctx["object_type"], ctx["object_id"], org_id, ctx["object_name"]
        )
        created_contexts.append(context_id)

    # Create sample channels
    channels = [
        {"name": "General", "channel_type": ChannelType.GENERAL, "description": "Company-wide announcements"},
        {"name": "Sales Team", "channel_type": ChannelType.DEAL, "description": "Sales discussions"},
        {"name": "Project Updates", "channel_type": ChannelType.PROJECT, "description": "Project status updates"},
    ]

    for ch in channels:
        existing = await db.workspace_channels.find_one({"name": ch["name"]})
        if not existing:
            channel_id = f"CH-{str(uuid.uuid4())[:8].upper()}"
            await db.workspace_channels.insert_one({
                "channel_id": channel_id,
                "channel_type": ch["channel_type"],
                "name": ch["name"],
                "description": ch["description"],
                "context_id": None,
                "member_roles": [],
                "member_users": [current_user.id],
                "visibility_scope": VisibilityScope.INTERNAL_ONLY,
                "created_by": current_user.id,
                "created_at": now.isoformat(),
                "is_active": True
            })

    # Create sample tasks
    tasks = [
        {"title": "Review contract terms", "task_type": TaskType.REVIEW, "priority": TaskPriority.HIGH},
        {"title": "Upload compliance documents", "task_type": TaskType.UPLOAD, "priority": TaskPriority.MEDIUM},
        {"title": "Confirm delivery schedule", "task_type": TaskType.CONFIRM, "priority": TaskPriority.LOW},
        {"title": "Respond to client query", "task_type": TaskType.RESPOND, "priority": TaskPriority.URGENT},
    ]

    for i, task in enumerate(tasks):
        existing = await db.workspace_tasks.find_one({"title": task["title"]})
        if not existing:
            task_id = f"TASK-{str(uuid.uuid4())[:8].upper()}"
            await db.workspace_tasks.insert_one({
                "task_id": task_id,
                "context_id": created_contexts[i % len(created_contexts)],
                "task_type": task["task_type"],
                "title": task["title"],
                "description": f"Sample task: {task['title']}",
                "assigned_to_user": current_user.id,
                "assigned_to_role": None,
                "due_at": (now + timedelta(days=i + 1)).isoformat(),
                "priority": task["priority"],
                "status": TaskStatus.OPEN,
                "visibility_scope": VisibilityScope.INTERNAL_ONLY,
                "source": TaskSource.MANUAL,
                "created_by": current_user.id,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "completed_at": None,
                "completed_by": None,
                "notes": None
            })

    # Create sample approvals
    approvals = [
        {"title": "Approve Deal #001", "approval_type": ApprovalType.DEAL_APPROVAL, "priority": TaskPriority.HIGH},
        {"title": "Approve Invoice #1234", "approval_type": ApprovalType.INVOICE_APPROVAL, "priority": TaskPriority.MEDIUM},
    ]

    for i, approval in enumerate(approvals):
        existing = await db.workspace_approvals.find_one({"title": approval["title"]})
        if not existing:
            approval_id = f"APPR-{str(uuid.uuid4())[:8].upper()}"
            await db.workspace_approvals.insert_one({
                "approval_id": approval_id,
                "context_id": created_contexts[i % len(created_contexts)],
                "linked_task_id": None,
                "approval_type": approval["approval_type"],
                "title": approval["title"],
                "description": f"Please review and approve: {approval['title']}",
                "approver_role": None,
                "approver_user": current_user.id,
                "decision": ApprovalDecision.PENDING,
                "decision_reason": None,
                "decided_at": None,
                "decided_by": None,
                "context_snapshot": {"sample": "data"},
                "requested_by": current_user.id,
                "created_at": now.isoformat(),
                "due_at": (now + timedelta(days=3)).isoformat(),
                "priority": approval["priority"]
            })

    # Create sample notifications
    notifications = [
        {"title": "New task assigned", "message": "You have been assigned a new task", "event_type": NotificationEventType.TASK_ASSIGNED},
        {"title": "Approval requested", "message": "A new approval is waiting for your review", "event_type": NotificationEventType.APPROVAL_REQUESTED},
        {"title": "SLA Warning", "message": "Task deadline approaching", "event_type": NotificationEventType.SLA_BREACH},
    ]

    for notif in notifications:
        notification_id = f"NOTIF-{str(uuid.uuid4())[:8].upper()}"
        await db.workspace_notifications.insert_one({
            "notification_id": notification_id,
            "user_id": current_user.id,
            "event_type": notif["event_type"],
            "context_id": created_contexts[0],
            "object_type": None,
            "object_id": None,
            "title": notif["title"],
            "message": notif["message"],
            "action_url": "/workspace",
            "read_status": False,
            "read_at": None,
            "created_at": now.isoformat(),
            "metadata": {}
        })

    return {"success": True, "message": "Workspace data seeded successfully"}


# ============= ATTACHMENT ROUTES =============

@router.post("/chats/{chat_id}/attachments", response_model=ChatMessage)
async def upload_chat_attachment(
    chat_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    """Upload a file attachment to a chat"""
    db = get_db()
    chat = await db.workspace_chats.find_one({"_id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if current_user.id not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant")

    # Create upload directory
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    base_upload_dir = os.path.join(BASE_DIR, "uploads", "workspace", chat_id)
    os.makedirs(base_upload_dir, exist_ok=True)

    # Generate unique filename to prevent overwrites
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(base_upload_dir, unique_filename)

    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Create message
    message_id = f"MSG-{str(uuid.uuid4())[:8].upper()}"
    now = datetime.now(timezone.utc)

    file_url = f"/api/workspace/chats/{chat_id}/attachments/{unique_filename}"

    message_doc = {
        "message_id": message_id,
        "chat_id": chat_id,
        "sender_id": current_user.id,
        "sender_type": SenderType.INTERNAL,
        "sender_name": current_user.full_name,
        "content_type": ContentType.FILE,
        "payload": f"Uploaded file: {file.filename}",
        "file_url": file_url,
        "file_name": file.filename,
        "created_at": now.isoformat(),
        "edited": False
    }

    await db.workspace_chat_messages.insert_one(message_doc)

    await db.workspace_chats.update_one(
        {"_id": chat_id},
        {"$set": {"last_message_at": now.isoformat()}}
    )

    # Broadcast to WebSocket (match frontend listener)
    try:
        chat = await db.workspace_chats.find_one({"_id": chat_id})
        participant_ids = chat.get("participants", []) if chat else []
        
        await manager.broadcast_to_users(participant_ids, {
            "event": "message_created",
            "chat_id": chat_id,
            "message": {
                "message_id": message_doc["message_id"],
                "chat_id": message_doc["chat_id"],
                "sender_id": message_doc["sender_id"],
                "sender_type": message_doc["sender_type"],
                "sender_name": message_doc["sender_name"],
                "content_type": message_doc["content_type"],
                "payload": message_doc["payload"],
                "file_url": message_doc.get("file_url"),
                "file_name": message_doc.get("file_name"),
                "created_at": message_doc["created_at"],
                "edited": message_doc.get("edited", False),
                "delivered_to": [],
                "read_by": []
            }
        })
        print(f"DEBUG: WS BROADCAST attachment chat_id={chat_id} message_id={message_doc['message_id']}")
    except Exception as e:
        print(f"DEBUG: WS BROADCAST attachment FAILED err={e}")

    message_doc["created_at"] = now
    return ChatMessage(**message_doc)


@router.get("/chats/{chat_id}/attachments/{filename}")
async def get_chat_attachment(
    chat_id: str,
    filename: str,
    current_user: User = Depends(get_current_user)
):
    """Serve a chat attachment"""
    db = get_db()
    chat = await db.workspace_chats.find_one({"_id": chat_id})
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found")

    if current_user.id not in chat["participants"]:
        raise HTTPException(status_code=403, detail="Not a participant")

    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(BASE_DIR, "uploads", "workspace", chat_id, filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    return FileResponse(file_path)
# ==========================
# LEGACY ADAPTERS (BACKWARD COMPATIBILITY)
# ==========================

@router.get("/legacy/chat/channels")
async def legacy_get_channels(
    current_user: User = Depends(get_current_user)
):
    """Alias for /api/workspace/channels for legacy callers"""
    return await get_channels(channel_type=None, current_user=current_user)

@router.get("/legacy/chat/channels/{channel_id}/messages")
async def legacy_get_channel_messages(
    channel_id: str,
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Alias for /api/workspace/channels/{id}/messages"""
    return await get_channel_messages(channel_id, limit, current_user)

@router.post("/legacy/chat/messages")
async def legacy_send_chat_message(
    data: ChatMessageCreate, # Note: this is for context chats, but legacy used it for channels too
    current_user: User = Depends(get_current_user)
):
    """Thin adapter for legacy single-endpoint message sending"""
    # This is complex because legacy had a mixed model. 
    # For now, we point to the primary workspace chat or error gracefully.
    raise HTTPException(status_code=410, detail="Legacy endpoint /api/chat/messages is deprecated. Please use /api/workspace/chats/{id}/messages")
