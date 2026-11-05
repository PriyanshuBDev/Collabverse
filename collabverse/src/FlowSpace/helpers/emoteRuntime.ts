import { PlayerEmoteEvent } from "@/app/interfaces";
import { useEventsBroadcast } from "@/lib/hooks/realtime/FlowSpace/useEventsBroadcast";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useFlowSpaceStore } from "@/lib/hooks/zustand/FlowSpace/useFlowSpaceStore";
import { useCallback } from "react";
const timers = new Map<string, ReturnType<typeof setTimeout>>();
export const EMOTE_DURATION_MS = 1200;
export function playTemoporaryEmote(event: PlayerEmoteEvent) {
  const previousTimer = timers.get(event.playerId);
  if (previousTimer) clearTimeout(previousTimer);
  useFlowSpaceStore.getState().showEmote(event);
  const timer = setTimeout(() => {
    useFlowSpaceStore.getState().clearEmote(event.playerId, event.eventId);
    timers.delete(event.playerId);
  }, EMOTE_DURATION_MS);
  timers.set(event.playerId, timer);
}

export function usePlayEmote() {
  const { sendEmote } = useEventsBroadcast();
  const { id: userId } = useCurrentUser();

  const playEmote = useCallback(
    (emote: PlayerEmoteEvent["emote"]) => {
      if (!userId) return;
      const eventId = crypto.randomUUID();
      playTemoporaryEmote({ playerId: userId, emote, eventId });
      sendEmote({ emote, eventId });
    },
    [userId, sendEmote],
  );
  return { playEmote };
}
