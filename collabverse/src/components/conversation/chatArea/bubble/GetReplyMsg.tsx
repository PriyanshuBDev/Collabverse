import { chatReplyProps } from "@/app/interfaces";
import { fileSvg } from "@/components/svg/mediaSvg";
import htmlToText from "@/lib/functions/chat/htmlToText";
import customColorFromName from "@/lib/functions/colors/customColorFromName";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { MessageType } from "@prisma/client";
import { formatDuration } from "./media/AudioMsgCard";
import { capitalizeFirst } from "@/lib/functions/helper/capitalizeFirst";

export default function GetReplyMsg({
  reply,
  isUser,
}: {
  reply: chatReplyProps;
  isUser?: boolean;
}) {
  const { id: currentUserId } = useCurrentUser();
  const isYou = () => {
    return reply.messagedBy.id === currentUserId
      ? "You"
      : reply.messagedBy.name;
  };

  return (
    <>
      <div
        className={`text-xs md:text-sm font-semibold ${
          isUser
            ? "text-white"
            : customColorFromName(reply.messagedBy.name, "text")
        }`}
      >
        {isYou()}
      </div>
      <div className="flex items-center gap-0.5 mt-1 text-gray-700 dark:text-gray-300">
        <span className={`flex items-center gap-0.5`}>
          <PreviewMsg
            type={reply.type}
            message={reply.message}
            name={reply.name}
            duration={reply.duration}
          />
        </span>
      </div>
    </>
  );
}

export function PreviewMsg({
  type,
  message,
  name,
  duration,
}: {
  type: MessageType;
  message?: string;
  name?: string;
  duration?: number;
}) {
  return (
    <>
      {message === undefined ? (
        type !== "text" &&
        type !== "system" && (
          <div className="flex items-center gap-0.5">
            <div className="text-gray-500">
              {fileSvg(type, "size-2 lg:size-3")}
            </div>
            <div className="text-xs break-words overflow-wrap-anywhere text-ellipsis line-clamp-1">
              {type === "document" || type === "audio"
                ? name
                : capitalizeFirst(type)}{" "}
              {type === "video" || type === "audio"
                ? `(${formatDuration(duration ?? 0)})`
                : ""}
            </div>
          </div>
        )
      ) : (
        <div className="text-xs break-words overflow-wrap-anywhere text-ellipsis line-clamp-1">
          {htmlToText(message)}
        </div>
      )}
    </>
  );
}
