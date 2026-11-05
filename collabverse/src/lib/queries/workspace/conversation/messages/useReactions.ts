import { commentReactionProps } from "@/app/interfaces";
import { toggleReaction } from "@/lib/axios/workspace/conversation/messages/toggleReaction";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
type prop = {
  reactedBy: string[];
  emoji: string;
};
export const useReactions = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const { id: userId } = useCurrentUser();
  const { updateMessages } = useChatStore.getState();
  return useMutation({
    mutationFn: ({
      reaction,
      messageId,
    }: {
      reaction: string;
      messageId: string;
      allReactions: commentReactionProps[];
    }) => toggleReaction({ workspaceId, conversationId, messageId, reaction }),
    onMutate: ({ reaction, messageId, allReactions }) => {
      const previous = allReactions;
      const reactions = allReactions.map((r: commentReactionProps) => ({
        ...r,
        reactedBy: [...r.reactedBy],
      }));
      reactions.forEach((r) => {
        r.reactedBy = r.reactedBy.filter((id: string) => id !== userId);
      });
      const newReactions = reactions.filter(
        (r: prop) => r.reactedBy.length > 0,
      );

      const alreadyReacted = allReactions.some(
        (r: commentReactionProps) =>
          r.emoji === reaction && r.reactedBy.includes(userId),
      );
      if (!alreadyReacted) {
        const existing = newReactions.find((r: prop) => r.emoji === reaction);
        if (existing) {
          existing.reactedBy.push(userId);
        } else {
          newReactions.push({
            emoji: reaction,
            reactedBy: [userId],
          });
        }
      }
      updateMessages(conversationId, messageId, { reactions: newReactions });
      return { previous };
    },
    onError: (e: AxiosError<ApiError>, { messageId }, ctx) => {
      toast.error(getApiErrorMessage(e, "Failed to update reaction"));
      updateMessages(conversationId, messageId, { reactions: ctx?.previous });
    },
  });
};
