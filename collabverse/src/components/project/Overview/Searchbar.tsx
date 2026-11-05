import useIsDark from "@/lib/hooks/useIsDark";
import { ChangeEvent, Dispatch, SetStateAction } from "react";

export default function Searchbar({
  search,
  setSearch,
  placeholder,
  padding,
  text,
  round,
  svgSize,
  width,
}: {
  placeholder?: string;
  search: string;
  setSearch: Dispatch<SetStateAction<string>>;
  padding?: string;
  text?: string;
  round?: string;
  svgSize?: string;
  width?: string;
}) {
  const isDark = useIsDark();

  return (
    <form className={` flex px-1 ${width ?? "w-full"}`}>
      <label className="mb-2 text-xs font-medium text-gray-900 sr-only dark:text-white">
        Search
      </label>
      <div className="relative flex w-full">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className={` ${svgSize ?? "w-3 h-3"} text-gray-500 dark:text-gray-400`}
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
          value={search}
          id="default-search"
          className={`block w-full ${padding ?? "px-3  py-1.5 ps-8"} ${text ?? "text-sm"} ${round ?? "rounded-full"} text-gray-900 border border-gray-300  bg-gray-100 focus:outline-none dark:text-gray-200 dark:bg-blk3 dark:border-gray-600 `}
          placeholder={placeholder ?? "Search users..."}
          required
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
          }}
        />
      </div>
    </form>
  );
}
