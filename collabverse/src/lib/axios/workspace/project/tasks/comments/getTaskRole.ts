import api from "@/lib/axios";
import { TaskRole } from "@prisma/client";

export async function getTaskRole({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const res = await api.get<{ role: TaskRole | undefined }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/role`,
  );
  return res.data;
}
