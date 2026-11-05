import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type messageIdProp = {
  id: string;
};
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string; messageId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const messageId = params.messageId;

    if (!workspaceId || !conversationId || !messageId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) return apiErrorCustom("You are not authorised");
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) return apiErrorCustom("You are not authorised");
      const msg = await prisma.message.findFirst({
        where: {
          id: messageId,
          conversationId,
          workspaceId,
        },
        select: {
          id: true,
        },
      });
      if (!msg) {
        return apiErrorCustom("Message not found");
      }
      await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          const member = await tx.conversationMember.findUnique({
            where: {
              userId_conversationId: {
                userId: user.id,
                conversationId,
              },
            },
            select: {
              lastReadMessageId: true,
            },
          });

          if (!member) {
            throw new Error("Conversation membership not found");
          }

          const [throughMessage, previousMessage] = await Promise.all([
            tx.message.findFirst({
              where: {
                id: messageId,
                conversationId,
                workspaceId,
              },
              select: { id: true, sentAt: true },
            }),
            member.lastReadMessageId
              ? tx.message.findFirst({
                  where: {
                    id: member.lastReadMessageId,
                    conversationId,
                    workspaceId,
                  },
                  select: { id: true, sentAt: true },
                })
              : Promise.resolve(null),
          ]);

          if (!throughMessage) {
            throw new Error("Message not found");
          }

          // Include messages after the previous read cursor and up to the
          // requested message. id breaks ties when sentAt is equal.
          const rangeConditions = [
            ...(previousMessage
              ? [
                  {
                    OR: [
                      { sentAt: { gt: previousMessage.sentAt } },
                      {
                        sentAt: previousMessage.sentAt,
                        id: { gt: previousMessage.id },
                      },
                    ],
                  },
                ]
              : []),
            {
              OR: [
                { sentAt: { lt: throughMessage.sentAt } },
                {
                  sentAt: throughMessage.sentAt,
                  id: { lte: throughMessage.id },
                },
              ],
            },
          ];

          const messages = await tx.message.findMany({
            where: {
              conversationId,
              workspaceId,
              AND: rangeConditions,
            },
            orderBy: [{ sentAt: "asc" }, { id: "asc" }],
            select: { id: true },
          });

          const now = new Date();

          const messageIds = messages.map(
            (message: messageIdProp) => message.id,
          );

          // Insert missing receipts in chunks to avoid oversized database queries.
          for (let i = 0; i < messageIds.length; i += 500) {
            const chunk = messageIds.slice(i, i + 500);

            await tx.messageReceipt.createMany({
              data: chunk.map((id: string) => ({
                messageId: id,
                userId: user.id,
                conversationId,
                deliveredAt: now,
                seenAt: now,
              })),
              skipDuplicates: true,
            });

            // Also set seenAt for receipts that already existed.
            await tx.messageReceipt.updateMany({
              where: {
                userId: user.id,
                conversationId,
                messageId: { in: chunk },
              },
              data: { seenAt: now },
            });

            await tx.messageMention.updateMany({
              where: {
                mentionedUserId: user.id,
                conversationId,
                messageId: { in: chunk },
                seen: false,
              },
              data: { seen: true },
            });
          }

          await tx.conversationMember.update({
            where: {
              userId_conversationId: {
                userId: user.id,
                conversationId,
              },
            },
            data: {
              lastReadMessageId: messageId,
            },
          });
        },
        {
          maxWait: 10_000,
          timeout: 20_000,
        },
      );
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
