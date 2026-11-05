"use client";

import MainBtn from "../../btns/MainBtn";
import BorderWrapper from "../../wrappers/BorderWrapper";
import FlexBtwWrapper from "../../wrappers/FlexBtwWrapper";
import { taskEditProps, taskProps } from "../../../app/interfaces";
import { DateFormatter3 } from "@/lib/functions/date/DateFormatter3";
import { useRef, useState } from "react";
import getPriorityColor from "@/lib/functions/colors/getPriorityColor";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import "react-day-picker/dist/style.css";
import getStatusColor from "@/lib/functions/colors/getStatusColor";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import useMounted from "@/lib/hooks/useMounted";
import { useMirrorWidth } from "@/lib/hooks/useMirrorWidth";
import { useAutoResizeInputHeight } from "@/lib/hooks/useAutoResizeInputHeight";
import { useTaskStatus } from "@/lib/hooks/useTaskStatus";
import EditDueDay from "@/components/selectors/EditDueDay";
import DescriptionEdit from "@/components/Edits/DescriptionEdit";
import { MemberSvg } from "@/components/svg/MemberSvg";
import { ClockSvg } from "@/components/svg/ClockSvg";
import { CalendarSvg } from "@/components/svg/CalendarSvg";
import { StatusSvg } from "@/components/svg/StatusSvg";
import { PrioritySvg } from "@/components/svg/PrioritySvg";
import { priorityArray, statusArray } from "@/lib/constants/constants";
import { useCanEditTask } from "@/lib/hooks/useIsAllowedTask";
import { Priority, TaskStatus } from "@prisma/client";
import SubtaskArea from "./subtask/SubtaskArea";
import { CreatedBySvg } from "@/components/svg/CreatedBySvg";
import { UpDownArrowSvg } from "@/components/svg/UpDownArrowSvg";
import { CircleCrossSvg } from "@/components/svg/CircleCrossSvg";
import { EditBtnOverview } from "@/components/btns/EditBtnOverview";
import Toolbar from "@/components/helpers/Toolbar";
import { CircleTickSvg } from "@/components/svg/CircleTickSvg";
import { useTask } from "@/lib/queries/workspace/project/task/overview/useTask";
import {
  isAllowedStatusTransition,
  statusMap,
} from "@/lib/functions/task/status/statusTransition";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function TaskContent({ task }: { task: taskProps }) {
  const mounted = useMounted();
  const { id: currentUserId } = useCurrentUser();
  const setUserId = useShowUserStore.getState().setUserId;
  const { role } = useCurrentTask();
  const { editTask } = useTask();
  const [editMode, setEditMode] = useState(false);
  const [showTaskNameEdit, setShowTaskNameEdit] = useState(false);
  const [editedTaskName, setEditedTaskName] = useState(task.name);
  const taskNameRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLSpanElement>(null);
  const [editedDue, setEditedDue] = useState<Date | undefined>(task.due);
  const [showStatusEdit, setShowStatusEdit] = useState(false);
  const [statusDropDown, setStatusDropDown] = useState(false);
  const statusData = statusArray;
  const [editedStatus, setEditedStatus] = useState<TaskStatus>(task.status);
  const editedStatusRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([editedStatusRef], () => setStatusDropDown(false));
  const [priorityDropDown, setPriorityDropDown] = useState(false);
  const [showPriorityEdit, setShowPriorityEdit] = useState(false);
  const editedPriorityRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([editedPriorityRef], () => setPriorityDropDown(false));
  const priorityData = priorityArray;
  const [editedPriority, setEditedPriority] = useState<Priority>(task.priority);
  const [editedDescription, setEditedDescription] = useState<
    string | undefined
  >(task.description);
  const { bg, border, text } = useTaskStatus(task.status);
  const mappedStatus = statusMap(task.status);
  useMirrorWidth(taskNameRef, mirrorRef, editedTaskName);
  useAutoResizeInputHeight(taskNameRef, editedTaskName);
  const canEdit = useCanEditTask();
  if (!mounted) {
    return null;
  }
  const isDueEdited =
    editedDue !== undefined &&
    new Date(editedDue).getTime() !== new Date(task.due).getTime();
  const isChanged =
    isDueEdited ||
    editedTaskName !== task.name ||
    editedDescription !== task.description ||
    editedPriority !== task.priority ||
    editedStatus !== task.status;
  return (
    <BorderWrapper addOns="transition-all duration-300">
      <FlexBtwWrapper>
        <div className="flex items-center gap-2 w-full">
          {showTaskNameEdit ? (
            <div className="relative inline-flex items-center">
              <span
                ref={mirrorRef}
                className="invisible absolute whitespace-pre font-semibold text-lg md:text-xl lg:text-3xl"
              >
                {editedTaskName || "Enter new task name"}
              </span>

              <textarea
                ref={taskNameRef}
                rows={1}
                maxLength={25}
                value={editedTaskName}
                placeholder="Enter new task name"
                onChange={(e) => {
                  setEditedTaskName(e.target.value);
                }}
                spellCheck={false}
                className="resize-none overflow-hidden max-w-xs lg:max-w-sm 2xl:max-w-xl text-lg md:text-xl transition-[height] duration-200 lg:text-3xl text-black dark:text-gray-200 font-semibold focus:outline-none placeholder:font-semibold bg-transparent"
              />
            </div>
          ) : (
            <div className="font-semibold text-lg md:text-xl lg:text-3xl text-black dark:text-gray-200 max-w-sm lg:max-w-lg ">
              {task.name}
            </div>
          )}
          {editMode && (
            <EditBtnOverview
              onClick={() => {
                setShowTaskNameEdit((prev) => !prev);
                setTimeout(() => {
                  const el = taskNameRef.current;
                  if (el) {
                    el.focus();
                    const len = el.value.length;
                    el.selectionStart = len;
                    el.selectionEnd = len;
                  }
                }, 0);
              }}
              onStop={() => {
                setShowTaskNameEdit(false);
                setEditedTaskName(task.name);
              }}
              addons="px-1 py-1"
            />
          )}
        </div>
        {canEdit &&
          (editMode ? (
            <div className={`flex items-center gap-2`}>
              <MainBtn
                disable={!isChanged}
                onClick={() => {
                  if (isChanged) {
                    const payload: taskEditProps = {
                      name:
                        editedTaskName !== task.name
                          ? editedTaskName
                          : undefined,
                      description:
                        editedDescription !== task.description
                          ? editedDescription && editedDescription.trim() === ""
                            ? null
                            : editedDescription
                          : undefined,
                      dueDate: isDueEdited ? editedDue : undefined,
                      status:
                        editedStatus !== task.status ? editedStatus : undefined,
                      priority:
                        editedPriority !== task.priority
                          ? editedPriority
                          : undefined,
                    };
                    editTask.mutate({ ...payload });
                    setEditMode(false);
                    setShowPriorityEdit(false);
                    setShowStatusEdit(false);
                    setShowTaskNameEdit(false);
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
                  setShowPriorityEdit(false);
                  setShowStatusEdit(false);
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
      <div className="grid grid-cols-[auto_1fr] gap-y-2 gap-x-10 sm:gap-y-2.5 sm:gap-x-15 lg:gap-y-3 lg:gap-x-20 mt-5 px-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <ClockSvg />
          Created At
        </div>
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {DateFormatter3(task.createdAt)}
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <CalendarSvg />
          Due Date
        </div>
        <EditDueDay
          dueDate={task.due}
          setEditedDue={setEditedDue}
          editedDue={editedDue}
          editMode={editMode}
          isEdited={isDueEdited}
          canEdit={role === "High"}
        ></EditDueDay>

        <div className="lg:-mt-2 -mt-1 flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base ">
          <CreatedBySvg />
          Created By
        </div>
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-blk4 border-dashed border-1 rounded-md px-2 py-0.5 border-gray-400 dark:border-gray-700 w-fit">
          <div
            className="w-fit cursor-pointer"
            onClick={() => {
              if (task.createdBy.id && task.createdBy.id !== currentUserId) {
                setUserId(task.createdBy.id);
              }
            }}
          >
            {task.createdBy.avatar ? (
              <div className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                <Image
                  alt={"AssignerAvatar"}
                  src={task.createdBy.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center border-2 border-white dark:border-blk5`}
                style={{ background: gradientBgFromName(task.name) }}
              >
                <div className="font-semibold text-xs text-white">
                  {getInitials(task.createdBy.name)}
                </div>
              </div>
            )}
          </div>
          <div
            className="text-gray-800 dark:text-gray-400 text-xs lg:text-sm hover:underline cursor-pointer"
            onClick={() => {
              if (task.createdBy.id && task.createdBy.id !== currentUserId) {
                setUserId(task.createdBy.id);
              }
            }}
          >
            {task.createdBy.name}
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <StatusSvg />
          Status
        </div>

        <div className="flex items-center  gap-2 ">
          {showStatusEdit ? (
            <div
              ref={editedStatusRef}
              className="relative lg:min-w-35 min-w-30 text-nowrap text-xs lg:text-base"
            >
              <div
                className={`${getStatusColor(
                  statusMap(editedStatus),
                )} cursor-pointer justify-between flex gap-1 items-center text-xs lg:text-base bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk5 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none rounded-md font-semibold lg:px-2 px-1  py-0.5 `}
                onClick={() => {
                  setStatusDropDown((prev) => !prev);
                }}
              >
                <div>{statusMap(editedStatus)}</div>
                <div className="text-gray-500 pr-1 ">
                  <UpDownArrowSvg />
                </div>
              </div>
              <div
                id="dropdown"
                className={`z-30 shadow-lg absolute top-8 lg:top-12 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
                  statusDropDown
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-10 invisible pointer-events-none"
                }`}
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {statusData.map((s: TaskStatus, idx: number) => {
                    const mappedS = statusMap(s);
                    return (
                      <li key={idx}>
                        {isAllowedStatusTransition(editedStatus, s, role) && (
                          <div
                            className=" block text-xs lg:text-base lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => {
                              setEditedStatus(s);
                              setStatusDropDown(false);
                            }}
                          >
                            <div
                              className={`${getStatusColor(
                                mappedS,
                              )} flex gap-1 items-center`}
                            >
                              <div>{mappedS}</div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1 ${bg} ${text} rounded-md px-2 py-0.5 text-xs lg:text-sm ${border} border w-fit`}
            >
              {mappedStatus}
            </div>
          )}
          {editMode && (
            <EditBtnOverview
              onClick={() => {
                setShowStatusEdit((prev) => !prev);
              }}
              onStop={() => {
                setShowStatusEdit(false);
                setStatusDropDown(false);
                setEditedStatus(task.status);
              }}
              addons="px-1 py-1"
            />
          )}
        </div>

        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1 sm:mb-1.5 lg:mb-2">
          <PrioritySvg />
          Priority
        </div>

        <div className="flex items-center  gap-2 ">
          {showPriorityEdit && role === "High" ? (
            <div
              ref={editedPriorityRef}
              className="relative lg:min-w-35 min-w-30 text-nowrap text-xs lg:text-base"
            >
              <div
                className={`${getPriorityColor(
                  editedPriority,
                )} cursor-pointer justify-between flex gap-1 items-center text-xs lg:text-base bg-gray-100 border-gray-200 border-2 dark:border-gray-600 dark:bg-blk5 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none rounded-md font-semibold lg:px-2 px-1  py-0.5 `}
                onClick={() => {
                  setPriorityDropDown((prev) => !prev);
                }}
              >
                <div>{editedPriority}</div>
                <div className="text-gray-500 pr-1 ">
                  <UpDownArrowSvg />
                </div>
              </div>
              <div
                id="dropdown"
                className={`z-30 shadow-lg absolute top-8 lg:top-12 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
                  priorityDropDown
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-10 invisible pointer-events-none"
                }`}
              >
                <ul
                  className="py-2 text-sm text-gray-700 dark:text-gray-200"
                  aria-labelledby="dropdownDefaultButton"
                >
                  {priorityData.map((p: Priority, idx: number) => {
                    return (
                      <li key={idx}>
                        {editedPriority != p && (
                          <div
                            className=" block text-xs lg:text-base lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={() => {
                              setEditedPriority(p);
                              setPriorityDropDown(false);
                            }}
                          >
                            <div
                              className={`${getPriorityColor(
                                p,
                              )} flex gap-1 items-center`}
                            >
                              <div>{p}</div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ) : (
            <div
              className={`${getPriorityColor(
                task.priority,
              )} flex gap-2 items-center text-xs lg:text-base font-semibold`}
            >
              {task.priority}
            </div>
          )}
          {editMode && (
            <EditBtnOverview
              onClick={() => {
                setShowPriorityEdit((prev) => !prev);
              }}
              onStop={() => {
                setShowPriorityEdit(false);
                setPriorityDropDown(false);
                setEditedPriority(task.priority);
              }}
              addons="px-1 py-1"
            />
          )}
        </div>
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-2 sm:mb-2.5 lg:mb-3">
          <MemberSvg />
          Members
        </div>
        <div className="text-gray-800 dark:text-gray-300 font-semibold text-xs lg:text-base">
          {task.totalMembers}
        </div>
      </div>

      <div>
        <DescriptionEdit
          editMode={editMode}
          editedDesc={editedDescription}
          setEditedDesc={setEditedDescription}
          desc={task.description}
        />

        <SubtaskArea subtasks={task.subtasks} canEdit={canEdit} />
      </div>
    </BorderWrapper>
  );
}
