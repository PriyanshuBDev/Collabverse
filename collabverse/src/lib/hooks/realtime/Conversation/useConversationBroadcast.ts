"use client";

import { useConvoChannelRT } from "@/components/wrappers/ConvoRtChannelProvider";
import useCurrentUser from "../../useCurrentUser";
import { useCallback } from "react";
import { useConvoBroadCastStore } from "../../zustand/useConvoBroadcastStore";
import { useActiveConversationStore } from "../../zustand/useActiveConversationStore";

export function useConversationBroadcast() {
  const { id: currentUserId } = useCurrentUser();
  const { channel } = useConvoChannelRT();
  const typingUsers = useConvoBroadCastStore(
    (s) => s.typingUsersByConversation,
  );
  const uploadingUsers = useConvoBroadCastStore(
    (s) => s.uploadingUsersByConversation,
  );
  const conversationId = useActiveConversationStore(
    (s) => s.activeConversationId,
  );
  const sendTypingStart = useCallback(async () => {
    if (!currentUserId || !channel) return;
    await channel.send({
      type: "broadcast",
      event: "typing:start",
      payload: {
        userId: currentUserId,
        conversationId,
      },
    });
  }, [currentUserId, channel, conversationId]);
  const sendTypingStop = useCallback(async () => {
    if (!currentUserId || !channel) return;
    await channel.send({
      type: "broadcast",
      event: "typing:stop",
      payload: {
        userId: currentUserId,
        conversationId,
      },
    });
  }, [currentUserId, channel, conversationId]);
  const sendMediaUploadingStart = useCallback(async () => {
    if (!currentUserId || !channel) return;
    await channel.send({
      type: "broadcast",
      event: "media:upload:start",
      payload: {
        userId: currentUserId,
        conversationId,
      },
    });
  }, [currentUserId, channel, conversationId]);
  const sendMediaUploadingStop = useCallback(async () => {
    if (!currentUserId || !channel) return;
    console.log("stop sent");
    await channel.send({
      type: "broadcast",
      event: "media:upload:stop",
      payload: {
        userId: currentUserId,
        conversationId,
      },
    });
  }, [currentUserId, channel, conversationId]);
  return {
    typingUsers,
    uploadingUsers,
    sendMediaUploadingStart,
    sendMediaUploadingStop,
    sendTypingStart,
    sendTypingStop,
  };
}
