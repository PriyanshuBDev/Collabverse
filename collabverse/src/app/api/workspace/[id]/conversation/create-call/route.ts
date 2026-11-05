import { CompleteChatProps, prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createDmKey } from "@/lib/functions/conversation/createDmKey";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { reviveBothDmUser } from "@/lib/serviceLayer/conversation/reviveBothDmUser";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { CallType } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const createCallSessionSchema = z.object({
  type: z.enum(CallType),
  remoteUserId: z.uuid(),
});
export const POST = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { type, remoteUserId } = createCallSessionSchema.parse(body);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      const remoteUserWsRole = await wsRole(remoteUserId, workspaceId);
      if (!currentUserWsRole || !remoteUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      let conversationId: string;
      const dmKey = createDmKey(user.id, remoteUserId);
      const membership = await prisma.conversationMember.findFirst({
        where: {
          workspaceId,
          userId: user.id,
          kickedAt: null,
          leftAt: null,
          conversation: {
            type: "Dm",
            dmKey,
          },
        },
        select: {
          conversationId: true,
          deletedAt: true,
          conversation: {
            select: {
              type: true,
            },
          },
        },
      });
      if (membership?.conversationId) {
        conversationId = membership.conversationId;
        if (membership.deletedAt) {
          await reviveBothDmUser({ conversationId, workspaceId });
        }
      } else {
        const res = await prisma.conversation.create({
          data: {
            type: "Dm",
            workspaceId,
            conversationMember: {
              createMany: {
                data: [
                  { userId: user.id, workspaceId },
                  { userId: remoteUserId, workspaceId },
                ],
              },
            },
            createdById: user.id,
            dmKey,
          },
          select: {
            id: true,
          },
        });
        conversationId = res.id;
      }

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
      return Response.json({
        callId: call.id,
        msg: msgToReturn,
        conversationId,
      });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
