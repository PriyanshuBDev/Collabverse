import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { convoMembership } from "@/lib/serviceLayer/conversation/convoMembership";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
const messageDeleteSchema = z.object({
  method: z.enum(["Self", "All"]),
});
export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string; messageId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const messageId = params.messageId;
    if (!workspaceId || !conversationId || !messageId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { method } = messageDeleteSchema.parse(body);
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) return apiErrorCustom("You are not authorised");
      const membership = await convoMembership(
        workspaceId,
        conversationId,
        user.id,
      );
      if (!membership) return apiErrorCustom("You are not authorised");
      const msg = await prisma.message.findFirst({
        where: {
          id: messageId,
          workspaceId,
          conversationId,
        },
        select: {
          senderId: true,
        },
      });
      if (!msg) {
        return apiErrorCustom("Message not found");
      }
      if (method === "All") {
        if (msg.senderId !== user.id) {
          return apiErrorCustom("You are not authorised");
        }
        await prisma.message.update({
          where: {
            id: messageId,
          },
          data: {
            isDeleted: true,
          },
        });
        await prisma.messagePin.delete({
          where: {
            messageId,
          },
        });
      } else {
        await prisma.messageDeletion.create({
          data: {
            messageId,
            userId: user.id,
            conversationId,
          },
        });
      }
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
