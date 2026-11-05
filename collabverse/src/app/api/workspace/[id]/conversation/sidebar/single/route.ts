import { chatListLastMsg, chatListProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const convoSidebarSchema = z.object({
  conversationId: z.uuid().optional(),
});
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    try {
      const { conversationId } = convoSidebarSchema.parse(queryObj);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }

      const res = await prisma.conversationMember.findFirst({
        where: {
          conversationId,
          workspaceId,
          userId: user.id,
          leftAt: null,
          deletedAt: null,
          kickedAt: null,
        },

        select: {
          pinIndex: true,
          status: true,
          mutedAt: true,
          mutedFor: true,
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
        },
      });
      if (!res) {
        return apiErrorCustom("Conversation not found");
      }
      const lastMsgId = res.conversation.lastMessageId;
      const msg = lastMsgId
        ? await prisma.message.findFirst({
            where: {
              id: lastMsgId,
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
          })
        : undefined;
      const isGroup = res.conversation.type === "Group";
      const otherUser =
        res.conversation.conversationMember[0]?.workspaceMember.user;
      const lastMessage: chatListLastMsg | undefined = msg
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
      const conversation: chatListProps = {
        id: res.conversation.id,
        name: isGroup
          ? (res.conversation.name ?? "Unknown")
          : (otherUser?.name ?? "Former Member"),
        avatar: isGroup
          ? (res.conversation.avatar ?? undefined)
          : (otherUser?.avatar ?? undefined),
        membership: res.status ?? undefined,
        pinIdx: res.pinIndex ?? undefined,
        type: res.conversation.type,
        mute: res.mutedAt ? (res.mutedFor ?? undefined) : undefined,
        mutedAt: res.mutedAt ?? undefined,
        lastActivityAt: res.conversation.lastActivityAt,
        lastMessage,
        unread: res.conversation._count.messages,
      };
      return Response.json({
        conversation,
      });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
