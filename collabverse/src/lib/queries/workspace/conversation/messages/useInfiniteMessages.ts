import { getInfiniteMessages } from "@/lib/axios/workspace/conversation/messages/getInfiniteMessages";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useInfiniteMessages({
  bottom,
  top,
}: {
  bottom?: string;
  top?: string;
}) {
  const ws = useCurrentWorkspace();
  const conversation = useCurrentConversation();
  const cursor = bottom ? bottom : top;
  return useQuery({
    queryKey: [
      ws.id,
      "conversation",
      conversation.id,
      "messages-infinite",
      cursor,
    ],
    queryFn: () =>
      getInfiniteMessages({
        workspaceId: ws.id,
        conversationId: conversation.id,
        top,
        bottom,
      }),
    enabled: !!ws.id && !!conversation.id && !!cursor,
  });
}
