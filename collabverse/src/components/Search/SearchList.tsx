"use client";

import GridViewUsers from "../users/Grid/GridViewUsers";
import { SearchType } from "../Appbar/SearchBar";
import Projects from "./Projects";
import SearchWsCards from "./SearchWsCards";
import { AllTaskCards } from "./AllTaskCards";

export default function SearchList({
  search,
  type,
}: {
  search: string;
  type: SearchType;
}) {
  return (
    <div className="mt-4 p-2">
      <div className={` px-3 grid  gap-4  mt-2`}>
        {(() => {
          switch (type) {
            case "task":
              return <AllTaskCards search={search} />;

            case "project":
              return <Projects search={search} />;

            case "user":
              return <GridViewUsers search={search} />;

            case "workspace":
              return <SearchWsCards search={search} />;
          }
        })()}
      </div>
    </div>
  );
}
