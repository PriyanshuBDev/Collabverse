import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  currentWsProps,
  WsMembersPerm,
} from "@/lib/queries/workspace/useWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type wsRolePerm = {
  role: $Enums.WsRole;
  permissions: $Enums.WsPermission[];
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ slug: string }> },
  ) => {
    const params = await paramsPromise;
    const slug = params.slug;
    if (!slug) {
      return new Response("Invalid parameter", { status: 400 });
    }
    try {
      const ws = await prisma.workspace.findUnique({
        where: {
          slug,
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      });
      if (!ws) {
        return new Response("Workspace not found", { status: 404 });
      }
      const role = await wsRole(user.id, ws.id);
      if (!role) {
        return new Response("You are not authorized to access this workspace", {
          status: 403,
        });
      }
      const perms = await prisma.workspaceRole.findMany({
        where: {
          workspaceId: ws.id,
        },
        select: {
          role: true,
          permissions: true,
        },
      });
      const memberPerm: WsMembersPerm[] =
        perms
          .find((p: wsRolePerm) => p.role === "Member")
          ?.permissions.filter(
            (perm: $Enums.WsPermission): perm is WsMembersPerm =>
              perm == "Invite" || perm === "Create_Project",
          ) ?? [];
      const data: currentWsProps = {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        role,
        permissions: {
          admin:
            perms.find((p: wsRolePerm) => p.role === "Admin")?.permissions ??
            [],
          member: memberPerm,
        },
      };
      return Response.json({ ...data }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
