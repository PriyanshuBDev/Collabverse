import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const DELETE = withAuth(
  async (
    user: User,
    req: Request,
    {
      params: paramsPromise,
    }: {
      params: Promise<{
        id: string;
        projectId: string;
        taskId: string;
        commentId: string;
      }>;
    },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    const commentId = params.commentId;

    if (!workspaceId || !taskId || !commentId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    try {
      const membership = await prisma.taskMember.findFirst({
        where: {
          projectMemberUserId: user.id,
          workspaceId,
          projectId,
          taskId,
        },
        select: {
          role: true,
          joinedAt: true,
        },
      });
      if (!membership) return apiErrorCustom("You are not authorised");

      const msg = await prisma.comment.findFirst({
        where: {
          id: commentId,
          taskId,
          sentAt: {
            gte: membership.joinedAt,
          },
        },
        select: {
          id: true,
        },
      });
      if (!msg) {
        return apiErrorCustom("Comment not found");
      }
      await prisma.comment.delete({
        where: {
          id: commentId,
        },
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
