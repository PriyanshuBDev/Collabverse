import { chatListLastMsg, chatListProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const convoListSchema = z.object({
  cursorId: z.uuid().optional(),
  search: z.string().trim().min(2).optional(),
});
type props = {
  status: $Enums.ConvMemberStatus | null;
  joinedAt: Date;
  clearedAt: Date | null;
  conversation: {
    type: $Enums.ChatListType;
    name: string | null;
    id: string;
    avatar: string | null;
    conversationMember: {
      workspaceMember: {
        user: {
          name: string | null;
          id: string;
          avatar: string | null;
          username: string | null;
        };
      };
    }[];
    lastActivityAt: Date;
    lastMessageId: string | null;
    _count: {
      messages: number;
    };
  };
  mutedFor: $Enums.MuteEnum | null;
  pinIndex: number | null;
  mutedAt: Date | null;
};
type lastMsgProp = {
  id: string;
  type: $Enums.MessageType;
  createdAt: Date;
  _count: {
    receipt: number;
  };
  isDeleted: boolean;
  sentAt: Date;
  editedAt: Date | null;
  content: string | null;
  callSession: {
    status: $Enums.CallStatus;
  } | null;
  sentBy: {
    user: {
      name: string | null;
      id: string;
    };
  } | null;
  media: {
    originalName: string;
    duration: number | null;
  }[];
  receipt: {
    userId: string;
    seenAt: Date | null;
  }[];
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    try {
      const { cursorId, search } = convoListSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const select = {
        pinIndex: true,
        status: true,
        mutedAt: true,
        mutedFor: true,
        joinedAt: true,
        clearedAt: true,
        conversation: {
          select: {
            type: true,
            name: true,
            id: true,
            avatar: true,
            lastActivityAt: true,
            lastMessageId: true,
            _count: {
              select: {
                messages: {
                  where: {
                    senderId: {
                      not: user.id,
                    },
                    receipt: {
                      none: {
                        userId: user.id,
                      },
                    },
                  },
                },
              },
            },
            conversationMember: {
              where: {
                userId: {
                  not: user.id,
                },
              },
              take: 1,
              select: {
                workspaceMember: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatar: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };
      let convos: props[] = [];
      let nextCursor: string | null = null;
      let hasMore: boolean = false;
      if (!search) {
        const [pinned, recentRows] = await Promise.all([
          cursorId
            ? Promise.resolve([])
            : prisma.conversationMember.findMany({
                where: {
                  workspaceId,
                  userId: user.id,
                  deletedAt: null,
                  leftAt: null,
                  kickedAt: null,
                  pinIndex: {
                    not: null,
                  },
                },
                orderBy: { pinIndex: "asc" },
                select,
              }),
          prisma.conversationMember.findMany({
            where: {
              workspaceId,
              userId: user.id,
              deletedAt: null,
              leftAt: null,
              kickedAt: null,
              pinIndex: null,
            },
            orderBy: [
              {
                conversation: {
                  lastActivityAt: "desc",
                },
              },
              { conversationId: "asc" },
            ],
            take: PAGE_SIZE + 1,
            cursor: cursorId
              ? {
                  userId_conversationId: {
                    userId: user.id,
                    conversationId: cursorId,
                  },
                }
              : undefined,
            skip: cursorId ? 1 : 0,
            select,
          }),
        ]);

        hasMore = recentRows.length > PAGE_SIZE;
        if (hasMore) {
          const next = recentRows.pop()!;
          nextCursor = next.conversation.id;
        }
        convos = [...pinned, ...recentRows];
      } else {
        convos = await prisma.conversationMember.findMany({
          where: {
            workspaceId,
            userId: user.id,
            leftAt: null,
            deletedAt: null,
            kickedAt: null,
            conversation: {
              OR: [
                {
                  name: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
                {
                  conversationMember: {
                    some: {
                      userId: {
                        not: user.id,
                      },
                      workspaceMember: {
                        user: {
                          name: {
                            contains: search,
                            mode: "insensitive",
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
          orderBy: [
            {
              pinIndex: "asc",
            },
            {
              conversation: {
                lastActivityAt: "desc",
              },
            },
          ],
          take: PAGE_SIZE + 1,
          cursor: cursorId
            ? {
                userId_conversationId: {
                  userId: user.id,
                  conversationId: cursorId,
                },
              }
            : undefined,
          skip: cursorId ? 1 : 0,
          select,
        });
        hasMore = convos.length > PAGE_SIZE;
        if (hasMore) {
          const next = convos.pop()!;
          nextCursor = next.conversation.id;
        }
      }
      const lastMsgs = await prisma.message.findMany({
        where: {
          id: {
            in: convos
              .filter((c: props) => c.conversation.lastMessageId !== null)
              .map((c: props) => c.conversation.lastMessageId!),
          },
          isDeleted: false,
          deletedFor: {
            none: {
              userId: user.id,
            },
          },
        },
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
          editedAt: true,
          isDeleted: true,
          receipt: {
            take: 1,
            select: {
              seenAt: true,
              userId: true,
            },
          },
          callSession: {
            select: {
              status: true,
            },
          },
          media: {
            take: 1,
            select: {
              originalName: true,
              duration: true,
            },
          },
          sentAt: true,
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
      const lastMsgMap = new Map(
        lastMsgs.map((msg: lastMsgProp) => [msg.id, msg]),
      );
      const conversations: chatListProps[] = convos.map((c: props) => {
        const isGroup = c.conversation.type === "Group";
        const otherUser =
          c.conversation.conversationMember[0]?.workspaceMember.user;
        const msg = lastMsgMap.get(c.conversation.lastMessageId ?? "");
        const shouldShow =
          msg &&
          (c.clearedAt == null ||
            new Date(msg.sentAt).getTime() > new Date(c.clearedAt).getTime()) &&
          new Date(msg.sentAt).getTime() > new Date(c.joinedAt).getTime();
        const lastMessage: chatListLastMsg | undefined = shouldShow
          ? {
              ...msg,
              callStatus: msg.callSession?.status,
              message: msg.content ?? undefined,
              name: msg.media[0]?.originalName,
              duration: msg.media[0]?.duration ?? undefined,
              isRead: !!msg.receipt.at(0)?.seenAt,
              isReadByMe: msg._count.receipt > 0,
              isDeletedForUser: false,
              messagedBy: {
                id: msg.sentBy?.user.id,
                name: msg.sentBy?.user.name ?? "Former Member",
              },
            }
          : undefined;
        return {
          id: c.conversation.id,
          name: isGroup
            ? (c.conversation.name ?? "Unknown")
            : (otherUser?.name ?? "Former Member"),
          avatar: isGroup
            ? (c.conversation.avatar ?? undefined)
            : (otherUser?.avatar ?? undefined),

          membership: c.status ?? undefined,
          pinIdx: c.pinIndex ?? undefined,
          type: c.conversation.type,
          mute: c.mutedAt ? (c.mutedFor ?? undefined) : undefined,
          mutedAt: c.mutedAt ?? undefined,
          lastActivityAt: c.conversation.lastActivityAt,
          lastMessage,
          unread: shouldShow ? c.conversation._count.messages : 0,
        };
      });
      return Response.json({
        conversations,
        nextCursor,
        hasMore,
      });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
