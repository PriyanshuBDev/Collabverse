import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Xbtn from "../btns/Xbtn";

export default function PinLimitReachedWarning({
  showWarning,
  setShowWarning,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm flex">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200  max-w-sm lg:max-w-md">
        Pin limit reached (20/20). Unpin a message to pin a new one.
      </div>
      <Xbtn
        size={"size-5 lg:size-6"}
        onClick={() => setShowWarning(false)}
      ></Xbtn>
    </OverlayWrapper>
  );
}
