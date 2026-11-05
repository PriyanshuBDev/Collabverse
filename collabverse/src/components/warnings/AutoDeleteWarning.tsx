import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function AutoDeleteWarning({
  show,
  setShow,
  leaveGroup,
  closeMenu,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  leaveGroup: () => void;
  closeMenu: () => void;
}) {
  return (
    <OverlayWrapper active={show} addOns="lg:w-sm">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-sm items-center justify-center">
        You&lsquo;re the last member of this group. If you leave, the group will
        be permanently deleted because no members will remain. This action
        cannot be undone.
      </div>

      <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
        <button
          className={`w-full py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
          onClick={() => {
            setShow(false);
            closeMenu();
          }}
        >
          No
        </button>
        <button
          className={`w-full py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400`}
          onClick={() => {
            setShow(false);
            closeMenu();
            leaveGroup();
          }}
        >
          Yes
        </button>
      </div>
    </OverlayWrapper>
  );
}
