import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useTaskActivities } from "@/lib/queries/workspace/project/task/activities/useTaskActivities";
import Activities from "./Activities";
import Spinner1 from "@/components/loadings/Spinner1";
import { activityResponse } from "@/app/interfaces";

export default function ActivityArea() {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
  } = useTaskActivities();
  useIsErrorToast(isError, "Failed to fetch activities", error);
  const activities =
    data?.pages.flatMap((page: activityResponse) => page.activities) ?? [];
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  return (
    <div className="h-full">
      {activities.length > 0 ? (
        <Activities
          activities={activities}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
          isTask={true}
        />
      ) : isPending ? (
        <div className="flex items-center justify-center">
          <Spinner1 size="size-5 lg:size-6" />
        </div>
      ) : (
        <div
          className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
        >
          No activities yet
        </div>
      )}
    </div>
  );
}
