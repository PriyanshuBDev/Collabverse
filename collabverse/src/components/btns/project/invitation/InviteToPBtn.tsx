"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import MainBtn from "../../MainBtn";
import useMounted from "@/lib/hooks/useMounted";
import { useIsAllowedToInviteProject } from "@/lib/hooks/useIsAllowedProject";
import InviteUserPicker from "@/components/project/Invitatation/InviteUserPicker";

export default function InviteToPBtn() {
  const [show, setShow] = useState(false);
  const mounted = useMounted();
  const allowed = useIsAllowedToInviteProject();
  if (!allowed) return null;
  return (
    <div>
      <MainBtn
        onClick={() => {
          setShow(true);
        }}
        addOns=" px-3 py-1.5"
      >
        <div className="flex gap-2 items-center">
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
          <div>Invite</div>
        </div>
      </MainBtn>
      {mounted &&
        createPortal(
          <InviteUserPicker setShow={setShow} show={show} />,
          document.body,
        )}
    </div>
  );
}
