"use client";

import useMounted from "@/lib/hooks/useMounted";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ChangeEvent, FormEvent, KeyboardEvent } from "react";
import { toast } from "sonner";

export type SearchType = "workspace" | "user" | "project" | "task";
type optionProp = {
  type: SearchType;
  label: string;
  plural: string;
  description: string;
};
const searchOptions: {
  type: SearchType;
  label: string;
  plural: string;
  description: string;
}[] = [
  {
    type: "workspace",
    label: "Workspace",
    plural: "workspaces",
    description: "Teams and spaces",
  },
  {
    type: "user",
    label: "People",
    plural: "people",
    description: "Teammates and members",
  },
  {
    type: "project",
    label: "Project",
    plural: "projects",
    description: "Shared project spaces",
  },
  {
    type: "task",
    label: "Task",
    plural: "tasks",
    description: "Work items and to-dos",
  },
];

function CategoryIcon({
  type,
  className = "h-4 w-4",
}: {
  type: SearchType;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 20 20",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (type) {
    case "workspace":
      return (
        <svg {...common}>
          <path
            d="M3.5 16V5.5L10 2l6.5 3.5V16M2.5 16h15M7 7h.01M10 7h.01M13 7h.01M7 10h.01M10 10h.01M13 10h.01M8 16v-3h4v3"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "user":
      return (
        <svg {...common}>
          <path
            d="M13.5 16v-1.2a3 3 0 0 0-3-3h-5a3 3 0 0 0-3 3V16m5.5-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm5-5.8a3 3 0 0 1 0 5.8m1.5 2h.5a3 3 0 0 1 3 3V16"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "project":
      return (
        <svg {...common}>
          <path
            d="M2.5 6a1.5 1.5 0 0 1 1.5-1.5h4l1.7 2h6.3A1.5 1.5 0 0 1 17.5 8v7a1.5 1.5 0 0 1-1.5 1.5H4A1.5 1.5 0 0 1 2.5 15V6Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M2.5 8h15" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "task":
      return (
        <svg {...common}>
          <rect
            x="3"
            y="3"
            width="14"
            height="14"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="m6.5 10 2.2 2.2 4.8-4.8"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

export default function SearchBar() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  const [search, setSearch] = useState("");
  const [searchType, setSearchType] = useState<SearchType>("workspace");
  const [menuOpen, setMenuOpen] = useState(false);
  const { slug } = useCurrentWorkspace();
  const router = useRouter();

  if (!mounted) return null;

  const selectedOption =
    searchOptions.find((option: optionProp) => option.type === searchType) ??
    searchOptions[0];

  function handleSearchChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    const allowedRegex = /^[\p{L}\p{N}\p{Emoji_Presentation}\s._-]+$/u;

    if (value.startsWith(" ") || value.length > 25) return;
    if (value !== "" && !allowedRegex.test(value)) return;

    setSearch(value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = search.trim();
    if (!query) return;
    if (query.length < 3) {
      return toast.error("Search is less than 3 letters");
    }
    const params = new URLSearchParams({
      type: searchType,
      search: query,
    });

    router.push(`/app/${slug}/search?${params.toString()}`);
  }

  function handleMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") setMenuOpen(false);
  }

  return (
    <form onSubmit={handleSubmit} className="relative mx-auto w-full max-w-xl">
      <label htmlFor="default-search" className="sr-only">
        Search {selectedOption.plural}
      </label>

      <div className="flex h-10 w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm transition focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/10 dark:border-gray-600 dark:bg-blk3">
        {/* Search category picker */}
        <div
          className="relative z-100 shrink-0"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) {
              setMenuOpen(false);
            }
          }}
          onKeyDown={handleMenuKeyDown}
        >
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            aria-label={`Search category: ${selectedOption.label}`}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-full w-14 lg:w-[148px] items-center gap-2 rounded-l-xl border-r border-gray-300 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-blk5 dark:to-blk3 px-2 text-left transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 dark:border-gray-700 "
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
              <CategoryIcon type={selectedOption.type} />
            </span>

            <span className="min-w-0 flex-1 hidden lg:block">
              <span className="block truncate text-xs font-semibold text-gray-800 dark:text-gray-100">
                {selectedOption.label}
              </span>
              <span className="block text-[10px] text-gray-500 dark:text-gray-400">
                Search in
              </span>
            </span>

            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="none"
              className={`h-4 w-4 shrink-0 text-gray-500 transition-transform dark:text-gray-400 hidden lg:block ${
                menuOpen ? "rotate-180" : ""
              }`}
            >
              <path
                d="m5.5 7.5 4.5 4 4.5-4"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {menuOpen && (
            <div
              role="listbox"
              aria-label="Search category"
              className="absolute left-0 top-[calc(100%+8px)] w-60 overflow-hidden rounded-xl border border-gray-300 bg-gray-100 p-1.5 shadow-xl dark:border-gray-600 dark:bg-blk3 z-100"
            >
              <div className="px-3 pb-1.5 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-gray-400">
                Search category
              </div>

              {searchOptions.map((option: optionProp) => {
                const isSelected = option.type === searchType;

                return (
                  <button
                    key={option.type}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      setSearchType(option.type);
                      setMenuOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition ${
                      isSelected
                        ? "bg-emerald-500/10"
                        : "hover:bg-gray-200 dark:hover:bg-blk6"
                    }`}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                      <CategoryIcon
                        type={option.type}
                        className="h-[18px] w-[18px]"
                      />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium text-gray-800 dark:text-gray-100">
                        {option.label}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400">
                        {option.description}
                      </span>
                    </span>

                    {isSelected && (
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 20 20"
                        fill="none"
                        className="h-4 w-4 text-emerald-600 dark:text-emerald-300"
                      >
                        <path
                          d="m5 10 3.2 3.2L15.5 6"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Search input */}
        <div className="relative min-w-0 flex-1">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill={resolvedTheme === "dark" ? "currentColor" : "none"}
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          >
            <path
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <input
            type="search"
            id="default-search"
            className="h-full w-full bg-transparent py-2 pl-10 pr-3 text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-white dark:placeholder:text-gray-400"
            placeholder={`Search ${selectedOption.plural}...`}
            value={search}
            onChange={handleSearchChange}
            maxLength={25}
            required
          />
        </div>

        {/* Icon-only search button */}
        <button
          type="submit"
          aria-label="Search"
          title="Search"
          disabled={!search.trim()}
          className="grid w-12 shrink-0 place-items-center rounded-r-lg bg-gradient-to-br from-emerald-500 to-emerald-700 text-white transition-colors enabled:hover:from-emerald-600 enabled:hover:to-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-300 disabled:cursor-not-allowed "
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-[18px] w-[18px]"
          >
            <path
              d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
