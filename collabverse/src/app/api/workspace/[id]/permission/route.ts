import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const GET = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return new Response("Required params not found", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);
      if (!role) {
        return new Response("You are not authorised", { status: 403 });
      }
      const wsPerm = await prisma.workspaceRole.findUnique({
        where: {
          workspaceId_role: {
            workspaceId,
            role,
          },
        },
        select: {
          permissions: true,
        },
      });
      if (!wsPerm) {
        return new Response("Workspace not found", { status: 404 });
      }
      return Response.json({ permission: wsPerm.permissions }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
