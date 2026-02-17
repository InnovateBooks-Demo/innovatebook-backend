import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Send, Hash, Lock, Users, Plus, Search, Smile, Paperclip, MoreVertical,
  X, Edit2, Trash2, Image, File, Video, Download, Phone, Video as VideoIcon,
  Pin, Star, Reply, ChevronDown, AtSign, Bold, Italic, Code, Link as LinkIcon
} from 'lucide-react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDropzone } from 'react-dropzone';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const IBChatEnhanced = () => {
  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [ws, setWs] = useState(null);
  const [user, setUser] = useState(null);
  const [showNewChannelModal, setShowNewChannelModal] = useState(false);
  const [showNewDMModal, setShowNewDMModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [replyToMessage, setReplyToMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [uploadingFiles, setUploadingFiles] = useState([]);
  const [userStatuses, setUserStatuses] = useState({});

  const messagesEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const token = localStorage.getItem('access_token');

  // Initialize user and load channels
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    setUser(userData);
    loadChannels();
    updateUserStatus('online');
  }, []);

  // Load channels
  const loadChannels = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data);
      if (response.data.length > 0 && !activeChannel) {
        setActiveChannel(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading channels:', error);
    }
  };

  // Update user status
  const updateUserStatus = async (status) => {
    try {
      await axios.put(`${BACKEND_URL}/api/chat/users/me/status?status=${status}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Load messages for active channel
  useEffect(() => {
    if (activeChannel) {
      loadMessages(activeChannel.id);
      connectWebSocket();
    }
  }, [activeChannel]);

  // Load messages
  const loadMessages = async (channelId) => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/channels/${channelId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data);
      scrollToBottom();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  // WebSocket connection
  const connectWebSocket = () => {
    if (!user?.id) return;

    // Convert http/https to ws/wss
    const backendWsUrl = BACKEND_URL.replace('http://', 'ws://').replace('https://', 'wss://');
    // const wsUrl = `${backendWsUrl}/api/chat/ws/${user.id}`;
    // const websocket = new WebSocket(wsUrl);
    const token = localStorage.getItem("access_token") || "";
    const wsUrl = `${backendWsUrl}/api/chat/ws/${user.id}?token=${encodeURIComponent(token)}`;


    websocket.onopen = () => {
      console.log('WebSocket connected');
      if (activeChannel) {
        websocket.send(JSON.stringify({
          type: 'join_channel',
          channel_id: activeChannel.id
        }));
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
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
      case 'new_message':
        if (data.data.channel_id === activeChannel?.id) {
          setMessages(prev => [...prev, data.data]);
          scrollToBottom();
        }
        break;
      case 'message_updated':
        setMessages(prev => prev.map(msg =>
          msg.id === data.data.message_id
            ? { ...msg, content: data.data.content, edited: true }
            : msg
        ));
        break;
      case 'message_deleted':
        setMessages(prev => prev.filter(msg => msg.id !== data.data.message_id));
        break;
      case 'reaction_added':
        loadMessages(activeChannel.id);
        break;
      case 'presence_changed':
        setUserStatuses(prev => ({
          ...prev,
          [data.data.user_id]: data.data.status
        }));
        break;
      default:
        break;
    }
  };

  // File upload with drag & drop
  const onDrop = useCallback(async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      setUploadingFiles(prev => [...prev, { name: file.name, progress: 0 }]);

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('channel_id', activeChannel.id);

        const response = await axios.post(`${BACKEND_URL}/api/chat/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadingFiles(prev =>
              prev.map(f => f.name === file.name ? { ...f, progress: percentCompleted } : f)
            );
          }
        });

        // Send message with file
        await axios.post(`${BACKEND_URL}/api/chat/messages`, {
          channel_id: activeChannel.id,
          content: `Uploaded file: ${file.name}`,
          type: file.type.startsWith('image/') ? 'image' : 'file',
          file_url: response.data.file_url,
          file_name: file.name
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      } catch (error) {
        console.error('Error uploading file:', error);
        setUploadingFiles(prev => prev.filter(f => f.name !== file.name));
      }
    }
  }, [activeChannel, token]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true
  });

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel) return;

    try {
      await axios.post(`${BACKEND_URL}/api/chat/messages`, {
        channel_id: activeChannel.id,
        content: newMessage,
        type: 'text',
        parent_id: replyToMessage?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNewMessage('');
      setReplyToMessage(null);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Edit message
  const saveEditMessage = async () => {
    if (!editingMessage || !newMessage.trim()) return;

    try {
      await axios.put(`${BACKEND_URL}/api/chat/messages/${editingMessage.id}?content=${encodeURIComponent(newMessage)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingMessage(null);
      setNewMessage('');
    } catch (error) {
      console.error('Error editing message:', error);
    }
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    try {
      await axios.delete(`${BACKEND_URL}/api/chat/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  // Add reaction
  const addReaction = async (messageId, emoji) => {
    try {
      await axios.post(`${BACKEND_URL}/api/chat/messages/${messageId}/reactions?emoji=${encodeURIComponent(emoji)}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadMessages(activeChannel.id);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Create new channel
  const createChannel = async (name, description, type) => {
    try {
      await axios.post(`${BACKEND_URL}/api/chat/channels`, {
        name,
        description,
        type,
        members: []
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadChannels();
      setShowNewChannelModal(false);
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  // Create DM
  const createDM = async (recipientId) => {
    try {
      const response = await axios.post(`${BACKEND_URL}/api/chat/dm/create?recipient_id=${recipientId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      loadChannels();
      setActiveChannel(response.data);
      setShowNewDMModal(false);
    } catch (error) {
      console.error('Error creating DM:', error);
    }
  };

  // Format time
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Click outside to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="h-full flex bg-white" style={{ fontFamily: 'Poppins' }} {...getRootProps()}>
      <input {...getInputProps()} />

      {/* Drag & Drop Overlay */}
      {isDragActive && (
        <div className="fixed inset-0 bg-[#06B6D4]/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-12 shadow-2xl">
            <div className="w-24 h-24 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Paperclip className="h-12 w-12 text-white" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 text-center">Drop files here</h3>
            <p className="text-slate-600 text-center mt-2">Upload to {activeChannel?.name}</p>
          </div>
        </div>
      )}

      {/* Sidebar - Channels List */}
      <div className="w-64 bg-[#06B6D4]/5 border-r-2 border-[#06B6D4]/20 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b-2 border-[#06B6D4]/20">
          <h2 className="text-xl font-black bg-gradient-to-r from-[#06B6D4] to-[#0891B2] bg-clip-text text-transparent">
            IB Chat
          </h2>
          <p className="text-xs text-slate-600 font-medium mt-1">{channels.length} channels</p>
        </div>

        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border-2 border-slate-200 rounded-xl focus:border-[#06B6D4] focus:outline-none"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-xs font-bold text-slate-600 uppercase">Channels</span>
              <button
                onClick={() => setShowNewChannelModal(true)}
                className="p-1 hover:bg-[#06B6D4]/10 rounded"
              >
                <Plus className="h-4 w-4 text-[#06B6D4]" />
              </button>
            </div>

            {channels.filter(ch => ch.type === 'public' || ch.type === 'private').map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${activeChannel?.id === channel.id
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white shadow-lg'
                  : 'hover:bg-[#06B6D4]/10 text-slate-700'
                  }`}
              >
                {channel.type === 'private' ? (
                  <Lock className="h-4 w-4 flex-shrink-0" />
                ) : (
                  <Hash className="h-4 w-4 flex-shrink-0" />
                )}
                <span className="text-sm font-bold truncate">{channel.name}</span>
              </button>
            ))}

            <div className="flex items-center justify-between px-3 py-2 mt-4">
              <span className="text-xs font-bold text-slate-600 uppercase">Direct Messages</span>
              <button
                onClick={() => setShowNewDMModal(true)}
                className="p-1 hover:bg-[#06B6D4]/10 rounded"
              >
                <Plus className="h-4 w-4 text-[#06B6D4]" />
              </button>
            </div>

            {channels.filter(ch => ch.type === 'direct').map(channel => (
              <button
                key={channel.id}
                onClick={() => setActiveChannel(channel)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all ${activeChannel?.id === channel.id
                  ? 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white shadow-lg'
                  : 'hover:bg-[#06B6D4]/10 text-slate-700'
                  }`}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs">{channel.name?.charAt(0) || 'U'}</span>
                </div>
                <span className="text-sm font-bold truncate">{channel.name}</span>
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
            <div className="h-16 border-b-2 border-[#06B6D4]/20 px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {activeChannel.type === 'private' ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-xl flex items-center justify-center">
                    <Lock className="h-5 w-5 text-white" />
                  </div>
                ) : activeChannel.type === 'direct' ? (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{activeChannel.name?.charAt(0) || 'U'}</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-xl flex items-center justify-center">
                    <Hash className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-black text-slate-900">{activeChannel.name}</h3>
                  {activeChannel.description && (
                    <p className="text-xs text-slate-600">{activeChannel.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-[#06B6D4]/10 rounded-lg transition-colors">
                  <Phone className="h-5 w-5 text-[#06B6D4]" />
                </button>
                <button className="p-2 hover:bg-[#06B6D4]/10 rounded-lg transition-colors">
                  <VideoIcon className="h-5 w-5 text-[#06B6D4]" />
                </button>
                <button className="p-2 hover:bg-slate-100 rounded-lg">
                  <MoreVertical className="h-5 w-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="flex gap-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">
                      {message.user_name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-2">
                      <span className="font-bold text-slate-900">{message.user_name}</span>
                      <span className="text-xs text-slate-500">{formatTime(message.created_at)}</span>
                      {message.edited && (
                        <span className="text-xs text-slate-400 italic">(edited)</span>
                      )}
                    </div>

                    {/* Message Content */}
                    {message.type === 'image' && message.file_url && (
                      <div className="mt-2">
                        <img
                          src={`${BACKEND_URL}${message.file_url}`}
                          alt={message.file_name}
                          className="max-w-md rounded-xl shadow-lg"
                        />
                      </div>
                    )}
                    {message.type === 'file' && message.file_url && (
                      <div className="mt-2 flex items-center gap-3 p-3 bg-slate-100 rounded-xl max-w-md">
                        <File className="h-8 w-8 text-[#06B6D4]" />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{message.file_name}</p>
                        </div>
                        <a
                          href={`${BACKEND_URL}${message.file_url}`}
                          download
                          className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                          <Download className="h-5 w-5 text-[#06B6D4]" />
                        </a>
                      </div>
                    )}
                    <p className="text-slate-700 mt-1">{message.content}</p>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {message.reactions.map((reaction, idx) => (
                          <button
                            key={idx}
                            onClick={() => addReaction(message.id, reaction.emoji)}
                            className="px-2 py-1 bg-slate-100 rounded-lg text-sm hover:bg-slate-200 flex items-center gap-1"
                          >
                            <span>{reaction.emoji}</span>
                            <span className="text-xs font-bold text-slate-600">{reaction.count}</span>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-2">
                      <button
                        onClick={() => setReplyToMessage(message)}
                        className="p-1.5 hover:bg-[#06B6D4]/10 rounded text-[#06B6D4]"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setShowEmojiPicker(message.id)}
                        className="p-1.5 hover:bg-[#06B6D4]/10 rounded text-[#06B6D4]"
                      >
                        <Smile className="h-4 w-4" />
                      </button>
                      {message.user_id === user?.id && (
                        <>
                          <button
                            onClick={() => {
                              setEditingMessage(message);
                              setNewMessage(message.content);
                            }}
                            className="p-1.5 hover:bg-[#06B6D4]/10 rounded text-[#06B6D4]"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteMessage(message.id)}
                            className="p-1.5 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Uploading Files */}
              {uploadingFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-[#06B6D4]/10 rounded-xl">
                  <Paperclip className="h-5 w-5 text-[#06B6D4]" />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">{file.name}</p>
                    <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-[#06B6D4] to-[#0891B2] h-2 rounded-full transition-all"
                        style={{ width: `${file.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Reply Bar */}
            {replyToMessage && (
              <div className="px-6 py-2 bg-[#06B6D4]/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Reply className="h-4 w-4 text-[#06B6D4]" />
                  <span className="text-sm text-slate-700">
                    Replying to <span className="font-bold">{replyToMessage.user_name}</span>
                  </span>
                </div>
                <button
                  onClick={() => setReplyToMessage(null)}
                  className="p-1 hover:bg-white rounded"
                >
                  <X className="h-4 w-4 text-slate-600" />
                </button>
              </div>
            )}

            {/* Editing Bar */}
            {editingMessage && (
              <div className="px-6 py-2 bg-amber-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-amber-600" />
                  <span className="text-sm text-amber-800">Editing message</span>
                </div>
                <button
                  onClick={() => {
                    setEditingMessage(null);
                    setNewMessage('');
                  }}
                  className="p-1 hover:bg-white rounded"
                >
                  <X className="h-4 w-4 text-amber-600" />
                </button>
              </div>
            )}

            {/* Message Input */}
            <div className="border-t-2 border-[#06B6D4]/20 p-4">
              <div className="flex gap-3">
                <button
                  onClick={() => document.querySelector('input[type="file"]').click()}
                  className="p-3 hover:bg-[#06B6D4]/10 rounded-xl transition-colors"
                >
                  <Paperclip className="h-5 w-5 text-[#06B6D4]" />
                </button>
                <input
                  type="text"
                  placeholder={`Message #${activeChannel.name}`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      editingMessage ? saveEditMessage() : sendMessage();
                    }
                  }}
                  className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#06B6D4] focus:outline-none font-medium"
                />
                <div className="relative" ref={emojiPickerRef}>
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 hover:bg-[#06B6D4]/10 rounded-xl transition-colors"
                  >
                    <Smile className="h-5 w-5 text-[#06B6D4]" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-full right-0 mb-2">
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          if (typeof showEmojiPicker === 'string') {
                            addReaction(showEmojiPicker, emojiData.emoji);
                          } else {
                            setNewMessage(prev => prev + emojiData.emoji);
                          }
                          setShowEmojiPicker(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={editingMessage ? saveEditMessage : sendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-3xl flex items-center justify-center mx-auto mb-4">
                <Hash className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Select a channel</h3>
              <p className="text-slate-600">Choose a channel from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>

      {/* New Channel Modal */}
      {showNewChannelModal && (
        <NewChannelModal
          onClose={() => setShowNewChannelModal(false)}
          onCreate={createChannel}
        />
      )}

      {/* New DM Modal */}
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

// New Channel Modal Component
const NewChannelModal = ({ onClose, onCreate }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('public');

  const handleSubmit = () => {
    if (name.trim()) {
      onCreate(name, description, type);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-[#06B6D4] to-[#0891B2] bg-clip-text text-transparent">
            Create Channel
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., general, random, team-updates"
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#06B6D4] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this channel about?"
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#06B6D4] focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Privacy</label>
            <div className="space-y-2">
              <button
                onClick={() => setType('public')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${type === 'public'
                  ? 'border-[#06B6D4] bg-[#06B6D4]/5'
                  : 'border-slate-200 hover:border-[#06B6D4]/50'
                  }`}
              >
                <Hash className="h-5 w-5 text-[#06B6D4]" />
                <div className="text-left">
                  <p className="font-bold text-slate-900">Public</p>
                  <p className="text-xs text-slate-600">Anyone can join</p>
                </div>
              </button>
              <button
                onClick={() => setType('private')}
                className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${type === 'private'
                  ? 'border-[#06B6D4] bg-[#06B6D4]/5'
                  : 'border-slate-200 hover:border-[#06B6D4]/50'
                  }`}
              >
                <Lock className="h-5 w-5 text-[#06B6D4]" />
                <div className="text-left">
                  <p className="font-bold text-slate-900">Private</p>
                  <p className="text-xs text-slate-600">Invite only</p>
                </div>
              </button>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Create Channel
          </button>
        </div>
      </div>
    </div>
  );
};

// New DM Modal Component
const NewDMModal = ({ onClose, onCreate, token }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get(`${BACKEND_URL}/api/chat/users/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-black bg-gradient-to-r from-[#06B6D4] to-[#0891B2] bg-clip-text text-transparent">
            New Direct Message
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-900 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-[#06B6D4] focus:outline-none"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {searching && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600">Searching...</p>
              </div>
            )}
            {!searching && searchResults.length === 0 && searchQuery && (
              <div className="text-center py-4">
                <p className="text-sm text-slate-600">No users found</p>
              </div>
            )}
            {searchResults.map((user) => (
              <button
                key={user.id}
                onClick={() => onCreate(user.id)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#06B6D4]/10 rounded-xl transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#06B6D4] to-[#0891B2] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user.full_name?.charAt(0) || 'U'}</span>
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

export default IBChatEnhanced;
