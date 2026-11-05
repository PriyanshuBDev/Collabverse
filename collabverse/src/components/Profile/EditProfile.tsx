import { UserDataProps } from "@/app/interfaces";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ScrollableOverlayWrapper from "../wrappers/ScrollableOverlayWrapper";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import TitleAndElement from "../myTasks/TitleAndElement";
import UNameValidityCard from "./UNameValidityCard";
import UserNameValidityCard from "./UserNameValidityCard";
import isValidRealName from "@/lib/functions/validity/NameValidity";
import { useUserProfile } from "@/lib/queries/user/useUserProfile";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Spinner2 from "../loadings/Spinner2";
import useMounted from "@/lib/hooks/useMounted";
import ClickAnywhere from "../dropdowns/ClickAnywhere";
import AvatarPicker from "../Avatar/AvatarPicker";
import { PositionProps } from "../ChatComponents/Bubble";
import useIsDark from "@/lib/hooks/useIsDark";

export default function EditProfile({
  show,
  setShow,
  user,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  user: UserDataProps;
}) {
  const { edit, isEditing } = useUserProfile();
  const [editedName, setEditedName] = useState(user.name);
  const [editedUsername, setEditedUsername] = useState(user.username);
  const [editedBio, setEditedBio] = useState(user.bio ?? "");
  const [avatar, setAvatar] = useState(user.avatar);
  const [editedAvatar, setEditedAvatar] = useState<File | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [usernameValidity, setUsernameValidity] = useState(true);
  const mounted = useMounted();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const isDark = useIsDark();
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

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
    if (user) {
      setAvatar(user.avatar);
      setEditedName(user.name);
      setEditedUsername(user.username);
      setEditedBio(user.bio ?? "");
      setEditedAvatar(undefined);
      setAvatarRemoved(!user.avatar);
    }
  }, [user]);
  if (!mounted || !user) return null;

  const disable =
    !isValidRealName(editedName, true) ||
    editedUsername.trim() === "" ||
    !usernameValidity;

  if (isEditing)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-5 lg:size-7"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0 0 21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 0 0 3.065 7.097A9.716 9.716 0 0 0 12 21.75a9.716 9.716 0 0 0 6.685-2.653Zm-12.54-1.285A7.486 7.486 0 0 1 12 15a7.486 7.486 0 0 1 5.855 2.812A8.224 8.224 0 0 1 12 20.25a8.224 8.224 0 0 1-5.855-2.438ZM15.75 9a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5 lg:size-7"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
              />
            </svg>
          )}
        </Spinner2>
      </OverlayWrapper>
    );
  return (
    <ScrollableOverlayWrapper active={show}>
      <div
        className={`max-w-md lg:max-w-full min-w-xs lg:min-w-md transition-all transform duration-500 flex  ease-in-out items-stretch  overflow-x-hidden`}
      >
        <div
          className={`flex-grow transform duration-500 transition-[max-width,opacity,padding] h-full overflow-hidden`}
        >
          <div className="text-gray-900 dark:text-gray-100 mb-1 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
            Edit Your Profile
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-col justify-center w-full">
              <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-1">
                Avatar
              </div>
              <div className="relative w-fit group overflow-hidden">
                {avatar || previewUrl ? (
                  <div className="relative w-14 h-14 lg:h-17 lg:w-17 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                    <Image
                      key={previewUrl ?? avatar ?? "avatar"}
                      alt={"ProfileAvatar"}
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
              </div>
            </div>
            <TitleAndElement title="Name">
              <UNameValidityCard
                name={editedName}
                handleNameEdit={(n: string) => {
                  setEditedName(n);
                }}
              ></UNameValidityCard>
            </TitleAndElement>
            <TitleAndElement title="Username">
              <UserNameValidityCard
                setValidity={setUsernameValidity}
                username={editedUsername}
                handleUsernameEdit={(n: string) => {
                  setEditedUsername(n);
                }}
              ></UserNameValidityCard>
            </TitleAndElement>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-gray-900 dark:text-gray-100  text-sm lg:text-base font-semibold">
                  Short Bio
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  ({editedBio.length ?? 0} / 150)
                </div>
              </div>
              <textarea
                maxLength={150}
                value={editedBio}
                placeholder="Enter bio (optional)"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setEditedBio(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="text-gray-800 thinScrollbar dark:text-gray-200 resize-none overflow-hidden  max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5 ">
              <button
                className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={() => {
                  setShow(false);
                  setEditedName(user.name);
                  setEditedUsername(user.username);
                  setEditedBio(user.bio ?? "");
                  setEditedAvatar(undefined);
                  setAvatar(user.avatar);
                }}
              >
                cancel
              </button>
              <button
                disabled={disable}
                className={`px-2 lg:px-3 py-1 lg:py-1  rounded-md text-sm lg:text-base font-semibold  text-white ${
                  disable
                    ? "cursor-not-allowed bg-gray-300 dark:bg-blk7"
                    : "bg-blue-500 hover:bg-blue-400 cursor-pointer"
                }`}
                onClick={() => {
                  edit({
                    id: user.id,
                    name: user.name,
                    editedName,
                    username: user.username,
                    editedUsername,
                    bio: user.bio,
                    editedBio,
                    avatar: editedAvatar,
                    oldAvatarPath: user.avatarPath,
                    avatarRemoved,
                    oldAvatarUrl: user.avatar,
                  });
                  setShow(false);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
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
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={() => {
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
    </ScrollableOverlayWrapper>
  );
}
