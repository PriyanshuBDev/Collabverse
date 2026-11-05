import { wsUsersForInviteResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getWsUserForInvite({
  workspaceId,
  projectId,
  cursor,
  search,
}: {
  workspaceId: string;
  projectId: string;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<wsUsersForInviteResProps>(
    `/api/workspace/${workspaceId}/projects/${projectId}/invitation/users`,
    {
      params: {
        cursor,
        search: search && search.trim().length > 1 ? search : undefined,
      },
    },
  );
  return res.data;
}
