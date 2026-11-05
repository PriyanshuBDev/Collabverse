import useIsDark from "@/lib/hooks/useIsDark";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import ThreeDots from "../loadings/ThreeDots";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useProjectSearch } from "@/lib/queries/workspace/project/useProjectSearch";
import { projectProps } from "@/app/interfaces";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
export default function ProjectSearchSelector({
  project,
  setProjectProps,
  fullWidth,
  width,
  avatarSize,
  searchYPadding,
  close,
}: {
  project: projectProps | undefined;
  setProjectProps: Dispatch<SetStateAction<projectProps | undefined>>;
  fullWidth?: string;
  width?: string;
  avatarSize?: string;
  searchYPadding?: string;
  close?: boolean;
}) {
  const isDark = useIsDark();
  const [search, setSearch] = useState("");
  const [searchMode, setSearchMode] = useState(false);
  const { searchedProjects, isSearching, isError, error } =
    useProjectSearch(search);
  const showRef = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useClickOutSide([showRef], () => setShow(false));
  useEffect(() => {
    if (
      search.trim().length >= 2 &&
      (isSearching || (searchedProjects && searchedProjects.length >= 0))
    ) {
      setShow(true);
    } else {
      setShow(false);
    }
  }, [searchedProjects, isSearching, search]);
  useEffect(() => {
    if (close && close === true) {
      setSearch("");
      setSearchMode(false);
    }
  }, [close]);
  useIsErrorToast(isError, "Failed to search projects", error);
  return (
    <div className={`${fullWidth ?? "w-fit"}`} ref={showRef}>
      <form
        className={`flex w-full ${width ?? "max-w-[25rem] lg:min-w-[18rem] "} relative`}
      >
        <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
          Search
        </label>
        {!searchMode ? (
          project && (
            <div className="w-full px-2 py-1.5 flex items-center gap-3  text-sm lg:text-base text-gray-900 border-2 border-gray-300 rounded-full bg-gray-100 dark:bg-blk3 dark:border-gray-600">
              <div className="shrink-0">
                {project.avatar ? (
                  <div
                    className={`relative ${avatarSize ?? "w-5 h-5 lg:h-7 lg:w-7"} rounded-full overflow-hidden`}
                  >
                    <Image
                      alt={"activityAvatar"}
                      src={project.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`${avatarSize ?? "w-5 h-5 lg:h-7 lg:w-7"}  rounded-full flex justify-center items-center  `}
                    style={{ background: gradientBgFromName(project.name) }}
                  >
                    <div className="font-semibold  text-xs text-white ">
                      {getInitials(project.name)}
                    </div>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between w-full min-w-0 dark:text-gray-100">
                <span className=" truncate">{project.name}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-3 lg:size-4 mr-2 cursor-pointer"
                  onClick={() => {
                    setSearchMode(true);
                    setSearch("");
                  }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </div>
            </div>
          )
        ) : (
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
              className={`block w-full px-4 ${searchYPadding ?? "py-2.5"} ps-10 text-sm text-gray-900 border-2 border-gray-300 rounded-full bg-gray-100 focus:outline-none dark:bg-blk3 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500`}
              placeholder="Search Project"
              spellCheck="false"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        )}
        <div
          className={`bg-gray-200  dark:bg-blk5 absolute top-11 left-0 right-0 rounded-lg p-2 max-h-40 overflow-y-auto transition-all duration-300 ease-in-out z-10 thinScrollbar ${
            show
              ? "opacity-100 translate-y-0 visible"
              : "opacity-0 -translate-y-3 invisible"
          }`}
        >
          <ul>
            {searchedProjects &&
              searchedProjects.length > 0 &&
              searchedProjects.map((p: projectProps) => (
                <li
                  key={p.id}
                  className="flex justify-center items-center gap-3 w-full cursor-pointer px-2 py-1.5 hover:bg-gray-300 hover:dark:bg-blk8 rounded-md lg:rounded-lg"
                  onClick={() => {
                    setProjectProps(p);
                    setSearchMode(false);
                    setShow(false);
                  }}
                >
                  <div className="shrink-0">
                    {p.avatar ? (
                      <div
                        className={`relative ${avatarSize ?? "w-5 h-5 lg:h-7 lg:w-7"} lg:rounded-lg rounded-md overflow-hidden`}
                      >
                        <Image
                          alt={"activityAvatar"}
                          src={p.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`${avatarSize ?? "w-5 h-5 lg:h-7 lg:w-7"} lg:rounded-lg rounded-md  flex justify-center items-center  `}
                        style={{ background: gradientBgFromName(p.name) }}
                      >
                        <div className="font-semibold  text-xs text-white ">
                          {getInitials(p.name)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="dark:text-gray-100 truncate">
                      {p.name}
                    </span>
                    {project?.id === p.id && (
                      <span className="shrink-0 text-gray-500 pr-1 ">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="size-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="m4.5 12.75 6 6 9-13.5"
                          />
                        </svg>
                      </span>
                    )}
                  </div>
                </li>
              ))}
          </ul>
          {isSearching && (
            <div className="flex w-full justify-center py-4">
              <ThreeDots size="size-2" />
            </div>
          )}
          {!isSearching && searchedProjects?.length === 0 && (
            <div className="p-2 text-sm text-gray-500 flex justify-center">
              No prjects found
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
