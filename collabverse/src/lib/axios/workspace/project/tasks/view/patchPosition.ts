import api from "@/lib/axios";
import { TaskStatus } from "@prisma/client";

export async function patchPosition({
  workspaceId,
  projectId,
  taskId,
  status,
  nextId,
  prevId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  status: TaskStatus;
  prevId?: string;
  nextId?: string;
}) {
  const res = await api.patch<{
    success: boolean;
    rebalance: boolean;
    status: TaskStatus;
  }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/reorder`,
    {
      prevId,
      nextId,
      status,
    },
  );
  return res.data;
}
