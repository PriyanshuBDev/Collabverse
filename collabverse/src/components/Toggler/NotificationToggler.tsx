import { Dispatch, SetStateAction } from "react";
import Toggles from "./Toggles";
import { tabsProps } from "./ProjectToggler";

export default function NotificationToggler({
  selected,
  setSelected,
}: {
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
}) {
  const tabs: tabsProps[] = [
    { key: "notifications", label: "Notifications" },
    { key: "invites", label: "Invites" },
  ];
  return (
    <div className=" border-gray-200 dark:border-gray-700 w-full flex items-center md:gap-10 gap-5 px-5">
      {tabs.map((t: tabsProps, idx: number) => (
        <Toggles
          value={t.key}
          label={t.label}
          selected={selected}
          setSelected={setSelected}
          key={idx}
          type="Notification"
        />
      ))}
    </div>
  );
}
