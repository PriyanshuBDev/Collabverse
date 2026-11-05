import { chatReplyProps, ReplyPreview } from "@/app/interfaces";

export function createReplyTo(reply: ReplyPreview): chatReplyProps {
  return {
    chatId: reply.id,
    type: reply.type,
    name: reply.media?.name,
    message: reply.content,
    duration: reply.media?.duration,
    messagedBy: reply.sender,
  };
}
