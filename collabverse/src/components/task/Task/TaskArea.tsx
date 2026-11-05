"use client";

import { useTask } from "@/lib/queries/workspace/project/task/overview/useTask";
import TaskContent from "./TaskContent";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import OverviewSkeleton from "@/components/skeletons/OverviewSkeleton";

export default function TaskArea() {
  const { data, isLoading, isError, error } = useTask();
  useIsErrorToast(isError, "Failed to fetch project", error);
  if (isLoading) return <OverviewSkeleton />;
  if (!data)
    return (
      <div className="h-[300px] text-gray-600 dark:text-gray-400 text-sm lg:text-lg">
        No details found
      </div>
    );
  return <TaskContent task={data} />;
}
