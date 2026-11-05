import {
  chatPins,
  convoDetailsProps,
  selectedMsgsProps,
} from "@/app/interfaces";
import { deleteMessages } from "@/lib/axios/workspace/conversation/messages/deleteMessages";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useSidebarStore } from "@/lib/hooks/zustand/useSidebarStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
type props = {
  msgs: selectedMsgsProps[];
  others: boolean;
};
export const useDeleteMessages = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ msgs, others }: props) =>
      deleteMessages({ workspaceId, conversationId, msgs, others }),
    onMutate: (vars) => {
      const state = useChatStore.getState();
      const sidebarState = useSidebarStore.getState();
      for (const m of vars.msgs) {
        state.updateMessages(conversationId, m.msgId, {
          isDeleted: vars.others,
          isDeletedForUser: true,
        });
        const lastMessage = sidebarState.byId[conversationId].lastMessage;
        if (lastMessage && lastMessage.id === m.msgId) {
          sidebarState.upsertOnlyData({
            id: conversationId,
            lastMessage: {
              ...lastMessage,
              isDeleted: vars.others,
              isDeletedForUser: true,
            },
          });
        }
        queryClient.setQueryData<convoDetailsProps>(
          [workspaceId, "conversation", conversationId, "details"],
          (oldData: convoDetailsProps | undefined) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pins: oldData.pins.filter(
                (p: chatPins) => p.messageId !== m.msgId,
              ),
            };
          },
        );
      }
    },
    onSuccess: (_d, vars) => {
      toast.success(
        `${vars.msgs.length > 1 ? "Messages" : "Message"} deleted successfully`,
      );
      queryClient.invalidateQueries({
        queryKey: [
          workspaceId,
          "conversation",
          conversationId,
          "messages",
          "pinnned",
        ],
      });
    },
    onError: (_e, vars) => {
      toast.error(
        `Failed to delete ${vars.msgs.length > 1 ? "messages" : "message"}`,
      );
      queryClient.invalidateQueries({
        queryKey: [
          workspaceId,
          "conversation",
          conversationId,
          "messages",
          "pinnned",
        ],
      });
    },
  });
};
