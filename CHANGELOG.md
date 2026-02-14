# Changelog

## [Unreleased]

### Added
- **Workspace Chats**:
  - Added organization member picker in "Create Chat" modal.
  - Backend: Validates and includes selected participants in new chats (checks `users` and `enterprise_users`).
  - Frontend: Refined chat header buttons (restored Phone icon for audio-only calls, fixed Video icon for video calls).
  - Frontend: Added "Chat Participants" modal to view member details.
  - Frontend: Implemented secure file rendering and downloading (using auth headers for protected attachments).
  - Backend: New endpoints `POST /chats/{chat_id}/attachments` and `GET /chats/{chat_id}/attachments/{filename}` in `workspace_routes.py`.
  - Frontend: `WorkspaceChats.jsx` now supports file selection via paperclip icon and displays images/downloads.
  - **Real-time Messaging**:
    - Backend: Added WebSocket endpoint `/api/workspace/ws/{chat_id}` for real-time chat updates.
    - Backend: `send_chat_message` and `upload_chat_attachment` now broadcast events to connected clients.
    - Backend: `WorkspaceConnectionManager` now tracks user presence and broadcasts `user_online`/`user_offline` events.
    - Backend: WebSocket endpoint now handles `typing_start`/`typing_stop` events and broadcasts them.
    - Frontend: `WorkspaceChats.jsx` connects to WebSocket to receive and display new messages instantly.
    - Frontend: `WorkspaceChats.jsx` displays typing indicators ("Someone is typing...") and online status.
    - **Delivered/Read Receipts**:
        - Backend: `ChatMessage` schema updated with `delivered_to` and `read_by` fields.
        - Backend: WebSocket handles `message_delivered` and `chat_read` events, updating DB and broadcasting status.
        - Frontend: Emits status events and displays tick marks (✓ sent, ✓✓ delivered, ✓✓ read) for messages.
    - **Video Calling**:
        - Backend: WebSocket handles `call_offer`, `call_answer`, `ice_candidate`, `call_end`.
        - Frontend: Added WebRTC logic for 1:1 video calls (using public STUN).
        - Frontend: Added "Incoming Call" modal and full-screen video overlay with controls.
