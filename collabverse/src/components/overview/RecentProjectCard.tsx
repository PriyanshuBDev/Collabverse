"use client";

import ProgressBar from "../progress/ProgressBar";
import SubWrapper from "../wrappers/SubWrapper";

export interface RPCardProps {
  name: string;
  done: number;
  total: number;
  description?: string;
}

export default function RecentProjectCard({
  name,
  done,
  total,
  description,
}: RPCardProps) {
  return (
    <SubWrapper>
      <div className="flex justify-between items-center w-full gap-3">
        <div className="md:text-base text-sm text-black dark:text-gray-100 font-semibold">
          {name}
        </div>
        <div
          className={`rounded-full px-2 py-0.5  text-xs ${
            total === 0
              ? "bg-blue-200 text-blue-700"
              : done === total
                ? "bg-green-200 text-green-700"
                : done === 0
                  ? "bg-blue-200 text-blue-700"
                  : "bg-yellow-200 text-yellow-700"
          }`}
        >
          {total === 0
            ? "Not Started"
            : done === total
              ? "Completed"
              : done === 0
                ? "Not Started"
                : "In Progress"}
        </div>
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-300 mb-1 md:mb-3 ">
        {description && description.length > 100
          ? `${description.slice(0, 100)}...`
          : description}
      </div>
      <ProgressBar
        current={done}
        total={total}
        shimmer={true}
        height="md:h-4 h-3"
      ></ProgressBar>
    </SubWrapper>
  );
}
