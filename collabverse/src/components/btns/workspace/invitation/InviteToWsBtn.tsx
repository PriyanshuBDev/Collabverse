"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import useMounted from "@/lib/hooks/useMounted";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useIsAllowed } from "@/lib/hooks/useIsAllowed";
import MainBtn from "../../MainBtn";
import WsInviteModal from "./WsInviteModal";

export default function InviteToWsBtn() {
  const [show, setShow] = useState(false);
  const { role } = useCurrentWorkspace();
  const adminInvitePerm = useIsAllowed("Invite", "admin");
  const memberInvitePerm = useIsAllowed("Invite", "member");
  const mounted = useMounted();
  if (
    (role === "Member" && !memberInvitePerm) ||
    (role === "Admin" && !adminInvitePerm)
  )
    return null;
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
          <WsInviteModal
            setShow={setShow}
            show={show}
            currentUserRole={role}
          />,
          document.body,
        )}
    </div>
  );
}
