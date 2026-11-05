import { WorkspaceSettingsProps } from "@/app/interfaces";
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
import useMounted from "@/lib/hooks/useMounted";
import ClickAnywhere from "../dropdowns/ClickAnywhere";
import AvatarPicker from "../Avatar/AvatarPicker";
import { PositionProps } from "../ChatComponents/Bubble";
import NameValidityCard from "../btns/workspace/NameValidityCard";
import { useWsSettings } from "@/lib/queries/workspace/settings/useWsSettings";

export default function EditWsSettings({
  show,
  setShow,
  ws,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  ws: WorkspaceSettingsProps;
}) {
  const { editDetails } = useWsSettings();
  const [editedName, setEditedName] = useState(ws.name);
  const [editedDesc, setEditedDesc] = useState<string | undefined>(
    ws.description,
  );
  const [avatar, setAvatar] = useState(ws.avatar);
  const [editedAvatar, setEditedAvatar] = useState<File | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const mounted = useMounted();
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;
    setMenuPos({ x: e.clientX, y: e.clientY });
  };
  useEffect(() => {
    if (ws) {
      setEditedName(ws.name);
      setAvatar(ws.avatar);
      setEditedDesc(ws.description);
      setEditedAvatar(undefined);
      setAvatarRemoved(false);
    }
  }, [ws]);

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
  if (!mounted || !ws) return null;

  const disable =
    editedName.length < 6 ||
    editedName.trim() === "" ||
    (editedName === ws.name &&
      editedDesc === ws.description &&
      previewUrl === null &&
      editedAvatar === undefined &&
      !avatarRemoved);

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
            Edit Workspace
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
                      alt={"WorkspaceAvatar"}
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
              <NameValidityCard name={editedName} setName={setEditedName} />
            </TitleAndElement>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-gray-900 dark:text-gray-100  text-sm lg:text-base font-semibold">
                  Description
                </div>
                <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400">
                  ({editedDesc?.length ?? 0} / 1000)
                </div>
              </div>
              <textarea
                maxLength={1000}
                value={editedDesc}
                placeholder="Enter description"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setEditedDesc(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="resize-none overflow-hidden thinScrollbar max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
              />
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5 ">
              <button
                className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={() => {
                  setShow(false);
                  setEditedName(ws.name);
                  setEditedDesc(ws.description ?? "");
                  setEditedAvatar(undefined);
                  setAvatar(ws.avatar);
                  setAvatarRemoved(false);
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
                  if (!editDetails.isPending) {
                    editDetails.mutate({
                      name: editedName === ws.name ? undefined : editedName,
                      description:
                        editedDesc !== ws.description
                          ? editedDesc && editedDesc.trim() === ""
                            ? null
                            : editedDesc
                          : undefined,
                      avatar: editedAvatar,
                      oldAvatarPath: ws.avatarPath,
                      avatarRemoved,
                      oldAvatarUrl: ws.avatar,
                    });
                  }
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
          {(previewUrl || avatarRemoved) && (
            <li
              className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
              onClick={() => {
                setEditedAvatar(undefined);
                setMenuPos(null);
                setAvatarRemoved(false);
                setAvatar(ws.avatar);
              }}
            >
              cancel
            </li>
          )}
        </ul>
      </ClickAnywhere>
      <AvatarPicker
        avatarInputRef={avatarInputRef}
        setSelected={setEditedAvatar}
      />
    </ScrollableOverlayWrapper>
  );
}
