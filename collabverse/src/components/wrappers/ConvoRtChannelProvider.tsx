"use client";

import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ContextType = {
  channel: RealtimeChannel | null;
  markReady: (key: "postgres" | "broadcast") => void;
};
const ConversationRealtimeChannelContext = createContext<ContextType | null>(
  null,
);
export function ConvoRTChannelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: workspaceId } = useCurrentWorkspace();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const readyRef = useRef(new Set<string>());
  const subscribedRef = useRef(false);
  useEffect(() => {
    if (!workspaceId) return;
    const realtimeChannel = supabase.channel(`conversations-${workspaceId}`);
    readyRef.current.clear();
    subscribedRef.current = false;
    setChannel(realtimeChannel);
    return () => {
      setChannel(null);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [workspaceId, supabase]);
  const markReady = useCallback(
    (key: "postgres" | "broadcast") => {
      if (!channel) return;

      readyRef.current.add(key);

      if (
        readyRef.current.has("postgres") &&
        readyRef.current.has("broadcast") &&
        !subscribedRef.current
      ) {
        subscribedRef.current = true;
        channel.subscribe((status, error) => {
          console.log("Conversations channel:", status, error);
        });
      }
    },
    [channel],
  );
  return (
    <ConversationRealtimeChannelContext.Provider value={{ channel, markReady }}>
      {children}
    </ConversationRealtimeChannelContext.Provider>
  );
}
export function useConvoChannelRT() {
  const ctx = useContext(ConversationRealtimeChannelContext);

  if (!ctx) {
    throw new Error(
      "useConvoChannelRT must be used inside ConvoRTChannelProvider",
    );
  }
  return ctx;
}
