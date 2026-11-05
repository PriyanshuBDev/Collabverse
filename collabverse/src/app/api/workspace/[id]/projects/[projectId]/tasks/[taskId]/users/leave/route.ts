import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { ActivityType } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
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

    try {
      const membership = await prisma.taskMember.findUnique({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: user.id,
            taskId,
          },
        },
        select: {
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

      if (!membership) {
        return apiErrorCustom("Membership not found");
      }

      await prisma.taskMember.delete({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: user.id,
            taskId,
          },
        },
      });

      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            taskId: taskId,
            type: ActivityType.task_member_left,
            target: {
              id: user.id,
              name:
                membership.projectMember.workspaceMember.user.name ?? "unknown",
            },
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
      }
      return Response.json({ success: true });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
