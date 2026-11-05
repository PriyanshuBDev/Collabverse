import { useEffect, useRef } from "react";
import useCurrentUser from "../../useCurrentUser";
import { SignalMessage } from "@/app/interfaces";
import { useCallSignalingProvider } from "@/components/wrappers/CallSignalingProvider";

interface Props {
  onOffer: (payload: SignalMessage) => void;
  onAnswer: (payload: SignalMessage) => void;
  onCandidate: (payload: SignalMessage) => void;
  onHangup: () => void;
  onMute: (payload: SignalMessage) => void;
  onScreenShare: (payload: SignalMessage) => void;
  onCameraToggle: (payload: SignalMessage) => void;
  onCancel: () => void;
}

export function useCallListener(props: Props) {
  const { id: currentUserId } = useCurrentUser();
  const { channel } = useCallSignalingProvider();

  const callbacksRef = useRef(props);
  callbacksRef.current = props;

  const currentUserIdRef = useRef(currentUserId);
  currentUserIdRef.current = currentUserId;

  const boundChannelsRef = useRef(new WeakSet<object>());

  useEffect(() => {
    if (!channel || boundChannelsRef.current.has(channel)) return;

    boundChannelsRef.current.add(channel);

    const bind = (event: string, handler: (payload: SignalMessage) => void) => {
      channel.on(
        "broadcast",
        { event },
        ({ payload }: { payload: SignalMessage }) => {
          handler(payload);
        },
      );
    };

    bind("offer", (payload) => callbacksRef.current.onOffer(payload));
    bind("answer", (payload) => callbacksRef.current.onAnswer(payload));
    bind("ice_candidate", (payload) =>
      callbacksRef.current.onCandidate(payload),
    );
    bind("hangup", () => callbacksRef.current.onHangup());
    bind("mute", (payload) => callbacksRef.current.onMute(payload));
    bind("camera_toggle", (payload) =>
      callbacksRef.current.onCameraToggle(payload),
    );
    bind("screen_share", (payload) =>
      callbacksRef.current.onScreenShare(payload),
    );
    bind("cancel", () => callbacksRef.current.onCancel());
  }, [channel]);
}
