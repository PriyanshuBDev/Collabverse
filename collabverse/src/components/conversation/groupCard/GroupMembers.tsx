import {
  getGroupUsersResProps,
  GroupData,
  groupUsersProps,
} from "@/app/interfaces";
import { Dispatch, SetStateAction, useState } from "react";
import GroupMembersCard from "./GroupMembersCard";
import { useGroupUsers } from "@/lib/queries/workspace/conversation/group/useGroupUsers";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useUserProfile } from "@/lib/queries/user/useUserProfile";
import Searchbar from "@/components/project/Overview/Searchbar";
import { AddUserSvg } from "@/components/svg/AddUserSvg";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import GroupAddMembers from "./GroupAddMembers";
import { GroupRole } from "@prisma/client";

export default function GroupMembers({
  groupData,
  setShowAddMembers,
  showAddMembers,
}: {
  groupData: GroupData;
  setShowAddMembers: Dispatch<SetStateAction<boolean>>;
  showAddMembers: boolean;
}) {
  const [search, setSearch] = useState("");
  const { user } = useUserProfile();
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
    removingMutation,
    roleChangingMutation,
  } = useGroupUsers(search);
  useIsErrorToast(isError, "Failed to fetch group users", error);
  const users =
    data?.pages.flatMap((page: getGroupUsersResProps) => page.users) ?? [];
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  const currentUserRole = groupData.currentUserRole;
  const canAdd = currentUserRole === "Admin";
  if (!user) return null;
  return (
    <div>
      <div className={`${showAddMembers ? "pointer-events-none hidden" : ""}`}>
        <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold mb-2 px-1">
          Members ({groupData.totalMembers})
        </div>
        {(users.length > 0 || isPending) && (
          <Searchbar
            setSearch={setSearch}
            search={search}
            placeholder="Search Users"
            width="max-w-md w-full"
            padding="px-3  py-1.5 ps-8"
          />
        )}

        <div className="mt-3">
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
          <div
            className="flex gap-0.5 flex-col h-70 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100 thinScrollbar"
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {isPending ? (
              <ProjectUserPickerSkeleton count={5} />
            ) : !data || users.length === 0 ? (
              <div
                className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
              >
                No members found
              </div>
            ) : (
              <>
                {groupData.currentUserStatus === "Active" &&
                  currentUserRole && (
                    <GroupMembersCard
                      m={{ ...user, role: currentUserRole }}
                      key={user.id}
                      currentUserRole={currentUserRole}
                      handleRoleChange={(role: GroupRole) =>
                        roleChangingMutation.mutate({ role, userId: user.id })
                      }
                      handleRemove={() =>
                        removingMutation.mutate({ userId: user.id })
                      }
                    />
                  )}
                {users.map((m: groupUsersProps) => (
                  <GroupMembersCard
                    m={m}
                    key={m.id}
                    currentUserRole={currentUserRole}
                    handleRoleChange={(role: GroupRole) =>
                      roleChangingMutation.mutate({ role, userId: m.id })
                    }
                    handleRemove={() =>
                      removingMutation.mutate({ userId: m.id })
                    }
                  />
                ))}
                {isFetchingNextPage && <ProjectUserPickerSkeleton count={5} />}
                <div ref={loadMoreRef} />
              </>
            )}
          </div>
        </div>
      </div>
      <GroupAddMembers show={showAddMembers} setShow={setShowAddMembers} />
    </div>
  );
}
