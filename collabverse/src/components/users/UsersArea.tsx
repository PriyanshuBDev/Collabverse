"use client";

import { useEffect, useState } from "react";

import UserToggler from "../Toggler/UserToggler";
import AllUsersArea from "./AllUsersArea";
import ApprovalArea from "./Approval/ApprovalArea";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";

export default function UsersArea() {
  const adminPermForApprove = useIsAllowed("Approve_Join", "admin");
  const { role } = useCurrentWorkspace();
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => {
    const lastOpen = localStorage.getItem(`UsersTab`);
    setSelected(lastOpen ?? "allUsers");
  }, []);

  return (
    <div className="mt-3 h-full">
      {(adminPermForApprove && role === "Admin") || role === "Owner" ? (
        <>
          <UserToggler
            setSelected={setSelected}
            selected={selected}
            id="Users"
          ></UserToggler>
          {selected === "allUsers" && <AllUsersArea />}
          {selected === "pendingApprovals" && <ApprovalArea />}
        </>
      ) : (
        <AllUsersArea />
      )}
    </div>
  );
}
