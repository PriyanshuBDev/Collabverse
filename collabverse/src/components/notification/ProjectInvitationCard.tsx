import { Dispatch, SetStateAction, useState } from "react";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import Xbtn from "../btns/Xbtn";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import Image from "next/image";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { MemberSvg } from "../svg/MemberSvg";
import Toolbar from "../helpers/Toolbar";
import { CreatedBySvg } from "../svg/CreatedBySvg";

import { useProjectInvitationDetails } from "@/lib/queries/user/invitation/useProjectInvitationDetails";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";

export function ProjectInvitationCard({
  show,
  setShow,
  wsId,
  projectId,
  invitationId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  wsId: string;
  projectId: string;
  invitationId: string;
}) {
  const { data, isLoading, isError, error, inviteResponse } =
    useProjectInvitationDetails(wsId, projectId, invitationId, show);
  const [readMore, setReadMore] = useState(false);
  useIsErrorToast(isError, "Failed at fetch project invitation details", error);
  if (isLoading || inviteResponse.isPending) {
    return (
      <OverlayWrapper active>
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-6 lg:size-8"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </OverlayWrapper>
    );
  }
  if (!data) return null;
  const project = data.project;
  return (
    <OverlayWrapper active={show}>
      {data.expireAt &&
      new Date(data.expireAt).getTime() <= new Date().getTime() ? (
        <div className="flex gap-3">
          <div>
            <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
              Invitation has been expired at {DateFormatter2(data.expireAt)}
            </div>
          </div>
          <Xbtn onClick={() => setShow(false)} size="size-5 lg:size-6"></Xbtn>
        </div>
      ) : data.status === "Revoked" ? (
        <div className="flex gap-3">
          <div>
            <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
              Invitation has been revoked
            </div>
          </div>
          <Xbtn onClick={() => setShow(false)} size="size-5 lg:size-6"></Xbtn>
        </div>
      ) : (
        <div className="lg:w-sm w-xs  text-gray-900 dark:text-gray-100">
          <FlexBtwWrapper>
            {" "}
            <div className="text-gray-900 dark:text-gray-100 text-xl font-semibold flex items-center w-full justify-center ">
              Invitation To Project
            </div>
            <Xbtn size="size-5 md:size-6" onClick={() => setShow(false)}></Xbtn>
          </FlexBtwWrapper>
          <div className="flex  items-center  gap-3 px-4 py-3">
            <div className="w-fit">
              {project.avatar ? (
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                  <Image
                    alt={"projectAvatar"}
                    src={project.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-11 h-11 lg:w-12 lg:h-12  rounded-lg  flex justify-center items-center  `}
                  style={{ background: gradientBgFromName(project.name) }}
                >
                  <div className="font-semibold text-lg lg:text-xl text-white ">
                    {getInitials(project.name)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="text-base lg:text-lg font-semibold">
                {project.name}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 xl:gap-2 relative group w-fit">
                  <MemberSvg size="w-4 h-4"></MemberSvg>
                  <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
                    {project.members}
                  </div>
                  <Toolbar top="-top-6">Members</Toolbar>
                </div>
                <div className="flex items-center gap-1 xl:gap-2 relative group ">
                  <CreatedBySvg />
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600 w-fit">
                    {project.owner.avatar ? (
                      <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                        <Image
                          alt={"OwnerAvatar"}
                          src={project.owner.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
                        style={{
                          background: gradientBgFromName(project.owner.name),
                        }}
                      >
                        <div className="font-semibold text-xs text-white">
                          {getInitials(project.owner.name)}
                        </div>
                      </div>
                    )}
                    <div className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm">
                      {project.owner.name}
                    </div>
                  </div>
                  <Toolbar top="-top-6">Owner</Toolbar>
                </div>
              </div>
            </div>
          </div>
          {project.description && (
            <div className="rounded-lg bg-gray-100 dark:bg-blk6 p-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm  break-words  overflow-wrap-anywhere whitespace-pre-wrap">
              {project.description.length > 200 ? (
                <div className=" break-words">
                  {readMore
                    ? project.description
                    : `${project.description.slice(0, 200)}...`}
                  <div className="flex justify-end ">
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        setReadMore((prev) => !prev);
                      }}
                    >
                      {readMore ? "Read Less" : "Read More"}
                    </div>
                  </div>
                </div>
              ) : (
                project.description
              )}
            </div>
          )}
          <div className="text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-3 text-xs lg:text-sm">
            Invited By:
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600 w-fit">
              {data.invitedBy.avatar ? (
                <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                  <Image
                    alt={"InvitedByAvatar"}
                    src={data.invitedBy.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
                  style={{
                    background: gradientBgFromName(data.invitedBy.name),
                  }}
                >
                  <div className="font-semibold text-xs text-white">
                    {getInitials(data.invitedBy.name)}
                  </div>
                </div>
              )}
              <div className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm">
                {data.invitedBy.name}
              </div>
            </div>
          </div>

          <div className="text-gray-600 dark:text-gray-400 flex items-center gap-3 ">
            Expires At:
            <div className="text-gray-900 dark:text-gray-100 ">
              {data.expireAt ? DateFormatter2(data.expireAt) : "Non Expirable"}
            </div>
          </div>

          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-2">
            Role:
            <div className="text-gray-900 dark:text-gray-100 font-semibold border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600">
              {data.role}
            </div>
          </div>

          <div className="flex items-center lg:gap-5 gap-2 mt-5">
            <div
              className="flex justify-center w-full py-2 rounded-md bg-red-500 hover:bg-red-600 text-white lg:text-base text-sm font-semibold cursor-pointer"
              onClick={() => {
                inviteResponse.mutate("Decline");
                setShow(false);
              }}
            >
              Decline
            </div>
            <div
              className="flex justify-center w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white lg:text-base text-sm font-semibold cursor-pointer"
              onClick={() => {
                inviteResponse.mutate("Accept");
                setShow(false);
              }}
            >
              Accept
            </div>
          </div>
        </div>
      )}
    </OverlayWrapper>
  );
}
