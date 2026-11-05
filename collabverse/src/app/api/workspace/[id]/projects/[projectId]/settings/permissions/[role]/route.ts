import { wsMemberUserIdProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums, PPermission } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

const projectPermToggleSchema = z.object({
  permission: z.enum(PPermission),
  enabled: z.boolean(),
});
const ROLE_PERMISSIONS: Record<
  "Manager" | "Contributor" | "Viewer",
  PPermission[]
> = {
  Manager: [
    PPermission.Edit_Project_Details,
    PPermission.Invite,
    PPermission.Remove_Member,
  ],
  Contributor: [PPermission.Comment, PPermission.Invite],
  Viewer: [PPermission.Comment],
} as const;
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: {
      params: {
        id: string;
        projectId: string;
        role: "Manager" | "Contributor" | "Viewer";
      };
    },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const role = params.role;
    if (!workspaceId || !projectId || !role) {
      return apiError("Invalid parameters", 400);
    }
    const body = await req.json();
    try {
      const { permission, enabled } = projectPermToggleSchema.parse(body);
      if (!ROLE_PERMISSIONS[role].includes(permission)) {
        return apiError("Invalid data", 400);
      }
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }
      const userProjectRole = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (
        userWsRole !== "Admin" &&
        userWsRole !== "Owner" &&
        !userProjectRole
      ) {
        return apiError("You are not authorised", 400);
      }
      if (userWsRole === "Member" && userProjectRole !== "Owner") {
        return apiError("You are not authorised", 400);
      }
      const project = await prisma.projectRole.findUnique({
        where: {
          projectId_role: {
            projectId,
            role,
          },
        },
        select: {
          permissions: true,
        },
      });
      if (!project) {
        return apiError("Project not found", 404);
      }
      const alreadyEnabled = project.permissions.includes(permission);
      if (enabled === alreadyEnabled) {
        return apiError(
          `${permission} already ${enabled ? "enabled" : "disabled"}`,
          400,
        );
      }
      const updatedPerm = enabled
        ? Array.from(new Set([...project.permissions, permission]))
        : project.permissions.filter(
            (p: $Enums.PPermission) => p !== permission,
          );
      await prisma.projectRole.update({
        where: {
          projectId_role: {
            projectId,
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
        const userIds = (
          await prisma.projectMember.findMany({
            where: {
              role,
              projectId,
              workspaceMemberWsId: workspaceId,
              workspaceMember: {
                role: {
                  notIn: ["Admin", "Owner"],
                },
              },
            },
            select: {
              workspaceMemberUserId: true,
            },
          })
        ).map((p: wsMemberUserIdProp) => p.workspaceMemberUserId);
        await prisma.invitation.updateMany({
          where: {
            createdById: {
              in: userIds,
            },
            workspaceId,
            projectId,
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
            projectId,
            type: "project_settings_updated",
            actorUserId: user.id,
          },
        });
      } catch (e) {
        console.error("Activity logging failed", e);
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
