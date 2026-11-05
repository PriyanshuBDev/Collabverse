"use client";

import { DateFormatter } from "@/lib/functions/date/DateFormatter";
import Image from "next/image";
import { useMemo } from "react";

interface ActivityProps {
  type?: string;
  description: string;
  title?: string;
  timestamp: Date;
  user?: {
    id: string;
    avatar?: string;
    name?: string;
  };
}
export default function ActivityType({
  type,
  description,
  timestamp,
  title,
  user,
}: ActivityProps) {
  const { svg, svgBg, svgColor } = useMemo(() => {
    switch (type) {
      case "Task completed":
        return {
          svg: (
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
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          ),
          svgBg: "bg-green-300",
          svgColor: "text-green-700",
        };
      case "Task Status Changed":
        return {
          svg: (
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
                d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
              />
            </svg>
          ),
          svgBg: "bg-yellow-300",
          svgColor: "text-yellow-700",
        };
      case "Project completed":
        return {
          svg: (
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
                d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
              />
            </svg>
          ),
          svgBg: "bg-blue-300",
          svgColor: "text-blue-700",
        };
      default:
        return { svg: null, svgBg: "", svgColor: "" };
    }
  }, [type]);
  return (
    <div className="flex gap-3 items-center">
      {type && (
        <div className={`${svgBg} ${svgColor} p-1 lg:p-1.5 rounded-lg`}>
          <span>{svg}</span>
        </div>
      )}
      {user?.avatar && (
        <div className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-lg overflow-hidden">
          <Image
            alt={"activityAvatar"}
            src={user.avatar}
            className="object-center"
            fill
          ></Image>
        </div>
      )}
      <div>
        <div className="text-sm lg:text-base ">
          {title && (
            <div className="flex items-center gap-1">
              <div className="text-black dark:text-gray-100 font-semibold">
                {title}:
              </div>{" "}
              <div className="text-gray-800 dark:text-gray-300">{type}</div>
            </div>
          )}
          {user && (
            <div className="flex items-center gap-1">
              <div className="text-black dark:text-gray-100 font-semibold">
                {user.name}:
              </div>{" "}
              <div className="text-gray-800 dark:text-gray-300">
                {description}
              </div>
            </div>
          )}
        </div>
        <div className="text-xs lg:text-sm text-gray-500 dark:text-gray-500">
          {DateFormatter(timestamp)}
        </div>
      </div>
    </div>
  );
}
