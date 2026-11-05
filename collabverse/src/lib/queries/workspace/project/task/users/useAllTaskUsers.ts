import { getAllTaskUsers } from "@/lib/axios/workspace/project/tasks/users/getAllTaskUsers";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useAllTaskUsers() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const { id: taskId } = useCurrentTask();
  return useQuery({
    queryKey: [workspaceId, "conversations", "ids"],
    queryFn: () => getAllTaskUsers({ workspaceId, taskId, projectId }),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
