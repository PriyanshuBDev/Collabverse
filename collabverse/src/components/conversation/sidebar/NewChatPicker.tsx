import { memberProps, usersToAddGroupResProps } from "@/app/interfaces";
import Xbtn from "@/components/btns/Xbtn";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import useMounted from "@/lib/hooks/useMounted";
import { Dispatch, SetStateAction, useState } from "react";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import Searchbar from "@/components/project/Overview/Searchbar";
import NewGroupCard from "./NewGroupCard";
import { useNewUsersForDm } from "@/lib/queries/workspace/conversation/dm/new/useNewUsersForDm";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "@/components/loadings/Spinner1";
// import { useRouter } from "next/navigation";
// import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useCreateNewDm } from "@/lib/queries/workspace/conversation/dm/new/useCreateNewDm";

export default function NewChatPicker({
  setShow,
  show,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
}) {
  const mounted = useMounted();
  const [search, setSearch] = useState("");
  // const { slug } = useCurrentWorkspace();
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useNewUsersForDm(search);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: usersToAddGroupResProps) => page.users) ?? [];
  const [showGroupCard, setShowGroupCard] = useState(false);
  const { mutate, isPending: isNewDmPending } = useCreateNewDm(true);
  const close = () => {
    setShow(false);
  };
  if (!mounted) return null;

  return (
    <>
      <OverlayWrapper active={show} addOns="w-sm h-121">
        <div className={`${showGroupCard ? "pointer-events-none hidden" : ""}`}>
          <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold px-1 mb-2 flex items-center justify-between">
            New Chat
            <div className="flex justify-end -mr-2 ">
              <Xbtn
                size="size-6"
                onClick={() => {
                  close();
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            <Searchbar
              search={search}
              setSearch={setSearch}
              placeholder="Search users..."
            ></Searchbar>
          </div>
          <div className="mt-3">
            {isPending ? (
              <div className="flex items-center justify-center h-90">
                <Spinner1 size="size-8 lg:size-10" />
              </div>
            ) : allUsers.length > 0 ? (
              <div
                className="flex gap-1 flex-col h-90 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100 thinScrollbar"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
              >
                <div
                  className=" hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg flex items-center gap-2  "
                  onClick={() => setShowGroupCard(true)}
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-full border border-gray-400 dark:border-blk9">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                  <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
                    New Group
                  </div>
                </div>
                {allUsers.map((m: memberProps) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg active:scale-98 transition-transform duration-150"
                    onClick={() => {
                      // router.push(`/app/${slug}/conversation/new/${m.id}`);
                      mutate(m.id);
                      close();
                    }}
                  >
                    <div className="w-fit ">
                      {m.avatar ? (
                        <div
                          className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                          onClick={() => {}}
                        >
                          <Image
                            alt={"userAvatar"}
                            src={m.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full flex justify-center items-center cursor-pointer `}
                          style={{ background: gradientBgFromName(m.name) }}
                          onClick={() => {}}
                        >
                          <div className="font-semibold text-sm text-white">
                            {getInitials(m.name)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold ">
                        {m.name}
                      </div>
                      <div className="text-xs text-blue-500">{m.username}</div>
                    </div>
                  </div>
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
        </div>
        {showGroupCard && (
          <NewGroupCard setShow={setShowGroupCard} setShowCard={setShow} />
        )}
      </OverlayWrapper>
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
          isNewDmPending ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    </>
  );
}
