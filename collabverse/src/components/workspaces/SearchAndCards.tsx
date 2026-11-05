"use client";

import { WorkspacesProps } from "@/app/interfaces";

import WorkspaceCards from "./WorkspaceCards";
import { useMemo, useState } from "react";
import Searchbar from "../project/Overview/Searchbar";
export default function SearchAndCard({
  gridCols,
  data,
  placeholder,
}: {
  gridCols?: string;
  data: WorkspacesProps[];
  placeholder?: string;
}) {
  const [search, setSearch] = useState("");
  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;

    return data.filter((w: WorkspacesProps) =>
      w.name
        ?.toLowerCase()
        .split(" ")
        .some((word) => word.startsWith(q)),
    );
  }, [data, search]);
  return (
    <div className="w-full h-full">
      <div className="mt-8 lg:mt-10 flex justify-start w-full max-w-md">
        {" "}
        <Searchbar
          placeholder={placeholder}
          search={search}
          setSearch={setSearch}
          padding="px-4 lg:px-6 py-2 lg:py-3 ps-10 lg:ps-10"
          text="text-sm lg:text-base"
          svgSize="size-3 lg:size-4"
        ></Searchbar>
      </div>
      <div className="mt-6 lg:mt-8">
        <WorkspaceCards
          gridCols={gridCols}
          data={filteredUsers}
        ></WorkspaceCards>
      </div>
    </div>
  );
}
