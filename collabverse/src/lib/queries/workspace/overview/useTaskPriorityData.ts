import { getTaskPriority } from "@/lib/axios/workspace/overview/getTaskPriority";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskPriorityData(projectId?: string) {
  const { id } = useCurrentWorkspace();
  return useQuery({
    queryKey: ["workspace", id, "home", "task-priority", projectId],
    queryFn: () => getTaskPriority({ workspaceId: id, projectId: projectId! }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!projectId && !!id,
  });
}
