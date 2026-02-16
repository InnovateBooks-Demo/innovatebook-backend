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
  Check,
  CheckCheck,
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
} from "lucide-react";

const API_URL = process.env.REACT_APP_BACKEND_URL;

const SecureImage = ({ src, alt, className }) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let objectUrl = null;
    const fetchImage = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(src, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const blob = await response.blob();
          objectUrl = URL.createObjectURL(blob);
          setImageSrc(objectUrl);
        }
      } catch (error) {
        console.error("Error loading image:", error);
      } finally {
        setLoading(false);
      }
    };

    if (src) fetchImage();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (loading) return <div className={`animate-pulse bg-gray-200 ${className}`} />;
  if (!imageSrc) return null;

  return <img src={imageSrc} alt={alt} className={className} />;
};

const WorkspaceChats = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [newChat, setNewChat] = useState({
    context_id: "",
    chat_type: "internal",
    visibility_scope: "internal_only",
  });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState("");

  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // userId -> timestamp

  const typingTimeoutRef = useRef(null);

  // Video Call State
  const [isCallActive, setIsCallActive] = useState(false);
  const [incomingCall, setIncomingCall] = useState(null); // { from_user_id, offer }
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const localVideoRef = useRef(null);
  const peersRef = useRef({}); // userId -> RTCPeerConnection

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const wsRef = useRef(null);

  // Attach local stream to video element when it becomes available
  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream, isCallActive]);

  useEffect(() => {
    fetchChats();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setMessages([]); // Clear previous messages immediately
      fetchMessages(selectedChat.chat_id);
      connectWebSocket(selectedChat.chat_id);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [selectedChat]);

  // Mark chat as read when opening or receiving messages while open
  useEffect(() => {
    if (selectedChat && messages.length > 0) {
      const lastMsg = messages[messages.length - 1];
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        // Only if last message wasn't sent by me
        // In a real app we'd check if we already read it, but this is safe
        try {
          const token = localStorage.getItem("access_token");
          // Simple decoding to get user_id, in production use a library or context
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.sub || payload.sub;

          if (lastMsg.sender_id !== userId) {
            wsRef.current.send(JSON.stringify({
              type: "chat_read",
              chat_id: selectedChat.chat_id,
              message_id: lastMsg.message_id
            }));
          }
        } catch (e) { console.error(e); }
      }
    }
  }, [messages, selectedChat]);

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

  const connectWebSocket = (chatId) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const token = localStorage.getItem("access_token");
    // Use wss:// if https, else ws://
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    // Construct WS URL - ensure we use the backend host, not frontend
    // API_URL usually is http://localhost:8000, so we replace http with ws
    const wsUrl = `${API_URL.replace(/^http/, "ws")}/api/workspace/ws/${chatId}?token=${token}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log("Connected to chat WS");
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if ((data.event === "new_message" || data.event === "message:new") && data.chat_id === chatId) {
          const incomingMessage = data.message || {
            message_id: data.message_id,
            chat_id: data.chat_id,
            sender_id: data.sender_id,
            sender_name: data.sender_name || "User",
            sender_type: data.sender_type || "internal",
            content_type: data.content_type || "text",
            payload: data.text || data.payload,
            created_at: data.created_at,
            edited: false
          };

          setMessages((prev) => {
            if (prev.some(m => m.message_id === incomingMessage.message_id)) return prev;
            return [...prev, incomingMessage];
          });

          // Update chat list with new last_message_at
          setChats((prev) => {
            return prev.map(chat => {
              if (chat.chat_id === data.chat_id) {
                return { ...chat, last_message_at: data.created_at };
              }
              return chat;
            }).sort((a, b) => {
              const timeA = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
              const timeB = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
              return timeB - timeA;
            });
          });

          // Remove from typing if they sent a message
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[incomingMessage.sender_id];
            return next;
          });
        }
        else if (data.event === "user_online") {
          setOnlineUsers(prev => new Set(prev).add(data.user_id));
        }
        else if (data.event === "user_offline") {
          setOnlineUsers(prev => {
            const next = new Set(prev);
            next.delete(data.user_id);
            return next;
          });
        }
        else if (data.event === "typing_start" && data.chat_id === chatId) {
          setTypingUsers(prev => ({
            ...prev,
            [data.user_id]: Date.now()
          }));

          // Auto-expire typing status after 4s (safety net)
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = { ...prev };
              if (next[data.user_id] && Date.now() - next[data.user_id] > 3000) {
                delete next[data.user_id];
                return next;
              }
              return prev;
            });
          }, 4000);
        }
        else if (data.event === "typing_stop" && data.chat_id === chatId) {
          setTypingUsers(prev => {
            const next = { ...prev };
            delete next[data.user_id];
            return next;
          });
        }
        else if (data.event === "message_status_update" && data.chat_id === chatId) {
          setMessages(prev => prev.map(msg => {
            if (data.status_type === "delivered") {
              if (msg.message_id === data.message_id) {
                return {
                  ...msg,
                  delivered_to: [...(msg.delivered_to || []), data.user_id]
                };
              }
            } else if (data.status_type === "read") {
              // Mark all prior messages as read by this user
              // logic: if msg timestamp <= event timestamp (implied by execution time)
              // For simplicity, we just mark all currently loaded messages for now
              return {
                ...msg,
                read_by: [...(msg.read_by || []), data.user_id]
              };
            }
            return msg;
          }));
        }
        else if (data.event === "call_offer") {
          // Get my user ID
          const token = localStorage.getItem("access_token");
          let currentUserId = null;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.sub || payload.sub;
          } catch (e) { }

          // Only handle if sent to ME and not already in call
          if (data.to_user_id === currentUserId && !isCallActive) {
            setIncomingCall({
              from_user_id: data.from_user_id,
              offer: data.offer,
              chat_id: data.chat_id
            });
          }
        }
        else if (data.event === "call_answer") {
          const peer = peersRef.current[data.from_user_id];
          if (peer && peer.signalingState === "have-local-offer") {
            peer.setRemoteDescription(new RTCSessionDescription(data.answer));
          }
        }
        else if (data.event === "ice_candidate") {
          // Get my user ID
          const token = localStorage.getItem("access_token");
          let currentUserId = null;
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            currentUserId = payload.sub || payload.sub;
          } catch (e) { }

          // Only verify if candidate is for me
          if (data.to_user_id === currentUserId) {
            const peer = peersRef.current[data.from_user_id];
            if (peer && data.candidate) {
              peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
          }
        }
        else if (data.event === "call_end") {
          endCall(false); // End without sending event back
        }
      } catch (error) {
        console.error("Error parsing WS message:", error);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from chat WS");
    };

    wsRef.current = ws;
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success && data.users) {
        setAvailableUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
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

      // Stop typing immediately when sent
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "typing_stop" }));
      }

      setNewMessage("");
      // fetchMessages(selectedChat.chat_id); // No longer needed as much due to real-time, but keep as fallback if desired
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
        body: JSON.stringify({
          ...newChat,
          participants: selectedParticipants
        }),
      });

      if (response.ok) {
        const chat = await response.json();

        setSelectedParticipants([]);
        setUserSearchQuery("");
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

  const getIceConfig = () => ({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  const createPeer = (userId, initiator = false) => {
    const peer = new RTCPeerConnection(getIceConfig());

    peer.onicecandidate = (e) => {
      if (e.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "ice_candidate",
          chat_id: selectedChat.chat_id,
          to_user_id: userId,
          candidate: e.candidate
        }));
      }
    };

    peer.ontrack = (e) => {
      setRemoteStreams(prev => ({
        ...prev,
        [userId]: e.streams[0]
      }));
    };

    if (localStream) {
      localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    }

    peersRef.current[userId] = peer;
    return peer;
  };

  const startCall = async (videoEnabled = true) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: videoEnabled, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);
      setIsVideoOff(!videoEnabled);

      if (localVideoRef.current && videoEnabled) localVideoRef.current.srcObject = stream;

      // For simplicity in this mesh, we broadcast an offer to everyone
      // In real mesh, we should iterate participants and create offer for each
      // But here we rely on the backend to broadcast (which is a bit hacky for mesh offers but ok for 1:1)

      // Actually, let's just assume we want to call all current participants
      // We need to create a peer for each? 
      // Implementation shortcut: Just send one offer broadcast, and whoever answers initiates a peer flow?
      // Standard WebRTC requires distinct PeerConnection per pair.

      // Let's iterate other participants.
      const otherParticipants = selectedChat.participants.filter(id => {
        // get my user id from token
        const token = localStorage.getItem("access_token");
        const payload = JSON.parse(atob(token.split('.')[1]));
        const myId = payload.sub || payload.sub;
        return id !== myId;
      });

      otherParticipants.forEach(async (userId) => {
        const peer = createPeer(userId, true);
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        if (wsRef.current) {
          wsRef.current.send(JSON.stringify({
            type: "call_offer",
            chat_id: selectedChat.chat_id,
            to_user_id: userId,
            offer: offer
          }));
        }
      });

    } catch (err) {
      console.error("Failed to start call", err);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    try {
      // For answering, we default to video for now, or match offer? 
      // Simplified: always answer with video+audio unless user toggles off later
      // Or we could check if offer had video?
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      setIsCallActive(true);

      const peer = createPeer(incomingCall.from_user_id, false);
      await peer.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "call_answer",
          chat_id: incomingCall.chat_id,
          to_user_id: incomingCall.from_user_id,
          answer: answer
        }));
      }

      setIncomingCall(null);
    } catch (err) {
      console.error("Failed to accept call", err);
    }
  };

  const rejectCall = () => {
    setIncomingCall(null);
    // Optional: send reject event
  };

  const endCall = (notify = true) => {
    Object.values(peersRef.current).forEach(peer => peer.close());
    peersRef.current = {};

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStreams({});
    setIsCallActive(false);

    if (notify && wsRef.current && selectedChat) {
      wsRef.current.send(JSON.stringify({
        type: "call_end",
        chat_id: selectedChat.chat_id
      }));
    }
  };

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chat_id", selectedChat.chat_id);

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `${API_URL}/api/workspace/chats/${selectedChat.chat_id}/attachments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        fetchMessages(selectedChat.chat_id);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_URL}${fileUrl}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error("Download failed:", response.statusText);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getChatTypeColor = (type) => {
    switch (type) {
      case "internal":
        return "bg-blue-500";
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
                className={`w-full flex items-center gap-3 p-4 text-left border-b border-gray-100 transition-colors ${selectedChat?.chat_id === chat.chat_id
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
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => startCall(false)}
                  title="Start Audio Call"
                >
                  <Phone className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => startCall(true)}
                  title="Start Video Call"
                >
                  <VideoIcon className="h-5 w-5" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  onClick={() => setShowParticipantsModal(true)}
                  title="View Participants"
                >
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
                        {/* Status Indicators */}
                        {message.sender_type === "internal" && ( // Show only for internal (user's) messages roughly
                          <span className="ml-1">
                            {message.read_by?.length > 0 ? (
                              <CheckCheck className="h-3 w-3 text-blue-500" />
                            ) : message.delivered_to?.length > 0 ? (
                              <CheckCheck className="h-3 w-3 text-gray-400" />
                            ) : (
                              <Check className="h-3 w-3 text-gray-300" />
                            )}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 p-3 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-700 text-sm">
                          {message.content_type === "file" ? (
                            <div>
                              {message.file_name?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <SecureImage
                                  src={`${API_URL}${message.file_url}`}
                                  alt={message.file_name}
                                  className="max-w-xs rounded-lg mb-2"
                                />
                              ) : (
                                <div className="flex items-center gap-2 mb-2 p-2 bg-gray-100 rounded">
                                  <Paperclip className="h-4 w-4" />
                                  <span className="text-sm truncate max-w-xs">{message.file_name}</span>
                                </div>
                              )}
                              <button
                                onClick={() => handleDownload(message.file_url, message.file_name)}
                                className="text-xs text-blue-500 hover:underline flex items-center gap-1"
                              >
                                Download {message.file_name}
                              </button>
                            </div>
                          ) : (
                            message.payload
                          )}
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
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  className="p-2 text-gray-400 hover:text-gray-600"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);

                    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                      wsRef.current.send(JSON.stringify({ type: "typing_start" }));

                      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                      typingTimeoutRef.current = setTimeout(() => {
                        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                          wsRef.current.send(JSON.stringify({ type: "typing_stop" }));
                        }
                      }, 3000);
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={
                    Object.keys(typingUsers).length > 0
                      ? `${Object.keys(typingUsers).length} person(s) typing...`
                      : "Type a message..."
                  }
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63]"
                />
                {Object.keys(typingUsers).length > 0 && (
                  <div className="absolute bottom-16 left-20 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-75">
                    Someone is typing...
                  </div>
                )}
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
        )
        }
      </div >

      {/* Create Chat Modal */}
      {
        showCreateModal && (
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Participants ({selectedParticipants.length})
                  </label>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#3A4E63] mb-2 text-sm"
                  />
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                    {availableUsers
                      .filter(user =>
                        user.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                        user.email?.toLowerCase().includes(userSearchQuery.toLowerCase())
                      )
                      .map(user => (
                        <div
                          key={user.user_id}
                          className={`p-2 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${selectedParticipants.includes(user.user_id) ? 'bg-[#3A4E63]/5' : ''}`}
                          onClick={() => {
                            if (selectedParticipants.includes(user.user_id)) {
                              setSelectedParticipants(prev => prev.filter(id => id !== user.user_id));
                            } else {
                              setSelectedParticipants(prev => [...prev, user.user_id]);
                            }
                          }}
                        >
                          <div className={`w-4 h-4 border rounded flex items-center justify-center ${selectedParticipants.includes(user.user_id) ? 'bg-[#3A4E63] border-[#3A4E63]' : 'border-gray-300'}`}>
                            {selectedParticipants.includes(user.user_id) && <span className="text-white text-[10px]">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                      ))}
                    {availableUsers.length === 0 && (
                      <div className="p-4 text-center text-sm text-gray-500">No users found</div>
                    )}
                  </div>
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
        )
      }

      {/* Participants Modal */}
      {
        showParticipantsModal && selectedChat && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl w-full max-w-md mx-4">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    Chat Participants
                  </h2>
                  <button
                    onClick={() => setShowParticipantsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                {selectedChat.participants.map(participantId => {
                  const user = availableUsers.find(u => u.user_id === participantId) || { full_name: "Unknown User", email: "", user_id: participantId };
                  return (
                    <div key={participantId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 rounded-full bg-[#3A4E63] text-white flex items-center justify-center font-medium">
                        {user.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.full_name}</p>
                        {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                        <p className="text-[10px] text-gray-400">ID: {user.user_id}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      }

      {/* Incoming Call Modal */}
      {
        incomingCall && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className="bg-white rounded-xl p-6 w-80 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Incoming Video Call</h3>
              <p className="text-gray-500 mb-6">User {incomingCall.from_user_id} is calling...</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={rejectCall}
                  className="p-3 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                >
                  <PhoneOff className="h-6 w-6" />
                </button>
                <button
                  onClick={acceptCall}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors animate-pulse"
                >
                  <VideoIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Video Call Overlay */}
      {
        isCallActive && (
          <div className="fixed inset-0 bg-gray-900 z-[90] flex flex-col">
            {/* Header */}
            <div className="p-4 bg-black/20 text-white flex justify-between items-center backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                <span className="font-medium">Live Call</span>
              </div>
              <div className="text-sm opacity-75">
                {Object.keys(remoteStreams).length + 1} Participants
              </div>
            </div>

            {/* Video Grid */}
            <div className="flex-1 p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto">
              {/* Local Video */}
              <div className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video border border-gray-700">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-white text-xs">
                  You {isMuted && "(Muted)"}
                </div>
              </div>

              {/* Remote Videos */}
              {Object.entries(remoteStreams).map(([userId, stream]) => (
                <div key={userId} className="relative bg-gray-800 rounded-xl overflow-hidden aspect-video border border-gray-700">
                  <VideoComponent stream={stream} />
                  <div className="absolute bottom-3 left-3 bg-black/50 px-2 py-1 rounded text-white text-xs">
                    User {userId}
                  </div>
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/20 backdrop-blur-sm flex justify-center gap-6">
              <button
                onClick={toggleMute}
                className={`p-4 rounded-full transition-colors ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-colors ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isVideoOff ? <VideoOff className="h-6 w-6" /> : <VideoIcon className="h-6 w-6" />}
              </button>
              <button
                onClick={() => endCall(true)}
                className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <PhoneOff className="h-6 w-6" />
              </button>
            </div>
          </div>
        )
      }
    </div >
  );
};

// Helper component for remote video
const VideoComponent = ({ stream }) => {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  return <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />;
};

export default WorkspaceChats;
