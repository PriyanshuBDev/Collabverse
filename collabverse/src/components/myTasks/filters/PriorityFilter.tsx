import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { Priority } from "@prisma/client";
import { Dispatch, SetStateAction, useRef, useState } from "react";
export interface priorityColorProps {
  color: string;
  level: Priority;
}
export default function PriorityFilter({
  selectedPriority,
  setSelectedPriority,
}: {
  selectedPriority: Priority | undefined;
  setSelectedPriority: Dispatch<SetStateAction<Priority | undefined>>;
}) {
  const [showPriority, setShowPriority] = useState(false);
  const priorityRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([priorityRef], () => setShowPriority(false));
  const pData: priorityColorProps[] = [
    { color: "text-[#34d399]", level: "Low" },
    { color: "text-[#fbbf24]", level: "Medium" },
    { color: "text-[#f97316]", level: "High" },
    { color: "text-[#ef4444]", level: "Critical" },
  ];
  const priorityData = pData.find(
    (p: priorityColorProps) => p.level === selectedPriority,
  );
  return (
    <div
      ref={priorityRef}
      className="relative lg:min-w-35 min-w-30 text-nowrap"
    >
      <div
        className={`${priorityData?.color ?? "text-gray-900 dark:text-gray-100"} cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
        onClick={() => {
          setShowPriority((prev) => !prev);
        }}
      >
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
            d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
          />
        </svg>
        <div>{priorityData?.level ?? "All Priority"}</div>
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
      </div>{" "}
      <div
        id="dropdown"
        className={`z-30 shadow-lg absolute top-11 lg:top-12 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
          showPriority
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {pData.map((p: priorityColorProps, idx: number) => {
            return (
              <li key={idx}>
                {priorityData?.level != p.level && (
                  <div
                    className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => {
                      setSelectedPriority(p.level);
                      setShowPriority(false);
                    }}
                  >
                    <div className={`${p.color} flex gap-1 items-center`}>
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
                          d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                        />
                      </svg>

                      <div>{p.level}</div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {selectedPriority && (
            <li>
              <div
                className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => {
                  setSelectedPriority(undefined);
                  setShowPriority(false);
                }}
              >
                <div
                  className={`text-gray-900 dark:text-gray-100 flex gap-1 items-center`}
                >
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
                      d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                    />
                  </svg>

                  <div>All Project</div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
