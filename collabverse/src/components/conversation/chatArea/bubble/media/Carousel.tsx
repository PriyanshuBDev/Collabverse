import { chatMediaProps, CompleteChatProps } from "@/app/interfaces";
import { Dispatch, SetStateAction, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { getMediaCategory } from "@/lib/functions/chat/getMediaCategory";
import Xbtn from "@/components/btns/Xbtn";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import { useMediaStore } from "@/lib/hooks/zustand/useMediaStore";
import Spinner1 from "@/components/loadings/Spinner1";
import VideoPreview from "./VideoPreview";

export default function Carousel({
  index,
  setIndex,
  showCarousel,
  setShowCarousel,
  chat,
  sender,
  refresh,
}: {
  index: number;
  setIndex: Dispatch<SetStateAction<number>>;
  setShowCarousel: Dispatch<SetStateAction<boolean>>;
  showCarousel: boolean;
  chat: CompleteChatProps;
  sender: string;
  refresh: () => Promise<void>;
}) {
  const { urls } = useMediaStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const container = scrollRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const scrollTo =
      item.offsetLeft - container.clientWidth / 2 + item.clientWidth / 2;

    container.scrollTo({ left: scrollTo, behavior: "smooth" });
  }, [index]);

  return createPortal(
    <div
      className={`fixed inset-0 bg-gray-50/60 dark:bg-blk4/90 
        z-1000 ${
          showCarousel
            ? "visible backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110"
            : "invisible pointer-events-none"
        }`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
        e.stopPropagation()
      }
    >
      <div className="grid grid-cols-3 pt-4 px-4">
        <div className="text-lg lg:text-xl dark:text-gray-100 text-gray-900 col-span-1">
          {sender}, {DateFormatter3(chat.sentAt || chat.createdAt)}
        </div>
        <div className="lg:text-lg dark:text-gray-300 text-gray-600 col-span-1 flex items-center justify-center">
          {index + 1} of {chat.media.length}
        </div>
        <div className="col-span-1 flex items-center justify-end">
          {" "}
          <Xbtn
            size="size-9"
            onClick={() => {
              setShowCarousel(false);
            }}
          />
        </div>
      </div>
      <div className=" flex justify-center items-center mx-[10vw] w-[80vw] h-[85vh] py-5">
        <div
          id="controls-carousel"
          className="relative items-center w-full h-full  flex justify-center "
          data-carousel="static"
        >
          {chat.media.map((m: chatMediaProps, i: number) => {
            const active = index === i;
            const url = m.path ? urls[chat.id].paths[m.path].url : m.url;
            return (
              <div
                key={m.id}
                // absolute so slides overlap
                className={`
                          absolute top-0 left-0
                          w-full h-full
                          flex items-center justify-center
                          transition-all duration-300 ease-in-out
                          ${
                            active
                              ? "opacity-100 translate-x-0 z-20 pointer-events-auto"
                              : "opacity-0 translate-x-6 z-10 pointer-events-none"
                          }
                        `}
                aria-hidden={!active}
              >
                {getMediaCategory(m.type, m.format) === "photo" ? (
                  <div
                    key={m.id}
                    className={`relative w-full h-full overflow-hidden flex items-center justify-center`}
                    onClick={() => {}}
                  >
                    {!url ? (
                      <div className="inset-0 absolute flex items-center justify-center">
                        <Spinner1 size={"size-8"} />
                      </div>
                    ) : (
                      <Image
                        alt={"media"}
                        src={url}
                        className="object-contain rounded-xl"
                        fill
                        onError={async () => {
                          await refresh();
                        }}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    key={m.id}
                    className={`relative w-fit  h-full flex items-center justify-center`}
                  >
                    {!url ? (
                      <div className="inset-0 absolute flex items-center justify-center">
                        <Spinner1 size={"size-3"} />
                      </div>
                    ) : (
                      <VideoPreview
                        src={url}
                        size="w-fit h-full"
                        svgSize="size-8"
                        index={index}
                        i={i}
                        refresh={refresh}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {chat.media.length > 0 && (
          <button
            type="button"
            className="absolute top-15 start-0 z-30 flex items-center justify-center h-full px-4  group focus:outline-none"
            data-carousel-prev
          >
            <span
              className=" cursor-pointer inline-flex items-center justify-center w-10 h-10 -mt-15 bg-gray-500 rounded-full  hover:bg-gray-800 transition-all duration-200"
              onClick={() =>
                setIndex((i) => (i - 1 + chat.media.length) % chat.media.length)
              }
            >
              <svg
                className="w-5 h-5 text-white rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
              <span className="sr-only">Previous</span>
            </span>
          </button>
        )}
        {chat.media.length > 0 && (
          <button
            type="button"
            className="absolute top-15 end-0 z-30 flex items-center justify-center h-full px-4  group focus:outline-none"
            data-carousel-next
          >
            <span
              className="cursor-pointer inline-flex items-center justify-center w-10 h-10 -mt-15 bg-gray-500 rounded-full  hover:bg-gray-800 transition-all duration-200 "
              onClick={() =>
                setIndex((i: number) => (i + 1) % chat.media.length)
              }
            >
              <svg
                className="w-5 h-5 text-white rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m9 5 7 7-7 7"
                />
              </svg>
              <span className="sr-only">Next</span>
            </span>
          </button>
        )}
      </div>
      <div
        ref={scrollRef}
        className="w-full overflow-x-auto flex items-center gap-3 px-3 scrollbar-hide"
      >
        {/* left spacer */}
        <div className="flex-none w-[calc(50%-28px)] pointer-events-none" />
        {chat.media.map((m: chatMediaProps, i: number) => {
          const url = m.path ? urls[chat.id].paths[m.path].url : m.url;
          return getMediaCategory(m.type, m.format) === "photo" ? (
            <div
              key={m.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`relative w-14 h-14 flex-none  overflow-hidden cursor-pointer ${
                index === i
                  ? "border-2 border-blue-500 rounded-sm"
                  : "opacity-60"
              } `}
              onClick={() => {
                setIndex(i);
                setShowCarousel(true);
              }}
            >
              {!url ? (
                <div className="inset-0 absolute flex items-center justify-center">
                  <Spinner1 size={"size-3"} />
                </div>
              ) : (
                <Image
                  alt={"media"}
                  width={56}
                  height={56}
                  src={url}
                  className="object-center w-full h-full object-cover"
                  onError={async () => {
                    await refresh();
                  }}
                />
              )}
            </div>
          ) : (
            <div
              key={m.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className={`relative`}
            >
              {!url ? (
                <div className="inset-0 absolute flex items-center justify-center">
                  <Spinner1 size={"size-3"} />
                </div>
              ) : (
                <VideoPreview
                  src={url}
                  size={`w-14 h-14 ${
                    index === i
                      ? "border-2 border-blue-500  rounded-sm"
                      : "opacity-60"
                  }`}
                  svgSize="size-2"
                  onClick={() => {
                    setIndex(i);
                  }}
                  small
                  refresh={refresh}
                />
              )}
            </div>
          );
        })}
        <div className="flex-none w-[calc(50%-28px)] pointer-events-none" />
      </div>
    </div>,
    document.body,
  );
}
