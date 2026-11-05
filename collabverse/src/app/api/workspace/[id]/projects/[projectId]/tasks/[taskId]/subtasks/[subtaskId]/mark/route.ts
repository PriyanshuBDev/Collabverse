import { basicMember } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { taskRole } from "@/lib/serviceLayer/task/taskRole";
import { Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const subtaskMarkSchema = z.object({
  done: z.boolean(),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: {
      params: {
        id: string;
        projectId: string;
        taskId: string;
        subtaskId: string;
      };
    },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const subtaskId = params.subtaskId;
    if (!workspaceId || !projectId || !taskId || !subtaskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { done } = subtaskMarkSchema.parse(body);
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
      const subtask = await prisma.subtask.update({
        where: {
          id: subtaskId,
          workspaceId,
          taskId,
        },
        data: {
          done,
        },
        select: {
          name: true,
        },
      });

      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId,
            actorUserId: user.id,
            type: done ? "subtask_completed" : "subtask_unmarked",
            target: {
              id: subtaskId,
              name: subtask.name,
            },
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      const markedBy: basicMember = {
        id: userMembership.user.id,
        name: userMembership.user.name ?? "unknown",
        avatar: userMembership.user.avatar ?? undefined,
      };
      return Response.json({ markedBy, done }, { status: 200 });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2025"
      ) {
        return apiError("Subtask not found", 404);
      }
      return zodApiError(e);
    }
  },
);
