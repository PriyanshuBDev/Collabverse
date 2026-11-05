import { Dispatch, SetStateAction } from "react";
import Toggles from "./Toggles";
import { tabsProps } from "./ProjectToggler";

export default function UserToggler({
  selected,
  setSelected,
  id,
}: {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  id: string;
}) {
  const tabs = [
    { key: "allUsers", label: "All Users" },
    { key: "pendingApprovals", label: "Pending Approvals" },
  ];
  return (
    <div className=" border-gray-200 dark:border-gray-700 w-full flex items-center md:gap-10 gap-5 px-5">
      {tabs.map((t: tabsProps, idx: number) => (
        <Toggles
          id={id}
          value={t.key}
          label={t.label}
          selected={selected}
          setSelected={setSelected}
          key={idx}
        />
      ))}
    </div>
  );
}
