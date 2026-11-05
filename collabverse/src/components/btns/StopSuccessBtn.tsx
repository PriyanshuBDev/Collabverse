"use client";

interface ButtonProps {
  onStop: () => void;
  onSuccess: () => void;
  addons?: string;
  gap?: string;
  size?: string;
  flex?: string;
}
export function StopSuccessBtn({
  onStop,
  onSuccess,
  addons,
  gap,
  size,
  flex,
}: ButtonProps) {
  return (
    <div
      className={`flex ${flex} items-center ${
        gap ? `${gap}` : "gap-1"
      } relative group `}
    >
      <div
        className={`cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500 ${addons}`}
        onClick={onStop}
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
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>

      <div
        className={`cursor-pointer  hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none w-fit font-medium rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-500 ${addons}`}
        onClick={() => {
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
    </div>
  );
}
