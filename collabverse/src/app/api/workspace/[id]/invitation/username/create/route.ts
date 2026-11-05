import { usernameSchema } from "@/app/api/auth/onboarding/route";
import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError } from "@/lib/functions/error/apiError";
import { invited_to_workspace_notification } from "@/lib/functions/notifications/notifications";
import { findPermission } from "@/lib/functions/workspace/findPermission";
import { WsRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z, { ZodError } from "zod";

export const usernameWsInviteSchema = z.object({
  username: usernameSchema,
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

      const { username, expireAt, role } = usernameWsInviteSchema.parse(data);
      if (currentUser.role !== "Owner" && role === "Admin") {
        return apiError("You are not authorised", 403);
      }
      if (expireAt && expireAt <= new Date()) {
        return apiError("Expiration must be in the future", 400);
      }
      const userExists = await prisma.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
        },
      });
      if (!userExists) {
        return apiError("User doesn't exists", 404);
      }
      if (userExists.id === user.id) {
        return apiError("You cannot send invitation to yourself", 400);
      }
      const alreadyMember = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId: userExists.id,
            workspaceId,
          },
        },
        select: {
          userId: true,
        },
      });
      if (alreadyMember) {
        return apiError("Already a member", 400);
      }
      const existingInvite = await prisma.invitation.findFirst({
        where: {
          workspaceId,
          invitedUserId: userExists.id,
          requireApproval: true,
          status: "Pending",
          OR: [
            { expireAt: null }, // never expires
            { expireAt: { gt: new Date() } }, // not expired yet
          ],
        },
        select: {
          id: true,
        },
      });
      if (existingInvite) {
        return apiError(
          "User already invited (you can only invite after the invitation is expired or user rejects)",
          400,
        );
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const res = await tx.invitation.create({
          data: {
            workspaceId,
            createdById: user.id,
            invitedUserId: userExists.id,
            role,
            expireAt,
            requireApproval: true,
          },
          select: {
            id: true,
          },
        });
        await invited_to_workspace_notification(
          tx,
          userExists.id,
          user.id,
          workspaceId,
          res.id,
          role,
          expireAt,
        );
      });
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
