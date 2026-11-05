import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { forwardMsgNotificationService } from "@/lib/serviceLayer/conversation/forwardMsgNotificationService";
import { reviveOtherUser } from "@/lib/serviceLayer/conversation/reviveOtherUser";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const forwardMsgsSchema = z.object({
  msgs: z
    .array(
      z.object({
        msgId: z.uuid(),
      }),
    )
    .max(10)
    .min(1),
  convos: z
    .array(
      z.object({
        convoId: z.uuid(),
      }),
    )
    .max(10)
    .min(1),
});
type msgIdPrps = {
  msgId: string;
};
type convoIdProp = {
  convoId: string;
};
type allConvoProp = {
  type: $Enums.ChatListType;
  id: string;
};
type msgToCreateProps = {
  id: string;
  conversationId: string;
  workspaceId: string;
  type: $Enums.MessageType;
  content: string | null;
  isForwarded: boolean;
  senderId: string;
  createdAt: Date;
};
type mediaToCreateProps = {
  messageId: string;
  fileName: string;
  path: string;
  format: string;
  type: string;
  originalName: string;
  size: number;
  duration: number | null;
  order: number;
  conversationId: string;
};
export const POST = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const data = await req.json();
    try {
      const { msgs, convos } = forwardMsgsSchema.parse(data);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) return apiErrorCustom("You are not authorised");
      const membership = await prisma.conversationMember.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId,
          },
        },
        select: {
          lastReadMessageId: true,
          clearedAt: true,
        },
      });
      if (!membership) return apiErrorCustom("You are not authorised");
      const msgIds = msgs.map((m: msgIdPrps) => m.msgId);
      const allMsgs = await prisma.message.findMany({
        where: {
          id: {
            in: msgIds,
          },
          conversationId,
          workspaceId,
          ...(membership.clearedAt !== null && {
            createdAt: {
              gte: membership.clearedAt,
            },
          }),
          isDeleted: false,
          deletedFor: {
            none: {
              userId: user.id,
            },
          },
        },
        select: {
          type: true,
          content: true,
          media: {
            take: 50, //user can't send more than 50 media at a time
            select: {
              fileName: true,
              originalName: true,
              format: true,
              type: true,
              size: true,
              duration: true,
              path: true,
              order: true,
            },
          },
        },
      });
      const convoIds = [...convos.map((c: convoIdProp) => c.convoId)];
      const allConvos = await prisma.conversation.findMany({
        where: {
          id: {
            in: convoIds,
            not: conversationId,
          },
          conversationMember: {
            some: {
              userId: user.id,
              deletedAt: null,
              leftAt: null,
              kickedAt: null,
            },
          },
        },
        select: {
          id: true,
          type: true,
        },
      });
      await Promise.all(
        allConvos.map((c: allConvoProp) => {
          if (c.type === "Dm") {
            reviveOtherUser({ conversationId: c.id, currentUserId: user.id });
          }
        }),
      );
      const allMsgsToCreate: msgToCreateProps[] = [];
      const mediaToCreate: mediaToCreateProps[] = [];
      for (const c of allConvos) {
        for (const m of allMsgs) {
          const messageId = crypto.randomUUID();
          allMsgsToCreate.push({
            id: messageId,
            conversationId: c.id,
            workspaceId,
            type: m.type,
            content: m.content,
            isForwarded: true,
            senderId: user.id,
            createdAt: new Date(),
          });
          for (const file of m.media) {
            mediaToCreate.push({
              messageId,
              fileName: file.fileName,
              path: file.path,
              format: file.format,
              type: file.type,
              originalName: file.originalName,
              size: file.size,
              duration: file.duration,
              order: file.order,
              conversationId,
            });
          }
        }
      }
      if (allMsgs.length !== msgs.length) {
        return apiError("Some messages could not be forwarded.", 403);
      }

      if (allConvos.length !== convos.length) {
        return apiError("Some conversations were not found.", 403);
      }
      const now = new Date();
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        await tx.message.createMany({
          data: allMsgsToCreate,
        });
        await tx.messageMedia.createMany({
          data: mediaToCreate,
        });
        await Promise.all(
          allConvos.map((convo: allConvoProp) => {
            const lastMessage = [...allMsgsToCreate]
              .reverse()
              .find((m: msgToCreateProps) => m.conversationId === convo.id)!;

            return tx.conversation.update({
              where: { id: convo.id },
              data: {
                lastActivityAt: now,
                lastMessageId: lastMessage.id,
              },
            });
          }),
        );
      });
      try {
        await forwardMsgNotificationService(
          allConvos.map((c: allConvoProp) => c.id),
          workspaceId,
          user.id,
          String(allMsgs.length),
        );
      } catch (e) {
        console.error(e);
      }
      return Response.json({ success: true });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
