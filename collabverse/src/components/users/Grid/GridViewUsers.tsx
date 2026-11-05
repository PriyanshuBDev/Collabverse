import { useEffect } from "react";
import {
  Tier,
  usersProjFilterProps,
  usersTaskFilterProps,
  wsUserProps,
  wsUserResPropsGrid,
} from "../../../app/interfaces";
import GridCard from "./GridCard";
import { useWsUserGrid } from "@/lib/queries/workspace/users/useWsUserGrid";
import UserGridSkeleton from "@/components/skeletons/UserGridSkeleton";
import { toast } from "sonner";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { combinedRoleChange } from "@/lib/axios/workspace/users/changeUserRole";

import Spinner1 from "@/components/loadings/Spinner1";

export default function GridViewUsers({
  project,
  task,
  search,
}: {
  project?: usersProjFilterProps;
  task?: usersTaskFilterProps;
  search?: string;
}) {
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    removeUser,
    removing,
    changeRole,
    changingRole,
  } = useWsUserGrid(search, project?.id, task?.id);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong while fetching users");
    }
  }, [isError]);

  if (isPending) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-5 animate-pulse">
        <UserGridSkeleton />
      </div>
    );
  }
  const allUsers =
    data?.pages?.flatMap((page: wsUserResPropsGrid) => page.users) ?? [];
  if (!data || allUsers.length === 0) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No users found
        </div>
      </div>
    );
  }

  const type: Tier = data?.pages?.[0]?.type ?? "Workspace";
  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-5">
        {" "}
        {allUsers.map((u: wsUserProps) => (
          <div className="col-span-1" key={u.id}>
            <GridCard
              type={type}
              user={u}
              onRemove={() => removeUser({ userId: u.id })}
              removing={removing}
              onChangeRole={(role: combinedRoleChange) =>
                changeRole({ role, userId: u.id })
              }
              changingRole={changingRole}
              project={project}
              task={task}
            ></GridCard>
          </div>
        ))}
        {isFetchingNextPage && <UserGridSkeleton count={6} />}
        <div ref={loadMoreRef} />
      </div>
      {
        <div
          className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
            removing || changingRole
              ? "visible"
              : "invisible pointer-events-none"
          }`}
        >
          <Spinner1
            fill="fill-gray-800 dark:fill-gray-200"
            size="size-10 lg:size-16"
            color="text-gray-200 dark:text-blk3"
          ></Spinner1>
        </div>
      }
    </div>
  );
}
