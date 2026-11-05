"use client";

import { useEffect, useState } from "react";
import NotificationToggler from "../Toggler/NotificationToggler";
import AllNotifications from "./AllNotifications";
import InvitesArea from "./InvitesArea";

export default function MainArea() {
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const last = localStorage.getItem(`NotificationTab`);
    setSelected(last ?? "notifications");
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mt-3 shrink-0">
        <NotificationToggler selected={selected} setSelected={setSelected} />
      </div>

      <div className={` flex-1 min-h-0 flex flex-col`}>
        {selected === "notifications" && <AllNotifications />}
        {selected === "invites" && <InvitesArea />}
      </div>
    </div>
  );
}
