import { prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom } from "@/lib/functions/error/apiError";
import { User } from "@supabase/supabase-js";
type idPorp = {
  id: string;
};
export const PATCH = withAuth(
  async (
    user: User,
    req: Request,
    { params }: { params: { id: string; projectId: string; taskId: string } },
  ) => {
    const workspaceId = params.id;
    const taskId = params.taskId;
    const projectId = params.projectId;

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

      await prisma.$transaction(async (tx: prismaTransactionProp) => {
        const commentIds = (
          await tx.comment.findMany({
            where: {
              taskId,

              commentedById: {
                not: user.id,
              },
              sentAt: {
                gte: membership.joinedAt,
              },
              receipts: {
                none: {
                  userId: user.id,
                  seenAt: {
                    not: null,
                  },
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
            select: {
              id: true,
            },
          })
        ).map((m: idPorp) => m.id);
        const date = new Date();
        await tx.commentReceipt.createMany({
          data: commentIds.map((id: string) => ({
            commentId: id,
            userId: user.id,
            deliveredAt: date,
            seenAt: date,
            taskId,
          })),
        });
        await tx.commentMention.updateMany({
          where: {
            mentionedUserId: user.id,
            taskId,
            seen: false,
          },
          data: {
            seen: true,
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
