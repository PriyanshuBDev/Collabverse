"use client";

import { useEffect, useRef, useState } from "react";
import { fileMeta, getAttachmentsRes } from "../../../../app/interfaces";
import { useIsAllowedToAttach } from "@/lib/hooks/useIsAllowedTask";
import { PlusFileSvg } from "@/components/svg/PlusFileSvg";
import FilePicker from "./FilePicker";
import FinalizeFile from "./FInalizeFile";
import Attachments from "./Attachments";
import { useTaskAttachments } from "@/lib/queries/workspace/project/task/attachments/useTaskAttachments";
import { useIsErrorToast } from "@/lib/hooks/useIsErrorToast";
import { useInfiniteScroll } from "@/lib/hooks/useInfiniteScroll";
import Spinner1 from "@/components/loadings/Spinner1";

export default function AttachmentArea() {
  const {
    data,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isError,
    error,
    isPending,
  } = useTaskAttachments();
  useIsErrorToast(isError, "Failed to fetch attachments", error);
  const attachments =
    data?.pages.flatMap((page: getAttachmentsRes) => page.attachments) ?? [];
  const canAttach = useIsAllowedToAttach();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<fileMeta[]>([]);
  const [showFinalize, setShowFinalize] = useState(false);
  const loadMoreRef = useInfiniteScroll({
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  });
  useEffect(() => {
    if (selectedFiles.length > 0 && selectedFiles.length <= 10) {
      setShowFinalize(true);
    } else {
      setShowFinalize(false);
    }
  }, [selectedFiles]);

  return (
    <div className="h-full">
      {canAttach && (
        <div
          className=" hover:bg-gray-200 dark:hover:bg-blk8 cursor-pointer px-2 py-1 rounded-lg flex items-center gap-2 mb-1 "
          onClick={() => {
            inputRef.current?.click();
          }}
        >
          <div className="w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center bg-gray-300 dark:bg-blk6 text-gray-500 rounded-full border border-gray-400 dark:border-blk9">
            <PlusFileSvg size="size-4 lg:size-5" />
          </div>
          <div className="text-gray-900 dark:text-gray-100 text-sm font-semibold">
            Attach new file
          </div>
        </div>
      )}
      {attachments.length > 0 ? (
        <Attachments
          attachments={attachments}
          loadMoreRef={loadMoreRef}
          isFetchingNextPage={isFetchingNextPage}
        />
      ) : isPending ? (
        <div className="flex items-center justify-center">
          <Spinner1 size="size-5 lg:size-6" />
        </div>
      ) : (
        <div
          className={` mt-3 flex items-center justify-center text-xs  lg:text-base`}
        >
          No attachments found
        </div>
      )}
      <FilePicker
        fileInputRef={inputRef}
        selected={selectedFiles}
        setSelected={setSelectedFiles}
      ></FilePicker>
      <FinalizeFile
        setFiles={setSelectedFiles}
        files={selectedFiles}
        show={showFinalize}
        setShow={setShowFinalize}
      ></FinalizeFile>
    </div>
  );
}
