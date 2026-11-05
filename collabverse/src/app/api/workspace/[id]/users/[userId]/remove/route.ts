import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { removed_from_workspace_notification } from "@/lib/functions/notifications/notifications";
import { revokeInvitationEveryWhere } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { hasPermInWorkspace } from "@/lib/serviceLayer/workspace/hasPermInWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { ActivityType } from "@prisma/client";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; userId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const userId = params.userId;
    if (!workspaceId || !userId) {
      return new Response("Required param not found", { status: 400 });
    }
    if (user.id === userId) {
      return new Response("You cannot remove yourself", { status: 400 });
    }
    try {
      const role = await wsRole(user.id, workspaceId);

      if (!role || (role !== "Owner" && role !== "Admin")) {
        return new Response("You are not authorised", { status: 403 });
      }
      const userExists = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            workspaceId,
            userId,
          },
        },
        select: {
          workspace: {
            select: {
              name: true,
              avatar: true,
            },
          },
          role: true,
          ownedProjects: {
            where: {
              workspaceId,
            },
            select: {
              currentOwnerId: true,
            },
          },
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      if (!userExists) {
        return new Response("User not found", { status: 404 });
      }
      if (userExists.role === "Owner") {
        return new Response("Cannot remove workspace owner", { status: 400 });
      }
      if (userExists.ownedProjects.length > 0) {
        return new Response(
          "Transfer their ownership of projects before removing",
          { status: 400 },
        );
      }
      if (role === "Owner") {
        //allowed
      } else {
        const hasPerm = await hasPermInWorkspace(
          role,
          "Remove_Member",
          workspaceId,
        );

        if (!hasPerm || userExists.role !== "Member") {
          return new Response("You are not authorised", { status: 403 });
        }
      }

      await prisma.workspaceMember.delete({
        where: {
          userId_workspaceId: {
            userId: userId,
            workspaceId,
          },
        },
      });
      await revokeInvitationEveryWhere(userId, workspaceId);
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId: null,
            taskId: null,
            type: ActivityType.workspace_member_removed,
            actorUserId: user.id,
            target: {
              id: userId,
              name: userExists.user.name,
            },
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
      }

      await removed_from_workspace_notification(
        userId,
        user.id,
        workspaceId,
        userExists.workspace.name,
        userExists.workspace.avatar ?? undefined,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
