import { getFullUserDetails } from "@/lib/axios/workspace/users/getFullUserDetails";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useFullUserDetails(userId: string) {
  const { id: workspaceId } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspaces", workspaceId, "users", userId],
    queryFn: () => getFullUserDetails({ workspaceId, userId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
