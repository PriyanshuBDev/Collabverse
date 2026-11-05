import { Dispatch, SetStateAction, useState } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Searchbar from "../project/Overview/Searchbar";
import {
  memberAndRoleProps,
  wsMembersProps,
  wsUserProps,
  wsUserResPropsGrid,
} from "@/app/interfaces";
import Xbtn from "../btns/Xbtn";
import UserCard from "./UserCard";
import { useWsUserGrid } from "@/lib/queries/workspace/users/useWsUserGrid";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { WsRole } from "@prisma/client";
import ProjectUserPickerSkeleton from "../skeletons/ProjectUserPickerSkeleton";

export default function UserPicker({
  show,
  setShow,
  handleTransfer,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  type: string;
  slug: string;
  handleTransfer: (id: string) => void;
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
  } = useWsUserGrid(search);
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
    data?.pages?.flatMap((page: wsUserResPropsGrid) => page.users) ?? [];
  const filteredUsers: wsMembersProps[] = allUsers
    .filter((u: wsUserProps) => u.id !== currentUser.id)
    .map((u: wsUserProps) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      role: u.role as WsRole,
    }));
  return (
    <OverlayWrapper active={show}>
      <div className="max-w-xl lg:w-sm">
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
            placeholder="Search users"
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
                {filteredUsers.map((u: wsMembersProps) => (
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
