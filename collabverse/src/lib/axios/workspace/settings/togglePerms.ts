import { WsPermission } from "@prisma/client";
import api from "../..";
import { wsRoleChange } from "../users/changeUserRole";

export async function togglePerms({
  id,
  role,
  permission,
  enabled,
}: {
  id: string;
  role: wsRoleChange;
  permission: WsPermission;
  enabled: boolean;
}) {
  return await api.patch(`/api/workspace/${id}/settings/permissions/${role}`, {
    permission,
    enabled,
  });
}
