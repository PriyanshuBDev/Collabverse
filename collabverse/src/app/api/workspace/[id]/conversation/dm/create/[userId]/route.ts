import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createDmKey } from "@/lib/functions/conversation/createDmKey";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { reviveBothDmUser } from "@/lib/serviceLayer/conversation/reviveBothDmUser";
import { wsRole } from "@/lib/serviceLayer/workspace/wsRole";
import { User } from "@supabase/supabase-js";

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; userId: string } },
  ) => {
    const workspaceId = params.id;
    const otherUserId = params.userId;
    if (!workspaceId || !otherUserId) {
      return apiErrorCustom("Invalid parameters");
    }
    if (user.id === otherUserId) {
      return apiErrorCustom("You cannot create a conversation with yourself");
    }
    try {
      const userWsRole = await wsRole(user.id, workspaceId);
      if (!userWsRole) {
        return apiErrorCustom("You are not authorised");
      }
      const otherUserRole = await wsRole(otherUserId, workspaceId);
      if (!otherUserRole) {
        return apiErrorCustom("User not a member");
      }
      const dmKey = createDmKey(user.id, otherUserId);
      const alreadyExist = await prisma.conversation.findUnique({
        where: {
          workspaceId_dmKey: {
            workspaceId,
            dmKey,
          },
        },
        select: {
          id: true,
        },
      });
      if (alreadyExist) {
        await reviveBothDmUser({
          conversationId: alreadyExist.id,
          workspaceId,
        });
        return Response.json({ conversationId: alreadyExist.id });
      }
      const res = await prisma.conversation.create({
        data: {
          type: "Dm",
          workspaceId,
          conversationMember: {
            createMany: {
              data: [
                { userId: user.id, workspaceId },
                { userId: otherUserId, workspaceId },
              ],
            },
          },
          createdById: user.id,
          dmKey,
        },
        select: {
          id: true,
        },
      });
      return Response.json({ conversationId: res.id });
    } catch {
      return apiErrorCustom("Something went wrong");
    }
  },
);
