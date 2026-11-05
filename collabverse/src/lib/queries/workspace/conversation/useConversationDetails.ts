import { getConversationDetails } from "@/lib/axios/workspace/conversation/getConversationDetails";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useConversationDetails() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: conversationId } = useCurrentConversation();
  return useQuery({
    queryKey: [workspaceId, "conversation", conversationId, "details"],
    queryFn: () => getConversationDetails({ workspaceId, conversationId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
