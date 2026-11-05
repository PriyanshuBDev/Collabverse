"use client";

import BorderWrapper from "@/components/wrappers/BorderWrapper";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { useState } from "react";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import CheckToggler from "@/components/Toggler/CheckToggler";
import SubBorderWrapper from "@/components/wrappers/SubBorderWrapper";
import WsLeaveWarning from "../warnings/WsLeaveWarning";
import WsDeleteWarning from "../warnings/WsDeleteWarning";
import { createPortal } from "react-dom";
import UserPicker from "./UserPicker";
import TransferWarning from "../warnings/TransferWarning";
import useMounted from "@/lib/hooks/useMounted";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useWsSettings } from "@/lib/queries/workspace/settings/useWsSettings";
import SettingsSkeleton from "../skeletons/SettingsSkeleton";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { wsAdminPerm, wsMemberPerm } from "@/app/interfaces";
import MainBtn from "../btns/MainBtn";
import { PencilSvgLight } from "../svg/PencilSvg";
import EditWsSettings from "./EditWsSettings";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import Spinner2 from "../loadings/Spinner2";
import { DustbinSvg } from "../svg/DustbinSvg";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function Settings() {
  const {
    data,
    isPending,
    isError,
    error,
    togglePerm,
    transfer,
    leave,
    deleteWorkspace,
  } = useWsSettings();
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const [readMore, setReadMore] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [transferWarning, setTransferWarning] = useState(false);
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const mounted = useMounted();
  useIsErrorToast(isError, "Failed to fetch workspace settings", error);
  const { slug } = useCurrentWorkspace();
  if (isPending) {
    return <SettingsSkeleton />;
  }
  if (!mounted || !data) {
    return null;
  }
  function adminIncludes(perm: wsAdminPerm) {
    return data?.permissions.admin.includes(perm) ?? false;
  }
  function memberIncludes(perm: wsMemberPerm) {
    return data?.permissions.member.includes(perm) ?? false;
  }
  const permissions = {
    admin: {
      canRemoveMem: adminIncludes("Remove_Member"),
      canInvite: adminIncludes("Invite"),
      canCreateProject: adminIncludes("Create_Project"),
      canEditWs: adminIncludes("Edit_Ws_Details"),
      canApprove: adminIncludes("Approve_Join"),
    },
    member: {
      canCreateProject: memberIncludes("Create_Project"),
      canInvite: memberIncludes("Invite"),
    },
  };
  const canChangePerm =
    data.currentUser.role === "Owner" && data.owner.id === data.currentUser.id;
  if (deleteWorkspace.isPending)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <DustbinSvg />
        </Spinner2>
      </OverlayWrapper>
    );
  return (
    <>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            General
          </div>
          <SubBorderWrapper>
            {(canChangePerm || permissions.admin.canEditWs) && (
              <div className="flex  justify-end w-full">
                <MainBtn
                  onClick={() => {
                    setShowEdit(true);
                  }}
                  addOns="flex items-center justify-center w-20 lg:w-25 py-1.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-1">
                    <PencilSvgLight size="size-3 lg:size-4" />
                    Edit
                  </div>
                </MainBtn>
              </div>
            )}
            <div className="flex gap-5 lg:gap-8 mt-3 ">
              <div className="shrink-0 w-fit">
                {data.avatar ? (
                  <div
                    className="relative w-14 h-14 lg:h-19 lg:w-19 rounded-lg overflow-hidden  border-gray-200 dark:border-gray-800"
                    onClick={() => {}}
                  >
                    <Image
                      alt={"workspaceAvatar"}
                      src={data.avatar}
                      className="object-center object-cover"
                      fill
                    ></Image>
                  </div>
                ) : (
                  <div
                    className={` w-14 h-14 lg:h-19 lg:w-19 rounded-lg  flex justify-center items-center  `}
                    style={{ background: gradientBgFromName(data.name) }}
                  >
                    <div className="font-semibold text-3xl text-white ">
                      {getInitials(data.name)}
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-15 lg:gap-x-20 lg:text-lg ">
                  <div className="text-gray-700 dark:text-gray-300">Name</div>
                  <div
                    className={`flex items-center gap-2 mb-0.5
                    `}
                  >
                    <div className="break-words overflow-wrap-anywhere">
                      {data.name}
                    </div>
                  </div>

                  <div className="text-gray-700 dark:text-gray-300">
                    Created at
                  </div>
                  <div> {DateFormatter3(data.createdAt)}</div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Created by
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-fit cursor-pointer"
                      onClick={() => {
                        if (
                          data.creator.id &&
                          data.creator.id !== currentUserId
                        ) {
                          setUserId(data.creator.id);
                        }
                      }}
                    >
                      {data.creator.avatar ? (
                        <div
                          className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden  border-gray-200 dark:border-gray-800"
                          onClick={() => {}}
                        >
                          <Image
                            alt={"createdByAvatar"}
                            src={data.creator.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={` w-5 h-5 lg:h-6 lg:w-6 rounded-full  flex justify-center items-center  `}
                          style={{
                            background: gradientBgFromName(data.creator.name),
                          }}
                        >
                          <div className="font-semibold text-[10px] text-white ">
                            {getInitials(data.creator.name)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        if (
                          data.creator.id &&
                          data.creator.id !== currentUserId
                        ) {
                          setUserId(data.creator.id);
                        }
                      }}
                    >
                      {data.creator.name}
                    </div>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    Current Owner
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-fit cursor-pointer"
                      onClick={() => {
                        if (data.owner.id && data.owner.id !== currentUserId) {
                          setUserId(data.owner.id);
                        }
                      }}
                    >
                      {data.owner.avatar ? (
                        <div
                          className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden  border-gray-200 dark:border-gray-800"
                          onClick={() => {}}
                        >
                          <Image
                            alt={"ownerAvatar"}
                            src={data.owner.avatar}
                            className="object-center object-cover"
                            fill
                          ></Image>
                        </div>
                      ) : (
                        <div
                          className={` w-5 h-5 lg:h-6 lg:w-6 rounded-full  flex justify-center items-center  `}
                          style={{
                            background: gradientBgFromName(data.owner.name),
                          }}
                        >
                          <div className="font-semibold text-[10px] text-white ">
                            {getInitials(data.owner.name)}
                          </div>
                        </div>
                      )}
                    </div>
                    <div
                      className="cursor-pointer hover:underline"
                      onClick={() => {
                        if (data.owner.id && data.owner.id !== currentUserId) {
                          setUserId(data.owner.id);
                        }
                      }}
                    >
                      {data.owner.name}
                    </div>
                  </div>
                </div>

                {data.description && (
                  <>
                    <div className=" lg:text-lg text-gray-700 dark:text-gray-300  mb-1">
                      Description
                    </div>

                    <div className="rounded-lg bg-gray-100 dark:bg-blk6 p-3 text-gray-600 dark:text-gray-400 text-xs md:text-base  break-words  overflow-wrap-anywhere whitespace-pre-wrap">
                      {data.description.length > 200 ? (
                        <div className=" break-words">
                          {readMore
                            ? data.description
                            : `${data.description.slice(0, 200)}...`}
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
                        data.description
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            Me
          </div>
          <SubBorderWrapper>
            <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-15 lg:gap-x-20 lg:text-lg">
              <div className="text-gray-700 dark:text-gray-300">Name</div>
              <div>{data.currentUser.name}</div>
              <div className="text-gray-700 dark:text-gray-300">Username</div>
              <div className="text-blue-500">{data.currentUser.username}</div>
              <div className="text-gray-700 dark:text-gray-300">Role</div>{" "}
              <div>{data.currentUser.role}</div>{" "}
              <div className="text-gray-700 dark:text-gray-300">Joined at</div>
              <div>{DateFormatter3(data.currentUser.joinedAt)}</div>
            </div>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>

      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            Permissions
          </div>

          <SubBorderWrapper>
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg  mb-2 px-1">
              Members can
            </div>
            <div className="px-1 flex flex-col gap-6 text-gray-900 dark:text-gray-100">
              <FlexBtwWrapper key={"Create Projects"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Create Project
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Member",
                      permission: "Create_Project",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.member.canCreateProject}
                />
              </FlexBtwWrapper>
              <FlexBtwWrapper key={"InviteMem"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Invite
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Member",
                      permission: "Invite",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.member.canInvite}
                />
              </FlexBtwWrapper>
            </div>
          </SubBorderWrapper>
          <SubBorderWrapper addOns="mt-3">
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg  mb-2 px-1">
              Admins can
            </div>
            <div className="px-1 flex flex-col gap-6 text-gray-900 dark:text-gray-100">
              <FlexBtwWrapper key={"Invite"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Invite
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Invite",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canInvite}
                />
              </FlexBtwWrapper>{" "}
              <FlexBtwWrapper key={"Remove Members"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Remove Members
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Remove_Member",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canRemoveMem}
                />
              </FlexBtwWrapper>{" "}
              <FlexBtwWrapper key={"Approve Members Joining"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Approve Members Joining
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Approve_Join",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canApprove}
                />
              </FlexBtwWrapper>{" "}
              <FlexBtwWrapper key={"Create Project"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Create Project
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Create_Project",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canCreateProject}
                />
              </FlexBtwWrapper>{" "}
              <FlexBtwWrapper key={"Invite"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Delete Project
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Delete_Project",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canInvite}
                />
              </FlexBtwWrapper>{" "}
              <FlexBtwWrapper key={"Edit Workspace"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Edit Workspace (Name, avatar & description)
                </div>
                <CheckToggler
                  disabled={!canChangePerm || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Admin",
                      permission: "Edit_Ws_Details",
                      enabled: e.target.checked,
                    });
                  }}
                  state={permissions.admin.canEditWs}
                />
              </FlexBtwWrapper>{" "}
            </div>
          </SubBorderWrapper>
        </BorderWrapper>{" "}
      </div>
      <div className="mt-5 max-w-3xl w-full mx-auto pb-10">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-red-500 font-semibold mb-2 ">
            Danger Zone
          </div>
          {data.currentUser.role === "Owner" ? (
            <SubBorderWrapper>
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Transfer Ownership
              </div>
              <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
                Transfer ownership to another user of this workspace.
              </div>
              <div
                className="bg-gray-300 dark:bg-blk6 hover:bg-red-500 cursor-pointer rounded-md px-3 py-1 w-fit text-gray-700 hover:text-white dark:text-white"
                onClick={() => setTransferWarning(true)}
              >
                Transfer
              </div>
              <TransferWarning
                setShowWarning={setTransferWarning}
                showWarning={transferWarning}
                handleProceed={() => setShowUserPicker(true)}
                type="workspace"
                afterRole="Admin"
              ></TransferWarning>
            </SubBorderWrapper>
          ) : (
            <SubBorderWrapper>
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Leave Workspace
              </div>
              <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
                All your current work and progress will be lost.
              </div>
              <div
                className="bg-gray-300 dark:bg-blk6 hover:bg-red-500 cursor-pointer rounded-md px-3 py-1 w-fit text-gray-700 hover:text-white dark:text-white"
                onClick={() => setLeaveWarning(true)}
              >
                Leave
              </div>
              <WsLeaveWarning
                showWarning={leaveWarning}
                setShowWarning={setLeaveWarning}
                handleLeaving={() => leave.mutate()}
                ownedProjCount={data.currentUser.projectCount}
              />
            </SubBorderWrapper>
          )}
          {canChangePerm && (
            <SubBorderWrapper addOns="mt-3">
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Delete Workspace
              </div>
              <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
                This is an irreversible action. Be careful!
              </div>
              <div
                className=" bg-red-500 hover:bg-red-700 cursor-pointer rounded-md px-3 py-1 w-fit text-white"
                onClick={() => setDeleteWarning(true)}
              >
                Delete
              </div>
              <WsDeleteWarning
                show={deleteWarning}
                setShow={setDeleteWarning}
                handleDeleting={() => {
                  deleteWorkspace.mutate();
                }}
                name={data.name}
              />
            </SubBorderWrapper>
          )}
        </BorderWrapper>{" "}
      </div>
      {mounted &&
        createPortal(
          <UserPicker
            show={showUserPicker}
            setShow={setShowUserPicker}
            type="workspace"
            slug={slug}
            handleTransfer={(id: string) => transfer.mutate({ newOwnerId: id })}
          />,
          document.body,
        )}
      {mounted &&
        createPortal(
          <EditWsSettings setShow={setShowEdit} show={showEdit} ws={data} />,
          document.body,
        )}
    </>
  );
}
