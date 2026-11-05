import { withAuth } from "@/lib/api/auth/withAuth";
import { convoForwardProps } from "@/lib/axios/workspace/conversation/forward/getConversationsForward";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
const convoForwardSchema = z.object({
  search: z.string().trim().min(2).optional(),
  cursor: z.uuid().optional(),
});
type props = {
  conversation: {
    type: $Enums.ChatListType;
    id: string;
    name: string | null;
    avatar: string | null;
    conversationMember: {
      workspaceMember: {
        user: {
          id: string;
          name: string | null;
          avatar: string | null;
          username: string | null;
        };
      };
    }[];
  };
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
    const { searchParams } = new URL(req.url);
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const queryObj = Object.fromEntries(searchParams.entries());
    const PAGE_SIZE = 20;
    try {
      const { search, cursor } = convoForwardSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) return apiErrorCustom("You are not authorised");
      const select = {
        conversation: {
          select: {
            type: true,
            name: true,
            id: true,
            avatar: true,
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
          cursor
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
                  conversation: {
                    id: {
                      not: conversationId,
                    },
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
              conversation: {
                id: {
                  not: conversationId,
                },
              },
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
            cursor: cursor
              ? {
                  userId_conversationId: {
                    userId: user.id,
                    conversationId: cursor,
                  },
                }
              : undefined,
            skip: cursor ? 1 : 0,
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
              id: {
                not: conversationId,
              },
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
          cursor: cursor
            ? {
                userId_conversationId: {
                  userId: user.id,
                  conversationId: cursor,
                },
              }
            : undefined,
          skip: cursor ? 1 : 0,
          select,
        });
        hasMore = convos.length > PAGE_SIZE;
        if (hasMore) {
          const next = convos.pop()!;
          nextCursor = next.conversation.id;
        }
      }
      const allConversations: convoForwardProps[] = convos.map((c: props) => {
        const isGroup = c.conversation.type === "Group";
        const user = c.conversation.conversationMember[0]?.workspaceMember.user;
        return {
          convoId: c.conversation.id,
          name: isGroup
            ? (c.conversation.name ?? "Unknown")
            : (user?.name ?? "Former Member"),
          avatar: isGroup
            ? (c.conversation.avatar ?? undefined)
            : (user?.avatar ?? undefined),
          username: isGroup ? undefined : (user?.username ?? undefined),
        };
      });
      return Response.json({
        conversations: allConversations,
        nextCursor,
        hasMore,
      });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
