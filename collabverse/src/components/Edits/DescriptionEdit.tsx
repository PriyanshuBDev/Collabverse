import useIsDark from "@/lib/hooks/useIsDark";
import { EditBtnOverview } from "../btns/EditBtnOverview";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { useAutoResizeTextArea } from "@/lib/hooks/useAutoResizeTextArea";

export default function DescriptionEdit({
  editedDesc,
  setEditedDesc,
  editMode,
  desc,
}: {
  editedDesc: string | undefined;
  setEditedDesc: Dispatch<SetStateAction<string | undefined>>;
  editMode: boolean;
  desc: string | undefined;
}) {
  const isDark = useIsDark();
  const [readMore, setReadMore] = useState(false);
  const descriptionRef = useRef<HTMLTextAreaElement>(null);
  const [showDescriptionEdit, setShowDescriptionEdit] = useState(false);
  useAutoResizeTextArea(descriptionRef, showDescriptionEdit, editedDesc);
  useEffect(() => {
    if (!editMode) {
      setShowDescriptionEdit(false);
    }
  }, [editMode]);
  return (
    <div className="px-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-semibold text-xs lg:text-base mb-1">
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 lg:size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
                clipRule="evenodd"
              />
              <path d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z" />
            </svg>
          ) : (
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
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          )}
          Description
        </div>
        {editMode && (
          <EditBtnOverview
            onClick={() => {
              setShowDescriptionEdit((prev) => !prev);
              setTimeout(() => {
                const el = descriptionRef.current;
                if (el) {
                  el.focus();
                  const len = el.value.length;
                  el.selectionStart = len;
                  el.selectionEnd = len;
                }
              }, 0);
            }}
            onStop={() => {
              setShowDescriptionEdit(false);
              setEditedDesc(desc);
            }}
            addons="px-1 py-1"
          />
        )}
      </div>

      <div className="rounded-lg bg-gray-100 dark:bg-blk4 p-3 text-gray-600 dark:text-gray-400 text-xs md:text-base cursor-pointer break-words overflow-wrap-anywhere mx-2">
        {showDescriptionEdit ? (
          <textarea
            ref={descriptionRef}
            maxLength={1000}
            value={editedDesc}
            placeholder="Enter new project description"
            onChange={(e) => {
              setEditedDesc(e.target.value);
              const target = e.target;
              target.style.height = "auto"; // reset height
              target.style.height = target.scrollHeight + "px";
            }}
            className="resize-none overflow-hidden w-full  focus:outline-none placeholder:font-semibold bg-transparent"
          />
        ) : desc ? (
          desc?.length > 200 ? (
            <div>
              {readMore ? desc : `${desc?.slice(0, 200)}...`}
              <div
                className="flex justify-end hover:underline "
                onClick={() => {
                  setReadMore((prev) => !prev);
                }}
              >
                {readMore ? "Read Less" : "Read More"}
              </div>
            </div>
          ) : (
            desc
          )
        ) : (
          <span className="text-gray-400 dark:text-gray-600">
            No description
          </span>
        )}
      </div>
    </div>
  );
}
