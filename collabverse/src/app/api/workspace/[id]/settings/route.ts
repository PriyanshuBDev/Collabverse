import {
  WorkspaceSettingsProps,
  wsAdminPerm,
  wsMemberPerm,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type wsRolePerm = {
  role: $Enums.WsRole;
  permissions: $Enums.WsPermission[];
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const userMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
            },
          },
          role: true,
          joinedAt: true,
        },
      });
      if (!userMembership) {
        return apiErrorCustom("You are not authorised");
      }
      const ws = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          name: true,
          id: true,
          avatar: true,
          avatarPath: true,
          description: true,
          createdAt: true,

          createdBy: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          currentOwner: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          roles: {
            select: {
              role: true,
              permissions: true,
            },
          },
          _count: {
            select: {
              projects: {
                where: {
                  currentOwnerId: user.id,
                },
              },
            },
          },
        },
      });
      if (!ws) {
        return apiErrorCustom("Workspace not found");
      }
      const membersPerm: wsMemberPerm[] =
        ws.roles
          .find((r: wsRolePerm) => r.role === "Member")
          ?.permissions.filter(
            (perm: $Enums.WsPermission): perm is wsMemberPerm =>
              perm === "Invite" || perm === "Create_Project",
          ) ?? [];
      const adminsPerm: wsAdminPerm[] =
        ws.roles.find((r: wsRolePerm) => r.role === "Admin")?.permissions ?? [];
      const workspace: WorkspaceSettingsProps = {
        ...ws,
        avatar: ws.avatar ?? undefined,
        avatarPath: ws.avatarPath ?? undefined,
        description: ws.description ?? undefined,
        creator: ws.createdBy
          ? {
              id: ws.createdBy.id,
              name: ws.createdBy.name ?? "unknown",
              avatar: ws.createdBy.avatar ?? undefined,
            }
          : {
              id: undefined,
              name: "Former member",
              avatar: "/assets/anonymous.webp",
            },
        owner: {
          id: ws.currentOwner.id,
          name: ws.currentOwner.name ?? "unknown",
          avatar: ws.currentOwner.avatar ?? undefined,
        },
        permissions: {
          admin: adminsPerm,
          member: membersPerm,
        },
        currentUser: {
          id: userMembership.user.id,
          name: userMembership.user.name ?? "unknown",
          username: userMembership.user.username ?? "",
          projectCount: ws._count.projects,
          ...userMembership,
        },
      };
      return Response.json({ workspace }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
