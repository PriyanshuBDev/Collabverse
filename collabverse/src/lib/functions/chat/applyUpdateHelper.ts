import {
  chatMediaProps,
  commentReactionProps,
  CompleteChatProps,
} from "@/app/interfaces";
import { PendingUpdate } from "@/lib/hooks/zustand/useChatStore";

export function applyUpdateHelper(
  msg: CompleteChatProps,
  update: PendingUpdate,
  currentUserId: string,
) {
  switch (update.type) {
    case "reaction":
      if (!msg.reactions) break;
      const { userId, reaction } = update.data;
      msg.reactions.forEach((r) => {
        r.reactedBy = r.reactedBy.filter((id: string) => id !== userId);
      });
      msg.reactions = msg.reactions.filter(
        (r: commentReactionProps) => r.reactedBy.length > 0,
      );
      if (update.event === "INSERT" || update.event === "UPDATE") {
        const existing = msg.reactions.find(
          (r: commentReactionProps) => r.emoji === reaction,
        );
        if (existing && !existing.reactedBy.includes(userId)) {
          existing.reactedBy.push(userId);
        } else {
          msg.reactions.push({
            emoji: reaction,
            reactedBy: [userId],
          });
        }
      }
      break;

    case "media":
      const pushMedia = () => {
        msg.media.push({
          id: update.data.id,
          name: update.data.originalName,
          format: update.data.format,
          type: update.data.type,
          bytes: Number(update.data.size),
          duration: Number(update.data.duration),
          order: Number(update.data.order),
          path: update.data.path,
        });
      };
      if (update.event === "INSERT") {
        pushMedia();
      } else if (update.event === "UPDATE") {
        msg.media = msg.media.filter(
          (m: chatMediaProps) => m.id === update.data.id,
        );
        pushMedia();
      } else {
        msg.media = msg.media.filter(
          (m: chatMediaProps) => m.id === update.data.id,
        );
      }

      break;

    case "receipt":
      if (
        update.data.seenAt &&
        !msg.isRead &&
        update.data.userId !== currentUserId
      ) {
        msg.isRead = true;
        msg.seenAt = update.data.seenAt;
      }
      break;

    // case "delete":
    //   msg.deletedFor.push(update.data.userId);
    //   break;

    case "pin":
      if (update.event === "DELETE") {
        msg.isPinned = false;
      } else {
        msg.isPinned = !!update.data.pinnedAt;
      }
      break;
    case "call":
      if (msg.call) {
        msg.call.status = update.data.status;
        msg.call.endedAt = update.data.endedAt;
        msg.call.startedAt = update.data.startedAt;
      }
  }
}
