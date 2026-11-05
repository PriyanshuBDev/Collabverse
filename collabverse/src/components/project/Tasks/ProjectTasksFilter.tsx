"use client";

import GetStatusSvg from "@/components/helpers/GetStatusSvg";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import getStatusColor from "@/lib/functions/colors/getStatusColor";
import { useState } from "react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface priorityProps {
  color: string;
  level: string;
}

export default function ProjectTasksFilter({ disable }: { disable: boolean }) {
  const [showPriority, setShowPriority] = useState(false);

  const pData: priorityProps[] = [
    { color: "text-gray-900 dark:text-gray-100", level: "All Priority" },
    { color: "text-[#34d399]", level: "Low" },
    { color: "text-[#fbbf24]", level: "Medium" },
    { color: "text-[#f97316]", level: "High" },
    { color: "text-[#ef4444]", level: "Critical" },
  ];
  const [showStatus, setShowStatus] = useState(false);
  const statusData: string[] = [
    "Select status",
    "To Do",
    "In Progress",
    "In Review",
    "Done",
  ];
  const [selectedStatus, setSelectedStatus] = useState(statusData[0]);
  const [priorityData, setPriorityData] = useState<priorityProps>(pData[0]);

  const [selectedDate, setSelectedDate] = useState<Date>();

  const [showDate, setShowDate] = useState(false);

  return (
    <div className="flex items-center gap-2 ">
      <div className="relative lg:min-w-35 min-w-30 text-nowrap">
        <div
          className={`${priorityData.color} cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
          onClick={() => {
            setShowPriority((prev) => !prev);
            setShowDate(false);
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
          <div>{priorityData.level}</div>
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
            {pData.map((p: priorityProps, idx: number) => {
              return (
                <li key={idx}>
                  {priorityData.level != p.level ? (
                    <div
                      className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => {
                        setPriorityData(p);
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
                  ) : (
                    <></>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      {disable ? (
        <div className="relative lg:min-w-35 min-w-30 text-nowrap">
          <div
            className={`${
              selectedStatus === "Select status"
                ? "text-gray-900 dark:text-gray-100"
                : getStatusColor(selectedStatus)
            } cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-xs md:text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
            onClick={() => {
              setShowStatus((prev) => !prev);
              setShowDate(false);
              setShowPriority(false);
            }}
          >
            {selectedStatus != "Select status" ? (
              <GetStatusSvg status={selectedStatus} />
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

            <div>{selectedStatus}</div>
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
              {statusData.map((s: string, idx: number) => {
                return (
                  <li key={idx}>
                    {selectedStatus !== s && s !== "Select status" && (
                      <div
                        className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={() => {
                          setSelectedStatus(s);
                          setShowStatus(false);
                        }}
                      >
                        <div
                          className={`${
                            s === "Select status"
                              ? "text-gray-900 dark:text-gray-100"
                              : getStatusColor(s)
                          } flex gap-1 items-center`}
                        >
                          {s != "Select status" && <GetStatusSvg status={s} />}

                          <div>{s}</div>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
              {selectedStatus != "Select status" && (
                <li>
                  <div
                    className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                    onClick={() => {
                      setSelectedStatus(statusData[0]);
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
      ) : (
        <div
          className={`${
            disable ? "opacity-50 pointer-events-none cursor-not-allowed" : ""
          } relative lg:min-w-35 min-w-30`}
        >
          <div
            className="text-gray-900 dark:text-gray-100 cursor-pointer flex gap-1 justify-between items-center bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none  font-semibold text-sm rounded-md lg:px-2 px-1 lg:py-1.5 py-1"
            onClick={() => {
              setShowDate((prev) => !prev);
              setShowPriority(false);
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
      )}
    </div>
  );
}
