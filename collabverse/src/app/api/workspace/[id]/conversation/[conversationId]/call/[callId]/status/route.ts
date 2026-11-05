import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { missedCallNotificationService } from "@/lib/serviceLayer/conversation/missedCallNotificaionService";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { CallStatus } from "@prisma/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
export const patchCallSessionSchema = z.object({
  status: z.enum(CallStatus),
});
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: { params: { id: string; conversationId: string; callId: string } },
  ) => {
    const workspaceId = params.id;
    const conversationId = params.conversationId;
    const callId = params.callId;
    if (!workspaceId || !conversationId || !callId) {
      return apiErrorCustom("Invalid parameters");
    }
    const body = await req.json();
    try {
      const { status } = patchCallSessionSchema.parse(body);
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
              name: true,
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
          type: true,
        },
      });
      if (!call) {
        return apiErrorCustom("Call not found");
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        if (status === "Active") {
          await tx.callParticipant.updateMany({
            where: {
              callSessionId: callId,
              leftAt: null,
            },
            data: {
              joinedAt: new Date(),
            },
          });
        } else if (status === "Ended") {
          await tx.callParticipant.updateMany({
            where: {
              callSessionId: callId,
              leftAt: null,
            },
            data: {
              leftAt: new Date(),
            },
          });
        } else if (
          status === "Missed" ||
          status === "Busy" ||
          status === "Cancelled"
        ) {
          await missedCallNotificationService(
            tx,
            conversationId,
            workspaceId,
            user.id,
            call.type,
            membership.conversation.name,
            callId,
          );
        }
        await tx.callSession.update({
          where: {
            id: callId,
          },
          data: {
            ...(status === "Active" && { startedAt: new Date() }),
            ...(status === "Ended" && { endedAt: new Date() }),
            status,
          },
        });
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);
