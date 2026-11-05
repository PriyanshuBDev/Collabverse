import api from "@/lib/axios";
import { TaskStatus } from "@prisma/client";

export async function patchTaskStatus({
  workspaceId,
  projectId,
  taskId,
  status,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  status: TaskStatus;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/status`,
    {
      status,
    },
  );
}
