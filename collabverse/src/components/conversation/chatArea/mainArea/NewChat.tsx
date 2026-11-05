"use client";

import Spinner1 from "@/components/loadings/Spinner1";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import getInitials from "@/lib/functions/user/getInitials";
import { useUserStatus } from "@/lib/hooks/conversation/useUserStatus";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useFindDmConvo } from "@/lib/queries/workspace/conversation/dm/new/useFindDmConvo";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { chatReplyProps } from "@/app/interfaces";
import NewChatEditor from "../editor/NewChatEditor";

export function NewChat({ userId }: { userId: string }) {
  const { data, error, isError, isLoading } = useFindDmConvo(userId);
  const [reply, setReply] = useState<chatReplyProps | null>(null);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [spinner, setSpinner] = useState<boolean>(false);
  const { slug } = useCurrentWorkspace();
  const router = useRouter();
  const { isOnline } = useUserStatus({
    userId,
    lastSeenAt: null,
  });
  useIsErrorToast(isError, "Failed to get user data", error);
  if (isLoading) {
    <div className="flex flex-col flex-1 min-h-0  items-center justify-center ">
      <Spinner1 size="size-10 lg:size-14"></Spinner1>
    </div>;
  }
  if ((data && data.conversationId) || convoId) {
    router.replace(
      `/app/${slug}/conversation/${data?.conversationId ?? convoId}`,
    );
  }
  if (!data) return null;
  return (
    <div className="flex flex-col flex-1 min-h-0   ">
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 ${
          spinner ? "visible" : "invisible pointer-events-none"
        }`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
      <div
        className={`flex items-center justify-between h-15 px-5 border-b border-gray-300 dark:border-gray-600  rounded-b-lg`}
      >
        <div className="flex items-center gap-3">
          <div className="w-fit">
            {data.user.avatar ? (
              <div
                className="relative w-9 h-9 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                onClick={() => {}}
              >
                <Image
                  alt={"UserAvatar"}
                  src={data.user.avatar}
                  className="object-center object-cover"
                  fill
                ></Image>
              </div>
            ) : (
              <div
                className={`w-9 h-9 rounded-full flex justify-center items-center cursor-pointer `}
                style={{ background: gradientBgFromName(data.user.name) }}
                onClick={() => {}}
              >
                <div className="font-semibold text-base text-white">
                  {getInitials(data.user.name)}
                </div>
              </div>
            )}
          </div>
          <div className="transition-all duration-300 flex flex-col ">
            <div
              className={`text-gray-800 dark:text-gray-200 font-semibold text-[16px] leading-tight cursor-pointer
          transition-all duration-300
        
        `}
              onClick={() => {}}
            >
              {data.user.name}
            </div>
            <div
              className={`
           text-sm leading-none  transition-all duration-300
          ${isOnline ? "opacity-100 max-h-6" : "opacity-0 max-h-0"} ${
            isOnline ? "text-blue-500" : "text-gray-600 dark:text-gray-400"
          }
        `}
            >
              {isOnline ? "Online" : ""}
            </div>
          </div>
        </div>
      </div>

      <div className="shrink-0">
        <NewChatEditor
          reply={reply}
          setReply={setReply}
          userId={userId}
          canSendFiles={true}
          setConvoId={setConvoId}
          setSpinner={setSpinner}
        />
      </div>
    </div>
  );
}
