"use client";

import { useState } from "react";
import MainBtn from "../MainBtn";
import NewWsModal from "./NewWsModal";

export default function NewWsBtn({
  label,
}: {
  label?: string;
  addOns?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <>
      <MainBtn
        onClick={() => {
          setShow(true);
        }}
        addOns="px-3 lg:px-5 py-1.5 lg:py-2.5"
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
          <div>{label ?? "New Workspace"}</div>
        </div>
      </MainBtn>
      <NewWsModal setShow={setShow} show={show} />
    </>
  );
}
