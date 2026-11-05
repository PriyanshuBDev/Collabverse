"use client";

import { useState } from "react";
import MainBtn from "../MainBtn";
import NewTaskModal from "./NewTaskModal";

export default function NewTaskBtn() {
  const [show, setShow] = useState(false);
  return (
    <div>
      <MainBtn
        onClick={() => {
          setShow(true);
        }}
        addOns=" px-3 py-1.5"
      >
        <div className="flex gap-2 items-center text-white">
          {" "}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <div>New Task</div>
        </div>
      </MainBtn>
      <NewTaskModal show={show} setShow={setShow}></NewTaskModal>
    </div>
  );
}
