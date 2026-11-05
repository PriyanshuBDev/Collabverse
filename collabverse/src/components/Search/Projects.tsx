import { ProjectCardProps } from "@/app/interfaces";
import ProjectCardSkeleton from "../skeletons/ProjectCardSkeleton";
import { useEffect } from "react";
import { useGetProjects } from "@/lib/queries/workspace/project/useGetProjects";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { toast } from "sonner";
import ProjectCard from "../projects/ProjectCard";
import { getProjectsResProps } from "@/lib/axios/workspace/project/getProjects";

export default function Projects({ search }: { search: string }) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useGetProjects(search);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });

  const allProjects =
    data?.pages.flatMap((page: getProjectsResProps) => page.projects) ?? [];
  useEffect(() => {
    if (isError) {
      toast.error("Someting went wrong. Try again later.");
    }
  }, [isError]);

  return (
    <div className="w-full h-full">
      {isLoading ? (
        <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 xl:gap-5 gap-3 mt-6 lg:mt-8">
          <ProjectCardSkeleton />
        </div>
      ) : allProjects.length > 0 ? (
        <div className="mt-6 lg:mt-8">
          <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 grid-cols-2 xl:gap-5 gap-3">
            {allProjects.map((ps: ProjectCardProps) => (
              <div className="col-span-1" key={ps.id}>
                <ProjectCard ps={ps}></ProjectCard>
              </div>
            ))}
            {isFetchingNextPage && <ProjectCardSkeleton count={3} />}
            <div ref={loadMoreRef} />
          </div>
        </div>
      ) : (
        <div className="flex w-full h-full justify-center items-center text-sm md:text-lg lg:text-xl xl:text-2xl text-gray-500">
          No projects found
        </div>
      )}
    </div>
  );
}
