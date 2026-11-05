import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { revokeInvitationOfProject } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { ActivityType } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type taskIdProp = {
  taskId: string;
};
export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }

    try {
      const membership = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: user.id,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        select: {
          role: true,
          workspaceMember: {
            select: {
              user: {
                select: {
                  name: true,
                },
              },
            },
          },
          taskMemberShips: {
            select: {
              taskId: true,
            },
          },
        },
      });

      if (!membership) {
        return apiErrorCustom("Membership not found");
      }

      if (membership.role === "Owner") {
        return apiErrorCustom("Transfer your project ownership before leaving");
      }

      await prisma.projectMember.delete({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: user.id,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
      });
      await revokeInvitationOfProject(user.id, workspaceId, projectId);
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId,
            type: ActivityType.project_member_left,
            target: {
              id: user.id,
              name: membership.workspaceMember.user.name ?? "unknown",
            },
          },
        });
        if (membership.taskMemberShips.length > 0) {
          await prisma.activity.createMany({
            data: membership.taskMemberShips.map((t: taskIdProp) => ({
              workspaceId,
              projectId,
              taskId: t.taskId,
              type: ActivityType.task_member_left,
              target: {
                id: user.id,
                name: membership.workspaceMember.user.name ?? "unknown",
              },
            })),
          });
        }
      } catch (e) {
        console.error("Activity logging failed", e);
      }
      return Response.json({ success: true });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
