import GetStatusSvg from "@/components/helpers/GetStatusSvg";
import getStatusColor from "@/lib/functions/colors/getStatusColor";
import { statusMap } from "@/lib/functions/task/status/statusTransition";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { TaskStatus } from "@prisma/client";
import { Dispatch, SetStateAction, useRef, useState } from "react";

export default function StatusFilter({
  selectedStatus,
  setSelectedStatus,
}: {
  setSelectedStatus: Dispatch<SetStateAction<TaskStatus | undefined>>;
  selectedStatus: TaskStatus | undefined;
}) {
  const [showStatus, setShowStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([statusRef], () => setShowStatus(false));
  const mappedStatus = selectedStatus ? statusMap(selectedStatus) : undefined;
  const statusData: TaskStatus[] = [
    "To_Do",
    "In_Progress",
    "In_Review",
    "Done",
  ];
  return (
    <div ref={statusRef} className="relative lg:min-w-35 min-w-30 text-nowrap">
      <div
        className={`${
          mappedStatus
            ? getStatusColor(mappedStatus)
            : "text-gray-900 dark:text-gray-100"
        } cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-xs md:text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
        onClick={() => {
          setShowStatus((prev) => !prev);
        }}
      >
        {mappedStatus ? (
          <GetStatusSvg status={mappedStatus} />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 lg:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5m.75-9 3-3 2.148 2.148A12.061 12.061 0 0 1 16.5 7.605"
            />
          </svg>
        )}

        <div>{mappedStatus ?? "Select Status"}</div>
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
        className={`z-30 shadow-lg absolute top-9 lg:top-10 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
          showStatus
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-10 invisible pointer-events-none"
        }`}
      >
        <ul
          className="py-2 text-sm text-gray-700 dark:text-gray-200"
          aria-labelledby="dropdownDefaultButton"
        >
          {statusData.map((s: TaskStatus, idx: number) => {
            const mappedS = statusMap(s);
            return (
              <li key={idx}>
                {selectedStatus !== s && (
                  <div
                    className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => {
                      setSelectedStatus(s);
                      setShowStatus(false);
                    }}
                  >
                    <div
                      className={`${getStatusColor(mappedS)} flex gap-1 items-center`}
                    >
                      {<GetStatusSvg status={mappedS} />}

                      <div>{mappedS}</div>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
          {mappedStatus && (
            <li>
              <div
                className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                onClick={() => {
                  setSelectedStatus(undefined);
                  setShowStatus(false);
                }}
              >
                <div
                  className={` text-gray-900 dark:text-gray-100 flex gap-1 items-center`}
                >
                  <div>None</div>
                </div>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
