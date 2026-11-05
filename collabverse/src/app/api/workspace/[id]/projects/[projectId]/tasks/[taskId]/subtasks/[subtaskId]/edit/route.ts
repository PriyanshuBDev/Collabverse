import { withAuth } from "@/lib/api/auth/withAuth";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
import { nameSchema } from "@/app/api/workspace/[id]/projects/create/route";
import { prisma } from "@/lib/db/prisma";
import { taskAuthority } from "@/lib/serviceLayer/task/taskAuthority";

export const subtaskEditSchema = z.object({
  name: nameSchema.optional(),
  description: z.string().max(1000).optional().nullable(),
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
      const { name, description } = subtaskEditSchema.parse(body);
      const access = await taskAuthority(
        user.id,
        workspaceId,
        projectId,
        taskId,
      );
      if (!access.success) {
        return apiErrorCustom("You are not authorised");
      }
      const subtask = await prisma.subtask.findFirst({
        where: {
          id: subtaskId,
          workspaceId,
          taskId,
        },
        select: {
          name: true,
        },
      });
      if (!subtask) {
        return apiError("Subtask not found", 404);
      }
      await prisma.subtask.update({
        where: {
          id: subtaskId,
        },
        data: {
          ...(name !== undefined && { name }),
          ...(description !== undefined && { description }),
        },
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId,
            actorUserId: user.id,
            type: "subtask_updated",
            target: {
              id: subtaskId,
              name: subtask.name,
            },
          },
        });
      } catch (e) {
        console.error("Failed to log activity", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
