import { taskUserResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getTaskUsers({
  workspaceId,
  projectId,
  taskId,
  cursor,
  search,
}: {
  workspaceId: string;
  projectId: string;
  taskId: string;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<taskUserResProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users`,
    {
      params: {
        cursor,
        search,
      },
    },
  );
  return res.data;
}
