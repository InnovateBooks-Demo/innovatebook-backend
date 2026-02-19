import React, { useState, useEffect, useRef } from "react";
import {
  Hash,
  Plus,
  Search,
  Users,
  Settings,
  Send,
  Paperclip,
  MoreVertical,
  AtSign,
  Smile,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const WorkspaceChannels = () => {
  const [channels, setChannels] = useState([]);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    channel_type: "general",
    visibility_scope: "internal_only",
  });
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.channel_id);
    }
  }, [selectedChannel]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/workspace/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setChannels(data);
      if (data.length > 0 && !selectedChannel) {
        setSelectedChannel(data[0]);
      }
    } catch (error) {
      console.error("Error fetching channels:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (channelId) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/workspace/channels/${channelId}/messages`,
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
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const token = localStorage.getItem("access_token");
      await fetch(
        `${API_URL}/api/workspace/channels/${selectedChannel.channel_id}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            channel_id: selectedChannel.channel_id,
            payload: newMessage,
            content_type: "text",
            mentions: [],
          }),
        },
      );

      setNewMessage("");
      fetchMessages(selectedChannel.channel_id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const createChannel = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/workspace/channels`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newChannel),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewChannel({
          name: "",
          description: "",
          channel_type: "general",
          visibility_scope: "internal_only",
        });
        fetchChannels();
      }
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const getChannelTypeIcon = (type) => {
    switch (type) {
      case "deal":
        return "💼";
      case "project":
        return "📁";
      case "vendor":
        return "🏢";
      case "compliance":
        return "📋";
      case "leadership":
        return "👔";
      default:
        return "#";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#033F99]" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Channels Sidebar */}
      <div className="w-64 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Channels</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-7 h-7 rounded-lg bg-[#033F99] text-white flex items-center justify-center hover:bg-[#033F99]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search channels"
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#033F99]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {channels.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              No channels yet. Create one!
            </div>
          ) : (
            channels.map((channel) => (
              <button
                key={channel.channel_id}
                onClick={() => setSelectedChannel(channel)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${selectedChannel?.channel_id === channel.channel_id
                  ? "bg-[#033F99]/10 text-[#033F99]"
                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                <span className="text-lg">
                  {getChannelTypeIcon(channel.channel_type)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{channel.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {channel.channel_type}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChannel ? (
          <>
            {/* Channel Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {getChannelTypeIcon(selectedChannel.channel_type)}
                </span>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedChannel.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedChannel.description || "No description"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Users className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                  <Settings className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <Hash className="h-12 w-12 mb-3" />
                  <p className="font-medium">
                    Welcome to #{selectedChannel.name}
                  </p>
                  <p className="text-sm">Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.message_id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#033F99] flex items-center justify-center text-white font-medium text-sm">
                      {message.sender_name?.charAt(0) || "U"}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 text-sm">
                          {message.sender_name}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm mt-1">
                        {message.payload}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message #${selectedChannel.name}`}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033F99]"
                />
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <AtSign className="h-5 w-5" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Smile className="h-5 w-5" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-[#033F99] text-white rounded-lg hover:bg-[#033F99] disabled:opacity-50"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <Hash className="h-16 w-16 mx-auto mb-4" />
              <p className="font-medium">Select a channel to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"> {/* RESPONSIVE CHANGE */}
          <div className="bg-white rounded-xl w-[95vw] sm:w-[90vw] md:w-[700px] max-w-full max-h-[85vh] overflow-y-auto"> {/* RESPONSIVE CHANGE */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Create Channel
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
                  Channel Name *
                </label>
                <input
                  type="text"
                  value={newChannel.name}
                  onChange={(e) =>
                    setNewChannel({ ...newChannel, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033F99]"
                  placeholder="e.g., sales-team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newChannel.description}
                  onChange={(e) =>
                    setNewChannel({
                      ...newChannel,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033F99]"
                  rows={3}
                  placeholder="What's this channel about?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Channel Type
                </label>
                <select
                  value={newChannel.channel_type}
                  onChange={(e) =>
                    setNewChannel({
                      ...newChannel,
                      channel_type: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#033F99]"
                >
                  <option value="general">General</option>
                  <option value="deal">Deal</option>
                  <option value="project">Project</option>
                  <option value="vendor">Vendor</option>
                  <option value="compliance">Compliance</option>
                  <option value="leadership">Leadership</option>
                </select>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3"> {/* RESPONSIVE CHANGE */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={createChannel}
                disabled={!newChannel.name}
                className="px-4 py-2 bg-[#033F99] text-white rounded-lg hover:bg-[#033F99] disabled:opacity-50"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceChannels;
