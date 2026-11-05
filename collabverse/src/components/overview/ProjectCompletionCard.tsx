"use client";

import ProjectCompletionChart from "@/components/charts/ProjectCompletionChart";
import CompletionBar, {
  CBDataProps,
} from "@/components/progress/CompletionBar";
import HomeWrapper from "@/components/wrappers/HomeWrapper";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useProjectCompletion } from "@/lib/queries/workspace/overview/useProjectCompletion";
import Spinner1 from "../loadings/Spinner1";

export default function ProjectCompletionCard() {
  const { data, isError, error, isLoading } = useProjectCompletion();
  useIsErrorToast(isError, "Failed to fetch task priority data", error);
  return (
    <div className="mt-5 h-full w-full">
      <HomeWrapper>
        <div className="flex flex-col items-centerw-full">
          <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
            Projects Status
          </div>
          <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
            Status of completion across projects
          </div>
        </div>
        <>
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            <>
              <div className="h-[60%]">
                <ProjectCompletionChart
                  value={
                    data.find((d: CBDataProps) => d.status === "Done")?.value ??
                    0
                  }
                  total={data.reduce(
                    (acc: number, cur: CBDataProps) => acc + cur.value,
                    0,
                  )}
                ></ProjectCompletionChart>
              </div>
              <div className="lg:mt-5 mt-2">
                <CompletionBar data={data}></CompletionBar>
              </div>
            </>
          ) : (
            <div className="flex items-center w-full h-full justify-center">
              No data found
            </div>
          )}
        </>
      </HomeWrapper>
    </div>
  );
}
