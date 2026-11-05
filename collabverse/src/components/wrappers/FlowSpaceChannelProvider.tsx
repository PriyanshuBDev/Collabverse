"use client";
import { WorldPlayer } from "@/app/interfaces";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useOnlinePlayers } from "@/lib/hooks/zustand/FlowSpace/useOnlinePlayersStore";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { RealtimeChannel } from "@supabase/supabase-js";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
type ContextType = {
  channel: RealtimeChannel | null;
  isSubscribed: boolean;
};
const FlowSpaceRTChannelProvider = createContext<ContextType>({
  channel: null,
  isSubscribed: false,
});
export function FlowSpaceChannelProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: userId } = useCurrentUser();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { id: projectId } = useCurrentProject();
  const { id: workspaceId } = useCurrentWorkspace();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const topic = `workspace-${workspaceId}-project-${projectId}-flowspace`;
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!workspaceId || !projectId || !userId) {
      setChannel(null);
      setIsSubscribed(false);
      useOnlinePlayers.getState().setOnlinePlayers({});
      return;
    }

    setIsSubscribed(false);

    const realtimeChannel = supabase.channel(topic, {
      config: {
        private: true,
        presence: { key: userId },
      },
    });

    const updatePlayers = () => {
      const connections = Object.values(
        realtimeChannel.presenceState<WorldPlayer>(),
      ).flat();

      const players: Record<string, WorldPlayer> = {};
      for (const player of connections) {
        players[player.playerId] = player;
      }

      useOnlinePlayers.getState().setOnlinePlayers(players);
    };

    // Register every presence listener before subscribing.
    realtimeChannel
      .on("presence", { event: "sync" }, updatePlayers)
      .on("presence", { event: "join" }, updatePlayers)
      .on("presence", { event: "leave" }, updatePlayers);

    channelRef.current = realtimeChannel;
    setChannel(realtimeChannel);

    // Subscribe exactly once; only the status callback sets readiness.
    realtimeChannel.subscribe((status) => {
      if (channelRef.current !== realtimeChannel) return;

      setIsSubscribed(status === "SUBSCRIBED");

      if (status === "SUBSCRIBED") {
        updatePlayers();
      }
    });

    return () => {
      if (channelRef.current === realtimeChannel) {
        channelRef.current = null;
        setIsSubscribed(false);
        setChannel((current) => (current === realtimeChannel ? null : current));
        useOnlinePlayers.getState().setOnlinePlayers({});
      }

      void supabase.removeChannel(realtimeChannel);
    };
  }, [supabase, topic, workspaceId, projectId, userId]);
  return (
    <FlowSpaceRTChannelProvider.Provider value={{ channel, isSubscribed }}>
      {children}
    </FlowSpaceRTChannelProvider.Provider>
  );
}
export function useFlowSpaceChannelRT() {
  const ctx = useContext(FlowSpaceRTChannelProvider);
  if (!ctx) {
    throw new Error(
      "useFlowSpaceChannelRT must be used inside FlowSpaceChannelProvider",
    );
  }
  return ctx;
}
