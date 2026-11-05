import { GroupPerm } from "@prisma/client";
import api from "@/lib/axios";

export async function toggleGroupPerm({
  workspaceId,
  permission,
  conversationId,

  enabled,
}: {
  workspaceId: string;
  conversationId: string;
  permission: GroupPerm;
  enabled: boolean;
}) {
  return await api.patch(
    `/api/workspace/${workspaceId}/conversation/${conversationId}/group/perm/toggle`,
    {
      permission,
      enabled,
    },
  );
}
