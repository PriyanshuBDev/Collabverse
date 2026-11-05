"use client";

import { AddUserSvg } from "@/components/svg/AddUserSvg";
import { useIsAllowedToAddTaskUser } from "@/lib/hooks/useIsAllowedTask";
import { useState } from "react";
import TaskUserCard from "./TaskUserCard";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import Searchbar from "@/components/project/Overview/Searchbar";
import { useTaskUsers } from "@/lib/queries/workspace/project/task/users/useTaskUsers";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import useMounted from "@/lib/hooks/useMounted";
import { createPortal } from "react-dom";
import AddTaskMembers from "./AddTaskMembers";
import { TaskRole } from "@prisma/client";
import { taskUserProps, taskUserResProps } from "@/app/interfaces";

export default function TaskUserArea() {
  const mounted = useMounted();
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    roleChange,
    remove,
  } = useTaskUsers(search);
  const [showAddMembers, setShowAddMembers] = useState(false);
  const canAdd = useIsAllowedToAddTaskUser();
  const { name } = useCurrentTask();
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages.flatMap((page: taskUserResProps) => page.users) ?? [];
  if (!mounted) return null;
  const handleRemove = (userId: string) => {
    return remove.mutate({ userId });
  };
  const handleRoleChange = (role: TaskRole, userId: string) => {
    return roleChange.mutate({ role, userId });
  };
  return (
    <>
      <div className="flex  flex-col gap-2 w-full">
        <Searchbar
          setSearch={setSearch}
          search={search}
          placeholder="Search Users"
          width="max-w-md w-full"
          padding="px-3  py-1.5 ps-8"
        />
        {canAdd && (
          <div
            className=" hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg flex items-center gap-2  "
            onClick={() => setShowAddMembers(true)}
          >
            <div className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-full border border-gray-400 dark:border-blk9">
              <AddUserSvg size="size-4 lg:size-5" />
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
              Add new users
            </div>
          </div>
        )}
        <div className="flex flex-col min-h-20 max-h-119 overflow-y-auto thinScrollbar">
          {isPending ? (
            <ProjectUserPickerSkeleton count={5} />
          ) : !data || allUsers.length === 0 ? (
            <div
              className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
            >
              No users found
            </div>
          ) : (
            <>
              {allUsers.map((u: taskUserProps) => (
                <TaskUserCard
                  key={u.id}
                  taskName={name}
                  user={u}
                  canChange={canAdd}
                  handleRemove={handleRemove}
                  handleRoleChange={handleRoleChange}
                />
              ))}{" "}
              {isFetchingNextPage && <ProjectUserPickerSkeleton count={5} />}
              <div ref={loadMoreRef} />
            </>
          )}
        </div>
      </div>
      {mounted &&
        createPortal(
          <AddTaskMembers setShow={setShowAddMembers} show={showAddMembers} />,
          document.body,
        )}
    </>
  );
}
