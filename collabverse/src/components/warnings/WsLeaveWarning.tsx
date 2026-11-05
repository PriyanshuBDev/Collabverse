import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Xbtn from "../btns/Xbtn";

export default function WsLeaveWarning({
  showWarning,
  setShowWarning,
  handleLeaving,
  ownedProjCount,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleLeaving: () => void;
  ownedProjCount: number;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-lg">
      {ownedProjCount > 0 ? (
        <>
          <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
            Are you sure about leaving the workspace ?
          </div>
          <div className="text-xs lg:text-sm text-red-500">
            You&apos;ll lose access of this workspace.
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
        <div className="flex">
          <div>
            <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
              You can&apos;t leave this workspace as you are owner of{" "}
              {ownedProjCount > 0
                ? `${ownedProjCount} project${ownedProjCount > 1 ? "s" : ""}`
                : ""}
              .
            </div>
            <div className="text-xs lg:text-sm text-red-500">
              Transfer Ownership before leaving the workspace.
            </div>
          </div>
          <Xbtn
            onClick={() => setShowWarning(false)}
            size="size-5 lg:size-6"
          ></Xbtn>
        </div>
      )}
    </OverlayWrapper>
  );
}
