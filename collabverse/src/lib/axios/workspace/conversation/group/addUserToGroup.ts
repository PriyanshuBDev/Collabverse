import { createGroupUserProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function addUserToGroup({
  workspaceId,
  conversationId,
  users,
}: {
  workspaceId: string;
  conversationId: string;
  users: createGroupUserProps[];
}) {
  return await api.post(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/users/add`,
    {
      users,
    },
  );
}
