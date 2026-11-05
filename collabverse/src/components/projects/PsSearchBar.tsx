import useIsDark from "@/lib/hooks/useIsDark";
import { Dispatch, SetStateAction } from "react";
import SearchbarSkeleton from "../skeletons/SearchbarSkeleton";

export default function PsSearchBar({
  search,
  setSearch,
  isLoading,
}: {
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
}) {
  const isDark = useIsDark();
  if (isLoading) {
    return <SearchbarSkeleton />;
  }
  return (
    <form className=" flex w-full max-w-md">
      <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative flex w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill={`${isDark ? "currentColor" : "none"}`}
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="default-search"
          className="block w-full px-4 lg:px-6 py-2 lg:py-3 ps-10 lg:ps-10 text-sm lg:text-base text-gray-900 border border-gray-300 rounded-full bg-gray-100 focus:outline-none dark:text-gray-200 dark:bg-blk3 dark:border-gray-600 "
          placeholder="Search projects"
          spellCheck="false"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    </form>
  );
}
