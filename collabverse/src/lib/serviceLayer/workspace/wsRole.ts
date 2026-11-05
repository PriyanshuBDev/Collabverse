import { prisma } from "@/lib/db/prisma";

export async function wsRole(userId: string, workspaceId: string) {
  try {
    const wsRole = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId,
        },
      },

      select: {
        role: true,
      },
    });
    return wsRole?.role;
  } catch (e) {
    throw e;
  }
}
