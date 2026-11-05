"use client";

import {
  projectContributorPerm,
  projectManagerPerm,
  ProjectSettingsProps,
} from "@/app/interfaces";
import BorderWrapper from "@/components/wrappers/BorderWrapper";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import Image from "next/image";
import { useState } from "react";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import CheckToggler from "@/components/Toggler/CheckToggler";
import SubBorderWrapper from "@/components/wrappers/SubBorderWrapper";
import ProjectLeaveWarning from "@/components/warnings/ProjectLeaveWarning";
import ProjectDeleteWarning from "@/components/warnings/ProjectDeleteWarning";
import TransferWarning from "@/components/warnings/TransferWarning";
import { createPortal } from "react-dom";
import useMounted from "@/lib/hooks/useMounted";
import { useProjectOverview } from "@/lib/queries/workspace/project/overview/useProjectOverview";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useProjectSettings } from "@/lib/queries/workspace/project/settings/useProjectSettings";
import ProjectUserPicker from "./ProjectUserPicker";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Spinner2 from "@/components/loadings/Spinner2";
import { DustbinSvg } from "@/components/svg/DustbinSvg";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function SettingsArea() {
  const { id } = useCurrentProject();
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const overview = useProjectOverview();
  const currentProject = useCurrentProject();
  const { leave, transfer, togglePerm, deleteMutation } = useProjectSettings();
  const [showUserPicker, setShowUserPicker] = useState(false);
  const [leaveWarning, setLeaveWarning] = useState(false);
  const [deleteWarning, setDeleteWarning] = useState(false);
  const [transferWarning, setTransferWarning] = useState(false);
  const isHighAuthority =
    currentProject.role === "High" || currentProject.role === "Owner";
  const mounted = useMounted();

  if (overview.isLoading) {
    return <SettingsSkeleton />;
  }

  if (!mounted || !overview.data) {
    return null;
  }
  function managerIncludes(perm: projectManagerPerm) {
    return currentProject.permissions.manager.includes(perm);
  }
  function contributorIncludes(perm: projectContributorPerm) {
    return currentProject.permissions.contributor.includes(perm);
  }
  const pData: ProjectSettingsProps = {
    id: overview.data.id,
    name: overview.data.name,
    avatar: overview.data.avatar,
    totalTasks: overview.data.totalTasks,
    completedTasks: overview.data.completedTasks,
    createdAt: overview.data.createdAt,
    createdBy: overview.data.createdBy,
    owner: overview.data.owner,
    permissions: {
      manager: {
        canRemoveMem: managerIncludes("Remove_Member"),
        canInvite: managerIncludes("Invite"),
        canChangeDetails: managerIncludes("Edit_Project_Details"),
      },
      contributor: {
        comment: contributorIncludes("Comment"),
        canInvite: contributorIncludes("Invite"),
      },
      viewer: {
        comment: currentProject.permissions.viewer.includes("Comment"),
      },
    },
    currentUser:
      currentProject.role !== "High"
        ? {
            role: currentProject.role,
            joinedAt: currentProject.joinedAt ?? new Date(),
          }
        : undefined,
  };
  if (deleteMutation.isPending)
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
            <div className="flex gap-5 lg:gap-8 mt-3 ">
              <div className="flex items-center flex-col">
                <div className="relative w-fit h-fit group overflow-hidden">
                  {pData.avatar ? (
                    <div
                      className="relative w-14 h-14 lg:h-19 lg:w-19 rounded-lg overflow-hidden  border-gray-200 dark:border-gray-800"
                      onClick={() => {}}
                    >
                      <Image
                        alt={"projectAvatar"}
                        src={pData.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={` w-14 h-14 lg:h-19 lg:w-19 rounded-lg  flex justify-center items-center  `}
                      style={{ background: gradientBgFromName(pData.name) }}
                    >
                      <div className="font-semibold text-3xl text-white ">
                        {getInitials(pData.name)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-15 lg:gap-x-20 lg:text-lg">
                <div className="text-gray-700 dark:text-gray-300">Name</div>
                <div>{pData.name}</div>

                <div className="text-gray-700 dark:text-gray-300">Status</div>
                <div
                  className={`flex items-center gap-1  rounded-md px-2 text-xs lg:text-sm  border w-fit ${
                    pData.completedTasks === 0
                      ? "bg-blue-300 text-blue-700"
                      : pData.completedTasks === pData.totalTasks
                        ? "bg-green-300 text-green-700"
                        : "bg-yellow-300 text-yellow-700"
                  }`}
                >
                  {pData.completedTasks === 0
                    ? "Not Started"
                    : pData.completedTasks === pData.totalTasks
                      ? "Completed"
                      : "In Progress"}
                </div>

                <div className="text-gray-700 dark:text-gray-300">
                  Created at
                </div>
                <div> {DateFormatter3(pData.createdAt)}</div>
                <div className="text-gray-700 dark:text-gray-300">
                  Created by
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-fit"
                    onClick={() => {
                      if (pData.createdBy.avatar !== currentUserId) {
                        setUserId(pData.createdBy.id);
                      }
                    }}
                  >
                    {pData.createdBy.avatar ? (
                      <div className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden  border-gray-200 dark:border-gray-800">
                        <Image
                          alt={"projectAvatar"}
                          src={pData.createdBy.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={` w-5 h-5 lg:h-6 lg:w-6 rounded-full  flex justify-center items-center  `}
                        style={{
                          background: gradientBgFromName(pData.createdBy.name),
                        }}
                      >
                        <div className="font-semibold text-[10px] text-white ">
                          {getInitials(pData.createdBy.name)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="hover:underline"
                    onClick={() => {
                      if (pData.createdBy.avatar !== currentUserId) {
                        setUserId(pData.createdBy.id);
                      }
                    }}
                  >
                    {pData.createdBy.name}
                  </div>
                </div>
                <div className="text-gray-700 dark:text-gray-300">
                  Current Owner
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-fit"
                    onClick={() => {
                      if (pData.owner.avatar !== currentUserId) {
                        setUserId(pData.owner.id);
                      }
                    }}
                  >
                    {pData.owner.avatar ? (
                      <div
                        className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden  border-gray-200 dark:border-gray-800"
                        onClick={() => {}}
                      >
                        <Image
                          alt={"projectAvatar"}
                          src={pData.owner.avatar}
                          className="object-center object-cover"
                          fill
                        ></Image>
                      </div>
                    ) : (
                      <div
                        className={` w-5 h-5 lg:h-6 lg:w-6 rounded-full  flex justify-center items-center  `}
                        style={{
                          background: gradientBgFromName(pData.owner.name),
                        }}
                      >
                        <div className="font-semibold text-[10px] text-white ">
                          {getInitials(pData.owner.name)}
                        </div>
                      </div>
                    )}
                  </div>
                  <div
                    className="hover:underline"
                    onClick={() => {
                      if (pData.owner.avatar !== currentUserId) {
                        setUserId(pData.owner.id);
                      }
                    }}
                  >
                    {pData.owner.name}
                  </div>
                </div>
              </div>
            </div>
          </SubBorderWrapper>
        </BorderWrapper>
      </div>
      {pData.currentUser && (
        <div className="mt-5 max-w-3xl w-full mx-auto ">
          <BorderWrapper>
            <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
              Me
            </div>
            <SubBorderWrapper>
              <div className="grid grid-cols-[auto_1fr] gap-x-10 sm:gap-x-15 lg:gap-x-20 lg:text-lg">
                <div className="text-gray-700 dark:text-gray-300">Role</div>{" "}
                <div>{pData.currentUser.role}</div>{" "}
                <div className="text-gray-700 dark:text-gray-300">
                  Joined at
                </div>
                <div>{DateFormatter3(pData.currentUser.joinedAt)}</div>
              </div>
            </SubBorderWrapper>
          </BorderWrapper>
        </div>
      )}

      <div className="mt-5 max-w-3xl w-full mx-auto ">
        <BorderWrapper>
          <div className="text-lg lg:text-xl text-gray-800 dark:text-gray-200 font-semibold mb-2 ">
            Permissions
          </div>
          <SubBorderWrapper>
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg  mb-2 px-1">
              Managers can
            </div>
            <div className="px-1 flex flex-col gap-6 text-gray-900 dark:text-gray-100">
              <FlexBtwWrapper key={"Remve Member"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Remove Member
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Manager",
                      permission: "Remove_Member",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.manager.canRemoveMem}
                />
              </FlexBtwWrapper>
              <FlexBtwWrapper key={"ManagerEdit"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Edit Project Details
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Manager",
                      permission: "Edit_Project_Details",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.manager.canChangeDetails}
                />
              </FlexBtwWrapper>
              <FlexBtwWrapper key={"ManagerInvite"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Invite
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Manager",
                      permission: "Invite",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.manager.canInvite}
                />
              </FlexBtwWrapper>
            </div>
          </SubBorderWrapper>

          <SubBorderWrapper addOns="mt-3">
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg  mb-2 px-1">
              Contributors can
            </div>
            <div className="px-1 flex flex-col gap-6 text-gray-900 dark:text-gray-100">
              <FlexBtwWrapper key={"Invite"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Invite
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Contributor",
                      permission: "Invite",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.contributor.canInvite}
                />
              </FlexBtwWrapper>
              <FlexBtwWrapper key={"MemberComment"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Comment
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Contributor",
                      permission: "Comment",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.contributor.comment}
                />
              </FlexBtwWrapper>
            </div>
          </SubBorderWrapper>
          <SubBorderWrapper addOns="mt-3">
            <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg  mb-2 px-1">
              Viewers can
            </div>
            <div className="px-1 flex flex-col gap-6 text-gray-900 dark:text-gray-100">
              <FlexBtwWrapper key={"ViewerComment"}>
                <div className="text-gray-700 dark:text-gray-400 text-sm lg:text-base">
                  Comment
                </div>
                <CheckToggler
                  disabled={!isHighAuthority || togglePerm.isPending}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    togglePerm.mutate({
                      role: "Viewer",
                      permission: "Comment",
                      enabled: e.target.checked,
                    });
                  }}
                  state={pData.permissions.viewer.comment}
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
          {isHighAuthority ? (
            <SubBorderWrapper>
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Transfer Ownership
              </div>
              <div className="text-red-400 text-[10px] lg:text-xs mb-2 ">
                Transfer ownership to another user of this project.
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
                type="project"
                afterRole="Manager"
              ></TransferWarning>
            </SubBorderWrapper>
          ) : (
            <SubBorderWrapper>
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Leave Project
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
              <ProjectLeaveWarning
                showWarning={leaveWarning}
                setShowWarning={setLeaveWarning}
                handleLeaving={() => leave.mutate()}
                name={pData.name}
                canLeave={!isHighAuthority}
              />
            </SubBorderWrapper>
          )}
          {isHighAuthority && (
            <SubBorderWrapper addOns="mt-3">
              <div className="text-gray-800 dark:text-gray-300 text-base lg:text-lg ">
                Delete Project
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
              <ProjectDeleteWarning
                show={deleteWarning}
                setShow={setDeleteWarning}
                handleDeleting={() => {
                  deleteMutation.mutate();
                }}
                name={pData.name}
              />
            </SubBorderWrapper>
          )}
        </BorderWrapper>{" "}
      </div>
      {mounted &&
        createPortal(
          <ProjectUserPicker
            show={showUserPicker}
            setShow={setShowUserPicker}
            projectId={id}
            handleTransfer={(newOwnerId: string) => {
              transfer.mutate({ newOwnerId });
            }}
          />,
          document.body,
        )}
    </>
  );
}
