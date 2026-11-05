"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RealtimeChannel } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
type ContextType = {
  channel: RealtimeChannel | null;
};
const CallRTChannelProvider = createContext<ContextType>({
  channel: null,
});
export function CallChannelProvider({
  children,
  workspaceId,
}: {
  children: React.ReactNode;
  workspaceId: string;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  useEffect(() => {
    if (!workspaceId) return;
    const realtimeChannel = supabase.channel(`call-connection-${workspaceId}`);
    realtimeChannel.subscribe((status) => {
      console.log("call signal workspace", status);
    });
    setChannel(realtimeChannel);
    return () => {
      supabase.removeChannel(realtimeChannel);
    };
  }, [workspaceId, supabase]);
  return (
    <CallRTChannelProvider.Provider value={{ channel }}>
      {children}
    </CallRTChannelProvider.Provider>
  );
}
export function useCallChannelRT() {
  const ctx = useContext(CallRTChannelProvider);
  if (!ctx) {
    throw new Error("useCallChannelRT must be used inside CallChannelProvider");
  }
  return ctx;
}
