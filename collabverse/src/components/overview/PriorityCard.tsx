"use client";

import { useTaskPriorityData } from "@/lib/queries/workspace/overview/useTaskPriorityData";
import PriorityChart from "../charts/PriorityChart";

import HomeWrapper from "../wrappers/HomeWrapper";
import Spinner1 from "../loadings/Spinner1";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useLatestProject } from "@/lib/hooks/useLatestProject";
import ProjectSearchSelector from "../selectors/ProjectSearchSelector";

export default function PriorityCard() {
  const { project, setProject } = useLatestProject();
  const { data, isLoading, isError, error } = useTaskPriorityData(project?.id);
  useIsErrorToast(isError, "Failed to fetch task priority data", error);
  return (
    <div className="mt-5 h-full w-full">
      <HomeWrapper>
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
              Task Priority
            </div>
            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
              Distribution of priority of tasks across projects
            </div>
          </div>
          <ProjectSearchSelector
            project={project}
            setProjectProps={setProject}
          />
        </div>

        <div className="h-[90%]">
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            <PriorityChart data={data}></PriorityChart>
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
