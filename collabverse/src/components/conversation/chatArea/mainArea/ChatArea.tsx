"use client";

import { useEffect, useRef, useState } from "react";
import { chatReplyProps } from "@/app/interfaces";
import useCurrentConversation from "@/lib/hooks/conversation/useCurrentConversation";
import { useConversationDetails } from "@/lib/queries/workspace/conversation/useConversationDetails";
import Spinner1 from "@/components/loadings/Spinner1";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { GroupPerm } from "@prisma/client";
import ChatHeader from "../header/ChatHeader";
import DeleteForward from "../header/DeleteForward";
import MessageArea from "./MessageArea";
import ChatInputEditor from "../editor/ChatInputEditor";

export interface bubbleShape {
  first: boolean;
  last: boolean;
  middle: boolean;
}
export type selectMsgUserProps = {
  msgId: string;
  userId?: string;
};

export default function ChatArea() {
  const { id, type } = useCurrentConversation();
  const { data, isLoading, isError, error } = useConversationDetails();
  const [reply, setReply] = useState<chatReplyProps | null>(null);
  const [selectedMsgs, setSelectedMsgs] = useState<selectMsgUserProps[]>([]);
  const [isHeaderLoading, setIsHeaderLoading] = useState(type === "Dm");
  const [showDelete, setShowDelete] = useState(false);
  const isDeletingRef = useRef(false);
  const [scrollToBottom, setScrollToBottom] = useState<() => void>();
  useIsErrorToast(isError, "Failed to fetch conversation details", error);
  useEffect(() => {
    if (selectedMsgs && selectedMsgs.length > 0) {
      setShowDelete(true);
    } else {
      setShowDelete(false);
    }
  }, [selectedMsgs]);
  if (isLoading) {
    <div className="flex flex-col flex-1 min-h-0  items-center justify-center ">
      <Spinner1 size="size-10 lg:size-14"></Spinner1>
    </div>;
  }
  if (!id) {
    return (
      <div className=" flex flex-col flex-1 min-h-0 items-center justify-center text-sm md:text-lg text-gray-700 dark:text-gray-300 ">
        Select a chat or group to start a conversation
      </div>
    );
  }

  if (!data) return null;
  const groupPerm = (perm: GroupPerm) => {
    return type === "Dm"
      ? true
      : data.header.permissions
        ? data.header.permissions.includes(perm)
        : false;
  };
  const canSendMsg = groupPerm("Send_Messages");
  const canSendFiles = groupPerm("Send_Files");

  return (
    <div className="flex flex-col flex-1 min-h-0   " key={id}>
      <ChatHeader
        showDelete={showDelete}
        headerData={data.header}
        type={type}
        setIsHeaderLoading={setIsHeaderLoading}
      ></ChatHeader>

      {isHeaderLoading ? (
        <div className="flex flex-col flex-1 min-h-0  items-center justify-center ">
          <Spinner1 size="size-10 lg:size-14"></Spinner1>
        </div>
      ) : (
        <>
          <div
            className={`transition-all duration-300 ${
              showDelete ? "opacity-100 max-h-13" : "opacity-0 max-h-0"
            }`}
          >
            <DeleteForward
              selectedMsgs={selectedMsgs}
              setSelectedMsgs={setSelectedMsgs}
              isDeletingRef={isDeletingRef}
            />
          </div>
          <MessageArea
            convoDetails={data}
            isDeletingRef={isDeletingRef}
            setSelectedMsgs={setSelectedMsgs}
            selectedMsgs={selectedMsgs}
            showDelete={showDelete}
            setScrollToBottom={setScrollToBottom}
            setReply={setReply}
          />
          {canSendMsg ? (
            <div className="shrink-0">
              <ChatInputEditor
                users={data.header.members}
                reply={reply}
                setReply={setReply}
                scrollToBottom={scrollToBottom}
                canSendFiles={canSendFiles}
              />
            </div>
          ) : (
            <div
              className={`shrink-0 h-15 flex items-center justify-center border-t border-gray-300 bg-gray-50 dark:bg-blk2
              dark:border-gray-600 rounded-lg text-sm lg:text-base `}
            >
              Messaging is not allowed in this group
            </div>
          )}
        </>
      )}
    </div>
  );
}
