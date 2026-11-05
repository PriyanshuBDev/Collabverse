"use client";

import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import {
  notificationProps,
  notificationResProps,
  wsProps,
} from "@/app/interfaces";
import NotificationCard from "./NotificationCard";
import WorkspaceSelector3 from "../selectors/WorkspaceSelector3";
import { useNotifications } from "@/lib/queries/user/notifications.ts/useNotifications";
import { useState } from "react";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import Spinner1 from "../loadings/Spinner1";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useNotificationCount } from "@/lib/queries/user/notifications.ts/useNotificationCount";

export default function AllNotifications() {
  const [ws, setWs] = useState<wsProps | undefined>(undefined);
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
    markReadMutation,
    markAllReadMutation,
  } = useNotifications(ws?.id);
  const notificationCount = useNotificationCount(ws?.id);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch notifications", error);
  const allNotifications =
    data?.pages.flatMap((page: notificationResProps) => page.notifications) ??
    [];

  if (isPending || markAllReadMutation.isPending) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mt-3">
          <WorkspaceSelector3 width="w-60" setWs={setWs} ws={ws} />
        </div>
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          <Spinner1 size="size-10 lg:size-14"></Spinner1>
        </div>
      </div>
    );
  }
  if (!data || allNotifications.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <div className="mt-3">
          <WorkspaceSelector3 width="w-60" setWs={setWs} ws={ws} />
        </div>
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No new notitications
        </div>
      </div>
    );
  }
  return (
    <div className="mt-3">
      <WorkspaceSelector3 width="w-60" setWs={setWs} ws={ws} />
      <FlexBtwWrapper>
        <div className="flex items-center  gap-3 text-lg lg:text-xl">
          Total Notifications:{" "}
          <span className="px-2 py-0.5 bg-red-500 rounded-full text-white text-xs lg:text-sm ">
            {notificationCount.data ?? 0}
          </span>
        </div>
        <button
          className={`cursor-pointer text-white bg-blue-500 focus:outline-none px-6 py-1.5 font-semibold rounded-lg text-sm lg:text-base hover:bg-blue-400`}
          onClick={() => {
            markAllReadMutation.mutate();
          }}
        >
          Clear All
        </button>
      </FlexBtwWrapper>
      <div className="mt-5 max-w-2xl w-full mx-auto flex flex-col items-center gap-1 lg:gap-2 pb-10">
        {allNotifications.map((n: notificationProps) => (
          <NotificationCard
            key={n.id}
            n={n}
            remove={() => {
              markReadMutation.mutate(n.id);
            }}
          />
        ))}
        {isFetchingNextPage && (
          <div className="flex items-center justify-center w-full">
            <Spinner1
              size="size-4 lg:size-5"
              fill="fill-gray-800 dark:fill-gray-200"
              color="text-gray-200 dark:text-blk3"
            ></Spinner1>
          </div>
        )}
        <div ref={loadMoreRef} />
      </div>
    </div>
  );
}
