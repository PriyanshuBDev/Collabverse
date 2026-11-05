import { ProjectCardProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { Prisma } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type resProp = {
  id: string;
  _count: {
    members: number;
    tasks: number;
  };
  name: string;
  avatar: string | null;
  slug: string;
  description: string | null;
  createdAt: Date;
  dueDate: Date | null;
  currentOwner: {
    user: {
      id: string;
      name: string | null;
      avatar: string | null;
      username: string | null;
    };
  };
  tasks: {
    id: string;
  }[];
};
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const cursorId = searchParams.get("cursorId");
    const search = searchParams.get("search");
    if (!workspaceId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const where: Prisma.ProjectWhereInput = {
        workspaceId,
        ...(role === "Member" && {
          members: { some: { workspaceMemberUserId: user.id } },
        }),
        name: search ? { contains: search, mode: "insensitive" } : undefined,
      };
      const limit = 12;
      const res = await prisma.project.findMany({
        where,
        cursor: cursorId ? { id: cursorId } : undefined,
        skip: cursorId ? 1 : 0,
        take: limit + 1,
        orderBy: [{ lastActivityAt: "desc" }, { id: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
          dueDate: true,
          createdAt: true,
          description: true,
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
          tasks: {
            where: { status: "Done" },
            select: { id: true },
          },
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },
        },
      });
      let nextCursor: string | undefined = undefined;
      if (res.length > limit) {
        const nextItem = res.pop();
        nextCursor = nextItem!.id;
      }

      const projects: ProjectCardProps[] = res.map((r: resProp) => {
        const owner = r.currentOwner;
        return {
          ...r,
          avatar: r.avatar ?? undefined,
          description: r.description ?? undefined,
          dueDate: r.dueDate ?? undefined,
          owner: {
            id: owner.user.id,
            name: owner.user.name ?? "unknown",
            avatar: owner.user.avatar ?? undefined,
            username: owner.user.username ?? "",
          },
          totalTasks: r._count.tasks,
          completedTasks: r.tasks.length,
          members: r._count.members,
        };
      });
      return Response.json({ projects, nextCursor }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
