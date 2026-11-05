import api from "./../../..";

export async function deleteTask({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/task/${taskId}/delete`,
  );
}
