import { ProjectCardProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, TaskStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";

interface prismaProject {
  id: string;
  name: string;
  avatar: string | null;
  slug: string;
  createdAt: Date;
  description: string | null;
  tasks: {
    status: TaskStatus;
  }[];
  currentOwner: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
  _count: {
    members: number;
  };
}
type statusProp = {
  status: $Enums.TaskStatus;
};

export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const take = 5;
    if (!workspaceId) {
      return new Response("Required param not found", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const projects: prismaProject[] = await prisma.project.findMany({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: {
              some: {
                workspaceMemberUserId: user.id,
              },
            },
          }),
        },
        take,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          description: true,
          slug: true,
          currentOwner: {
            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  avatar: true,
                },
              },
            },
          },
          createdAt: true,
          tasks: {
            select: {
              status: true,
            },
          },
          _count: {
            select: {
              members: true,
            },
          },
        },
      });

      const data: ProjectCardProps[] = projects.map((p: prismaProject) => {
        const totalTasks = p.tasks.length;
        const completedTasks = p.tasks.filter(
          (t: statusProp) => t.status === "Done",
        ).length;

        return {
          id: p.id,
          name: p.name,
          avatar: p.avatar ?? undefined,
          slug: p.slug,
          description: p.description ?? undefined,
          members: p._count.members,
          totalTasks,
          completedTasks,
          owner: {
            id: p.currentOwner.user.id,
            name: p.currentOwner.user.name ?? "",
            avatar: p.currentOwner.user.avatar ?? undefined,
            username: p.currentOwner.user.username ?? "",
          },
          createdAt: p.createdAt,
        };
      });
      return Response.json(data, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
