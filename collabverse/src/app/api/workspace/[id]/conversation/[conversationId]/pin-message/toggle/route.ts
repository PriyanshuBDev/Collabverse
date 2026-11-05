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
import { Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const messagePinSchema = z.object({
  enabled: z.boolean(),
  messageId: z.uuid(),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; conversationId: string } },
  ) => {
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { enabled, messageId } = messagePinSchema.parse(body);
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
          workspaceId,
          conversationId,
        },
        select: {
          type: true,
          content: true,
          media: {
            take: 1,
            select: {
              originalName: true,
              duration: true,
            },
          },
          pin: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!msg) {
        return apiErrorCustom("Message not found");
      }
      if (enabled && msg.pin) {
        return apiError("Message already pinned", 409);
      }
      if (!enabled && !msg.pin) {
        return apiError("Message already unpinned", 409);
      }
      let pins: number = 0;
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        pins = await tx.messagePin.count({
          where: {
            conversationId,
            message: {
              isDeleted: false,
            },
          },
        });

        if (enabled) {
          if (pins >= 20) {
            throw new Error("PIN_LIMIT_REACHED");
          }
          await tx.messagePin.create({
            data: {
              pinnedAt: new Date(),
              pinnedById: user.id,
              messageId,
              conversationId,
              deletedFor: [],
              messagePreview: {
                type: msg.type,
                name: msg.media[0]?.originalName,
                duration: msg.media[0]?.duration ?? undefined,
                message: msg.content ?? undefined,
              },
            },
          });
        } else {
          await tx.messagePin.delete({
            where: {
              messageId,
              conversationId,
            },
          });
        }
      });
      return Response.json({ pinLength: enabled ? pins + 1 : pins - 1 });
    } catch (e: unknown) {
      console.error(e);
      if (e instanceof Error && e.message === "PIN_LIMIT_REACHED") {
        return apiError("Pin limit reached (20/20).", 409);
      }
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002"
      ) {
        return apiError("Message already pinned", 409);
      }

      return zodApiError(e);
    }
  },
);
