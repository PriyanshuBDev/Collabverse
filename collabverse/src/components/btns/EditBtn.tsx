"use client";

import { useEffect, useState } from "react";
import Toolbar from "../helpers/Toolbar";

interface ButtonProps {
  onClick: () => void;
  onStop: () => void;
  onSuccess: () => void;
  addons?: string;
  gap?: string;
  size?: string;
  parent?: boolean;
}

export const EditBtn = ({
  onClick,
  onStop,
  onSuccess,
  addons,
  gap,
  size,
  parent,
}: ButtonProps) => {
  const [active, setActive] = useState(false);
  useEffect(() => {
    if (parent !== undefined && parent === false) {
      setActive(false);
    }
  }, [parent]);
  return (
    <div
      className={`flex items-center ${
        gap ? `${gap}` : "gap-1"
      } relative group `}
    >
      <div
        className={`cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500 ${addons}`}
        onClick={() => {
          setActive((prev) => !prev);
          if (active) {
            onStop();
          } else {
            onClick();
          }
        }}
      >
        {active ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`${size ? `${size}` : "size-3 lg:size-4"}`}
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
            className={`${size ? `${size}` : "size-3 lg:size-4"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
            />
          </svg>
        )}
      </div>
      {active && (
        <div
          className={`cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500 ${addons}`}
          onClick={() => {
            setActive((prev) => !prev);
            onSuccess();
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`${size ? `${size}` : "size-3 lg:size-4"}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m4.5 12.75 6 6 9-13.5"
            />
          </svg>
        </div>
      )}
      {!active && <Toolbar top="-top-7">Edit</Toolbar>}
    </div>
  );
};
