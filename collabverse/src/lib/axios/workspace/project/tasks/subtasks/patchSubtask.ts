import api from "@/lib/axios";

export async function patchSubtask({
  workspaceId,
  projectId,
  taskId,
  subtaskId,
  name,
  description,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  subtaskId: string;
  name?: string;
  description?: string;
}) {
  if (!name && !description) return;
  return await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/edit`,
    {
      name,
      description,
    },
  );
}
