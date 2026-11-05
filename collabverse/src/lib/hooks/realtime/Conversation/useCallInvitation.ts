import { SignalMessage } from "@/app/interfaces";
import useCurrentUser from "../../useCurrentUser";
import { useCallChannelRT } from "@/components/wrappers/CallChannelProvider";
import { useEffect, useRef } from "react";
import { useCallStore } from "../../zustand/useCallStore";

type Props = {
  onIncomingCall: (payload: SignalMessage) => void;
  onReject: () => void;
  onAccept: (payload: SignalMessage) => void;
  onBusy: (payload: SignalMessage) => void;
};

export function useCallInvitaion(props: Props) {
  const { id: currentUserId } = useCurrentUser();
  const { channel } = useCallChannelRT();

  const callbacksRef = useRef(props);
  callbacksRef.current = props;

  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const boundChannelsRef = useRef(new WeakSet<object>());

  useEffect(() => {
    if (!channel || boundChannelsRef.current.has(channel)) return;
    boundChannelsRef.current.add(channel);

    const bind = (
      event: string,
      requiresMatchingCallId: boolean,
      handler: (payload: SignalMessage) => void,
    ) => {
      channel.on(
        "broadcast",
        { event },
        ({ payload }: { payload: SignalMessage }) => {
          if (payload.to !== currentUserIdRef.current) return;

          if (
            requiresMatchingCallId &&
            payload.callId !== useCallStore.getState().callId
          ) {
            return;
          }

          handler(payload);
        },
      );
    };

    bind("incoming_call", false, (payload) => {
      callbacksRef.current.onIncomingCall(payload);
    });

    bind("accept", true, (payload) => callbacksRef.current.onAccept(payload));

    bind("reject", true, () => callbacksRef.current.onReject());

    bind("busy", true, (payload) => callbacksRef.current.onBusy(payload));
  }, [channel]);
}
