import { useTheme } from "next-themes";
import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import FlexBtwWrapper from "../wrappers/FlexBtwWrapper";
import MainBtn from "../btns/MainBtn";
import Xbtn from "../btns/Xbtn";
import { taskCommentProps } from "../../app/interfaces";

export default function DeleteSelected({
  selectedComments,
  setSelectedComments,
  setComments,
  isDeletingRef,
}: {
  selectedComments: string[];
  setSelectedComments: Dispatch<SetStateAction<string[]>>;
  setComments: Dispatch<SetStateAction<taskCommentProps[]>>;
  isDeletingRef: RefObject<boolean>;
}) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return;
  const handleSelectedDelete = () => {
    isDeletingRef.current = true;
    setComments((prev) =>
      prev.filter((c: taskCommentProps) => !selectedComments.includes(c.id))
    );
    setTimeout(() => {
      isDeletingRef.current = false;
    }, 0);
    setSelectedComments([]);
  };
  return (
    <FlexBtwWrapper addOns="shrink-0 h-13  px-5 border-b-2 border-gray-300 dark:border-gray-700  rounded-t-xl">
      <div className="flex items-center">
        <div className="text-gray-500 lg:pr-2 pr-1">
          {resolvedTheme === "dark" ? (
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
        <div className="lg:px-3 px-2 py-1.5 lg:py-2">
          {" "}
          <MainBtn
            onClick={() => {
              handleSelectedDelete();
            }}
            addOns="px-3 py-1"
          >
            Delete {selectedComments.length}
          </MainBtn>
        </div>
      </div>
      <Xbtn
        addOns="hover:bg-gray-300 dark:hover:bg-blk6 p-1 rounded-full"
        size="size-5 lg:size-6"
        onClick={() => {
          setSelectedComments([]);
        }}
      />
    </FlexBtwWrapper>
  );
}
