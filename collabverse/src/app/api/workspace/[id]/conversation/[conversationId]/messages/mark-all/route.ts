import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type idProp = {
  id: string;
};
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; conversationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) return apiErrorCustom("You are not authorised");
      const membership = await prisma.conversationMember.findFirst({
        where: {
          workspaceId,
          conversationId,
          userId: user.id,
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
          joinedAt: true,
        },
      });
      if (!membership) return apiErrorCustom("You are not authorised");

      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const messageIds = (
          await tx.message.findMany({
            where: {
              conversationId,
              workspaceId,
              senderId: {
                not: user.id,
              },
              createdAt: {
                gte: membership.joinedAt,
              },
              receipt: {
                none: {
                  userId: user.id,
                  seenAt: {
                    not: null,
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
            },
          })
        ).map((m: idProp) => m.id);
        const date = new Date();
        await tx.messageReceipt.createMany({
          data: messageIds.map((id: string) => ({
            messageId: id,
            userId: user.id,
            deliveredAt: date,
            seenAt: date,
            conversationId,
          })),
        });
        await tx.messageMention.updateMany({
          where: {
            mentionedUserId: user.id,
            conversationId,
            seen: false,
          },
          data: {
            seen: true,
          },
        });
        if (messageIds.length > 0) {
          await tx.conversationMember.update({
            where: {
              userId_conversationId: {
                userId: user.id,
                conversationId,
              },
            },
            data: {
              lastReadMessageId: messageIds.at(-1),
            },
          });
        }
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
