import { usersToAddGroupResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getNewUsersForDm({
  workspaceId,
  cursor,
  search,
}: {
  workspaceId: string;
  cursor?: string;
  search?: string;
}) {
  const res = await api.get<usersToAddGroupResProps>(
    `/api/workspace/${workspaceId}/conversation/dm/new`,
    {
      params: {
        cursor,
        search,
      },
    },
  );
  return res.data;
}
