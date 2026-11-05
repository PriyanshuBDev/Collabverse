import { DayPicker } from "react-day-picker";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";

export default function EditDueDay({
  editMode,
  dueDate,
  editedDue,
  setEditedDue,
  isEdited,
  canEdit,
}: {
  editMode: boolean;
  dueDate: Date | undefined;
  editedDue: Date | undefined;
  setEditedDue: Dispatch<SetStateAction<Date | undefined>>;
  isEdited: boolean;
  canEdit: boolean;
}) {
  const [showDueEdit, setShowDueEdit] = useState(false);
  const dueRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dueRef], () => setShowDueEdit(false));
  return (
    <div className="flex items-center  gap-2 pb-1 relative" ref={dueRef}>
      {isEdited && editedDue ? (
        <div
          className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base border-gray-200 border-2 dark:border-gray-600 px-1.5 rounded-md cursor-pointer"
          onClick={() => setShowDueEdit((prev) => !prev)}
        >
          {DateFormatter2(editedDue)}
        </div>
      ) : dueDate ? (
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {DateFormatter2(dueDate)}
        </div>
      ) : (
        <span className="text-gray-500 text-xs lg:text-base">None</span>
      )}
      {canEdit && editMode && (
        <div
          className={`p-1 cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500`}
          onClick={() => {
            if (isEdited) {
              setEditedDue(dueDate);
              setShowDueEdit(false);
            } else {
              setShowDueEdit((prev) => !prev);
            }
          }}
        >
          {isEdited ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={"size-3 lg:size-4"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-3 lg:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
              />
            </svg>
          )}
        </div>
      )}
      <div
        id="dropdown"
        className={`scale-70 lg:min-w-35 min-w-30 z-30 shadow-lg absolute -top-5  -left-12  bg-gray-200 transition-all duration-300  rounded-lg  dark:bg-blk2 ${
          showDueEdit
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <div
          className="small-calendar 
            bg-white dark:bg-blk5
            text-gray-900 dark:text-gray-100 dark:border-gray-700
            px-2 sm:p-3 rounded-lg shadow-sm
            transition-all duration-300
            overflow-hidden"
        >
          <DayPicker
            className="small-calendar"
            mode="single"
            selected={editedDue}
            onSelect={(d) => {
              setEditedDue(d);
              setShowDueEdit(false);
            }}
            required
            disabled={{ before: new Date() }}
          />
        </div>
      </div>
    </div>
  );
}

export function RemovableDueDate({
  editMode,
  dueDate,
  editedDue,
  setEditedDue,
  isEdited,
  canEdit,
}: {
  editMode: boolean;
  dueDate: Date | null;
  editedDue: Date | null;
  setEditedDue: Dispatch<SetStateAction<Date | null>>;
  isEdited: boolean;
  canEdit: boolean;
}) {
  const [showDueEdit, setShowDueEdit] = useState(false);
  const dueRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dueRef], () => setShowDueEdit(false));
  return (
    <div className="flex items-center  gap-2 pb-1 relative" ref={dueRef}>
      {isEdited ? (
        editedDue ? (
          <div
            className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base border-gray-200 border-2 dark:border-gray-600 px-1.5 rounded-md cursor-pointer"
            onClick={() => setShowDueEdit((prev) => !prev)}
          >
            {DateFormatter2(editedDue)}
          </div>
        ) : (
          <span className="text-gray-500 text-xs lg:text-base">None</span>
        )
      ) : dueDate ? (
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {DateFormatter2(dueDate)}
        </div>
      ) : (
        <span className="text-gray-500 text-xs lg:text-base">None</span>
      )}
      {canEdit && editMode && (
        <div
          className={`p-1 cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500`}
          onClick={() => {
            if (isEdited) {
              setEditedDue(dueDate);
              setShowDueEdit(false);
            } else {
              setShowDueEdit((prev) => !prev);
            }
          }}
        >
          {isEdited ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={"size-3 lg:size-4"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-3 lg:size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z"
              />
            </svg>
          )}
        </div>
      )}
      <div
        id="dropdown"
        className={`scale-70 lg:min-w-35 min-w-30 z-30 shadow-lg absolute -top-5  -left-12  bg-gray-200 transition-all duration-300  rounded-lg  dark:bg-blk2 ${
          showDueEdit
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <FlexBtwWrapper addOns="my-1">
          <button
            className="px-3 py-1 text-sm dark:text-gray-200 text-gray-800 font-semibold cursor-pointer bg-white dark:bg-blk5 shadow-sm rounded-md ml-2"
            onClick={() => {
              setEditedDue(null);
              setShowDueEdit(false);
            }}
          >
            Remove
          </button>
          <button
            className="px-3 py-1 text-sm text-gray-400 cursor-pointer"
            onClick={() => setShowDueEdit(false)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </FlexBtwWrapper>
        <div
          className="small-calendar 
            bg-white dark:bg-blk5
            text-gray-900 dark:text-gray-100 dark:border-gray-700
            px-2 sm:p-3 rounded-lg shadow-sm
            transition-all duration-300
            overflow-hidden"
        >
          <DayPicker
            className="small-calendar"
            mode="single"
            selected={editedDue === null ? undefined : editedDue}
            onSelect={(d) => {
              setEditedDue(d);
              setShowDueEdit(false);
            }}
            required
            disabled={{ before: new Date() }}
          />
        </div>
      </div>
    </div>
  );
}
