import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { findProjectPermission } from "@/lib/functions/workspace/project/findProjecPermission";
import { inviteUserService } from "@/lib/serviceLayer/project/inviteUsersService";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { PRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type proIdRole = {
  id: string;
  role: "Manager" | "Contributor" | "Viewer";
};
const projectInvitaionSchema = z.object({
  users: z.array(
    z.object({
      id: z.uuid(),
      role: z.enum([PRole.Manager, PRole.Contributor, PRole.Viewer]),
    }),
  ),
  expireAt: z.coerce.date().optional(),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    if (!workspaceId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const { users, expireAt } = projectInvitaionSchema.parse(data);
      if (expireAt && expireAt <= new Date()) {
        return apiError("Expiration must be in the future", 400);
      }
      const memberShip = await prisma.projectMember.findUnique({
        where: {
          workspaceMemberUserId_workspaceMemberWsId_projectId: {
            workspaceMemberUserId: user.id,
            workspaceMemberWsId: workspaceId,
            projectId,
          },
        },
        select: {
          role: true,
          project: {
            select: {
              name: true,
              roles: {
                select: {
                  role: true,
                  permissions: true,
                },
              },
            },
          },
        },
      });
      if (!memberShip) {
        return apiErrorCustom("You are not authorised");
      }
      if (currentUserWsRole === "Member") {
        const projectRole = memberShip.role;
        if (!projectRole || projectRole === "Viewer") {
          return apiErrorCustom("You are not authorised");
        }
        if (projectRole !== "Owner") {
          const isThereManagerRole = !!users.find(
            (u: proIdRole) => u.role === "Manager",
          );
          if (isThereManagerRole) {
            return apiErrorCustom("You are not authorised");
          }
          const roles = memberShip.project.roles;
          if (projectRole === "Manager") {
            const managerPermToInvite = findProjectPermission({
              roles,
              role: "Manager",
              permission: "Invite",
            });

            if (!managerPermToInvite) {
              return apiErrorCustom("You are not authorised");
            }
          }
          if (projectRole === "Contributor") {
            const isThereContributorRole = !!users.find(
              (u: proIdRole) => u.role === "Contributor",
            );
            if (isThereContributorRole) {
              return apiErrorCustom("You are not authorised");
            }
            const contributorPermToInvite = findProjectPermission({
              roles,
              role: "Contributor",
              permission: "Invite",
            });
            if (!contributorPermToInvite) {
              return apiErrorCustom("You are not authorised");
            }
          }
        }
      }
      await inviteUserService({
        currentUserId: user.id,
        users,
        workspaceId,
        projectId,
        name: memberShip.project.name,
        expireAt,
        strict: true,
      });
      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
