import { WorkspacesProps } from "@/app/interfaces";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { useState } from "react";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import Xbtn from "../btns/Xbtn";

export default function WsInviteAccept({ id, role }) {
  const [showWorkspace, setShowWorskspace] = useState(true);
  const ws: WorkspacesProps = {
    id: "1",
    name: "Design Studio",
    avatar: "https://picsum.photos/200?random=1",
    slug: "",
    createdAt: new Date("2024-08-15"),
    members: 8,
    description: "Creative workspace for UI/UX and brand design projects.",
    projects: 5,
    owner: {
      id: "o1",
      avatar: "https://picsum.photos/200?random=6",
      name: "John Doedadffdfsf",
    },
  };
  return (
    <OverlayWrapper active={showWorkspace}>
      {n.meta?.expireAt &&
        (!isExpired(n.meta.expireAt) ? (
          <div className="text-lg lg:text-2xl text-red-500">
            <FlexBtwWrapper addOns="relative">
              Invitation Expired
              <Xbtn
                onClick={() => setShowWorskspace(false)}
                size="size-4 lg:size-5"
                addOns="absolute -top-2 -right-2"
              ></Xbtn>
            </FlexBtwWrapper>
            <div className="text-sm lg:text-base">
              <NotiDiv>
                <NotiSpan>You cannot join the workspace:</NotiSpan>
                <span>{`“${n.target?.name}”`}</span>
              </NotiDiv>
            </div>
          </div>
        ) : (
          <div className="relative">
            <WsCardContent ws={ws} />
            <div className="absolute -top-2 -right-2">
              <Xbtn
                onClick={() => {
                  setShowWorskspace(false);
                }}
                size="size-4 lg:size-5"
                addOns="hover:bg-gray-200 hover:dark:bg-blk6 p-0.5 rounded-full "
              ></Xbtn>
            </div>

            <div className="text-red-500 text-xs lg:text-sm">
              Expires At: {DateFormatter3(new Date(n.meta?.expireAt))}
            </div>

            <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
              <button
                className={`w-full py-0.5 lg:py-1 rounded-md text-sm lg:text-base font-semibold text-white bg-red-500 hover:bg-red-400 cursor-pointer `}
                onClick={() => {
                  setShowWorskspace(false);
                }}
              >
                Decline
              </button>

              <button
                className={`w-full py-0.5 lg:py-1 rounded-md text-sm lg:text-base font-semibold text-white bg-blue-500 hover:bg-blue-400 cursor-pointer `}
                onClick={() => {
                  setShowWorskspace(false);
                }}
              >
                Aceept
              </button>
            </div>
          </div>
        ))}
    </OverlayWrapper>
  );
}
