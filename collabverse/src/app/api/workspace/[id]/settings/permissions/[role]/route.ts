import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, WsPermission } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

const wsPermToggleSchema = z.object({
  permission: z.enum(WsPermission),
  enabled: z.boolean(),
});

export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; role: "Admin" | "Member" } },
  ) => {
    const workspaceId = params.id;
    const role = params.role;
    if (!workspaceId || !role) {
      return apiError("Invalid parameters", 400);
    }
    const body = await req.json();
    try {
      const { permission, enabled } = wsPermToggleSchema.parse(body);
      const memberPerms: WsPermission[] = [
        WsPermission.Invite,
        WsPermission.Create_Project,
      ];
      if (role === "Member" && !memberPerms.includes(permission)) {
        return apiError("Invalid data", 400);
      }
      const userRole = await wsRole(user.id, workspaceId);
      if (!userRole || userRole !== "Owner") {
        return apiError("You are not authorised", 403);
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
        return apiError("Workspace not found", 404);
      }
      const hasPermission = wsPerm.permissions.includes(permission);

      if (enabled === hasPermission) {
        return apiError(
          `Permission already ${enabled ? "enabled" : "disabled"}`,
          400,
        );
      }
      const updatedPerm = enabled
        ? Array.from(new Set([...wsPerm.permissions, permission]))
        : wsPerm.permissions.filter(
            (p: $Enums.WsPermission) => p !== permission,
          );
      await prisma.workspaceRole.update({
        where: {
          workspaceId_role: {
            workspaceId,
            role,
          },
        },
        data: {
          permissions: {
            set: updatedPerm,
          },
        },
      });
      if (permission === "Invite" && !enabled) {
        await prisma.invitation.updateMany({
          where: {
            createdBy: {
              memberships: {
                some: {
                  role,
                  workspaceId,
                },
              },
            },
            workspaceId,
            projectId: null,
            status: "Pending",
          },
          data: {
            status: "Revoked",
          },
        });
      }
      try {
        await prisma.activity.create({
          data: {
            workspaceId,
            type: "workspace_settings_updated",
            actorUserId: user.id,
          },
        });
      } catch (e) {
        console.log("Activity logging failed", e);
      }
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      if (e instanceof ZodError) {
        return Response.json(
          { errors: e.flatten().fieldErrors },
          { status: 400 },
        );
      }
      return apiError("Something went wrong", 500);
    }
  },
);
