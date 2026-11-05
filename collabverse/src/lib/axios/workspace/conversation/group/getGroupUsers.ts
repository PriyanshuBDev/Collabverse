import { getGroupUsersResProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getGroupUsers({
  workspaceId,
  conversationId,
  cursorId,
  search,
}: {
  workspaceId: string;
  conversationId: string;
  cursorId?: string;
  search?: string;
}) {
  const res = await api.get<getGroupUsersResProps>(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/users`,
    {
      params: {
        cursorId,
        search,
      },
    },
  );
  return res.data;
}
