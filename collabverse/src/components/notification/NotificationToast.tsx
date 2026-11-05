"use client";

import { notificationProps } from "@/app/interfaces";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { NotificationMap } from "./NotificationMap";
import { WsInvitationCard } from "./WsInvitationCard";
import { ProjectInvitationCard } from "./ProjectInvitationCard";
import { useNotificationToastStore } from "@/lib/hooks/zustand/notification/useNotificationStore";
import { useNotifications } from "@/lib/queries/user/notifications.ts/useNotifications";

export function NotificationToast() {
  const notifications = useNotificationToastStore(
    (state) => state.notifications,
  );
  const dismiss = useNotificationToastStore((state) => state.dismiss);
  const [wsId, setWsId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [showWsInvitation, setShowWsInvitation] = useState(false);
  const [showProjectInvitation, setShowProjectInvitation] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-5 z-[120] w-[min(92vw,420px)] -translate-x-1/2">
        <div className="relative">
          <AnimatePresence initial={false}>
            {notifications.map((item: notificationProps, index: number) => (
              <ToastCard
                key={item.id}
                item={item}
                index={index}
                onDismissAction={dismiss}
                total={notifications.length}
                setInvitationIdAction={setInvitationId}
                setProjectIdAction={setProjectId}
                setWsIdAction={setWsId}
                setShowWsInvitationAction={setShowWsInvitation}
                setShowProjectInvitationAction={setShowProjectInvitation}
              />
            ))}
          </AnimatePresence>

          {/* Gives the absolutely positioned cards room in the layout. */}
          {notifications.length > 0 && <div className="h-28" />}
        </div>
      </div>
      {wsId && invitationId && (
        <WsInvitationCard
          show={showWsInvitation}
          setShow={setShowWsInvitation}
          wsId={wsId}
          invitationId={invitationId}
        />
      )}
      {wsId && invitationId && projectId && (
        <ProjectInvitationCard
          show={showProjectInvitation}
          setShow={setShowProjectInvitation}
          wsId={wsId}
          projectId={projectId}
          invitationId={invitationId}
        />
      )}
    </>
  );
}
export function ToastCard({
  item,
  index,
  total,
  onDismissAction,
  setWsIdAction,
  setProjectIdAction,
  setInvitationIdAction,
  setShowWsInvitationAction,
  setShowProjectInvitationAction,
}: {
  item: notificationProps;
  index: number;
  total: number;
  onDismissAction: (id: string) => void;
  setWsIdAction: Dispatch<SetStateAction<string | null>>;
  setProjectIdAction: Dispatch<SetStateAction<string | null>>;
  setInvitationIdAction: Dispatch<SetStateAction<string | null>>;
  setShowWsInvitationAction: Dispatch<SetStateAction<boolean>>;
  setShowProjectInvitationAction: Dispatch<SetStateAction<boolean>>;
}) {
  const { markReadMutation } = useNotifications(item.workspace?.id);
  useEffect(() => {
    const timeout = window.setTimeout(() => onDismissAction(item.id), 5000);

    return () => window.clearTimeout(timeout);
  }, [item.id, onDismissAction]);
  return (
    <>
      <motion.article
        key={item.id}
        layout
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{
          opacity: 1 - index * 0.16,
          y: index * 12,
          scale: 1 - index * 0.035,
        }}
        exit={{ opacity: 0, y: -16, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        style={{ zIndex: total - index }}
        className={`pointer-events-auto absolute inset-x-0 top-0 rounded-2xl border border-white/25 bg-white/15 p-4 text-white shadow-2xl shadow-black/20 backdrop-blur-2xl ${
          index > 1 ? "pointer-events-none" : ""
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 lg:gap-4">
              {item.sender ? (
                <div className="w-fit pt-1  relative">
                  {item.sender.avatar ? (
                    <div
                      className="relative w-6 h-6 lg:h-8 lg:w-8 rounded-full overflow-hidden cursor-pointer z-121 border border-gray-200 dark:border-gray-800"
                      onClick={() => {}}
                    >
                      <Image
                        alt={"UserAvatar"}
                        src={item.sender.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`relative w-6 h-6 lg:h-8 lg:w-8 rounded-full flex justify-center items-center cursor-pointer z-121 `}
                      style={{
                        background: gradientBgFromName(
                          item.sender.name ?? "Anonymous",
                        ),
                      }}
                      onClick={() => {}}
                    >
                      <div className="font-semibold text-xs text-white z-121">
                        {getInitials(item.sender.name ?? "Anonymous")}
                      </div>
                    </div>
                  )}
                </div>
              ) : item.workspace ? (
                <div className="w-fit pt-1  relative">
                  {item.workspace.avatar ? (
                    <div
                      className="relative w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer z-121 border border-gray-200 dark:border-gray-800"
                      onClick={() => {}}
                    >
                      <Image
                        alt={"UserAvatar"}
                        src={item.workspace.avatar}
                        className="object-center object-cover"
                        fill
                      ></Image>
                    </div>
                  ) : (
                    <div
                      className={`relative w-5 h-5 lg:h-6 lg:w-6 rounded-full flex justify-center items-center cursor-pointer z-121 `}
                      style={{
                        background: gradientBgFromName(
                          item.workspace.name ?? "Anonymous",
                        ),
                      }}
                      onClick={() => {}}
                    >
                      <div className="font-semibold text-xs text-white z-121">
                        {getInitials(item.workspace.name ?? "Anonymous")}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="relative pt-1 w-5 h-5 lg:h-6 lg:w-6 rounded-full overflow-hidden cursor-pointer z-121 border border-gray-200 dark:border-gray-800"
                  onClick={() => {}}
                >
                  <Image
                    alt={"UserAvatar"}
                    src={"/assets/settings.jpg"}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              )}
              <div className="  break-words text-[10px] md:text-xs lg:text-sm ">
                <NotificationMap
                  n={item}
                  inWs={false}
                  setShowWsInvitation={(value: boolean) => {
                    if (
                      value &&
                      item.workspace?.id &&
                      item.meta?.invitationId
                    ) {
                      setWsIdAction(item.workspace?.id);
                      setInvitationIdAction(item.meta.invitationId);
                      setShowWsInvitationAction(value);
                    }
                  }}
                  setShowProjectInvitation={(value: boolean) => {
                    if (
                      value &&
                      item.workspace?.id &&
                      item.meta?.invitationId &&
                      item.target?.id
                    ) {
                      setWsIdAction(item.workspace?.id);
                      setInvitationIdAction(item.meta.invitationId);
                      setProjectIdAction(item.target.id);
                      setShowProjectInvitationAction(value);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => {
              onDismissAction(item.id);
              markReadMutation.mutate(item.id);
            }}
            className="rounded-full px-2 text-lg leading-6 dark:text-white/70 text-gray-600 transition hover:bg-white/15 dark:hover:text-white hover:text-gray-800"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={"size-4 lg:size-5"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </motion.article>{" "}
    </>
  );
}
