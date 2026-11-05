import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { User } from "@supabase/supabase-js";
import { groupRole } from "@/lib/serviceLayer/conversation/groupRole";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
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
        },
      });
      return Response.json({ length: members.length });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
