import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { memberProps } from "@/app/interfaces";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import Xbtn from "../btns/Xbtn";

export default function RemoveUserWarning({
  showWarning,
  setShowWarning,
  handleRemove,
  user,
  type,
  name,
  ownerOf,
  currentOwner,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleRemove: () => void;
  onlyMe?: boolean;
  user: memberProps;
  type: string;
  name: string;
  ownerOf?: number;
  currentOwner?: boolean;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm">
      {(ownerOf && ownerOf > 0) || currentOwner ? (
        <div className="flex">
          <div>
            <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
              Transfer their ownership of
              {ownerOf && ownerOf > 1 ? "projects" : "project"} before removing.
            </div>
          </div>
          <Xbtn
            onClick={() => {
              setShowWarning(false);
            }}
            size="size-5 lg:size-6"
          ></Xbtn>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <div className="w-fit">
              {user.avatar ? (
                <div className="relative  h-9 w-9 lg:h-11 lg:w-11 rounded-full overflow-hidden ">
                  <Image
                    alt={"AssigneeAvatar"}
                    src={user.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={` h-9 w-9 lg:h-11 lg:w-11 rounded-full flex justify-center items-center  `}
                  style={{
                    background: gradientBgFromName(user.name!),
                  }}
                >
                  <div className="font-semibold lg:text-lg text-base text-white ">
                    {getInitials(user.name!)}
                  </div>
                </div>
              )}
            </div>
            <div className="text-gray-900 dark:text-gray-100 text-base lg:text-lg text-ellipsis font-semibold leading-tight">
              {user.name}

              <div className="text-xs lg:text-sm text-blue-500 leading-none">
                {user.username}
              </div>
            </div>
          </div>
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 max-w-sm lg:max-w-md">
            Are you sure about removing this user from {type} :
            <span className="text-gray-900 dark:text-gray-100 font-semibold mx-1">
              {name}
            </span>
            ?
          </div>
          <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
            <button
              className={`w-15 h-8  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
              onClick={() => {
                setShowWarning(false);
              }}
            >
              No
            </button>
            <button
              className={`w-15 h-8 flex items-center justify-center cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400`}
              onClick={() => {
                handleRemove();
                setShowWarning(false);
              }}
            >
              Yes
            </button>
          </div>
        </>
      )}
    </OverlayWrapper>
  );
}
