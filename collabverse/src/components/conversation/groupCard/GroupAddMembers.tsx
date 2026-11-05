import {
  groupUsersProps,
  memberProps,
  usersToAddGroupResProps,
} from "@/app/interfaces";
import Spinner1 from "@/components/loadings/Spinner1";
import Searchbar from "@/components/project/Overview/Searchbar";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useAddUsersToGroup } from "@/lib/queries/workspace/conversation/group/useAddUsersToGroup";
import { useUsersToAddGroup } from "@/lib/queries/workspace/conversation/group/useUsersToAddGroup";
import { Dispatch, SetStateAction, useState } from "react";
import GroupAddMembersCard from "./GroupAddMembersCard";

export default function GroupAddMembers({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { id: conversationId } = useCurrentConversation();
  const [selectedMembers, setSelectedMembers] = useState<groupUsersProps[]>([]);
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useUsersToAddGroup(search, conversationId);
  const addUsers = useAddUsersToGroup();
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: usersToAddGroupResProps) => page.users) ?? [];
  const disabled = selectedMembers.length <= 0;
  if (addUsers.isPending) {
    return (
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 visible`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }
  if (!show) return null;
  return (
    <div>
      <div className="flex items-center gap-4 mb-3">
        <div
          className="p-2 rounded-md bg-gray-200 dark:bg-blk6 hover:bg-gray-400 dark:hover:bg-blk8 cursor-pointer text-gray-900 dark:text-gray-100"
          onClick={() => {
            setShow(false);
            setSelectedMembers([]);
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold px-1">
          Add Members
        </div>
      </div>
      {allUsers.length > 0 && (
        <Searchbar
          setSearch={setSearch}
          search={search}
          placeholder="Search Users"
          width="max-w-md w-full"
          padding="px-3  py-1.5 ps-8"
        />
      )}
      <div className="mt-3">
        {isPending ? (
          <div className="flex items-center justify-center h-90">
            <Spinner1 size="size-8 lg:size-10" />
          </div>
        ) : allUsers.length > 0 ? (
          <div
            className="flex gap-0.5 flex-col h-65 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100 thinScrollbar"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {allUsers.map((m: memberProps) => (
              <GroupAddMembersCard
                m={m}
                setSelectedMembers={setSelectedMembers}
                key={m.id}
                selectedMembers={selectedMembers}
              />
            ))}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center mt-2">
                <Spinner1 size="size-5 lg:size-6" />
              </div>
            )}
            <div ref={loadMoreRef} />
          </div>
        ) : (
          <div className="text-gray-500 flex items-center justify-center text-base h-50">
            No users found
          </div>
        )}
      </div>
      <div className="flex items-center justify-end gap-2 lg:gap-3 mt-3">
        <button
          className={`min-w-20 h-8  cursor-pointer rounded-md text-sm lg:text-base  hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
          onClick={() => {
            setSelectedMembers([]);
            setShow(false);
          }}
        >
          cancel
        </button>
        <button
          className={`min-w-20 h-8 cursor-pointer rounded-md text-sm lg:text-base  ${
            disabled
              ? " text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-blk5"
              : "text-white bg-blue-500"
          }`}
          onClick={() => {
            addUsers.mutate(
              selectedMembers.map((s: groupUsersProps) => ({
                id: s.id,
                role: s.role,
              })),
            );
            setSelectedMembers([]);
          }}
        >
          Add {selectedMembers.length}
        </button>
      </div>
    </div>
  );
}
