"use client";
import TaskStatusChart from "../charts/TaskStatusChart";
import HomeWrapper from "../wrappers/HomeWrapper";
import ProjectSearchSelector from "../selectors/ProjectSearchSelector";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import { useLatestProject } from "@/lib/hooks/useLatestProject";
import { useTaskCountByStatus } from "@/lib/queries/workspace/overview/useTaskCountByStatus";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";

export interface taskStatusCardProps {
  status: string;
  value: number;
}
export default function TaskStatusCard() {
  const { project, setProject } = useLatestProject();
  const { data, isLoading, isError, error } = useTaskCountByStatus(project?.id);
  useIsErrorToast(isError, "Failed to fetch tasks", error);
  return (
    <div className="mt-5 h-full w-full">
      <HomeWrapper>
        <FlexBtwWrapper addOns="gap-5">
          <div>
            <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
              Tasks Workflow
            </div>
            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
              Workflow of tasks across projects
            </div>
          </div>
          <ProjectSearchSelector
            project={project}
            setProjectProps={setProject}
          />
        </FlexBtwWrapper>

        <div className="h-[90%]">
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            <TaskStatusChart data={data} />
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
