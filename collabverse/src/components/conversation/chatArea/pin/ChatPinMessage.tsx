import { chatPins } from "@/app/interfaces";
import { PreviewMsg } from "../bubble/GetReplyMsg";

export default function ChatPinMessage({
  p,
  idx,
}: {
  p: chatPins;
  idx: number;
}) {
  return (
    <div
      className="flex flex-col gap-1 lg:px-3 px-2 py-1.5 lg:py-2"
      id={`pin-${idx}`}
    >
      <div className="text-blue-700 dark:text-blue-500 font-semibold text-xs">
        Pinned Message #{idx + 1}
      </div>
      <div className="text-gray-700 dark:text-gray-300 text-xs text-ellipsis line-clamp-1">
        <PreviewMsg
          type={p.message.type}
          message={p.message.message}
          name={p.message.name}
          duration={p.message.duration}
        />
      </div>
    </div>
  );
}
{
  /* <div className="text-gray-700 dark:text-gray-300 text-xs text-ellipsis line-clamp-1">
        {p.message === undefined ? (
          p.type !== "Text" &&
          p.type !== "System" &&
          p.type !== "Unknown" && (
            <>
              <div className="text-gray-500">{fileSvg(p.type)}</div>
              <div className="text-xs break-words overflow-wrap-anywhere text-ellipsis line-clamp-1">
                {p.type} ({duration})
              </div>
            </>
          )
        ) : (
          <div className="text-xs break-words overflow-wrap-anywhere text-ellipsis line-clamp-1">
            {htmlToText(p.message)}
          </div>
        )}
      </div> */
}
