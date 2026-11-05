import { useEffect } from "react";
import useCurrentUser from "../../useCurrentUser";
import { useCurrentWorkspace } from "../../useCurrentWorkspace";
import { useQueryClient } from "@tanstack/react-query";
import { useTaskCommentChannelRT } from "@/components/wrappers/TaskCommentProvider";
import {
  CommentDb,
  CommentMentionDb,
  CommentReactionDb,
  commentReplyPrivew,
  useCommentStore,
} from "../../zustand/Comments/useTaskCommentStore";
import { isDuplicateEvent } from "@/lib/functions/chat/isDuplicateEvent";
import {
  commentMentions,
  commentReplyProps,
  CompleteCommentProps,
  memberProps,
} from "@/app/interfaces";
import { useCurrentTask } from "../../useCurrentTask";
import { useAllTaskUsers } from "@/lib/queries/workspace/project/task/users/useAllTaskUsers";
import { useIsErrorToast } from "../../useIsErrorToast";
import { CommentReceipt } from "@prisma/client";
import { useCurrentProject } from "../../useCurrentProject";
import { scheduleUpdate } from "@/lib/functions/chat/scheduleUpdate";

export function useCommentRT(
  isNearBottomRef: React.RefObject<boolean>,
  scrollToBottomRef: React.RefObject<(() => void) | null>,
) {
  const { id: currentUserId } = useCurrentUser();
  const { id: taskId } = useCurrentTask();
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const queryClient = useQueryClient();
  const { channel, markReady } = useTaskCommentChannelRT();
  const { data, isLoading, isError, error } = useAllTaskUsers();
  useIsErrorToast(isError, "Failed to fetch comments", error);
  useEffect(() => {
    if (!channel || isLoading || !data) return;
    const { expandWindowDown } = useCommentStore.getState();
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "Comment",
        filter: `taskId=eq.${taskId}`,
      },
      async (payload) => {
        const commentPayload =
          payload.eventType === "DELETE"
            ? (payload.old as CommentDb)
            : (payload.new as CommentDb);
        if (
          isDuplicateEvent(payload.table, payload.eventType, commentPayload.id)
        )
          return;
        switch (payload.eventType) {
          case "INSERT": {
            const taskId = commentPayload.taskId;
            const sentBy: memberProps = data.members.find(
              (u: memberProps) => u.id === commentPayload.commentedById,
            ) ?? {
              id: commentPayload.commentedById,
              name: "unknown",
              avatar: undefined,
              username: "unknown",
            };
            if (sentBy.id === currentUserId) return;
            const comment: CompleteCommentProps = {
              id: commentPayload.id,
              comment: commentPayload.comment,
              createdAt: commentPayload.createdAt,
              sentAt: commentPayload.createdAt,
              reactions: [],
              user: sentBy,
              replyTo: commentPayload.replyPreview
                ? createCommentReplyTo(commentPayload.replyPreview)
                : undefined,
              isReadByMe: false,
              replyToCommentId: commentPayload.replyToCommentId ?? undefined,
            };
            scheduleUpdate(() => {
              const commentStore = useCommentStore.getState();
              commentStore.addCommentRT(taskId, comment, currentUserId);
              const task = useCommentStore.getState().tasks[taskId];
              if (!task) return;
              const isNearBottom = task.orderedIds.length - task.endIndex < 5;
              if (isNearBottom) {
                expandWindowDown(taskId, 1);
              }

              if (isNearBottomRef.current) {
                requestAnimationFrame(() => {
                  scrollToBottomRef.current?.();
                });
              }
            });
            break;
          }
          case "UPDATE": {
            const taskId = commentPayload.taskId;
            scheduleUpdate(() => {
              useCommentStore
                .getState()
                .updateComments(taskId, commentPayload.id, {
                  comment: commentPayload.comment ?? undefined,
                });
            });

            break;
          }
          case "DELETE": {
            const taskId = commentPayload.taskId;
            scheduleUpdate(() => {
              useCommentStore
                .getState()
                .deleteComment(taskId, commentPayload.id);
            });

            break;
          }
        }
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "CommentReaction",
        filter: `taskId=eq.${taskId}`,
      },
      async (payload) => {
        const data =
          payload.eventType === "DELETE"
            ? (payload.old as CommentReactionDb)
            : (payload.new as CommentReactionDb);
        if (data.reactedById === currentUserId) return;
        if (isDuplicateEvent(payload.table, payload.eventType, data.id)) return;
        scheduleUpdate(() => {
          useCommentStore.getState().handleUpdateRT(
            taskId,
            data.commentId,
            {
              type: "reaction",
              data,
              event: payload.eventType,
            },
            currentUserId,
          );
        });
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "CommentReceipt",
        filter: `taskId=eq.${taskId}`,
      },
      async (payload) => {
        const data =
          payload.eventType === "DELETE"
            ? (payload.old as CommentReceipt)
            : (payload.new as CommentReceipt);
        if (data.userId === currentUserId) return;
        if (isDuplicateEvent(payload.table, payload.eventType, data.id)) return;
        scheduleUpdate(() => {
          useCommentStore.getState().handleUpdateRT(
            taskId,
            data.commentId,
            {
              type: "receipt",
              data,
              event: payload.eventType,
            },
            currentUserId,
          );
        });
      },
    );
    channel.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "CommentMention",
        filter: `taskId=eq.${taskId}`,
      },
      async (payload) => {
        const data =
          payload.eventType === "DELETE"
            ? (payload.old as CommentMentionDb)
            : (payload.new as CommentMentionDb);
        if (isDuplicateEvent(payload.table, payload.eventType, data.id)) return;
        if (data.mentionedUserId === currentUserId) {
          if (payload.eventType === "INSERT") {
            queryClient.setQueryData<commentMentions[]>(
              [workspaceId, projectId, taskId, "comments", "mentions"],
              (oldData: commentMentions[] | undefined) => {
                if (!oldData) return oldData;

                return [
                  ...oldData,
                  {
                    id: data.id,
                    commentId: data.commentId,
                    mentionedUserId: data.mentionedUserId,
                    seen: data.seen,
                    createdAt: data.createdAt,
                  },
                ];
              },
            );
          } else {
            queryClient.setQueryData<commentMentions[]>(
              [workspaceId, projectId, taskId, "comments", "mentions"],
              (oldData: commentMentions[] | undefined) => {
                if (!oldData) return oldData;
                const mentions = oldData.filter((m) => m.id !== data.id);
                if (payload.eventType === "DELETE") {
                  return [...mentions];
                } else {
                  return [
                    ...mentions,
                    {
                      id: data.id,
                      commentId: data.commentId,
                      mentionedUserId: data.mentionedUserId,
                      seen: data.seen,
                      createdAt: data.createdAt,
                    },
                  ];
                }
              },
            );
          }
        }
      },
    );
    markReady("postgres");
  }, [
    isNearBottomRef,
    scrollToBottomRef,
    markReady,
    channel,
    taskId,
    currentUserId,
    data,
    isLoading,
    workspaceId,
    projectId,
    queryClient,
  ]);
}

export function createCommentReplyTo(
  reply: commentReplyPrivew,
): commentReplyProps {
  return {
    commentId: reply.id,
    comment: reply.comment,
    commentedBy: reply.commentedBy,
  };
}
