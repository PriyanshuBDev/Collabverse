import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { hasPermInWorkspace } from "@/lib/serviceLayer/workspace/hasPermInWorkspace";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
const usernameInvitationSchema = z.object({
  status: z.enum(["Accept", "Decline"]),
});
export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; invitationId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const invitationId = params.invitationId;
    if (!workspaceId || !invitationId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const { status } = usernameInvitationSchema.parse(data);
      const invitation = await prisma.invitation.findFirst({
        where: {
          id: invitationId,
          workspaceId,
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
      if (invitation.status === "Rejected") {
        return apiErrorCustom("Invalid Invitation");
      }
      if (invitation.status === "Accepted") {
        return apiErrorCustom("Invitation already accepted");
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
      const alreadyMember = await wsRole(user.id, workspaceId);
      if (alreadyMember) {
        return apiErrorCustom("Already a member");
      }
      if (status === "Accept") {
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
              invitationId,
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
              status: "Accepted",
            },
          });
        });
      } else {
        await prisma.invitation.update({
          where: {
            id: invitation.id,
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
