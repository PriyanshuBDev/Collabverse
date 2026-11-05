import { withAuth } from "@/lib/api/auth/withAuth";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { nameSchema } from "../../../../create/route";
import { Priority, Prisma, TaskStatus } from "@prisma/client";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { prisma } from "@/lib/db/prisma";
import {
  isAllowedStatusTransition,
  statusMap,
} from "@/lib/functions/task/status/statusTransition";
import {
  prismaTransactionProp,
  projMemberUserIdProp,
  taskEditResProps,
} from "@/app/interfaces";
import { taskPatch_notification } from "@/lib/functions/notifications/notifications";

export const editTaskSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
  status: z.enum(TaskStatus).optional(),
  priority: z.enum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
});
export const PATCH = withAuth(
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
      const { name, description, status, priority, dueDate } =
        editTaskSchema.parse(body);
      if (
        name === undefined &&
        description === undefined &&
        status === undefined &&
        priority === undefined &&
        dueDate === undefined
      ) {
        return apiErrorCustom("Invalid data");
      }
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          workspaceId,
          projectId,
        },
        select: {
          name: true,
          description: true,
          status: true,
          priority: true,
          dueDate: true,
          slug: true,
          project: {
            select: {
              name: true,
              slug: true,
            },
          },
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      const userTaskAuthorityRole = access.authority;
      const nameCheck = name !== undefined && name !== task.name;
      const descriptionCheck =
        description !== undefined && description !== task.description;
      const statusCheck = status !== undefined && status !== task.status;
      const priorityCheck =
        priority !== undefined && priority !== task.priority;
      const dueDateCheck =
        dueDate !== undefined && dueDate.getTime() !== task.dueDate.getTime();
      if (
        !nameCheck &&
        !descriptionCheck &&
        !statusCheck &&
        !priorityCheck &&
        !dueDateCheck
      ) {
        return apiError("No actaual data provided", 400);
      }
      const updateData: Prisma.TaskUpdateInput = {
        ...(nameCheck && { name }),
        ...(descriptionCheck && { description }),
      };
      if (statusCheck) {
        if (
          !isAllowedStatusTransition(task.status, status, userTaskAuthorityRole)
        ) {
          return apiError(
            `You are not authorised to change task status to ${status}`,
            403,
          );
        }
        updateData.status = status;
      }
      if (priorityCheck) {
        if (userTaskAuthorityRole !== "High") {
          return apiError(
            "You are not authorised to change priority of task",
            403,
          );
        }
        updateData.priority = priority;
      }
      if (dueDateCheck) {
        if (dueDate <= new Date(Date.now() + 1000)) {
          return apiErrorCustom("Due date must be in the future");
        }
        updateData.dueDate = dueDate;
      }
      const updatedTask = await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          let position: number | undefined;
          if (statusCheck) {
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
            position = firstTask ? firstTask.position - 1000 : 1000;
          }
          const taskData = await tx.task.update({
            where: {
              id: taskId,
            },
            data: {
              ...updateData,
              ...(position !== undefined && { position }),
            },
            select: {
              name: true,
              description: true,
              status: true,
              priority: true,
              dueDate: true,
              position: true,
            },
          });
          return taskData;
        },
      );
      try {
        const activities: Prisma.ActivityCreateManyInput[] = [];
        if (statusCheck) {
          activities.push({
            taskId,
            projectId,
            workspaceId,
            actorUserId: user.id,
            type: "task_status_updated",
            target: {
              name: task.name,
              oldValue: statusMap(task.status),
              newValue: statusMap(status),
            },
          });
        }
        if (nameCheck) {
          activities.push({
            taskId,
            projectId,
            workspaceId,
            actorUserId: user.id,
            type: "task_name_updated",
            target: {
              oldValue: task.name,
              newValue: name,
            },
          });
        }
        if (descriptionCheck) {
          activities.push({
            taskId,
            projectId,
            workspaceId,
            actorUserId: user.id,
            type: "task_description_updated",
            target: {
              name: task.name,
            },
          });
        }
        if (priorityCheck) {
          activities.push({
            taskId,
            projectId,
            workspaceId,
            actorUserId: user.id,
            type: "task_priority_updated",
            target: {
              name: task.name,
              oldValue: task.priority,
              newValue: priority,
            },
          });
        }
        if (dueDateCheck) {
          activities.push({
            taskId,
            projectId,
            workspaceId,
            actorUserId: user.id,
            type: "task_due_updated",
            target: {
              name: task.name,
              oldValue: task.dueDate,
              newValue: dueDate,
            },
          });
        }
        if (activities.length > 0) {
          await prisma.activity.createMany({
            data: activities,
          });
        }
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      try {
        let memberIds: string[] = [];
        if ((statusCheck && status === "Done") || dueDateCheck) {
          memberIds = (
            await prisma.taskMember.findMany({
              where: {
                projectId,
                taskId,
                workspaceId,
                projectMemberUserId: {
                  not: user.id,
                },
              },
              select: {
                projectMemberUserId: true,
              },
            })
          ).map((t: projMemberUserIdProp) => t.projectMemberUserId);
        }
        if (memberIds.length > 0) {
          await taskPatch_notification(
            memberIds,
            workspaceId,
            user.id,
            taskId,
            task.name,
            task.slug,
            task.project.name,
            task.project.slug,
            statusCheck && status === "Done",
            dueDateCheck,
            dueDate,
            task.dueDate,
          );
        }
      } catch (e) {
        console.error("Failed to log notification", e);
      }
      const taskRes: taskEditResProps = {
        ...updatedTask,
        description: updatedTask.description ?? undefined,
      };
      return Response.json({ task: taskRes }, { status: 200 });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
