import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { memberProps, taskMembersProps } from "../../../app/interfaces";
import useIsDark from "@/lib/hooks/useIsDark";
import { toast } from "sonner";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import SearchProjectUserCard from "./SearchProjectUserCard";
import ThreeDots from "@/components/loadings/ThreeDots";
import { useProjectUserSearch } from "@/lib/queries/workspace/project/users/useProjectUserSearch";

export default function SearchProjectUser({
  setUsers,
  users,
  projectId,
}: {
  setUsers: Dispatch<SetStateAction<taskMembersProps[]>>;
  users: taskMembersProps[];
  projectId: string;
}) {
  const isDark = useIsDark();
  const [search, setSearch] = useState("");
  const { searchedUsers, isSearching, isError } = useProjectUserSearch(
    search,
    projectId,
    "assignable",
  );
  const [show, setShow] = useState(false);
  const showRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([showRef], () => setShow(false));
  useEffect(() => {
    if (
      search.trim().length >= 2 &&
      (isSearching || (searchedUsers && searchedUsers.length >= 0))
    ) {
      setShow(true);
    }
  }, [searchedUsers, isSearching, search]);
  useEffect(() => {
    if (isError) {
      toast.error("Something went wrong");
    }
  }, [isError]);

  return (
    <div className="w-full" ref={showRef}>
      <form className=" flex w-full max-w-lg relative">
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
            className="block w-full px-4 py-2 ps-10 text-sm text-gray-900 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none dark:bg-blk3 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            placeholder="Search Users (viewers can't be assigned)"
            spellCheck="false"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          id="dropdown"
          className={`thinScrollbar max-h-30  overflow-y-auto z-30 shadow-lg absolute top-10 md:top-11 left-1/2 -translate-x-1/2 w-max min-w-full bg-gray-200  transition-all duration-300  rounded-lg dark:bg-blk6 ${
            show
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-3 invisible pointer-events-none"
          }`}
        >
          {searchedUsers &&
            searchedUsers.length > 0 &&
            searchedUsers.map((m: memberProps) => (
              <SearchProjectUserCard
                member={m}
                users={users}
                setUsers={setUsers}
                key={m.id}
              ></SearchProjectUserCard>
            ))}
          {isSearching && (
            <div className="flex w-full justify-center py-4">
              <ThreeDots size="size-2" />
            </div>
          )}
          {!isSearching && searchedUsers?.length === 0 && (
            <div className="p-2 text-sm text-gray-500 flex justify-center">
              No users found
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
