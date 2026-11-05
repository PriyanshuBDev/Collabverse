import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{
        id: string;
        projectId: string;
        taskId: string;
        subtaskId: string;
      }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const subtaskId = params.subtaskId;
    if (!workspaceId || !projectId || !taskId || !subtaskId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access) {
        return apiErrorCustom("You are not authorised");
      }
      let subtaskName: string = "";
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const subtask = await tx.subtask.findFirst({
          where: {
            id: subtaskId,
            taskId,
            workspaceId,
          },
          select: {
            name: true,
          },
        });

        if (!subtask) {
          throw new Error("Subtask not found");
        }
        subtaskName = subtask.name;
        await tx.subtask.delete({
          where: {
            id: subtaskId,
          },
        });
      });
      try {
        await prisma.activity.create({
          data: {
            taskId,
            workspaceId,
            projectId,
            actorUserId: user.id,
            type: "subtask_deleted",
            target: {
              name: subtaskName,
            },
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
