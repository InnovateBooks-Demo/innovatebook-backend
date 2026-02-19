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
} from "lucide-react";
import axios from "axios";
import EmojiPicker from "emoji-picker-react";
import { useDropzone } from "react-dropzone";
import SimplePeer from "simple-peer";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const IBChatComplete = () => {
  // State management
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
  const [editingMessage, setEditingMessage] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});
  const [showThreadPanel, setShowThreadPanel] = useState(false);
  const [activeThread, setActiveThread] = useState(null);
  const [threadReplies, setThreadReplies] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [starredMessages, setStarredMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // WebRTC state
  const [inCall, setInCall] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' or 'video'
  const [callId, setCallId] = useState(null);
  const [peer, setPeer] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [audioMuted, setAudioMuted] = useState(false);
  const [videoMuted, setVideoMuted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const token = localStorage.getItem("access_token");

  // Initialize
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadChannels();
    loadStarredMessages();
    loadNotifications();
    updateUserStatus("online");
  }, []);

  // Load channels
  const loadChannels = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/channels`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChannels(response.data);
      if (response.data.length > 0 && !activeChannel) {
        setActiveChannel(response.data[0]);
      }
    } catch (error) {
      console.error("Error loading channels:", error);
    }
  };

  // Update user status
  const updateUserStatus = async (status) => {
    try {
      await axios.put(
        `${BACKEND_URL}/api/chat/users/me/status?status=${status}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Load messages
  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel.id);
      loadPinnedMessages(activeChannel.id);
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

  // Load pinned messages
  const loadPinnedMessages = async (channelId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/channels/${channelId}/pinned`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setPinnedMessages(response.data);
    } catch (error) {
      console.error("Error loading pinned messages:", error);
    }
  };

  // Load starred messages
  const loadStarredMessages = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/starred`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStarredMessages(response.data);
    } catch (error) {
      console.error("Error loading starred messages:", error);
    }
  };

  // Load notifications
  const loadNotifications = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/notifications?unread_only=true`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    if (!user?.id) return;

    const backendWsUrl = BACKEND_URL.replace("http://", "ws://").replace(
      "https://",
      "wss://",
    );
    // const wsUrl = `${backendWsUrl}/api/chat/ws/${user.id}`;
    // const websocket = new WebSocket(wsUrl);
    const token = localStorage.getItem("access_token") || "";
    const wsUrl = `${backendWsUrl}/api/chat/ws/${user.id}?token=${encodeURIComponent(token)}`;


    websocket.onopen = () => {
      console.log("WebSocket connected");
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
      console.log("WebSocket disconnected");
      setTimeout(connectWebSocket, 3000);
    };

    setWs(websocket);

    return () => {
      if (websocket) websocket.close();
    };
  };

  // Handle WebSocket messages
  const handleWebSocketMessage = (data) => {
    switch (data.type) {
      case "new_message":
        if (data.data.channel_id === activeChannel?.id) {
          setMessages((prev) => [...prev, data.data]);
          scrollToBottom();
        }
        break;
      case "message_updated":
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.data.message_id
              ? { ...msg, content: data.data.content, edited: true }
              : msg,
          ),
        );
        break;
      case "message_deleted":
        setMessages((prev) =>
          prev.filter((msg) => msg.id !== data.data.message_id),
        );
        break;
      case "presence_changed":
        setUserStatuses((prev) => ({
          ...prev,
          [data.data.user_id]: data.data.status,
        }));
        break;
      case "call_invitation":
        handleIncomingCall(data.data);
        break;
      case "call_answered":
        handleCallAnswered(data.data);
        break;
      case "call_rejected":
        handleCallRejected();
        break;
      case "call_ended":
        endCall();
        break;
      case "webrtc_signal":
        handleWebRTCSignal(data.data.signal);
        break;
      default:
        break;
    }
  };

  // File upload
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

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/messages`,
        {
          channel_id: activeChannel.id,
          content: newMessage,
          type: "text",
          parent_id: replyToMessage?.id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setNewMessage("");
      setReplyToMessage(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Message actions
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

  const pinMessage = async (messageId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/messages/${messageId}/pin`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      loadPinnedMessages(activeChannel.id);
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const starMessage = async (messageId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/messages/${messageId}/star`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      loadStarredMessages();
    } catch (error) {
      console.error("Error starring message:", error);
    }
  };

  // Thread management
  const openThread = async (message) => {
    setActiveThread(message);
    setShowThreadPanel(true);

    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/chat/messages/${message.id}/replies`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setThreadReplies(response.data);
    } catch (error) {
      console.error("Error loading thread:", error);
    }
  };

  // WebRTC - Initiate call
  const initiateCall = async (type) => {
    if (!activeChannel || activeChannel.type !== "direct") {
      alert("Calls are only available in direct messages");
      return;
    }

    try {
      const recipientId = activeChannel.members.find((m) => m !== user.id);
      const response = await axios.post(
        `${BACKEND_URL}/api/chat/call/initiate?recipient_id=${recipientId}&call_type=${type}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCallId(response.data.call_id);
      setCallType(type);
      setInCall(true);

      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "video",
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current && type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer (initiator)
      const newPeer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      newPeer.on("signal", (signal) => {
        axios.post(
          `${BACKEND_URL}/api/chat/call/${response.data.call_id}/signal`,
          { signal },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      });

      newPeer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      console.error("Error initiating call:", error);
    }
  };

  // WebRTC - Handle incoming call
  const handleIncomingCall = (data) => {
    setIncomingCall(data);
  };

  // WebRTC - Answer call
  const answerCall = async () => {
    if (!incomingCall) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/call/${incomingCall.call_id}/answer`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setCallId(incomingCall.call_id);
      setCallType(incomingCall.call_type);
      setInCall(true);
      setIncomingCall(null);

      // Get local media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: incomingCall.call_type === "video",
        audio: true,
      });
      setLocalStream(stream);
      if (localVideoRef.current && incomingCall.call_type === "video") {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer (receiver)
      const newPeer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      newPeer.on("signal", (signal) => {
        axios.post(
          `${BACKEND_URL}/api/chat/call/${incomingCall.call_id}/signal`,
          { signal },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      });

      newPeer.on("stream", (remoteStream) => {
        setRemoteStream(remoteStream);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });

      setPeer(newPeer);
    } catch (error) {
      console.error("Error answering call:", error);
    }
  };

  // WebRTC - Reject call
  const rejectCall = async () => {
    if (!incomingCall) return;

    try {
      await axios.post(
        `${BACKEND_URL}/api/chat/call/${incomingCall.call_id}/reject`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setIncomingCall(null);
    } catch (error) {
      console.error("Error rejecting call:", error);
    }
  };

  // WebRTC - Handle signals
  const handleWebRTCSignal = (signal) => {
    if (peer) {
      peer.signal(signal);
    }
  };

  const handleCallAnswered = (data) => {
    // Call was answered by remote peer
    console.log("Call answered");
  };

  const handleCallRejected = () => {
    endCall();
    alert("Call was rejected");
  };

  // WebRTC - End call
  const endCall = async () => {
    try {
      if (callId) {
        await axios.post(
          `${BACKEND_URL}/api/chat/call/${callId}/end`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
      }
    } catch (error) {
      console.error("Error ending call:", error);
    }

    // Clean up
    if (peer) {
      peer.destroy();
      setPeer(null);
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
      setRemoteStream(null);
    }

    setInCall(false);
    setCallId(null);
    setCallType(null);
    setAudioMuted(false);
    setVideoMuted(false);
  };

  // WebRTC - Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setAudioMuted(!audioMuted);
    }
  };

  // WebRTC - Toggle video
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setVideoMuted(!videoMuted);
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
      className="h-full flex bg-white"
      style={{ fontFamily: "Poppins" }}
      {...getRootProps()}
    >
      <input {...getInputProps()} />

      {/* Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-[#033F99]/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Paperclip className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center">
              Drop files here
            </h3>
            <p className="text-slate-600 text-center mt-2">
              Upload to {activeChannel?.name}
            </p>
          </div>
        </div>
      )}

      {/* Incoming Call Modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-96 shadow-2xl text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center mx-auto mb-6">
              {incomingCall.call_type === "video" ? (
                <VideoIcon className="h-12 w-12 text-white" />
              ) : (
                <Phone className="h-12 w-12 text-white" />
              )}
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              {incomingCall.caller_name}
            </h3>
            <p className="text-slate-600 mb-8">
              Incoming {incomingCall.call_type} call...
            </p>
            <div className="flex gap-4">
              <button
                onClick={rejectCall}
                className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all"
              >
                Decline
              </button>
              <button
                onClick={answerCall}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-all"
              >
                Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Call UI */}
      {inCall && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <div className="flex-1 relative">
            {/* Remote video */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Local video (Picture-in-Picture) */}
            {callType === "video" && (
              <div className="absolute bottom-6 right-6 w-64 h-48 bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          {/* Call controls */}
          <div className="h-24 bg-slate-900 flex items-center justify-center gap-4">
            <button
              onClick={toggleAudio}
              className={`p-4 rounded-full transition-all ${audioMuted ? "bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                }`}
            >
              {audioMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-white" />
              )}
            </button>

            {callType === "video" && (
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${videoMuted ? "bg-red-600" : "bg-slate-700 hover:bg-slate-600"
                  }`}
              >
                {videoMuted ? (
                  <VideoOff className="h-6 w-6 text-white" />
                ) : (
                  <VideoIcon className="h-6 w-6 text-white" />
                )}
              </button>
            )}

            <button
              onClick={endCall}
              className="p-4 bg-red-600 rounded-full hover:bg-red-700 transition-all"
            >
              <PhoneOff className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <div className="w-64 bg-[#033F99]/5 border-r-2 border-[#033F99]/20 flex flex-col">
        <div className="p-4 border-b-2 border-[#033F99]/20">
          <h2 className="text-xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
            IB Chat
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">
            {channels.length} channels
          </p>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Channels
              </span>
              <button
                onClick={() => setShowNewChannelModal(true)}
                className="p-1 hover:bg-[#033F99]/10 rounded"
              >
                <Plus className="h-4 w-4 text-[#033F99]" />
              </button>
            </div>

            {channels
              .filter((ch) => ch.type !== "direct")
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${activeChannel?.id === channel.id
                    ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-lg"
                    : "hover:bg-[#033F99]/10 text-slate-700"
                    }`}
                >
                  {channel.type === "private" ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Hash className="h-4 w-4" />
                  )}
                  <span className="text-sm font-bold truncate">
                    {channel.name}
                  </span>
                </button>
              ))}

            <div className="flex items-center justify-between px-3 py-2 mt-4">
              <span className="text-xs font-bold text-slate-600 uppercase">
                Direct Messages
              </span>
              <button
                onClick={() => setShowNewDMModal(true)}
                className="p-1 hover:bg-[#033F99]/10 rounded"
              >
                <Plus className="h-4 w-4 text-[#033F99]" />
              </button>
            </div>

            {channels
              .filter((ch) => ch.type === "direct")
              .map((channel) => (
                <button
                  key={channel.id}
                  onClick={() => setActiveChannel(channel)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${activeChannel?.id === channel.id
                    ? "bg-gradient-to-r from-[#033F99] to-[#033F99] text-white shadow-lg"
                    : "hover:bg-[#033F99]/10 text-slate-700"
                    }`}
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {channel.name?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-bold truncate">
                    {channel.name}
                  </span>
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {activeChannel ? (
          <>
            <div className="h-16 border-b-2 border-[#033F99]/20 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeChannel.type === "private" ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                ) : activeChannel.type === "direct" ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {activeChannel.name?.charAt(0)}
                    </span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-900">
                    {activeChannel.name}
                  </h3>
                  {activeChannel.description && (
                    <p className="text-xs text-slate-600">
                      {activeChannel.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeChannel.type === "direct" && (
                  <>
                    <button
                      onClick={() => initiateCall("audio")}
                      className="p-2 hover:bg-[#033F99]/10 rounded-lg"
                    >
                      <Phone className="h-5 w-5 text-[#033F99]" />
                    </button>
                    <button
                      onClick={() => initiateCall("video")}
                      className="p-2 hover:bg-[#033F99]/10 rounded-lg"
                    >
                      <VideoIcon className="h-5 w-5 text-[#033F99]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {message.user_name?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-900">
                        {message.user_name}
                      </span>
                      <span className="text-xs text-slate-500">
                        {formatTime(message.created_at)}
                      </span>
                      {message.edited && (
                        <span className="text-xs text-slate-400 italic">
                          (edited)
                        </span>
                      )}
                    </div>

                    {message.type === "image" && message.file_url && (
                      <img
                        src={`${BACKEND_URL}${message.file_url}`}
                        alt={message.file_name}
                        className="max-w-md rounded-xl shadow-lg mt-2"
                      />
                    )}
                    {message.type === "file" && message.file_url && (
                      <div className="mt-2 flex items-center gap-3 p-3 bg-slate-100 rounded-xl max-w-md">
                        <File className="h-8 w-8 text-[#033F99]" />
                        <div className="flex-1">
                          <p className="text-sm font-bold">
                            {message.file_name}
                          </p>
                        </div>
                        <a
                          href={`${BACKEND_URL}${message.file_url}`}
                          download
                          className="p-2 hover:bg-white rounded-lg"
                        >
                          <Download className="h-5 w-5 text-[#033F99]" />
                        </a>
                      </div>
                    )}
                    <p className="text-slate-700 mt-1">{message.content}</p>

                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              addReaction(message.id, reaction.emoji)
                            }
                            className="px-2 py-1 bg-slate-100 rounded-lg text-sm hover:bg-slate-200"
                          >
                            {reaction.emoji} {reaction.count}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-2">
                      <button
                        onClick={() => setReplyToMessage(message)}
                        className="p-1.5 hover:bg-[#033F99]/10 rounded text-[#033F99]"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openThread(message)}
                        className="p-1.5 hover:bg-[#033F99]/10 rounded text-[#033F99]"
                      >
                        <Hash className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="p-1.5 hover:bg-[#033F99]/10 rounded text-[#033F99]"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => pinMessage(message.id)}
                        className="p-1.5 hover:bg-[#033F99]/10 rounded text-[#033F99]"
                      >
                        <Pin className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => starMessage(message.id)}
                        className="p-1.5 hover:bg-[#033F99]/10 rounded text-[#033F99]"
                      >
                        <Star className="h-4 w-4" />
                      </button>
                      {message.user_id === user?.id && (
                        <button
                          onClick={() => deleteMessage(message.id)}
                          className="p-1.5 hover:bg-red-100 rounded text-red-600"
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
                  className="flex items-center gap-3 p-3 bg-[#033F99]/10 rounded-xl"
                >
                  <Paperclip className="h-5 w-5 text-[#033F99]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold">{file.name}</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-[#033F99] to-[#033F99] h-2 rounded-full"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {replyToMessage && (
              <div className="px-6 py-2 bg-[#033F99]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-[#033F99]" />
                  <span className="text-sm">
                    Replying to{" "}
                    <span className="font-bold">
                      {replyToMessage.user_name}
                    </span>
                  </span>
                </div>
                <button
                  onClick={() => setReplyToMessage(null)}
                  className="p-1 hover:bg-white rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <div className="border-t-2 border-[#033F99]/20 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    document.querySelector('input[type="file"]').click()
                  }
                  className="p-3 hover:bg-[#033F99]/10 rounded-xl"
                >
                  <Paperclip className="h-5 w-5 text-[#033F99]" />
                </button>
                <input
                  type="text"
                  placeholder={`Message #${activeChannel.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !e.shiftKey &&
                    (e.preventDefault(), sendMessage())
                  }
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#033F99] focus:outline-none"
                />
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 hover:bg-[#033F99]/10 rounded-xl"
                  >
                    <Smile className="h-5 w-5 text-[#033F99]" />
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
                  className="px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl shadow-lg"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Hash className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">
                Select a channel
              </h3>
              <p className="text-slate-600">
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

// Modals (simplified for brevity - use same as Enhanced version)
const NewChannelModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("public");

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
            Create Channel
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
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
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-[#033F99] focus:outline-none"
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
              className="w-full px-4 py-3 border-2 rounded-xl focus:border-[#033F99] focus:outline-none resize-none"
            />
          </div>
          <button
            onClick={() => name.trim() && onCreate(name, description, type)}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#033F99] to-[#033F99] text-white font-bold rounded-xl"
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

  // Load all users when modal opens
  useEffect(() => {
    searchUsers("");
  }, []);

  // Search as user types
  useEffect(() => {
    const timer = setTimeout(() => searchUsers(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-[#033F99] to-[#033F99] bg-clip-text text-transparent">
            New DM
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg"
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
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-3 border-2 rounded-xl focus:border-[#033F99] focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onCreate(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#033F99]/10 rounded-xl"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#033F99] to-[#033F99] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user.full_name?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-left">
                  <p className="font-bold">{user.full_name}</p>
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

export default IBChatComplete;
