"use client";

import HoverWrapper from "../wrappers/HoverWrapper";
import Image from "next/image";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import { DateFormatter } from "@/lib/functions/date/DateFormatter";
import Toolbar from "../helpers/Toolbar";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import ProjectProgressBar from "../project/ProjectProgressBar";
import { useRouter } from "next/navigation";
import { ProjectCardProps } from "@/app/interfaces";
import getInitials from "@/lib/functions/user/getInitials";
import useMounted from "@/lib/hooks/useMounted";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import useIsDark from "@/lib/hooks/useIsDark";

export default function ProjectCard({ ps }: { ps: ProjectCardProps }) {
  return (
    <HoverWrapper>
      <ProjectCardContent ps={ps} />
    </HoverWrapper>
  );
}

export function ProjectCardContent({ ps }: { ps: ProjectCardProps }) {
  const isDark = useIsDark();
  const mounted = useMounted();

  const router = useRouter();
  const { slug } = useCurrentWorkspace();

  if (!mounted) return null;

  return (
    <>
      <div
        onClick={() => {
          router.push(`/app/${slug}/projects/${ps.slug}`);
        }}
      >
        <div className="flex gap-3 items-center w-full">
          {ps.avatar ? (
            <div className="w-fit">
              <div className="relative w-7 h-7 xl:h-9 xl:w-9 rounded-md overflow-hidden">
                <Image
                  alt={"activityAvatar"}
                  src={ps.avatar}
                  className="object-center"
                  fill
                ></Image>
              </div>
            </div>
          ) : (
            <div className="w-fit">
              <div
                className={`w-7 h-7 xl:h-9 xl:w-9 rounded-md flex justify-center items-center `}
                style={{ background: gradientBgFromName(ps.name) }}
              >
                <div className="font-bold text-lg text-white">
                  {getInitials(ps.name)}
                </div>
              </div>
            </div>
          )}
          <FlexBtwWrapper>
            <div className="text-sm xl:text-base w-full">
              <div className="flex flex-col">
                <div className="text-black dark:text-gray-100 font-semibold xl:text-xl text-base">
                  {ps.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {DateFormatter(ps.createdAt)}
                </div>
              </div>
            </div>
          </FlexBtwWrapper>
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
              {ps.members}
            </div>
            <Toolbar top="-top-6">Members</Toolbar>
          </div>
          <div className="flex items-center gap-0.5 xl:gap-1 relative group">
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4 text-gray-400"
              >
                <path
                  fillRule="evenodd"
                  d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z"
                  clipRule="evenodd"
                />
                <path
                  fillRule="evenodd"
                  d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375ZM6 12a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V12Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 15a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V15Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM6 18a.75.75 0 0 1 .75-.75h.008a.75.75 0 0 1 .75.75v.008a.75.75 0 0 1-.75.75H6.75a.75.75 0 0 1-.75-.75V18Zm2.25 0a.75.75 0 0 1 .75-.75h3.75a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-4 text-gray-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                />
              </svg>
            )}
            <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
              {ps.totalTasks}
            </div>
            <Toolbar top="-top-6">Tasks</Toolbar>
          </div>
          <div className="flex items-center gap-0.5 xl:gap-1 relative group">
            {ps.owner.avatar ? (
              <div className="w-fit">
                <div className="relative w-4 h-4  rounded-full overflow-hidden">
                  <Image
                    alt={"ownerAvatar"}
                    src={ps.owner.avatar}
                    className="object-center"
                    fill
                  ></Image>
                </div>
              </div>
            ) : (
              <div className="w-fit">
                <div
                  className="w-4 h-4 rounded-full flex justify-center items-center "
                  style={{ background: gradientBgFromName(ps.owner.name) }}
                >
                  <div className="font-semibold text-xs text-white">
                    {ps.owner.name[0]?.toUpperCase()}
                  </div>
                </div>
              </div>
            )}
            <div className="text-gray-800 text-sm dark:text-gray-300 font-semibold">
              {ps.owner.name}
            </div>
            <Toolbar top="-top-6">Creator</Toolbar>
          </div>
        </div>

        <div className="text-gray-600 dark:text-gray-400 text-xs xl:text-sm mt-2 xl:mt-3 text-ellipsis line-clamp-2 break-words overflow-wrap-anywhere">
          {ps.description}
        </div>
        <div className="mt-2">
          <ProjectProgressBar
            current={ps.completedTasks}
            total={ps.totalTasks}
            shimmer
            height="h-1.5 lg:h-3"
          />
        </div>
      </div>{" "}
    </>
  );
}
