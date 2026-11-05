import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { deleteGroup } from "@/lib/serviceLayer/conversation/deleteGroup";
import { groupRole } from "@/lib/serviceLayer/conversation/groupRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { $Enums } from "@prisma/client";
import { User } from "@supabase/supabase-js";
type userIdRoleProp = {
  role: $Enums.GroupRole | null;
  userId: string;
};
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; conversationId: string } },
  ) => {
    const workspaceId = params.id;
    const conversationId = params.conversationId;

    if (!workspaceId || !conversationId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const currentUserGroupRole = await groupRole(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!currentUserGroupRole) {
        return apiErrorCustom("You are not authorised");
      }
      const now = new Date();
      const members = await prisma.conversationMember.findMany({
        where: {
          conversationId,
          workspaceId,
          leftAt: null,
          deletedAt: null,
          kickedAt: null,
          status: "Active",
          userId: {
            not: user.id,
          },
        },
        select: {
          userId: true,
          role: true,
        },
      });
      if (members.length === 0) {
        await deleteGroup(workspaceId, conversationId, user.id);
        return Response.json({ success: true });
      }
      if (currentUserGroupRole !== "Member") {
        const admins = members.filter(
          (m: userIdRoleProp) => m.role === "Admin",
        );
        if (admins.length === 0) {
          await prisma.$transaction(async (tx: prismaTransactionProp) => {
            await tx.conversationMember.update({
              where: {
                userId_conversationId: {
                  userId: user.id,
                  conversationId,
                },
              },
              data: {
                leftAt: now,
                clearedAt: now,
                status: "Left",
                lastReadMessageId: null,
              },
            });
            const randomUser =
              members[Math.floor(Math.random() * members.length)].userId;
            await tx.conversationMember.update({
              where: {
                userId_conversationId: {
                  userId: randomUser,
                  conversationId,
                },
              },
              data: {
                role: "Admin",
              },
            });
          });
          return Response.json({ success: true });
        }
      }
      await prisma.conversationMember.update({
        where: {
          userId_conversationId: {
            userId: user.id,
            conversationId,
          },
        },
        data: {
          leftAt: now,
          clearedAt: now,
          status: "Left",
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
