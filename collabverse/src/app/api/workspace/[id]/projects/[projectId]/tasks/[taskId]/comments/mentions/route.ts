import { commentMentions } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
type mentionProp = {
  id: string;
  createdAt: Date;
  mentionedUserId: string;
  seen: boolean;
  commentId: string;
};
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;

    if (!workspaceId || !taskId || !projectId) {
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
      const res = await prisma.commentMention.findMany({
        where: {
          taskId,
          mentionedUserId: user.id,
          seen: false,
          createdAt: {
            gte: membership.joinedAt,
          },
        },
        select: {
          id: true,
          commentId: true,
          seen: true,
          mentionedUserId: true,
          createdAt: true,
        },
      });
      const mentions: commentMentions[] = res.map((m: mentionProp) => ({
        id: m.id,
        commentId: m.commentId,
        seen: m.seen,
        mentionedUserId: m.mentionedUserId,
        createdAt: m.createdAt,
      }));
      return Response.json({ mentions });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
