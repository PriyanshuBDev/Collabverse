import { subTaskProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function createSubtask({
  workspaceId,
  projectId,
  taskId,
  name,
  description,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  name: string;
  description?: string;
}) {
  const res = await api.post<{ subtask: subTaskProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/create`,
    {
      name,
      description,
    },
  );
  return res.data.subtask;
}
