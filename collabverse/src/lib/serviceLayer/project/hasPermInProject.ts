import { prisma } from "@/lib/db/prisma";
import { PPermission, PRole } from "@prisma/client";

export async function hasPermInProject(
  role: PRole,
  permission: PPermission,
  projectId: string,
) {
  const res = await prisma.projectRole.findUnique({
    where: {
      projectId_role: {
        role,
        projectId,
      },
    },
    select: {
      permissions: true,
    },
  });
  if (!res) {
    return false;
  }
  return res.permissions.includes(permission);
}
