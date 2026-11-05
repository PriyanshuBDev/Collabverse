import { Dispatch, SetStateAction, useState } from "react";
import {
  memberProps,
  projectInviteUserProps,
  wsUsersForInviteResProps,
} from "@/app/interfaces";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Xbtn from "@/components/btns/Xbtn";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Searchbar from "@/components/project/Overview/Searchbar";
import Spinner2 from "@/components/loadings/Spinner2";
import { AddUserSvg } from "@/components/svg/AddUserSvg";
import { useUsersToInviteProject } from "@/lib/queries/workspace/project/invitation/useUsersToInviteProject";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import InviteUserCard from "./InviteUserCard";
import ExpireAtPicker from "@/components/btns/workspace/invitation/ExpireAtPicker";

export default function InviteUserPicker({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { role } = useCurrentProject();
  const [expireAt, setExpireAt] = useState<Date | undefined>(undefined);
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
    inviteUsers,
  } = useUsersToInviteProject(search);
  const [selected, setSelected] = useState<projectInviteUserProps[]>([]);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: wsUsersForInviteResProps) => page.users) ?? [];
  if (inviteUsers.isPending)
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
  if (role === "Viewer") {
    return null;
  }
  return (
    <OverlayWrapper active={show}>
      <div className="max-w-xl lg:w-sm w-xs">
        <div className="flex justify-end">
          <Xbtn
            size="size-6"
            addOns="-mt-2"
            onClick={() => {
              setSelected([]);
              setShow(false);
            }}
          />
        </div>
        <div className="text-gray-900 dark:text-gray-100 mb-3 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
          <AddUserSvg />
          Create Project
        </div>
        <ExpireAtPicker
          expireAt={expireAt}
          setExpireAt={setExpireAt}
          removeTitle
        />
        <div className="flex items-center justify-center w-full mt-2">
          <Searchbar
            search={search}
            setSearch={setSearch}
            placeholder="Search users"
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
                {allUsers.map((u: memberProps) => (
                  <InviteUserCard
                    key={u.id}
                    user={u}
                    setMembers={setSelected}
                    members={selected}
                    currentUserRole={role}
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
              inviteUsers.mutate({
                users: selected.map((s: projectInviteUserProps) => ({
                  id: s.id,
                  role: s.role,
                })),
                expireAt,
              });
              setShow(false);
              setSearch("");
              setSelected([]);
            }
          }}
        >
          Send Invitation
        </button>
      </div>
    </OverlayWrapper>
  );
}
