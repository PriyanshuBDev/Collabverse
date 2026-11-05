import { findDmConvo } from "@/lib/axios/workspace/conversation/dm/new/findDmConvo";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useFindDmConvo(userId: string) {
  const { id: workspaceId } = useCurrentWorkspace();

  return useQuery({
    queryKey: [workspaceId, "Conversation", "new", userId],
    queryFn: () => findDmConvo({ workspaceId, userId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
