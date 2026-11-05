import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiError, apiErrorCustom } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

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
      if (!currentUserWsRole) return apiErrorCustom("You are not authorised");
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) return apiErrorCustom("You are not authorised");

      const { count } = await prisma.messagePin.deleteMany({
        where: {
          conversationId,
        },
      });
      if (count === 0) {
        return apiError("No pinned messages exist", 409);
      }
      return Response.json({ success: true });
    } catch (e: unknown) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
