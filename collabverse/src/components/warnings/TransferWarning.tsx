import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function TransferWarning({
  showWarning,
  setShowWarning,
  handleProceed,
  type,
  afterRole,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleProceed: () => void;
  type: string;
  afterRole: string;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-lg">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
        Are you sure about transfering the ownership ?
      </div>
      <div className="text-xs lg:text-sm text-red-500">
        You&apos;ll lose access to manage this {type} and will be demoted to
        &quot;{afterRole}&quot;.
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
            handleProceed();
          }}
        >
          Proceed
        </button>
      </div>
    </OverlayWrapper>
  );
}
