import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function DemoteWarning({
  showWarning,
  setShowWarning,
  currentPosition,
  afterPosition,
  handleDemoting,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  currentPosition: string;
  afterPosition: string;
  handleDemoting: () => void;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-md">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-md ">
        Are you sure about demoting yourself from{" "}
        <span className="text-gray-900 dark:text-gray-100 font-semibold ml-1">
          &quot;{currentPosition}&quot;
        </span>{" "}
        to{" "}
        <span className="text-gray-900 dark:text-gray-100 font-semibold ml-1">
          &quot;{afterPosition}&quot;
        </span>{" "}
        ?
      </div>

      <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
        <button
          className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
          onClick={() => setShowWarning(false)}
        >
          cancel
        </button>
        <button
          className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-blue-500 hover:bg-blue-400`}
          onClick={() => {
            setShowWarning(false);
            handleDemoting();
          }}
        >
          Demote
        </button>
      </div>
    </OverlayWrapper>
  );
}
