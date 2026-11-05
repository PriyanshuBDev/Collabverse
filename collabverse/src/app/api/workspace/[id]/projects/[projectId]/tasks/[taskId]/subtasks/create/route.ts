import { withAuth } from "@/lib/api/auth/withAuth";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import { nameSchema } from "../../../../../create/route";
import z from "zod";
import { prisma } from "@/lib/db/prisma";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { taskRole } from "@/lib/serviceLayer/task/taskRole";
import { subTaskProps } from "@/app/interfaces";

export const subtaskCreateSchema = z.object({
  name: nameSchema,
  description: z.string().max(1000).optional(),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { name, description } = subtaskCreateSchema.parse(body);
      const userMembership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          role: true,
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      if (!userMembership) {
        return apiErrorCustom("You are not authorised");
      }
      const userWsRole = userMembership?.role;

      if (userWsRole !== "Owner" && userWsRole !== "Admin") {
        const userProjectRole = await projectRole(
          user.id,
          workspaceId,
          projectId,
        );
        if (!userProjectRole) {
          return apiErrorCustom("You are not authorised");
        }
        if (userProjectRole !== "Owner" && userProjectRole !== "Manager") {
          const userTaskRole = await taskRole(user.id, taskId);
          if (!userTaskRole) {
            return apiErrorCustom("You are not authorised");
          }
        }
      }
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          projectId,
          workspaceId,
        },
        select: {
          _count: {
            select: {
              subtasks: true,
            },
          },
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      if (task._count.subtasks >= 10) {
        return apiError("You can't create more than 10 tasks", 400);
      }
      const res = await prisma.subtask.create({
        data: {
          name,
          description,
          createdById: user.id,
          taskId,
          workspaceId,
        },
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          done: true,
        },
      });
      const subtask: subTaskProps = {
        ...res,
        createdBy: {
          id: userMembership.user.id,
          name: userMembership.user.name ?? "unknown",
          avatar: userMembership.user.avatar ?? undefined,
        },
        markedBy: undefined,
        description: res.description ?? undefined,
      };
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId,
            actorUserId: user.id,
            type: "subtask_added",
            target: {
              id: subtask.id,
              name: subtask.name,
            },
          },
        });
      } catch (e) {
        console.log("Failed to log activity", e);
      }
      return Response.json({ subtask }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
