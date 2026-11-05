import {
  basicMember,
  projectAuthorityRole,
  viewTasksProps,
} from "@/app/interfaces";
import GetStatusSvg from "@/components/helpers/GetStatusSvg";
import TaskDeleteWarning from "@/components/warnings/TaskDeleteWarning";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import getInitials from "@/lib/functions/user/getInitials";
import getPriorityColor from "@/lib/functions/colors/getPriorityColor";
import getStatusColor from "@/lib/functions/colors/getStatusColor";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import useMounted from "@/lib/hooks/useMounted";
import { canDeleteTask, statusOrder } from "@/lib/hooks/useIsAllowedTask";
import { $Enums, TaskStatus } from "@prisma/client";
import {
  isAllowedStatusTransition,
  statusMap,
} from "@/lib/functions/task/status/statusTransition";

export default function TableContent({
  t,
  role,
  projectSlug,
}: {
  t: viewTasksProps;
  role: projectAuthorityRole;
  projectSlug: string;
}) {
  const { slug } = useCurrentWorkspace();
  const router = useRouter();
  const mounted = useMounted();
  const [showDelWarning, setShowDelWarning] = useState(false);
  const [dropDown, setDropDown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dropRef], () => setDropDown(false));
  const formattedDate = DateFormatter2(t.dueDate);
  const canDelete = canDeleteTask(role);
  const statusData = statusOrder;
  const allowedStatuses = statusData.filter(
    (s: $Enums.TaskStatus) =>
      s !== t.status &&
      isAllowedStatusTransition(t.status, s, t.currentUserTaskRole),
  );
  const canChangeStatus = allowedStatuses.length > 0;

  if (!mounted) return null;

  return (
    <>
      <tr
        className={`bg-gray-100 border-b dark:bg-blk3 dark:border-gray-700 border-gray-200 cursor-pointer ${t.currentUserTaskRole ? "hover:bg-white dark:hover:bg-blk5" : ""} `}
        onClick={() => {
          if (t.currentUserTaskRole) {
            router.push(`/app/${slug}/projects/${projectSlug}/tasks/${t.slug}`);
          }
        }}
      >
        <th
          scope="row"
          className="px-6 py-2 lg:py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white"
        >
          {t.name}
        </th>

        <td className="px-6 py-2 lg:py-3 text-nowrap font-semibold">
          {t.doneSubtasks}/{t.totalSubtasks}
        </td>
        <td className="px-6 py-2 lg:py-3">
          <div className="flex items-center">
            {t.members.slice(0, 5).map((a: basicMember, idx: number) => {
              return (
                <div
                  key={idx}
                  className={`${
                    idx !== 0 ? "-ml-2" : ""
                  } hover:z-10 relative transition-all`}
                  style={{ zIndex: idx + 1 }}
                >
                  {a.avatar ? (
                    <div className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden border-2 border-white dark:border-blk5">
                      <Image
                        alt={"membersAvatar"}
                        src={a.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center border-2 border-white dark:border-blk5`}
                      style={{
                        background: gradientBgFromName(a.name),
                      }}
                    >
                      <div className="font-semibold text-xs text-white">
                        {getInitials(a.name)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {t.totalMembers > 5 && (
              <div
                className={`z-6 -ml-2 w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center bg-fuchsia-500 border-2 border-white dark:border-blk5`}
              >
                <div className="font-semibold text-xs text-white">
                  +{t.members.length - 5}
                </div>
              </div>
            )}
          </div>
        </td>
        <td className="px-6 py-2 lg:py-3 text-nowrap">{formattedDate}</td>
        <td className="px-6 py-2 lg:py-3 lg:text-base text-xs">
          <div
            className={`${getPriorityColor(
              t.priority,
            )} flex gap-2 items-center`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="lg:size-5 size-3"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
              />
            </svg>

            <div>{t.priority}</div>
          </div>
        </td>
        <td className="px-1 py-2 lg:py-3">
          {t.currentUserTaskRole && (canChangeStatus || canDelete) && (
            <div
              ref={dropRef}
              className="px-0.5 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-blk3 w-fit relative"
              onClick={(e) => {
                e.stopPropagation();
                setDropDown((prev) => !prev);
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="lg:size-6 size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                />
              </svg>
              <div
                className={`absolute top-0 -left-36 w-35   bg-gray-200 dark:bg-blk7 shadow-md rounded-md py-1 transition-all duration-300 ${
                  dropDown
                    ? "opacity-100 translate-x-0 visible"
                    : "opacity-0 translate-x-4 invisible pointer-events-none"
                } `}
              >
                <ul className="w-full">
                  {canChangeStatus && (
                    <li className="rounded-md px-3 py-0.5 text-gray-800 dark:text-gray-200 text-sm lg:text-base hover:bg-gray-300 dark:hover:bg-blk9 relative group">
                      Change status
                      <div
                        className={`z-30 overflow-hidden group-hover:visible group-hover:opacity-100 group-hover:pointer-events-auto opacity-0 invisible pointer-events-none  shadow-lg absolute -top-3 lg:-left-28.5 -left-27 transition-all duration-300 bg-gray-200 dark:bg-blk7 divide-y divide-gray-100 rounded-md   `}
                      >
                        <ul className=" text-sm text-gray-700 dark:text-gray-200 gap-0.5">
                          {allowedStatuses.map((s: TaskStatus, idx: number) => {
                            const mappedStatus = statusMap(s);
                            return (
                              <li key={idx}>
                                <div
                                  className=" block text-sm px-3 py-0.5 font-semibold cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                  onClick={() => {
                                    //change mutation
                                  }}
                                >
                                  <div
                                    className={`${getStatusColor(
                                      mappedStatus,
                                    )} flex gap-1 items-center`}
                                  >
                                    <GetStatusSvg status={mappedStatus} />
                                    <div>{mappedStatus}</div>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    </li>
                  )}
                  {canDelete && (
                    <li
                      className="rounded-md px-3 py-0.5 text-gray-800 dark:text-gray-200 text-sm lg:text-base hover:bg-gray-300 dark:hover:bg-blk9"
                      onClick={() => setShowDelWarning(true)}
                    >
                      Delete
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}
        </td>
      </tr>
      {mounted &&
        createPortal(
          <TaskDeleteWarning
            show={showDelWarning}
            setShow={setShowDelWarning}
            name={t.name}
            handleDeleting={() => {}}
          />,
          document.body,
        )}
    </>
  );
}
