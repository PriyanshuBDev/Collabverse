import { basicFormerMember, GroupData } from "@/app/interfaces";
import { EditBtn } from "@/components/btns/EditBtn";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import muteDateFormatter from "@/lib/functions/date/muteDateFormatter";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useAutoResizeTextArea } from "@/lib/hooks/useAutoResizeTextArea";
import { useGroupData } from "@/lib/queries/workspace/conversation/group/useGroupData";
import AvatarPicker from "@/components/Avatar/AvatarPicker";
import { PositionProps } from "@/components/ChatComponents/Bubble";
import ClickAnywhere from "@/components/dropdowns/ClickAnywhere";
import { StopSuccessBtn } from "@/components/btns/StopSuccessBtn";
import { format } from "date-fns";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function GroupOverview({
  data,
  open,
  closeGroup,
  showMute,
  setShowMute,
}: {
  data: GroupData;
  open: boolean;
  closeGroup: () => void;
  showMute: boolean;
  setShowMute: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    handleMute: { mutate },
    editDetails,
  } = useGroupData(data.id);
  const [readMore, setReadMore] = useState(false);
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore((s) => s.setUserId);
  const [avatar, setAvatar] = useState(data.avatar);
  const [editedAvatar, setEditedAvatar] = useState<File | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [showDescriptionEdit, setShowDescriptionEdit] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [editedDescription, setEditedDescription] = useState<
    string | undefined
  >(data?.description);
  const [editedName, setEditedName] = useState<string>(data?.name);
  const nameRef = useRef<HTMLTextAreaElement>(null);
  const [showNameEdit, setShowNameEdit] = useState(false);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const showAvatarBtn =
    Boolean(editedAvatar) || (avatarRemoved && Boolean(data.avatar));
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    el.style.height = "auto";

    const style = window.getComputedStyle(el);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);

    const contentHeight = el.scrollHeight - paddingTop - paddingBottom;
    const oneLineHeight = parseFloat(style.lineHeight);

    const finalHeight = Math.max(
      contentHeight + paddingTop + paddingBottom,
      oneLineHeight + paddingTop + paddingBottom,
    );

    el.style.height = `${finalHeight}px`;
  }, [editedName]);
  useAutoResizeTextArea(descriptionRef, showDescriptionEdit, editedDescription);
  useEffect(() => {
    if (!editedAvatar) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(editedAvatar);
    setPreviewUrl(url);
    setAvatarRemoved(false);
    setAvatar(undefined);
    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [editedAvatar]);

  useEffect(() => {
    if (!open) {
      setShowNameEdit(false);
      setEditedName(data?.name ?? "");
      setShowDescriptionEdit(false);
      setEditedDescription(data?.description);
      setAvatar(data.avatar);
      setEditedAvatar(undefined);
      setAvatarRemoved(!data.avatar);
    }
  }, [open, data]);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;
    setMenuPos({ x: e.clientX, y: e.clientY });
  };
  const isAllowedToEdit =
    data.permissions.includes("Edit_Group_Details") ||
    data.currentUserRole === "Admin";
  const isYou = (member: basicFormerMember) => {
    return member.id === currentUserId ? "You" : member.name;
  };
  return (
    <>
      <div className="px-3 pb-3 flex flex-col items-center justify-center">
        <div className="w-fit ">
          {data.currentUserStatus === "Active" ? (
            <div className="relative w-fit group overflow-visible">
              {avatar || previewUrl ? (
                <div className="relative w-14 h-14 lg:h-17 lg:w-17 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                  <Image
                    key={previewUrl ?? avatar ?? "avatar"}
                    alt={"GroupAvatar"}
                    src={previewUrl ?? avatar ?? ""}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : editedName ? (
                <div
                  className={` w-14 h-14 lg:h-17 lg:w-17 rounded-lg  flex justify-center items-center  `}
                  style={{ background: gradientBgFromName(editedName) }}
                >
                  <div className="font-semibold text-3xl text-white ">
                    {getInitials(editedName)}
                  </div>
                </div>
              ) : (
                <div className="w-14 h-14 lg:h-17 lg:w-17 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-lg border border-gray-400 dark:border-blk9"></div>
              )}
              <div
                className="z-110 absolute inset-0 flex items-center justify-center group-hover:bg-black/20 rounded-lg cursor-pointer invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={handleClick}
              >
                <div className="bg-gray-500/40 p-3 rounded-full z-111 ">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                </div>
              </div>
              {showAvatarBtn && (
                <div className="absolute top-1/2 -translate-y-1/2 -right-10">
                  <StopSuccessBtn
                    onStop={() => {
                      setAvatar(data.avatar);
                      setEditedAvatar(undefined);
                      setAvatarRemoved(!data.avatar);
                    }}
                    onSuccess={() => {
                      editDetails.mutate(
                        {
                          avatarRemoved,
                          avatar: editedAvatar,
                          oldAvatarPath: data.avatarPath,
                          oldAvatarUrl: data.avatar,
                        },
                        {
                          onSuccess: (props) => {
                            setAvatar(props.avatar);
                            setEditedAvatar(undefined);
                            setAvatarRemoved(false);
                          },
                        },
                      );
                    }}
                    size={"size-4 lg:size-5"}
                    flex="flex-col"
                  />
                </div>
              )}
            </div>
          ) : (
            <div
              className={` lg:w-20 lg:h-20 w-15 h-15 rounded-full flex justify-center items-center  bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7 lg:size-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1 text-gray-900 dark:text-gray-100 relative">
          {showNameEdit ? (
            <div className="relative inline-flex items-center w-30 lg:w-50">
              {/* Hidden mirror to measure text width */}
              <span
                ref={mirrorRef}
                className="invisible absolute whitespace-pre font-semibold text-base"
              >
                {editedName || "Enter group name"}
              </span>
              <textarea
                ref={nameRef}
                rows={1}
                maxLength={25}
                value={editedName}
                placeholder="Enter group name"
                onChange={(e) => {
                  setEditedName(e.target.value);
                }}
                spellCheck={false}
                autoCorrect="false"
                className="w-30 lg:w-50 resize-none text-xs lg:text-base overflow-hidden focus:outline-none transition-[height]  px-1.5 py-0.5 border border-gray-400 dark:border-gray-700 rounded-md bg-gray-200 dark:bg-blk5"
              />
            </div>
          ) : (
            <div className=" font-semibold">{data.name}</div>
          )}

          <div
            className={`absolute ${showNameEdit ? "-right-15" : "-right-7"} top-1`}
          >
            {isAllowedToEdit && (
              <EditBtn
                onClick={() => {
                  setShowNameEdit((prev) => !prev);
                  setTimeout(() => {
                    const el = nameRef.current;
                    if (el) {
                      el.focus();
                      const len = el.value.length;
                      el.selectionStart = len;
                      el.selectionEnd = len;
                    }
                  }, 0);
                }}
                onStop={() => {
                  setShowNameEdit(false);
                  setEditedName(data.name);
                }}
                onSuccess={() => {
                  setShowNameEdit(false);
                  if (editedName !== data.name) {
                    editDetails.mutate({
                      name: editedName !== data.name ? editedName : undefined,
                      oldAvatarPath: data.avatarPath,
                      oldAvatarUrl: data.avatar,
                    });
                  }
                }}
                gap="gap-2"
                addons="px-1.5 py-1 border-none rounded-md"
                parent={open}
                size={"size-3"}
              />
            )}
          </div>
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {data.totalMembers} Members
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 px-3">
        <div
          className="bg-gray-200 dark:bg-blk6 rounded-lg w-full h-12 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-blk8"
          onClick={closeGroup}
        >
          <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5"
            >
              <path
                fillRule="evenodd"
                d="M4.804 21.644A6.707 6.707 0 0 0 6 21.75a6.721 6.721 0 0 0 3.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 0 1-.814 1.686.75.75 0 0 0 .44 1.223ZM8.25 10.875a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25ZM10.875 12a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Zm4.875-1.125a1.125 1.125 0 1 0 0 2.25 1.125 1.125 0 0 0 0-2.25Z"
                clipRule="evenodd"
              />
            </svg>
            Message
          </div>
        </div>
        <div className="relative w-full">
          <div
            className="bg-gray-200 dark:bg-blk6 rounded-lg w-full h-12 flex items-center justify-center cursor-pointer hover:bg-gray-300 dark:hover:bg-blk8 "
            onClick={() => setShowMute((prev) => !prev)}
          >
            <div className="text-gray-900 text-[10px] dark:text-gray-100 flex flex-col items-center">
              {data.mute ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path d="M3.53 2.47a.75.75 0 0 0-1.06 1.06l18 18a.75.75 0 1 0 1.06-1.06l-18-18ZM20.57 16.476c-.223.082-.448.161-.674.238L7.319 4.137A6.75 6.75 0 0 1 18.75 9v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206Z" />
                  <path
                    fillRule="evenodd"
                    d="M5.25 9c0-.184.007-.366.022-.546l10.384 10.384a3.751 3.751 0 0 1-7.396-1.119 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="size-5"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.25 9a6.75 6.75 0 0 1 13.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 0 1-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 1 1-7.48 0 24.585 24.585 0 0 1-4.831-1.244.75.75 0 0 1-.298-1.205A8.217 8.217 0 0 0 5.25 9.75V9Zm4.502 8.9a2.25 2.25 0 1 0 4.496 0 25.057 25.057 0 0 1-4.496 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {data.mute ? "Unmute" : "Mute"}
            </div>
          </div>
          {showMute && (
            <div
              className="fixed inset-0 z-[98]"
              style={{ pointerEvents: "auto" }}
              onClick={() => setShowMute(false)} // click anywhere closes menu
            />
          )}
          <div
            className={`z-100 absolute left-1/2 -translate-x-1/2 -bottom-2 translate-y-full bg-gray-200 dark:bg-blk3 text-gray-800 dark:text-gray-200 text-xs rounded-md shadow-lg dark:shadow-black/30  p-2 min-w-30 transition-all duration-300 ${
              showMute
                ? "opacity-100 pointer-events-auto visible"
                : "opacity-0 pointer-events-none invisible"
            }`}
          >
            {showMute &&
              (!data.mute || !data.mutedAt ? (
                <ul>
                  <li
                    className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                    onClick={() => {
                      mutate({ enabled: true, muteType: "Eight" });
                    }}
                  >
                    8 hrs
                  </li>
                  <li
                    className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 text-nowrap"
                    onClick={() => {
                      mutate({ enabled: true, muteType: "Week" });
                    }}
                  >
                    1 week
                  </li>
                  <li
                    className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                    onClick={() => {
                      mutate({ enabled: true, muteType: "Always" });
                    }}
                  >
                    Always
                  </li>
                </ul>
              ) : (
                <ul>
                  <li className=" px-2 py-1  text-nowrap dark:text-gray-700 text-gray-500 ">
                    {muteDateFormatter(data.mute, data.mutedAt)}
                  </li>
                  <li
                    className=" px-2 py-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 "
                    onClick={() => {
                      mutate({ enabled: false });
                    }}
                  >
                    Unmute
                  </li>
                </ul>
              ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 my-2 border-y border-gray-200 dark:border-gray-700 px-3 py-1">
        <div>
          <div className="text-gray-600 dark:text-gray-400 text-sm mb-1">
            Created by
          </div>
          <div className="flex items-center gap-2">
            <div className="w-fit ">
              {data.createdBy.avatar ? (
                <div
                  className="relative w-5 h-5 lg:w-6 lg:h-6 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                  onClick={() => {
                    if (
                      data.createdBy.id !== currentUserId &&
                      data.createdBy.id
                    )
                      setUserId(data.createdBy.id);
                  }}
                >
                  <Image
                    alt={"projectAvatar"}
                    src={data.createdBy.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-5 h-5 lg:w-6 lg:h-6 rounded-full flex justify-center items-center cursor-pointer `}
                  style={{
                    background: gradientBgFromName(data.createdBy.name),
                  }}
                  onClick={() => {}}
                >
                  <div className="font-semibold text-xs  text-white">
                    {getInitials(data.createdBy.name)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold ">
                {isYou(data.createdBy)}
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="text-gray-600 dark:text-gray-400 text-sm">
            Created At
          </div>
          <div className="text-gray-800 dark:text-gray-200 text-sm mt-1">
            {format(data.createdAt, "dd MMM yyy, HH:mm")}
          </div>
        </div>

        <div>
          <FlexBtwWrapper>
            <div className="text-gray-600 dark:text-gray-400 text-sm">
              Description
            </div>
            {isAllowedToEdit && (
              <EditBtn
                onClick={() => {
                  setShowDescriptionEdit((prev) => !prev);
                  setTimeout(() => {
                    const el = descriptionRef.current;
                    if (el) {
                      el.focus();
                      const len = el.value.length;
                      el.selectionStart = len;
                      el.selectionEnd = len;
                    }
                  }, 0);
                }}
                onStop={() => {
                  setShowDescriptionEdit(false);
                  setEditedDescription(data.description);
                }}
                onSuccess={() => {
                  setShowDescriptionEdit(false);
                  if (editedDescription !== data.description) {
                    editDetails.mutate({
                      description:
                        editedDescription !== data.description
                          ? editedDescription && editedDescription.trim() === ""
                            ? null
                            : editedDescription
                          : undefined,
                      oldAvatarPath: data.avatarPath,
                      oldAvatarUrl: data.avatar,
                    });
                  }
                }}
                gap="gap-2"
                addons="px-1.5 py-1 border-none rounded-md"
                parent={open}
                size={"size-2 lg:size-3"}
              />
            )}
          </FlexBtwWrapper>
          <div className="rounded-lg  text-gray-800 dark:text-gray-200 text-sm break-words overflow-wrap-anywhere w-65">
            {showDescriptionEdit ? (
              <textarea
                ref={descriptionRef}
                maxLength={250}
                spellCheck={false}
                autoCorrect="off"
                value={editedDescription}
                placeholder="Enter group description"
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setEditedDescription(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="mt-2 resize-none overflow-hidden w-full focus:outline-none placeholder:font-semibold p-2 border border-gray-400 dark:border-gray-700 rounded-md bg-gray-200 dark:bg-blk5"
              />
            ) : data.description ? (
              data.description?.length > 100 ? (
                <div>
                  {readMore
                    ? data.description
                    : `${data.description.slice(0, 100)}...`}
                  <div
                    className="inline-flex justify-end hover:underline cursor-pointer text-nowrap ml-1 font-semibold text-gray-500"
                    onClick={() => {
                      setReadMore((prev) => !prev);
                    }}
                  >
                    {readMore ? "Read Less" : "Read More"}
                  </div>
                </div>
              ) : (
                data.description
              )
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>
      <ClickAnywhere setMenuPos={setMenuPos} menuPos={menuPos} width="w-35">
        <ul>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              avatarInputRef.current?.click();
              setMenuPos(null);
            }}
          >
            Change
          </li>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setEditedAvatar(undefined);
              setMenuPos(null);
              setAvatarRemoved(true);
              setAvatar(undefined);
            }}
          >
            Remove
          </li>
        </ul>
      </ClickAnywhere>
      <AvatarPicker
        avatarInputRef={avatarInputRef}
        setSelected={setEditedAvatar}
      />
    </>
  );
}
