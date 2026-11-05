import { prisma } from "@/lib/db/prisma";

export async function isWorkspaceMember(userId: string, workspaceId: string) {
  try {
    const isAllowed = await prisma.workspaceMember.findUnique({
      where: {
        userId_workspaceId: {
          userId,
          workspaceId,
        },
      },
      select: {
        userId: true,
      },
    });
    return !!isAllowed;
  } catch {
    throw new Error("Something went wrong");
  }
}
