"use client";

import { supabaseBrowser } from "@/lib/supabase/browser";
import { useEffect, useMemo, useRef } from "react";
import { useActiveConversationStore } from "../zustand/useActiveConversationStore";
import useCurrentUser from "../useCurrentUser";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Presence, useOnlineUsers } from "../zustand/useOnlineUsers";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";

export function usePresenceRT(workspaceId: string) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: userId } = useCurrentUser();
  const { user } = useUserAppbar();
  const activeConversationId = useActiveConversationStore(
    (s) => s.activeConversationId,
  );
  const channelRef = useRef<RealtimeChannel | null>(null);
  const setOnlineUsers = useOnlineUsers((s) => s.setOnlineUsers);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!workspaceId) return;
    const channel = supabase.channel(`workspace-presence-${workspaceId}`, {
      config: {
        presence: {
          key: userId,
        },
      },
    });
    channelRef.current = channel;
    const updatePresence = () => {
      const state = channelRef.current?.presenceState<Presence>();

      const users: Record<string, Presence> = {};

      Object.values(state ?? {}).forEach((presences) => {
        const latest = presences[presences.length - 1];

        if (!latest) return;

        users[latest.userId] = latest;
      });

      setOnlineUsers(users);
    };
    channel
      .on("presence", { event: "sync" }, updatePresence)
      .on("presence", { event: "join" }, updatePresence)
      .on("presence", { event: "leave" }, updatePresence)
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          isSubscribedRef.current = true;
          await channel.track({
            userId,
            name: user?.name ?? "unknown",
            avatar: user?.avatar ?? undefined,
            activeConversationId,
            lastActivityAt: Date.now(),
          });
          updatePresence();
        }
      });
    return () => {
      setOnlineUsers({});
      channel.untrack();
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [
    workspaceId,
    supabase,
    userId,
    setOnlineUsers,
    activeConversationId,
    user,
  ]);
  useEffect(() => {
    if (!channelRef.current || !userId || !isSubscribedRef.current) return;
    const trackPresence = async () => {
      await channelRef.current?.track({
        userId,
        name: user?.name ?? "unknown",
        avatar: user?.avatar ?? undefined,
        workspaceId,
        activeConversationId,
        lastActivityAt: Date.now(),
      });
    };
    trackPresence();
    const heartbeat = setInterval(() => {
      trackPresence();
    }, 15000);
    return () => {
      clearInterval(heartbeat);
    };
  }, [activeConversationId, userId, workspaceId, user]);
}
