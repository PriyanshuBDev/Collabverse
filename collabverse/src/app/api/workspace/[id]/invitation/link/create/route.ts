import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, zodApiError } from "@/lib/functions/error/apiError";
import { generateInviteToken } from "@/lib/functions/invitation/generateInviteToken";
import { hashToken } from "@/lib/functions/invitation/hashToken";
import { findPermission } from "@/lib/functions/workspace/findPermission";
import { WsRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";

export const linkWsInviteSchema = z.object({
  maxUses: z.number().min(1).max(100),
  expireAt: z.coerce.date().optional(),
  role: z.enum([WsRole.Admin, WsRole.Member]),
});
export const POST = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiError("Invalid parameters", 400);
    }
    const data = await req.json();
    try {
      const currentUser = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: user.id,
            workspaceId,
          },
        },
        select: {
          role: true,
          workspace: {
            select: {
              slug: true,
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

      const memberPermToInvite = findPermission({
        roles: currentUser?.workspace.roles,
        role: "Member",
        permission: "Invite",
      });
      const adminPermToInvite = findPermission({
        roles: currentUser?.workspace.roles,
        role: "Admin",
        permission: "Invite",
      });
      if (
        !currentUser ||
        (currentUser.role === "Admin" && !adminPermToInvite) ||
        (currentUser.role === "Member" && !memberPermToInvite)
      ) {
        return apiError("You are not authorised", 403);
      }
      const { expireAt, role, maxUses } = linkWsInviteSchema.parse(data);
      if (currentUser.role !== "Owner" && role === "Admin") {
        return apiError("You are not authorised", 403);
      }
      if (expireAt && expireAt <= new Date()) {
        return apiError("Expiration must be in the future", 400);
      }
      const rawToken = generateInviteToken();
      const tokenHash = await hashToken(rawToken);
      await prisma.invitation.create({
        data: {
          workspaceId,
          createdById: user.id,
          role,
          expireAt,
          requireApproval: true,
          maxUses,
          tokenHash,
        },
      });
      const inviteUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/app/${currentUser.workspace.slug}/join/${rawToken}`;
      return Response.json({ inviteUrl }, { status: 200 });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
