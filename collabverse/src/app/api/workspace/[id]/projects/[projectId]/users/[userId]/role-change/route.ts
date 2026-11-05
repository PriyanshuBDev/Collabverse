import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { project_role_change_notification } from "@/lib/functions/notifications/notifications";
import { revokeInvitationOfProject } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { hasPermInProject } from "@/lib/serviceLayer/project/hasPermInProject";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

export const projectRoleSchema = z.object({
  role: z.enum(["Manager", "Contributor", "Viewer"]),
});

export const PATCH = withAuth(
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
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    if (user.id === userId) {
      return apiErrorCustom("You cannot change your own role");
    }
    try {
      const { role } = projectRoleSchema.parse(data);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
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
          project: {
            select: {
              name: true,
              slug: true,
            },
          },
          role: true,
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
          _count: {
            select: {
              taskMemberShips: true,
            },
          },
        },
      });
      if (!userExists) {
        return new Response("User not found", { status: 404 });
      }
      if (role === userExists.role) {
        return new Response("Role is already set", { status: 400 });
      }
      if (role === "Viewer" && userExists._count.taskMemberShips > 0) {
        return apiError(
          "Cannot change role to viewer as user is assigned to task(s)",
          400,
        );
      }
      if (userExists.role === "Owner") {
        if (currentUserWsRole === "Owner" || currentUserWsRole === "Admin") {
          return new Response(
            "Transfer their ownership before changing their role",
            { status: 400 },
          );
        }

        return new Response("Cannot change role of project owner", {
          status: 403,
        });
      }
      if (currentUserWsRole === "Owner" || currentUserWsRole === "Admin") {
        //allowed
      } else {
        if (!currentUserProjectRole) {
          return new Response("You are not authorised", { status: 403 });
        }
        if (
          currentUserProjectRole === "Owner" ||
          currentUserProjectRole === "Manager"
        ) {
          //allowed
          if (currentUserProjectRole === "Manager" && role === "Manager") {
            return new Response("You are not authorised", { status: 403 });
          }
        } else {
          return new Response("You are not authorised", { status: 403 });
        }
      }
      if (role === "Viewer" && userExists._count.taskMemberShips > 0) {
        return apiError(
          "Cannot change role to viewer as user is assigned to tasks",
          400,
        );
      }

      await prisma.projectMember.update({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: userId,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        data: {
          role,
        },
      });
      if (
        userExists.workspaceMember.role !== "Owner" &&
        userExists.workspaceMember.role !== "Admin"
      ) {
        const hasPermToInvite = await hasPermInProject(
          role,
          "Invite",
          projectId,
        );
        if (!hasPermToInvite) {
          await revokeInvitationOfProject(userId, workspaceId, projectId);
        }
      }

      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId: null,
            type: "project_member_role_changed",
            actorUserId: user.id,
            affectedUserId: userId,
            target: {
              oldValue: userExists.role,
              newValue: role,
            },
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }

      await project_role_change_notification(
        userId,
        workspaceId,
        user.id,
        projectId,
        userExists.project.name,
        userExists.role,
        role,
        userExists.project.slug,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
