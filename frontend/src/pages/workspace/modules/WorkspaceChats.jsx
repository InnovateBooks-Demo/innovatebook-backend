import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Send,
  Paperclip,
  User,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Loader2,
  X,
  Users,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChat, setNewChat] = useState({
    context_id: "",
    chat_type: "internal",
    visibility_scope: "internal_only",
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.chat_id);
    }
  }, [selectedChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChats = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/workspace/chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChats(data);
      if (data.length > 0 && !selectedChat) {
        setSelectedChat(data[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/workspace/chats/${chatId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/workspace/chats/${selectedChat.chat_id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: selectedChat.chat_id,
            payload: newMessage,
            content_type: "text",
          }),
        },
      );

      setNewMessage("");
      fetchMessages(selectedChat.chat_id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createChat = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/workspace/chats`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChat),
      });

      if (response.ok) {
        const chat = await response.json();
        setShowCreateModal(false);
        setNewChat({
          context_id: "",
          chat_type: "internal",
          visibility_scope: "internal_only",
        });
        fetchChats();
        setSelectedChat(chat);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const getChatTypeColor = (type) => {
    switch (type) {
      case "internal":
        return "bg-[rgba(3,63,153,0.08)]0";
      case "client":
        return "bg-green-500";
      case "vendor":
        return "bg-purple-500";
      case "mixed":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3A4E63]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Chats Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Context Chats</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-7 h-7 rounded-lg bg-[#3A4E63] text-white flex items-center justify-center hover:bg-[#3A4E63]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search chats"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#3A4E63]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No chats yet</p>
              <p className="text-xs mt-1">
                Create a chat for a business context
              </p>
            </div>
          ) : (
            chats.map((chat) => (
              <button
                key={chat.chat_id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-gray-100 transition-colors ${
                  selectedChat?.chat_id === chat.chat_id
                    ? "bg-[#3A4E63]/5"
                    : "hover:bg-gray-50"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full ${getChatTypeColor(chat.chat_type)} flex items-center justify-center text-white`}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      Context: {chat.context_id}
                    </p>
                    <span className="text-xs text-gray-400">
                      {chat.last_message_at
                        ? new Date(chat.last_message_at).toLocaleDateString()
                        : "New"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-xs ${getChatTypeColor(chat.chat_type)} text-white`}
                    >
                      {chat.chat_type}
                    </span>
                    <span className="text-xs text-gray-400">
                      {chat.participants.length} participants
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full ${getChatTypeColor(selectedChat.chat_type)} flex items-center justify-center text-white`}
                >
                  <MessageSquare className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Context: {selectedChat.context_id}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.participants.length} participants •{" "}
                    {selectedChat.chat_type}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Phone className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Video className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <MessageSquare className="h-12 w-12 mb-3" />
                  <p className="font-medium">No messages yet</p>
                  <p className="text-sm">
                    Start the conversation about this context
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.message_id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#3A4E63] flex items-center justify-center text-white font-medium text-xs">
                      {message.sender_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-400 px-1.5 py-0.5 rounded bg-gray-200">
                          {message.sender_type}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1 p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-700 text-sm">
                          {message.payload}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#3A4E63] disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4" />
              <p className="font-medium">Select a chat to start messaging</p>
              <p className="text-sm mt-1">or create a new context-bound chat</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Chat Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Start New Chat
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Context ID *
                </label>
                <input
                  type="text"
                  value={newChat.context_id}
                  onChange={(e) =>
                    setNewChat({ ...newChat, context_id: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                  placeholder="e.g., CTX-XXXXXXXX"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the context ID for this chat (Deal, Project, Invoice,
                  etc.)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chat Type
                </label>
                <select
                  value={newChat.chat_type}
                  onChange={(e) =>
                    setNewChat({ ...newChat, chat_type: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                >
                  <option value="internal">Internal</option>
                  <option value="client">Client</option>
                  <option value="vendor">Vendor</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  value={newChat.visibility_scope}
                  onChange={(e) =>
                    setNewChat({ ...newChat, visibility_scope: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                >
                  <option value="internal_only">Internal Only</option>
                  <option value="client_visible">Client Visible</option>
                  <option value="vendor_visible">Vendor Visible</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createChat}
                disabled={!newChat.context_id}
                className="px-4 py-2 bg-[#3A4E63] text-white rounded-lg hover:bg-[#3A4E63] disabled:opacity-50"
              >
                Create Chat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceChats;
