import api from "@/lib/axios";

export async function markAllCommentsAsRead({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/mark-all`,
  );
}
