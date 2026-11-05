import { chatReplyProps, CompleteChatProps } from "@/app/interfaces";
import htmlToText from "./htmlToText";

export function replyBuilder(chat: CompleteChatProps): chatReplyProps {
  return {
    name: chat.media[0]?.name,
    type: chat.type,
    message: chat.message ? htmlToText(chat.message) : undefined,
    duration: chat.media.at(0)?.duration,
    chatId: chat.id,
    messagedBy: chat.user,
  };
}
