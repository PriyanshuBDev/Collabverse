"use client";

import HoverWrapper from "../wrappers/HoverWrapper";
import Image from "next/image";

import { DateFormatter } from "@/lib/functions/date/DateFormatter";
import Toolbar from "../helpers/Toolbar";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { WorkspacesProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import useMounted from "@/lib/hooks/useMounted";
import { useRouter } from "next/navigation";
import useIsDark from "@/lib/hooks/useIsDark";

export default function WsCard({ ws }: { ws: WorkspacesProps }) {
  return (
    <HoverWrapper>
      <WsCardContent ws={ws} />
    </HoverWrapper>
  );
}
export function WsCardContent({ ws }: { ws: WorkspacesProps }) {
  const isDark = useIsDark();
  const mounted = useMounted();
  const router = useRouter();
  if (!mounted) return null;

  return (
    <div onClick={() => router.push(`/app/${ws.slug}/home`)}>
      <div className="flex gap-3 items-center w-full">
        {ws.avatar ? (
          <div className="w-fit">
            <div className="relative w-8 h-8 xl:h-10 xl:w-10 rounded-md overflow-hidden">
              <Image
                alt={"activityAvatar"}
                src={ws.avatar}
                className="object-center object-cover"
                fill
              ></Image>
            </div>
          </div>
        ) : (
          <div className="w-fit">
            <div
              className={`w-8 h-8 xl:h-10 xl:w-10 rounded-md flex justify-center items-center `}
              style={{ background: gradientBgFromName(ws.name) }}
            >
              <div className="font-bold text-xl text-white">
                {getInitials(ws.name)}
              </div>
            </div>
          </div>
        )}

        <div className="text-sm xl:text-base w-full">
          <div className="flex flex-col">
            <div className="text-black dark:text-gray-100 font-semibold xl:text-xl text-base">
              {ws.name}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500">
              {DateFormatter(ws.createdAt)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 xl:gap-3 xl:mt-2 mt-1 ">
        <div className="flex items-center gap-0.5 xl:gap-1 relative group">
          {isDark ? (
            <svg
              className="w-4 h-4 text-gray-800 dark:text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4 text-gray-800 dark:text-gray-400"
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
                strokeWidth="1.5"
                d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
          <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
            {ws.members}
          </div>
          <Toolbar top="-top-6">Members</Toolbar>
        </div>
        <div className="flex items-center gap-0.5 xl:gap-1 relative group">
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 text-gray-800 dark:text-gray-400"
            >
              <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 text-gray-800 dark:text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          )}
          <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
            {ws.projects}
          </div>
          <Toolbar top="-top-6">Projects</Toolbar>
        </div>
        <div className="flex items-center gap-0.5 xl:gap-1 relative group">
          {ws.owner.avatar ? (
            <div className="w-fit">
              <div className="relative w-4 h-4  rounded-full overflow-hidden">
                <Image
                  alt={"AdminAvatar"}
                  src={ws.owner.avatar}
                  className="object-center"
                  fill
                ></Image>
              </div>
            </div>
          ) : (
            <div className="w-fit">
              <div
                className="w-4 h-4 rounded-full flex justify-center items-center "
                style={{ background: gradientBgFromName(ws.owner.name) }}
              >
                <div className="font-semibold text-xs text-white">
                  {ws.owner.name[0]?.toUpperCase()}
                </div>
              </div>
            </div>
          )}
          <div className="text-gray-800 text-sm dark:text-gray-300 font-semibold">
            {ws.owner.name}
          </div>
          <Toolbar top="-top-6">Owner</Toolbar>
        </div>
      </div>

      <div className="text-gray-600 dark:text-gray-400 text-xs xl:text-sm mt-2 xl:mt-3 text-ellipsis line-clamp-2 break-words overflow-wrap-anywhere">
        {ws.description}
      </div>
    </div>
  );
}
