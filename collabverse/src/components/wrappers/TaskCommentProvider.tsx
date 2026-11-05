"use client";

import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
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
  markReady: (key: "postgres") => void;
};
const TaskCommentRealtimeChannelContext = createContext<ContextType | null>(
  null,
);
export function TaskCommentRTChannelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: workspaceId } = useCurrentWorkspace();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { id: taskId } = useCurrentTask();
  const readyRef = useRef(new Set<string>());
  const subscribedRef = useRef(false);
  useEffect(() => {
    if (!workspaceId) return;
    const realtimeChannel = supabase.channel(`taskComments-${taskId}`);
    readyRef.current.clear();
    subscribedRef.current = false;
    setChannel(realtimeChannel);
    return () => {
      setChannel(null);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [workspaceId, taskId, supabase]);
  const markReady = useCallback(
    (key: "postgres") => {
      if (!channel) return;

      readyRef.current.add(key);

      if (readyRef.current.has("postgres") && !subscribedRef.current) {
        subscribedRef.current = true;
        channel.subscribe((status, error) => {
          console.log("Comments channel:", status, error);
        });
      }
    },
    [channel],
  );
  return (
    <TaskCommentRealtimeChannelContext.Provider value={{ channel, markReady }}>
      {children}
    </TaskCommentRealtimeChannelContext.Provider>
  );
}
export function useTaskCommentChannelRT() {
  const ctx = useContext(TaskCommentRealtimeChannelContext);

  if (!ctx) {
    throw new Error(
      "useTaskCommentChannelRT must be used inside TaskCommentRTChannelProvider",
    );
  }
  return ctx;
}
