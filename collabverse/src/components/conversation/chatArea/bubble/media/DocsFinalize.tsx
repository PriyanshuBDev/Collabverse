import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import Xbtn from "@/components/btns/Xbtn";
import { mediaSvg } from "@/components/svg/mediaSvg";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";

export default function DocsFinalize({
  showCarousel,
  setShowCarousel,
  docs,
  setDocs,
}: {
  setShowCarousel: Dispatch<SetStateAction<boolean>>;
  showCarousel: boolean;
  docs: File[];
  setDocs: Dispatch<SetStateAction<File[]>>;
}) {
  const [index, setIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    const item = itemRefs.current[index];
    if (!container || !item) return;

    const scrollTo =
      item.offsetLeft - container.clientWidth / 2 + item.clientWidth / 2;

    container.scrollTo({ left: scrollTo, behavior: "smooth" });
  }, [index]);

  return (
    <>
      <div
        className={`w-full h-full bg-gray-200/60 dark:bg-blk5 overflow-hidden
        z-100 ${
          showCarousel
            ? "visible backdrop-blur-xl backdrop-saturate-150 backdrop-brightness-110"
            : "invisible pointer-events-none"
        }`}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        onContextMenu={(e: React.MouseEvent<HTMLDivElement>) =>
          e.stopPropagation()
        }
      >
        <div
          className={`grid  pt-1 px-3 ${
            docs.length > 1 ? "grid-cols-3" : "grid-cols-2"
          }`}
        >
          {docs.length > 1 && (
            <div
              className="p-2 rounded-md bg-gray-200 dark:bg-blk7 text-gray-900 dark:text-gray-100 w-fit cursor-pointer"
              onClick={() => {
                if (index + 1 === docs.length) {
                  setIndex(index - 1);
                }
                setDocs((prev) =>
                  prev.filter((p: File, i: number) => i !== index),
                );
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </div>
          )}
          <div
            className={`lg:text-lg dark:text-gray-300 text-gray-600 col-span-1 flex items-center justify-center ${
              docs.length > 1 ? "justify-center" : "justify-end"
            }`}
          >
            {index + 1} of {docs.length}
          </div>
          <div className="col-span-1 flex items-center justify-end">
            {" "}
            <Xbtn
              size="size-7"
              onClick={() => {
                setShowWarning(true);
              }}
            />
          </div>
        </div>
        <div className=" flex justify-center items-center mx-[10%] w-[80%] h-75 py-2">
          <div
            id="controls-carousel"
            className="relative items-center w-full h-full  flex justify-center "
            data-carousel="static"
          >
            {docs.map((f: File, i: number) => {
              const active = index === i;
              return (
                <div
                  key={i}
                  // absolute so slides overlap
                  className={`
                  absolute top-0 left-0
                  w-full h-full
                  flex flex-col items-center justify-center
                  transition-all duration-300 ease-in-out
                  ${
                    active
                      ? "opacity-100  z-20 pointer-events-auto"
                      : "opacity-0  z-10 pointer-events-none"
                  }
                `}
                  aria-hidden={!active}
                >
                  <div className="text-gray-600 dark:text-gray-400 mb-5">
                    {mediaSvg(
                      f.type.split("/")[0],
                      f.name.split(".").pop()?.toLowerCase(),
                      "w-20 h-20",
                    )}
                  </div>
                  <div className=" lg:text-lg text-gray-900 dark:text-gray-100">
                    {f.name}
                  </div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            className="absolute top-12 start-0 z-30 flex items-center justify-center h-full px-4  group focus:outline-none"
            data-carousel-prev
          >
            <span
              className=" cursor-pointer inline-flex items-center justify-center w-10 h-10 -mt-15 bg-gray-500 rounded-full  hover:bg-gray-800 transition-all duration-200"
              onClick={() =>
                setIndex((i: number) => (i - 1 + docs.length) % docs.length)
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
          <button
            type="button"
            className="absolute top-12 end-0 z-30 flex items-center justify-center h-full px-4  group focus:outline-none"
            data-carousel-next
          >
            <span
              className="cursor-pointer inline-flex items-center justify-center w-10 h-10 -mt-15 bg-gray-500 rounded-full  hover:bg-gray-800 transition-all duration-200 "
              onClick={() => setIndex((i: number) => (i + 1) % docs.length)}
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
        </div>
        <div
          ref={scrollRef}
          className="w-full overflow-x-auto flex items-center gap-3 px-3 scrollbar-hide pb-3"
        >
          {/* left spacer */}
          <div className="flex-none w-[calc(50%-28px)] pointer-events-none" />
          {docs.map((f: File, i: number) => (
            <div
              ref={(el: HTMLDivElement | null) => {
                itemRefs.current[i] = el;
              }}
              key={i}
              className={`relative w-10 h-10 flex-none border-2 rounded-sm text-gray-800 dark:text-gray-200 flex items-center justify-center overflow-hidden cursor-pointer ${
                index === i ? " border-blue-500 " : "opacity-60 border-gray-500"
              } `}
              onClick={() => setIndex(i)}
            >
              {mediaSvg(
                f.type.split("/")[0],
                f.name.split(".").pop()?.toLowerCase(),
                "w-8 h-8",
              )}
            </div>
          ))}
          <div className="flex-none w-[calc(50%-28px)] pointer-events-none" />
        </div>
      </div>
      <OverlayWrapper active={showWarning} addOns="lg:w-sm">
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md">
          Are you sure about discarding ?
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
          <button
            className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
            onClick={() => setShowWarning(false)}
          >
            cancel
          </button>
          <button
            className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
            onClick={() => {
              setShowWarning(false);
              setShowCarousel(false);
              setDocs([]);
            }}
          >
            Discard
          </button>
        </div>
      </OverlayWrapper>
    </>
  );
}
