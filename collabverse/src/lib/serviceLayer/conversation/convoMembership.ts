import { prisma } from "@/lib/db/prisma";

export async function dmMembership(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  const user = await prisma.conversationMember.findFirst({
    where: {
      workspaceId,
      conversationId,
      userId,
      deletedAt: null,
      conversation: {
        type: "Dm",
      },
    },
    select: {
      conversationId: true,
    },
  });
  return user?.conversationId ?? undefined;
}

export async function convoMembership(
  workspaceId: string,
  conversationId: string,
  userId: string,
) {
  const user = await prisma.conversationMember.findFirst({
    where: {
      workspaceId,
      conversationId,
      userId,
      deletedAt: null,
      kickedAt: null,
      leftAt: null,
    },
    select: {
      conversationId: true,
      conversation: {
        select: {
          type: true,
        },
      },
      status: true,
      clearedAt: true,
    },
  });
  if (!user) return undefined;
  if (user.conversation.type === "Dm") {
    return {
      clearedAt: user.clearedAt,
    };
  } else {
    if (user.status === "Active") {
      return {
        clearedAt: user.clearedAt,
      };
    } else {
      return undefined;
    }
  }
}
