import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { memberProps, Tier } from "@/app/interfaces";
import Xbtn from "../btns/Xbtn";

export default function RoleChange({
  showWarning,
  setShowWarning,
  handleRoleChange,
  user,
  name,
  type,
  currentRole,
  newRole,
  setShowDropdown,
  ownerOf,
  currentOwner,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleRoleChange: () => void;
  user: memberProps;
  currentRole: string;
  newRole: string;
  type: Tier;
  name: string;
  setShowDropdown?: Dispatch<SetStateAction<boolean>>;
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
              {ownerOf && ownerOf > 1 ? "projects" : "project"} before changing
              role.
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
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-md ">
            Are you sure about changing{" "}
            <span className="text-gray-900 dark:text-gray-100 font-semibold mx-1">
              {user.name}&apos;s
            </span>{" "}
            role from{" "}
            <span className="text-gray-900 dark:text-gray-100 font-semibold mx-1">
              &quot;
              {currentRole}&quot;
            </span>{" "}
            to{" "}
            <span className="text-gray-900 dark:text-gray-100 font-semibold mx-1">
              &quot;{newRole}&quot;
            </span>{" "}
            in {type}{" "}
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
                if (setShowDropdown !== undefined) {
                  setShowDropdown(false);
                }
              }}
            >
              No
            </button>
            <button
              className={`w-15 h-8 flex items-center justify-center cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400`}
              onClick={() => {
                handleRoleChange();
                setShowWarning(false);
                if (setShowDropdown !== undefined) {
                  setShowDropdown(false);
                }
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
