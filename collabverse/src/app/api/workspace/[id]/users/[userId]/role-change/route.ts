import { withAuth } from "@/lib/api/auth/withAuth";
import { wsRoleSchema } from "@/lib/axios/workspace/users/changeUserRole";
import { prisma } from "@/lib/db/prisma";
import { workspace_role_changed_notification } from "@/lib/functions/notifications/notifications";
import { revokeInvitationOfWs } from "@/lib/serviceLayer/invitation/revokeInvitation";
import { hasPermInWorkspace } from "@/lib/serviceLayer/workspace/hasPermInWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { ActivityType } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import { ZodError } from "zod";

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; userId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const userId = params.userId;
    if (!workspaceId || !userId) {
      return new Response("Invalid parameters", { status: 400 });
    }
    const data = await req.json();
    if (user.id === userId) {
      return new Response("You cannot change your role", { status: 400 });
    }
    try {
      const { role } = wsRoleSchema.parse(data);
      const currentUserRole = await wsRole(user.id, workspaceId);

      if (!currentUserRole || currentUserRole !== "Owner") {
        return new Response("You are not authorised", { status: 403 });
      }
      const userExists = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
        select: {
          workspace: {
            select: {
              name: true,
            },
          },
          role: true,
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
      if (role === userExists.role) {
        return new Response("Role is already set", { status: 400 });
      }
      if (userExists.role === "Owner") {
        return new Response("Cannot change owner's role", { status: 400 });
      }

      await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
        data: {
          role,
        },
      });
      const hasPermToInvite = await hasPermInWorkspace(
        role,
        "Invite",
        workspaceId,
      );
      if (!hasPermToInvite) {
        await revokeInvitationOfWs(userId, workspaceId);
      }
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            projectId: null,
            taskId: null,
            type: ActivityType.workspace_member_role_changed,
            actorUserId: user.id,
            affectedUserId: userId,
            target: {
              oldValue: userExists.role,
              newValue: role,
            },
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }

      await workspace_role_changed_notification(
        userId,
        user.id,
        workspaceId,
        role,
        userExists.role,
      );
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
