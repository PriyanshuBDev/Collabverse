import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { revokeInvitationEveryWhere } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { ActivityType, Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type proMemProp = {
  projectId: string;
  taskMemberShips: {
    taskId: string;
  }[];
};
export const DELETE = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }

    try {
      const membership = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },

        select: {
          user: {
            select: {
              name: true,
            },
          },
          workspace: {
            select: {
              name: true,
              avatar: true,
            },
          },
          role: true,
          projectMemberShips: {
            select: {
              projectId: true,
              taskMemberShips: {
                select: {
                  taskId: true,
                },
              },
            },
          },
          _count: {
            select: {
              projectMemberShips: {
                where: {
                  role: "Owner",
                },
              },
            },
          },
        },
      });

      if (!membership) {
        return apiErrorCustom("Membership not found");
      }

      if (membership.role === "Owner") {
        return apiErrorCustom(
          "Transfer your workspace ownership before leaving",
        );
      }
      if (membership._count.projectMemberShips > 0) {
        return apiErrorCustom("Transfer your project ownership before leaving");
      }

      await prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
      });
      await revokeInvitationEveryWhere(user.id, workspaceId);
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            type: ActivityType.workspace_member_left,
            target: {
              id: user.id,
              name: membership.user.name ?? "unknown",
            },
          },
        });

        if (membership.projectMemberShips.length > 0) {
          await prisma.activity.createMany({
            data: membership.projectMemberShips.map((p: proMemProp) => ({
              workspaceId,
              projectId: p.projectId,
              type: "project_member_left",
              target: {
                id: user.id,
                name: membership.user.name ?? "unknown",
              },
            })),
          });
        }
        const taskActivityData: Prisma.ActivityCreateManyInput[] = [];
        membership.projectMemberShips.forEach((p: proMemProp) => {
          p.taskMemberShips.forEach((t) =>
            taskActivityData.push({
              workspaceId,
              projectId: p.projectId,
              taskId: t.taskId,
              type: "task_member_left",
              target: {
                id: user.id,
                name: membership.user.name ?? "unknown",
              },
            }),
          );
        });
        if (taskActivityData.length > 0) {
          await prisma.activity.createMany({
            data: taskActivityData,
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
