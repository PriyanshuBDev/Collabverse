import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: { params: Promise<{ id: string; conversationId: string; callId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const callId = params.callId;
    if (!workspaceId || !conversationId || !callId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const currentUserWsRole = await wsRole(user.id, workspaceId);
      if (!currentUserWsRole) {
        return apiErrorCustom("You are not authorised");
      }

      const membership = await prisma.conversationMember.findFirst({
        where: {
          workspaceId,
          conversationId,
          userId: user.id,
          deletedAt: null,
          kickedAt: null,
          leftAt: null,
        },
        select: {
          conversation: {
            select: {
              type: true,
            },
          },
        },
      });
      if (!membership) {
        return apiErrorCustom("You are not authorised");
      }
      if (membership.conversation.type === "Group") {
        return apiErrorCustom("You can not call in a group");
      }
      const call = await prisma.callSession.findUnique({
        where: {
          id: callId,
        },
        select: {
          maxParticipants: true,
          _count: {
            select: {
              participants: true,
            },
          },
        },
      });
      if (!call) {
        return apiErrorCustom("Call not found");
      }
      if (
        call.maxParticipants &&
        call.maxParticipants <= call._count.participants
      ) {
        return apiErrorCustom("Participation limit reached");
      }
      await prisma.callParticipant.create({
        data: {
          workspaceId,
          userId: user.id,
          callSessionId: callId,
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
