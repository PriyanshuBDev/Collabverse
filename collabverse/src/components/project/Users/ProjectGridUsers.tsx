import {
  projectBasedTier,
  projectUserProps,
  projectUserResPropsGrid,
  usersTaskFilterProps,
} from "@/app/interfaces";
import Spinner1 from "@/components/loadings/Spinner1";
import UserGridSkeleton from "@/components/skeletons/UserGridSkeleton";
import GridCard from "@/components/users/Grid/GridCard";
import { projectTaskRole } from "@/lib/axios/workspace/project/users/roleChangeProjectUser";
import { combinedRoleChange } from "@/lib/axios/workspace/users/changeUserRole";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useProjectUserGrid } from "@/lib/queries/workspace/project/users/useProjectUserGrid";
const projectRoles: projectTaskRole[] = [
  "Manager",
  "Contributor",
  "Viewer",
  "Assignee",
  "Reviewer",
];

export function isProjectRole(
  role: combinedRoleChange,
): role is projectTaskRole {
  return projectRoles.includes(role as projectTaskRole);
}
export default function ProjectGridUsers({
  id,
  task,
  search,
}: {
  id: string;
  task: usersTaskFilterProps | undefined;
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
    error,
  } = useProjectUserGrid(id, search, task?.id);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);

  if (isPending) {
    return (
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-5 animate-pulse">
        <UserGridSkeleton />
      </div>
    );
  }
  const allUsers =
    data?.pages?.flatMap((page: projectUserResPropsGrid) => page.users) ?? [];
  if (!data || allUsers.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 flex items-center justify-center text-xs sm:text-base lg:text-xl">
          No users found
        </div>
      </div>
    );
  }

  const type: projectBasedTier = data?.pages?.[0]?.type ?? "Project";
  return (
    <div>
      <div className="grid grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-5">
        {" "}
        {allUsers.map((u: projectUserProps) => (
          <div className="col-span-1" key={u.id}>
            <GridCard
              type={type}
              user={u}
              onRemove={() => removeUser({ userId: u.id })}
              removing={removing}
              onChangeRole={(role: combinedRoleChange) => {
                if (isProjectRole(role)) {
                  changeRole({ role, userId: u.id });
                }
              }}
              changingRole={changingRole}
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
