import { taskProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getTask({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const res = await api.get<{ task: taskProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}`,
  );
  return res.data.task;
}
