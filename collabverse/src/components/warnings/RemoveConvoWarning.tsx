import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { chatListProps } from "@/app/interfaces";
import { GroupSvg } from "../svg/GroupSvg";

export function RemoveConvoWarning({
  setShow,
  show,
  c,
  remove,
  closeMenu,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  c: chatListProps;
  remove: () => void;
  closeMenu: () => void;
}) {
  return (
    <OverlayWrapper active={show}>
      <div className="w-xs lg:w-sm">
        <div className="flex items-center gap-3">
          <div className="w-fit">
            {!c.membership || c.membership === "Active" ? (
              c.avatar ? (
                <div className="relative  h-9 w-9 lg:h-11 lg:w-11 rounded-full overflow-hidden ">
                  <Image
                    alt={"AssigneeAvatar"}
                    src={c.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  `}
                  style={{
                    background: gradientBgFromName(c.name),
                  }}
                >
                  <div className="font-semibold lg:text-lg text-base text-white ">
                    {getInitials(c.name)}
                  </div>
                </div>
              )
            ) : (
              <div
                className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-400`}
              >
                <GroupSvg size="size-5 size-6" />
              </div>
            )}
          </div>{" "}
          <div className="text-gray-900 dark:text-gray-100 text-sm text-ellipsis font-semibold">
            {c.name}
          </div>
        </div>
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
          Are you sure you want to{" "}
          {c.membership === "Active"
            ? " leave this group?"
            : `delete this ${c.type === "Dm" ? "chat" : "group"} ?`}
          {c.membership === "Active" && (
            <div className="text-sm lg:text-base text-gray-700 dark:text-gray-300 flex flex-wrap mt-1">
              *This group will be deleted from your side
            </div>
          )}
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
              remove();
              setShow(false);
            }}
          >
            {c.membership === "Active" ? "Leave" : "Delete"}
          </button>
        </div>
      </div>
    </OverlayWrapper>
  );
}
