import { useState } from "react";
import Pagination from "../users/List/Pagination";
import SearchTaskCard from "./SearchTaskCard";
import { useSearchTasks } from "@/lib/queries/workspace/search/useSearchTasks";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import TaskBoardSkeleton from "../skeletons/TaskBoardSkeleton";
import { searchTaskProps } from "@/app/interfaces";

export function AllTaskCards({ search }: { search: string }) {
  const [page, setPage] = useState(1);
  const { data, isError, error, isLoading } = useSearchTasks({ page, search });
  useIsErrorToast(isError, "Filted to fetch tasks", error);
  if (!isLoading && data && data.tasks.length === 0) {
    return (
      <div className="flex justify-center items-center w-full h-screen text-base lg:text-xl ">
        No tasks found
      </div>
    );
  }
  return (
    <div>
      <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
        {isLoading ? (
          <TaskBoardSkeleton row />
        ) : (
          data &&
          data.tasks.map((t: searchTaskProps) => (
            <SearchTaskCard key={t.id} task={t} />
          ))
        )}
      </div>
      {data && (
        <Pagination
          page={page}
          setPage={setPage}
          totalPage={Math.ceil(data.total / data.limit)}
          total={data.total}
        />
      )}
    </div>
  );
}
