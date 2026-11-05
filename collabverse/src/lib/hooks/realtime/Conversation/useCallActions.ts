import { useCallChannelRT } from "@/components/wrappers/CallChannelProvider";
import useCurrentUser from "../../useCurrentUser";
import { useCallStore } from "../../zustand/useCallStore";
import { CallSpace, SignalMessage, signalType } from "@/app/interfaces";

export function useCallActions() {
  const { id: currentUserId } = useCurrentUser();
  const { channel } = useCallChannelRT();

  const send = async (
    type: signalType,
    to: string,
    conversationId: string,
    extra?: unknown,
  ) => {
    const { callMode, callId } = useCallStore.getState();

    if (!currentUserId || !channel || !callId) return;
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
  const sendIncomingCall = async (
    to: string,
    conversationId: string,
    space: CallSpace,
  ) => {
    await send("incoming_call", to, conversationId, space);
  };
  const sendAccept = async (to: string, conversationId: string) => {
    await send("accept", to, conversationId);
  };
  const sendReject = async (to: string, conversationId: string) => {
    await send("reject", to, conversationId);
  };
  const sendBusy = async (to: string, conversationId: string) => {
    await send("busy", to, conversationId);
  };
  const sendCancel = async (to: string, conversationId: string) => {
    await send("cancel", to, conversationId);
  };
  return { sendIncomingCall, sendAccept, sendReject, sendBusy, sendCancel };
}
