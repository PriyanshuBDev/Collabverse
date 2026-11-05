import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { useLogout } from "@/lib/hooks/useLogout";

export default function LogOutWarning({
  showWarning,
  setShowWarning,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
}) {
  const logout = useLogout();
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-sm items-center justify-center">
        Are you sure about logging out ?
      </div>

      <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
        <button
          className={`w-full py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
          onClick={() => setShowWarning(false)}
        >
          No
        </button>
        <button
          className={`w-full py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400`}
          onClick={() => {
            setShowWarning(false);
            logout();
          }}
        >
          Yes
        </button>
      </div>
    </OverlayWrapper>
  );
}
