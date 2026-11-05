import { userInvitationsProps } from "@/app/interfaces";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import { format } from "date-fns";
import { notificationDate } from "@/lib/functions/date/notificationDate";
import { useState } from "react";
import { WsInvitationCard } from "./WsInvitationCard";
import { ProjectInvitationCard } from "./ProjectInvitationCard";

export default function InvitationCard({ i }: { i: userInvitationsProps }) {
  const [showWsCard, setShowWsCard] = useState(false);
  const [showProjectCard, setShowProjectCard] = useState(false);
  const invitationTo = i.project
    ? i.project
    : i.workspace
      ? i.workspace
      : undefined;
  const isProject = !!i.project;
  return (
    <>
      {" "}
      <div
        className={`${isProject ? " border-blue-400" : "border-green-400"} border-2 cursor-pointer bg-gray-100 dark:bg-blk4 hover:bg-gray-200 dark:hover:bg-blk6 px-2 py-1.5 lg:px-3 lg:py-3 rounded-md shadow-md dark:shadow-[0_4px_12px_rgba(0,0,0,0.5),_0_0_0_1px_rgba(255,255,255,0.05)] w-full break-words overflow-wrap-anywhere`}
        onClick={() => {
          if (i.project?.id && i.workspace?.id) {
            setShowProjectCard(true);
          } else if (i.workspace?.id) {
            setShowWsCard(true);
          }
        }}
      >
        <div className="flex items-center w-full justify-center mb-3 text-base lg:text-lg font-semibold">
          Invitation To {isProject ? "Project" : "Workspace"}
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm lg:text-base flex  gap-2">
          {isProject ? "Project" : "Workspace"}:
          {invitationTo && (
            <div className="flex items-center gap-3">
              <div className="w-fit">
                {invitationTo.avatar ? (
                  <div className="relative w-5 h-5 lg:w-6 lg:h-6 rounded-md overflow-hidden cursor-pointer border-2 border-gray-300 dark:border-gray-600">
                    <Image
                      alt={"projectAvatar"}
                      src={invitationTo.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={`w-5 h-5 lg:w-6 lg:h-6 rounded-md  flex justify-center items-center  `}
                    style={{
                      background: gradientBgFromName(invitationTo.name),
                    }}
                  >
                    <div className="font-semibold text-lg lg:text-xl text-white ">
                      {getInitials(invitationTo.name)}
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm lg:tex-base font-semibold">
                  {invitationTo.name}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="text-gray-700 dark:text-gray-300 text-sm lg:text-base flex items-center gap-3 mt-2">
          Invited By:
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600 w-fit">
            {i.invitedBy.avatar ? (
              <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                <Image
                  alt={"OwnerAvatar"}
                  src={i.invitedBy.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
                style={{
                  background: gradientBgFromName(i.invitedBy.name),
                }}
              >
                <div className="font-semibold text-xs text-white">
                  {getInitials(i.invitedBy.name)}
                </div>
              </div>
            )}
            <div className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm">
              {i.invitedBy.name}
            </div>
          </div>
        </div>
        <div className="text-sm lg:text-base mt-2 flex items-center gap-15">
          <div className="text-gray-700 dark:text-gray-300 flex items-center gap-3 ">
            Expires At:
            <div className="text-gray-900 dark:text-gray-100 ">
              {i.expireAt ? DateFormatter2(i.expireAt) : "Non Expirable"}
            </div>
          </div>
          {i.available !== null && (
            <div className="text-gray-700 dark:text-gray-300 flex items-center gap-3">
              Availablity:
              <div className="text-gray-900 dark:text-gray-100 ">
                {i.available}
              </div>
            </div>
          )}
          <div className="text-sm lg:text-base text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-2">
            Role:
            <div className="text-gray-900 dark:text-gray-100 font-semibold border-dashed border-1 rounded-md px-2  border-gray-500 dark:border-gray-600">
              {i.role}
            </div>
          </div>
        </div>

        <div className="flex justify-end w-full">
          <span
            title={format(i.createdAt, "PPPpp")}
            className="text-xs  text-gray-500 dark:text-gray-600"
          >
            {notificationDate(i.createdAt)}
          </span>
        </div>
      </div>
      {i.workspace?.id && (
        <WsInvitationCard
          show={showWsCard}
          setShow={setShowWsCard}
          wsId={i.workspace.id}
          invitationId={i.id}
        />
      )}
      {i.project?.id && i.workspace?.id && (
        <ProjectInvitationCard
          show={showProjectCard}
          setShow={setShowProjectCard}
          wsId={i.workspace.id}
          projectId={i.project.id}
          invitationId={i.id}
        />
      )}
    </>
  );
}
