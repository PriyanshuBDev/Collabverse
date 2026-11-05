import {
  chatListLastMsg,
  chatMediaProps,
  CompleteChatProps,
  msgDataFileForApi,
  msgDataForApi,
} from "@/app/interfaces";
import { deleteFiles } from "@/lib/axios/workspace/conversation/messages/deleteFiles";
import { sendMessages } from "@/lib/axios/workspace/conversation/messages/sendMessages";
import { upsertSidebar } from "@/lib/hooks/realtime/Conversation/useConvoSidebarRT";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useMediaStore } from "@/lib/hooks/zustand/useMediaStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
export type sendMessageMutationProps = {
  msg: msgDataForApi;
  clientId: string;
};
export const useSendMessages = (conversationId: string) => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: currentUserId } = useCurrentUser();
  const state = useChatStore();
  const sendMsgs = useMutation({
    mutationFn: async ({ msg }: sendMessageMutationProps) =>
      await sendMessages({ conversationId, workspaceId, msg }),

    onSuccess: async (data, vars) => {
      const msg: CompleteChatProps = {
        ...data,
        sending: {
          progress: 100,
          status: "sent",
        },
        media: data.media.map((m: chatMediaProps) => ({
          ...m,
          url: vars.msg.files.find((f: msgDataFileForApi) => f.path === m.path)
            ?.url,
        })),
      };
      state.replaceMessage(conversationId, msg, vars.clientId);
      const lastMessage: chatListLastMsg = {
        ...msg,
        callStatus: msg.call?.status,
        messagedBy: {
          name: msg.user.name ?? "unknown",
          id: msg.user.id ?? "",
        },
        isDeletedForUser: msg.isDeletedForUser,
      };
      upsertSidebar(conversationId, workspaceId, currentUserId, false, {
        lastMessage,
        lastActivityAt: lastMessage.sentAt,
      });
      if (vars.msg.files.length > 0) {
        const ensureSignedUrls = useMediaStore.getState().ensureSignedUrls;
        await ensureSignedUrls(
          data.media,
          workspaceId,
          conversationId,
          data.id,
        );
      }
    },
    onError: async (e, vars) => {
      toast.error(`Failed to send messages. Please try again later.`);
      console.error(e);
      state.updateMessages(conversationId, vars.clientId, {
        sending: {
          progress: 0,
          status: "failed",
        },
      });

      if (vars.msg.files.length > 0) {
        await deleteFiles(vars.msg.files.map((f: msgDataFileForApi) => f.path));
      }
    },
  });
  return sendMsgs;
};
