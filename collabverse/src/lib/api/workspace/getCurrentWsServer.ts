import { prisma } from "@/lib/db/prisma";
import {
  currentWsProps,
  WsMembersPerm,
} from "@/lib/queries/workspace/useWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { supabaseServerFrontend } from "@/lib/supabase/serverFrontend";
import { $Enums } from "@prisma/client";

import { notFound, redirect } from "next/navigation";
type wsRolPerm = {
  role: $Enums.WsRole;
  permissions: $Enums.WsPermission[];
};
export const getCurrentWsServer = async (
  slug: string,
): Promise<currentWsProps> => {
  const supabase = await supabaseServerFrontend();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/signin");
  }
  if (!slug) {
    return notFound();
  }
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
    return notFound();
  }
  const role = await wsRole(user.id, ws.id);
  if (!role) {
    return notFound();
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
      .find((p: wsRolPerm) => p.role === "Member")
      ?.permissions.filter(
        (perm: $Enums.WsPermission): perm is WsMembersPerm =>
          perm == "Invite" || perm === "Create_Project",
      ) ?? [];
  return {
    id: ws.id,
    name: ws.name,
    slug: ws.slug,
    role,
    permissions: {
      admin:
        perms.find((p: wsRolPerm) => p.role === "Admin")?.permissions ?? [],
      member: memberPerm,
    },
  };
};
