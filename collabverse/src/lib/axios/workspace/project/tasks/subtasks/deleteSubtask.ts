import api from "@/lib/axios";

export async function deleteSubtask({
  workspaceId,
  projectId,
  taskId,
  subtaskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  subtaskId: string;
}) {
  return await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/subtasks/${subtaskId}/delete`,
  );
}
