// src/context/WebRTCContext.js
import React, { createContext, useContext, useMemo } from "react";
import { useWebRTC } from "../hooks/useWebRTC";

const WebRTCContext = createContext(null);

export const WebRTCProvider = ({ userId, onIncomingCall, onCallEnded, children }) => {
  const webrtc = useWebRTC(userId, onIncomingCall, onCallEnded);

  const value = useMemo(() => webrtc, [webrtc]);

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
};

export const useWebRTCContext = () => {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTCContext must be used inside WebRTCProvider");
  }
  return ctx;
};
