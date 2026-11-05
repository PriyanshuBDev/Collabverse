import { CompleteChatProps } from "@/app/interfaces";
import { bubbleShape } from "@/components/conversation/chatArea/mainArea/ChatArea";

export default function MessageShape(
  chats: CompleteChatProps[],
  i: number,
  chat: CompleteChatProps,
): bubbleShape {
  const isSameUser = (a: CompleteChatProps, b: CompleteChatProps) =>
    a?.user.id === b?.user.id;
  const prev = chats[i - 1];
  const next = chats[i + 1];
  const isFirstInGroup = !isSameUser(chat, prev);
  const isLastInGroup = !isSameUser(chat, next);
  const isMiddle = !isFirstInGroup && !isLastInGroup;
  return {
    first: isFirstInGroup,
    last: isLastInGroup,
    middle: isMiddle,
  };
}
