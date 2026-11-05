import { clearAllMsgs } from "@/lib/axios/workspace/conversation/messages/clearAllMsgs";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useSidebarStore } from "@/lib/hooks/zustand/useSidebarStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export const useClearMessages = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  return useMutation({
    mutationFn: () => clearAllMsgs({ workspaceId, conversationId }),
    onMutate: () => {
      const state = useChatStore.getState();
      const sidebarState = useSidebarStore.getState();
      sidebarState.upsertOnlyData({
        id: conversationId,
        lastMessage: undefined,
      });
      state.clearMessages(conversationId);
    },
    onSuccess: () => {
      toast.success(`Chat cleared successfully`);
    },
    onError: () => {
      toast.error(`Failed to clear chat`);
    },
  });
};
