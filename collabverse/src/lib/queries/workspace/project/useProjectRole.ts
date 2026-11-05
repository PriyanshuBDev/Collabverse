import { getProjectRole } from "@/lib/axios/workspace/project/getProjectRole";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useProjectRole() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  return useQuery({
    queryKey: [workspaceId, projectId, "role"],
    queryFn: () => getProjectRole({ workspaceId, projectId }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!workspaceId || !!projectId,
  });
}
