import { projectFilteredUsersResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getUsersToAdd({
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
  const res = await api.get<projectFilteredUsersResProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/tasks/${taskId}/users/assign/users`,
    {
      params: {
        cursor,
        search: search && search.length > 1 ? search : undefined,
      },
    },
  );
  return res.data;
}
