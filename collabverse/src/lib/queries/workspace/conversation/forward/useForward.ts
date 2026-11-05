import { selectedConvosProps, selectedMsgsProps } from "@/app/interfaces";
import { forwardMsgs } from "@/lib/axios/workspace/conversation/forward/forwardMsgs";
import { getConversationsForward } from "@/lib/axios/workspace/conversation/forward/getConversationsForward";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useSearch } from "@/lib/hooks/useSearch";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useForward(search?: string) {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  const actualSearch = useSearch(search);
  const queryKey = [
    workspaceId,
    "conversations",
    "forward",
    actualSearch ?? "",
  ];

  const convo = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) =>
      await getConversationsForward({
        workspaceId,
        cursor: pageParam,
        search: actualSearch,
        conversationId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const forwardMsgsMutation = useMutation({
    mutationFn: async ({
      msgs,
      convos,
    }: {
      msgs: selectedMsgsProps[];
      convos: selectedConvosProps[];
    }) => await forwardMsgs({ workspaceId, conversationId, msgs, convos }),
    onSuccess: () => {
      toast.success(`Messages forwarded successfully`);
    },
    onError: (e: AxiosError<ApiError>) => {
      toast.error(
        getApiErrorMessage(
          e,
          `Failed to forward messages. Please try again later.`,
        ),
      );
      console.error(e);
    },
  });
  return { convo, forwardMsgsMutation };
}
