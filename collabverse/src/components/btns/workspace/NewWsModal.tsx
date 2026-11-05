import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import ScrollableOverlayWrapper from "../../wrappers/ScrollableOverlayWrapper";
import TitleAndElement from "../../myTasks/TitleAndElement";
import "../../../app/globals.css";
import "react-day-picker/dist/style.css";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useCreateWorkspace } from "@/lib/queries/workspace/useCreateWorkspace";
import NameValidityCard from "./NameValidityCard";
import Spinner2 from "@/components/loadings/Spinner2";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import AvatarPicker from "@/components/Avatar/AvatarPicker";
import { PositionProps } from "@/components/ChatComponents/Bubble";
import ClickAnywhere from "@/components/dropdowns/ClickAnywhere";
import { WorkspaceSvg } from "@/components/svg/WorkspaceSvg";

export default function NewWsModal({
  show,
  setShow,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { createWs, isCreating } = useCreateWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState<string | undefined>(undefined);
  const [avatar, setAvatar] = useState<File | undefined>(undefined);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
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
          <WorkspaceSvg />
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
              className="size-6 "
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
              />
            </svg>
            Create workspace
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center flex-col justify-center w-full">
              <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold flex items-center gap-1">
                Avatar
              </div>
              <div className="relative w-fit group overflow-hidden">
                {previewUrl ? (
                  <div className="relative w-14 h-14 lg:h-17 lg:w-17 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                    <Image
                      alt={"WorkspaceAvatar"}
                      src={previewUrl}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : name ? (
                  <div
                    className={` w-14 h-14 lg:h-17 lg:w-17 rounded-lg  flex justify-center items-center  `}
                    style={{ background: gradientBgFromName(name) }}
                  >
                    <div className="font-semibold text-3xl text-white ">
                      {getInitials(name)}
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
              <NameValidityCard name={name} setName={setName} />
            </TitleAndElement>

            <TitleAndElement title="Description">
              <textarea
                maxLength={1000}
                value={description}
                placeholder="Enter description (optional)"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDescription(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="text-gray-800 dark:text-gray-200 resize-none overflow-hidden  max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
              />
            </TitleAndElement>
            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5 ">
              <button
                className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={() => {
                  setShow(false);
                  setName("");
                  setDescription("");
                }}
              >
                cancel
              </button>
              <button
                disabled={!name || name.length < 6}
                className={`px-2 lg:px-3 py-1 lg:py-1   rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-300 disabled:dark:bg-gray-700 
                     
                `}
                onClick={() => {
                  createWs({ name, description, avatar });
                  setShow(false);
                }}
              >
                Create
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
    </ScrollableOverlayWrapper>
  );
}
