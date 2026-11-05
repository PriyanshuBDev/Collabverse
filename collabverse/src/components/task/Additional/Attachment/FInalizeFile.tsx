import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import OverlayWrapper from "@/components/wrappers/OverlayWrapper";
import { mediaSvg } from "@/components/svg/mediaSvg";
import FlexBtwWrapper from "@/components/wrappers/FlexBtwWrapper";
import { DataFormatter } from "@/lib/functions/download/DataFormatter";
import Toolbar from "@/components/helpers/Toolbar";
import { fileMetadata, fileMeta } from "@/app/interfaces";
import { PlusFileSvg } from "@/components/svg/PlusFileSvg";
import { truncateFileName } from "@/lib/functions/task/attachment/turncateFileName";
import { useTaskAttachments } from "@/lib/queries/workspace/project/task/attachments/useTaskAttachments";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { uploadFilesBatch } from "@/lib/axios/upload/uploadFiles";
import { deleteAttachments } from "@/lib/axios/workspace/project/tasks/attachments/deleteAttachments";
import { toast } from "sonner";
import { CircularProgress } from "@/components/progress/CircularProgress";

export default function FinalizeFile({
  show,
  setShow,
  files,
  setFiles,
}: {
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
  files: fileMeta[];
  setFiles: Dispatch<SetStateAction<fileMeta[]>>;
}) {
  const { id } = useCurrentTask();
  const { createAttachments } = useTaskAttachments();
  const [showWarning, setShowWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const isCancelled = useRef(false);
  const [progress, setProgress] = useState(0);
  const [cancelUpload, setCancelUpload] = useState<() => void>(() => () => {});
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (loading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [loading]);
  if (loading)
    return (
      <OverlayWrapper active addOns="lg:p-8 p-5">
        <div className="text-gray-700 dark:text-gray-300 text-xs lg:text-lg mb-3">
          Files are uploading please wait.
        </div>
        <div className="flex items-center justify-center flex-col gap-2">
          <CircularProgress
            progress={progress}
            size={70}
            stroke={5}
            svgSize="size-7"
            cancelDownload={() => {
              isCancelled.current = true;
              cancelUpload();
            }}
          />
          <div className="text-gray-800 dark:text-gray-200 text-sm lg:text-xl font-semibold mb-2">
            {Math.floor(progress)} %
          </div>
          <div className="text-red-500  text-xs">
            *Please do not close or refresh this page.
          </div>
        </div>
      </OverlayWrapper>
    );
  const handleSubmit = async () => {
    let successUpload = false;
    try {
      setLoading(true);

      const { promise, cancel } = await uploadFilesBatch(
        files,
        "Attachments",
        id,
        setProgress,
        "tasks",
      );

      setCancelUpload(() => cancel);

      const results = await promise;
      const success: fileMetadata[] = [];
      const failed = [];
      for (const res of results) {
        if (res.status === "fulfilled") {
          success.push(res.value);
        } else {
          failed.push(res.reason);
        }
      }
      if (failed.length > 0) {
        const wasCancelled = results.some(
          (r) => r.status === "rejected" && r.reason === "Upload cancelled",
        );
        if (success.length > 0) {
          await deleteAttachments(success);
        }
        if (wasCancelled || isCancelled.current) {
          toast.dismiss();
          toast.error("Upload cancelled");
          return;
        }
        throw new Error("Upload failed");
      }
      await createAttachments.mutateAsync(success);
      successUpload = true;
    } catch {
      toast.dismiss();
      if (isCancelled) {
        toast.error("Upload cancelled");
      } else {
        toast.error("Failed to upload attachments");
      }
    } finally {
      setLoading(false);
      isCancelled.current = false;
      setProgress(0);
      if (successUpload || isCancelled) {
        setFiles([]);
        setShow(false);
      }
    }
  };
  return (
    <>
      <OverlayWrapper active={show} addOns="w-sm lg:w-md">
        <div className="text-gray-900 dark:text-gray-100 mb-1 text-xl lg:text-2xl flex items-center gap-2 justify-center font-semibold">
          <PlusFileSvg />
          Attach Files
        </div>
        <div className="max-h-50 overflow-y-auto thinScrollbar">
          {files.map((f: fileMeta, i: number) => (
            <Card key={i} data={f} setFile={setFiles} />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            className="bg-red-500  w-15 rounded-md flex items-center justify-center h-10 font-semibold text-white cursor-pointer   text-base lg:text-lg mt-3 relative group"
            onClick={() => {
              setShowWarning(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-4 lg:size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
            <Toolbar top="-top-8">Discard All</Toolbar>
          </button>
          <button
            disabled={files.length === 0 || loading}
            className="bg-blue-500  w-full rounded-md flex items-center justify-center h-10 font-semibold text-white cursor-pointer  disabled:cursor-not-allowed disabled:pointer-events-none disabled:bg-gray-300 disabled:dark:bg-gray-600 text-base lg:text-lg mt-3"
            onClick={handleSubmit}
          >
            Attach
          </button>
        </div>
      </OverlayWrapper>

      <OverlayWrapper active={showWarning} addOns="lg:w-sm">
        <div className="text-base lg:text-lg text-gray-700 dark:text-gray-200 flex flex-wrap max-w-sm lg:max-w-md ">
          Are you sure about discarding ?
        </div>
        <div className="flex items-center justify-end gap-2 lg:gap-3 mt-5">
          <button
            className={`px-2 lg:px-3 py-[1.5px] lg:py-[3px]  cursor-pointer rounded-md text-sm lg:text-base font-semibold hover:bg-gray-200 dark:hover:bg-blk6 text-gray-700 dark:text-gray-200 border-2 border-gray-400 dark:border-gray-600`}
            onClick={() => setShowWarning(false)}
          >
            cancel
          </button>
          <button
            className={`px-2 lg:px-3 py-0.5 lg:py-1 cursor-pointer rounded-md text-sm lg:text-base font-semibold  text-white bg-red-500 hover:bg-red-400`}
            onClick={() => {
              setShowWarning(false);
              setShow(false);
              setFiles([]);
            }}
          >
            Discard
          </button>
        </div>
      </OverlayWrapper>
    </>
  );
}

function Card({
  data,
  setFile,
}: {
  data: fileMeta;
  setFile: Dispatch<SetStateAction<fileMeta[]>>;
}) {
  const file = data.file;
  const svg = useMemo(
    () =>
      mediaSvg(file.type, file.name.split(".").pop(), "w-5 h-5 md:w-6 md:h-6"),
    [file],
  );
  return (
    <FlexBtwWrapper addOns="pr-8 mt-2">
      <div className="flex items-center gap-1 ">
        <div className="px-1.5 py-1.5 bg-gray-200 dark:bg-blk5 rounded-md">
          {svg}
        </div>
        <div>
          <div className="text-sm md:text-base  text-gray-800 dark:text-gray-200">
            {truncateFileName(file.name)}
          </div>
          <div className="text-xs  text-gray-500">
            {DataFormatter(file.size)}
          </div>
        </div>
      </div>
      <button
        className="bg-red-500  w-8 h-8 rounded-md flex items-center justify-center shrink-0  font-semibold text-white cursor-pointer relative group "
        onClick={() => {
          setFile((prev) => prev.filter((p: fileMeta) => p.id !== data.id));
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-3 lg:size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
          />
        </svg>
        <Toolbar top="-top-8">Discard</Toolbar>
      </button>
    </FlexBtwWrapper>
  );
}
