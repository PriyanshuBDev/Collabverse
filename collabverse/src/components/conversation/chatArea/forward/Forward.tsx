import { selectedMsgsProps } from "@/app/interfaces";
import Xbtn from "@/components/btns/Xbtn";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import { Dispatch, SetStateAction, useState } from "react";
import { createPortal } from "react-dom";
import ForwardUserCard from "./ForwardUserCard";
import { useForward } from "@/lib/queries/workspace/conversation/forward/useForward";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import Searchbar from "@/components/project/Overview/Searchbar";
import Spinner1 from "@/components/loadings/Spinner1";
import {
  convoForwardProps,
  convoForwardResProps,
} from "@/lib/axios/workspace/conversation/forward/getConversationsForward";

export default function Forward({
  showForward,
  setShowForward,
  selectedMsgs,
  reset,
}: {
  showForward: boolean;
  setShowForward: Dispatch<SetStateAction<boolean>>;
  selectedMsgs: selectedMsgsProps[];
  reset?: () => void;
}) {
  const [selectedConvos, setSelectedConvos] = useState<convoForwardProps[]>([]);
  const [search, setSearch] = useState("");
  const {
    convo: {
      data,
      isPending,
      isError,
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
      error,
    },
    forwardMsgsMutation,
  } = useForward(search);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useIsErrorToast(isError, "Failed to fetch chats", error);
  const allConvos =
    data?.pages?.flatMap((page: convoForwardResProps) => page.conversations) ??
    [];
  const close = () => {
    setShowForward(false);
    setSelectedConvos([]);
    if (reset) {
      reset();
    }
  };
  const disabled = selectedConvos.length < 1 || selectedConvos.length > 10;
  if (forwardMsgsMutation.isPending) {
    return (
      <div
        className={`fixed inset-0 bg-black/30 flex items-center justify-center z-1000 visible`}
      >
        <Spinner1
          fill="fill-gray-800 dark:fill-gray-200"
          size="size-10 lg:size-16"
          color="text-gray-200 dark:text-blk3"
        ></Spinner1>
      </div>
    );
  }
  return createPortal(
    <OverlayWrapper active={showForward}>
      <div className="min-w-80">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="text-gray-700 dark:text-gray-200 text-lg lg:text-xl font-semibold px-1">
            Forward To
          </div>
          <Xbtn onClick={close} />
        </div>
        <div className="flex items-center justify-center w-full">
          <Searchbar
            search={search}
            setSearch={setSearch}
            placeholder="Search chats..."
          ></Searchbar>
        </div>
        <div className="mt-3">
          {isPending ? (
            <div className="flex items-center justify-center h-90">
              <Spinner1 size="size-8 lg:size-10" />
            </div>
          ) : allConvos.length > 0 ? (
            <div
              className="flex gap-0.5 flex-col h-65 overflow-y-auto overflow-x-hidden text-gray-900 dark:text-gray-100 thinScrollbar"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {allConvos.map((c: convoForwardProps) => (
                <ForwardUserCard
                  c={c}
                  setSelectedConvos={setSelectedConvos}
                  key={c.convoId}
                  selectedConvos={selectedConvos}
                />
              ))}
              {isFetchingNextPage && (
                <div className="flex items-center justify-center mt-2">
                  <Spinner1 size="size-5 lg:size-6" />
                </div>
              )}
              <div ref={loadMoreRef} />
            </div>
          ) : (
            <div className="text-gray-500 flex items-center justify-center text-base h-50">
              No chats found
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-2 lg:gap-3 mt-3">
          <button
            className={`min-w-50 h-8 cursor-pointer rounded-md text-sm lg:text-base  ${
              disabled
                ? " text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-blk5"
                : "text-white bg-blue-500"
            }`}
            onClick={() => {
              forwardMsgsMutation.mutate({
                msgs: selectedMsgs,
                convos: selectedConvos.map((s: convoForwardProps) => ({
                  convoId: s.convoId,
                })),
              });
            }}
            disabled={disabled}
          >
            Forward to {selectedConvos.length}
          </button>
        </div>
      </div>
    </OverlayWrapper>,
    document.body,
  );
}
