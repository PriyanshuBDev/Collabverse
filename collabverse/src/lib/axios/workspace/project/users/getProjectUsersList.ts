import { projectUserResPropsList } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getProjectUsersList({
  workspaceId,
  projectId,
  page,
  taskId,
  search,
}: {
  workspaceId: string;
  projectId: string;
  page: number;
  taskId?: string;
  search?: string;
}) {
  const res = await api.get<projectUserResPropsList>(
    `/api/workspace/${workspaceId}/projects/${projectId}/users`,
    {
      params: {
        mode: "offset",
        page,
        search,
        taskId,
      },
    },
  );
  return res.data;
}
