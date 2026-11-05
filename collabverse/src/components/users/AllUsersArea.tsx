"use client";

import { useState } from "react";
import SearchUsers from "./SearchUsers";
import UserFilters from "./UserFilters";
import {
  usersProjFilterProps,
  usersTaskFilterProps,
} from "../../app/interfaces";
import ListGridToggler from "../Toggler/ListGridToggler";
import GridViewUsers from "./Grid/GridViewUsers";
import ListViewUsers from "./List/ListViewUsers";

export default function AllUsersArea() {
  const [project, setProject] = useState<usersProjFilterProps | null>(null);
  const [task, setTask] = useState<usersTaskFilterProps | null>(null);
  const [view, setView] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  return (
    <div className="mt-3 pb-10">
      <ListGridToggler
        active={view}
        setActive={setView}
        toggleName={"listGridTab"}
      />

      <div className="mt-3 flex md:items-center md:justify-between md:flex-row flex-col gap-3 ">
        <SearchUsers search={search} setSearch={setSearch} />
        <UserFilters
          setSelectedProject={setProject}
          setSelectedTask={setTask}
          selectedProject={project}
          selectedTask={task}
        ></UserFilters>
      </div>
      <div className="mt-5"></div>
      {view === 0 && (
        <ListViewUsers
          search={search}
          project={project ?? undefined}
          task={task ?? undefined}
        />
      )}
      {view === 1 && (
        <GridViewUsers
          search={search}
          project={project ?? undefined}
          task={task ?? undefined}
        />
      )}
    </div>
  );
}
