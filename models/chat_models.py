from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum

class ChannelType(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    DIRECT = "direct"
    GROUP = "group"

class MessageType(str, Enum):
    TEXT = "text"
    FILE = "file"
    IMAGE = "image"
    SYSTEM = "system"

class UserStatus(str, Enum):
    ONLINE = "online"
    AWAY = "away"
    BUSY = "busy"
    OFFLINE = "offline"

# Channel Models
class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    type: ChannelType = ChannelType.PUBLIC
    members: List[str] = []  # User IDs

class Channel(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    type: ChannelType
    creator_id: str
    members: List[str] = []
    created_at: datetime
    updated_at: datetime

# Message Models
class MessageCreate(BaseModel):
    channel_id: str
    content: str
    type: MessageType = MessageType.TEXT
    parent_id: Optional[str] = None  # For threads
    mentions: List[str] = []  # User IDs mentioned
    file_url: Optional[str] = None
    file_name: Optional[str] = None

class Reaction(BaseModel):
    emoji: str
    user_ids: List[str] = []
    count: int = 0

class Message(BaseModel):
    id: str
    channel_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: str
    type: MessageType
    parent_id: Optional[str] = None
    mentions: List[str] = []
    reactions: List[Reaction] = []
    file_url: Optional[str] = None
    file_name: Optional[str] = None
    edited: bool = False
    created_at: datetime
    updated_at: datetime

# User Presence
class UserPresence(BaseModel):
    user_id: str
    status: UserStatus
    status_text: Optional[str] = None
    last_seen: datetime

# WebSocket Message Types
class WSMessageType(str, Enum):
    NEW_MESSAGE = "new_message"
    MESSAGE_UPDATED = "message_updated"
    MESSAGE_DELETED = "message_deleted"
    REACTION_ADDED = "reaction_added"
    USER_TYPING = "user_typing"
    USER_JOINED = "user_joined"
    USER_LEFT = "user_left"
    PRESENCE_CHANGED = "presence_changed"

class WSMessage(BaseModel):
    type: WSMessageType
    data: dict
    timestamp: datetime = Field(default_factory=datetime.utcnow)
