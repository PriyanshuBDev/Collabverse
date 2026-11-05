import { prisma } from "@/lib/db/prisma";

export async function projectRole(
  userId: string,
  workspaceId: string,
  projectId: string,
) {
  const res = await prisma.projectMember.findUnique({
    where: {
      workspaceMemberUserId_workspaceMemberWsId_projectId: {
        workspaceMemberUserId: userId,
        workspaceMemberWsId: workspaceId,
        projectId,
      },
    },
    select: {
      role: true,
    },
  });
  return res?.role;
}
