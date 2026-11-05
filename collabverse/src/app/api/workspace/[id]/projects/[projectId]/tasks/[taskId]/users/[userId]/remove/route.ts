import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { task_unassigned_notifiation } from "@/lib/functions/notifications/notifications";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: {
      params: { id: string; projectId: string; taskId: string; userId: string };
    },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const userId = params.userId;
    if (!workspaceId || !projectId || !taskId || !userId) {
      return new Response("Invalid parameters", { status: 400 });
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
      const userExists = await prisma.taskMember.findUnique({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: userId,
            taskId,
          },
        },
        select: {
          role: true,
          task: {
            select: {
              name: true,
            },
          },
          projectMember: {
            select: {
              project: {
                select: {
                  name: true,
                  slug: true,
                },
              },
              workspaceMember: {
                select: {
                  user: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
      if (!userExists) {
        return new Response("User not found", { status: 404 });
      }
      if (currentUserWsRole === "Owner" || currentUserWsRole === "Admin") {
        //allowed
      } else if (
        currentUserProjectRole === "Owner" ||
        currentUserProjectRole === "Manager"
      ) {
        //allowed
      } else {
        return new Response("You are not authorised", { status: 403 });
      }
      await prisma.taskMember.delete({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: userId,
            taskId,
          },
        },
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId,
            type: "task_member_removed",
            actorUserId: user.id,
            affectedUserId: userId,
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }
      if (user.id !== userId) {
        await task_unassigned_notifiation(
          userId,
          user.id,
          workspaceId,
          taskId,
          userExists.task.name,
          projectId,
          userExists.projectMember.project.name,
          userExists.projectMember.project.slug,
        );
      }
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
