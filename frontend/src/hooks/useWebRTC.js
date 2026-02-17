// src/hooks/useWebRTC.js
import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const WS_URL = BACKEND_URL.startsWith("https")
  ? BACKEND_URL.replace(/^https/, "wss")
  : BACKEND_URL.replace(/^http/, "ws");

const genCallIdFallback = () =>
  `call_${Date.now()}_${Math.random().toString(16).slice(2)}`;

const getAuthToken = () => localStorage.getItem("access_token") || "";

const authedPost = async (path, body) => {
  const token = getAuthToken();
  const res = await fetch(`${BACKEND_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body ?? {}),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const data = await res.json();
      detail = data?.detail ? ` - ${data.detail}` : "";
    } catch { }
    throw new Error(`Request failed (${res.status})${detail}`);
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
};

export const useWebRTC = (userId, onIncomingCall, onCallEnded) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle");
  const [currentCallId, setCurrentCallId] = useState(null);

  const wsRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const currentCallRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  const cleanup = useCallback(() => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
        setLocalStream(null);
      }
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
        remoteStreamRef.current = null;
        setRemoteStream(null);
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.ontrack = null;
        peerConnectionRef.current.onicecandidate = null;
        peerConnectionRef.current.onconnectionstatechange = null;
        peerConnectionRef.current.oniceconnectionstatechange = null;
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    } catch { }

    currentCallRef.current = null;
    setCurrentCallId(null);
  }, []);

  const sendSignal = useCallback(async (callId, signal) => {
    await authedPost(`/api/chat/call/${callId}/signal`, { signal });
  }, []);

  const handleWebrtcSignal = useCallback(
    async (data) => {
      const callId = data?.call_id;
      const signal = data?.signal;
      if (!callId || !signal) return;

      const pc = peerConnectionRef.current;
      if (!pc) return;

      try {
        if (signal.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(callId, { type: "answer", sdp: answer });
          setCallState("active");
        } else if (signal.type === "answer") {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          setCallState("active");
        } else if (signal.type === "ice" && signal.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
        }
      } catch (err) {
        console.error("webrtc_signal error:", err);
        setCallState("failed");
        cleanup();
        onCallEnded?.("failed");
      }
    },
    [cleanup, onCallEnded, sendSignal],
  );

  const handleSignalingMessage = useCallback(
    async (message) => {
      const type = message?.type;
      if (!type) return;

      switch (type) {
        case "call_invitation": {
          const callId = message?.data?.call_id || genCallIdFallback();
          const from = message?.data?.caller_id;
          const callType = message?.data?.call_type || "audio";

          setCallState("ringing");
          setCurrentCallId(callId);

          currentCallRef.current = {
            callId,
            from,
            callType,
            channelId: message?.data?.channel_id || null,
            role: "callee",
          };

          onIncomingCall?.({ callId, from, callType });
          break;
        }

        case "call_answered":
          setCallState("active");
          break;

        case "call_rejected":
          setCallState("rejected");
          cleanup();
          onCallEnded?.("rejected");
          break;

        case "call_ended":
          setCallState("ended");
          cleanup();
          onCallEnded?.("ended");
          break;

        case "webrtc_signal":
          await handleWebrtcSignal(message?.data);
          break;

        default:
          break;
      }
    },
    [cleanup, handleWebrtcSignal, onCallEnded, onIncomingCall],
  );

  useEffect(() => {
    if (!userId) return;

    let stopped = false;

    const connectWebSocket = () => {
      if (stopped) return;

      const token = getAuthToken();
      const ws = new WebSocket(
        `${WS_URL}/api/chat/ws/${userId}?token=${encodeURIComponent(token)}`,
      );

      ws.onopen = () => setIsConnected(true);

      ws.onmessage = async (event) => {
        try {
          const msg = JSON.parse(event.data);
          await handleSignalingMessage(msg);
        } catch { }
      };

      ws.onclose = (e) => {
        setIsConnected(false);
        if (e.code === 1008 || e.code === 4001 || e.code === 4003) return;
        if (!stopped) setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      stopped = true;
      try {
        wsRef.current?.close();
      } catch { }
      wsRef.current = null;
      cleanup();
    };
  }, [userId, cleanup, handleSignalingMessage]);

  const buildPeerConnection = useCallback(
    (callId) => {
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      pc.ontrack = (event) => {
        const rs = event.streams?.[0];
        if (!rs) return;
        remoteStreamRef.current = rs;
        setRemoteStream(rs);
      };

      pc.onicecandidate = (event) => {
        if (event.candidate && callId) {
          sendSignal(callId, { type: "ice", candidate: event.candidate }).catch(
            () => { },
          );
        }
      };

      return pc;
    },
    [sendSignal],
  );

  const getMedia = useCallback(async (callType) => {
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video:
        callType === "video"
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
          : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const startCall = useCallback(
    async (targetUserId, callType = "audio") => {
      setCallState("calling");

      const resp = await authedPost("/api/chat/call/initiate", {
        recipient_id: targetUserId,
        call_type: callType,
        channel_id: null,
      });

      const callId = resp?.call_id || genCallIdFallback();
      setCurrentCallId(callId);

      currentCallRef.current = { callId, targetUserId, callType, role: "caller" };

      const stream = await getMedia(callType);
      const pc = buildPeerConnection(callId);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      });

      await pc.setLocalDescription(offer);
      await sendSignal(callId, { type: "offer", sdp: offer });

      return callId;
    },
    [buildPeerConnection, getMedia, sendSignal],
  );

  const answerCall = useCallback(async () => {
    if (!currentCallRef.current?.callId) return;
    const { callId, callType } = currentCallRef.current;

    await authedPost(`/api/chat/call/${callId}/answer`, {});

    const stream = await getMedia(callType);
    const pc = buildPeerConnection(callId);
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Offer comes via webrtc_signal
    setCallState("active");
  }, [buildPeerConnection, getMedia]);

  const rejectCall = useCallback(async () => {
    const callId = currentCallRef.current?.callId;
    try {
      if (callId) await authedPost(`/api/chat/call/${callId}/reject`, {});
    } catch { }
    cleanup();
    setCallState("idle");
  }, [cleanup]);

  const endCall = useCallback(async () => {
    const callId = currentCallRef.current?.callId || currentCallId;
    try {
      if (callId) await authedPost(`/api/chat/call/${callId}/end`, {});
    } catch { }
    cleanup();
    setCallState("idle");
    onCallEnded?.("ended");
  }, [cleanup, currentCallId, onCallEnded]);

  return {
    isConnected,
    callState,
    localStream,
    remoteStream,
    currentCallId,
    startCall,
    answerCall,
    rejectCall,
    endCall,
  };
};
