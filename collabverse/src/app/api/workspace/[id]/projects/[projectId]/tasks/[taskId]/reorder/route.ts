import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { Prisma, TaskStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";

export const taskReorderSchema = z.object({
  prevId: z.uuid().optional(),
  nextId: z.uuid().optional(),
  status: z.enum(TaskStatus),
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
      const { prevId, nextId, status } = taskReorderSchema.parse(body);

      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      let newPosition: number = 1000;
      let rebalance = false;
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const prev = prevId
          ? await tx.task.findUnique({
              where: { id: prevId },
              select: { id: true, position: true, status: true },
            })
          : null;
        const next = nextId
          ? await tx.task.findUnique({
              where: { id: nextId },
              select: { id: true, position: true, status: true },
            })
          : null;
        if (prev && prev.status !== status) throw new Error("Invalid prev");
        if (next && next.status !== status) throw new Error("Invalid next");
        if (prev && next) {
          const gap = next.position - prev.position;

          if (gap < 1) {
            await rebalanceColumn(tx, projectId, status);
            rebalance = true;
            const prevAfter = await tx.task.findUnique({
              where: { id: prevId },
              select: { id: true, position: true },
            });
            const nextAfter = await tx.task.findUnique({
              where: { id: nextId },
              select: { id: true, position: true },
            });
            if (prevAfter && nextAfter) {
              newPosition = (prevAfter.position + nextAfter.position) / 2;
            } else if (prevAfter) {
              newPosition = prevAfter.position + 1000;
            } else if (nextAfter) {
              newPosition = nextAfter.position - 1000;
            } else {
              newPosition = 1000;
            }
          } else {
            newPosition = (prev.position + next.position) / 2;
          }
        }
        if (!prev && next) {
          newPosition = next.position - 1000;
        }
        if (prev && !next) {
          newPosition = prev.position + 1000;
        }
        if (!prev && !next) {
          newPosition = 1000;
        }
        await tx.task.update({
          where: {
            id: taskId,
          },
          data: {
            position: newPosition,
          },
        });
      });

      return Response.json(
        { success: true, rebalance, status },
        { status: 200 },
      );
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);

export async function rebalanceColumn(
  tx: Prisma.TransactionClient,
  projectId: string,
  status: TaskStatus,
) {
  const tasks = await tx.task.findMany({
    where: { projectId, status },
    orderBy: { position: "asc" },
    select: { id: true },
  });
  for (let i = 0; i < tasks.length; i++) {
    await tx.task.update({
      where: { id: tasks[i].id },
      data: { position: (i + 1) * 1000 },
    });
  }
}
