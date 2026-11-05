import { Dispatch, SetStateAction, useEffect } from "react";
import Toggles from "./Toggles";
export interface tabsProps {
  key: string;
  label: string;
  popUp?: number;
  popUpColor?: "neutral" | "warning";
}
export default function ProjectToggler({
  selected,
  setSelected,
  id,
}: {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  id: string;
}) {
  const tabs: tabsProps[] = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "tasks", label: "Tasks" },
    { key: "flowspace", label: "Flowspace" },
    { key: "settings", label: "Settings" },
  ];
  useEffect(() => {
    const last = localStorage.getItem(`P${id}Tab`);
    const tab = last ?? "overview";
    setSelected(tab);
  }, [id, setSelected]);
  return (
    <div className=" border-gray-200 dark:border-gray-700 w-full flex items-center md:gap-10 gap-5 px-5">
      {tabs.map((t: tabsProps, idx: number) => (
        <Toggles
          id={id}
          value={t.key}
          label={t.label}
          popup={t.popUp}
          popupColor={t.popUpColor}
          selected={selected}
          setSelected={setSelected}
          key={idx}
          type="P"
        />
      ))}
    </div>
  );
}
