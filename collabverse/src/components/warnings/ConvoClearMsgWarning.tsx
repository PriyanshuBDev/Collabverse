import { createPortal } from "react-dom";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { Dispatch, SetStateAction } from "react";
import { ChatListType, ConvMemberStatus } from "@prisma/client";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";

export function ConvoClearMsgWarning({
  setShow,
  show,
  name,
  avatar,
  type,
  status,
  handleClearing,
  closeMenu,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  name: string;
  avatar?: string;
  type: ChatListType;
  status?: ConvMemberStatus;
  handleClearing: () => void;
  closeMenu: () => void;
}) {
  return (
    <>
      {" "}
      {createPortal(
        <OverlayWrapper active={show}>
          <div className="w-xs lg:w-sm">
            <div className="flex items-center gap-3">
              <div className="w-fit">
                {status === "Active" ? (
                  avatar ? (
                    <div
                      className="relative h-9 w-9 lg:h-11 lg:w-11 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                      onClick={() => {}}
                    >
                      <Image
                        alt={"GroupAvatar"}
                        src={avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center cursor-pointer`}
                      style={{ background: gradientBgFromName(name) }}
                      onClick={() => {}}
                    >
                      <div className="font-semibold lg:text-2xl text-xl text-white">
                        {getInitials(name)}
                      </div>
                    </div>
                  )
                ) : (
                  <div
                    className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-5 lg:size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                      />
                    </svg>
                  </div>
                )}
              </div>{" "}
              <div className="text-gray-900 dark:text-gray-100 text-base lg:text-lg text-ellipsis font-semibold">
                {name}
              </div>
            </div>
            <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
              Are you sure you want to clear all messages from this{" "}
              {type === "Dm" ? "chat" : "group"}?
            </div>
            <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
              *Messages will only be cleared from your side.
            </div>
            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
              <button
                className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={() => {
                  setShow(false);
                  closeMenu();
                }}
              >
                cancel
              </button>
              <button
                className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
                onClick={() => {
                  setShow(false);
                  closeMenu();
                  handleClearing();
                }}
              >
                clear
              </button>
            </div>
          </div>
        </OverlayWrapper>,
        document.body,
      )}
    </>
  );
}
