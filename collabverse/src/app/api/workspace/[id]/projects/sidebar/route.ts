import { dataWithSlug, projectProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }

      const limit = 10;
      const res = await prisma.project.findMany({
        where: {
          workspaceId,
          ...(role === "Member" && {
            members: { some: { workspaceMemberUserId: user.id } },
          }),
        },
        take: limit + 1,
        orderBy: [{ lastActivityAt: "desc" }],
        select: {
          id: true,
          name: true,
          slug: true,
          avatar: true,
        },
      });
      const projects: projectProps[] = res.map((r: dataWithSlug) => {
        return {
          ...r,
          avatar: r.avatar ?? undefined,
        };
      });
      return Response.json(
        { projects, hasMore: res.length > limit },
        { status: 200 },
      );
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
