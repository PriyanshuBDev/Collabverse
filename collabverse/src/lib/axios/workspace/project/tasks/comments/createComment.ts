import { commentDataForApi, CompleteCommentProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function createComment({
  workspaceId,
  projectId,
  taskId,
  comment,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  comment: commentDataForApi;
}) {
  const res = await api.post<{ comment: CompleteCommentProps }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/create`,
    {
      comment,
    },
  );
  return res.data.comment;
}
