import {
  GroupHeaderProps,
  chatPins,
  convoDetailsProps,
  mentionProps,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { getMessagePreview } from "@/lib/functions/conversation/getMessagePreview";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type conversationMemberProp = {
  workspaceMember: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
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

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.conversationMember.findUnique({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId,
          },
        },
        select: {
          clearedAt: true,
          role: true,
          status: true,
          conversation: {
            select: {
              name: true,
              avatar: true,
              conversationMember: {
                where: {
                  NOT: {
                    userId: user.id,
                  },
                  leftAt: null,
                  deletedAt: null,
                  kickedAt: null,
                },
                select: {
                  workspaceMember: {
                    select: {
                      user: {
                        select: {
                          id: true,
                          name: true,
                          username: true,
                          avatar: true,
                        },
                      },
                    },
                  },
                },
              },
              groupPermissions: {
                select: {
                  permissions: true,
                },
              },

              messages: {
                where: {
                  isDeleted: false,
                  OR: [
                    {
                      pin: {
                        isNot: null,
                      },
                    },
                    {
                      mentions: {
                        some: {
                          mentionedUserId: user.id,
                          seen: false,
                        },
                      },
                    },
                  ],
                },
                select: {
                  id: true,
                  pin: {
                    select: {
                      id: true,
                      pinnedById: true,
                      pinnedAt: true,
                      messagePreview: true,
                      deletedFor: true,
                    },
                  },
                  content: true,
                  mentions: {
                    where: {
                      mentionedUserId: user.id,
                      seen: false,
                    },
                    select: {
                      id: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("You are not authorised");
      }
      const pins: chatPins[] = [];
      const mentions: mentionProps[] = [];
      for (const m of res.conversation.messages) {
        if (m.pin) {
          const { pin } = m;
          pins.push({
            message: getMessagePreview(pin.messagePreview),
            id: pin.id,
            messageId: m.id,
            pinnedAt: pin.pinnedAt,
            pinnedById: pin.pinnedById,
            isDeletedForUser: pin.deletedFor.includes(user.id),
          });
        }
        if (m.mentions.length > 0) {
          const mention = m.mentions[0];
          mentions.push({
            id: mention.id,
            messageId: m.id,
            userId: user.id,
            seen: false,
            date: mention.createdAt,
          });
        }
      }
      const header: GroupHeaderProps = {
        id: conversationId,
        avatar: res.conversation.avatar ?? undefined,
        permissions:
          res.conversation.groupPermissions?.permissions ?? undefined,
        members: res.conversation.conversationMember.map(
          (c: conversationMemberProp) => ({
            id: c.workspaceMember.user.id,
            name: c.workspaceMember.user.name ?? "Former Member",
            avatar: c.workspaceMember.user.avatar ?? undefined,
            username: c.workspaceMember.user.username ?? "unknown",
          }),
        ),
        currentUserStatus: res.status ?? undefined,
        name: res.conversation.name ?? "unknown",
      };
      const convo: convoDetailsProps = {
        conversationId,
        lastClearedAt: res.clearedAt ?? undefined,
        role: res.role ?? undefined,
        mentions,
        pins,
        header,
      };
      return Response.json({ conversation: convo });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
