"use client";

import Activities from "@/components/task/Additional/Activity/Activities";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useWsActivities } from "@/lib/queries/workspace/overview/useWsActivities";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import Spinner1 from "../loadings/Spinner1";
import { activityResponse } from "@/app/interfaces";

export default function WsActivityArea() {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
  } = useWsActivities();
  useIsErrorToast(isError, "Failed to fetch activities", error);
  const activities =
    data?.pages.flatMap((page: activityResponse) => page.activities) ?? [];
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  return (
    <div className="mt-5">
      <HomeWrapper>
        <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
          Today&apos;s Activities
        </div>
        <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2">
          Things that happened today
        </div>
        {activities.length > 0 ? (
          <Activities
            activities={activities}
            loadMoreRef={loadMoreRef}
            isFetchingNextPage={isFetchingNextPage}
            height="h-60"
          />
        ) : isPending ? (
          <div className="flex items-center justify-center h-60">
            <Spinner1 size="size-5 lg:size-6" />
          </div>
        ) : (
          <div
            className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
          >
            No activities yet
          </div>
        )}
      </HomeWrapper>
    </div>
  );
}
