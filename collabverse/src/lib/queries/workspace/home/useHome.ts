import { getHome } from "@/lib/axios/workspace/home/getHome";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useHome() {
  const { id: workspaceId } = useCurrentWorkspace();
  return useQuery({
    queryKey: [workspaceId, "home"],
    queryFn: () => getHome({ workspaceId }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!workspaceId,
  });
}
