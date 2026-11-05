import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { hashToken } from "@/lib/functions/invitation/hashToken";
import { hasPermInWorkspace } from "@/lib/serviceLayer/workspace/hasPermInWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; token: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const token = params.token;
    if (!workspaceId || !token) {
      return new Response("Invalid parameters", { status: 400 });
    }
    try {
      const tokenHash = await hashToken(token);
      const invitation = await prisma.invitation.findUnique({
        where: {
          tokenHash,
        },
        select: {
          status: true,
          id: true,
          expireAt: true,
          maxUses: true,
          usedCount: true,
          role: true,
          createdById: true,
        },
      });
      if (!invitation) {
        return apiErrorCustom("Invitation not found");
      }
      if (
        invitation.role === "Manager" ||
        invitation.role === "Contributor" ||
        invitation.role === "Viewer"
      ) {
        return apiErrorCustom("Invalid Invitation");
      }
      if (!invitation.createdById) {
        return apiErrorCustom("Invitation revoked");
      }
      if (invitation.status === "Revoked") {
        return apiErrorCustom("Invitation revoked");
      }
      if (invitation.maxUses && invitation.usedCount >= invitation.maxUses) {
        return apiError("Invitation usages exhausted", 400);
      }
      if (invitation.expireAt && invitation.expireAt <= new Date()) {
        return apiErrorCustom("Invitation expired");
      }
      const createdByRole = await wsRole(invitation.createdById, workspaceId);
      if (!createdByRole) {
        return apiErrorCustom("Invitation revoked");
      }
      if (createdByRole !== "Owner") {
        if (invitation.role === "Admin") {
          return apiErrorCustom("Invalid Invitation");
        }
        const hasPermToInvite = await hasPermInWorkspace(
          createdByRole,
          "Invite",
          workspaceId,
        );
        if (!hasPermToInvite) {
          return apiErrorCustom("Invitation revoked");
        }
      }

      const alreadyMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          userId: true,
        },
      });
      if (alreadyMember) {
        return apiErrorCustom("Already a member");
      }
      const existingRequest = await prisma.joinRequest.findUnique({
        where: {
          userId_invitationId: {
            userId: user.id,
            invitationId: invitation.id,
          },
        },
        select: {
          status: true,
        },
      });
      if (
        existingRequest &&
        (existingRequest.status === "Approved" ||
          existingRequest.status === "Pending")
      ) {
        return apiErrorCustom("Join request alredy exist");
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        await tx.joinRequest.create({
          data: {
            invitationId: invitation.id,
            userId: user.id,
            role: invitation.role,
            workspaceId,
          },
        });
        await tx.invitation.update({
          where: {
            id: invitation.id,
          },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      });
      return Response.json({ success: true }, { status: 200 });
    } catch {
      return new Response("Something went wrong", { status: 500 });
    }
  },
);
