import { chatListLastMsg, CompleteChatProps } from "@/app/interfaces";
import htmlToText from "./htmlToText";
import { fileSvg } from "@/components/svg/mediaSvg";
import { formatDuration } from "@/lib/hooks/useDuration";
import { capitalizeFirst } from "../helper/capitalizeFirst";

export function FormatPinMsg(msg: CompleteChatProps) {
  if (msg.message === undefined) {
    if (msg.type !== "text" && msg.type !== "system") {
      return (
        <>
          {fileSvg(msg.type, "size-3 lg:size-4")}{" "}
          {msg.type === "document" || msg.type === "audio"
            ? msg.media.at(0)?.name
            : msg.type}{" "}
          $
          {msg.type === "video" || msg.type === "audio"
            ? `(${msg.media.at(0)?.duration})`
            : ""}
        </>
      );
    } else {
      return "unknown";
    }
  } else {
    return htmlToText(msg.message);
  }
}

export function FormatLastMsg(msg: chatListLastMsg, isUser: boolean) {
  if (msg.message === undefined) {
    if (msg.type !== "text" && msg.type !== "system") {
      return (
        <div className="flex items-center gap-1">
          {fileSvg(msg.type, "size-2 lg:size-3")}
          {msg.type === "audio" || msg.type === "video"
            ? `${msg.name ?? ""} (${formatDuration(msg.duration ?? 0)})`
            : msg.type === "call"
              ? msg.callStatus === "Ended" ||
                msg.callStatus === "Calling" ||
                msg.callStatus === "Active"
                ? isUser
                  ? "Outgoing Call"
                  : "Incoming Call"
                : msg.callStatus
              : msg.type === "document"
                ? msg.name
                : capitalizeFirst(msg.type)}
        </div>
      );
    } else {
      return "unknown";
    }
  } else {
    return `${htmlToText(msg.message)}`;
  }
}
