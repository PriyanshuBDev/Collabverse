"use client";

import Toolbar from "@/components/helpers/Toolbar";
import Spinner1 from "@/components/loadings/Spinner1";
import { CreatedBySvg } from "@/components/svg/CreatedBySvg";
import { InformationSvg } from "@/components/svg/InformationSvg";
import { MemberSvg } from "@/components/svg/MemberSvg";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import getInitials from "@/lib/functions/user/getInitials";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useWsLinkInvitation } from "@/lib/queries/user/invitation/useWsLinkInvitation";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function Join() {
  const params = useParams<{ workspace: string; token: string }>();
  const token = params.token;
  const slug = params.workspace;
  const { data, isLoading, isError, error, linkInvite } = useWsLinkInvitation(
    slug,
    token,
  );
  const [readMore, setReadMore] = useState(false);
  useIsErrorToast(
    isError,
    "Failed at fetch workspace invitation details",
    error,
  );
  if (isLoading || linkInvite.isPending) {
    return (
      <div className="flex items-center justify-center h-full w-full ">
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-6 lg:size-8"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }
  if (!data) return null;
  const ws = data.workspace;
  const isExpired =
    data.expireAt && new Date(data.expireAt).getTime() <= new Date().getTime();
  const isRevoked = data.status === "Revoked";
  return (
    <div className="flex items-center justify-center h-full w-full transition-all duration-300 bg-gray-50 dark:bg-blk4 shadow-md rounded-xl z-1001 p-5">
      {data.joinRequestStatus === "Approved" ? (
        <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
          Join request already approved
        </div>
      ) : data.joinRequestStatus === "Pending" ? (
        <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
          Waiting for join request approval
        </div>
      ) : data.joinRequestStatus === "Rejected" ? (
        <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
          Join request has been rejected
        </div>
      ) : isExpired && data.expireAt ? (
        <>
          <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
            Invaitation has been expired at {DateFormatter2(data.expireAt)}
          </div>
        </>
      ) : isRevoked ? (
        <>
          <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
            Invitation has been revoked
          </div>
        </>
      ) : (
        <div className="lg:w-sm w-xs  text-gray-900 dark:text-gray-100">
          <div className="text-gray-900 dark:text-gray-100 text-xl font-semibold flex items-center w-full justify-center ">
            Invitation To Workspace
          </div>

          <div className="flex  items-center  gap-3 px-4 py-3">
            <div className="w-fit">
              {ws.avatar ? (
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                  <Image
                    alt={"workspaceAvatar"}
                    src={ws.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-12 h-12 lg:w-14 lg:h-14  rounded-lg  flex justify-center items-center  `}
                  style={{ background: gradientBgFromName(ws.name) }}
                >
                  <div className="font-semibold text-lg lg:text-xl text-white ">
                    {getInitials(ws.name)}
                  </div>
                </div>
              )}
            </div>
            <div>
              <div className="text-base lg:text-lg font-semibold">
                {ws.name}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 xl:gap-2 relative group w-fit">
                  <MemberSvg size="w-4 h-4"></MemberSvg>
                  <div className="text-gray-600 text-sm dark:text-gray-300 font-semibold">
                    {ws.members}
                  </div>
                  <Toolbar top="-top-6">Members</Toolbar>
                </div>
                <div className="flex items-center gap-1 xl:gap-2 relative group ">
                  <CreatedBySvg />
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600 w-fit">
                    {ws.owner.avatar ? (
                      <div className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                        <Image
                          alt={"OwnerAvatar"}
                          src={ws.owner.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
                        style={{
                          background: gradientBgFromName(ws.owner.name),
                        }}
                      >
                        <div className="font-semibold text-xs text-white">
                          {getInitials(ws.owner.name)}
                        </div>
                      </div>
                    )}
                    <div className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm">
                      {ws.owner.name}
                    </div>
                  </div>
                  <Toolbar top="-top-6">Owner</Toolbar>
                </div>
              </div>
            </div>
          </div>
          {ws.description && (
            <div className="rounded-lg bg-gray-100 dark:bg-blk6 p-3 text-gray-600 dark:text-gray-400 text-xs lg:text-sm  break-words  overflow-wrap-anywhere whitespace-pre-wrap">
              {ws.description.length > 200 ? (
                <div className=" break-words">
                  {readMore
                    ? ws.description
                    : `${ws.description.slice(0, 200)}...`}
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
                ws.description
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
          <div className="text-xs lg:text-sm mt-2 flex items-center gap-15">
            <div className="text-gray-600 dark:text-gray-400 flex items-center gap-3 ">
              Expires At:
              <div className="text-gray-900 dark:text-gray-100 ">
                {data.expireAt
                  ? DateFormatter2(data.expireAt)
                  : "Non Expirable"}
              </div>
            </div>
            {data.available !== null && (
              <div className="text-gray-600 dark:text-gray-400 flex items-center gap-3">
                Availablity:
                <div className="text-gray-900 dark:text-gray-100 ">
                  {data.available}
                </div>
              </div>
            )}
          </div>
          <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 flex items-center gap-3 mt-2">
            Role:
            <div className="text-gray-900 dark:text-gray-100 font-semibold border-dashed border-1 rounded-md px-2 py-0.5 border-gray-500 dark:border-gray-600">
              {data.role}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
            <InformationSvg size="size-4" />
            Accept to send a join request. Access is granted after approval.
          </div>

          <div
            className=" mt-5 flex justify-center w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white lg:text-base text-sm font-semibold cursor-pointer"
            onClick={() => {
              linkInvite.mutate(ws.id);
            }}
          >
            Accept
          </div>
        </div>
      )}
    </div>
  );
}
