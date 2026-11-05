"use client";

import Redirectbtn from "../btns/RedirectBtn";
import RecentProjectCard from "./RecentProjectCard";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useRecentProjects } from "@/lib/queries/workspace/overview/useRecentProjects";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";
import { ProjectCardProps } from "@/app/interfaces";

export default function RecentProject() {
  const { data, isLoading, isError, error } = useRecentProjects();
  const { slug } = useCurrentWorkspace();
  useIsErrorToast(isError, "Failed to fetch task priority data", error);
  return (
    <div className="mt-5">
      <HomeWrapper>
        <div className="flex justify-between w-full gap-3">
          <div className=" mb-2">
            {" "}
            <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
              Recent Projects
            </div>
            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 ">
              View of new projects added
            </div>
          </div>
          <Redirectbtn
            label="View All"
            direct={`/app/${slug}/projects`}
          ></Redirectbtn>
        </div>
        <div className="space-y-4 overflow-y-auto h-45 lg:h-60 thinScrollbar">
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            data.map((project: ProjectCardProps, idx: number) => (
              <RecentProjectCard
                key={idx}
                name={project.name}
                done={project.completedTasks}
                total={project.totalTasks}
                description={project.description}
              />
            ))
          ) : (
            <div className="flex items-center w-full h-full justify-center">
              No data found
            </div>
          )}
        </div>
      </HomeWrapper>
    </div>
  );
}
