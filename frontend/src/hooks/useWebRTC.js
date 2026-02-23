// src/hooks/useWebRTC.js
import { useState, useEffect, useRef, useCallback } from "react";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:8001";

const WS_URL = BACKEND_URL.startsWith("https")
  ? BACKEND_URL.replace(/^https/, "wss")
  : BACKEND_URL.replace(/^http/, "ws");

// app.include_router(webrtc_router)  ==> no prefix
// webrtc_routes.py: @router.websocket("/ws/{user_id}")
const WEBRTC_WS_PATH_PREFIX = "/api/webrtc/ws";

export const useWebRTC = (userId, onIncomingCall, onCallEnded) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [blockedAuth, setBlockedAuth] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState("idle"); // idle | calling | ringing | active | rejected | ended | failed
  const [currentCallId, setCurrentCallId] = useState(null);

  const wsRef = useRef(null);
  const pcRef = useRef(null);

  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);

  // Call context
  const callRef = useRef({
    callId: null,
    role: null, // "caller" | "callee"
    peerId: null, // other user id
    callType: "audio",
    remoteOffer: null, // callee: caller's offer
  });

  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
      { urls: "stun:stun2.l.google.com:19302" },
    ],
  };

  const safeClosePC = () => {
    try {
      const pc = pcRef.current;
      if (pc) {
        pc.ontrack = null;
        pc.onicecandidate = null;
        pc.onconnectionstatechange = null;
        pc.oniceconnectionstatechange = null;
        pc.close();
      }
    } catch { }
    pcRef.current = null;
  };

  const cleanup = useCallback(() => {
    try {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch { }
    try {
      if (remoteStreamRef.current) {
        remoteStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    } catch { }

    localStreamRef.current = null;
    remoteStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);

    safeClosePC();

    callRef.current = {
      callId: null,
      role: null,
      peerId: null,
      callType: "audio",
      remoteOffer: null,
    };

    setCurrentCallId(null);
  }, []);

  const wsSend = useCallback((payload) => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) return false;
    try {
      ws.send(JSON.stringify(payload));
      return true;
    } catch {
      return false;
    }
  }, []);

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

  const attachTracks = useCallback((pc, stream) => {
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));
  }, []);

  const buildPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection(iceServers);
    pcRef.current = pc;

    pc.ontrack = (event) => {
      const rs = event.streams?.[0];
      if (!rs) return;
      remoteStreamRef.current = rs;
      setRemoteStream(rs);
    };

    pc.onicecandidate = (event) => {
      const candidate = event.candidate;
      if (!candidate) return;

      const peerId = callRef.current.peerId;
      if (!peerId) return;

      wsSend({
        type: "ice-candidate",
        to: peerId,
        candidate,
      });
    };

    pc.onconnectionstatechange = () => {
      const st = pc.connectionState;
      if (st === "failed" || st === "disconnected" || st === "closed") {
        if (callState === "active") {
          setCallState("ended");
          cleanup();
          onCallEnded?.("ended");
        }
      }
    };

    return pc;
  }, [callState, cleanup, onCallEnded, wsSend]);

  const handleIncomingCall = useCallback(
    async (msg) => {
      const callId = msg?.callId;
      const from = msg?.from;
      const callType = msg?.callType || "audio";
      const offer = msg?.offer;

      if (!callId || !from || !offer) return;

      setCallState("ringing");
      setCurrentCallId(callId);

      callRef.current = {
        callId,
        role: "callee",
        peerId: from,
        callType,
        remoteOffer: offer,
      };

      onIncomingCall?.({ callId, from, callType });
    },
    [onIncomingCall],
  );

  const handleCallAnswered = useCallback(
    async (msg) => {
      const callId = msg?.callId;
      const answer = msg?.answer;
      const pc = pcRef.current;

      if (!pc || !answer) return;

      if (callId) {
        callRef.current.callId = callId;
        setCurrentCallId(callId);
      }

      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        setCallState("active");
      } catch (e) {
        console.error("[WebRTC] setRemoteDescription(answer) failed:", e);
        setCallState("failed");
        cleanup();
        onCallEnded?.("failed");
      }
    },
    [cleanup, onCallEnded],
  );

  const handleIceCandidate = useCallback(async (msg) => {
    const candidate = msg?.candidate;
    const pc = pcRef.current;
    if (!pc || !candidate) return;

    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (e) {
      console.warn("[WebRTC] addIceCandidate failed:", e);
    }
  }, []);

  const handleCallRejected = useCallback(() => {
    setCallState("rejected");
    cleanup();
    onCallEnded?.("rejected");
  }, [cleanup, onCallEnded]);

  const handleCallEnded = useCallback(() => {
    setCallState("ended");
    cleanup();
    onCallEnded?.("ended");
  }, [cleanup, onCallEnded]);

  const handleCallFailed = useCallback(() => {
    setCallState("failed");
    cleanup();
    onCallEnded?.("failed");
  }, [cleanup, onCallEnded]);

  const handleWsMessage = useCallback(
    async (raw) => {
      const type = raw?.type;
      if (!type) return;

      switch (type) {
        case "incoming-call":
          await handleIncomingCall(raw);
          break;
        case "call-answered":
          await handleCallAnswered(raw);
          break;
        case "ice-candidate":
          await handleIceCandidate(raw);
          break;
        case "call-rejected":
          handleCallRejected();
          break;
        case "call-ended":
          handleCallEnded();
          break;
        case "call-failed":
          handleCallFailed();
          break;
        default:
          break;
      }
    },
    [
      handleIncomingCall,
      handleCallAnswered,
      handleIceCandidate,
      handleCallRejected,
      handleCallEnded,
      handleCallFailed,
    ],
  );

  useEffect(() => {
    if (!userId || blockedAuth) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      console.warn("[WebRTC WS] No auth token found, signaling disabled.");
      setIsConnected(false);
      return;
    }

    let stopped = false;

    const connect = () => {
      if (stopped || blockedAuth) return;

      if (wsRef.current) {
        try {
          wsRef.current.onclose = null;
          wsRef.current.close();
        } catch { }
        wsRef.current = null;
      }

      const attempt = reconnectAttemptRef.current;
      const baseDelay = 500;
      const maxDelay = 30000;
      const delay = attempt === 0
        ? 0
        : Math.min(maxDelay, baseDelay * Math.pow(2, attempt - 1)) + Math.random() * 250;

      const performConnect = () => {
        if (stopped || blockedAuth || !navigator.onLine) {
          if (!navigator.onLine && attempt > 0) {
            console.log("[WebRTC WS] Device offline, pausing reconnect.");
            setIsReconnecting(false);
          }
          return;
        }

        if (attempt > 0) {
          console.log(`[WebRTC WS] Reconnect attempt ${attempt}, delay ${Math.round(delay)}ms`);
          setIsReconnecting(true);
        }

        const url = `${WS_URL}${WEBRTC_WS_PATH_PREFIX}/${encodeURIComponent(userId)}?token=${encodeURIComponent(token)}`;
        const ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log("[WebRTC WS] Connected");
          setIsConnected(true);
          setIsReconnecting(false);
          reconnectAttemptRef.current = 0;
        };

        ws.onmessage = async (evt) => {
          try {
            const msg = JSON.parse(evt.data);
            await handleWsMessage(msg);
          } catch (e) {
            console.warn("[WebRTC WS] Invalid message received:", e);
          }
        };

        ws.onclose = (e) => {
          const { code, reason } = e;
          console.log(`[WebRTC WS] Closed: code=${code}, reason=${reason || "none"}`);
          setIsConnected(false);
          wsRef.current = null;

          if (stopped) return;

          const fatalCodes = [1008, 4001, 4003, 4401, 4403];
          const lowerReason = (reason || "").toLowerCase();
          const isAuthFailure = fatalCodes.includes(code) ||
            lowerReason.includes("unauthorized") ||
            lowerReason.includes("forbidden") ||
            lowerReason.includes("token");

          if (isAuthFailure) {
            console.error("[WebRTC WS] Auth failure detected. Stopping retries.", { code, reason });
            setBlockedAuth(true);
            setIsReconnecting(false);
            return;
          }

          reconnectAttemptRef.current++;
          reconnectTimerRef.current = setTimeout(connect, 0);
        };
      };

      if (delay > 0) {
        reconnectTimerRef.current = setTimeout(performConnect, delay);
      } else {
        performConnect();
      }
    };

    const handleOnline = () => {
      if (!stopped && !blockedAuth && !wsRef.current) {
        console.log("[WebRTC WS] Network restored. Resetting backoff and reconnecting.");
        reconnectAttemptRef.current = 0;
        if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
        connect();
      }
    };

    window.addEventListener("online", handleOnline);
    connect();

    return () => {
      stopped = true;
      window.removeEventListener("online", handleOnline);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
      wsRef.current = null;
      cleanup();
    };
  }, [userId, cleanup, handleWsMessage, blockedAuth]);

  // -------------------------
  // Public methods
  // -------------------------

  const startCall = useCallback(
    async (targetUserId, callType = "audio") => {
      if (!targetUserId) return null;

      setCallState("calling");

      const stream = await getMedia(callType);
      const pc = buildPeerConnection();
      attachTracks(pc, stream);

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === "video",
      });
      await pc.setLocalDescription(offer);

      callRef.current = {
        callId: null, // backend generates it
        role: "caller",
        peerId: targetUserId,
        callType,
        remoteOffer: null,
      };

      const ok = wsSend({
        type: "call-offer",
        to: targetUserId,
        callType,
        offer,
      });

      if (!ok) {
        setCallState("failed");
        cleanup();
        onCallEnded?.("failed");
        return null;
      }

      return null;
    },
    [attachTracks, buildPeerConnection, cleanup, getMedia, onCallEnded, wsSend],
  );

  const answerCall = useCallback(async () => {
    const ctx = callRef.current;
    if (!ctx?.peerId || !ctx?.callId || !ctx?.remoteOffer) return;

    const { peerId, callId, callType, remoteOffer } = ctx;

    const stream = await getMedia(callType);
    const pc = buildPeerConnection();
    attachTracks(pc, stream);

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(remoteOffer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      const ok = wsSend({
        type: "call-answer",
        callId,
        to: peerId,
        answer,
      });

      if (!ok) {
        setCallState("failed");
        cleanup();
        onCallEnded?.("failed");
        return;
      }

      setCallState("active");
    } catch (e) {
      console.error("[WebRTC] answerCall failed:", e);
      setCallState("failed");
      cleanup();
      onCallEnded?.("failed");
    }
  }, [attachTracks, buildPeerConnection, cleanup, getMedia, onCallEnded, wsSend]);

  const rejectCall = useCallback(() => {
    const ctx = callRef.current;
    const callId = ctx?.callId;
    const peerId = ctx?.peerId;

    if (callId && peerId) {
      wsSend({
        type: "call-reject",
        callId,
        to: peerId,
      });
    }

    setCallState("idle");
    cleanup();
  }, [cleanup, wsSend]);

  const endCall = useCallback(() => {
    const ctx = callRef.current;
    const callId = ctx?.callId;
    const peerId = ctx?.peerId;

    if (callId && peerId) {
      wsSend({
        type: "call-end",
        callId,
        to: peerId,
      });
    }

    setCallState("idle");
    cleanup();
    onCallEnded?.("ended");
  }, [cleanup, onCallEnded, wsSend]);

  return {
    isConnected,
    isReconnecting,
    blockedAuth,
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