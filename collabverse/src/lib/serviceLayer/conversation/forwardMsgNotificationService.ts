import { prisma } from "@/lib/db/prisma";
import { isUserMuted } from "@/lib/functions/conversation/isUserMuted";
import { ChatListType } from "@prisma/client";
type usersToSendProps = {
  userId: string;
  type: ChatListType;
  name: string | null;
  convoId: string;
};
export async function forwardMsgNotificationService(
  convoIds: string[],
  workspaceId: string,
  userId: string,
  messageLength: string,
) {
  const now = Date.now();
  const usersToSend: usersToSendProps[] = [];
  const users = await prisma.workspaceMember.findMany({
    where: {
      workspaceId,
      userId: {
        not: userId,
      },
      coversationMember: {
        some: {
          conversationId: {
            in: convoIds,
          },
          kickedAt: null,
          deletedAt: null,
          leftAt: null,
        },
      },
    },
    select: {
      activeConversationId: true,
      activeConvoExpiresAt: true,
      userId: true,
      coversationMember: {
        where: {
          conversationId: {
            in: convoIds,
          },
          kickedAt: null,
          deletedAt: null,
          leftAt: null,
        },
        select: {
          mutedAt: true,
          mutedFor: true,
          conversation: {
            select: {
              type: true,
              name: true,
              id: true,
            },
          },
        },
      },
    },
  });
  for (const user of users) {
    const expired =
      !user.activeConvoExpiresAt || user.activeConvoExpiresAt.getTime() < now;

    for (const member of user.coversationMember) {
      const muted = isUserMuted(member.mutedAt, member.mutedFor);
      if (
        (user.activeConversationId === member.conversation.id && !expired) ||
        muted
      ) {
        continue;
      }
      usersToSend.push({
        userId: user.userId,
        convoId: member.conversation.id,
        type: member.conversation.type,
        name: member.conversation.name,
      });
    }
  }

  await prisma.notification.createMany({
    data: usersToSend.map((u: usersToSendProps) => ({
      userId: u.userId,
      type: "forward_messages",
      senderId: userId,
      workspaceId,
      ...(u.name && { target: { name: u.name } }),
      meta: {
        conversationId: u.convoId,
        type: u.type,
        items: messageLength,
      },
    })),
  });
}
