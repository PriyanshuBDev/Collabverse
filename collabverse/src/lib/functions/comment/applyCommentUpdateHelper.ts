import { commentReactionProps, CompleteCommentProps } from "@/app/interfaces";
import { commentPendingUpdate } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";

export function applyCommentUpdateHelper(
  comment: CompleteCommentProps,
  update: commentPendingUpdate,
  currentUserId: string,
) {
  switch (update.type) {
    case "reaction":
      if (!comment.reactions) break;
      const { reactedById, reaction } = update.data;
      comment.reactions.forEach((r) => {
        r.reactedBy = r.reactedBy.filter((id: string) => id !== reactedById);
      });
      comment.reactions = comment.reactions.filter(
        (r: commentReactionProps) => r.reactedBy.length > 0,
      );
      if (update.event === "INSERT" || update.event === "UPDATE") {
        const existing = comment.reactions.find(
          (r: commentReactionProps) => r.emoji === reaction,
        );
        if (existing && !existing.reactedBy.includes(reactedById)) {
          existing.reactedBy.push(reactedById);
        } else {
          comment.reactions.push({
            emoji: reaction,
            reactedBy: [reactedById],
          });
        }
      }
      break;

    case "receipt":
      if (
        update.data.seenAt &&
        !comment.isReadByMe &&
        update.data.userId === currentUserId
      ) {
        comment.isReadByMe = true;
      }
      break;
  }
}
