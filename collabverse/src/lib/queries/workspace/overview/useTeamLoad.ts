import { getTeamLoad } from "@/lib/axios/workspace/overview/getTeamLoad";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTeamLoad(projectId?: string) {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "team-load", projectId],
    queryFn: () => getTeamLoad({ workspaceId: id, projectId: projectId! }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!projectId && !!id,
  });
}
