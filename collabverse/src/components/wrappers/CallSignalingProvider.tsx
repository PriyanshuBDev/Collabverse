"use client";

import { useCallSignalingChannel } from "@/lib/hooks/realtime/Conversation/useCallSignalingChannel";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createContext, useContext } from "react";
type ContextType = {
  channel: RealtimeChannel | null;
  waitForSignalingReady: () => Promise<RealtimeChannel | null>;
};
const CallSignalingContext = createContext<ContextType>({
  channel: null,
  waitForSignalingReady: () => Promise.resolve(null),
});
export function CallSignalingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const callId = useCallStore((s) => s.callId);
  const { channel, waitForSignalingReady } = useCallSignalingChannel({
    callId,
  });
  return (
    <CallSignalingContext.Provider value={{ channel, waitForSignalingReady }}>
      {children}
    </CallSignalingContext.Provider>
  );
}
export function useCallSignalingProvider() {
  const ctx = useContext(CallSignalingContext);
  if (!ctx) {
    throw new Error("Consumer is outside CallSignalingProvider");
  }

  return ctx;
}
