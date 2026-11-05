import {
  chatPinProps,
  commentReactionProps,
  ReplyPreview,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createReplyTo } from "@/lib/functions/chat/createReplyTo";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  _count: {
    receipt: number;
  };
  id: string;
  type: $Enums.MessageType;
  createdAt: Date;
  senderId: string | null;
  isDeleted: boolean;
  sentAt: Date;
  replyToMessageId: string | null;
  content: string | null;
  isForwarded: boolean;
  replyPreview: JsonValue;
  sentBy: {
    user: {
      name: string | null;
      id: string;
      avatar: string | null;
    };
  } | null;
  deletedFor: {
    userId: string;
  }[];
  media: {
    id: string;
    type: string;
    order: number;
    path: string;
    format: string;
    originalName: string;
    size: number;
    duration: number | null;
  }[];
  pin: {
    id: string;
    pinnedById: string;
    pinnedAt: Date;
  } | null;
  reactions: {
    userId: string;
    reaction: string;
  }[];
  receipt: {
    userId: string;
    seenAt: Date | null;
  }[];
};
type pinnedByProp = {
  user: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
};
type mediaProp = {
  id: string;
  type: string;
  order: number;
  path: string;
  format: string;
  originalName: string;
  size: number;
  duration: number | null;
};
export const GET = withAuth(
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
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) return apiErrorCustom("You are not authorised");

      const res = await prisma.message.findMany({
        where: {
          conversationId,
          pin: {
            isNot: null,
          },
        },
        orderBy: {
          sentAt: "asc",
        },
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          isDeleted: true,
          isForwarded: true,
          senderId: true,
          sentAt: true,
          receipt: {
            take: 1,
            select: {
              seenAt: true,
              userId: true,
            },
          },

          deletedFor: {
            where: {
              userId: user.id,
            },
            select: {
              userId: true,
            },
          },
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
          reactions: {
            select: {
              reaction: true,
              userId: true,
            },
          },
          replyPreview: true,
          replyToMessageId: true,
          media: {
            take: 50,
            orderBy: {
              order: "asc",
            },
            select: {
              originalName: true,
              format: true,
              type: true,
              id: true,
              size: true,
              duration: true,
              path: true,
              order: true,
            },
          },
          pin: {
            select: {
              id: true,
              pinnedAt: true,
              pinnedById: true,
            },
          },
          _count: {
            select: {
              receipt: {
                where: {
                  userId: user.id,
                },
              },
            },
          },
        },
      });
      const pinnedByIds = [
        ...new Set(res.map((r: resProp) => r.pin!.pinnedById)),
      ];
      const pinnedByUsers = await prisma.workspaceMember.findMany({
        where: {
          userId: {
            in: pinnedByIds,
          },
          workspaceId,
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      const pinnedByMap = new Map(
        pinnedByUsers.map((p: pinnedByProp) => [p.user.id, p.user]),
      );
      const pins: chatPinProps[] = res.map((r: resProp) => {
        const reactions = Object.values(
          r.reactions.reduce<Record<string, commentReactionProps>>(
            (acc, cur) => {
              if (!acc[cur.reaction]) {
                acc[cur.reaction] = {
                  emoji: cur.reaction,
                  reactedBy: [],
                };
              }
              acc[cur.reaction].reactedBy.push(cur.userId);
              return acc;
            },
            {},
          ),
        );
        const replyPreview = r.replyPreview as ReplyPreview | null;
        const pinnedByUser = pinnedByMap.get(r.pin!.pinnedById);
        const pinnedBy = {
          id: pinnedByUser?.id,
          name: pinnedByUser?.name ?? "Former Member",
          avatar: pinnedByUser?.avatar ?? undefined,
        };
        return {
          ...r,
          message: r.content ?? undefined,
          seenAt: r.receipt.at(0)?.seenAt,
          isDeletedForUser: r.deletedFor.length > 0,
          user: {
            id: r.sentBy?.user.id,
            name: r.sentBy?.user.name ?? "Former Member",
            avatar: r.sentBy?.user.avatar ?? undefined,
          },
          isRead: !!r.receipt.at(0)?.seenAt,
          reactions,
          sentAt: r.sentAt,
          replyToMsgId: r.replyToMessageId ?? undefined,
          replyTo: replyPreview ? createReplyTo(replyPreview) : undefined,
          isReadByMe: r._count.receipt > 0,
          media: r.media.map((m: mediaProp) => ({
            ...m,
            duration: m.duration ?? undefined,
            name: m.originalName,
            bytes: m.size,
          })),
          pinnedAt: r.pin!.pinnedAt,
          pinnedBy,
          isDeleted: r.isDeleted,
        };
      });
      return Response.json({ pins });
    } catch (e: unknown) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
