import { prisma } from "@/lib/db/prisma";
import { isUserMuted } from "@/lib/functions/conversation/isUserMuted";
import { $Enums, ChatListType } from "@prisma/client";
type prop = {
  userId: string;
  activeConversationId: string | null;
  activeConvoExpiresAt: Date | null;
  coversationMember: {
    mutedFor: $Enums.MuteEnum | null;
    mutedAt: Date | null;
  }[];
};
export async function newMsgNotificationService(
  currentConvoId: string,
  workspaceId: string,
  userId: string,
  convoType: ChatListType,
  convoName: string | null,
  mentionedUser: string[],
) {
  const now = Date.now();
  const usersToSendIds = (
    await prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: {
          not: userId,
        },
        coversationMember: {
          some: {
            conversationId: currentConvoId,
            kickedAt: null,
            deletedAt: null,
            leftAt: null,
          },
        },
      },
      select: {
        activeConversationId: true,
        activeConvoExpiresAt: true,
        coversationMember: {
          where: {
            conversationId: currentConvoId,
          },
          select: {
            mutedAt: true,
            mutedFor: true,
          },
        },
        userId: true,
      },
    })
  )
    .filter((u: prop) => {
      const expired =
        !u.activeConvoExpiresAt || u.activeConvoExpiresAt.getTime() < now;
      const muted = isUserMuted(
        u.coversationMember[0]?.mutedAt,
        u.coversationMember[0]?.mutedFor,
      );
      return (u.activeConversationId !== currentConvoId || expired) && !muted;
    })
    .map((u: prop) => u.userId);
  const removeUserSet = new Set(mentionedUser);
  const usersToSendSet = new Set(usersToSendIds);
  const usersToSendMsgNotificationIds = usersToSendIds.filter(
    (u: string) => !removeUserSet.has(u),
  );
  const usersToSendMentionNotificationIds = mentionedUser.filter((u: string) =>
    usersToSendSet.has(u),
  );
  await prisma.notification.createMany({
    data: usersToSendMsgNotificationIds.map((u: string) => ({
      userId: u,
      type: convoType === "Dm" ? "new_message_dm" : "new_message_group",
      senderId: userId,
      workspaceId,
      ...(convoName && { target: { name: convoName } }),
      meta: {
        conversationId: currentConvoId,
      },
    })),
  });
  if (usersToSendMentionNotificationIds.length > 0) {
    await prisma.notification.createMany({
      data: usersToSendMentionNotificationIds.map((u: string) => ({
        userId: u,
        type: "mentioned_in_group",
        senderId: userId,
        workspaceId,
        ...(convoName && { target: { name: convoName } }),
        meta: {
          conversationId: currentConvoId,
        },
      })),
    });
  }
}
