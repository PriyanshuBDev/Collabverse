import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { removed_from_project_notification } from "@/lib/functions/notifications/notifications";
import { revokeInvitationOfProject } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { hasPermInProject } from "@/lib/serviceLayer/project/hasPermInProject";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; userId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const userId = params.userId;
    if (!workspaceId || !projectId || !userId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    if (user.id === userId) {
      return apiErrorCustom("You cannot remove yourself");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return new Response("You are not authorised", { status: 403 });
      }
      const currentUserProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      const userExists = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: userId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              name: true,
            },
          },
          workspaceMember: {
            select: {
              workspace: {
                select: {
                  name: true,
                },
              },
              user: {
                select: {
                  name: true,
                },
              },
              role: true,
            },
          },
        },
      });
      if (!userExists) {
        return new Response("User not found", { status: 404 });
      }
      if (userExists.role === "Owner") {
        if (currentUserWsRole === "Owner" || currentUserWsRole === "Admin") {
          return new Response(
            "Transfer their ownership before removing them from project",
            { status: 400 },
          );
        }

        return new Response("Cannot remove project owner", { status: 403 });
      }
      if (currentUserWsRole === "Owner" || currentUserWsRole === "Admin") {
        //allowed
      } else {
        if (!currentUserProjectRole) {
          return new Response("You are not authorised", { status: 403 });
        }
        if (currentUserProjectRole === "Owner") {
          //allowed
        } else if (currentUserProjectRole === "Manager") {
          const hasPerm = await hasPermInProject(
            currentUserProjectRole,
            "Remove_Member",
            projectId,
          );
          if (!hasPerm) {
            return new Response("You are not authorised", { status: 403 });
          }
        } else {
          return new Response("You are not authorised", { status: 403 });
        }
      }
      await prisma.projectMember.delete({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: userId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
      });
      if (
        userExists.workspaceMember.role !== "Owner" &&
        userExists.workspaceMember.role !== "Admin"
      ) {
        await revokeInvitationOfProject(userId, workspaceId, projectId);
      }
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId: null,
            type: "project_member_removed",
            actorUserId: user.id,
            target: {
              id: userId,
              name: userExists.workspaceMember.user.name,
            },
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
      }
      await removed_from_project_notification(
        userId,
        workspaceId,
        user.id,
        projectId,
        userExists.project.name,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
