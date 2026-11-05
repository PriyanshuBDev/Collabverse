"use client";

import { useState } from "react";
import ProjectToggler from "../Toggler/ProjectToggler";
import OverviewArea from "./Overview/OverviewArea";
import TasksArea from "./Tasks/TasksArea";
import SettingsArea from "./Settings/SettingsArea";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import ProjectAllUsersArea from "./Users/ProjectAllUsersArea";
import { GoFlow } from "./GoFlow";

export default function MainArea() {
  const { slug } = useCurrentProject();
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mt-3 shrink-0">
        <ProjectToggler
          selected={selected}
          setSelected={setSelected}
          id={slug}
        />
      </div>

      <div className={` flex-1 min-h-0 flex flex-col`}>
        {selected === "overview" && <OverviewArea />}
        {selected === "users" && <ProjectAllUsersArea />}
        {selected === "tasks" && <TasksArea />}
        {selected === "flowspace" && <GoFlow />}
        {selected === "settings" && <SettingsArea />}
      </div>
    </div>
  );
}
