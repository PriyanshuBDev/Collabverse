import api from "@/lib/axios";

export async function deleteComment({
  workspaceId,
  projectId,
  taskId,
  commentId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  commentId: string;
}) {
  return await api.delete(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/delete`,
  );
}
