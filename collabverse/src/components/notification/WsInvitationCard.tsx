import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import { InformationSvg } from "../svg/InformationSvg";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import Toolbar from "../helpers/Toolbar";
import { MemberSvg } from "../svg/MemberSvg";
import { CreatedBySvg } from "../svg/CreatedBySvg";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import Xbtn from "../btns/Xbtn";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { Dispatch, SetStateAction, useState } from "react";
import { useWsInvitationDetails } from "@/lib/queries/user/invitation/useWsInvitationDetails";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Spinner1 from "../loadings/Spinner1";
export function WsInvitationCard({
  show,
  setShow,
  wsId,
  invitationId,
}: {
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  wsId: string;
  invitationId: string;
}) {
  const { data, isLoading, isError, error, usernameInvite } =
    useWsInvitationDetails(wsId, invitationId, show);
  const [readMore, setReadMore] = useState(false);
  useIsErrorToast(
    isError,
    "Failed at fetch workspace invitation details",
    error,
  );
  if (isLoading || usernameInvite.isPending) {
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
  const ws = data.workspace;

  return (
    <OverlayWrapper active={show}>
      {data.status === "Accepted" ? (
        data.joinRequestStatus === "Approved" ? (
          <Card label="Join request already approved" setShow={setShow} />
        ) : data.joinRequestStatus === "Pending" ? (
          <Card label="Waiting for join request approval" setShow={setShow} />
        ) : data.joinRequestStatus === "Rejected" ? (
          <Card label="Join request has been rejected" setShow={setShow} />
        ) : (
          <Card label="Waiting for join request approval" setShow={setShow} />
        )
      ) : data.expireAt &&
        new Date(data.expireAt).getTime() <= new Date().getTime() ? (
        <Card
          label={`Invaitation has been expired at ${DateFormatter2(data.expireAt)}`}
          setShow={setShow}
        />
      ) : data.status === "Revoked" ? (
        <Card label="Invitation has been revoked" setShow={setShow} />
      ) : (
        <div className="lg:w-sm w-xs  text-gray-900 dark:text-gray-100">
          <FlexBtwWrapper>
            {" "}
            <div className="text-gray-900 dark:text-gray-100 text-xl font-semibold flex items-center w-full justify-center ">
              Invitation To Workspace
            </div>
            <Xbtn size="size-5 md:size-6" onClick={() => setShow(false)}></Xbtn>
          </FlexBtwWrapper>
          <div className="flex  items-center  gap-3 px-4 py-3">
            <div className="w-fit">
              {ws.avatar ? (
                <div className="relative w-12 h-12 lg:w-14 lg:h-14 rounded-lg overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800">
                  <Image
                    alt={"projectAvatar"}
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
          <div className="flex items-center lg:gap-5 gap-2 mt-5">
            <div
              className="flex justify-center w-full py-2 rounded-md bg-red-500 hover:bg-red-600 text-white lg:text-base text-sm font-semibold cursor-pointer"
              onClick={() => {
                usernameInvite.mutate("Decline");
                setShow(false);
              }}
            >
              Decline
            </div>
            <div
              className="flex justify-center w-full py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white lg:text-base text-sm font-semibold cursor-pointer"
              onClick={() => {
                usernameInvite.mutate("Accept");
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

function Card({
  label,
  setShow,
}: {
  label: string;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  return (
    <div className="flex gap-3">
      <div>
        <div className="text-base lg:text-lg text-red-500 flex flex-wrap max-w-sm lg:max-w-md ">
          {label}
        </div>
      </div>
      <Xbtn onClick={() => setShow(false)} size="size-5 lg:size-6"></Xbtn>
    </div>
  );
}
