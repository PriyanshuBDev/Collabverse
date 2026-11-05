import { useConvoChannelRT } from "@/components/wrappers/ConvoRtChannelProvider";
import useCurrentUser from "../../useCurrentUser";
import { useEffect } from "react";
import { useConvoBroadCastStore } from "../../zustand/useConvoBroadcastStore";
import { useActiveConversationStore } from "../../zustand/useActiveConversationStore";
type payloadProps = {
  payload: {
    userId: string;
    conversationId: string;
  };
};
export function useBroadcastListeners() {
  const { id: currentUserId } = useCurrentUser();
  const { channel, markReady } = useConvoChannelRT();
  const addTypingUsers = useConvoBroadCastStore((s) => s.addTypingUsers);
  const removeTypingUsers = useConvoBroadCastStore((s) => s.removeTypingUsers);
  const addUploadingUsers = useConvoBroadCastStore((s) => s.addUploadingUsers);
  const removeUploadingUsers = useConvoBroadCastStore(
    (s) => s.removeUploadingUsers,
  );
  const activeConversationId = useActiveConversationStore(
    (s) => s.activeConversationId,
  );
  useEffect(() => {
    if (!channel) return;
    channel
      .on(
        "broadcast",
        { event: "typing:start" },
        ({ payload }: payloadProps) => {
          if (payload.userId === currentUserId) return;
          if (payload.conversationId !== activeConversationId) return;
          addTypingUsers(payload.conversationId, payload.userId);
        },
      )
      .on(
        "broadcast",
        { event: "typing:stop" },
        ({ payload }: payloadProps) => {
          if (payload.userId === currentUserId) return;
          if (payload.conversationId !== activeConversationId) return;
          removeTypingUsers(payload.conversationId, payload.userId);
        },
      )
      .on(
        "broadcast",
        { event: "media:upload:start" },
        ({ payload }: payloadProps) => {
          if (payload.userId === currentUserId) return;
          if (payload.conversationId !== activeConversationId) return;
          addUploadingUsers(payload.conversationId, payload.userId);
        },
      )
      .on(
        "broadcast",
        { event: "media:upload:stop" },
        ({ payload }: payloadProps) => {
          if (payload.userId === currentUserId) return;
          if (payload.conversationId !== activeConversationId) return;
          console.log("stop arrived");
          removeUploadingUsers(payload.conversationId, payload.userId);
        },
      );
    markReady("broadcast");
  }, [
    channel,
    currentUserId,
    removeTypingUsers,
    addTypingUsers,
    addUploadingUsers,
    removeUploadingUsers,
    markReady,
    activeConversationId,
  ]);
}
