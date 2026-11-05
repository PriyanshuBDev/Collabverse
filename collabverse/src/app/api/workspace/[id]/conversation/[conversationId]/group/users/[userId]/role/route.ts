import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { groupRole } from "@/lib/serviceLayer/conversation/groupRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { GroupRole } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const groupRoleSchema = z.object({
  role: z.enum([GroupRole.Admin, GroupRole.Member]),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string; userId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const userId = params.userId;
    if (!workspaceId || !conversationId || !userId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    if (user.id === userId) {
      return apiErrorCustom("You cannot change your own role");
    }
    try {
      const { role } = groupRoleSchema.parse(data);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const currentUserGroupRole = await groupRole(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!currentUserGroupRole || currentUserGroupRole === "Member") {
        return apiErrorCustom("You are not authorised");
      }
      try {
        await prisma.$transaction(async (tx: prismaTransactionProp) => {
          const userExists = await tx.conversationMember.findFirst({
            where: {
              workspaceId,
              conversationId,
              userId,
              kickedAt: null,
              status: "Active",
              deletedAt: null,
            },
            select: {
              userId: true,
            },
          });
          if (!userExists) {
            throw new Error("User_not_found");
          }
          await tx.conversationMember.update({
            where: {
              userId_conversationId: {
                userId,
                conversationId,
              },
            },
            data: {
              role,
            },
          });
        });
      } catch (e) {
        if (e instanceof Error && e.message === "User_not_found") {
          return apiErrorCustom("User not found");
        }
        throw e;
      }
      return Response.json({ success: true });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
