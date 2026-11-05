import { getInitialMessages } from "@/lib/axios/workspace/conversation/messages/getInitialMessages";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useInitialMessages() {
  const ws = useCurrentWorkspace();
  const conversation = useCurrentConversation();
  return useQuery({
    queryKey: [ws.id, "conversation", conversation.id, "messages-initial"],
    queryFn: () =>
      getInitialMessages({
        workspaceId: ws.id,
        conversationId: conversation.id,
      }),
    enabled: !!ws.id && !!conversation.id,
  });
}
