"use client";

import { useState } from "react";
import MainBtn from "../MainBtn";
import NewProjectModal from "@/components/projects/NewProjectModal";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";

export default function NewProjectBtn() {
  const [show, setShow] = useState(false);
  const { role, permissions } = useCurrentWorkspace();
  const canCreateProject =
    role === "Owner" || permissions.admin.includes("Create_Project");
  if (!canCreateProject) return null;
  return (
    <div>
      {" "}
      <MainBtn
        onClick={() => {
          setShow(true);
        }}
        addOns="px-3 md:px-5 py-1.5 md:py-2.5"
      >
        <div className="flex gap-2 items-center text-white">
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <div>New Project</div>
        </div>
      </MainBtn>
      <NewProjectModal setShow={setShow} show={show} />
    </div>
  );
}
