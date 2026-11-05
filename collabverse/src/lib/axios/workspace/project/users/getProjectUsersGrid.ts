import { projectUserResPropsGrid } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getProjectUsersGrid({
  workspaceId,
  projectId,
  taskId,
  search,
  cursorId,
}: {
  workspaceId: string;
  projectId: string;
  cursorId?: string;
  taskId?: string;
  search?: string;
}) {
  const res = await api.get<projectUserResPropsGrid>(
    `/api/workspace/${workspaceId}/projects/${projectId}/users`,
    {
      params: {
        mode: "cursor",
        cursorId,
        search,
        taskId,
      },
    },
  );
  return res.data;
}
