"use client";

import UpcomingTasksCard from "./UpcomingTasksCard";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useUpcomingTasks } from "@/lib/queries/workspace/overview/useUpcomingTasks";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { upcomingTasksProps, upcomingTasksResProps } from "@/app/interfaces";
import Spinner1 from "../loadings/Spinner1";

export default function UpcomingTasks() {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
  } = useUpcomingTasks();
  useIsErrorToast(isError, "Failed to fetch tasks", error);
  const tasks =
    data?.pages.flatMap((page: upcomingTasksResProps) => page.items) ?? [];
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  return (
    <div className="mt-5">
      <HomeWrapper>
        <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
          Upcoming Tasks
        </div>
        <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
          Tasks due in next 7 days
        </div>
        <div className="flex flex-col gap-1 overflow-y-auto h-45 lg:h-60">
          {tasks.length > 0 ? (
            <>
              {" "}
              {tasks.map((task: upcomingTasksProps, idx: number) => (
                <UpcomingTasksCard
                  key={idx}
                  name={task.name}
                  status={task.status}
                  date={task.createdAt}
                ></UpcomingTasksCard>
              ))}
              {isFetchingNextPage && (
                <div className="my-1 flex items-center w-full h-full justify-center ">
                  <Spinner1 size="size-4" />
                </div>
              )}
              <div ref={loadMoreRef} />
            </>
          ) : isPending ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-5 lg:size-6" />
            </div>
          ) : (
            <div
              className={` mt-3 flex items-center w-full h-full justify-center text-xs  lg:text-base`}
            >
              No upcoming tasks
            </div>
          )}
        </div>
      </HomeWrapper>
    </div>
  );
}
