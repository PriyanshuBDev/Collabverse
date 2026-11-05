import { homeProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { $Enums, Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type taskResProp = {
  task: {
    status: $Enums.TaskStatus;
    id: string;
    name: string;
    slug: string;
    priority: $Enums.Priority;
    dueDate: Date;
    project: {
      name: string;
      slug: string;
    };
  };
};
type taskCountProp = Prisma.PickEnumerable<
  Prisma.TaskGroupByOutputType,
  "status"[]
> & {
  _count: {
    _all: number;
  };
};
export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
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
          role: true,
          user: {
            select: {
              appearance: {
                select: {
                  bodyId: true,
                  outfit: true,
                  hairstyle: true,
                  accessory: true,
                  eyes: true,
                },
              },
            },
          },
          projectMemberShips: {
            take: 1,
            select: {
              project: {
                select: {
                  slug: true,
                },
              },
            },
          },
          _count: {
            select: {
              projectMemberShips: true,
            },
          },
        },
      });
      if (!membership) {
        return apiErrorCustom("Membership not found");
      }
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfNextMonth = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
      );

      const [taskStatusCounts, projectCreatedThisMonth, tasksRes] =
        await Promise.all([
          prisma.task.groupBy({
            by: ["status"],
            where: {
              workspaceId,
              members: {
                some: { projectMemberUserId: user.id },
              },
            },
            _count: { _all: true },
          }),

          prisma.project.count({
            where: {
              workspaceId,
              members: {
                some: { workspaceMemberUserId: user.id },
              },
              createdAt: {
                gte: startOfMonth,
                lt: startOfNextMonth,
              },
            },
          }),

          prisma.taskMember.findMany({
            where: {
              projectMemberUserId: user.id,
              workspaceId,
            },
            take: 4,
            select: {
              task: {
                select: {
                  name: true,
                  id: true,
                  dueDate: true,
                  priority: true,
                  status: true,
                  slug: true,
                  project: {
                    select: { name: true, slug: true },
                  },
                },
              },
            },
          }),
        ]);

      const totalTasks = taskStatusCounts.reduce(
        (total, row) => total + row._count._all,
        0,
      );
      const completedTasks =
        taskStatusCounts.find((row: taskCountProp) => row.status === "Done")
          ?._count._all ?? 0;
      const appearance = membership.user.appearance;
      const data: homeProps = {
        completedTasks,
        totalTasks,
        activeProjects: membership._count.projectMemberShips,
        activeProjectsIncreasedBy: projectCreatedThisMonth,
        randomProjectSlug:
          membership.projectMemberShips.at(0)?.project.slug ?? "",
        userAppearance: {
          body: appearance?.bodyId ?? "body-01",
          outfit: appearance?.outfit ?? "outfit-01",
          accessory: appearance?.accessory ?? null,
          eyes: appearance?.eyes ?? "eyes-01",
          hairstyle: appearance?.hairstyle ?? "hairstyle-01",
        },
        tasks: tasksRes.map((t: taskResProp) => ({
          id: t.task.id,
          name: t.task.name,
          status: t.task.status,
          slug: t.task.slug,
          priority: t.task.priority,
          dueDate: t.task.dueDate,
          project: {
            name: t.task.project.name,
            slug: t.task.project.slug,
          },
        })),
      };
      return Response.json({ data });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
