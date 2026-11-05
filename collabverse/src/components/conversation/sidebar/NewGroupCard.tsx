import {
  createGroupUserProps,
  memberProps,
  usersToAddGroupResProps,
} from "@/app/interfaces";
import Searchbar from "@/components/project/Overview/Searchbar";
import ProjectUserPickerSkeleton from "@/components/skeletons/ProjectUserPickerSkeleton";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useUsersToAddGroup } from "@/lib/queries/workspace/conversation/group/useUsersToAddGroup";
import Image from "next/image";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import GroupUserCard from "./GroupUserCard";
import TitleAndElement from "@/components/myTasks/TitleAndElement";
import NameValidityCard from "@/components/btns/workspace/NameValidityCard";
import { GroupSvg } from "@/components/svg/GroupSvg";
import { PencilSvg } from "@/components/svg/PencilSvg";
import { PositionProps } from "../chatArea/bubble/ChatBubble";
import AvatarPicker from "@/components/Avatar/AvatarPicker";
import ClickAnywhere from "@/components/dropdowns/ClickAnywhere";
import { useCreateGroup } from "@/lib/queries/workspace/conversation/group/useCreateGroup";
import Spinner2 from "@/components/loadings/Spinner2";

export default function NewGroupCard({
  setShow,
  setShowCard,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  setShowCard: Dispatch<SetStateAction<boolean>>;
}) {
  const { createGroup, isCreating } = useCreateGroup();
  const [search, setSearch] = useState("");
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    error,
  } = useUsersToAddGroup(search);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch users", error);
  const allUsers =
    data?.pages?.flatMap((page: usersToAddGroupResProps) => page.users) ?? [];
  const [showFinal, setShowFinal] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<createGroupUserProps[]>(
    [],
  );
  const [showWarning, setShowWarning] = useState(false);
  const [avatar, setAvatar] = useState<File | undefined>(undefined);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const [description, setDescription] = useState<string>();
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;

    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(avatar);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [avatar]);
  if (isCreating)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <GroupSvg size="size-5 lg:size-7" />
        </Spinner2>
      </OverlayWrapper>
    );
  const disabled = !name || name.length < 6;
  const close = () => {
    setName("");
    setDescription(undefined);
    setAvatar(undefined);
    setSelectedUsers([]);
    setShow(false);
    setShowCard(false);
  };
  return (
    <>
      {!showFinal ? (
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div
              className="p-2 rounded-md bg-gray-200 dark:bg-blk6 hover:bg-gray-400 dark:hover:bg-blk8 cursor-pointer text-gray-900 dark:text-gray-100"
              onClick={() => {
                setShowWarning(true);
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
              Select Members
            </div>
          </div>
          <div className="flex items-center justify-center w-full">
            <Searchbar
              search={search}
              setSearch={setSearch}
              placeholder="Search users..."
            ></Searchbar>
          </div>
          {isPending ? (
            <div
              className={`h-75 overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
            >
              <ProjectUserPickerSkeleton count={7} />
            </div>
          ) : (
            <>
              {" "}
              {!data || allUsers.length === 0 ? (
                <div
                  className={`h-75 mt-3 flex items-center justify-center text-xs  lg:text-base`}
                >
                  No users found
                </div>
              ) : (
                <div
                  className={`h-75 overflow-y-auto mt-3 flex  gap-1 flex-col w-full thinScrollbar`}
                >
                  {allUsers.map((u: memberProps) => (
                    <GroupUserCard
                      key={u.id}
                      user={u}
                      setUsers={setSelectedUsers}
                      users={selectedUsers}
                    />
                  ))}
                  {isFetchingNextPage && (
                    <ProjectUserPickerSkeleton count={6} />
                  )}
                  <div ref={loadMoreRef} />
                </div>
              )}
            </>
          )}
          <div className="flex items-center justify-center mt-3">
            <button
              className={`w-full h-10  cursor-pointer rounded-md text-sm lg:text-base text-white bg-blue-500`}
              onClick={() => {
                setShowFinal(true);
              }}
            >
              Continue {selectedUsers.length}
            </button>
          </div>
        </div>
      ) : (
        <div className="relative h-full">
          <div className="flex items-center gap-4 mb-3">
            <div
              className="p-2 rounded-md bg-gray-200 dark:bg-blk6 hover:bg-gray-400 dark:hover:bg-blk8 cursor-pointer text-gray-900 dark:text-gray-100"
              onClick={() => {
                setShowWarning(true);
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
            <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold px-1 flex items-center gap-3">
              <div>Create Group</div>
              <div className="text-gray-500  text-base">
                ({selectedUsers.length} Member
                {selectedUsers.length > 1 ? "s" : ""})
              </div>
            </div>
          </div>
          <div className="flex justify-center w-full flex-col items-center">
            <div className="relative w-fit group overflow-hidden">
              {previewUrl ? (
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                  onClick={() => {}}
                >
                  <Image
                    alt={"groupAvatar"}
                    src={previewUrl}
                    className="object-center"
                    fill
                  ></Image>
                </div>
              ) : name ? (
                <div
                  className={`w-17 h-17 lg:w-20 lg:h-20 rounded-full  flex justify-center items-center  `}
                  style={{ background: gradientBgFromName(name) }}
                >
                  <div className="font-semibold text-3xl text-white ">
                    {getInitials(name)}
                  </div>
                </div>
              ) : (
                <div className="w-17 h-17 lg:w-20 lg:h-20 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-full border border-gray-400 dark:border-blk9">
                  <GroupSvg size="size-8"></GroupSvg>
                </div>
              )}
              <div
                className="z-110 absolute inset-0 flex items-center justify-center group-hover:bg-black/20 rounded-full cursor-pointer invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={handleClick}
              >
                <div className="bg-gray-500/40 p-3 rounded-full z-111 ">
                  <PencilSvg size="size-4" />
                </div>
              </div>
            </div>

            <div className="text-gray-500 leading-none mt-2">(optional)</div>
          </div>

          <div className="mt-10 ">
            <TitleAndElement title="Name">
              <NameValidityCard name={name} setName={setName} />
            </TitleAndElement>

            <div className="flex items-center gap-2 mb-1 mt-2">
              <div className="text-gray-900 dark:text-gray-100  text-sm lg:text-base font-semibold">
                Description
              </div>
              <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                ({description?.length ?? 0} / 1000)
              </div>
            </div>
            <textarea
              maxLength={1000}
              value={description}
              placeholder="Enter description"
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                setDescription(e.target.value);
                const target = e.target;
                target.style.height = "auto"; // reset height
                target.style.height = target.scrollHeight + "px";
              }}
              className="resize-none overflow-hidden  max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
            />
          </div>

          <div className="absolute bottom-5 left-0 right-0 flex  justify-center">
            <button
              disabled={disabled}
              className="p-1 w-full mx-5 bg-blue-500 text-gray-100 hover:bg-blue-600 cursor-pointer rounded-md text-lg disabled:cursor-not-allowed disabled:bg-gray-300 disabled:dark:bg-gray-700"
              onClick={async () => {
                try {
                  await createGroup({
                    name,
                    description,
                    avatar,
                    users: selectedUsers,
                  });
                } finally {
                  close();
                }
              }}
            >
              Create
            </button>
          </div>
        </div>
      )}
      {createPortal(
        <OverlayWrapper active={showWarning} addOns="lg:w-sm">
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-md ">
            Cancel creating group ?
          </div>
          <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
            <button
              className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
              onClick={() => setShowWarning(false)}
            >
              No
            </button>
            <button
              className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
              onClick={() => {
                close();
                setShowWarning(false);
                setShowFinal(false);
              }}
            >
              Yes
            </button>
          </div>
        </OverlayWrapper>,
        document.body,
      )}
      <ClickAnywhere setMenuPos={setMenuPos} menuPos={menuPos} width="w-35">
        <ul>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={() => {
              avatarInputRef.current?.click();
              setMenuPos(null);
            }}
          >
            Change
          </li>
          {avatar && previewUrl && (
            <li
              className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
              onClick={() => {
                setAvatar(undefined);
                setMenuPos(null);
              }}
            >
              Remove
            </li>
          )}
        </ul>
      </ClickAnywhere>
      <AvatarPicker
        avatarInputRef={avatarInputRef}
        setSelected={setAvatar}
      ></AvatarPicker>
    </>
  );
}
