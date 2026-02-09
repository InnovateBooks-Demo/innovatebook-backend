import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Hash,
  Lock,
  Users,
  Plus,
  Search,
  Smile,
  Paperclip,
  MoreVertical,
  X,
  Edit2,
  Trash2,
  Image as ImageIcon,
  File,
  Video as FileVideo,
  Download,
  Phone,
  Video as VideoIcon,
  Pin,
  Star,
  Reply,
  ChevronDown,
  AtSign,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  PhoneOff,
  Maximize2,
  ArrowLeft,
  MessageSquare,
} from "lucide-react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import SimplePeer from "simple-peer";
import { useWebRTCContext } from "../../context/WebRTCContext";
import { toast } from "sonner";
import "../../styles/design-system.css";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const IBChatPremium = ({ viewMode = "chat" }) => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [user, setUser] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const token = localStorage.getItem("access_token");

  // WebRTC context
  const { startCall } = useWebRTCContext();

  const makeCall = async (type) => {
    if (!activeChannel || activeChannel.type !== "direct") return;

    try {
      // Get the other user's ID from the channel
      const targetUserId = activeChannel.members?.find((id) => id !== user?.id);
      if (!targetUserId) {
        toast.error("Could not find user to call");
        return;
      }

      await startCall(targetUserId, type);
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error(
        "Failed to start call. Please check your camera/microphone permissions.",
      );
    }
  };

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
      setChannels(response.data);

      // Set active channel based on viewMode
      if (response.data.length > 0 && !activeChannel) {
        if (viewMode === "chat") {
          // For chat, select first DM
          const firstDM = response.data.find((ch) => ch.type === "direct");
          if (firstDM) setActiveChannel(firstDM);
        } else {
          // For channels, select first channel
          const firstChannel = response.data.find((ch) => ch.type !== "direct");
          if (firstChannel) setActiveChannel(firstChannel);
        }
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel.id);
      connectWebSocket();
    }
  }, [activeChannel]);

  const loadMessages = async (channelId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/channels/${channelId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const connectWebSocket = () => {
    if (!user?.id) return;

    const backendWsUrl = BACKEND_URL.replace("http://", "ws://").replace(
      "https://",
      "wss://",
    );
    const wsUrl = `${backendWsUrl}/api/chat/ws/${user.id}`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      if (activeChannel) {
        websocket.send(
          JSON.stringify({
            type: "join_channel",
            channel_id: activeChannel.id,
          }),
        );
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    websocket.onclose = () => {
      setTimeout(connectWebSocket, 3000);
    };

    setWs(websocket);

    return () => {
      if (websocket) websocket.close();
    };
  };

  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "new_message":
        if (data.data.channel_id === activeChannel?.id) {
          setMessages((prev) => [...prev, data.data]);
          scrollToBottom();
        }
        break;
      case "message_deleted":
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== data.data.message_id),
        );
        break;
      default:
        break;
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        setUploadingFiles((prev) => [
          ...prev,
          { name: file.name, progress: 0 },
        ]);

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("channel_id", activeChannel.id);

          const response = await axios.post(
            `${BACKEND_URL}/api/chat/upload`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
              onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round(
                  (progressEvent.loaded * 100) / progressEvent.total,
                );
                setUploadingFiles((prev) =>
                  prev.map((f) =>
                    f.name === file.name
                      ? { ...f, progress: percentCompleted }
                      : f,
                  ),
                );
              },
            },
          );

          await axios.post(
            `${BACKEND_URL}/api/chat/messages`,
            {
              channel_id: activeChannel.id,
              content: `Uploaded file: ${file.name}`,
              type: file.type.startsWith("image/") ? "image" : "file",
              file_url: response.data.file_url,
              file_name: file.name,
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
        } catch (error) {
          console.error("Error uploading file:", error);
          setUploadingFiles((prev) => prev.filter((f) => f.name !== file.name));
        }
      }
    },
    [activeChannel, token],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    const tempMessage = {
      id: `temp-${Date.now()}`,
      channel_id: activeChannel.id,
      user_id: user.id,
      user_name: user.full_name,
      content: newMessage,
      type: "text",
      created_at: new Date().toISOString(),
      parent_id: replyToMessage?.id,
    };

    // Add message immediately to UI
    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
    setReplyToMessage(null);
    setShowEmojiPicker(false);
    scrollToBottom();

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/messages`,
        {
          channel_id: activeChannel.id,
          content: tempMessage.content,
          type: "text",
          parent_id: tempMessage.parent_id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      // Replace temp message with real one
      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? response.data : msg)),
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove temp message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      setNewMessage(tempMessage.content); // Restore message
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const addReaction = async (messageId, emoji) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      loadMessages(activeChannel.id);
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const createChannel = async (name, description, type) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/channels`,
        {
          name,
          description,
          type,
          members: [],
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      loadChannels();
      setShowNewChannelModal(false);
    } catch (error) {
      console.error("Error creating channel:", error);
    }
  };

  const createDM = async (recipientId) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/dm/create?recipient_id=${recipientId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      loadChannels();
      setActiveChannel(response.data);
      setShowNewDMModal(false);
    } catch (error) {
      console.error("Error creating DM:", error);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="h-full flex bg-gradient-to-br from-[#C4D9F4] via-white to-[#C4D9F4]/50"
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {/* Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-[#3A4E63]/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-12 shadow-2xl border-2 border-[#3A4E63] border-dashed">
            <div className="w-24 h-24 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Paperclip className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-black text-[#3A4E63] text-center">
              Drop files here
            </h3>
            <p className="text-[#3A4E63]/70 text-center mt-2 font-semibold">
              Upload to {activeChannel?.name}
            </p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarCollapsed ? "w-20" : "w-80"
        } transition-all duration-500 bg-white border-r border-[#3A4E63]/10 flex flex-col`}
        style={{ boxShadow: "2px 0 20px rgba(3, 63, 153, 0.06)" }}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-[#3A4E63]/10 px-4 flex items-center justify-between">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#3A4E63] to-[#0147CC] flex items-center justify-center shadow-lg">
                <MessageSquare
                  className="h-5 w-5 text-white"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <h2 className="text-lg font-black text-[#3A4E63]">
                  {viewMode === "channels" ? "Channels" : "Chat"}
                </h2>
                <p className="text-xs text-[#3A4E63]/60 font-semibold">
                  {viewMode === "channels"
                    ? `${channels.filter((ch) => ch.type !== "direct").length} channels`
                    : `${channels.filter((ch) => ch.type === "direct").length} conversations`}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-[#3A4E63]/5 rounded-xl transition-all"
          >
            {sidebarCollapsed ? (
              <ChevronDown className="h-4 w-4 rotate-90 text-[#3A4E63]" />
            ) : (
              <X className="h-4 w-4 text-[#3A4E63]" />
            )}
          </button>
        </div>

        {/* Search */}
        {!sidebarCollapsed && (
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#3A4E63]/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#F5F8FF] border-2 border-transparent focus:border-[#3A4E63] focus:bg-white rounded-xl transition-all text-[#3A4E63] placeholder:text-[#3A4E63]/40 font-medium"
              />
            </div>
          </div>
        )}

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="space-y-1">
            {!sidebarCollapsed && viewMode === "channels" && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-bold text-[#3A4E63]/70 uppercase tracking-wider">
                  Channels
                </span>
                <button
                  onClick={() => setShowNewChannelModal(true)}
                  className="p-1.5 hover:bg-[#3A4E63]/10 text-[#3A4E63] rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {viewMode === "channels" &&
              channels
                .filter(
                  (ch) =>
                    ch.type !== "direct" &&
                    (!searchQuery ||
                      ch.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
                )
                .map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-300
                  ${
                    activeChannel?.id === channel.id
                      ? "bg-gradient-to-r from-[#3A4E63] to-[#0147CC] text-white shadow-lg"
                      : "text-[#3A4E63] hover:bg-[#F5F8FF]"
                  }
                `}
                  >
                    <div
                      className={`p-2 rounded-xl ${
                        activeChannel?.id === channel.id
                          ? "bg-white/20"
                          : "bg-[#F5F8FF]"
                      }`}
                    >
                      {channel.type === "private" ? (
                        <Lock className="h-4 w-4" strokeWidth={2.5} />
                      ) : (
                        <Hash className="h-4 w-4" strokeWidth={2.5} />
                      )}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-bold truncate flex-1">
                        {channel.name}
                      </span>
                    )}
                  </button>
                ))}

            {!sidebarCollapsed && viewMode === "chat" && (
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-bold text-[#3A4E63]/70 uppercase tracking-wider">
                  Direct Messages
                </span>
                <button
                  onClick={() => setShowNewDMModal(true)}
                  className="p-1.5 hover:bg-[#3A4E63]/10 text-[#3A4E63] rounded-lg transition-all"
                >
                  <Plus className="h-4 w-4" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {viewMode === "chat" &&
              channels
                .filter(
                  (ch) =>
                    ch.type === "direct" &&
                    (!searchQuery ||
                      ch.name
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())),
                )
                .map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel)}
                    className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all duration-300
                  ${
                    activeChannel?.id === channel.id
                      ? "bg-gradient-to-r from-[#3A4E63] to-[#0147CC] text-white shadow-lg"
                      : "text-[#3A4E63] hover:bg-[#F5F8FF]"
                  }
                `}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        activeChannel?.id === channel.id
                          ? "bg-white/20 text-white"
                          : "bg-gradient-to-br from-[#3A4E63] to-[#0147CC] text-white"
                      }`}
                    >
                      {channel.name?.charAt(0) || "U"}
                    </div>
                    {!sidebarCollapsed && (
                      <span className="text-sm font-bold truncate flex-1">
                        {channel.name}
                      </span>
                    )}
                  </button>
                ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            {/* Channel Header */}
            <div className="h-16 bg-white border-b border-[#3A4E63]/10 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeChannel.type === "private" ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl flex items-center justify-center shadow-md">
                    <Lock className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                ) : activeChannel.type === "direct" ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl flex items-center justify-center shadow-md text-white font-bold">
                    {activeChannel.name?.charAt(0)}
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-2xl flex items-center justify-center shadow-md">
                    <Hash className="h-5 w-5 text-white" strokeWidth={2.5} />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-[#3A4E63]">
                    {activeChannel.name}
                  </h3>
                  {activeChannel.description && (
                    <p className="text-xs text-[#3A4E63]/60 font-semibold">
                      {activeChannel.description}
                    </p>
                  )}
                </div>
              </div>

              {activeChannel.type === "direct" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => makeCall("audio")}
                    className="p-2.5 hover:bg-[#F5F8FF] rounded-xl transition-all"
                  >
                    <Phone
                      className="h-5 w-5 text-[#3A4E63]"
                      strokeWidth={2.5}
                    />
                  </button>
                  <button
                    onClick={() => makeCall("video")}
                    className="p-2.5 hover:bg-[#F5F8FF] rounded-xl transition-all"
                  >
                    <VideoIcon
                      className="h-5 w-5 text-[#3A4E63]"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3A4E63] to-[#0147CC] flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-sm">
                      {message.user_name?.charAt(0) || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-bold text-[#3A4E63]">
                        {message.user_name}
                      </span>
                      <span className="text-xs text-[#3A4E63]/50 font-medium">
                        {formatTime(message.created_at)}
                      </span>
                    </div>

                    {message.type === "image" && message.file_url && (
                      <div className="mt-2">
                        <img
                          src={`${BACKEND_URL}${message.file_url}`}
                          alt={message.file_name}
                          className="max-w-md rounded-2xl shadow-lg hover:shadow-xl transition-shadow border border-[#3A4E63]/10"
                        />
                      </div>
                    )}

                    {message.type === "file" && message.file_url && (
                      <div className="mt-2 flex items-center gap-3 p-4 bg-[#F5F8FF] rounded-2xl max-w-md border border-[#3A4E63]/10 hover:shadow-md transition-all">
                        <div className="p-3 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-xl shadow-md">
                          <File className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-[#3A4E63] truncate">
                            {message.file_name}
                          </p>
                        </div>
                        <a
                          href={`${BACKEND_URL}${message.file_url}`}
                          download
                          className="p-2 hover:bg-white rounded-xl transition-all"
                        >
                          <Download
                            className="h-5 w-5 text-[#3A4E63]"
                            strokeWidth={2.5}
                          />
                        </a>
                      </div>
                    )}

                    <p className="text-[#3A4E63]/80 leading-relaxed font-medium">
                      {message.content}
                    </p>

                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              addReaction(message.id, reaction.emoji)
                            }
                            className="px-3 py-1.5 bg-[#F5F8FF] hover:bg-[#3A4E63]/10 rounded-xl text-sm transition-all border border-[#3A4E63]/10"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="ml-1 text-xs font-bold text-[#3A4E63]">
                              {reaction.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-2">
                      <button
                        onClick={() => setReplyToMessage(message)}
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-xl transition-all"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="p-2 hover:bg-yellow-100 text-yellow-600 rounded-xl transition-all"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      {message.user_id === user?.id && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-2 hover:bg-red-100 text-red-600 rounded-xl transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {uploadingFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 bg-[#F5F8FF] border-2 border-[#3A4E63]/20 border-dashed rounded-2xl"
                >
                  <Paperclip
                    className="h-5 w-5 text-[#3A4E63]"
                    strokeWidth={2.5}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-[#3A4E63]">
                      {file.name}
                    </p>
                    <div className="w-full bg-[#3A4E63]/20 rounded-full h-2 mt-2">
                      <div
                        className="bg-gradient-to-r from-[#3A4E63] to-[#0147CC] h-2 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {replyToMessage && (
              <div className="px-6 py-3 bg-[#F5F8FF] border-t border-[#3A4E63]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-[#3A4E63]" strokeWidth={2.5} />
                  <span className="text-sm text-[#3A4E63]/80 font-medium">
                    Replying to{" "}
                    <span className="font-bold">
                      {replyToMessage.user_name}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setReplyToMessage(null)}
                  className="p-1 hover:bg-[#3A4E63]/10 rounded-lg"
                >
                  <X className="h-4 w-4 text-[#3A4E63]" strokeWidth={2.5} />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t border-[#3A4E63]/10 p-4 bg-white">
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    document.querySelector('input[type="file"]').click()
                  }
                  className="p-3 hover:bg-[#F5F8FF] rounded-2xl transition-all"
                >
                  <Paperclip
                    className="h-5 w-5 text-[#3A4E63]"
                    strokeWidth={2.5}
                  />
                </button>
                <input
                  type="text"
                  placeholder={`Message ${activeChannel.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-[#F5F8FF] border-2 border-transparent focus:border-[#3A4E63] focus:bg-white rounded-2xl font-medium transition-all text-[#3A4E63] placeholder:text-[#3A4E63]/40"
                />
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 hover:bg-[#F5F8FF] rounded-2xl transition-all"
                  >
                    <Smile
                      className="h-5 w-5 text-[#3A4E63]"
                      strokeWidth={2.5}
                    />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          if (typeof showEmojiPicker === "string") {
                            addReaction(showEmojiPicker, emojiData.emoji);
                          } else {
                            setNewMessage((prev) => prev + emojiData.emoji);
                          }
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-[#3A4E63] to-[#0147CC] hover:from-[#0147CC] hover:to-[#3A4E63] text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Send className="h-5 w-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-[#3A4E63] to-[#0147CC] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                <Hash className="h-12 w-12 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-[#3A4E63] mb-2">
                Select a channel
              </h3>
              <p className="text-[#3A4E63]/70 font-semibold">
                Choose a channel from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {showNewChannelModal && (
        <NewChannelModal
          onClose={() => setShowNewChannelModal(false)}
          onCreate={createChannel}
        />
      )}
      {showNewDMModal && (
        <NewDMModal
          onClose={() => setShowNewDMModal(false)}
          onCreate={createDM}
          token={token}
        />
      )}
    </div>
  );
};

const NewChannelModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("public");

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black gradient-text">Create Channel</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Channel Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-200 focus:border-blue-500 rounded-2xl"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 focus:border-blue-500 rounded-2xl resize-none"
            />
          </div>
          <button
            onClick={() => name.trim() && onCreate(name, description, type)}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

const NewDMModal = ({ onClose, onCreate, token }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

  const searchUsers = async (query = "") => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/users/search?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  useEffect(() => {
    searchUsers("");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 fade-in">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black gradient-text">
            New Direct Message
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-blue-500 rounded-2xl"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onCreate(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold">
                  {user.full_name?.charAt(0)}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold text-slate-900">{user.full_name}</p>
                  <p className="text-xs text-slate-600">{user.email}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IBChatPremium;
