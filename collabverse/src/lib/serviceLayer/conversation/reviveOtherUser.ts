import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";

export async function reviveOtherUser({
  conversationId,
  currentUserId,
}: {
  currentUserId: string;
  conversationId: string;
}) {
  const members = await prisma.conversation.findFirst({
    where: {
      id: conversationId,
      type: "Dm",
      conversationMember: {
        some: {
          userId: currentUserId,
          deletedAt: null,
        },
      },
    },
    select: {
      conversationMember: {
        take: 1,
        where: {
          userId: {
            not: currentUserId,
          },
        },
        select: {
          userId: true,
          deletedAt: true,
        },
      },
    },
  });
  const otherUser = members?.conversationMember[0];
  if (!otherUser) {
    return apiErrorCustom("Something went wrong");
  }
  if (otherUser.deletedAt) {
    await prisma.conversationMember.update({
      where: {
        userId_conversationId: {
          userId: otherUser.userId,
          conversationId,
        },
      },
      data: {
        deletedAt: null,
      },
    });
  }
}
