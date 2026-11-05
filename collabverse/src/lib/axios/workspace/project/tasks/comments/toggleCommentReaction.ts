import api from "@/lib/axios";

export async function toggleCommentReaction({
  workspaceId,
  projectId,
  taskId,
  commentId,
  reaction,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  commentId: string;
  reaction: string;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/${commentId}/reaction`,
    { reaction },
  );
}
