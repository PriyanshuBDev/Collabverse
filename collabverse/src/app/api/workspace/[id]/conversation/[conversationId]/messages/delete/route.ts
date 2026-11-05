import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
type messageIdProp = {
  msgId: string;
};
type senderAndIdProp = {
  id: string;
  senderId: string | null;
};
export const msgsDeleteSchema = z.object({
  msgs: z
    .array(
      z.object({
        msgId: z.uuid(),
      }),
    )
    .max(10)
    .min(1),
  others: z.boolean(),
});
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
    const data = await req.json();
    try {
      const { msgs, others } = msgsDeleteSchema.parse(data);
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
      const msgIds = [...new Set(msgs.map((m: messageIdProp) => m.msgId))];
      const messages = await prisma.message.findMany({
        where: {
          id: {
            in: msgIds,
          },
          conversationId,
          isDeleted: false,
          deletedFor: {
            none: {
              userId: user.id,
            },
          },
          workspaceId,
        },
        select: {
          senderId: true,
          id: true,
        },
      });
      const validIds = messages.map((m: senderAndIdProp) => m.id);
      if (validIds.length === 0) {
        return Response.json({ success: true });
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        if (others) {
          const otherUsersMsg = messages.find(
            (m: senderAndIdProp) => m.senderId !== user.id,
          );
          if (!!otherUsersMsg) {
            return apiError(
              "You can only delete your messages for others",
              409,
            );
          }
          await tx.message.updateMany({
            where: {
              id: {
                in: validIds,
              },
            },
            data: {
              isDeleted: true,
            },
          });
          await tx.messagePin.deleteMany({
            where: {
              messageId: {
                in: validIds,
              },
            },
          });
        } else {
          await tx.messageDeletion.createMany({
            data: validIds.map((messageId: string) => ({
              messageId,
              userId: user.id,
              conversationId,
            })),
            skipDuplicates: true,
          });
          await tx.messagePin.updateMany({
            where: {
              messageId: {
                in: validIds,
              },
            },
            data: {
              deletedFor: {
                push: user.id,
              },
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
