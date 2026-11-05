"use client";
import { DateFormatter5 } from "@/lib/functions/date/DateFormatter5";

export interface UTCardProps {
  name: string;
  status: string;
  date: Date;
}

export default function UpcomingTasksCard({ name, status, date }: UTCardProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-1 lg:p-1.5 rounded-full text-red-500 bg-red-300">
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
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      </div>
      <div className="">
        <div className="text-sm lg:text-base text-black dark:text-gray-200 font-semibold">
          {name}
        </div>
        <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
          {status} • {DateFormatter5(date)}
        </div>
      </div>
    </div>
  );
}
