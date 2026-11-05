import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Xbtn from "../btns/Xbtn";

export default function OnlyOne({
  showWarning,
  setShowWarning,
  type,
  actionType,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  type: string;
  actionType: string;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm flex">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200  max-w-sm lg:max-w-md">
        You can&apos;t {actionType} as there are only one{" "}
        <span className="text-gray-900 dark:text-gray-100 font-semibold">
          {type}
        </span>
        . Assign a replacement first.
      </div>
      <Xbtn
        size={"size-5 lg:size-6"}
        onClick={() => setShowWarning(false)}
      ></Xbtn>
    </OverlayWrapper>
  );
}
