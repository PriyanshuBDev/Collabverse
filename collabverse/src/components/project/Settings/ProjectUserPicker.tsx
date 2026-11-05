import { Dispatch, SetStateAction, useState } from "react";
import {
  memberAndRoleProps,
  projectFilteredUsersResProps,
  ProjectMembersProps,
} from "@/app/interfaces";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Xbtn from "@/components/btns/Xbtn";
import Searchbar from "../Overview/Searchbar";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { PRole } from "@prisma/client";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useProjectUserFilterByRole } from "@/lib/queries/workspace/project/users/useProjectUserFilterByRole";
import UserCard from "@/components/Settings/UserCard";

export default function ProjectUserPicker({
  show,
  setShow,
  handleTransfer,
  projectId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  handleTransfer: (newOwnerId: string) => void;
  projectId: string;
}) {
  const currentUser = useCurrentUser();
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useProjectUserFilterByRole({ projectId, search, role: "Viewer" });
  const [selected, setSelected] = useState<memberAndRoleProps | undefined>(
    undefined,
  );
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: projectFilteredUsersResProps) => page.users) ??
    [];
  const filteredUsers: ProjectMembersProps[] = allUsers
    .filter((u: ProjectMembersProps) => u.id !== currentUser.id)
    .map((u: ProjectMembersProps) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      role: u.role as PRole,
    }));

  return (
    <OverlayWrapper active={show}>
      <div className="max-w-xl lg:w-sm w-xs">
        <div className="flex justify-end">
          <Xbtn
            size="size-6"
            addOns="-mt-2 pb-1"
            onClick={() => {
              setShow(false);
            }}
          />
        </div>
        <div className="flex items-center justify-center w-full">
          <Searchbar
            search={search}
            setSearch={setSearch}
            placeholder="Search users (except viewers)"
          ></Searchbar>
        </div>
        {selected && (
          <>
            {" "}
            <div className="text-gray-500 text-xs lg:text-sm my-1">
              Transfer To
            </div>
            <UserCard
              m={selected}
              key={selected.id}
              selected={selected}
              setSelected={setSelected}
            />
            <div className="text-gray-500 text-xs lg:text-sm my-1">Users</div>
          </>
        )}
        {isPending ? (
          <div
            className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
          >
            <ProjectUserPickerSkeleton count={7} />
          </div>
        ) : (
          <>
            {" "}
            {!data || filteredUsers.length === 0 ? (
              <div
                className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} mt-3 flex items-center justify-center text-xs  lg:text-base`}
              >
                No users found
              </div>
            ) : (
              <div
                className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
              >
                {filteredUsers.map((u: ProjectMembersProps) => (
                  <UserCard
                    m={u}
                    key={u.id}
                    selected={selected}
                    setSelected={setSelected}
                  />
                ))}
                {isFetchingNextPage && <ProjectUserPickerSkeleton count={6} />}
                <div ref={loadMoreRef} />
              </div>
            )}{" "}
          </>
        )}
        <button
          disabled={!selected}
          className="bg-blue-500  w-full rounded-md flex items-center justify-center h-10 font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-gray-300 disabled:dark:bg-gray-600 text-base lg:text-lg mt-3"
          onClick={() => {
            if (selected) {
              handleTransfer(selected.id);
            }
          }}
        >
          Transfer
        </button>
      </div>
    </OverlayWrapper>
  );
}
