import { getCommentMentions } from "@/lib/axios/workspace/project/tasks/comments/getCommentMentions";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useCommentMentions() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const { id: taskId } = useCurrentTask();
  return useQuery({
    queryKey: [workspaceId, projectId, taskId, "comments", "mentions"],
    queryFn: () => getCommentMentions({ workspaceId, projectId, taskId }),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!workspaceId || !!projectId || !!taskId,
  });
}
