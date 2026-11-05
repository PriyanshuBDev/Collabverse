import { commentMentions } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getCommentMentions({
  workspaceId,
  projectId,
  taskId,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
}) {
  const res = await api.get<{ mentions: commentMentions[] }>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments/mentions`,
  );
  return res.data.mentions;
}
