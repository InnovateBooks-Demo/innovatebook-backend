"""
INNOVATE BOOKS - WORKSPACE LAYER MODELS
5 Module Model: Chats, Channels, Tasks, Approvals, Notifications
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


# ============= ENUMS =============

class ChatType(str, Enum):
    INTERNAL = "internal"
    CLIENT = "client"
    VENDOR = "vendor"
    MIXED = "mixed"


class VisibilityScope(str, Enum):
    INTERNAL_ONLY = "internal_only"
    CLIENT_VISIBLE = "client_visible"
    VENDOR_VISIBLE = "vendor_visible"


class SenderType(str, Enum):
    INTERNAL = "internal"
    CLIENT = "client"
    VENDOR = "vendor"
    SYSTEM = "system"


class ContentType(str, Enum):
    TEXT = "text"
    FILE = "file"
    SYSTEM = "system"


class ChannelType(str, Enum):
    DEAL = "deal"
    PROJECT = "project"
    VENDOR = "vendor"
    COMPLIANCE = "compliance"
    LEADERSHIP = "leadership"
    GENERAL = "general"


class TaskType(str, Enum):
    ACTION = "action"
    REVIEW = "review"
    UPLOAD = "upload"
    CONFIRM = "confirm"
    RESPOND = "respond"


class TaskStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"


class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class TaskSource(str, Enum):
    MANUAL = "manual"
    SYSTEM = "system"
    ESCALATION = "escalation"


class ApprovalDecision(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ApprovalType(str, Enum):
    CONTRACT_ACCEPTANCE = "contract_acceptance"
    PO_ACKNOWLEDGEMENT = "po_acknowledgement"
    DEAL_APPROVAL = "deal_approval"
    INVOICE_APPROVAL = "invoice_approval"
    EXPENSE_APPROVAL = "expense_approval"
    DOCUMENT_APPROVAL = "document_approval"
    GENERAL = "general"


class NotificationEventType(str, Enum):
    NEW_CHAT_MESSAGE = "new_chat_message"
    CHANNEL_MENTION = "channel_mention"
    TASK_ASSIGNED = "task_assigned"
    TASK_COMPLETED = "task_completed"
    APPROVAL_REQUESTED = "approval_requested"
    APPROVAL_DECISION = "approval_decision"
    SLA_BREACH = "sla_breach"
    ESCALATION = "escalation"
    SYSTEM_ALERT = "system_alert"


# ============= CONTEXT MODEL =============

class Context(BaseModel):
    """Context binds all workspace interactions to a business object"""
    context_id: str
    object_type: str  # deal, contract, invoice, project, lead, order, etc.
    object_id: str
    object_name: Optional[str] = None
    org_id: str
    created_at: datetime
    metadata: Optional[dict] = None


class ContextCreate(BaseModel):
    object_type: str
    object_id: str
    object_name: Optional[str] = None
    metadata: Optional[dict] = None


# ============= CHAT MODELS =============

class WorkspaceChat(BaseModel):
    """Context-bound chat conversation"""
    chat_id: str
    context_id: str
    chat_type: ChatType
    created_by: str
    participants: List[str] = []  # user_ids
    visibility_scope: VisibilityScope
    created_at: datetime
    is_archived: bool = False
    last_message_at: Optional[datetime] = None


class WorkspaceChatCreate(BaseModel):
    context_id: str
    chat_type: ChatType = ChatType.INTERNAL
    participants: List[str] = []
    visibility_scope: VisibilityScope = VisibilityScope.INTERNAL_ONLY


class ChatMessage(BaseModel):
    """Message within a chat"""
    message_id: str
    chat_id: str
    sender_id: str
    sender_type: SenderType
    sender_name: str
    content_type: ContentType
    payload: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    created_at: datetime
    edited: bool = False


class ChatMessageCreate(BaseModel):
    content_type: ContentType = ContentType.TEXT
    payload: str
    file_url: Optional[str] = None
    file_name: Optional[str] = None


# ============= CHANNEL MODELS =============

class WorkspaceChannel(BaseModel):
    """Role-based or team-based communication space"""
    channel_id: str
    channel_type: ChannelType
    name: str
    description: Optional[str] = None
    context_id: Optional[str] = None  # Can be context-aware or general
    member_roles: List[str] = []  # Role names that have access
    member_users: List[str] = []  # Explicit user IDs
    visibility_scope: VisibilityScope
    created_by: str
    created_at: datetime
    is_active: bool = True


class WorkspaceChannelCreate(BaseModel):
    channel_type: ChannelType
    name: str
    description: Optional[str] = None
    context_id: Optional[str] = None
    member_roles: List[str] = []
    member_users: List[str] = []
    visibility_scope: VisibilityScope = VisibilityScope.INTERNAL_ONLY


class ChannelMessage(BaseModel):
    """Message within a channel"""
    message_id: str
    channel_id: str
    sender_id: str
    sender_type: SenderType
    sender_name: str
    content_type: ContentType
    payload: str
    mentions: List[str] = []  # User IDs mentioned
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    created_at: datetime
    edited: bool = False


class ChannelMessageCreate(BaseModel):
    content_type: ContentType = ContentType.TEXT
    payload: str
    mentions: List[str] = []
    file_url: Optional[str] = None
    file_name: Optional[str] = None


# ============= TASK MODELS =============

class WorkspaceTask(BaseModel):
    """Human action required to progress a business context"""
    task_id: str
    context_id: str
    task_type: TaskType
    title: str
    description: Optional[str] = None
    assigned_to_user: Optional[str] = None
    assigned_to_role: Optional[str] = None
    due_at: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    status: TaskStatus = TaskStatus.OPEN
    visibility_scope: VisibilityScope
    source: TaskSource
    created_by: str
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    notes: Optional[str] = None


class WorkspaceTaskCreate(BaseModel):
    context_id: str
    task_type: TaskType
    title: str
    description: Optional[str] = None
    assigned_to_user: Optional[str] = None
    assigned_to_role: Optional[str] = None
    due_at: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    visibility_scope: VisibilityScope = VisibilityScope.INTERNAL_ONLY
    source: TaskSource = TaskSource.MANUAL


class WorkspaceTaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to_user: Optional[str] = None
    assigned_to_role: Optional[str] = None
    due_at: Optional[datetime] = None
    priority: Optional[TaskPriority] = None
    status: Optional[TaskStatus] = None
    notes: Optional[str] = None


# ============= APPROVAL MODELS =============

class WorkspaceApproval(BaseModel):
    """Controlled decision interface - specialized task"""
    approval_id: str
    context_id: str
    linked_task_id: Optional[str] = None  # May be linked to a task
    approval_type: ApprovalType
    title: str
    description: Optional[str] = None
    approver_role: Optional[str] = None
    approver_user: Optional[str] = None
    decision: ApprovalDecision = ApprovalDecision.PENDING
    decision_reason: Optional[str] = None
    decided_at: Optional[datetime] = None
    decided_by: Optional[str] = None
    context_snapshot: Optional[dict] = None  # Read-only snapshot for approver
    requested_by: str
    created_at: datetime
    due_at: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM


class WorkspaceApprovalCreate(BaseModel):
    context_id: str
    approval_type: ApprovalType
    title: str
    description: Optional[str] = None
    approver_role: Optional[str] = None
    approver_user: Optional[str] = None
    linked_task_id: Optional[str] = None
    context_snapshot: Optional[dict] = None
    due_at: Optional[datetime] = None
    priority: TaskPriority = TaskPriority.MEDIUM


class ApprovalDecisionInput(BaseModel):
    decision: ApprovalDecision
    decision_reason: Optional[str] = None


# ============= NOTIFICATION MODELS =============

class WorkspaceNotification(BaseModel):
    """Attention & escalation engine"""
    notification_id: str
    user_id: str
    event_type: NotificationEventType
    context_id: Optional[str] = None
    object_type: Optional[str] = None
    object_id: Optional[str] = None
    title: str
    message: str
    action_url: Optional[str] = None
    read_status: bool = False
    read_at: Optional[datetime] = None
    created_at: datetime
    metadata: Optional[dict] = None


class WorkspaceNotificationCreate(BaseModel):
    user_id: str
    event_type: NotificationEventType
    context_id: Optional[str] = None
    object_type: Optional[str] = None
    object_id: Optional[str] = None
    title: str
    message: str
    action_url: Optional[str] = None
    metadata: Optional[dict] = None


# ============= EXTERNAL USER MODELS =============

class Client(BaseModel):
    """External client user"""
    client_id: str
    org_id: str
    name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    whitelisted_contexts: List[str] = []  # Context IDs they can access
    created_at: datetime
    is_active: bool = True


class ClientCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None


class Vendor(BaseModel):
    """External vendor user"""
    vendor_id: str
    org_id: str
    name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None
    whitelisted_contexts: List[str] = []  # Context IDs they can access
    created_at: datetime
    is_active: bool = True


class VendorCreate(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    company_name: Optional[str] = None


# ============= WORKSPACE STATS =============

class WorkspaceStats(BaseModel):
    """Dashboard statistics"""
    active_tasks: int = 0
    pending_approvals: int = 0
    due_this_week: int = 0
    unread_messages: int = 0
    open_chats: int = 0
    active_channels: int = 0
