import { prismaTransactionProp, projMemberUserIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { task_completed_notification } from "@/lib/functions/notifications/notifications";
import {
  isAllowedStatusTransition,
  statusMap,
} from "@/lib/functions/task/status/statusTransition";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { Prisma, TaskStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";

export const taskPositionSchema = z.object({
  status: z.enum(TaskStatus),
});

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskId: string } },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { status } = taskPositionSchema.parse(body);
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const taskBasedRole = access.authority;
      const task = await prisma.task.findUnique({
        where: {
          id: taskId,
        },
        select: {
          status: true,
          position: true,
          name: true,
        },
      });
      if (!task) {
        return apiError("Task not found", 404);
      }
      if (!isAllowedStatusTransition(task.status, status, taskBasedRole)) {
        return apiErrorCustom("You are not authorised");
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const updateData: Prisma.TaskUpdateInput = {};
        if (task.status !== status) {
          updateData.status = status;
        }
        if (status === "Done") {
          updateData.completedAt = new Date();
        }
        const firstTask = await tx.task.findFirst({
          where: {
            projectId,
            status,
          },
          orderBy: {
            position: "asc",
          },
          select: {
            position: true,
          },
        });
        if (!firstTask) {
          updateData.position = 1000;
        } else {
          updateData.position = firstTask.position - 1000;
        }

        await tx.task.update({
          where: {
            id: taskId,
          },
          data: updateData,
        });
      });

      try {
        await prisma.activity.create({
          data: {
            actorUserId: user.id,
            taskId,
            workspaceId,
            projectId,
            type: "task_status_updated",
            target: {
              oldValue: statusMap(task.status),
              newValue: statusMap(status),
            },
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
      }
      try {
        if (status === "Done") {
          const memberIds = (
            await prisma.taskMember.findMany({
              where: {
                projectMemberUserId: {
                  not: user.id,
                },
                taskId,
                projectId,
                workspaceId,
              },
              select: {
                projectMemberUserId: true,
              },
            })
          ).map((m: projMemberUserIdProp) => m.projectMemberUserId);
          await task_completed_notification(
            memberIds,
            user.id,
            workspaceId,
            taskId,
            task.name,
          );
        }
      } catch (e) {
        console.error("Failed to log notification", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
