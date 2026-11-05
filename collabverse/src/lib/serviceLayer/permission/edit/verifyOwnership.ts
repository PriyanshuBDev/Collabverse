import { DeletableAvatarType } from "@/app/interfaces";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "../../workspace/wsRole";

export async function verifyOwnership(
  type: DeletableAvatarType,
  userId: string,
  typeId?: string,
  workspaceId?: string,
) {
  switch (type) {
    case "users": {
      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
        },
      });
      return user?.id ? true : false;
    }
    case "groups": {
      if (!typeId) {
        return false;
      }
      const group = await prisma.conversationMember.findUnique({
        where: {
          userId_conversationId: {
            userId,
            conversationId: typeId,
          },
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
            },
          },
        },
      });
      if (!group) {
        return false;
      }
      const userRole = group.role;
      const groupPermissions =
        group.conversation.groupPermissions?.permissions.includes(
          "Edit_Group_Details",
        );
      if (userRole === "Admin" || groupPermissions) {
        return true;
      }
      return false;
    }
    case "projects": {
      if (!workspaceId || !typeId) {
        return false;
      }
      const userWsRole = await wsRole(userId, workspaceId);
      if (!userWsRole) {
        return false;
      }
      const projectMember = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: userId,
            workspaceMemberWsId: workspaceId,
            projectId: typeId,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              roles: {
                where: {
                  role: "Manager",
                },
                select: {
                  permissions: true,
                },
              },
            },
          },
        },
      });
      if (userWsRole === "Owner" || userWsRole === "Admin") {
        return true;
      } else {
        if (!projectMember) {
          return false;
        } else if (
          projectMember.role === "Owner" ||
          (projectMember.role === "Manager" &&
            projectMember.project.roles[0]?.permissions.includes(
              "Edit_Project_Details",
            ))
        ) {
          return true;
        } else {
          return false;
        }
      }
    }
    case "workspaces": {
      if (!typeId) {
        return false;
      }
      const member = await prisma.workspaceMember.findUnique({
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
      if (!member) {
        return false;
      }
      if (
        member.role === "Owner" ||
        (member.role === "Admin" &&
          member.workspace.roles[0]?.permissions.includes("Edit_Ws_Details"))
      ) {
        return true;
      } else {
        return false;
      }
    }
  }
}
