"use client";

import { activityResponse } from "@/app/interfaces";
import Spinner1 from "@/components/loadings/Spinner1";
import Activities from "@/components/task/Additional/Activity/Activities";
import BorderWrapper from "@/components/wrappers/BorderWrapper";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useProjectActivities } from "@/lib/queries/workspace/project/overview/activities/useProjectActivities";

export default function ProjectActivityArea() {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
  } = useProjectActivities();
  useIsErrorToast(isError, "Failed to fetch activities", error);
  const activities =
    data?.pages.flatMap((page: activityResponse) => page.activities) ?? [];
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  return (
    <BorderWrapper>
      <div className="text-sm lg:text-lg font-semibold mb-2 ">Activities</div>
      {activities.length > 0 ? (
        <Activities
          activities={activities}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          isProject={true}
          height="h-100"
        />
      ) : isPending ? (
        <div className="flex items-center justify-center h-110">
          <Spinner1 size="size-5 lg:size-6" />
        </div>
      ) : (
        <div
          className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
        >
          No activities yet
        </div>
      )}
    </BorderWrapper>
  );
}
