import { useCurrentUserAppearance } from "@/lib/queries/user/appearance/useCurrentUserAppearance";
import { useOnlinePlayers } from "../../zustand/FlowSpace/useOnlinePlayersStore";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { WorldPlayer } from "@/app/interfaces";
import { useFlowSpaceChannelRT } from "@/components/wrappers/FlowSpaceChannelProvider";
import { useCallStore } from "../../zustand/useCallStore";

export function useWorldPresence() {
  const active = useCallStore((s) => s.active);
  const { data: user, isError, error } = useCurrentUserAppearance();
  const setOnlinePlayers = useOnlinePlayers((s) => s.setOnlinePlayers);
  const { channel, isSubscribed } = useFlowSpaceChannelRT();
  if (isError) {
    console.log(error);
  }
  const presence = useMemo<WorldPlayer | null>(() => {
    if (!user) return null;

    return {
      playerId: user.playerId,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      appearance: user.appearance,
      dnd: user.dnd,
      inCall: active,
    };
  }, [user, active]);

  const presenceRef = useRef<WorldPlayer | null>(presence);
  presenceRef.current = presence;
  const updatePlayers = useCallback(() => {
    if (!channel) return;

    const state = channel.presenceState<WorldPlayer>();
    const connections = Object.values(state).flat();

    const uniquePlayers: Record<string, WorldPlayer> = {};
    for (const player of connections) {
      uniquePlayers[player.playerId] = player;
    }

    setOnlinePlayers(uniquePlayers);
  }, [channel, setOnlinePlayers]);

  // Track this player's current presence once the provider says the channel is ready.
  // Also refresh from presenceState, since the initial sync event might have passed.
  useEffect(() => {
    if (!channel || !isSubscribed || !presence) return;

    void channel
      .track(presence)
      .then(() => {
        updatePlayers();
      })
      .catch((error) => {
        console.error("Presence track failed:", error);
      });
  }, [channel, isSubscribed, presence, updatePlayers]);
}
