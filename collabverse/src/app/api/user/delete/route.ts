import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { User } from "@supabase/supabase-js";
import { ActivityType } from "@prisma/client";
import { prismaTransactionProp } from "@/app/interfaces";
type mapProp = {
  workspaceId: string;
};
export const DELETE = withAuth(async (user: User) => {
  const supabase = supabaseAdmin();
  try {
    const exists = await prisma.user.findUnique({
      where: { id: user.id },
      select: { id: true, name: true },
    });

    if (!exists) {
      return new Response("User does not exist", { status: 404 });
    }
    if (!user.last_sign_in_at) {
      return new Response("Re-authentication required", { status: 403 });
    }
    const lastSignIn = new Date(user.last_sign_in_at).getTime();
    const FIVE_MIN = 5 * 60 * 1000;

    if (Date.now() - lastSignIn > FIVE_MIN) {
      return new Response("Re-authentication required", { status: 403 });
    }
    const [ownedWorkspaces, ownedProjects] = await Promise.all([
      prisma.workspace.findMany({
        where: { currentOwnerId: user.id },
        select: { id: true },
      }),
      prisma.project.findMany({
        where: {
          currentOwnerId: user.id,
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (ownedWorkspaces.length > 0 || ownedProjects.length > 0) {
      return new Response("Transfer ownership before deleting account", {
        status: 409,
      });
    }

    try {
      const wsIds = (
        await prisma.workspaceMember.findMany({
          where: {
            userId: user.id,
          },
          select: {
            workspaceId: true,
          },
        })
      ).map((m: mapProp) => m.workspaceId);
      const activities = [
        ...wsIds.map((w: string) => ({
          workspaceId: w,
          projectId: null,
          taskId: null,
          type: ActivityType.workspace_member_left,
          target: {
            name: exists.name,
          },
        })),
      ];

      if (activities.length > 0) {
        await prisma.activity.createMany({
          data: activities,
        });
      }
    } catch (e) {
      console.log("Activity logging failed", e);
    }

    await prisma.$transaction(async (tx: prismaTransactionProp) => {
      await tx.invitation.updateMany({
        where: {
          createdById: user.id,
          status: "Pending",
        },
        data: {
          status: "Revoked",
        },
      });
      await tx.user.delete({
        where: {
          id: user.id,
        },
      });
    });

    try {
      await supabase.auth.admin.deleteUser(user.id);
    } catch (e) {
      console.log("Supabase delete failed", e);
    }
    return Response.json({ success: true }, { status: 200 });
  } catch {
    return new Response("Something went wrong", { status: 500 });
  }
});
