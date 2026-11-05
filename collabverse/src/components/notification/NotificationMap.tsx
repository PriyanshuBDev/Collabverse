import { notificationProps } from "@/app/interfaces";
import { DateFormatter2 } from "@/lib/functions/date/DateFormatter2";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { NotificationType } from "@prisma/client";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { ReactNode } from "react";

export function NotificationMap({
  n,
  setShowWsInvitation,
  inWs,
  setShowProjectInvitation,
}: {
  n: notificationProps;
  setShowWsInvitation: (value: boolean) => void;
  setShowProjectInvitation: (value: boolean) => void;
  inWs: boolean | undefined;
}) {
  const { id: currentUserId } = useCurrentUser();
  const router = useRouter();
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
  const sender = displayUser(n.sender.id, n.sender.name, true);
  const ws = n.workspace
    ? n.workspace
    : {
        id: "",
        name: "unknown",
        avatar: undefined,
        slug: "",
      };
  const notificationMap: Record<NotificationType, () => ReactNode> = {
    invited_to_workspace: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>invited you to workspace</NotiSpan>
        <span>{`“${ws.name}”`}</span>
        <NotiSpan>as a</NotiSpan>
        <span>{`“${n.meta?.role ?? "Member"}”.`}</span>
        {n.meta?.expireAt && (
          <>
            {" "}
            <NotiSpan>Expires at</NotiSpan>
            <span>{formatDate(n.meta.expireAt)}</span>
          </>
        )}
        <Click
          onClick={() => {
            if (ws.id && n.meta?.invitationId) {
              setShowWsInvitation(true);
            }
          }}
        />
      </NotiDiv>
    ),

    workspace_join_accepted: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>accepted your invitation to workspace</NotiSpan>
        <span>{`“${ws.name}”`}</span>
        <Click onClick={() => router.push(`/app/${ws.slug}/home`)} />
      </NotiDiv>
    ),

    workspace_join_declined: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>declined your invitation to workspace</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
      </NotiDiv>
    ),

    removed_from_workspace: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>removed you from workspace</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <Click onClick={() => router.push(`/app`)} />
      </NotiDiv>
    ),

    workspace_role_changed: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>changed your role from</NotiSpan>
        <span>{n.target?.oldValue ?? "unknown"}</span>
        <NotiSpan>to</NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click onClick={() => router.push(`/app/${ws.slug}/users`)} />
      </NotiDiv>
    ),
    workspace_left: () => (
      <NotiDiv>
        <NotiSpan> You have left the workspace</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
      </NotiDiv>
    ),
    workspace_owner_transferred_from_you: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>transferred your ownership to </NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click onClick={() => router.push(`/app/${ws.slug}/settings`)} />
      </NotiDiv>
    ),
    workspace_owner_transferred_to_you: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>tranferred ownerhsip to</NotiSpan>
        <span>you</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click onClick={() => router.push(`/app/${ws.slug}/settings`)} />
      </NotiDiv>
    ),
    workspace_owner_transferred: () => (
      <NotiDiv>
        {inWs ? (
          <NotiSpan>Workspace ownership transferred from</NotiSpan>
        ) : (
          <>
            <span>{ws.name}</span>
            <NotiSpan>workspace ownership transferred from</NotiSpan>
          </>
        )}
        <span>{n.target?.oldValue ?? "unknown"}</span>
        <NotiSpan>to</NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        <Click onClick={() => router.push(`/app/${ws.slug}/settings`)} />
      </NotiDiv>
    ),

    workspace_deleted: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan> deleted workspace</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”. `}</span>
        <NotiSpan>Your membership has been terminated.</NotiSpan>
        <Click onClick={() => router.push(`/app`)} />
      </NotiDiv>
    ),

    /* ───────────── Project ───────────── */
    invited_to_project: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>invited you to project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan>as a</NotiSpan>
        <span>{`“${n.meta?.role ?? "unknown"}”`}</span>
        {n.meta?.expireAt && (
          <>
            {" "}
            <NotiSpan>Expires at</NotiSpan>
            <span>{formatDate(n.meta.expireAt)}</span>
          </>
        )}
        <Click
          onClick={() => {
            if (ws.id && n.target?.id && n.meta?.invitationId) {
              setShowProjectInvitation(true);
            }
          }}
        />
      </NotiDiv>
    ),

    removed_from_project: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>removed you from project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <Click onClick={() => router.push(`/app/${ws.slug}/projcts`)} />
      </NotiDiv>
    ),

    project_role_change: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>changed your role from</NotiSpan>
        <span>{n.target?.oldValue ?? "unknown"}</span>
        <NotiSpan>to</NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    project_due_date_changed: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>changed due date from</NotiSpan>
        <span>{formatDate(n.target?.oldValue)}</span>
        <NotiSpan>to</NotiSpan>
        <span>{formatDate(n.target?.newValue)}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    project_owner_transferred: () => (
      <NotiDiv>
        <span>{n.target?.name ?? "unknown"}</span>
        <NotiSpan>project ownership transferred from</NotiSpan>
        <span>{n.target?.oldValue ?? "unknown"}</span>
        <NotiSpan>to</NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    project_owner_transferred_from_you: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>transferred your ownership to </NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>

        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    project_owner_transferred_to_you: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>tranferred ownerhsip to</NotiSpan>
        <span>you</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    project_deleted: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>deleted project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
      </NotiDiv>
    ),

    /* ───────────── Tasks ───────────── */
    task_assigned: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>assigned you to task</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan>as a </NotiSpan>
        <span>{n.meta?.role ?? "unknown"}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/projcts/${n.meta?.projectSlug}/tasks/${n.meta?.taskSlug}`,
            )
          }
        />
      </NotiDiv>
    ),
    task_role_changed: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>changed your role in task</NotiSpan>
        <span>{n.target?.name ?? "unknown"}</span>
        <NotiSpan>from</NotiSpan>
        <span>{n.target?.oldValue ?? "unknown"}</span>
        <NotiSpan>to</NotiSpan>
        <span>{n.target?.newValue ?? "unknown"}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/projcts/${n.meta?.projectSlug}/tasks/${n.meta?.taskSlug}`,
            )
          }
        />
      </NotiDiv>
    ),

    task_unassigned: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>unassigned you from task</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),

    task_due_date_changed: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>changed the due date of task</NotiSpan>
        <span>{n.target?.name ?? "unknown"}</span>
        <NotiSpan>from</NotiSpan>
        <span>{formatDate(n.target?.oldValue)}</span>
        <NotiSpan>to</NotiSpan>
        <span>{formatDate(n.target?.newValue)}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/projcts/${n.meta?.projectSlug}/tasks/${n.meta?.taskSlug}`,
            )
          }
        />
      </NotiDiv>
    ),

    task_completed: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>marked task</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan> as completed in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/projcts/${n.meta?.projectSlug}/tasks/${n.meta?.taskSlug}`,
            )
          }
        />
      </NotiDiv>
    ),

    task_deleted: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>deleted task</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan>in project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projcts/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),

    /* ───────────── Mentions ───────────── */
    mentioned_in_task: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>mentioned you in the task</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        <NotiSpan>in the project</NotiSpan>
        <span>{`“${n.meta?.projectName ?? "unknown"}”`}</span>
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/projects/${n.meta?.projectSlug}/tasks/${n.meta?.taskSlug}`,
            )
          }
        />
      </NotiDiv>
    ),

    mentioned_in_project: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>mentioned you in project</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(`/app/${ws.slug}/projects/${n.meta?.projectSlug}`)
          }
        />
      </NotiDiv>
    ),
    kicked_group: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>kicked you from group</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
      </NotiDiv>
    ),

    /* ───────────── Security & System ───────────── */
    password_changed: () => (
      <NotiDiv>
        <NotiSpan>Your password was changed</NotiSpan>
      </NotiDiv>
    ),

    new_device_login: () => (
      <NotiDiv>
        <NotiSpan>New login from</NotiSpan>
        <span>{n.meta?.device}</span>
      </NotiDiv>
    ),

    system_announcement: () => (
      <NotiDiv>
        <NotiSpan>Announcement:</NotiSpan>
        <span>{n.meta?.title}</span>
      </NotiDiv>
    ),

    maintenance_scheduled: () => (
      <NotiDiv>
        <NotiSpan>Maintenance scheduled at</NotiSpan>
        <span>
          {format(n.meta?.scheduledAt ?? new Date(), "dd MMM yyy, HH:mm")}
        </span>
      </NotiDiv>
    ),

    maintenance_completed: () => (
      <NotiDiv>
        <NotiSpan>Maintenance completed successfully</NotiSpan>
      </NotiDiv>
    ),

    /* ───────────── Messaging / Calls ───────────── */
    new_message_dm: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>sent you a message</NotiSpan>
        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),
    new_message_group: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>sends a message in group</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),
    mentioned_in_group: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>mentioned you in group</NotiSpan>
        <span>{`“${n.target?.name ?? "unknown"}”`}</span>
        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),
    forward_messages: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>forwarded</NotiSpan>
        <span>{`“${n.meta?.items ?? "a"}”`}</span>
        <NotiSpan>messages</NotiSpan>
        {n.meta?.type === "Group" && (
          <>
            <NotiSpan>in group</NotiSpan>
            <span>{`“${n.target?.name ?? "unknown"}”`}</span>
          </>
        )}

        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),
    missed_calls: () => (
      <NotiDiv>
        <NotiSpan>Missed calls from </NotiSpan>
        <span>{sender}</span>
        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),
    missed_voice_call: () => (
      <NotiDiv>
        <NotiSpan>Missed voice call from </NotiSpan>
        <span>{sender}</span>
        {!inWs && (
          <>
            {}
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),

    missed_video_call: () => (
      <NotiDiv>
        <NotiSpan>Missed video call from </NotiSpan>
        <span>{sender}</span>
        {!inWs && (
          <>
            <NotiSpan>in workspace</NotiSpan>
            <span>{`“${ws.name}”`}</span>
          </>
        )}
        <Click
          onClick={() =>
            router.push(
              `/app/${ws.slug}/conversation/${n.meta?.conversationId}`,
            )
          }
        />
      </NotiDiv>
    ),

    other: () => (
      <NotiDiv>
        <span>{sender}</span>
        <NotiSpan>performed an action.</NotiSpan>
      </NotiDiv>
    ),
  };
  return notificationMap[n.type]();
}
function NotiDiv({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap  text-gray-800 dark:text-gray-200 font-semibold [&>*]:mr-1">
      {children}
    </div>
  );
}

function NotiSpan({ children }: { children: ReactNode }) {
  return (
    <span className="text-gray-600 dark:text-gray-400 font-normal ">
      {children}
    </span>
  );
}
export function Click({ onClick }: { onClick: () => void }) {
  return (
    <span
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:underline flex items-center gap-1 cursor-pointer w-fit "
    >
      Click{" "}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="size-2 lg:size-3"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25"
        />
      </svg>
    </span>
  );
}
