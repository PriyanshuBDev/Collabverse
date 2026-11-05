import { commentDataForApi, commentReactionProps } from "@/app/interfaces";
import { createComment } from "@/lib/axios/workspace/project/tasks/comments/createComment";
import { deleteComment } from "@/lib/axios/workspace/project/tasks/comments/deleteComment";
import { toggleCommentReaction } from "@/lib/axios/workspace/project/tasks/comments/toggleCommentReaction";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useCommentStore } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";
export type sendCommentMutationProps = {
  comment: commentDataForApi;
  clientId: string;
};
type prop = {
  reactedBy: string[];
  emoji: string;
};
export function useCommentMutation() {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: projectId } = useCurrentProject();
  const { id: taskId } = useCurrentTask();
  const { id: currentUserId } = useCurrentUser();
  const state = useCommentStore();
  const sendComment = useMutation({
    mutationFn: async ({ comment }: sendCommentMutationProps) =>
      await createComment({ workspaceId, projectId, taskId, comment }),
    onSuccess: async (data, vars) => {
      state.replaceComment(taskId, data, vars.clientId);
    },
    onError: (e, vars) => {
      toast.error(`Failed to create comment. Please try again later.`);
      console.error(e);
      state.deleteComment(taskId, vars.clientId);
    },
  });
  const react = useMutation({
    mutationFn: ({
      reaction,
      commentId,
    }: {
      reaction: string;
      commentId: string;
      allReactions: commentReactionProps[];
    }) =>
      toggleCommentReaction({
        workspaceId,
        projectId,
        taskId,
        commentId,
        reaction,
      }),
    onMutate: ({ reaction, commentId, allReactions }) => {
      const previous = allReactions;
      const reactions = allReactions.map((r: commentReactionProps) => ({
        ...r,
        reactedBy: [...r.reactedBy],
      }));
      reactions.forEach((r) => {
        r.reactedBy = r.reactedBy.filter((id: string) => id !== currentUserId);
      });
      const newReactions = reactions.filter(
        (r: prop) => r.reactedBy.length > 0,
      );

      const alreadyReacted = allReactions.some(
        (r: commentReactionProps) =>
          r.emoji === reaction && r.reactedBy.includes(currentUserId),
      );
      if (!alreadyReacted) {
        const existing = newReactions.find((r: prop) => r.emoji === reaction);
        if (existing) {
          existing.reactedBy.push(currentUserId);
        } else {
          newReactions.push({
            emoji: reaction,
            reactedBy: [currentUserId],
          });
        }
      }
      state.updateComments(taskId, commentId, { reactions: newReactions });
      return { previous };
    },
    onError: (e: AxiosError<ApiError>, { commentId }, ctx) => {
      toast.error(getApiErrorMessage(e, "Failed to update reaction"));
      state.updateComments(taskId, commentId, { reactions: ctx?.previous });
    },
  });
  const delComment = useMutation({
    mutationFn: (commentId: string) =>
      deleteComment({ workspaceId, projectId, taskId, commentId }),
    onMutate: (vars: string) => {
      state.deleteComment(taskId, vars);
    },
    onSuccess: () => {
      toast.success(`Comment deleted successfully`);
    },
    onError: (e: Error) => {
      console.error(e);
      toast.error(`Failed to delete comment`);
    },
  });
  return {
    sendComment,
    react,
    delComment,
  };
}
