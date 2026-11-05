"use client";

import { useTeamLoad } from "@/lib/queries/workspace/overview/useTeamLoad";
import TeamLoadChart from "../charts/TeamLoadChart";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useLatestProject } from "@/lib/hooks/useLatestProject";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import ProjectSearchSelector from "../selectors/ProjectSearchSelector";
import Spinner1 from "../loadings/Spinner1";

export default function TeamLoadCard() {
  const { project, setProject } = useLatestProject();
  const { data, isLoading, isError, error } = useTeamLoad(project?.id);
  useIsErrorToast(isError, "Failed to fetch users", error);
  return (
    <div className="mt-5 h-full">
      <HomeWrapper>
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
              Team Load
            </div>
            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
              Team Load across projects
            </div>
          </div>
          <ProjectSearchSelector
            project={project}
            setProjectProps={setProject}
          />
        </div>

        <div className="h-[70%]">
          {" "}
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            <TeamLoadChart data={data}></TeamLoadChart>
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
