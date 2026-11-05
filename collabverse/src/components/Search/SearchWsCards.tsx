"use client";

import { useWorkspaceCard } from "@/lib/queries/workspace/useWorkspaceCard";
import { toast } from "sonner";
import SearchbarSkeleton from "../skeletons/SearchbarSkeleton";
import WsCardSkeleton from "../skeletons/WsCardSkeleton";
import { useSkeletonCount } from "@/lib/hooks/useSkeletonCount";
import useIsDark from "@/lib/hooks/useIsDark";
import NewWsBtn from "../btns/workspace/NewWsBtn";
import WorkspaceCards from "../workspaces/WorkspaceCards";

export default function SearchWsCards({ search }: { search: string }) {
  const count = useSkeletonCount(8, 4, 6, 8, 10);
  const { data, isLoading, isError } = useWorkspaceCard(search);
  const isDark = useIsDark();

  if (isLoading)
    return (
      <div>
        <div className="mt-8 lg:mt-10 flex justify-start w-full ">
          <SearchbarSkeleton />
        </div>
        <div className="grid 2xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 grid-cols-2 mt-6 lg:mt-8 xl:gap-5 gap-3 animate-pulse ">
          {Array.from({ length: count }).map((_: unknown, i: number) => (
            <WsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  if (isError) {
    toast.error("Something went wrong while fetching workspaces");
    return null;
  }
  if (!data || data.length === 0)
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="bg-gray-200 dark:bg-blk3 rounded-xl border-2 border-gray-300 dark:border-gray-800 lg:rounded-2xl p-3 lg:p-5 flex flex-col items-center justify-center w-[18rem] lg:w-xs h-40 lg:h-50 ">
          <div className="bg-gray-300 dark:bg-blk5 rounded-md lg:rounded-lg p-2 lg:p-2.5 text-gray-700 dark:text-gray-300 w-fit flex justify-center">
            {isDark ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-5 lg:size-7"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 2.25a.75.75 0 0 0 0 1.5v16.5h-.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5h-.75V3.75a.75.75 0 0 0 0-1.5h-15ZM9 6a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm-.75 3.75A.75.75 0 0 1 9 9h1.5a.75.75 0 0 1 0 1.5H9a.75.75 0 0 1-.75-.75ZM9 12a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 0-1.5H9Zm3.75-5.25A.75.75 0 0 1 13.5 6H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM13.5 9a.75.75 0 0 0 0 1.5H15A.75.75 0 0 0 15 9h-1.5Zm-.75 3.75a.75.75 0 0 1 .75-.75H15a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75ZM9 19.5v-2.25a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1-.75.75h-4.5A.75.75 0 0 1 9 19.5Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5 lg:size-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
                />
              </svg>
            )}
          </div>
          <div className="text-gray-600 dark:text-gray-400 text-lg lg:text-xl mt-3 mb-2 lg:mt-5 lg:mb-3 ">
            No workspace found
          </div>
          <NewWsBtn label="Create" />
        </div>
      </div>
    );

  return (
    <div>
      {" "}
      <div className="mt-6 lg:mt-8">
        <WorkspaceCards
          gridCols={"2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-3 grid-cols-1"}
          data={data}
        ></WorkspaceCards>
      </div>
    </div>
  );
}
