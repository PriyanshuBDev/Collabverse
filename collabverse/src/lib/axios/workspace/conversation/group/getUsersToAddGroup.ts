import { usersToAddGroupResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getUsersToAddGroup({
  workspaceId,
  groupId,
  search,
  cursor,
}: {
  workspaceId: string;
  groupId?: string;
  search?: string;
  cursor?: string;
}) {
  const res = await api.get<usersToAddGroupResProps>(
    `/api/workspace/${workspaceId}/conversation/group/users/to-add`,
    {
      params: {
        groupId,
        search,
        cursor,
      },
    },
  );
  return res.data;
}
