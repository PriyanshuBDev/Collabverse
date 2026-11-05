import { prisma } from "@/lib/db/prisma";

export async function reviveBothDmUser({
  conversationId,
  workspaceId,
}: {
  conversationId: string;
  workspaceId: string;
}) {
  await prisma.conversationMember.updateMany({
    where: {
      conversationId,
      workspaceId,
      conversation: {
        type: "Dm",
      },
    },
    data: {
      deletedAt: null,
    },
  });
}
