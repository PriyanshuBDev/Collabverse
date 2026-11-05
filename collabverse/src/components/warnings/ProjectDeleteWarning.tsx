import { ChangeEvent, Dispatch, SetStateAction, useState } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";

export default function ProjectDeleteWarning({
  setShow,
  show,
  name,
  handleDeleting,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  name: string;
  handleDeleting: () => void;
}) {
  const [confirmName, setConfirmName] = useState("");
  const isValid = confirmName === name;
  return (
    <OverlayWrapper active={show} addOns="lg:w-lg">
      <div className="text-base lg:text-lg text-gray-700 dark:text-gray-300 flex flex-wrap max-w-sm lg:max-w-md ">
        Are you sure about deleting the project:
        <span className="text-gray-900 dark:text-gray-100 font-semibold ml-1">
          &quot;{name}&quot;
        </span>{" "}
        ?
      </div>
      <div className="text-xs lg:text-sm text-red-500">
        Deleting this project is permanent. All tasks, files, and data will be
        lost.
      </div>
      <input
        type="text"
        className="border border-gray-500 rounded-md px-3 py-2 text-sm lg:text-base w-full mt-3"
        placeholder="Type the project name to confirm"
        value={confirmName}
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setConfirmName(e.target.value);
        }}
      />

      <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
        <button
          className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
          onClick={() => setShow(false)}
        >
          cancel
        </button>

        <button
          disabled={!isValid}
          className={`px-2 lg:px-3 py-0.5 lg:py-1 rounded-md text-sm lg:text-base font-semibold  ${
            isValid
              ? "text-white bg-red-500 hover:bg-red-400 cursor-pointer"
              : "text-gray-800 bg-gray-300 dark:text-gray-600 dark:bg-blk7 cursor-not-allowed"
          }`}
          onClick={() => {
            setShow(false);
            handleDeleting();
          }}
        >
          Delete
        </button>
      </div>
    </OverlayWrapper>
  );
}
