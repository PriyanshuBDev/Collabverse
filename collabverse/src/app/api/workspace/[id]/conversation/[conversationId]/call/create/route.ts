import { CompleteChatProps, prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { reviveOtherUser } from "@/lib/serviceLayer/conversation/reviveOtherUser";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { CallType } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const createCallSessionSchema = z.object({
  type: z.enum(CallType),
});
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

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { type } = createCallSessionSchema.parse(body);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }

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
          conversation: {
            select: {
              type: true,
            },
          },
        },
      });
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      if (membership.conversation.type === "Group") {
        return apiErrorCustom("You can not call in a group");
      }
      await reviveOtherUser({ conversationId, currentUserId: user.id });
      const { call, msg } = await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          const call = await tx.callSession.create({
            data: {
              conversationId,
              workspaceId,
              type,
              startedById: user.id,
              maxParticipants: 2,
              status: "Calling",
              participants: {
                create: {
                  userId: user.id,
                  workspaceId,
                },
              },
            },
          });
          const msg = await tx.message.create({
            data: {
              conversationId,
              workspaceId,
              senderId: user.id,
              type: "call",
              createdAt: new Date(),
              callSessionId: call.id,
            },
            select: {
              id: true,
              type: true,
              createdAt: true,
              sentAt: true,
              sentBy: {
                select: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatar: true,
                    },
                  },
                },
              },
            },
          });
          await tx.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              lastActivityAt: new Date(),
              lastMessageId: msg.id,
            },
          });
          return { call, msg };
        },
      );
      const msgToReturn: CompleteChatProps = {
        id: msg.id,
        type: msg.type,
        user: {
          id: msg.sentBy?.user.id,
          name: msg.sentBy?.user.name ?? "Former Member",
          avatar: msg.sentBy?.user.avatar ?? undefined,
        },
        isRead: false,
        sentAt: msg.sentAt,
        createdAt: msg.createdAt,
        isDeleted: false,
        reactions: [],
        media: [],
        isReadByMe: true,
        isPinned: false,
        isDeletedForUser: false,
        isForwarded: false,
        call,
      };
      return Response.json({ callId: call.id, msg: msgToReturn });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
