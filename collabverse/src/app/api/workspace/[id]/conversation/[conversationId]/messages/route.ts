import {
  commentReactionProps,
  CompleteChatProps,
  ReplyPreview,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createReplyTo } from "@/lib/functions/chat/createReplyTo";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, Prisma } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type rawMsgProps = {
  type: $Enums.MessageType;
  id: string;
  createdAt: Date;
  sentAt: Date;
  senderId: string | null;
  content: string | null;
  isForwarded: boolean;
  isDeleted: boolean;
  sentBy: {
    user: {
      name: string | null;
      id: string;
      avatar: string | null;
    };
  } | null;
  reactions: {
    userId: string;
    reaction: string;
  }[];
  media: {
    type: string;
    format: string;
    id: string;
    originalName: string;
    path: string;
    size: number;
    duration: number | null;
    order: number;
  }[];
  replyToMessageId: string | null;
  replyPreview: JsonValue;
  receipt: {
    userId: string;
    seenAt: Date | null;
  }[];
  pin: {
    pinnedAt: Date;
  } | null;
  deletedFor: { userId: string }[];
  _count: {
    receipt: number;
  };
  callSession: {
    id: string;
    type: $Enums.CallType;
    status: $Enums.CallStatus;
    startedAt: Date | null;
    endedAt: Date | null;
  } | null;
};
export const getMessagesSchema = z.object({
  mode: z.enum(["latest", "before", "after", "around"]),
  cursor: z.uuid().optional(),
});
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{ id: string; conversationId: string }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const limit = 50;
    try {
      const { cursor, mode } = getMessagesSchema.parse(queryObj);
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
          joinedAt: true,
        },
      });

      if (!membership) return apiErrorCustom("You are not authorised");

      const select = {
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
            pinnedAt: true,
          },
        },
        _count: {
          select: {
            receipt: {
              where: {
                userId: user.id,
                seenAt: { not: null },
              },
            },
          },
        },
        callSession: {
          select: {
            status: true,
            id: true,
            startedAt: true,
            endedAt: true,
            type: true,
          },
        },
      };
      const cutoff = new Date(
        Math.max(
          membership.clearedAt?.getTime() ?? 0,
          membership.joinedAt.getTime(),
        ),
      );
      const where: Prisma.MessageWhereInput = {
        conversationId,
        workspaceId,
        sentAt: {
          gte: cutoff,
        },
        isDeleted: false,
        deletedFor: {
          none: {
            userId: user.id,
          },
        },
      };

      let rawMsgs: rawMsgProps[] = [];
      let topCursor: string | null = null;
      let bottomCursor: string | null = null;
      let hasOlder: boolean = false;
      let hasNewer: boolean = false;
      const handleAround = async (id: string | undefined) => {
        const res = await prisma.message.findFirst({
          where: {
            ...where,
            id,
          },
          select,
        });
        if (!res) return apiErrorCustom("Something went wrong");
        const topOfRes = await prisma.message.findMany({
          where: {
            conversationId,
            workspaceId,

            sentAt: {
              lte: res.sentAt,
              gte: cutoff,
            },

            isDeleted: false,
            deletedFor: {
              none: {
                userId: user.id,
              },
            },
          },
          take: limit / 2 + 1,
          orderBy: [
            {
              sentAt: "desc",
            },
            { id: "desc" },
          ],
          select,
        });

        const bottomOfRes = await prisma.message.findMany({
          where: {
            conversationId,
            workspaceId,
            AND: [
              {
                sentAt: {
                  gte: res.sentAt,
                },
              },
              ...(membership.clearedAt
                ? [
                    {
                      sentAt: {
                        gte: cutoff,
                      },
                    },
                  ]
                : []),
            ],
            isDeleted: false,
            deletedFor: {
              none: {
                userId: user.id,
              },
            },
          },
          take: limit / 2 + 1,
          orderBy: [
            {
              sentAt: "asc",
            },
            { id: "asc" },
          ],
          select,
        });
        const topMessages = topOfRes
          .reverse()
          .filter((message: rawMsgProps) => message.id !== res.id)
          .slice(-limit / 2);

        const bottomMessages = bottomOfRes
          .filter((message: rawMsgProps) => message.id !== res.id)
          .slice(0, limit / 2);

        rawMsgs = [...topMessages, res, ...bottomMessages];
        if (topOfRes.length > limit / 2) {
          const nextItem = topOfRes.pop();
          topCursor = nextItem!.id;
          hasOlder = true;
        }
        if (bottomOfRes.length > limit / 2) {
          const nextItem = bottomOfRes.pop();
          bottomCursor = nextItem!.id;
          hasNewer = true;
        }
      };
      if (mode === "latest") {
        const unRead = await prisma.message.count({
          where: {
            conversationId,
            workspaceId,
            sentAt: {
              gte: cutoff,
            },
            isDeleted: false,
            deletedFor: {
              none: {
                userId: user.id,
              },
            },
            senderId: {
              not: user.id,
            },
            receipt: {
              none: {
                userId: user.id,
              },
            },
          },
        });

        if (unRead === 0 || !membership.lastReadMessageId) {
          const messages = await prisma.message.findMany({
            where,
            orderBy: [
              {
                sentAt: "desc",
              },
              { id: "desc" },
            ],
            take: limit + 1,
            select,
          });
          const returned = messages.slice(0, limit);

          rawMsgs = returned.reverse();

          if (messages.length > limit) {
            topCursor = returned[returned.length - 1].id;
            hasOlder = true;
          }
        } else {
          await handleAround(membership.lastReadMessageId);
        }
      } else if (mode === "around" && cursor) {
        await handleAround(cursor);
      } else if (mode === "after") {
        const res = await prisma.message.findMany({
          where,
          take: limit + 1,
          skip: cursor ? 1 : 0,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            {
              sentAt: "asc",
            },
            { id: "asc" },
          ],
          select,
        });
        rawMsgs = res.slice(0, limit);
        if (res.length > limit) {
          const nextItem = res.pop();
          bottomCursor = nextItem!.id;
          hasNewer = true;
        }
      } else {
        const res = await prisma.message.findMany({
          where,
          take: limit + 1,
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: [{ sentAt: "desc" }, { id: "desc" }],
          select,
        });

        const page = res.slice(0, limit);
        hasOlder = res.length > limit;

        // page is descending here, so its last item is the oldest returned message.
        topCursor = hasOlder ? (page[page.length - 1]?.id ?? null) : null;
        rawMsgs = page.reverse();
      }
      const messages = messageBuilder(rawMsgs, user.id);
      return Response.json({
        messages,
        topCursor,
        bottomCursor,
        hasNewer,
        hasOlder,
      });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
