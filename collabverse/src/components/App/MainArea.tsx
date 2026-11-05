"use client";

import { useWorkspaceCard } from "@/lib/queries/workspace/useWorkspaceCard";
import { toast } from "sonner";
import SearchAndCard from "../workspaces/SearchAndCards";
import SearchbarSkeleton from "../skeletons/SearchbarSkeleton";
import WsCardSkeleton from "../skeletons/WsCardSkeleton";
import { useSkeletonCount } from "@/lib/hooks/useSkeletonCount";
import EmptyWorkspace from "./EmptyWorkspaceAnimation";

export default function MainArea() {
  const count = useSkeletonCount(8, 4, 6, 8, 10);
  const { data, isLoading, isError } = useWorkspaceCard();

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
        <EmptyWorkspace />
      </div>
    );

  return (
    <>
      <SearchAndCard
        gridCols="2xl:grid-cols-5 xl:grid-cols-4 md:grid-cols-3 grid-cols-2"
        data={data}
        placeholder="Search workspaces..."
      />
    </>
  );
}
