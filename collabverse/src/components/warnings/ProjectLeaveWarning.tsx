import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function ProjectLeaveWarning({
  showWarning,
  setShowWarning,
  handleLeaving,
  name,
  canLeave,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleLeaving: () => void;
  name: string;
  canLeave: boolean;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-lg">
      {canLeave ? (
        <>
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
            Are you sure about leaving the project:
            <span className="text-gray-900 dark:text-gray-100 font-semibold ml-1">
              &quot;{name}&quot;
            </span>{" "}
            ?
          </div>
          <div className="text-xs lg:text-sm text-red-500">
            You&apos;ll lose access to all tasks, files and details of this
            project.
          </div>
          <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
            <button
              className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
              onClick={() => setShowWarning(false)}
            >
              cancel
            </button>

            <button
              className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
              onClick={() => {
                setShowWarning(false);
                handleLeaving();
              }}
            >
              Leave
            </button>
          </div>
        </>
      ) : (
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-m d ">
          You can&apos;t leave the project:
          <span className="text-gray-900 dark:text-gray-100 font-semibold ml-1">
            &quot;{name}&quot;
          </span>{" "}
          as you are the owner. Assign a replacement before leaving.
        </div>
      )}
    </OverlayWrapper>
  );
}
