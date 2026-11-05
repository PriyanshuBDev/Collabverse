import { Dispatch, RefObject, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import ChatDeleting from "@/components/warnings/ChatDeleting";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import MainBtn from "@/components/btns/MainBtn";
import Forward from "../forward/Forward";
import Xbtn from "@/components/btns/Xbtn";
import { selectMsgUserProps } from "../mainArea/ChatArea";
import useIsDark from "@/lib/hooks/useIsDark";
import { useDeleteMessages } from "@/lib/queries/workspace/conversation/messages/useDeleteMessages";

export default function DeleteForward({
  selectedMsgs,
  setSelectedMsgs,
  isDeletingRef,
}: {
  selectedMsgs: selectMsgUserProps[];
  setSelectedMsgs: Dispatch<SetStateAction<selectMsgUserProps[]>>;
  isDeletingRef: RefObject<boolean>;
}) {
  const { id: currentUserId } = useCurrentUser();
  const isDark = useIsDark();
  const { mutate } = useDeleteMessages();
  const [showForward, setShowForward] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const handleDelete = (others: boolean) => {
    isDeletingRef.current = true;
    mutate({ msgs: selectedMsgs, others });
    setTimeout(() => {
      isDeletingRef.current = false;
    }, 0);
    setSelectedMsgs([]);
  };
  const othersMsgSelected = selectedMsgs.find(
    (s: selectMsgUserProps) => s.userId !== currentUserId,
  );
  return (
    <>
      <FlexBtwWrapper addOns="shrink-0 h-13  px-5 border-b-2 border-gray-300 dark:border-gray-700  rounded-t-xl">
        <div className="flex items-center">
          <div className="text-gray-500 lg:pr-2 pr-1">
            {isDark ? (
              <svg
                className="w-6 h-6 "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 "
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            )}
          </div>
          <div className="lg:px-3 px-2 py-1.5 lg:py-2 flex items-center gap-3">
            {" "}
            <MainBtn
              onClick={() => {
                setShowWarning(true);
              }}
              addOns="px-3 py-1"
            >
              Delete {selectedMsgs.length}
            </MainBtn>
            {selectedMsgs.length < 11 && (
              <MainBtn
                onClick={() => {
                  setShowForward(true);
                }}
                addOns="px-3 py-1"
              >
                Forward {selectedMsgs.length}
              </MainBtn>
            )}
          </div>
        </div>
        <Xbtn
          addOns="hover:bg-gray-300 dark:hover:bg-blk6 p-1 rounded-full cursor-pointer"
          size="size-5 lg:size-6"
          onClick={() => {
            setSelectedMsgs([]);
          }}
        />
      </FlexBtwWrapper>
      {showForward && (
        <Forward
          selectedMsgs={selectedMsgs}
          setShowForward={setShowForward}
          showForward={showForward}
          reset={() => setSelectedMsgs([])}
        ></Forward>
      )}
      {showWarning &&
        createPortal(
          <ChatDeleting
            setShowWarning={setShowWarning}
            showWarning={showWarning}
            handleDelete={handleDelete}
            otherUserMsgs={!!othersMsgSelected}
          />,
          document.body,
        )}
    </>
  );
}
