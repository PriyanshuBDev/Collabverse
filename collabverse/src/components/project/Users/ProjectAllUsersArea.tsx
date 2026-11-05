"use client";

import { usersTaskFilterProps } from "@/app/interfaces";
import ListGridToggler from "@/components/Toggler/ListGridToggler";
import SearchUsers from "@/components/users/SearchUsers";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useState } from "react";
import ProjectUserFilters from "./ProjectUserFilters";
import ProjectListUsers from "./ProjectListUsers";
import ProjectGridUsers from "./ProjectGridUsers";

export default function ProjectAllUsersArea() {
  const { id, slug } = useCurrentProject();
  const [task, setTask] = useState<usersTaskFilterProps | undefined>(undefined);
  const [view, setView] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="mt-3 pb-10">
      <ListGridToggler
        active={view}
        setActive={setView}
        toggleName={`listGridTab-${slug}`}
      />

      <div className="mt-3 flex md:items-center md:justify-between md:flex-row flex-col gap-3 ">
        <SearchUsers search={search} setSearch={setSearch} />
        <ProjectUserFilters
          setSelectedTask={setTask}
          selectedTask={task}
        ></ProjectUserFilters>
      </div>
      <div className="mt-5"></div>
      {view === 0 && <ProjectListUsers id={id} search={search} task={task} />}
      {view === 1 && <ProjectGridUsers id={id} search={search} task={task} />}
    </div>
  );
}
