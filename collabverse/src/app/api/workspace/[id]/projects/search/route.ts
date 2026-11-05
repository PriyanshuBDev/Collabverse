import { dataWithSlug, projectProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    if (!workspaceId || !search) {
      return new Response("Invalid parameters", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const limit = 5;
      const res = await prisma.project.findMany({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: { some: { workspaceMemberUserId: user.id } },
          }),
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        take: limit,
        orderBy: {
          name: "asc",
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          slug: true,
        },
      });
      const projects: projectProps[] = res.map((r: dataWithSlug) => ({
        ...r,
        avatar: r.avatar ?? undefined,
      }));
      return Response.json({ projects }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
