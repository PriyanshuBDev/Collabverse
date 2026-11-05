import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { projectProps, taskMembersProps } from "../../../app/interfaces";
import TitleAndElement from "../../myTasks/TitleAndElement";
import getPriorityColor from "@/lib/functions/colors/getPriorityColor";
import getStatusColor from "@/lib/functions/colors/getStatusColor";
import GetStatusSvg from "../../helpers/GetStatusSvg";
import Image from "next/image";
import ScrollableOverlayWrapper from "../../wrappers/ScrollableOverlayWrapper";
import NameValidityCard from "../workspace/NameValidityCard";
import { Priority, TaskRole, TaskStatus } from "@prisma/client";
import { priorityArray, statusArray } from "@/lib/constants/constants";
import { useWidthResize } from "@/lib/hooks/useWidthResize";
import { useCreateTask } from "@/lib/queries/workspace/project/task/useCreateTask";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import Spinner2 from "@/components/loadings/Spinner2";
import DueDate from "@/components/selectors/DueDate";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import ProjectSearchSelector from "@/components/selectors/ProjectSearchSelector";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import SearchProjectUser from "@/components/Search/task/SearchProjectUser";
import TaskUserCard from "./TaskUserCard";
import { TaskSvg } from "@/components/svg/TaskSvg";
import { statusMap } from "@/lib/functions/task/status/statusTransition";

