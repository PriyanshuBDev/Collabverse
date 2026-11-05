import {
  projectAuthorityRole,
  projectContributorPerm,
  projectManagerPerm,
  projectViewerPerm,
} from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { projectSlugProps } from "@/lib/axios/workspace/project/getCurrentProject";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type proRolePrem = {
  role: $Enums.PRole;
  permissions: $Enums.PPermission[];
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; slug: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectSlug = params.slug;
    if (!workspaceId || !projectSlug) {
      return apiError("Invalid parameters", 400);
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError("You are not authorised", 403);
      }

      const project = await prisma.project.findFirst({
        where: {
          slug: projectSlug,
          workspaceId,
        },
        select: {
          id: true,
          name: true,
          avatar: true,
          slug: true,
          roles: {
            select: {
              role: true,
              permissions: true,
            },
          },
        },
      });
      if (!project) {
        return apiError("Project not found", 404);
      }
      const userProject = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: user.id,
            workspaceMemberWsId: workspaceId,
            projectId: project.id,
          },
        },
        select: {
          role: true,
          joinedAt: true,
        },
      });
      const userProjectRole = userProject?.role;
      if (
        userWsRole !== "Owner" &&
        userWsRole !== "Admin" &&
        !userProjectRole
      ) {
        return apiError("You are not authorised", 403);
      }

      const role: projectAuthorityRole = userProjectRole ?? "High";
      const perms = project.roles;
      const contributorPerm: projectContributorPerm[] =
        perms
          .find((p: proRolePrem) => p.role === "Contributor")
          ?.permissions.filter(
            (perm: $Enums.PPermission): perm is projectContributorPerm =>
              perm === "Invite" || perm === "Comment",
          ) ?? [];
      const viewerPerm: projectViewerPerm[] =
        perms
          .find((p: proRolePrem) => p.role === "Viewer")
          ?.permissions.filter(
            (perm: $Enums.PPermission): perm is projectViewerPerm =>
              perm === "Comment",
          ) ?? [];
      const managerPerm: projectManagerPerm[] =
        perms
          .find((p: proRolePrem) => p.role === "Manager")
          ?.permissions.filter(
            (perm: $Enums.PPermission): perm is projectManagerPerm =>
              perm === "Invite" ||
              perm === "Remove_Member" ||
              perm === "Edit_Project_Details",
          ) ?? [];
      const p: projectSlugProps = {
        ...project,
        avatar: project.avatar ?? undefined,
        role,
        permissions: {
          manager: managerPerm,
          contributor: contributorPerm,
          viewer: viewerPerm,
        },
        joinedAt: userProject?.joinedAt ?? undefined,
      };
      return Response.json({ ...p }, { status: 200 });
    } catch {
      return apiError("Something went wrong", 500);
    }
  },
);
