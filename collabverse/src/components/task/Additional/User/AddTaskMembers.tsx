import { Dispatch, SetStateAction, useState } from "react";
import {
  projectFilteredUsersResProps,
  ProjectMembersProps,
  taskMembersProps,
} from "@/app/interfaces";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Xbtn from "@/components/btns/Xbtn";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Searchbar from "@/components/project/Overview/Searchbar";
import AddTaskUserCard from "./AddTaskUserCard";
import { useAddUsers } from "@/lib/queries/workspace/project/task/users/useAddUsers";
import Spinner2 from "@/components/loadings/Spinner2";
import { AddUserSvg } from "@/components/svg/AddUserSvg";

export default function AddTaskMembers({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
    addUsers,
  } = useAddUsers(search);
  const [selected, setSelected] = useState<taskMembersProps[]>([]);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: projectFilteredUsersResProps) => page.users) ??
    [];
  if (addUsers.isPending)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <AddUserSvg size="size-5 lg:size-7" />
        </Spinner2>
      </OverlayWrapper>
    );

  return (
    <OverlayWrapper active={show}>
      <div className="max-w-xl lg:w-sm w-xs">
        <div className="flex justify-end">
          <Xbtn
            size="size-6"
            addOns="-mt-2 pb-1"
            onClick={() => {
              setSelected([]);
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

        {isPending ? (
          <div
            className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
          >
            <ProjectUserPickerSkeleton count={7} />
          </div>
        ) : (
          <>
            {" "}
            {!data || allUsers.length === 0 ? (
              <div
                className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} mt-3 flex items-center justify-center text-xs  lg:text-base`}
              >
                No users found
              </div>
            ) : (
              <div
                className={`${selected ? "h-49  lg:h-67" : "h-70  lg:h-90"} overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
              >
                {allUsers.map((u: ProjectMembersProps) => (
                  <AddTaskUserCard
                    key={u.id}
                    user={u}
                    setMembers={setSelected}
                    members={selected}
                  />
                ))}
                {isFetchingNextPage && <ProjectUserPickerSkeleton count={6} />}
                <div ref={loadMoreRef} />
              </div>
            )}{" "}
          </>
        )}
        <button
          disabled={selected.length == 0}
          className="bg-blue-500  w-full rounded-md flex items-center justify-center h-10 font-semibold text-white cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-gray-300 disabled:dark:bg-gray-600 text-base lg:text-lg mt-3"
          onClick={() => {
            if (selected.length > 0) {
              addUsers.mutate({
                users: selected.map((s) => ({ id: s.id, role: s.role })),
              });
              setShow(false);
              setSearch("");
            }
          }}
        >
          Add
        </button>
      </div>
    </OverlayWrapper>
  );
}
