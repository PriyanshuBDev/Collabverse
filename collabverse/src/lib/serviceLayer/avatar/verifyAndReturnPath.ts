import { DeletableAvatarType } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "../workspace/wsRole";

export async function verifyAndReturnPath(
  type: DeletableAvatarType,
  userId: string,
  typeId?: string,
  workspaceId?: string,
) {
  const unavailable = {
    permission: false,
    path: undefined,
  };
  switch (type) {
    case "users": {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          avatarPath: true,
        },
      });
      return {
        permission: true,
        path: user?.avatarPath ?? undefined,
      };
    }
    case "groups": {
      if (!typeId) {
        return {
          permission: false,
          path: undefined,
        };
      }
      const group = await prisma.conversationMember.findFirst({
        where: {
          userId,
          conversationId: typeId,
          workspaceId,
          leftAt: null,
          deletedAt: null,
          kickedAt: null,
          status: "Active",
        },
        select: {
          role: true,
          conversation: {
            select: {
              groupPermissions: {
                select: {
                  permissions: true,
                },
              },
              avatarPath: true,
            },
          },
        },
      });
      if (!group) {
        return {
          permission: false,
          path: undefined,
        };
      }
      const userRole = group.role;
      const groupPermissions =
        group.conversation.groupPermissions?.permissions.includes(
          "Edit_Group_Details",
        );
      if (userRole === "Admin" || groupPermissions) {
        return {
          permission: true,
          path: group.conversation.avatarPath ?? undefined,
        };
      }
      return {
        permission: false,
        path: undefined,
      };
    }
    case "projects": {
      if (!workspaceId || !typeId) {
        return unavailable;
      }
      const userWsRole = await wsRole(userId, workspaceId);
      if (!userWsRole) {
        return unavailable;
      }
      const project = await prisma.project.findFirst({
        where: {
          id: typeId,
          workspaceId,
        },
        select: {
          avatarPath: true,
          roles: {
            where: {
              role: "Manager",
            },
            select: {
              permissions: true,
            },
          },
          members: {
            where: {
              workspaceMemberUserId: userId,
            },
            select: {
              role: true,
            },
          },
        },
      });

      if (!project) {
        return unavailable;
      }
      const available = {
        permission: true,
        path: project.avatarPath ?? undefined,
      };
      const projectRole = project?.members[0]?.role;
      if (userWsRole === "Owner" || userWsRole === "Admin") {
        return available;
      } else {
        if (!projectRole) {
          return unavailable;
        } else if (
          projectRole === "Owner" ||
          (projectRole === "Manager" &&
            project.roles[0]?.permissions.includes("Edit_Project_Details"))
        ) {
          return available;
        } else {
          return unavailable;
        }
      }
    }
    case "workspaces": {
      if (!typeId) {
        return unavailable;
      }
      const workspace = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId: typeId,
          },
        },
        select: {
          role: true,
          workspace: {
            select: {
              avatarPath: true,
              roles: {
                where: {
                  role: "Admin",
                },
                select: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
      if (!workspace) {
        return unavailable;
      }
      if (
        workspace.role === "Owner" ||
        (workspace.role === "Admin" &&
          workspace.workspace.roles[0]?.permissions.includes("Edit_Ws_Details"))
      ) {
        return {
          permission: true,
          path: workspace.workspace.avatarPath ?? undefined,
        };
      } else {
        return unavailable;
      }
    }
  }
}
