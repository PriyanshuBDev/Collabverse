import { notificationProps } from "@/app/interfaces";
import { useState } from "react";
import Toolbar from "../helpers/Toolbar";
import { format } from "date-fns";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { notificationDate } from "@/lib/functions/date/notificationDate";
import { WsInvitationCard } from "./WsInvitationCard";
import { ProjectInvitationCard } from "./ProjectInvitationCard";
import { NotificationMap } from "./NotificationMap";

export default function NotificationCard({
  n,
  inWs,
  remove,
}: {
  n: notificationProps;
  inWs?: boolean;
  remove: () => void;
}) {
  const [showWsInvitation, setShowWsInvitation] = useState(false);
  const [showProjectInvitation, setShowProjectInvitation] = useState(false);

  const ws = n.workspace
    ? n.workspace
    : {
        id: "",
        name: "unknown",
        avatar: undefined,
        slug: "",
      };

  return (
    <>
      <div
        className={` bg-gray-100 dark:bg-blk4 px-2 py-1.5 lg:px-3 lg:py-3 rounded-md shadow-md dark:shadow-[0_4px_12px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full break-words overflow-wrap-anywhere`}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 lg:gap-4">
            {n.sender ? (
              <div className="w-fit pt-1  relative">
                {n.sender.avatar ? (
                  <div
                    className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-full overflow-hidden cursor-pointer z-10 border border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"UserAvatar"}
                      src={n.sender.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`relative w-6 h-6 lg:h-8 lg:w-8 rounded-full flex justify-center items-center cursor-pointer z-10 `}
                    style={{
                      background: gradientBgFromName(
                        n.sender.name ?? "Anonymous",
                      ),
                    }}
                    onClick={() => {}}
                  >
                    <div className="font-semibold text-xs text-white z-10">
                      {getInitials(n.sender.name ?? "Anonymous")}
                    </div>
                  </div>
                )}
              </div>
            ) : n.workspace ? (
              <div className="w-fit pt-1  relative">
                {n.workspace.avatar ? (
                  <div
                    className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer z-10 border border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"UserAvatar"}
                      src={n.workspace.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`relative w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center cursor-pointer z-10 `}
                    style={{
                      background: gradientBgFromName(
                        n.workspace.name ?? "Anonymous",
                      ),
                    }}
                    onClick={() => {}}
                  >
                    <div className="font-semibold text-xs text-white z-10">
                      {getInitials(n.workspace.name ?? "Anonymous")}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div
                className="relative pt-1 w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer z-10 border border-gray-200 dark:border-gray-800"
                onClick={() => {}}
              >
                <Image
                  alt={"UserAvatar"}
                  src={"/assets/settings.jpg"}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            )}
            <div className="  break-words ">
              <NotificationMap
                n={n}
                inWs={inWs}
                setShowWsInvitation={setShowWsInvitation}
                setShowProjectInvitation={setShowProjectInvitation}
              />
            </div>
          </div>
          <div
            className="hover:dark:bg-blk9 hover:bg-gray-300 rounded-full p-1 relative group cursor-pointer"
            onClick={remove}
          >
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
                d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
            <Toolbar top="-top-8">Remove</Toolbar>
          </div>
        </div>
        <div className="flex justify-end w-full">
          <span
            title={format(n.createdAt, "PPPpp")}
            className="text-xs  text-gray-500 dark:text-gray-600"
          >
            {notificationDate(n.createdAt)}
          </span>
        </div>
      </div>
      {ws.id && n.meta?.invitationId && (
        <WsInvitationCard
          show={showWsInvitation}
          setShow={setShowWsInvitation}
          wsId={ws.id}
          invitationId={n.meta.invitationId}
        />
      )}
      {ws.id && n.meta?.invitationId && n.target?.id && (
        <ProjectInvitationCard
          show={showProjectInvitation}
          setShow={setShowProjectInvitation}
          wsId={ws.id}
          projectId={n.target.id}
          invitationId={n.meta.invitationId}
        />
      )}
    </>
  );
}
