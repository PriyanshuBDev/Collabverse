import {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { attachmentProps } from "../../../../app/interfaces";
import { format } from "date-fns";
import { DataFormatter } from "@/lib/functions/download/DataFormatter";
import FlexBtwWrapper from "../../../wrappers/FlexBtwWrapper";
import Image from "next/image";
import getInitials from "@/lib/functions/user/getInitials";
import { mediaSvg } from "@/components/svg/mediaSvg";
import gradientBgFromName from "@/lib/functions/colors/gradientBgFromName";
import DownloadBtn from "@/components/btns/download/DownloadBtn";
import { truncateFileName } from "@/lib/functions/task/attachment/turncateFileName";
import AttachmentDeleteWarning from "@/components/warnings/AttachmentDeleteWarning";
import { useTaskAttachments } from "@/lib/queries/workspace/project/task/attachments/useTaskAttachments";
import { useTaskAttachmentUrl } from "@/lib/queries/workspace/project/task/attachments/useTaskAttachmentUrl";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";
import useCurrentUser from "@/lib/hooks/useCurrentUser";

export default function AttachmentCard({
  attachment,
  show,
  setShow,
}: {
  attachment: attachmentProps;
  show: string[];
  setShow: Dispatch<SetStateAction<string[]>>;
}) {
  const { id: currentUserId } = useCurrentUser();
  const { deleteAttachment } = useTaskAttachments();
  const { refetch } = useTaskAttachmentUrl(attachment.id);
  const [showWarning, setShowWarning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState("0px");
  const setUserId = useShowUserStore.getState().setUserId;
  useEffect(() => {
    if (ref.current) {
      if (show.includes(attachment.id)) {
        const scrollHeight = ref.current.scrollHeight;
        setHeight(scrollHeight + "px"); // expand smoothly
      } else {
        setHeight("0px"); // collapse smoothly
      }
    }
  }, [show, attachment]);
  const svg = useMemo(
    () => mediaSvg(attachment.type, attachment.format, "w-5 h-5 md:w-6 md:h-6"),
    [attachment.type, attachment.format],
  );
  const handleSignedUrl = async () => {
    const { data } = await refetch();
    return data?.url;
  };
  return (
    <div>
      <FlexBtwWrapper addOns="pr-8 mt-2">
        <div className="flex items-center gap-1 ">
          <div
            className="cursor-pointer text-gray-600 dark:text-gray-400"
            onClick={() =>
              setShow((prev: string[]) =>
                prev.includes(attachment.id)
                  ? prev.filter((i: string) => i !== attachment.id)
                  : [...prev, attachment.id],
              )
            }
          >
            <svg
              className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300  ${
                show.includes(attachment.id) ? "rotate-180" : "rotate-0"
              }`}
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M18.425 10.271C19.499 8.967 18.57 7 16.88 7H7.12c-1.69 0-2.618 1.967-1.544 3.271l4.881 5.927a2 2 0 0 0 3.088 0l4.88-5.927Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="px-1.5 py-1.5 bg-gray-200 dark:bg-blk5 rounded-md">
            {svg}
          </div>
          <div>
            <div className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-200">
              {truncateFileName(attachment.originalName)}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs  text-gray-500">
                {format(attachment.createdAt, "hh:mm a")}
              </div>
              <div className="bg-gray-500 dark:bg-gray-600 w-[1px] h-3"></div>
              <div className="text-xs  text-gray-500">
                {DataFormatter(attachment.size)}
              </div>
            </div>
          </div>
        </div>
        <DownloadBtn handleSignedUrl={handleSignedUrl}></DownloadBtn>
      </FlexBtwWrapper>
      <div
        ref={ref}
        style={{
          maxHeight: height,
          opacity: show ? 1 : 0,
          transform: show
            ? "translateY(0) scale(1)"
            : "translateY(-10px) scale(0.98)",
          transition: "all 0.3s ease",
          overflow: "hidden",
        }}
      >
        <div
          className={`mx-2 lg:mx-4 mt-2 lg:mt-3 p-3 rounded-lg bg-gray-100 dark:bg-blk4 text-gray-600 dark:text-gray-400 text-xs md:text-base cursor-pointer break-words overflow-wrap-anywhere  transition-all duration-300 `}
        >
          {attachment.originalName.length > 25 && (
            <>
              <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">
                Full Name:
              </div>
              <div className="text-gray-800 dark:text-gray-200 text-xs md:text-sm">
                {attachment.originalName}
              </div>
            </>
          )}
          <div className="text-gray-600 dark:text-gray-400 text-xs md:text-sm mt-1">
            Attached By:
          </div>
          <div className={`mt-1 flex items-center gap-1`}>
            <div
              className="w-fit cursor-pointer"
              onClick={() => {
                if (
                  attachment.attachedBy.id &&
                  attachment.attachedBy.id !== currentUserId
                ) {
                  setUserId(attachment.attachedBy.id);
                }
              }}
            >
              {attachment.attachedBy.avatar ? (
                <div
                  className="relative w-4 h-4 lg:h-5 lg:w-5 rounded-full overflow-hidden cursor-pointer border-gray-200 dark:border-gray-800"
                  onClick={() => {}}
                >
                  <Image
                    alt={"UserAvatar"}
                    src={attachment.attachedBy.avatar}
                    className="object-center object-cover"
                    fill
                  ></Image>
                </div>
              ) : (
                <div
                  className={`w-4 h-4 lg:h-5 lg:w-5 rounded-full flex justify-center items-center cursor-pointer `}
                  style={{
                    background: gradientBgFromName(attachment.attachedBy.name),
                  }}
                  onClick={() => {}}
                >
                  <div className="font-semibold text-xs text-white">
                    {getInitials(attachment.attachedBy.name)}
                  </div>
                </div>
              )}
            </div>
            <div
              className="text-gray-800 dark:text-gray-200 text-xs md:text-sm font-semibold hover:underline cursor-pointer"
              onClick={() => {
                if (
                  attachment.attachedBy.id &&
                  attachment.attachedBy.id !== currentUserId
                ) {
                  setUserId(attachment.attachedBy.id);
                }
              }}
            >
              {attachment.attachedBy.name}
            </div>
          </div>
          <div className="flex items-center justify-center mt-2">
            <button
              className={`px-2 lg:px-3 py-0.5  rounded-md text-sm lg:text-base font-semibold text-white bg-red-500 hover:bg-red-400 cursor-pointer`}
              onClick={() => {
                setShowWarning(true);
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <AttachmentDeleteWarning
          show={showWarning}
          setShow={setShowWarning}
          name={attachment.originalName}
          handleDeleting={() => {
            deleteAttachment.mutate(attachment.id);
            setShowWarning(false);
          }}
        />
      </div>
    </div>
  );
}
