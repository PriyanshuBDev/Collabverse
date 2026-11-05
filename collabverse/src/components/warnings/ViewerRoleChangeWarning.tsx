import { Dispatch, SetStateAction } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Xbtn from "../btns/Xbtn";

export default function ViewerRoleChangeWarning({
  showWarning,
  setShowWarning,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm">
      <div className="flex">
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
          You cannot change role to &#34;Viewer&#34; as the user have tasks
          assigned to them, unassign tasks before changing role to
          &#34;Viewer&#34;.
        </div>

        <Xbtn
          onClick={() => {
            setShowWarning(false);
          }}
          size="size-5 lg:size-6"
        ></Xbtn>
      </div>
    </OverlayWrapper>
  );
}
