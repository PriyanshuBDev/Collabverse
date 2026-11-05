import { fullUserDetails } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type prop = {
  project: {
    id: string;
    name: string;
    avatar: string | null;
    slug: string;
  };
  role: $Enums.PRole;
};
type convoProp = {
  role: $Enums.GroupRole | null;
  conversation: {
    id: string;
    name: string | null;
    avatar: string | null;
  };
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; userId: string } },
  ) => {
    const workspaceId = params.id;
    const userId = params.userId;

    if (!workspaceId || !userId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const res = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
        select: {
          user: {
            select: {
              name: true,
              id: true,
              username: true,
              avatar: true,
              lastSeenAt: true,
              appearance: {
                select: {
                  bodyId: true,
                  outfit: true,
                  accessory: true,
                  eyes: true,
                  hairstyle: true,
                },
              },
            },
          },
          lastSeenAt: true,
          coversationMember: {
            where: {
              conversation: {
                type: "Group",
                workspaceId,
              },
              deletedAt: null,
              leftAt: null,
              kickedAt: null,
            },
            select: {
              conversation: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                },
              },
              role: true,
            },
          },
          projectMemberShips: {
            where: {
              project: {
                members: {
                  some: {
                    workspaceMemberUserId: user.id,
                  },
                },
              },
            },

            select: {
              role: true,
              project: {
                select: {
                  id: true,
                  name: true,
                  avatar: true,
                  slug: true,
                },
              },
            },
          },
        },
      });
      if (!res || !res.user.appearance) {
        return apiErrorCustom("User not found");
      }
      const data: fullUserDetails = {
        id: res.user.id,
        name: res.user.name ?? "unknown",
        username: res.user.username ?? "unknown",
        avatar: res.user.avatar ?? undefined,
        lastSeenAt: res.lastSeenAt ?? undefined,
        appearance: {
          body: res.user.appearance.bodyId,
          ...res.user.appearance,
        },
        projects: res.projectMemberShips.map((p: prop) => {
          return {
            id: p.project.id,
            name: p.project.name,
            avatar: p.project.avatar ?? undefined,
            slug: p.project.slug,
            role: p.role,
          };
        }),
        groups: res.coversationMember.map((m: convoProp) => {
          return {
            id: m.conversation.id,
            name: m.conversation.name ?? "unknown",
            avatar: m.conversation.avatar ?? undefined,
            role: m.role ?? "Member",
          };
        }),
      };

      return Response.json({ data });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
