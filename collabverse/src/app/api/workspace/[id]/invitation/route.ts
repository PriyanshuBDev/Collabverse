import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { isWorkspaceMember } from "@/lib/serviceLayer/workspace/isWorkspaceMember";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return new Response("Invalid params", { status: 400 });
    }
    try {
      const isMember = await isWorkspaceMember(user.id, workspaceId);
      if (!isMember) {
        return new Response("You are not authorised", { status: 403 });
      }
      const res = await prisma.workspace.findUnique({
        where: {
          id: workspaceId,
        },
        select: {
          avatar: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      });
      if (!res) {
        return new Response("Workspace not found", { status: 404 });
      }
      return Response.json(
        { members: res._count.members, avatar: res.avatar },
        { status: 200 },
      );
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
