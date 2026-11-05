import { getTaskRole } from "@/lib/axios/workspace/project/tasks/comments/getTaskRole";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskRole() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const { id: taskId } = useCurrentTask();
  return useQuery({
    queryKey: [workspaceId, projectId, taskId, "comments", "role"],
    queryFn: () => getTaskRole({ workspaceId, projectId, taskId }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!workspaceId || !!projectId || !!taskId,
  });
}
