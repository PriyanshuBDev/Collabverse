import MainArea from "@/components/Profile/MainArea";

import Link from "next/link";

export default function Profile() {
  return (
    <div className="h-full w-full ">
      <div className="flex gap-5">
        <Link
          href={"/app"}
          className="p-2 lg:p-3 h-fit w-fit mt-1 lg:mt-2 rounded-md bg-gray-200 dark:bg-blk4 hover:bg-gray-300 dark:hover:bg-blk6"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-6"
          >
            <path
              fillRule="evenodd"
              d="M7.72 12.53a.75.75 0 0 1 0-1.06l7.5-7.5a.75.75 0 1 1 1.06 1.06L9.31 12l6.97 6.97a.75.75 0 1 1-1.06 1.06l-7.5-7.5Z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <div className="flex gap-1 flex-col">
          <div className="text-black font-semibold dark:text-gray-100 text-xl md:text-2xl lg:text-3xl xl:text-4xl">
            My Profile
          </div>
          <div className="text-gray-600  dark:text-gray-400 text-xs md:text-sm lg:text-base xl:text-lg">
            Profile settings & information.
          </div>
        </div>
      </div>

      <MainArea />
    </div>
  );
}
