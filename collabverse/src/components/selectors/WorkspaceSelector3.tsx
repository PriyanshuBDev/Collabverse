import { wsProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useWorkspaceSidebar } from "@/lib/queries/workspace/useWorkspaceSidebar";
import Image from "next/image";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { WorkspaceSvg } from "../svg/WorkspaceSvg";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";

export default function WorkspaceSelector3({
  width,
  ws,
  setWs,
}: {
  width?: string;
  ws: wsProps | undefined;
  setWs: Dispatch<SetStateAction<wsProps | undefined>>;
}) {
  const [dropDown, setDropDown] = useState(false);
  const { data, isError, error } = useWorkspaceSidebar();
  const dropRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([dropRef], () => setDropDown(false));
  useIsErrorToast(isError, "Failed to fetch workspace for selector", error);
  if (!data || data.length === 0) return null;
  return (
    <div ref={dropRef} className={`relative ${width ?? "w-50"}`}>
      <div
        className="flex justify-center items-center gap-3 bg-gray-200 rounded-lg w-full p-2 dark:bg-blk5 cursor-pointer"
        onClick={() => setDropDown((prev) => !prev)}
      >
        {ws ? (
          <>
            <div className="shrink-0">
              {ws.avatar ? (
                <div className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-md lg:rounded-lg overflow-hidden">
                  <Image
                    alt={"activityAvatar"}
                    src={ws.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className="w-6 h-6 lg:h-8 lg:w-8 rounded-md lg:rounded-lg flex justify-center items-center "
                  style={{ background: gradientBgFromName(ws.name) }}
                >
                  <div className="font-bold  text-xs md:text-sm lg:text-base text-white">
                    {getInitials(ws.name)}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between w-full min-w-0">
              <span className="dark:text-gray-100 truncate">{ws.name}</span>
              <div className="shrink-0 text-gray-500 pr-1 ">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                  />
                </svg>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-start w-full gap-5 text-gray-800 dark:text-gray-200 ml-1">
            <WorkspaceSvg size="size-7" /> Select Workspace
          </div>
        )}
      </div>

      <div
        className={`bg-gray-200  dark:bg-blk5 absolute top-13 left-0 right-0 rounded-lg px-1 py-1 flex flex-col gap-1 max-h-60 overflow-y-auto transition-all duration-300 ease-in-out z-10 shadow-lg ${
          dropDown
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-6 invisible"
        }`}
      >
        <ul>
          {data.map((w: wsProps, idx: number) => {
            if (w.slug === ws?.slug) return;
            return (
              <li
                key={idx}
                className="flex  items-center gap-3 w-full cursor-pointer px-1 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-blk8"
                onClick={() => {
                  setWs(w);
                  setDropDown(false);
                }}
              >
                <div className="shrink-0">
                  {w.avatar ? (
                    <div className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-md lg:rounded-lg overflow-hidden">
                      <Image
                        alt={"WsAvatar"}
                        src={w.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={` w-6 h-6 lg:h-8 lg:w-8 rounded-md lg:rounded-lg  flex justify-center items-center  `}
                      style={{ background: gradientBgFromName(w.name) }}
                    >
                      <div className="font-semibold text-xs md:text-sm lg:text-base text-white ">
                        {getInitials(w.name)}
                      </div>
                    </div>
                  )}
                </div>

                <span className="dark:text-gray-100 truncate">{w.name}</span>
              </li>
            );
          })}
          {ws && (
            <li
              className="flex  items-center gap-3 w-full cursor-pointer px-1 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-blk8"
              onClick={() => {
                setWs(undefined);
                setDropDown(false);
              }}
            >
              None
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
