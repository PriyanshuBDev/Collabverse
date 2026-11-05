import { useFlowSpaceChannelRT } from "@/components/wrappers/FlowSpaceChannelProvider";
import useCurrentUser from "../../useCurrentUser";
import { useCallback } from "react";
import { DoorEvent, PlayerEmoteEvent, PlayerMovement } from "@/app/interfaces";

export function useEventsBroadcast() {
  const { id: userId } = useCurrentUser();
  const { channel, isSubscribed } = useFlowSpaceChannelRT();

  const sendMovement = useCallback(
    (movement: Omit<PlayerMovement, "playerId">) => {
      if (!userId || !channel || !isSubscribed) return;
      void channel.send({
        type: "broadcast",
        event: "player-moved",
        payload: {
          playerId: userId,
          ...movement,
        },
      });
    },
    [userId, channel, isSubscribed],
  );
  const sendEmote = useCallback(
    (emote: Omit<PlayerEmoteEvent, "playerId">) => {
      if (!userId || !channel || !isSubscribed) return;
      void channel.send({
        type: "broadcast",
        event: "player-emote",
        payload: {
          playerId: userId,
          ...emote,
        },
      });
    },
    [userId, channel, isSubscribed],
  );
  const sendDoorState = useCallback(
    (door: DoorEvent) => {
      if (!channel || !isSubscribed) return;
      void channel.send({
        type: "broadcast",
        event: "door-state-changed",
        payload: {
          ...door,
        },
      });
    },
    [channel, isSubscribed],
  );
  const sendPositionSnapshotRequest = useCallback(
    (requestId: string) => {
      if (!userId || !channel || !isSubscribed) return;
      void channel.send({
        type: "broadcast",
        event: "position-snapshot-request",
        payload: {
          requestId,
          requesterId: userId,
        },
      });
    },
    [channel, userId, isSubscribed],
  );
  const sendPositionSnapshot = useCallback(
    (
      requestId: string,
      to: string,
      movement: Omit<PlayerMovement, "playerId">,
    ) => {
      if (!userId || !channel || !isSubscribed) return;

      void channel.send({
        type: "broadcast",
        event: "position-snapshot",
        payload: {
          ...movement,
          playerId: userId,
          requestId,
          to,
        },
      });
    },
    [userId, channel, isSubscribed],
  );
  return {
    sendMovement,
    sendEmote,
    sendDoorState,
    sendPositionSnapshot,
    sendPositionSnapshotRequest,
  };
}
