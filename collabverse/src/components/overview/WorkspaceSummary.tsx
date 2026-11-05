"use client";

import { useWsSummary } from "@/lib/queries/workspace/overview/useWsSummay";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { wsSummaryProps } from "@/app/interfaces";
import WsSummarySkeleton from "../skeletons/WsSummarySkeleton";

export default function WorkspaceSummary() {
  const { data, isLoading, isError, error } = useWsSummary();
  useIsErrorToast(isError, "Failed to fetch task priority data", error);
  return (
    <div className="grid grid-cols-4 lg:gap-5 gap-3 w-full">
      {isLoading ? (
        <WsSummarySkeleton />
      ) : data && data.length > 0 ? (
        data?.map((d: wsSummaryProps, idx: number) => (
          <div key={idx} className="col-span-1">
            <HomeWrapper>
              <div className="flex flex-col items-center lg:gap-7 md:gap-5 gap-3">
                <div className="lg:text-xl text-gray-800 dark:text-gray-400 md:text-base text-xs text-nowrap">
                  {d.title}
                </div>
                <div className="lg:text-3xl text-xl text-black dark:text-gray-100">
                  {d.value}
                </div>
              </div>
            </HomeWrapper>
          </div>
        ))
      ) : (
        <div className="flex items-center w-full h-full justify-center">
          No data found
        </div>
      )}
    </div>
  );
}
