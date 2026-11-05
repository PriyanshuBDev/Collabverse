import { getCommentsResProps } from "@/app/interfaces";
import api from "@/lib/axios";
export type getMessageMode = "latest" | "before" | "after" | "around";
export async function getComments({
  workspaceId,
  taskId,
  projectId,
  mode,
  cursor,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  mode: getMessageMode;
  cursor?: string;
}) {
  const res = await api.get<getCommentsResProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/comments`,
    {
      params: {
        mode,
        cursor,
      },
    },
  );
  return res.data;
}
