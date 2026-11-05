import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { deleteGroup } from "@/lib/serviceLayer/conversation/deleteGroup";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
type userIdProp = {
  userId: string;
};
export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; conversationId: string }> },
  ) => {
    const params = await paramsPromise;
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
      const currentUserGroup = await prisma.conversationMember.findFirst({
        where: {
          conversation: {
            type: "Group",
          },
          workspaceId,
          conversationId,
          userId: user.id,
          status: "Active",
          kickedAt: null,
          deletedAt: null,
          leftAt: null,
        },
        select: {
          conversation: {
            select: {
              name: true,
            },
          },
          role: true,
        },
      });
      if (!currentUserGroup || currentUserGroup.role !== "Admin") {
        return apiErrorCustom("You are not authorised");
      }
      const memberIds = (
        await prisma.conversationMember.findMany({
          where: {
            workspaceId,
            conversationId,
            status: "Active",
            kickedAt: null,
            deletedAt: null,
            userId: {
              not: user.id,
            },
          },
          select: {
            userId: true,
          },
        })
      ).map((m: userIdProp) => m.userId);
      if (memberIds.length === 0) {
        await deleteGroup(workspaceId, conversationId, user.id);
      } else {
        await deleteGroup(
          workspaceId,
          conversationId,
          user.id,
          currentUserGroup.conversation.name ?? undefined,
          memberIds,
        );
      }
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
