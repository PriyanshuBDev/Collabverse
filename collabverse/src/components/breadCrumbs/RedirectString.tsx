"use client";

import { useRouter } from "next/navigation";

export default function RedirectString({
  label,
  to,
}: {
  label: string;
  to: string;
}) {
  const router = useRouter();
  return (
    <div
      className={`cursor-pointer text-gray-600 dark:text-gray-400 hover:underline focus:outline-none  font-semibold text-xs sm:text-sm md:text-lg flex items-center md:gap-1 gap-0.5 mr-0.5 md:mr-1`}
      onClick={() => {
        router.push(to);
      }}
    >
      {label}
      <svg
        className="md:w-5 md:h-5 w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m9 5 7 7-7 7"
        />
      </svg>
    </div>
  );
}
