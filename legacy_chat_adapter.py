from fastapi import APIRouter, Depends, HTTPException
from workspace_routes import get_channels, get_channel_messages, get_current_user, WorkspaceUser
from workspace_models import ChatMessageCreate

router = APIRouter(prefix="/api/chat", tags=["legacy-chat"])

@router.get("/channels")
async def legacy_get_channels(
    current_user: WorkspaceUser = Depends(get_current_user)
):
    return await get_channels(channel_type=None, current_user=current_user)

@router.get("/channels/{channel_id}/messages")
async def legacy_get_channel_messages(
    channel_id: str,
    limit: int = 50,
    current_user: WorkspaceUser = Depends(get_current_user)
):
    return await get_channel_messages(channel_id, limit, current_user)

@router.post("/messages")
async def legacy_send_chat_message(
    current_user: WorkspaceUser = Depends(get_current_user)
):
    raise HTTPException(status_code=410, detail="Legacy endpoint /api/chat/messages is deprecated. Update frontend to use /api/workspace/...")
