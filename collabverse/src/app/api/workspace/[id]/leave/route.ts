import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { workspace_left_notification } from "@/lib/functions/notifications/notifications";
import { ActivityType } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const isMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          workspace: {
            select: {
              name: true,
            },
          },
          user: {
            select: {
              name: true,
              avatar: true,
            },
          },
          ownedProjects: {
            select: {
              id: true,
            },
          },
        },
      });
      if (!isMember) {
        return apiErrorCustom("You are not authorised");
      }
      const ownedProjects = isMember.ownedProjects.length;
      if (ownedProjects > 0) {
        return apiError(
          `You cannot leave workspace as your owner of ${ownedProjects} project${ownedProjects > 1 ? "s" : ""}, transfer ownership before leaving`,
          400,
        );
      }
      await prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
      });
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId: null,
            taskId: null,
            type: ActivityType.workspace_member_left,
            target: {
              id: user.id,
              name: isMember.user.name ?? "unknown",
              avatar: isMember.user.avatar ?? undefined,
            },
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }
      await workspace_left_notification(
        user.id,
        workspaceId,
        isMember.workspace.name,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
