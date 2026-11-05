"use client";

import { useState } from "react";
import ProductivityChart from "../charts/ProductivityChart";
import HomeWrapper from "../wrappers/HomeWrapper";
import { useProductivityData } from "@/lib/queries/workspace/overview/useProductivityData";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";

export default function ProductivityCard() {
  const [timePeriod, setTimePeriod] = useState<"Week" | "Month">("Week");
  const [showDropdown, setShowDropdown] = useState(false);
  const { data, isLoading, isError, error } = useProductivityData(timePeriod);
  useIsErrorToast(isError, "Failed to fetch task productivity data", error);
  return (
    <div className="mt-5 h-full w-full">
      <HomeWrapper>
        <div className="flex items-center justify-between w-full">
          <div>
            <div className="lg:text-xl text-lg text-black dark:text-gray-100 font-semibold">
              Productivity Over Time
            </div>
            <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-300 mb-2 ">
              Tasks completed{" "}
              {timePeriod === "Week" ? "this Week" : "this Month"}
            </div>
          </div>

          <div className="relative items-center flex">
            <button
              onClick={() => {
                setShowDropdown((prev) => !prev);
              }}
              className="cursor-pointer text-gray-900 bg-gray-200 hover:bg-gray-200 font-medium rounded-lg text-sm lg:text-base pl-5 pr-5 py-2.5 w-25 lg:w-27 text-center inline-flex items-center dark:text-gray-200 dark:bg-blk5 dark:hover:bg-gray-600"
              type="button"
            >
              <div>{timePeriod}</div>
              <svg
                className="w-2.5 h-2.5 ms-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 10 6"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 4 4 4-4"
                />
              </svg>
            </button>

            {showDropdown && (
              <div
                id="dropdown"
                className="z-10 absolute top-11 lg:top-12 right-0 left-0 bg-gray-200 divide-y divide-gray-100 rounded-lg shadow-sm dark:bg-blk5"
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  <li>
                    <div
                      className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => {
                        setTimePeriod("Week");
                        setShowDropdown(false);
                      }}
                    >
                      Week
                    </div>
                  </li>
                  <li>
                    <div
                      className="block px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                      onClick={() => {
                        setTimePeriod("Month");
                        setShowDropdown(false);
                      }}
                    >
                      Month
                    </div>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
        <div className="h-[90%]">
          {isLoading ? (
            <div className="flex items-center w-full h-full justify-center">
              <Spinner1 size="size-6 lg:size-8" />
            </div>
          ) : data && data?.length > 0 ? (
            <ProductivityChart data={data}></ProductivityChart>
          ) : (
            <div className="flex items-center w-full h-full justify-center">
              No data found
            </div>
          )}
        </div>
      </HomeWrapper>
    </div>
  );
}
