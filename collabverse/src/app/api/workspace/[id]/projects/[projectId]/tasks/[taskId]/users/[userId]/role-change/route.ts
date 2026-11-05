import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { task_role_changed_notification } from "@/lib/functions/notifications/notifications";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { TaskRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

export const taskRoleSchema = z.object({
  role: z.enum(TaskRole),
});

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{ id: string; projectId: string; taskId: string; userId: string }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const userId = params.userId;
    if (!workspaceId || !projectId || !taskId || !userId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    const data = await req.json();

    try {
      const roleToChange = taskRoleSchema.parse(data);
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
          task: {
            select: {
              name: true,
              slug: true,
              project: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
          role: true,

          projectMember: {
            select: {
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
      if (roleToChange.role === userExists.role) {
        return new Response("Role is already set", { status: 400 });
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
      await prisma.taskMember.update({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: userId,
            taskId,
          },
        },
        data: {
          role: roleToChange.role,
        },
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId,
            type: "task_member_role_changed",
            actorUserId: user.id,
            affectedUserId: userId,
            target: {
              oldValue: userExists.role,
              newValue: roleToChange.role,
            },
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }
      if (user.id !== userId) {
        await task_role_changed_notification(
          workspaceId,
          userId,
          user.id,
          taskId,
          userExists.task.name,
          userExists.task.slug,
          userExists.role,
          roleToChange.role,
          projectId,
          userExists.task.project.name,
          userExists.task.project.slug,
        );
      }
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
