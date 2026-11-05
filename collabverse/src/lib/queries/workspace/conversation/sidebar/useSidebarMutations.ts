import { chatListProps } from "@/app/interfaces";
import { handleConversationMute } from "@/lib/axios/workspace/conversation/handleConversationMute";
import { clearConvesation } from "@/lib/axios/workspace/conversation/sidebar/clearConversation";
import { removeConversation } from "@/lib/axios/workspace/conversation/sidebar/removeConversation";
import { togglePinningConversation } from "@/lib/axios/workspace/conversation/sidebar/togglePinningConversation";
import { upsertSidebar } from "@/lib/hooks/realtime/Conversation/useConvoSidebarRT";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useSidebarStore } from "@/lib/hooks/zustand/useSidebarStore";
import { MuteEnum } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
type MuteMutationData = {
  enabled: boolean;
  muteType?: MuteEnum;
  conversation: chatListProps;
};

type pinMutationData = {
  conversationId: string;
  enabled: boolean;
  currentPinIdx?: number;
};

export function useSidebarMutations(currentConversation?: string) {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: currentUserId } = useCurrentUser();
  const { remove } = useSidebarStore();
  const { deleteConversation, clearMessages } = useChatStore();
  const queryClient = useQueryClient();
  const router = useRouter();
  const muteMutation = useMutation({
    mutationFn: ({ enabled, muteType, conversation }: MuteMutationData) =>
      handleConversationMute({
        workspaceId,
        conversationId: conversation.id,
        muteType,
        enabled,
      }),
    onMutate: async ({ muteType, enabled, conversation }) => {
      if (enabled) {
        upsertSidebar(conversation.id, workspaceId, currentUserId, true, {
          mute: muteType,
          mutedAt: new Date(),
        });
      } else {
        upsertSidebar(conversation.id, workspaceId, currentUserId, true, {
          mute: undefined,
          mutedAt: undefined,
        });
      }
    },
    onError: (_err, data) => {
      upsertSidebar(data.conversation.id, workspaceId, currentUserId, true, {
        mute: data.conversation.mute,
        mutedAt: data.conversation.mutedAt,
      });

      toast.error(
        `Failed to ${data.enabled ? "mute" : "unmute"} ${data.conversation.name}`,
      );
    },
    onSuccess: (_, vars) => {
      toast.success(
        `${vars.conversation.name} is ${vars.enabled ? `muted for ${vars.muteType === "Always" ? "forever" : vars.muteType === "Eight" ? "eight hrs" : "a week"}` : "unmuted"}`,
      );
    },
    onSettled: (_d, _e, vars) => {
      queryClient.invalidateQueries({
        queryKey:
          vars.conversation.type === "Dm"
            ? [workspaceId, "Conversation", vars.conversation.id, "dm-data"]
            : [workspaceId, "conversation", vars.conversation.id, "group-data"],
      });
    },
  });
  const removeMutation = useMutation({
    mutationFn: (conversation: chatListProps) =>
      removeConversation({
        workspaceId,
        conversationId: conversation.id,
      }),
    onMutate: (conversation) => {
      remove(conversation.id);
      if (currentConversation === conversation.id) {
        router.push(`/app/${workspaceId}/conversation`);
      }
    },
    onError: (_err, _data) => {
      upsertSidebar(_data.id, workspaceId, currentUserId, false, {
        ..._data,
      });

      toast.error(`Failed to delete ${_data.name}'s chat `);
    },
    onSuccess: (_d, vars) => {
      toast.success(`${vars.name} has been deleted successfully`);
      deleteConversation(vars.id);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [workspaceId, "conversations", "ids"],
      });
    },
  });
  const clearChat = useMutation({
    mutationFn: (conversation: chatListProps) =>
      clearConvesation({ workspaceId, conversationId: conversation.id }),
    onMutate: (conversation) => {
      upsertSidebar(conversation.id, workspaceId, currentUserId, true, {
        lastMessage: undefined,
        unread: 0,
      });
    },
    onError: (_err, _data) => {
      upsertSidebar(_data.id, workspaceId, currentUserId, true, {
        lastMessage: _data.lastMessage,
        unread: _data.unread,
      });

      toast.error(`Failed to clear ${_data.name}'s chat `);
    },
    onSuccess: (_d, vars) => {
      clearMessages(vars.id);
      toast.success(`${vars.name}'s chat has been cleared successfully`);
    },
  });
  const togglePin = useMutation({
    mutationFn: ({ conversationId, enabled }: pinMutationData) =>
      togglePinningConversation({ workspaceId, conversationId, enabled }),
    onMutate: ({ conversationId, enabled }: pinMutationData) => {
      if (enabled) {
        const { byId } = useSidebarStore.getState();
        const highestPinIdx = Object.values(byId).reduce((highest, convo) => {
          if (convo.pinIdx === undefined) return highest;
          if (!highest) return convo;
          return convo.pinIdx > highest.pinIdx! ? convo : highest;
        }).pinIdx;
        upsertSidebar(conversationId, workspaceId, currentUserId, false, {
          pinIdx: highestPinIdx ?? 0,
        });
      } else {
        upsertSidebar(conversationId, workspaceId, currentUserId, false, {
          pinIdx: undefined,
        });
      }
    },
    onError: (_, { conversationId, enabled, currentPinIdx }) => {
      if (enabled) {
        upsertSidebar(conversationId, workspaceId, currentUserId, false, {
          pinIdx: undefined,
        });
      } else {
        upsertSidebar(conversationId, workspaceId, currentUserId, false, {
          pinIdx: currentPinIdx,
        });
      }
    },
  });

  return {
    muteMutation,
    removeMutation,
    clearChat,
    togglePin,
  };
}
