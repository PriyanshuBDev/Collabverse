import { commentReactionProps, CompleteCommentProps } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { commentReplyPrivew } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { Prisma } from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";
import { User } from "@supabase/supabase-js";
import z from "zod";
type rawCommentProps = {
  id: string;
  createdAt: Date;
  sentAt: Date;
  replyPreview: JsonValue;
  commentedById: string | null;
  reactions: {
    reaction: string;
    reactedById: string;
  }[];
  _count: {
    receipts: number;
  };
  receipts: {
    userId: string;
    seenAt: Date | null;
  }[];
  comment: string;
  replyToCommentId: string | null;
  commentedBy: {
    projectMember: {
      workspaceMember: {
        user: {
          id: string;
          name: string | null;
          avatar: string | null;
          username: string | null;
        };
      };
    };
  } | null;
};
export const getCommentsSchema = z.object({
  mode: z.enum(["latest", "before", "after", "around"]),
  cursor: z.uuid().optional(),
});
export const GET = withAuth(
  async (
    user: User,
    req: Request,
    {
      params,
    }: {
      params: { id: string; projectId: string; taskId: string };
    },
  ) => {
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;

    if (!workspaceId || !taskId || !projectId) {
      return apiErrorCustom("Invalid parameters");
    }
    const { searchParams } = new URL(req.url);
    const queryObj = Object.fromEntries(searchParams.entries());
    const limit = 50;
    try {
      const { cursor, mode } = getCommentsSchema.parse(queryObj);
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
      const select = {
        id: true,
        comment: true,
        createdAt: true,
        sentAt: true,
        receipts: {
          take: 1,
          select: {
            seenAt: true,
            userId: true,
          },
        },
        commentedById: true,
        commentedBy: {
          select: {
            projectMember: {
              select: {
                workspaceMember: {
                  select: {
                    user: {
                      select: {
                        id: true,
                        name: true,
                        avatar: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        reactions: {
          select: {
            reaction: true,
            reactedById: true,
          },
        },
        replyPreview: true,
        replyToCommentId: true,

        _count: {
          select: {
            receipts: {
              where: {
                userId: user.id,
                seenAt: { not: null },
              },
            },
          },
        },
      };

      const where: Prisma.CommentWhereInput = {
        taskId,
        isDeleted: false,
        sentAt: {
          gte: membership.joinedAt,
        },
      };
      let rawComments: rawCommentProps[] = [];
      let topCursor: string | null = null;
      let bottomCursor: string | null = null;
      let hasOlder: boolean = false;
      let hasNewer: boolean = false;
      const handleAround = async (id: string | undefined) => {
        const res = await prisma.comment.findFirst({
          where: {
            ...where,
            id,
          },
          select,
        });
        if (!res) return apiErrorCustom("Something went wrong");
        const topOfRes = await prisma.comment.findMany({
          where: {
            taskId,

            sentAt: {
              lte: res.sentAt,
              gte: membership.joinedAt,
            },

            isDeleted: false,
          },
          take: limit / 2 + 1,
          orderBy: [
            {
              sentAt: "desc",
            },
            { id: "desc" },
          ],
          select,
        });

        const bottomOfRes = await prisma.comment.findMany({
          where: {
            taskId,

            sentAt: {
              gte: res.sentAt,
            },

            isDeleted: false,
          },
          take: limit / 2 + 1,
          orderBy: [
            {
              sentAt: "asc",
            },
            { id: "asc" },
          ],
          select,
        });
        const topComments = topOfRes
          .reverse()
          .filter((comment: rawCommentProps) => comment.id !== res.id)
          .slice(-limit / 2);

        const bottomComments = bottomOfRes
          .filter((comment: rawCommentProps) => comment.id !== res.id)
          .slice(0, limit / 2);

        rawComments = [...topComments, res, ...bottomComments];
        if (topOfRes.length > limit / 2) {
          const nextItem = topOfRes.pop();
          topCursor = nextItem!.id;
          hasOlder = true;
        }
        if (bottomOfRes.length > limit / 2) {
          const nextItem = bottomOfRes.pop();
          bottomCursor = nextItem!.id;
          hasNewer = true;
        }
      };
      if (mode === "latest") {
        const res = await prisma.comment.findFirst({
          where: {
            taskId,
            sentAt: {
              gte: membership.joinedAt,
            },
            isDeleted: false,
            receipts: {
              none: {
                userId: user.id,
              },
            },
          },
          orderBy: [
            {
              sentAt: "asc",
            },
            { id: "asc" },
          ],
          select: {
            id: true,
          },
        });
        if (!res) {
          const comments = await prisma.comment.findMany({
            where,
            orderBy: [
              {
                sentAt: "desc",
              },
              { id: "desc" },
            ],
            take: limit + 1,
            select,
          });
          const returned = comments.slice(0, limit);
          rawComments = returned.reverse();
          if (comments.length > limit) {
            topCursor = returned[returned.length - 1].id;
            hasOlder = true;
          }
        } else {
          await handleAround(res.id);
        }
      } else if (mode === "around") {
        await handleAround(cursor);
      } else if (mode === "after") {
        const res = await prisma.comment.findMany({
          where,
          take: limit + 1,
          skip: cursor ? 1 : 0,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            {
              sentAt: "asc",
            },
            { id: "asc" },
          ],
          select,
        });
        rawComments = res.slice(0, limit);
        if (res.length > limit) {
          const nextItem = res.pop();
          bottomCursor = nextItem!.id;
          hasNewer = true;
        }
      } else {
        const res = await prisma.comment.findMany({
          where,
          take: limit + 1,
          skip: cursor ? 1 : 0,
          cursor: cursor
            ? {
                id: cursor,
              }
            : undefined,
          orderBy: [
            {
              sentAt: "desc",
            },
            { id: "desc" },
          ],
          select,
        });
        const page = res.slice(0, limit);
        hasOlder = res.length > limit;
        topCursor = hasOlder ? (page[page.length - 1]?.id ?? null) : null;

        rawComments = res.reverse();
      }
      const comments = messageBuilder(rawComments, user.id);
      return Response.json({
        comments,
        topCursor,
        bottomCursor,
        hasNewer,
        hasOlder,
      });
    } catch (e) {
      console.error(e);
      return zodApiError(e);
    }
  },
);

function messageBuilder(
  raw: rawCommentProps[],
  userId: string,
): CompleteCommentProps[] {
  const comments: CompleteCommentProps[] = raw.map((r: rawCommentProps) => {
    const reactions = Object.values(
      r.reactions.reduce<Record<string, commentReactionProps>>((acc, cur) => {
        if (!acc[cur.reaction]) {
          acc[cur.reaction] = {
            emoji: cur.reaction,
            reactedBy: [],
          };
        }
        acc[cur.reaction].reactedBy.push(cur.reactedById);
        return acc;
      }, {}),
    );
    const replyPreview = r.replyPreview as commentReplyPrivew | null;
    return {
      id: r.id,
      comment: r.comment,
      createdAt: r.createdAt,
      sentAt: r.sentAt,
      user: {
        id: r.commentedBy?.projectMember.workspaceMember.user.id,
        name:
          r.commentedBy?.projectMember.workspaceMember.user.name ??
          "Former Member",
        avatar:
          r.commentedBy?.projectMember.workspaceMember.user.avatar ?? undefined,
      },
      isReadByMe: r.commentedById === userId ? true : r._count.receipts > 0,
      replyTo: replyPreview
        ? {
            commentId: replyPreview.id,
            ...replyPreview,
          }
        : undefined,
      reactions,
      replyToCommentId: r.replyToCommentId ?? undefined,
    };
  });
  return comments;
}
