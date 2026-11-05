import api from "@/lib/axios";

export async function markCommentAsRead({
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
  await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/mark-read`,
  );
}
