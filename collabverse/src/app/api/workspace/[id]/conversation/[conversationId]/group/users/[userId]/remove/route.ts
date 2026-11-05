import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

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
    if (user.id === userId) {
      return apiErrorCustom("You cannot change your own role");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const currentUserGroup = await prisma.conversationMember.findFirst({
        where: {
          conversation: {
            type: "Group",
          },
          workspaceId,
          conversationId,
          userId,
          status: "Active",
          kickedAt: null,
          deletedAt: null,
          leftAt: null,
        },
        select: {
          role: true,
          conversation: {
            select: {
              name: true,
            },
          },
        },
      });
      if (!currentUserGroup || currentUserGroup.role === "Member") {
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
              status: "Kicked",
              kickedAt: new Date(),
              clearedAt: new Date(),
              mutedAt: null,
              mutedFor: null,
              pinIndex: null,
              lastReadMessageId: null,
            },
          });
        });
      } catch (e) {
        if (e instanceof Error && e.message === "User_not_found") {
          return apiErrorCustom("User not found");
        }
        throw e;
      }
      try {
        await prisma.notification.create({
          data: {
            userId,
            senderId: user.id,
            type: "kicked_group",
            workspaceId,
            target: {
              name: currentUserGroup.conversation.name,
            },
          },
        });
      } catch (e) {
        console.error(e, "Failed to log notification");
      }
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
