import { getAttachmentSignedUrl } from "@/lib/axios/workspace/project/tasks/attachments/getAttachmentSignedUrl";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQuery } from "@tanstack/react-query";

export function useTaskAttachmentUrl(attachmentId: string) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  return useQuery({
    queryKey: [
      ws.id,
      project.id,
      "task",
      task.id,
      "attachments",
      attachmentId,
      "download",
    ],
    queryFn: () =>
      getAttachmentSignedUrl({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        attachmentId,
      }),
    staleTime: 3 * 60 * 1000,
    enabled: false,
    refetchOnWindowFocus: false,
  });
}
