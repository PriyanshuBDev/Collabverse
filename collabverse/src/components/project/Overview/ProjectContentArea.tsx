"use client";
import BorderWrapper from "@/components/wrappers/BorderWrapper";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import MainBtn from "@/components/btns/MainBtn";
import { useEffect, useRef, useState } from "react";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { CompleteProjectProps } from "@/app/interfaces";
import useMounted from "@/lib/hooks/useMounted";
import { useIsAllowedToEditProject } from "@/lib/hooks/useIsAllowedProject";
import { useMirrorWidth } from "@/lib/hooks/useMirrorWidth";
import { useAutoResizeInputHeight } from "@/lib/hooks/useAutoResizeInputHeight";
import Toolbar from "@/components/helpers/Toolbar";
import {
  projectEditProps,
  useProjectOverview,
} from "@/lib/queries/workspace/project/overview/useProjectOverview";
import isValidName from "@/lib/functions/validity/IsValidName";
import { EditBtnOverview } from "@/components/btns/EditBtnOverview";
import { RemovableDueDate } from "@/components/selectors/EditDueDay";
import { PositionProps } from "@/components/ChatComponents/Bubble";
import AvatarPicker from "@/components/Avatar/AvatarPicker";
import ClickAnywhere from "@/components/dropdowns/ClickAnywhere";
import DescriptionEdit from "@/components/Edits/DescriptionEdit";
import { MemberSvg } from "@/components/svg/MemberSvg";
import { TaskSvg } from "@/components/svg/TaskSvg";
import { StatusSvg } from "@/components/svg/StatusSvg";
import { CalendarSvg } from "@/components/svg/CalendarSvg";
import { ClockSvg } from "@/components/svg/ClockSvg";
import { CreatedBySvg } from "@/components/svg/CreatedBySvg";
import { PencilSvg } from "@/components/svg/PencilSvg";
import { CircleCrossSvg } from "@/components/svg/CircleCrossSvg";
import { CircleTickSvg } from "@/components/svg/CircleTickSvg";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function ProjectContentArea({
  project,
}: {
  project: CompleteProjectProps;
}) {
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const { editDetails } = useProjectOverview();
  const mounted = useMounted();
  const permission = useIsAllowedToEditProject();
  const [editMode, setEditMode] = useState(false);
  const [showProjectNameEdit, setShowProjectNameEdit] = useState(false);
  const [editedProjectName, setEditedProjectName] = useState(project.name);
  const projectNameRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [avatar, setAvatar] = useState<string | undefined>(project.avatar);
  const [editedAvatar, setEditedAvatar] = useState<File | undefined>(undefined);
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [editedDue, setEditedDue] = useState<Date | null>(project.dueDate);
  const [editedDescription, setEditedDescription] = useState(
    project.description,
  );
  useMirrorWidth(projectNameRef, mirrorRef, editedProjectName);
  useAutoResizeInputHeight(projectNameRef, editedProjectName);
  useEffect(() => {
    if (!editedAvatar) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(editedAvatar);
    setPreviewUrl(url);
    setAvatarRemoved(false);
    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [editedAvatar]);
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (menuPos) return;
    setMenuPos({ x: e.clientX, y: e.clientY });
  };
  useEffect(() => {
    if (!permission) {
      setEditMode(false);
    }
  }, [permission]);

  if (!mounted) {
    return null;
  }
  const isDueEdited =
    (editedDue === null && project.dueDate !== null) ||
    (editedDue !== null && project.dueDate === null) ||
    (editedDue !== null &&
      project.dueDate !== null &&
      new Date(editedDue).getTime() !== new Date(project.dueDate).getTime());
  const isChanged =
    isDueEdited ||
    editedProjectName !== project.name ||
    editedDescription !== project.description ||
    editedAvatar ||
    avatarRemoved;
  const sameDueDate =
    (editedDue === null && project.dueDate === null) ||
    (editedDue !== null &&
      project.dueDate !== null &&
      new Date(editedDue).getTime() === new Date(project.dueDate).getTime());
  return (
    <BorderWrapper addOns="transition-all duration-300">
      <div className="flex items-center gap-3 w-full">
        <div className="relative w-fit shrink-0 group overflow-hidden">
          {avatar || previewUrl ? (
            <div className="relative w-17 h-17 lg:h-20 lg:w-20 rounded-lg overflow-hidden  border-gray-200 dark:border-gray-800">
              <Image
                key={previewUrl ?? avatar ?? "avatar"}
                alt={"ProfileAvatar"}
                src={previewUrl ?? avatar ?? ""}
                className="object-center object-cover"
                fill
              ></Image>
            </div>
          ) : editedProjectName ? (
            <div
              className={` w-17 h-17 lg:h-20 lg:w-20 rounded-lg  flex justify-center items-center  `}
              style={{ background: gradientBgFromName(editedProjectName) }}
            >
              <div className="font-semibold text-3xl text-white ">
                {getInitials(editedProjectName)}
              </div>
            </div>
          ) : (
            <div className="w-17 h-17 lg:h-20 lg:w-20 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-lg border border-gray-400 dark:border-blk9"></div>
          )}
          {editMode && (
            <div
              className="z-110 absolute inset-0 flex items-center justify-center group-hover:bg-black/20 rounded-lg cursor-pointer invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={handleClick}
            >
              <div className="bg-gray-500/40 p-3 rounded-full z-111 ">
                <PencilSvg size="size-4" />
              </div>
            </div>
          )}
        </div>
        <FlexBtwWrapper>
          <div className="flex items-center gap-2 w-full">
            {showProjectNameEdit ? (
              <div className="relative inline-flex items-center">
                {/* Hidden mirror to measure text width */}
                <span
                  ref={mirrorRef}
                  className="invisible absolute whitespace-pre font-semibold text-lg md:text-xl lg:text-3xl"
                >
                  {editedProjectName || "Enter new project name"}
                </span>

                <textarea
                  ref={projectNameRef}
                  rows={1}
                  maxLength={25}
                  value={editedProjectName}
                  placeholder="Enter new project name"
                  onChange={(e) => {
                    isValidName(e.target.value, setEditedProjectName);
                  }}
                  spellCheck={false}
                  className="resize-none overflow-hidden max-w-xs lg:max-w-sm 2xl:max-w-xl text-lg md:text-xl transition-[height] duration-200 lg:text-3xl text-black dark:text-gray-200 font-semibold focus:outline-none placeholder:font-semibold bg-transparent"
                />
              </div>
            ) : (
              <div className="font-semibold text-lg md:text-xl lg:text-3xl text-black dark:text-gray-200 max-w-sm lg:max-w-lg ">
                {project.name}
              </div>
            )}
            {editMode && (
              <EditBtnOverview
                onClick={() => {
                  setShowProjectNameEdit((prev) => !prev);
                  setTimeout(() => {
                    const el = projectNameRef.current;
                    if (el) {
                      el.focus();
                      const len = el.value.length;
                      el.selectionStart = len;
                      el.selectionEnd = len;
                    }
                  }, 0);
                }}
                onStop={() => {
                  setShowProjectNameEdit(false);
                  setEditedProjectName(project.name);
                }}
                addons="px-1 py-1"
              />
            )}
          </div>
          {permission &&
            (editMode ? (
              <div className={`flex items-center gap-2`}>
                <MainBtn
                  disable={!isChanged}
                  onClick={() => {
                    if (isChanged) {
                      const payload: projectEditProps = {
                        name:
                          editedProjectName !== project.name
                            ? editedProjectName
                            : undefined,
                        description:
                          editedDescription !== project.description
                            ? editedDescription &&
                              editedDescription.trim() === ""
                              ? null
                              : editedDescription
                            : undefined,
                        dueDate: sameDueDate ? undefined : editedDue,
                        avatar: editedAvatar,
                        avatarRemoved,
                        oldAvatarPath: project.avatarPath,
                        oldAvatarUrl: project.avatar,
                      };
                      editDetails.mutate(
                        { ...payload },
                        {
                          onSuccess: (props) => {
                            setAvatar(props.avatar);
                            setEditedAvatar(undefined);
                            setAvatarRemoved(false);
                          },
                        },
                      );
                      setEditMode(false);
                    }
                  }}
                  addOns="flex items-center justify-center w-8 lg:w-10 py-1.5 transition-all duration-300 relative group"
                >
                  <CircleTickSvg size="size-4 lg:size-6" />
                  <Toolbar top="-top-7">Done</Toolbar>
                </MainBtn>
                <MainBtn
                  onClick={() => {
                    setEditMode(false);
                  }}
                  addOns="flex items-center justify-center w-8 lg:w-10 py-1.5 transition-all duration-300 relative group"
                >
                  <CircleCrossSvg size="size-4 lg:size-6" />
                  <Toolbar top="-top-7">Discard</Toolbar>
                </MainBtn>
              </div>
            ) : (
              <MainBtn
                onClick={() => {
                  setEditMode(true);
                }}
                addOns="flex items-center justify-center w-20 lg:w-25 py-1.5 transition-all duration-300"
              >
                <div className="flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-3 lg:size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                    />
                  </svg>
                  Edit
                </div>
              </MainBtn>
            ))}
        </FlexBtwWrapper>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-10 sm:gap-y-2.5 sm:gap-x-15 lg:gap-y-3 lg:gap-x-20 mt-5 px-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <ClockSvg />
          Created At
        </div>
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {DateFormatter3(project.createdAt)}
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <CalendarSvg />
          Due Date
        </div>
        <RemovableDueDate
          dueDate={project.dueDate}
          setEditedDue={setEditedDue}
          editedDue={editedDue}
          editMode={editMode}
          isEdited={isDueEdited}
          canEdit={true}
        ></RemovableDueDate>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <StatusSvg />
          Status
        </div>

        <div className="flex items-center  gap-2 ">
          <div
            className={`flex items-center gap-1  rounded-md px-2 py-0.5 text-xs lg:text-sm  border w-fit ${
              project.completedTasks === 0
                ? "bg-blue-300 text-blue-700"
                : project.completedTasks === project.totalTasks
                  ? "bg-green-300 text-green-700"
                  : "bg-yellow-300 text-yellow-700"
            }`}
          >
            {project.completedTasks === 0
              ? "Not Started"
              : project.completedTasks === project.totalTasks
                ? "Completed"
                : "In Progress"}
          </div>
        </div>

        <div className="lg:-mt-2 -mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base ">
          <CreatedBySvg />
          Owner
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-400 dark:border-gray-700 w-fit">
          {project.owner.avatar ? (
            <div
              className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden border-2 border-white dark:border-blk5"
              onClick={() => {
                if (project.owner.id !== currentUserId) {
                  setUserId(project.owner.id);
                }
              }}
            >
              <Image
                alt={"AssigneeAvatar"}
                src={project.owner.avatar}
                className="object-center object-cover"
                fill
              ></Image>
            </div>
          ) : (
            <div
              className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center  border-2 border-white dark:border-blk5`}
              style={{ background: gradientBgFromName(project.owner.name) }}
            >
              <div className="font-semibold text-xs text-white">
                {getInitials(project.owner.name)}
              </div>
            </div>
          )}
          <div
            className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm hover:underline"
            onClick={() => {
              if (project.owner.id !== currentUserId) {
                setUserId(project.owner.id);
              }
            }}
          >
            {project.owner.name}
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1  lg:mb-1.5">
          <TaskSvg />
          Total Tasks
        </div>
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {project.totalTasks}
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-2 sm:mb-2.5 lg:mb-3">
          <MemberSvg />
          Members
        </div>
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {project.totalMembers}
        </div>
      </div>

      <DescriptionEdit
        editMode={editMode}
        setEditedDesc={setEditedDescription}
        editedDesc={editedDescription}
        desc={project.description}
      />
      <ClickAnywhere setMenuPos={setMenuPos} menuPos={menuPos} width="w-35">
        <ul>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={() => {
              avatarInputRef.current?.click();
              setMenuPos(null);
            }}
          >
            Change
          </li>
          <li
            className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
            onClick={() => {
              setEditedAvatar(undefined);
              setMenuPos(null);
              setAvatarRemoved(true);
              setAvatar(undefined);
            }}
          >
            Remove
          </li>
          {(previewUrl || avatarRemoved) && (
            <li
              className=" p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2 mx-2"
              onClick={() => {
                setEditedAvatar(undefined);
                setMenuPos(null);
                setAvatarRemoved(false);
                setAvatar(project.avatar);
              }}
            >
              cancel
            </li>
          )}
        </ul>
      </ClickAnywhere>
      <AvatarPicker
        avatarInputRef={avatarInputRef}
        setSelected={setEditedAvatar}
      />
    </BorderWrapper>
  );
}
