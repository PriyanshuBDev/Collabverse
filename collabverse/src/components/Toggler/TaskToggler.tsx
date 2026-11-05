import { Dispatch, SetStateAction, useEffect } from "react";
import Toggles from "./Toggles";
import { tabsProps } from "./ProjectToggler";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useTaskRole } from "@/lib/queries/workspace/project/task/comment/useTaskRole";

export default function TaskToggler({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
}) {
  const { slug } = useCurrentTask();
  const { data } = useTaskRole();

  const tabs: tabsProps[] = [
    { key: "activities", label: "Activities" },
    { key: "comments", label: "Comments" },
    { key: "attachments", label: "Attachments" },
    { key: "users", label: "Users" },
    { key: "settings", label: "Settings" },
  ].filter((tab: tabsProps) => !(!data?.role && tab.key === "comments"));
  useEffect(() => {
    const last = localStorage.getItem(`Task${slug}Tab`);
    const tab = last
      ? last === "comments" && !data?.role
        ? "activities"
        : last
      : "activities";
    setSelected(tab);
  }, [slug, setSelected, data?.role]);
  if (!data) return null;
  return (
    <div className=" border-gray-200 dark:border-gray-700 w-full flex items-center gap-3 md:gap-5 px-2 mb-3">
      {tabs.map((t: tabsProps, idx: number) => (
        <Toggles
          id={slug}
          value={t.key}
          label={t.label}
          popup={t.popUp}
          popupColor={t.popUpColor}
          selected={selected}
          setSelected={setSelected}
          key={idx}
          type="Task"
          text="text-xs md:text-sm "
        />
      ))}
    </div>
  );
}
