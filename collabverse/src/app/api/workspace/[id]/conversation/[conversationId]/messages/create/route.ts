import {
  CompleteChatProps,
  prismaTransactionProp,
  ReplyPreview,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createReplyTo } from "@/lib/functions/chat/createReplyTo";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { newMsgNotificationService } from "@/lib/serviceLayer/conversation/newMsgNotificationService";
import { reviveBothDmUser } from "@/lib/serviceLayer/conversation/reviveBothDmUser";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, MessageType } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const createMsgSchema = z.object({
  msg: z.object({
    clientId: z.uuid(),
    type: z.enum(MessageType),
    replyToMessageId: z.uuid().nullable(),
    content: z.string().nullable(),
    mentions: z.array(z.string()),
    createdAt: z.coerce.date(),
    files: z.array(
      z.object({
        url: z.string().optional(),
        fileName: z.string(),
        path: z.string(),
        format: z.string(),
        type: z.string(),
        originalName: z.string(),
        size: z.number(),
        duration: z.number().nullable(),
      }),
    ),
  }),
});
type mediaProp = {
  fileName: string;
  path: string;
  format: string;
  type: string;
  originalName: string;
  size: number;
  duration: number | null;
  url?: string | undefined;
};
type replyMsg = {
  type: $Enums.MessageType;
  content: string | null;
  id: string;
  conversationId: string;
  isDeleted: boolean;
  sentBy: {
    user: {
      id: string;
      name: string | null;
    };
  } | null;
  deletedFor: {
    userId: string;
  }[];
  media: {
    originalName: string;
    duration: number | null;
  }[];
  callSession: {
    status: $Enums.CallStatus;
    startedAt: Date | null;
    endedAt: Date | null;
  } | null;
};
type filesDataProps = {
  type: string;
  format: string;
  fileName: string;
  path: string;
  originalName: string;
  size: number;
  duration: number | null;
  id: string;
  order: number;
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
      const { msg } = createMsgSchema.parse(data);
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
          conversation: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      });

      if (!membership) return apiErrorCustom("You are not authorised");
      if (membership.conversation.type === "Dm") {
        await reviveBothDmUser({ conversationId, workspaceId });
      }
      let reply: replyMsg | null;
      if (msg.replyToMessageId) {
        reply = await prisma.message.findUnique({
          where: {
            id: msg.replyToMessageId,
          },
          select: {
            conversationId: true,
            sentBy: {
              select: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
            id: true,
            content: true,
            type: true,
            isDeleted: true,
            deletedFor: {
              select: {
                userId: true,
              },
            },
            media: {
              take: 1,
              select: {
                originalName: true,
                duration: true,
              },
            },
            callSession: {
              select: {
                status: true,
                startedAt: true,
                endedAt: true,
              },
            },
          },
        });
        if (!reply || reply.conversationId !== conversationId) {
          return apiErrorCustom("Invalid data");
        }
      }
      if (msg.mentions.length > 0) {
        const mentions = await prisma.conversationMember.findMany({
          where: {
            conversationId,
            userId: {
              in: msg.mentions,
              not: user.id,
            },
          },
          select: {
            userId: true,
          },
        });
        if (mentions.length !== msg.mentions.length) {
          return apiErrorCustom("Invalid data");
        }
      }
      const mentions = [
        ...new Set(msg.mentions.filter((m: string) => m !== user.id)),
      ];
      const { msgData, files } = await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          const msgData = await tx.message.create({
            data: {
              id: msg.clientId,
              conversationId,
              workspaceId,
              senderId: user.id,
              type: msg.type,
              createdAt: msg.createdAt,
              replyToMessageId: msg.replyToMessageId,
              content: msg.content,
              replyPreview: reply ? createReplyPreview(reply) : undefined,
            },
            select: {
              id: true,
              content: true,
              type: true,
              isDeleted: true,
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
              replyToMessageId: true,
              replyPreview: true,
            },
          });
          let files: filesDataProps[] = [];
          if (mentions.length > 0 && membership.conversation.type === "Group") {
            await tx.messageMention.createMany({
              data: mentions.map((m: string) => ({
                messageId: msgData!.id,
                mentionedUserId: m,
                conversationId,
              })),
            });
          }
          if (msg.files.length > 0) {
            files = await tx.messageMedia.createManyAndReturn({
              data: msg.files.map((f: mediaProp, i: number) => ({
                fileName: f.fileName,
                path: f.path,
                type: f.type,
                format: f.format,
                size: f.size,
                duration: f.duration,
                originalName: f.originalName,
                order: i,
                messageId: msgData!.id,
                conversationId,
              })),

              select: {
                id: true,
                fileName: true,
                path: true,
                format: true,
                type: true,
                originalName: true,
                size: true,
                duration: true,
                order: true,
              },
            });
          }
          await tx.conversation.update({
            where: {
              id: conversationId,
            },
            data: {
              lastActivityAt: msgData.sentAt,
              lastMessageId: msgData.id,
            },
          });
          return { msgData, files };
        },
      );
      const replyPreview = msgData.replyPreview as ReplyPreview | null;
      const msgToReturn: CompleteChatProps = {
        ...msgData,
        message: msgData.content ?? undefined,
        user: {
          id: msgData.sentBy?.user.id,
          name: msgData.sentBy?.user.name ?? "Former Member",
          avatar: msgData.sentBy?.user.avatar ?? undefined,
        },
        isRead: false,
        sentAt: msgData.sentAt,
        replyToMsgId: msgData.replyToMessageId ?? undefined,
        replyTo: replyPreview ? createReplyTo(replyPreview) : undefined,
        media: files
          .sort((a: filesDataProps, b: filesDataProps) => a.order - b.order)
          .map((f: filesDataProps) => ({
            ...f,
            duration: f.duration ?? undefined,
            name: f.originalName,
            bytes: f.size,
          })),
        reactions: [],
        isReadByMe: true,
        isPinned: false,
        isDeletedForUser: false,
        isForwarded: false,
      };
      //notifications
      try {
        await newMsgNotificationService(
          conversationId,
          workspaceId,
          user.id,
          membership.conversation.type,
          membership.conversation.name,
          mentions,
        );
      } catch (e) {
        console.error(e);
      }
      return Response.json({ msg: msgToReturn });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
function createReplyPreview(reply: replyMsg): ReplyPreview {
  const replyMedia = reply.media.at(0);
  return {
    id: reply.id,
    sender: {
      id: reply.sentBy?.user.id,
      name: reply.sentBy?.user.name ?? "Former member",
    },
    type: reply.type,
    content: reply.content ?? undefined,
    media: replyMedia
      ? {
          name: replyMedia.originalName,
          duration: replyMedia.duration ?? undefined,
        }
      : undefined,
    call: reply.callSession
      ? {
          status: reply.callSession.status,
          duration:
            reply.callSession.endedAt && reply.callSession.startedAt
              ? reply.callSession.endedAt?.getTime() -
                reply.callSession.startedAt?.getTime()
              : undefined,
        }
      : undefined,
  };
}
