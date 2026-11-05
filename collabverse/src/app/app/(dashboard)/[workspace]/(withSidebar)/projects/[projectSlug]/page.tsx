"use client";
import MainArea from "@/components/project/MainArea";
import ProjectProgressBar from "@/components/project/ProjectProgressBar";
import { memberProps } from "@/app/interfaces";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import InviteToPBtn from "@/components/btns/project/invitation/InviteToPBtn";
import { useProjectOverview } from "@/lib/queries/workspace/project/overview/useProjectOverview";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useIsAllowedToInviteProject } from "@/lib/hooks/useIsAllowedProject";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { toast } from "sonner";
import Spinner1 from "@/components/loadings/Spinner1";

export default function Project() {
  const project = useCurrentProject();
  const { data, isLoading, isError, error } = useProjectOverview();
  useEffect(() => {
    if (isError) {
      const err = error as AxiosError<ApiError>;
      toast.dismiss();
      toast.error(getApiErrorMessage(err, "Failed to fetch project"));
    }
  }, [isError, error]);
  const canInvite = useIsAllowedToInviteProject();
  if (!data && !isLoading) return null;
  return (
    <div className="dark:text-white w-full  text-gray-900 flex min-h-0 flex-1 flex-col p-5">
      <FlexBtwWrapper addOns="shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-fit">
            {project.avatar || data?.avatar ? (
              <div className="relative w-10 h-10 lg:h-12 lg:w-12 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                <Image
                  alt={"ProjectAvatar"}
                  src={data?.avatar ?? project.avatar ?? ""}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : project.name || data?.name ? (
              <div
                className={`w-10 h-10 lg:h-12 lg:w-12 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
                style={{
                  background: gradientBgFromName(data?.name ?? project.name),
                }}
              >
                <div className="font-semibold text-xs lg:text-base text-white">
                  {getInitials(data?.name ?? project.name)}
                </div>
              </div>
            ) : (
              <div
                className={`w-10 h-10 lg:h-12 lg:w-12 rounded-full flex justify-center items-center bg-gray-300 dark:bg-gray-600 border-2 border-white dark:border-blk5`}
              >
                <Spinner1 size="size-4 lg:size-6"></Spinner1>
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-base lg:text-xl text-gray-900 dark:text-gray-100">
              {project.name ?? data?.name}
            </div>
            <div className="w-[15rem] lg:w-xs">
              <ProjectProgressBar
                total={data?.totalTasks ?? 100}
                current={data?.completedTasks ?? 0}
                shimmer
                height="lg:h-3 h-2"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {data?.members.slice(0, 5).map((a: memberProps, idx: number) => {
              return (
                <div
                  key={idx}
                  className={`${
                    idx !== 0 ? "-ml-3" : ""
                  } hover:z-10 relative transition-all`}
                  style={{ zIndex: idx + 1 }}
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
            {data?.members && data.members.length > 5 && (
              <div
                className={`z-6 -ml-3 w-6 h-6 lg:h-8 lg:w-8 rounded-full flex justify-center items-center bg-fuchsia-500 border-2 border-white dark:border-blk5`}
              >
                <div className="font-semibold text-xs text-white">
                  +{data?.members.length - 5}
                </div>
              </div>
            )}
          </div>
          {canInvite && <InviteToPBtn />}
        </div>
      </FlexBtwWrapper>
      <div className="flex flex-col flex-1 min-h-0">
        <MainArea />
      </div>
    </div>
  );
}
