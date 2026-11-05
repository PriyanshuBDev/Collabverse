import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import { prismaTransactionProp } from "@/app/interfaces";
import { reactionSchema } from "@/lib/functions/route/reactionSchema";

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{
        id: string;
        conversationId: string;
        messageId: string;
      }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const messageId = params.messageId;

    if (!workspaceId || !conversationId || !messageId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const { reaction } = reactionSchema.parse(data);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      const message = await prisma.message.findFirst({
        where: {
          conversationId,
          workspaceId,
          id: messageId,
          isDeleted: false,
          deletedFor: {
            none: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
        },
      });
      if (!message) {
        return apiErrorCustom("Message not found");
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const exist = await tx.messageReaction.findUnique({
          where: {
            messageId_userId: {
              messageId,
              userId: user.id,
            },
          },
          select: {
            reaction: true,
          },
        });
        if (exist) {
          if (exist.reaction === reaction) {
            await tx.messageReaction.delete({
              where: {
                messageId_userId: {
                  messageId,
                  userId: user.id,
                },
              },
            });
          } else {
            await tx.messageReaction.update({
              where: {
                messageId_userId: {
                  messageId,
                  userId: user.id,
                },
              },
              data: {
                reaction,
              },
            });
          }
        } else {
          await tx.messageReaction.create({
            data: {
              userId: user.id,
              messageId,
              reaction,
              conversationId,
            },
          });
        }
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