export default function NewTaskModal({
  project,
  selectedStatus,
  show,
  setShow,
}: {
  project?: projectProps;
  selectedStatus?: TaskStatus;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
}) {
  const { createTask, isCreating } = useCreateTask();
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [priority, setPriority] = useState<Priority>("Low");
  const [status, setStatus] = useState<TaskStatus>(selectedStatus ?? "To_Do");
  const [users, setUsers] = useState<taskMembersProps[]>([]);
  const [due, setDue] = useState<Date>();
  const [projectProps, setProjectProps] = useState<projectProps | undefined>(
    project,
  );
  const [showPriority, setShowPriority] = useState(false);
  const priorityRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([priorityRef], () => setShowPriority(false));
  const [showStatus, setShowStatus] = useState(false);
  const statusRef = useRef<HTMLDivElement | null>(null);
  useClickOutSide([statusRef], () => setShowStatus(false));
  const [showUsers, setShowUsers] = useState(false);
  const [width, setWidth] = useState(0);
  const statusData = statusArray;
  const priorityData = priorityArray;
  useWidthResize(setWidth);
  useEffect(() => {
    if (users.length <= 0) {
      setShowUsers(false);
    }
  }, [users]);
  useEffect(() => {
    if (show) {
      setStatus(selectedStatus ?? "To_Do");
    }
  }, [show, selectedStatus]);
  if (isCreating)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <Spinner2
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        >
          <TaskSvg size="size-5 lg:size-7" />
        </Spinner2>
      </OverlayWrapper>
    );
  const close = () => {
    setShow(false);
    setName("");
    setUsers([]);
    setDesc("");
    setDue(undefined);
    setPriority("Low");
    setStatus("To_Do");
    setProjectProps(undefined);
  };
  const disabled =
    !name || name.length < 6 || !due || !projectProps || !priority || !status;
  const filterByRole = (role: TaskRole) => {
    return users.filter((u: taskMembersProps) => u.role === role);
  };
  const assignees = filterByRole("Assignee");
  const reviewers = filterByRole("Reviewer");
  const mappedStatus = statusMap(status);
  return (
    <ScrollableOverlayWrapper active={show}>
      <div
        className={`w-full transition-all transform duration-500 flex  ease-in-out items-stretch lg:min-h-110 `}
      >
        <div
          className={`max-w-md lg:max-w-full min-w-xs lg:min-w-lg transform duration-500 transition-[max-width,opacity,padding] ${
            showUsers
              ? "lg:border-r-2 lg:border-gray-200 lg:dark:border-gray-600 lg:pr-5"
              : ""
          }`}
        >
          <div className="text-gray-900 dark:text-gray-100 mb-1 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
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
                d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
              />
            </svg>
            Create Task
          </div>

          <div className="flex flex-col gap-2">
            <TitleAndElement title="Name">
              <NameValidityCard name={name} setName={setName} />
            </TitleAndElement>
            <div className="flex items-center gap-2 justify-between">
              <TitleAndElement title="Priority">
                <div
                  ref={priorityRef}
                  className="relative lg:min-w-35 min-w-30 text-nowrap"
                >
                  <div
                    className={`${getPriorityColor(
                      priority,
                    )} cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-300 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-xs md:text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
                    onClick={() => {
                      setShowPriority((prev) => !prev);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="lg:size-4 size-3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                      />
                    </svg>
                    <div>{priority}</div>
                    <div className="text-gray-500 pr-1 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                        />
                      </svg>
                    </div>
                  </div>{" "}
                  <div
                    id="dropdown"
                    className={`z-30 shadow-lg absolute top-9 lg:top-10 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
                      showPriority
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
                            {priority !== p && (
                              <div
                                className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={() => {
                                  setPriority(p);
                                  setShowPriority(false);
                                }}
                              >
                                <div
                                  className={`${getPriorityColor(
                                    p,
                                  )} flex gap-1 items-center`}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="lg:size- size-4"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                                    />
                                  </svg>

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
              </TitleAndElement>
              <TitleAndElement title="Due Date">
                <DueDate due={due} setDue={setDue} />
              </TitleAndElement>
              <TitleAndElement title="Status">
                <div
                  ref={statusRef}
                  className="relative lg:min-w-35 min-w-30 text-nowrap"
                >
                  <div
                    className={`${getStatusColor(
                      mappedStatus,
                    )} cursor-pointer justify-between flex gap-1 items-center bg-gray-100 border-gray-300 border-2 dark:border-gray-600 dark:bg-blk3 hover:bg-gray-300 dark:hover:bg-blk5 focus:outline-none text-xs md:text-sm rounded-md font-semibold lg:px-2 px-1 lg:py-1.5 py-1 `}
                    onClick={() => {
                      setShowStatus((prev) => !prev);
                    }}
                  >
                    <GetStatusSvg status={mappedStatus} />
                    <div>{mappedStatus}</div>
                    <div className="text-gray-500 pr-1 ">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2}
                        stroke="currentColor"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
                        />
                      </svg>
                    </div>
                  </div>{" "}
                  <div
                    id="dropdown"
                    className={`z-30 shadow-lg absolute top-9 lg:top-10 right-0 left-0 transition-all duration-300 bg-gray-200 divide-y divide-gray-100 rounded-lg  dark:bg-blk5 ${
                      showStatus
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
                            {status !== s && (
                              <div
                                className=" block text-sm lg:px-3 px-2 py-1.5 lg:py-2 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                onClick={() => {
                                  setStatus(s);
                                  setShowStatus(false);
                                }}
                              >
                                <div
                                  className={`${getStatusColor(
                                    mappedS,
                                  )} flex gap-1 items-center`}
                                >
                                  <GetStatusSvg status={mappedS} />

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
              </TitleAndElement>
            </div>
            {project ? (
              <div className="w-full px-2 py-1.5 flex items-center gap-3  text-sm lg:text-base text-gray-900 dark:text-gray-200 border-2 border-gray-300 rounded-full bg-gray-100 dark:bg-blk3 dark:border-gray-600">
                <div className="shrink-0">
                  {project.avatar ? (
                    <div
                      className={`relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden`}
                    >
                      <Image
                        alt={"activityAvatar"}
                        src={project.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`w-4 h-4 lg:h-5 lg:w-5  rounded-full flex justify-center items-center  `}
                      style={{ background: gradientBgFromName(project.name) }}
                    >
                      <div className="font-semibold  text-xs text-white ">
                        {getInitials(project.name)}
                      </div>
                    </div>
                  )}
                </div>
                <span className=" truncate dark:text-gray-100">
                  {project.name}
                </span>
              </div>
            ) : (
              <TitleAndElement title="Project">
                <ProjectSearchSelector
                  project={projectProps}
                  fullWidth="w-full"
                  width=""
                  searchYPadding="py-2"
                  avatarSize="w-4 h-4 lg:h-5 lg:w-5"
                  setProjectProps={setProjectProps}
                  close={!show}
                />
              </TitleAndElement>
            )}

            <TitleAndElement title="Users">
              {projectProps ? (
                <SearchProjectUser
                  users={users}
                  setUsers={setUsers}
                  projectId={projectProps.id}
                />
              ) : (
                <div className="w-full px-5 py-1.5 flex items-center gap-3  text-sm lg:text-base text-gray-500  border-2 border-gray-300 rounded-full bg-gray-100 dark:bg-blk3 dark:border-gray-600">
                  Select Project first
                </div>
              )}
            </TitleAndElement>
            {users.length > 0 && (
              <div
                className="text-gray-500 hover:underline text-sm lg:text-base flex items-center gap-1 cursor-pointer"
                onClick={() => setShowUsers((prev) => !prev)}
              >
                Show Users
                <svg
                  className={`w-4 h-4  transition-all duration-300  ${
                    showUsers
                      ? "rotate-180 lg:rotate-90"
                      : "rotate-0 lg:rotate-270"
                  }`}
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            <div
              id="dropdown"
              className={` z-20 overflow-hidden  w-full transform transition-all duration-300  ${
                showUsers && width < 1023
                  ? "opacity-100  max-h-80"
                  : "opacity-0  max-h-0 pointer-events-none m-0 p-0"
              }`}
            >
              <div className="overflow-y-auto max-h-80  overflow-x-hidden pb-5 thinScrollbar ">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Assignees
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {assignees.length}
                    </div>
                  </div>
                  <div className="mt-2 ">
                    {assignees.map((a: taskMembersProps) => (
                      <TaskUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                      Reviewers
                    </div>
                    <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                      {reviewers.length}
                    </div>
                  </div>
                  <div className="mt-2 ">
                    {reviewers.map((a: taskMembersProps) => (
                      <TaskUserCard user={a} key={a.id} setUsers={setUsers} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <TitleAndElement title="Description">
              <textarea
                maxLength={1000}
                value={desc}
                placeholder="Enter new task description"
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
                  setDesc(e.target.value);
                  const target = e.target;
                  target.style.height = "auto"; // reset height
                  target.style.height = target.scrollHeight + "px";
                }}
                className="thinScrollbar resize-none overflow-hidden max-h-30 overflow-y-auto w-full rounded-md placeholder:font-semibold bg-gray-100 dark:bg-blk3 border-2 border-gray-300 dark:border-gray-600 transition-all duration-300 px-3 py-1 text-sm lg:text-base"
              />
            </TitleAndElement>

            <div className="flex items-center justify-end gap-2 lg:gap-3 ">
              <button
                className={`px-2 lg:px-3 py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
                onClick={close}
              >
                cancel
              </button>
              <button
                disabled={disabled}
                className={`px-2 lg:px-3 py-1 lg:py-1 cursor-not-allowed rounded-md text-sm lg:text-base font-semibold ${
                  disabled
                    ? "cursor-not-allowed bg-gray-300 dark:bg-blk6"
                    : "bg-blue-500 hover:bg-blue-400 cursor-pointer text-white"
                }`}
                onClick={() => {
                  if (
                    due &&
                    name &&
                    name.length > 0 &&
                    priority &&
                    status &&
                    projectProps
                  ) {
                    createTask({
                      status,
                      priority,
                      project: { id: projectProps.id, slug: projectProps.slug },
                      dueDate: due,
                      desc: desc,
                      name,
                      users,
                    });
                  }
                  close();
                }}
              >
                Create
              </button>
            </div>
          </div>
        </div>
        {users.length > 0 && (
          <div
            className={`h-full transform duration-500 flex flex-col   min-w-0 transition-[max-width,opacity,padding] overflow-x-hidden ${
              showUsers && width > 1024
                ? "max-w-lg opacity-100 pl-5 border-opacity-100"
                : "max-w-0 opacity-0 pl-0 pr-0 ml-0 py-0 border-opacity-0"
            }`}
            style={{
              height: "100%",
              alignSelf: "stretch",
            }}
          >
            <div
              className="text-gray-500 flex justify-end w-full cursor-pointer "
              onClick={() => setShowUsers(false)}
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
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </div>
            <div
              className={`overflow-y-auto  overflow-x-hidden thinScrollbar h-120`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                    Assignees
                  </div>
                  <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                    {assignees.length}
                  </div>
                </div>
                <div className="mt-2 ">
                  {assignees.map((a: taskMembersProps) => (
                    <TaskUserCard user={a} key={a.id} setUsers={setUsers} />
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <div className="text-gray-900 dark:text-gray-100 mb-1 text-sm lg:text-base font-semibold">
                    Reviewers
                  </div>
                  <div className="px-2 py-0.5 bg-gray-200 dark:bg-blk5 rounded-md text-sm w-fit">
                    {reviewers.length}
                  </div>
                </div>
                <div className="mt-2  ">
                  {reviewers.map((a: taskMembersProps) => (
                    <TaskUserCard user={a} key={a.id} setUsers={setUsers} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ScrollableOverlayWrapper>
  );
}
