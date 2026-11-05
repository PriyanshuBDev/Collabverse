import { prisma } from "@/lib/db/prisma";
import { WsPermission, WsRole } from "@prisma/client";

export async function hasPermInWorkspace(
  role: WsRole,
  permission: WsPermission,
  workspaceId: string,
) {
  const res = await prisma.workspaceRole.findUnique({
    where: {
      workspaceId_role: {
        workspaceId,
        role,
      },
    },
    select: {
      permissions: true,
    },
  });
  return res?.permissions.includes(permission) ?? false;
}
