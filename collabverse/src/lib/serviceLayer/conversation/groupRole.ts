import { prisma } from "@/lib/db/prisma";

export async function groupRole(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  const user = await prisma.conversationMember.findFirst({
    where: {
      conversation: {
        type: "Group",
      },
      workspaceId,
      conversationId,
      userId,
      status: "Active",
      kickedAt: null,
      deletedAt: null,
      leftAt: null,
    },
    select: {
      role: true,
    },
  });
  return user?.role ?? undefined;
}
