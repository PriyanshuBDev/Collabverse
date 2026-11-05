"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { DateFormatter } from "@/lib/functions/date/DateFormatter";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import useMounted from "@/lib/hooks/useMounted";
import useIsDark from "@/lib/hooks/useIsDark";
import { WorkspacesProps } from "@/app/interfaces";

export default function WsCard2({ ws }: { ws: WorkspacesProps }) {
  return (
    <div className="cursor-pointer  h-full w-full dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] dark:hover:shadow-[0_3px_10px_rgba(0,0,0,0.7)] shadow-[0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)] rounded-xl bg-white dark:bg-blk3 transition-all duration-300 hover:z-50 hover:-translate-y-1.5 xl:hover:-translate-y-3">
      <WsCardContent ws={ws} />
    </div>
  );
}

export function WsCardContent({ ws }: { ws: WorkspacesProps }) {
  const isDark = useIsDark();
  const mounted = useMounted();
  const router = useRouter();

  if (!mounted) return null;

  return (
    <div
      onClick={() => router.push(`/app/${ws.slug}/home`)}
      className="group relative isolate cursor-pointer overflow-hidden rounded-xl"
    >
      {/* Avatar stays in place, then expands to cover the card on hover */}
      <div
        className="absolute left-3 top-3 h-8 w-8 origin-top-left overflow-hidden rounded-md
      transition-[width,height,border-radius] duration-700
      ease-[cubic-bezier(0.22,1,0.36,1)]
      group-hover:left-0 group-hover:top-0
      group-hover:h-full group-hover:w-full group-hover:rounded-xl
      xl:left-4 xl:top-4 xl:h-10 xl:w-10"
      >
        {ws.avatar ? (
          <Image
            alt={`${ws.name} avatar`}
            src={ws.avatar}
            fill
            className="object-cover object-center"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: gradientBgFromName(ws.name) }}
          >
            <span className="text-xl font-bold text-white group-hover:hidden">
              {getInitials(ws.name)}
            </span>
          </div>
        )}
      </div>

      <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />

      {/* Keep the content above the expanded avatar */}
      <div className="relative z-10 p-3 xl:p-4">
        <div className="flex w-full items-center gap-3 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-x-11 xl:group-hover:-translate-x-14">
          {/* Reserve the avatar’s original space */}
          <div className="h-8 w-8 shrink-0 xl:h-10 xl:w-10" />

          <div className="w-full text-sm xl:text-base">
            <div className="flex flex-col">
              <div className="text-base font-semibold text-black transition-colors duration-500 group-hover:text-white dark:text-gray-100 xl:text-xl">
                {ws.name}
              </div>
              <div className="text-xs text-gray-500 transition-colors duration-500 group-hover:text-white/90 dark:text-gray-400">
                {DateFormatter(ws.createdAt)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2 xl:mt-2 xl:gap-3">
          <div className="group/item relative flex items-center gap-0.5 xl:gap-1">
            {isDark ? (
              <svg
                className="h-4 w-4 text-gray-800 transition-colors duration-500 group-hover:text-white dark:text-gray-400"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm-2 9a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-1a4 4 0 0 0-4-4H6Zm7.25-2.095c.478-.86.75-1.85.75-2.905a5.973 5.973 0 0 0-.75-2.906 4 4 0 1 1 0 5.811ZM15.466 20c.34-.588.535-1.271.535-2v-1a5.978 5.978 0 0 0-1.528-4H18a4 4 0 0 1 4 4v1a2 2 0 0 1-2 2h-4.535Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="h-4 w-4 text-gray-800 transition-colors duration-500 group-hover:text-white dark:text-gray-400"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="1.5"
                  d="M16 19h4a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-2m-2.236-4a3 3 0 1 0 0-4M3 18v-1a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Zm8-10a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                />
              </svg>
            )}
            <span className="text-sm font-semibold text-gray-600 transition-colors duration-500 group-hover:text-white dark:text-gray-300">
              {ws.members}
            </span>
          </div>

          <div className="group/item relative flex items-center gap-0.5 xl:gap-1">
            {isDark ? (
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 text-gray-800 transition-colors duration-500 group-hover:text-white dark:text-gray-400"
                aria-hidden="true"
              >
                <path d="M19.5 21a3 3 0 0 0 3-3v-4.5a3 3 0 0 0-3-3h-15a3 3 0 0 0-3 3V18a3 3 0 0 0 3 3h15ZM1.5 10.146V6a3 3 0 0 1 3-3h5.379a2.25 2.25 0 0 1 1.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 0 1 3 3v1.146A4.483 4.483 0 0 0 19.5 9h-15a4.483 4.483 0 0 0-3 1.146Z" />
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                className="size-4 text-gray-800 transition-colors duration-500 group-hover:text-white dark:text-gray-400"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
                />
              </svg>
            )}
            <span className="text-sm font-semibold text-gray-600 transition-colors duration-500 group-hover:text-white dark:text-gray-300">
              {ws.projects}
            </span>
          </div>

          <div className="group/item relative flex items-center gap-0.5 xl:gap-1">
            {ws.owner.avatar ? (
              <div className="relative h-4 w-4 overflow-hidden rounded-full">
                <Image
                  alt="Owner avatar"
                  src={ws.owner.avatar}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div
                className="flex h-4 w-4 items-center justify-center rounded-full"
                style={{ background: gradientBgFromName(ws.owner.name) }}
              >
                <span className="text-xs font-semibold text-white">
                  {ws.owner.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-semibold text-gray-800 transition-colors duration-500 group-hover:text-white dark:text-gray-300">
              {ws.owner.name}
            </span>
          </div>
        </div>

        <div className="mt-2 line-clamp-2 break-words text-xs text-gray-600 transition-colors duration-500 group-hover:text-white dark:text-gray-400 xl:mt-3 xl:text-sm">
          {ws.description}
        </div>
      </div>
    </div>
  );
}
