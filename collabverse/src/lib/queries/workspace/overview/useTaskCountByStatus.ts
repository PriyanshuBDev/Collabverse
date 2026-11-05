import { getTaskCountByStatus } from "@/lib/axios/workspace/overview/getTaskCountByStatus";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskCountByStatus(projectId?: string) {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "task-count", projectId],
    queryFn: () =>
      getTaskCountByStatus({ workspaceId: id, projectId: projectId! }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id && !!projectId,
  });
}
