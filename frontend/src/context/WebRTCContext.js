import React, { createContext, useContext, useMemo } from "react";
import { useWebRTC } from "../hooks/useWebRTC";

const WebRTCContext = createContext(null);

export function WebRTCProvider({ userId, children }) {
  const webrtc = useWebRTC(userId);
  const value = useMemo(() => webrtc, [webrtc]);

  return (
    <WebRTCContext.Provider value={value}>
      {children}
    </WebRTCContext.Provider>
  );
}

export function useWebRTCContext() {
  const ctx = useContext(WebRTCContext);
  if (!ctx) {
    throw new Error("useWebRTCContext must be used inside WebRTCProvider");
  }
  return ctx;
}