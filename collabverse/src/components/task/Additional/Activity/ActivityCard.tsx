"use client";

import getInitials from "@/lib/functions/user/getInitials";
import Image from "next/image";
import { format } from "date-fns";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import { activityProps } from "../../../../app/interfaces";
import { ReactNode } from "react";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import { ActivityType } from "@prisma/client";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";

export default function ActivityCard({
  activity,
  last,
  isTask,
  isProject,
}: {
  activity: activityProps;
  last: boolean;
  isTask?: boolean;
  isProject?: boolean;
}) {
  const user = useCurrentUser();
  const currentUserId = user.id;
  const setUserId = useShowUserStore.getState().setUserId;
  function displayUser(
    id?: string,
    fallbackName?: string | null,
    capitalize = false,
    possessive?: boolean,
  ) {
    if (id === currentUserId) {
      if (possessive) return capitalize ? "Your" : "your";
      return capitalize ? "You" : "you";
    }

    return fallbackName ?? "Unknown";
  }
  function formatDate(date?: string) {
    return date ? DateFormatter2(new Date(date)) : "none";
  }
  const actor = displayUser(activity.user.id, activity.user.name, true);
  const affectedUser = displayUser(
    activity.affectedUser?.id,
    activity.affectedUser?.name,
  );
  const possessiveAffectedUser = displayUser(
    activity.affectedUser?.id,
    activity.affectedUser?.name,
    false,
    true,
  );
  const targetedUser = displayUser(activity.target?.id, activity.target?.name);
  const capitalTargetUser = displayUser(
    activity.target?.id,
    activity.target?.name,
    true,
  );

  const activityMap: Record<ActivityType, () => ReactNode> = {
    workspace_avatar_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated workspace avatar.</ActivitySpan>
      </ActivityDiv>
    ),
    workspace_created: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>created this workspace.</ActivitySpan>
      </ActivityDiv>
    ),
    workspace_description_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated workspace description.</ActivitySpan>
      </ActivityDiv>
    ),
    workspace_member_added: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>added</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
        <ActivitySpan>as</ActivitySpan>
        <span>{activity.meta?.role}.</span>
      </ActivityDiv>
    ),
    workspace_member_left: () => (
      <ActivityDiv>
        <span>{capitalTargetUser}</span>
        <ActivitySpan>left the workspace.</ActivitySpan>
      </ActivityDiv>
    ),
    workspace_member_role_changed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed</ActivitySpan>
        <span>{`“${possessiveAffectedUser}”`}</span>
        <ActivitySpan>role from</ActivitySpan>
        <span>{`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    workspace_member_removed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>removed</ActivitySpan>
        <span>{`“${targetedUser}”`}</span>
        <ActivitySpan>from the workspace.</ActivitySpan>
      </ActivityDiv>
    ),
    workspace_name_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated workspace name from</ActivitySpan>
        <span> {`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    workspace_ownership_changed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>transferred ownership</ActivitySpan>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${affectedUser}”.`}</span>
      </ActivityDiv>
    ),
    workspace_settings_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated workspace settings</ActivitySpan>
      </ActivityDiv>
    ),
    project_member_added: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>added</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
      </ActivityDiv>
    ),
    project_avatar_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated project avatar.</ActivitySpan>
      </ActivityDiv>
    ),
    project_deleted: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>deleted the project</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    project_member_removed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>removed</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
      </ActivityDiv>
    ),
    project_member_left: () => (
      <ActivityDiv>
        <span>{capitalTargetUser}</span>
        <ActivitySpan>left the project.</ActivitySpan>
      </ActivityDiv>
    ),
    project_ownership_changed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>transferred ownership</ActivitySpan>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${affectedUser}”.`}</span>
      </ActivityDiv>
    ),
    project_settings_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated project settings.</ActivitySpan>
      </ActivityDiv>
    ),
    project_member_role_changed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed</ActivitySpan>
        <span>{`“${possessiveAffectedUser}”`}</span>
        <ActivitySpan>role from</ActivitySpan>
        <span>{`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    project_mentioned: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>mentioned</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
        <ActivitySpan>in a comment.</ActivitySpan>
      </ActivityDiv>
    ),
    project_name_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated the project name from</ActivitySpan>
        <span> {`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    project_description_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated the project description.</ActivitySpan>
      </ActivityDiv>
    ),
    project_due_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed the due date from</ActivitySpan>
        <span>{`“${formatDate(activity.target?.oldValue)}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${formatDate(activity.target?.newValue)}”.`}</span>
      </ActivityDiv>
    ),
    project_created: () => (
      <ActivityDiv>
        <span>{actor}</span>
        {isProject ? (
          <ActivitySpan>created this project.</ActivitySpan>
        ) : (
          <>
            {" "}
            <span>{actor}</span>
            <ActivitySpan>created a project</ActivitySpan>
            <span>{`“${activity.target?.name}”.`}</span>
          </>
        )}
      </ActivityDiv>
    ),
    task_created: () => (
      <ActivityDiv>
        <span>{actor}</span>
        {isTask ? (
          <ActivitySpan>created this task.</ActivitySpan>
        ) : (
          <>
            <ActivitySpan>created a task</ActivitySpan>
            <span>{`“${activity.target?.name}”.`}</span>
          </>
        )}
      </ActivityDiv>
    ),
    task_deleted: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>deleted a task</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    subtask_added: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>added a subtask</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    subtask_completed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>marked the subtask</ActivitySpan>
        <span>{`“${activity.target?.name}”`}</span>
        <ActivitySpan>as completed.</ActivitySpan>
      </ActivityDiv>
    ),
    subtask_unmarked: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>unmarked the subtask</ActivitySpan>
        <span>{`“${activity.target?.name}”`}</span>
      </ActivityDiv>
    ),
    subtask_deleted: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>deleted the subtask</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    subtask_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated the subtask</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    task_member_added: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>added</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
      </ActivityDiv>
    ),
    task_member_removed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>removed</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
      </ActivityDiv>
    ),
    task_member_role_changed: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed</ActivitySpan>
        <span>{`“${possessiveAffectedUser}”`}</span>
        <ActivitySpan>role from</ActivitySpan>
        <span>{`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),

    task_mentioned: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>mentioned</ActivitySpan>
        <span>{`“${affectedUser}”`}</span>
        <ActivitySpan>in a comment.</ActivitySpan>
      </ActivityDiv>
    ),

    task_attachment_added: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>uploaded an attachment</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    task_attachment_deleted: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>deleted an attachment</ActivitySpan>
        <span>{`“${activity.target?.name}”.`}</span>
      </ActivityDiv>
    ),
    task_member_left: () => (
      <ActivityDiv>
        <span>{capitalTargetUser}</span>
        <ActivitySpan>left the task.</ActivitySpan>
      </ActivityDiv>
    ),
    task_name_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed the task name from</ActivitySpan>
        <span> {`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    task_description_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>updated the task description.</ActivitySpan>
      </ActivityDiv>
    ),
    task_due_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed the due date from</ActivitySpan>
        <span>{`“${formatDate(activity.target?.oldValue)}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${formatDate(activity.target?.newValue)}”.`}</span>
      </ActivityDiv>
    ),
    task_status_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed the status from</ActivitySpan>
        <span>{`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    task_priority_updated: () => (
      <ActivityDiv>
        <span>{actor}</span>
        <ActivitySpan>changed the priority from</ActivitySpan>
        <span>{`“${activity.target?.oldValue}”`}</span>
        <ActivitySpan>to</ActivitySpan>
        <span>{`“${activity.target?.newValue}”.`}</span>
      </ActivityDiv>
    ),
    other: () => (
      <ActivityDiv>
        <span>{actor ?? "A user"}</span>
        <ActivitySpan>performed an action.</ActivitySpan>
      </ActivityDiv>
    ),
  };
  const defaultActivity = () => {
    return (
      <ActivityDiv>
        <span>{actor ?? "A user"}</span>
        <ActivitySpan>performed an action.</ActivitySpan>
      </ActivityDiv>
    );
  };
  return (
    <div className="flex gap-3 ">
      <div
        className="w-fit pt-1  relative cursor-pointer"
        onClick={() => {
          if (activity.user.id && activity.user.id !== currentUserId) {
            setUserId(activity.user.id);
          }
        }}
      >
        {activity.user.avatar ? (
          <div
            className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer z-10 border border-gray-200 dark:border-gray-800"
            onClick={() => {}}
          >
            <Image
              alt={"UserAvatar"}
              src={activity.user.avatar}
              className="object-center object-cover"
              fill
            ></Image>
          </div>
        ) : (
          <div
            className={`relative w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center cursor-pointer z-10 `}
            style={{
              background: gradientBgFromName(activity.user.name ?? "Anonymous"),
            }}
            onClick={() => {}}
          >
            <div className="font-semibold text-xs text-white z-10">
              {getInitials(activity.user.name ?? "Anonymous")}
            </div>
          </div>
        )}
        {!last && (
          <div className="absolute left-1/2 top-1 h-full border-l-2 border-dashed  border-gray-400 dark:border-gray-600"></div>
        )}
      </div>
      <div className="pb-3  break-words overflow-wrap-anywhere ">
        {activityMap[activity.type]?.() ?? defaultActivity()}
        <div className="text-xs  text-gray-500 dark:text-gray-600">
          {format(new Date(activity.createdAt), "hh:mm a")}
        </div>
      </div>
    </div>
  );
}

function ActivityDiv({ children }: { children: ReactNode }) {
  return (
    <div className="text-sm text-gray-800 dark:text-gray-200 font-semibold space-x-1">
      {children}
    </div>
  );
}

function ActivitySpan({ children }: { children: ReactNode }) {
  return (
    <span className="text-gray-600 dark:text-gray-400 font-normal ">
      {children}
    </span>
  );
}
