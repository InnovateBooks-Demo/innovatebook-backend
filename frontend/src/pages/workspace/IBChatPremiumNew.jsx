import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Hash,
  Users,
  Plus,
  Search,
  MessageSquare,
  Phone,
  Video,
  Smile,
  Paperclip,
  MoreVertical,
  Star,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const IBChatPremiumNew = ({ viewMode = "chat" }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [user, setUser] = useState(null);
  const messagesEndRef = useRef(null);
  const token = localStorage.getItem("access_token");

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const channelsData = response.data || [];
      setChannels(channelsData);

      if (channelsData.length > 0) {
        const targetChannel =
          viewMode === "chat"
            ? channelsData.find((ch) => ch.type === "direct")
            : channelsData.find((ch) => ch.type !== "direct");

        if (targetChannel) {
          setActiveChannel(targetChannel);
          loadMessages(targetChannel.id);
        }
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (channelId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/channels/${channelId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(response.data || []);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error loading messages:", error);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/messages`,
        {
          channel_id: activeChannel.id,
          content: newMessage,
          type: "text",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setNewMessage("");
      loadMessages(activeChannel.id);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleChannelSelect = (channel) => {
    setActiveChannel(channel);
    loadMessages(channel.id);
  };

  const filteredChannels = channels.filter((channel) => {
    const matchesViewMode =
      viewMode === "channels"
        ? channel.type !== "direct"
        : channel.type === "direct";
    const matchesSearch =
      !searchQuery ||
      channel.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesViewMode && matchesSearch;
  });

  const formatTime = (date) => {
    if (!date) return "";
    const messageDate = new Date(date);
    const today = new Date();
    const isToday = messageDate.toDateString() === today.toDateString();

    if (isToday) {
      return messageDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-[#033F99] border-r-transparent"></div>
          <p className="mt-4 text-[#033F99] font-semibold text-lg">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50 p-8">
      {/* Premium Header - Matching Lead Module */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-[#033F99] via-[#033F99] to-[#033F99] bg-clip-text text-transparent"
              style={{ fontFamily: "Poppins" }}
            >
              {viewMode === "channels" ? "Team Channels" : "Direct Messages"}
            </h1>
            <p className="text-[#033F99] mt-2 font-medium text-lg">
              {viewMode === "channels"
                ? "Collaborate in organized team spaces"
                : "Connect directly with team members"}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#033F99] text-[#033F99] font-semibold rounded-xl hover:bg-[#C4D9F4] transition-all duration-200">
              <Calendar className="h-5 w-5" />
              <span>This Month</span>
            </button>
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl shadow-xl transition-all duration-200">
              <Plus className="h-5 w-5" />
              <span>
                {viewMode === "channels" ? "New Channel" : "New Message"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Matching Lead Module */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-[#033F99]/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#033F99]/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-2xl shadow-lg inline-block mb-3">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold text-[#033F99] uppercase tracking-wider mb-1">
              Total {viewMode === "channels" ? "Channels" : "Chats"}
            </p>
            <p className="text-4xl font-black text-[#033F99]">
              {filteredChannels.length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-blue-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-[#0147CC] to-blue-700 rounded-2xl shadow-lg inline-block mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-1">
              Active Now
            </p>
            <p className="text-4xl font-black text-blue-900">
              {filteredChannels.filter((c) => c.last_activity).length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-purple-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl shadow-lg inline-block mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold text-purple-700 uppercase tracking-wider mb-1">
              Unread
            </p>
            <p className="text-4xl font-black text-purple-900">
              {filteredChannels.filter((c) => c.unread_count > 0).length}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl p-6 border-2 border-emerald-200/50 shadow-xl hover:shadow-2xl transition-all duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full -mr-16 -mt-16"></div>
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl shadow-lg inline-block mb-3">
              <Star className="h-6 w-6 text-white" />
            </div>
            <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">
              Pinned
            </p>
            <p className="text-4xl font-black text-emerald-900">
              {filteredChannels.filter((c) => c.is_pinned).length}
            </p>
          </div>
        </div>
      </div>

      {/* Search Section - Matching Lead Module */}
      <div className="mb-6">
        <h2
          className="text-2xl font-bold text-[#033F99] mb-4"
          style={{ fontFamily: "Poppins" }}
        >
          {viewMode === "channels" ? "Browse Channels" : "Your Conversations"}
        </h2>
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${viewMode === "channels" ? "channels" : "conversations"}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#033F99] focus:border-transparent transition-all text-slate-900 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Conversations/Channels List - Premium Cards Matching Lead Module */}
      <div className="space-y-3">
        {filteredChannels.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-16 border-2 border-slate-200 shadow-xl text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#033F99] to-[#0147CC] rounded-3xl flex items-center justify-center shadow-lg">
              <MessageSquare className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              No {viewMode === "channels" ? "channels" : "conversations"} found
            </h3>
            <p className="text-slate-600 font-medium mb-6">
              {searchQuery
                ? "Try adjusting your search"
                : "Get started by creating your first one"}
            </p>
            <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#0147CC] text-white font-bold rounded-xl shadow-xl hover:shadow-2xl transition-all">
              <Plus className="w-5 h-5" />
              Create {viewMode === "channels" ? "Channel" : "Message"}
            </button>
          </div>
        ) : (
          filteredChannels.map((channel) => (
            <div
              key={channel.id}
              onClick={() => handleChannelSelect(channel)}
              className={`group flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg ${activeChannel?.id === channel.id
                  ? "bg-gradient-to-r from-[#033F99] to-[#0147CC] border-[#033F99] text-white"
                  : "bg-gradient-to-r from-slate-50 to-white hover:from-[#C4D9F4] hover:to-white border-slate-200 hover:border-[#033F99]"
                }`}
            >
              {/* Left - Channel/User Info */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0 relative">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg font-bold text-lg ${activeChannel?.id === channel.id
                        ? "bg-white/20 text-white"
                        : channel.type === "direct"
                          ? "bg-gradient-to-br from-[#033F99] to-[#0147CC] text-white"
                          : "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                      }`}
                  >
                    {channel.type === "direct" ? (
                      <span>
                        {channel.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    ) : (
                      <Hash className="h-5 w-5" />
                    )}
                  </div>
                  {channel.unread_count > 0 &&
                    activeChannel?.id !== channel.id && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-black text-white">
                          {channel.unread_count}
                        </span>
                      </div>
                    )}
                  {channel.is_pinned && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full border-2 border-white flex items-center justify-center">
                      <Star className="w-3 h-3 text-white fill-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-bold text-lg mb-1 truncate transition-colors ${activeChannel?.id === channel.id
                        ? "text-white"
                        : "text-slate-900 group-hover:text-[#033F99]"
                      }`}
                  >
                    {channel.name || "Unnamed"}
                  </h3>
                  <div
                    className={`flex items-center gap-3 text-sm ${activeChannel?.id === channel.id
                        ? "text-white/80"
                        : "text-slate-600"
                      }`}
                  >
                    {channel.description && (
                      <span className="font-medium truncate max-w-[300px]">
                        {channel.description}
                      </span>
                    )}
                    {channel.last_message && (
                      <span className="font-medium truncate max-w-[400px]">
                        {channel.last_message}
                      </span>
                    )}
                    {channel.member_count > 0 && (
                      <div className="flex items-center gap-1.5">
                        <Users className="w-4 h-4" />
                        <span className="font-semibold">
                          {channel.member_count} members
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right - Actions & Metadata */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {channel.last_activity && (
                  <div className="text-center min-w-[80px]">
                    <div
                      className={`text-xs font-bold uppercase mb-1 ${activeChannel?.id === channel.id
                          ? "text-white/80"
                          : "text-slate-500"
                        }`}
                    >
                      Last Active
                    </div>
                    <div
                      className={`text-sm font-bold ${activeChannel?.id === channel.id
                          ? "text-white"
                          : "text-[#033F99]"
                        }`}
                    >
                      {formatTime(channel.last_activity)}
                    </div>
                  </div>
                )}

                {channel.type === "direct" &&
                  activeChannel?.id !== channel.id && (
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("Starting audio call...");
                        }}
                        className="p-2.5 bg-emerald-600 text-white rounded-xl hover:shadow-xl transition-all hover:scale-110"
                      >
                        <Phone className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success("Starting video call...");
                        }}
                        className="p-2.5 bg-[#033F99] text-white rounded-xl hover:shadow-xl transition-all hover:scale-110"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                <ChevronRight
                  className={`h-5 w-5 transition-all duration-200 ${activeChannel?.id === channel.id
                      ? "text-white translate-x-1"
                      : "text-slate-400 group-hover:text-[#033F99] group-hover:translate-x-1"
                    }`}
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Active Conversation View - Premium Modal Style */}
      {activeChannel && (
        <div
          className="fixed inset-0 bg-[#033F99]/20 backdrop-blur-sm flex items-center justify-center z-50 p-8"
          onClick={() => setActiveChannel(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-4xl w-full h-[600px] flex flex-col border-2 border-[#033F99]/30"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b-2 border-[#033F99]/20">
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg ${activeChannel.type === "direct"
                      ? "bg-gradient-to-br from-[#033F99] to-[#0147CC] text-white"
                      : "bg-gradient-to-br from-purple-600 to-purple-700 text-white"
                    }`}
                >
                  {activeChannel.type === "direct" ? (
                    activeChannel.name?.charAt(0)?.toUpperCase()
                  ) : (
                    <Hash className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <h2
                    className="text-xl font-black text-[#033F99]"
                    style={{ fontFamily: "Poppins" }}
                  >
                    {activeChannel.name}
                  </h2>
                  {activeChannel.description && (
                    <p className="text-sm text-[#033F99]/70 font-medium">
                      {activeChannel.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeChannel.type === "direct" && (
                  <>
                    <button className="p-3 hover:bg-[#033F99]/10 rounded-xl transition-all">
                      <Phone className="h-5 w-5 text-[#033F99]" />
                    </button>
                    <button className="p-3 hover:bg-[#033F99]/10 rounded-xl transition-all">
                      <Video className="h-5 w-5 text-[#033F99]" />
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveChannel(null)}
                  className="p-3 hover:bg-[#033F99]/10 rounded-xl transition-all"
                >
                  <MoreVertical className="h-5 w-5 text-[#033F99]" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-[#033F99]/30 mx-auto mb-3" />
                    <p className="text-[#033F99]/60 font-medium">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => {
                  const isOwn = message.user_id === user?.id;
                  return (
                    <div
                      key={message.id || index}
                      className={`flex gap-3 ${isOwn ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-md ${isOwn
                            ? "bg-gradient-to-br from-emerald-600 to-emerald-700 text-white"
                            : "bg-gradient-to-br from-[#033F99] to-[#0147CC] text-white"
                          }`}
                      >
                        {(message.user_name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div
                        className={`flex-1 max-w-lg ${isOwn ? "text-right" : "text-left"}`}
                      >
                        <div
                          className={`flex items-center gap-2 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <span className="text-sm font-bold text-[#033F99]">
                            {message.user_name || "Unknown"}
                          </span>
                          <span className="text-xs text-[#033F99]/50 font-medium">
                            {formatTime(message.created_at)}
                          </span>
                        </div>
                        <div
                          className={`inline-block px-4 py-3 rounded-2xl shadow-md ${isOwn
                              ? "bg-gradient-to-br from-[#033F99] to-[#0147CC] text-white"
                              : "bg-slate-100 text-slate-900"
                            }`}
                        >
                          <p className="text-sm font-medium whitespace-pre-wrap">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t-2 border-[#033F99]/20">
              <div className="flex items-end gap-3">
                <button className="p-3 hover:bg-[#033F99]/10 rounded-xl transition-all">
                  <Paperclip className="h-5 w-5 text-[#033F99]" />
                </button>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Type a message..."
                  rows="1"
                  className="flex-1 px-4 py-3 bg-slate-50 border-2 border-slate-200 focus:border-[#033F99] rounded-xl resize-none transition-all text-slate-900 font-medium"
                />
                <button className="p-3 hover:bg-[#033F99]/10 rounded-xl transition-all">
                  <Smile className="h-5 w-5 text-[#033F99]" />
                </button>
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="p-3 bg-gradient-to-br from-[#033F99] to-[#0147CC] hover:scale-105 disabled:opacity-50 text-white rounded-xl transition-all shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IBChatPremiumNew;
