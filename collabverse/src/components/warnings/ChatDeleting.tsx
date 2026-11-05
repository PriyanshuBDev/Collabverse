import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function ChatDeleting({
  showWarning,
  setShowWarning,
  handleDelete,
  otherUserMsgs,
}: {
  showWarning: boolean;
  setShowWarning: Dispatch<SetStateAction<boolean>>;
  handleDelete: (others: boolean) => void;
  otherUserMsgs?: boolean;
}) {
  const [others, setOthers] = useState(false);
  return (
    <OverlayWrapper active={showWarning} addOns="lg:w-sm">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-md ">
        Are you sure about deleting ?
      </div>
      {!otherUserMsgs ? (
        <div className="flex items-center gap-2 mt-2">
          <label
            className="relative flex items-center cursor-pointer  "
            onClick={(e) => e.stopPropagation()}
          >
            <input
              type="checkbox"
              checked={others}
              className="peer  appearance-none  h-5 w-5 border-2 border-gray-500  rounded-md checked:bg-blue-600 transition-all duration-300 cursor-pointer"
              readOnly
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setOthers(e.target.checked)
              }
            />
            <svg
              className="absolute left-1 top-1 h-3 w-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity cursor-pointer"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              {" "}
              <path d="M5 13l4 4L19 7" />
            </svg>
          </label>

          <div className="text-sm lg:text-base text-gray-800 dark:text-gray-200 ">
            For everyone
          </div>
        </div>
      ) : (
        <div className="text-xs lg:text-sm text-red-500">
          *Messages will only get deleted from your side.
        </div>
      )}
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
            handleDelete(others);
          }}
        >
          Delete {others ? "for everyone" : "for me"}
        </button>
      </div>
    </OverlayWrapper>
  );
}
