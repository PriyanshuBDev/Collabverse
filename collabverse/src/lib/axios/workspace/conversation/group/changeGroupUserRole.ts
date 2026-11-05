import api from "@/lib/axios";
import { GroupRole } from "@prisma/client";

export async function changeGroupUserRole({
  workspaceId,
  conversationId,
  userId,
  role,
}: {
  workspaceId: string;
  conversationId: string;
  userId: string;
  role: GroupRole;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/users/${userId}/role`,
    {
      role,
    },
  );
}
