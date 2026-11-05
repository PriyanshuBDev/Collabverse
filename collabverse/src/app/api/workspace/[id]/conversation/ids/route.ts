import { allConversationResProps, memberProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  status: $Enums.ConvMemberStatus | null;
  conversation: {
    type: $Enums.ChatListType;
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
    id: string;
  };
};
type workspaceMemberProp = {
  workspaceMember: {
    user: {
      name: string | null;
      id: string;
      avatar: string | null;
      username: string | null;
    };
  };
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.conversationMember.findMany({
        where: {
          workspaceId,
          userId: user.id,
          leftAt: null,
          deletedAt: null,
          kickedAt: null,
        },
        select: {
          status: true,
          conversation: {
            select: {
              id: true,
              type: true,
              conversationMember: {
                where: {
                  workspaceId,
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
      const data: allConversationResProps[] = res.map((r: resProp) => {
        const users: memberProps[] = r.conversation.conversationMember.map(
          (m: workspaceMemberProp) => ({
            id: m.workspaceMember.user.id,
            name: m.workspaceMember.user.name ?? "Former Member",
            avatar: m.workspaceMember.user.avatar ?? undefined,
            username: m.workspaceMember.user.username ?? "unknown",
          }),
        );
        if (r.conversation.type === "Dm") {
          return {
            id: r.conversation.id,
            users,
            convo: {
              type: r.conversation.type,
            },
          };
        } else {
          return {
            id: r.conversation.id,
            users,
            convo: {
              type: r.conversation.type,
              status: r.status ?? "Active",
            },
          };
        }
      });
      return Response.json({ data });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