type mediaProp = {
  type: string;
  format: string;
  id: string;
  originalName: string;
  path: string;
  size: number;
  duration: number | null;
  order: number;
};
function messageBuilder(
  raw: rawMsgProps[],
  userId: string,
): CompleteChatProps[] {
  const messages: CompleteChatProps[] = raw.map((r: rawMsgProps) => {
    const reactions = Object.values(
      r.reactions.reduce<Record<string, commentReactionProps>>((acc, cur) => {
        if (!acc[cur.reaction]) {
          acc[cur.reaction] = {
            emoji: cur.reaction,
            reactedBy: [],
          };
        }
        acc[cur.reaction].reactedBy.push(cur.userId);
        return acc;
      }, {}),
    );
    const replyPreview = r.replyPreview as ReplyPreview | null;
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
      isReadByMe: r.senderId === userId ? true : r._count.receipt > 0,
      media: r.media
        .sort((a: mediaProp, b: mediaProp) => a.order - b.order)
        .map((m: mediaProp) => ({
          ...m,
          duration: m.duration ?? undefined,
          name: m.originalName,
          bytes: m.size,
        })),
      isPinned: !!r.pin?.pinnedAt,
      call: r.callSession
        ? {
            id: r.callSession.id,
            status: r.callSession.status,
            startedAt: r.callSession.startedAt,
            endedAt: r.callSession.endedAt,
            type: r.callSession.type,
          }
        : undefined,
    };
  });
  return messages;
}
