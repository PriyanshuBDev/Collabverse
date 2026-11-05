import { WorkspacesProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";
type wsDbProp = {
  workspace: {
    id: string;
    _count: {
      projects: number;
      members: number;
    };
    name: string;
    avatar: string | null;
    createdAt: Date;
    slug: string;
    description: string | null;
    currentOwner: {
      id: string;
      name: string | null;
      avatar: string | null;
    };
  };
};
export const GET = withAuth(async (user: User, req: Request) => {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  try {
    const res = await prisma.workspaceMember.findMany({
      where: {
        userId: user.id,
        workspace: {
          name: search ? { contains: search, mode: "insensitive" } : undefined,
        },
      },
      select: {
        workspace: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
            createdAt: true,
            description: true,
            currentOwner: {
              select: {
                id: true,
                avatar: true,
                name: true,
              },
            },
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
    });
    const data: WorkspacesProps[] = res.map((r: wsDbProp) => {
      return {
        id: r.workspace.id,
        name: r.workspace.name,
        avatar: r.workspace.avatar ?? undefined,
        slug: r.workspace.slug,
        createdAt: r.workspace.createdAt,
        members: r.workspace._count.members,
        projects: r.workspace._count.projects,
        description: r.workspace.description ?? undefined,
        owner: {
          id: r.workspace.currentOwner.id,
          avatar: r.workspace.currentOwner.avatar ?? undefined,
          name: r.workspace.currentOwner.name ?? "",
        },
      };
    });
    return Response.json(data, { status: 200 });
  } catch {
    return new Response(`Something went wrong`, { status: 500 });
  }
});
