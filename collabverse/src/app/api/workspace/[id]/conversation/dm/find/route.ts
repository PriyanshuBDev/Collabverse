import { basicMember } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { createDmKey } from "@/lib/functions/conversation/createDmKey";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
import z from "zod";
const userIdSchema = z.object({
  userId: z.uuid(),
});
export const GET = withAuth(
  async (user: User, req: Request, { params: paramsPromise }: { params: Promise<{ id: string }> }) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    if (!workspaceId) {
      return apiErrorCustom("Invalid parameters");
    }
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const currentUserId = user.id;
    try {
      const { userId } = userIdSchema.parse(queryObj);
      if (userId === currentUserId) {
        return apiErrorCustom("Invalid data");
      }
      const dmKey = createDmKey(currentUserId, userId);
      const convoExist = await prisma.conversation.findUnique({
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
      const res = await prisma.workspaceMember.findUnique({
        where: {
          userId_workspaceId: {
            userId,
            workspaceId,
          },
        },
        select: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      });
      if (!res) {
        return apiErrorCustom("User not a member");
      }
      const otheruser: basicMember = {
        id: res.user.id,
        name: res.user.name ?? "unknown",
        avatar: res.user.avatar ?? undefined,
      };
      return Response.json({ user: otheruser, conversatinId: convoExist?.id });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
