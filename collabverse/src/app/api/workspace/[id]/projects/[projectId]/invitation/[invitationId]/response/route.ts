import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import {
  apiError,
  apiErrorCustom,
  zodApiError,
} from "@/lib/functions/error/apiError";
import { hasPermInProject } from "@/lib/serviceLayer/project/hasPermInProject";
import { projectRole } from "@/lib/serviceLayer/project/projectRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { PRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";

export const projectInvitationSchema = z.object({
  response: z.enum(["Accept", "Decline"]),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; projectId: string; invitationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const invitationId = params.invitationId;
    if (!workspaceId || !projectId || !invitationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { response } = projectInvitationSchema.parse(body);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiError(
          "You have to be a member of the workspace to join a project inside.",
          403,
        );
      }
      const isAlreadyMember = await projectRole(
        user.id,
        workspaceId,
        projectId,
      );
      if (isAlreadyMember) {
        return apiError("You are already a member of the project", 400);
      }
      const invitation = await prisma.invitation.findFirst({
        where: {
          id: invitationId,
          workspaceId,
          projectId,
        },
        select: {
          status: true,
          expireAt: true,
          invitedUserId: true,
          createdById: true,
          role: true,
          requireApproval: true,
        },
      });
      if (!invitation) {
        return apiErrorCustom("Invitation not found");
      }
      if (!invitation.createdById) {
        // checks if user account is deleted
        return apiErrorCustom("Invitation revoked");
      }
      if (invitation.invitedUserId !== user.id) {
        return apiErrorCustom("Invalid Invitation");
      }
      if (invitation.role === "Admin" || invitation.role === "Member") {
        return apiErrorCustom("Invalid Invitation");
      }
      if (
        invitation.expireAt &&
        new Date(invitation.expireAt).getTime() <= new Date().getTime()
      ) {
        return apiErrorCustom("Invitation expired");
      }
      if (invitation.status === "Accepted") {
        return apiErrorCustom("Invitation already accepted");
      }
      if (invitation.status === "Revoked") {
        return apiErrorCustom("Invitation revoked");
      }
      if (invitation.status !== "Pending") {
        return apiErrorCustom("Invalid Invitation");
      }
      if (invitation.requireApproval === true) {
        return apiErrorCustom("Invalid Invitation");
      }
      const createdByWsRole = await wsRole(invitation.createdById, workspaceId);
      if (!createdByWsRole) {
        // checks if user is member of the workspace
        return apiErrorCustom("Invitation revoked");
      }
      if (createdByWsRole !== "Owner" && createdByWsRole !== "Admin") {
        // checks is user has permission to invite at theis moment
        const createdByProjectRole = await projectRole(
          invitation.createdById,
          workspaceId,
          projectId,
        );
        if (!createdByProjectRole) {
          return apiErrorCustom("Invitation revoked");
        }
        if (createdByProjectRole === "Viewer") {
          return apiErrorCustom("Invitation revoked");
        }
        const hasPermToInvite = await hasPermInProject(
          createdByProjectRole,
          "Invite",
          projectId,
        );
        if (!hasPermToInvite) {
          return apiErrorCustom("Invitation revoked");
        }
        if (invitation.role === createdByProjectRole) {
          return apiErrorCustom("Invalid Invitation");
        }
      }
      if (response === "Accept") {
        await prisma.$transaction(async (tx: prismaTransactionProp) => {
          await tx.projectMember.create({
            data: {
              role: invitation.role as PRole, // other roles are already cancelled out above
              workspaceMemberUserId: user.id,
              workspaceMemberWsId: workspaceId,
              projectId,
            },
          });
          await tx.invitation.update({
            where: {
              id: invitationId,
            },
            data: {
              status: "Accepted",
            },
          });
        });
        try {
          await prisma.activity.create({
            data: {
              workspaceId,
              projectId,
              actorUserId: invitation.createdById,
              affectedUserId: user.id,
              type: "project_member_added",
              meta: {
                role: invitation.role,
              },
            },
          });
        } catch (e) {
          console.error("Failed to log activity", e);
        }
      } else {
        await prisma.invitation.update({
          where: {
            id: invitationId,
          },
          data: {
            status: "Rejected",
          },
        });
      }

      return Response.json({ success: true }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
