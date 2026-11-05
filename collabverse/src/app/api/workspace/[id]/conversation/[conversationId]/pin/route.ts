import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";
import z from "zod";
const toggleConvoPinSchema = z.object({
  enabled: z.boolean(),
});

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
    const data = await req.json();
    try {
      const { enabled } = toggleConvoPinSchema.parse(data);
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
        },
        select: {
          conversationId: true,
          conversation: {
            select: {
              type: true,
            },
          },
          status: true,
          pinIndex: true,
        },
      });
      if (
        !membership ||
        (membership.conversation.type === "Group" &&
          membership.status !== "Active")
      ) {
        return apiErrorCustom("You are not authorised");
      }
      if (enabled && membership.pinIndex !== null) {
        return Response.json({ success: true });
      }

      if (!enabled && membership.pinIndex === null) {
        return Response.json({ success: true });
      }
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        let highestPinIndex = 0;
        if (enabled) {
          const highestPin = await tx.conversationMember.findFirst({
            where: {
              workspaceId,
              userId: user.id,
              leftAt: null,
              deletedAt: null,
              kickedAt: null,
              pinIndex: {
                not: null,
              },
            },
            orderBy: {
              pinIndex: "desc",
            },
            select: {
              pinIndex: true,
            },
          });
          highestPinIndex = (highestPin?.pinIndex ?? 0) + 1;
        }
        await tx.conversationMember.update({
          where: {
            userId_conversationId: {
              userId: user.id,
              conversationId,
            },
          },
          data: {
            pinIndex: enabled ? highestPinIndex : null,
          },
        });
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
