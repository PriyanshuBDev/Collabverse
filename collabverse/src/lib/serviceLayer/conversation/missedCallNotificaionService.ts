import { isUserMuted } from "@/lib/functions/conversation/isUserMuted";
import { $Enums, CallType, Prisma } from "@prisma/client";
type prop = {
  userId: string;
  activeConversationId: string | null;
  activeConvoExpiresAt: Date | null;
  coversationMember: {
    mutedFor: $Enums.MuteEnum | null;
    mutedAt: Date | null;
  }[];
};
export async function missedCallNotificationService(
  tx: Prisma.TransactionClient,
  currentConvoId: string,
  workspaceId: string,
  userId: string,
  callType: CallType,
  convoName: string | null,
  callId: string,
) {
  const usersToSendIds = (
    await tx.workspaceMember.findMany({
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
      const muted = isUserMuted(
        u.coversationMember[0]?.mutedAt,
        u.coversationMember[0]?.mutedFor,
      );
      return !muted;
    })
    .map((u: prop) => u.userId);

  await tx.notification.createMany({
    data: usersToSendIds.map((u: string) => ({
      userId: u,
      type: callType === "Video" ? "missed_video_call" : "missed_voice_call",
      senderId: userId,
      workspaceId,
      ...(convoName && { target: { name: convoName } }),
      meta: {
        conversationId: currentConvoId,
        callId,
      },
    })),
  });
}
