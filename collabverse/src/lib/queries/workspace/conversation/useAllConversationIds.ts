import { getAllConversationIds } from "@/lib/axios/workspace/conversation/getAllConversationIds";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useAllConversationIds() {
  const { id: workspaceId } = useCurrentWorkspace();
  return useQuery({
    queryKey: [workspaceId, "conversations", "ids"],
    queryFn: () => getAllConversationIds({ workspaceId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
