import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import { addSeconds } from "date-fns";
import z from "zod";
const activeConversationSchema = z.object({
  conversationId: z.uuid(),
});
export const POST = withAuth(
  async (user: User, req: Request, { params }: { params: { id: string } }) => {
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { conversationId } = activeConversationSchema.parse(body);
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      await prisma.workspaceMember.update({
        where: {
          userId_workspaceId: {
            workspaceId,
            userId: user.id,
          },
        },
        data: {
          activeConversationId: conversationId,
          activeConvoExpiresAt: addSeconds(new Date(), 60),
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
