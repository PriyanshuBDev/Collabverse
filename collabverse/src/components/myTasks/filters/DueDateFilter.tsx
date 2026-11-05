import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

export default function DueDateFilter({
  selectedDate,
  setSelectedDate,
}: {
  selectedDate: Date | undefined;
  setSelectedDate: Dispatch<SetStateAction<Date | undefined>>;
}) {
  const [showDate, setShowDate] = useState(false);
  const dateRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([dateRef], () => setShowDate(false));
  return (
    <div ref={dateRef} className={` relative lg:min-w-35 min-w-30`}>
      <div
        className="text-gray-900 dark:text-gray-100 cursor-pointer flex gap-1 justify-between items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1"
        onClick={() => {
          setShowDate((prev) => !prev);
        }}
      >
        <div className="flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="lg:size-5 size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
            />
          </svg>

          <div className="text-nowrap">
            {selectedDate ? selectedDate.toLocaleDateString() : "Due Date"}
          </div>
        </div>
        <div className="text-gray-500 pr-1 ">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="lg:size-5 size-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
            />
          </svg>
        </div>
      </div>
      <div
        id="dropdown"
        className={`scale-70 z-30 shadow-lg absolute -top-4 lg:-top-2 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200  transition-all duration-300  rounded-lg  dark:bg-blk3 ${
          showDate
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <FlexBtwWrapper addOns="my-1">
          <button
            className="px-3 py-1 text-sm dark:text-gray-200 text-gray-800 font-semibold cursor-pointer bg-white dark:bg-blk5 shadow-sm rounded-md ml-2"
            onClick={() => setSelectedDate(undefined)}
          >
            Remove
          </button>
          <button
            className="px-3 py-1 text-sm text-gray-400 cursor-pointer"
            onClick={() => setShowDate(false)}
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
                  w-fit overflow-hidden "
        >
          <DayPicker
            className="small-calendar"
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
