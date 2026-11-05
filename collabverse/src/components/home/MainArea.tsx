"use client";

import { getGreeting } from "@/lib/functions/date/getGreetings";
import { useUserAppbar } from "@/lib/queries/user/useUserAppbar";
import { format } from "date-fns";
import { GlassCard } from "./GlassCard";
import { ProjectSvg } from "../svg/ProjectSvg";
import { TaskSvg } from "../svg/TaskSvg";
import { MemberSvg } from "../svg/MemberSvg";
import ProgressBar from "../progress/ProgressBar";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import getFullStatusColor from "@/lib/functions/colors/getFullStatusColor";
import getPriorityColor from "@/lib/functions/colors/getPriorityColor";
import getPriorityBgColor from "@/lib/functions/colors/getPriorityBgColor";
import { useRouter } from "next/navigation";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import { AnimatedDirectionPreview } from "../Profile/AppearancePreview";
import { Presence, useOnlineUsers } from "@/lib/hooks/zustand/useOnlineUsers";
import { useHome } from "@/lib/queries/workspace/home/useHome";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";
import { $Enums, Priority } from "@prisma/client";
type prop = {
  id: string;
  name: string;
  status: $Enums.TaskStatus;
  priority: Priority;
  dueDate: Date;
  slug: string;
  project: {
    name: string;
    slug: string;
  };
};
export function MainArea() {
  const { user } = useUserAppbar();
  const { data, isLoading, isError, error } = useHome();
  useIsErrorToast(isError, "Failed to get home", error);
  const { slug } = useCurrentWorkspace();
  const router = useRouter();
  const onlineUsers = useOnlineUsers((s) => s.onlineUsers);
  const setUserId = useShowUserStore.getState().setUserId;
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full w-full ">
        <Spinner1 size="size-10 lg:size-14"></Spinner1>
      </div>
    );
  if (!user || !data) return null;
  const users = Object.values(onlineUsers);
  return (
    <div>
      <div className="flex items-center gap-5 justify-between">
        <div>
          <div className="text-xs lg:text-sm text-gray-700 dark:text-gray-400">
            {format(new Date(), "EEEE, MMMM d")}
          </div>
          <div className="text-2xl lg:text-4xl text-gray-900 dark:text-gray-200 font-semibold my-2">
            {getGreeting()} {user.name}
          </div>
          <div className="text-sm lg:text-base text-gray-700 dark:text-gray-400">
            Here&apos;s what&apos;s happening across your workspace.
          </div>
        </div>
        <div className="pr-10">
          <AnimatedDirectionPreview
            direction="down"
            appearance={data.userAppearance}
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 lg:gap-3 mt-5">
        <GlassCard>
          <div className="mb-3 flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl border  border-white dark:border-blk7 bg-gray-100 dark:bg-blk6 text-xl">
              <ProjectSvg size="size-4 lg:size-5" />
            </div>

            <span className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
              Active Project
            </span>
          </div>
          <div className="pl-1 lg:pl-2">
            <p className="mb-2  font-medium text-lg lg:text-2xl uppercase tracking-[0.2em] text-gray-900 dark:text-gray-200">
              {data.activeProjects}
            </p>
            <p className=" font-semibold tex text-sm lg:text-base text-gray-800 dark:text-gray-300">
              ↑ {data.activeProjectsIncreasedBy} this month
            </p>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="mb-3 flex items-center gap-4">
            <div className="grid size-12 place-items-center rounded-2xl border border-white dark:border-blk7 bg-gray-100 dark:bg-blk6 text-xl">
              <TaskSvg />
            </div>

            <span className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
              Completed Tasks
            </span>
          </div>
          <div className="pl-1 lg:pl-2">
            <p className="mb-2  font-medium text-lg lg:text-2xl uppercase tracking-[0.2em] text-gray-900 dark:text-gray-200">
              {data.completedTasks}/{data.totalTasks}
            </p>
            <div>
              <ProgressBar
                current={data.completedTasks}
                total={data.totalTasks}
                height="h-4"
                emeraldGradient
              />
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="mb-3 flex items-center gap-4 ">
            <div className="grid size-12 place-items-center rounded-2xl border border-white dark:border-blk7 bg-gray-100 dark:bg-blk6 text-xl">
              <MemberSvg />
            </div>

            <span className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
              Active Members
            </span>
          </div>

          <div className="pl-1 lg:pl-2">
            <p className="mb-2  font-medium text-lg lg:text-2xl uppercase tracking-[0.2em] text-gray-900 dark:text-gray-200">
              {Object.keys(onlineUsers).length}
            </p>
            <div className="flex items-center">
              {users.map((a: Presence, idx: number) => {
                return (
                  <div
                    key={idx}
                    className={`${
                      idx !== 0 ? "-ml-3" : ""
                    } hover:z-10 relative transition-all`}
                    style={{ zIndex: idx + 1 }}
                    onClick={() => {
                      if (a.userId !== user.id) {
                        setUserId(a.userId);
                      }
                    }}
                  >
                    {a.avatar ? (
                      <div className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                        <Image
                          alt={"membersAvatar"}
                          src={a.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`w-6 h-6 lg:h-8 lg:w-8 rounded-full flex justify-center items-center border-2 border-white dark:border-blk5`}
                        style={{ background: gradientBgFromName(a.name) }}
                      >
                        <div className="font-semibold text-xs text-white">
                          {getInitials(a.name)}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              {users.length > 5 && (
                <div
                  className={`z-6 -ml-3 w-6 h-6 lg:h-8 lg:w-8 rounded-full flex justify-center items-center bg-fuchsia-500 border-2 border-white dark:border-blk5`}
                >
                  <div className="font-semibold text-xs text-white">
                    +{users.length - 5}
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
      <div className=" h-full w-full  mt-5  border border-white dark:border-blk7 rounded-2xl   bg-gray-200/90   dark:bg-blk4 shadow-xl transition  duration-300 overflow-hidden">
        <div className="flex items-center justify-between px-3 lg:px-5 py-2">
          <div className="text-gray-800 dark:text-gray-300 text-sm lg:text-base ">
            My Tasks
          </div>
          <div
            className="hover:underline text-gray-700 dark:text-gray-400 text-sm lg:text-base"
            onClick={() => {
              router.push(`/app/${slug}/myTasks`);
            }}
          >
            View all →
          </div>
        </div>
        {data.tasks.length > 0 ? (
          data.tasks.map((t: prop) => (
            <div
              key={t.id}
              className="flex items-center justify-between border-t border-white dark:border-blk7 px-3 lg:px-5 py-2 hover:bg-gray-300/60 hover:dark:bg-blk6 transition duration-200"
            >
              <div className="">
                <div className="text-sm lg:text-base text-black dark:text-gray-200 font-semibold">
                  {t.name}
                </div>
                <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
                  {t.project.name} {format(t.dueDate, "MMM dd")}
                </div>
              </div>
              <div className=" flex gap-3 items-center">
                <div
                  className={`${getPriorityColor(t.priority)} ${getPriorityBgColor(t.priority)} px-2 py-0.5 rounded-md text-sm lg:`}
                >
                  {t.priority}
                </div>
                <div
                  className={`${getFullStatusColor(t.status)} rounded-full  px-2 py-0.5`}
                >
                  {t.status.replaceAll("_", " ")}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-30 text-sm lg:text-base text-gray-600 dark:text-gray-500">
            You do not have any current tasks
          </div>
        )}
      </div>
      <div className="group relative mt-5 overflow-hidden rounded-3xl border border-gray-300 bg-white p-4 shadow-lg shadow-gray-900/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-gray-900/10 dark:border-blk7 dark:bg-blk4">
        {/* Pixel-style glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-violet-400/20 blur-2xl transition group-hover:bg-violet-400/30 dark:bg-cyan-400/10 dark:group-hover:bg-cyan-400/20"
        />

        <FlexBtwWrapper addOns="relative gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid size-12 shrink-0 place-items-center rounded-2xl border border-violet-300 bg-violet-100 text-xl text-violet-700 shadow-[0_4px_0_0_rgba(139,92,246,0.2)] dark:border-cyan-300/20 dark:bg-cyan-300/10 dark:text-cyan-200 dark:shadow-[0_4px_0_0_rgba(34,211,238,0.12)]">
              ✦
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-gray-100 lg:text-base">
                Join a Flowspace
                <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400 lg:text-sm">
                Your team&apos;s little corner for hangout
              </div>
            </div>
          </div>

          <a
            href={`/app/${slug}/projects/${data.randomProjectSlug}/flowspace`}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-violet-300 bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-900 shadow-[0_3px_0_0_rgba(139,92,246,0.25)] transition hover:-translate-y-0.5 hover:bg-violet-200 active:translate-y-0 active:shadow-none focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 dark:border-cyan-200/20 dark:bg-cyan-300/10 dark:text-cyan-100 dark:shadow-[0_3px_0_0_rgba(34,211,238,0.16)] dark:hover:bg-cyan-300/20 dark:focus-visible:ring-cyan-300 dark:focus-visible:ring-offset-blk4"
          >
            Go Flow <span aria-hidden="true">↗</span>
          </a>
        </FlexBtwWrapper>
      </div>
    </div>
  );
}
