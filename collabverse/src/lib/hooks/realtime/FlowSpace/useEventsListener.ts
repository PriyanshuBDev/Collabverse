import { useFlowSpaceChannelRT } from "@/components/wrappers/FlowSpaceChannelProvider";
import { useFlowSpaceStore } from "../../zustand/FlowSpace/useFlowSpaceStore";
import { useOnlinePlayers } from "../../zustand/FlowSpace/useOnlinePlayersStore";
import useCurrentUser from "../../useCurrentUser";
import type {
  DoorEvent,
  PlayerEmoteEvent,
  PlayerMovement,
  PositionSnapshotRequest,
} from "@/app/interfaces";
import { useEffect } from "react";
import { playTemoporaryEmote } from "@/FlowSpace/helpers/emoteRuntime";
import { useEventsBroadcast } from "./useEventsBroadcast";
type GetCurrentMovement = () => Omit<PlayerMovement, "playerId"> | null;
export function useEventsListener(getCurrentMovement: GetCurrentMovement) {
  const { id: currentUserId } = useCurrentUser();
  const { channel, isSubscribed } = useFlowSpaceChannelRT();
  const showEmote = useFlowSpaceStore((s) => s.showEmote);
  const clearEmote = useFlowSpaceStore((s) => s.clearEmote);
  const setDoorState = useFlowSpaceStore((s) => s.setDoorState);
  const setPlayerMovements = useOnlinePlayers((s) => s.setPlayerMovements);
  const { sendPositionSnapshot } = useEventsBroadcast();
  useEffect(() => {
    if (!channel || !isSubscribed) return;
    const onMovement = ({ payload }: { payload: PlayerMovement }) => {
      if (payload.playerId === currentUserId) return;
      setPlayerMovements(payload);
    };

    const onEmote = ({ payload }: { payload: PlayerEmoteEvent }) => {
      if (payload.playerId === currentUserId) return;
      playTemoporaryEmote(payload);
    };

    const onDoorStateChanged = ({ payload }: { payload: DoorEvent }) => {
      setDoorState(payload);
    };
    const onPositionSnapshotRequest = ({
      payload,
    }: {
      payload: PositionSnapshotRequest;
    }) => {
      if (payload.requesterId === currentUserId) return;
      const movement = getCurrentMovement();
      if (!movement) return;
      sendPositionSnapshot(payload.requesterId, payload.requestId, movement);
    };
    const onPositionSanpshot = ({ payload }: { payload: PlayerMovement }) => {
      if (payload.playerId === currentUserId) return;
      setPlayerMovements(payload);
    };
    channel
      .on("broadcast", { event: "player-moved" }, onMovement)
      .on("broadcast", { event: "player-emote" }, onEmote)
      .on("broadcast", { event: "door-state-changed" }, onDoorStateChanged)
      .on(
        "broadcast",
        { event: "position-snapshot-request" },
        onPositionSnapshotRequest,
      )
      .on("broadcast", { event: "position-snapshot" }, onPositionSanpshot);
  }, [
    channel,
    currentUserId,
    showEmote,
    clearEmote,
    setDoorState,
    setPlayerMovements,
    getCurrentMovement,
    sendPositionSnapshot,
    isSubscribed,
  ]);
}
