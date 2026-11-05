import { reactionSchema } from "@/app/api/workspace/[id]/conversation/[conversationId]/messages/[messageId]/reaction/route";
import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";

export const PATCH = withAuth(
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
    const data = await req.json();
    try {
      const { reaction } = reactionSchema.parse(data);
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
      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const exist = await tx.commentReaction.findUnique({
          where: {
            commentId_reactedById: {
              commentId,
              reactedById: user.id,
            },
          },
          select: {
            reaction: true,
          },
        });
        if (exist) {
          if (exist.reaction === reaction) {
            await tx.commentReaction.delete({
              where: {
                commentId_reactedById: {
                  commentId,
                  reactedById: user.id,
                },
              },
            });
          } else {
            await tx.commentReaction.update({
              where: {
                commentId_reactedById: {
                  commentId,
                  reactedById: user.id,
                },
              },
              data: {
                reaction,
              },
            });
          }
        } else {
          await tx.commentReaction.create({
            data: {
              reactedById: user.id,
              commentId,
              reaction,
              taskId,
            },
          });
        }
      });
      return Response.json({ success: true });
    } catch (e) {
      console.error(e);
      return apiErrorCustom("Something went wrong");
    }
  },
);
