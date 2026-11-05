import { chatPinProps, convoDetailsProps } from "@/app/interfaces";
import { getPinnedMessages } from "@/lib/axios/workspace/conversation/pin/getPinnedMessages";
import { unpinAllMsgs } from "@/lib/axios/workspace/conversation/pin/unpinAllMsgs";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const usePinnedMessages = () => {
  const { id: conversationId } = useCurrentConversation();
  const { id: workspaceId } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  const queryKey = [
    workspaceId,
    "conversation",
    conversationId,
    "messages",
    "pinned",
  ];
  const convoDetailKey = [
    workspaceId,
    "conversation",
    conversationId,
    "details",
  ];
  const pinnedMsgs = useQuery({
    queryKey,
    queryFn: () => getPinnedMessages({ workspaceId, conversationId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const unpinAll = useMutation({
    mutationFn: ({}: { setLoading: (value: boolean) => void }) =>
      unpinAllMsgs({ workspaceId, conversationId }),
    onMutate: async ({ setLoading }) => {
      setLoading(false);
      await queryClient.cancelQueries({ queryKey });
      await queryClient.cancelQueries({ queryKey: convoDetailKey });
      const previousData = queryClient.getQueryData<chatPinProps[]>(queryKey);
      queryClient.setQueriesData<chatPinProps[]>(
        { queryKey },
        (oldData: chatPinProps[] | undefined) => {
          if (!oldData) return oldData;
          return [];
        },
      );
      const previousConvoDetails =
        queryClient.getQueryData<convoDetailsProps>(convoDetailKey);
      queryClient.setQueryData<convoDetailsProps>(
        convoDetailKey,
        (oldData: convoDetailsProps | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pins: [],
          };
        },
      );

      return { previousData, previousConvoDetails };
    },
    onError: (e: AxiosError<ApiError>, v, ctx) => {
      queryClient.setQueryData(queryKey, ctx?.previousData);
      queryClient.setQueryData(convoDetailKey, ctx?.previousConvoDetails);
      toast.error(getApiErrorMessage(e, "Failed to unpin all messages"));
      v.setLoading(false);
    },
    onSuccess: (_d, v, ctx) => {
      toast.success("All messages unpinned successfully");
      ctx.previousConvoDetails?.pins.forEach((p) => {
        useChatStore
          .getState()
          .updateMessages(conversationId, p.messageId, { isPinned: false });
      });
      v.setLoading(false);
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: convoDetailKey,
      });
    },
  });
  return {
    ...pinnedMsgs,
    unpinAll,
  };
};
