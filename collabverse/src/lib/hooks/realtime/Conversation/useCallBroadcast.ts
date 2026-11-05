import useCurrentUser from "../../useCurrentUser";
import { SignalMessage, signalType } from "@/app/interfaces";
import { useCallStore } from "../../zustand/useCallStore";
import { useCallSignalingProvider } from "@/components/wrappers/CallSignalingProvider";

export function useCallBroadcast() {
  const { id: currentUserId } = useCurrentUser();
  const { waitForSignalingReady } = useCallSignalingProvider();
  const send = async (
    type: signalType,
    to: string,
    conversationId: string,
    extra?: unknown,
  ) => {
    const { callMode, callId } = useCallStore.getState();

    if (!currentUserId || !callId) return;
    const channel = await waitForSignalingReady();
    if (!channel) {
      throw new Error("Call signaling channel failed to subscribe");
    }

    const payload: SignalMessage = {
      callId,
      type,
      from: currentUserId,
      to,
      conversationId,
      mode: callMode ?? "Voice",
      payload: extra,
    };
    await channel.send({
      type: "broadcast",
      event: payload.type,
      payload,
    });
  };

  const sendOffer = async (
    to: string,
    conversationId: string,
    offer: RTCSessionDescriptionInit,
  ) => {
    await send("offer", to, conversationId, offer);
  };
  const sendAnswer = async (
    to: string,
    conversationId: string,
    answer: RTCSessionDescriptionInit,
  ) => {
    await send("answer", to, conversationId, answer);
  };
  const sendCandidate = async (
    to: string,
    conversationId: string,
    candidate: RTCIceCandidate,
  ) => {
    await send("ice_candidate", to, conversationId, candidate);
  };
  const sendHangup = async (to: string, conversationId: string) => {
    await send("hangup", to, conversationId);
  };
  const sendMute = async (
    to: string,
    conversationId: string,
    enabled: boolean,
  ) => {
    await send("mute", to, conversationId, enabled);
  };
  const sendCameraToggle = async (
    to: string,
    conversationId: string,
    enabled: boolean,
  ) => {
    await send("camera_toggle", to, conversationId, enabled);
  };
  const sendScreenShare = async (
    to: string,
    conversationId: string,
    enabled: boolean,
  ) => {
    await send("screen_share", to, conversationId, enabled);
  };

  return {
    sendAnswer,
    sendCandidate,
    sendHangup,
    sendOffer,
    sendMute,
    sendCameraToggle,
    sendScreenShare,
  };
}
