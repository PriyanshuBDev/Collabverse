import { CompleteCommentProps, prismaTransactionProp } from "@/app/interfaces";
import { withAuth } from "@/lib/api/auth/withAuth";
import { prisma } from "@/lib/db/prisma";
import { apiErrorCustom, zodApiError } from "@/lib/functions/error/apiError";
import { commentReplyPrivew } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { User } from "@supabase/supabase-js";
import z from "zod";

export const createCommentSchema = z.object({
  comment: z.object({
    clientId: z.uuid(),
    replyToCommentId: z.string().nullable(),
    comment: z.string(),
    mentions: z.array(z.string()),
    createdAt: z.coerce.date(),
  }),
});

export const POST = withAuth(
  async (
    user: User,
    req: Request,
    { params: paramsPromise }: { params: Promise<{ id: string; projectId: string; taskId: string }> },
  ) => {
    const params = await paramsPromise;
    const workspaceId = params.id;
    const projectId = params.projectId;
    const taskId = params.taskId;
    if (!workspaceId || !projectId || !taskId) {
      return apiErrorCustom("Invalid parameters");
    }
    const data = await req.json();
    try {
      const { comment } = createCommentSchema.parse(data);
      const task = await prisma.task.findFirst({
        where: {
          id: taskId,
          workspaceId,
          projectId,
        },
        select: {
          slug: true,
          name: true,
          project: {
            select: {
              slug: true,
              name: true,
            },
          },
        },
      });
      if (!task) {
        return apiErrorCustom("Task not found");
      }
      const membership = await prisma.taskMember.findUnique({
        where: {
          projectMemberUserId_taskId: {
            projectMemberUserId: user.id,
            taskId,
          },
        },
        select: {
          role: true,
          workspaceId: true,
          projectId: true,
        },
      });
      if (
        !membership ||
        membership.projectId !== projectId ||
        membership.workspaceId !== workspaceId
      ) {
        return apiErrorCustom("You are not authorised");
      }
      let reply: commentReplyPrivew | null = null;
      if (comment.replyToCommentId) {
        const res = await prisma.comment.findFirst({
          where: {
            id: comment.replyToCommentId,
            taskId,
          },
          select: {
            id: true,
            comment: true,
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
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        });
        if (!res) {
          return apiErrorCustom("Invalid data");
        }
        reply = {
          id: res.id,
          comment: res.comment,
          commentedBy: {
            id:
              res.commentedBy?.projectMember.workspaceMember.user.id ??
              undefined,
            name:
              res.commentedBy?.projectMember.workspaceMember.user.name ??
              "unknown",
          },
        };
      }

      if (comment.mentions.length > 0) {
        const mentions = await prisma.taskMember.findMany({
          where: {
            taskId,
            projectMemberUserId: {
              in: comment.mentions,
              not: user.id,
            },
          },
        });
        if (mentions.length !== comment.mentions.length) {
          return apiErrorCustom("Invalid data");
        }
      }
      const mentions = [
        ...new Set(comment.mentions.filter((m: string) => m !== user.id)),
      ];
      const { commentData } = await prisma.$transaction(
        async (tx: prismaTransactionProp) => {
          const commentData = await tx.comment.create({
            data: {
              id: comment.clientId,
              taskId,
              comment: comment.comment,
              replyPreview: reply ?? undefined,
              createdAt: comment.createdAt,
              receipts: {
                create: {
                  userId: user.id,
                  taskId,
                },
              },
              commentedById: user.id,
            },
            select: {
              id: true,
              comment: true,
              replyPreview: true,
              createdAt: true,
              sentAt: true,
              replyToCommentId: true,
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
            },
          });

          if (mentions.length > 0) {
            await tx.commentMention.createMany({
              data: mentions.map((m: string) => ({
                commentId: comment.clientId,
                mentionedUserId: m,
                taskId,
              })),
            });
          }
          return {
            commentData,
          };
        },
      );

      const commentToReturn: CompleteCommentProps = {
        id: commentData.id,
        comment: commentData.comment,
        createdAt: commentData.createdAt,
        sentAt: commentData.sentAt,
        user: {
          id: commentData.commentedBy?.projectMember.workspaceMember.user.id,
          name:
            commentData.commentedBy?.projectMember.workspaceMember.user.name ??
            "Former Member",
          avatar:
            commentData.commentedBy?.projectMember.workspaceMember.user
              .avatar ?? undefined,
        },
        isReadByMe: true,
        replyTo: reply
          ? {
              commentId: reply.id,
              ...reply,
            }
          : undefined,
        reactions: [],
        replyToCommentId: commentData.replyToCommentId ?? undefined,
      };
      if (mentions.length > 0) {
        try {
          await prisma.notification.createMany({
            data: mentions.map((m: string) => ({
              userId: m,
              type: "mentioned_in_task",
              senderId: user.id,
              workspaceId,
              projectId,
              target: {
                name: task.name,
              },
              meta: {
                projectName: task.project.name,
                projectSlug: task.project.slug,
                taskSlug: task.slug,
              },
            })),
          });
        } catch (e) {
          console.error("Failed to create notifications", e);
        }
        try {
          await prisma.activity.createMany({
            data: mentions.map((m: string) => ({
              workspaceId,
              taskId,
              projectId,
              type: "task_mentioned",
              actorUserId: user.id,
              affectedUserId: m,
            })),
          });
        } catch (e) {
          console.error("Failed to create activities", e);
        }
      }
      return Response.json({ comment: commentToReturn });
    } catch (e) {
      return zodApiError(e);
    }
  },
);
