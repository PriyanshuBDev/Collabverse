import {
  Dispatch,
  RefObject,
  SetStateAction,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  commentReactionProps,
  commentReplyProps,
  CompleteCommentProps,
} from "../../app/interfaces";
import htmlToText from "@/lib/functions/chat/htmlToText";
import customColorFromName from "@/lib/functions/colors/customColorFromName";
import { createPortal } from "react-dom";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
import { handleContextMenu } from "@/lib/functions/chat/handleContextMenu";
import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCommentStore } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import CommentDeleting from "../warnings/CommentDeleting";
export interface PositionProps {
  x: number;
  y: number;
}
export default function Bubble({
  comment,
  handleScrollTo,
  jumpToComment,
  setReply,
  isDeletingRef,
  deleteComment,
}: {
  comment: CompleteCommentProps;
  jumpToComment: (targetId: string) => void;
  handleScrollTo: (targetId: string) => void;
  setSelectedComments?: Dispatch<SetStateAction<string[]>>;
  setReply: Dispatch<SetStateAction<commentReplyProps | null>>;
  isDeletingRef?: RefObject<boolean>;
  deleteComment: () => void;
}) {
  const { id: taskId } = useCurrentTask();
  const { id: currentUserId } = useCurrentUser();
  const [menuPos, setMenuPos] = useState<PositionProps | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const { setUserId } = useShowUserStore();
  const [showWarning, setShowWarning] = useState(false);
  const closeMenu = () => {
    setMenuPos(null);
  };

  useClickOutSide([menuRef], () => closeMenu());

  function positionMenu(
    clickX: number,
    clickY: number,
    menuW: number,
    menuH: number,
  ) {
    let x = clickX;
    let y = clickY;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    if (x + menuW > viewportW) {
      x -= menuW;
    }

    if (y + menuH > viewportH) {
      y -= menuH;
    }

    x = Math.max(0, Math.min(x, viewportW - menuW));
    y = Math.max(0, Math.min(y, viewportH - menuH));
    return { x, y };
  }

  useEffect(() => {
    if (!menuPos || !menuRef.current) return;
    const menuW = menuRef.current.offsetWidth;
    const menuH = menuRef.current.offsetHeight;

    const { x, y } = positionMenu(menuPos.x, menuPos.y, menuW, menuH);
    if (x !== menuPos.x || y !== menuPos.y) setMenuPos({ x, y });
  }, [menuPos]);
  const parsedHtml = useMemo(
    () => ({
      __html: getSafeHtml(comment.comment),
    }),
    [comment.comment],
  );

  const handleDelete = () => {
    if (isDeletingRef !== undefined) {
      isDeletingRef.current = true;
      deleteComment();
      setTimeout(() => {
        isDeletingRef.current = false;
      }, 200);
    }
  };
  const handleMentionClick = (e: React.MouseEvent) => {
    const el = e.target as HTMLElement;
    const id = el.getAttribute("data-id");

    if (id) {
      setUserId(id);
    }
  };

  const isYou = () => {
    return comment.replyTo?.commentedBy.id === currentUserId
      ? "You"
      : comment.replyTo?.commentedBy.name;
  };
  const reactions = comment.reactions ?? [];
  return (
    <>
      <div
        className={` transform duration-300 max-w-68 rounded-lg rounded-tl-none p-3 bg-gray-100 dark:bg-blk5  text-gray-600 dark:text-gray-400 text-xs md:text-sm  break-words overflow-wrap-anywhere `}
        onContextMenu={(e) => handleContextMenu(e, setMenuPos, menuPos)}
      >
        {comment.replyTo && (
          <div
            className={` rounded-lg border-l-4 border-2 px-1 py-0.5 cursor-pointer ${customColorFromName(
              comment.replyTo.commentedBy.name,
              "border",
            )} `}
            onClick={() => {
              const replyComment =
                useCommentStore.getState().tasks[taskId].commentsMap[
                  comment.replyTo!.commentId!
                ];
              if (replyComment) {
                handleScrollTo(replyComment.id);
              } else {
                jumpToComment(comment.replyTo!.commentId);
              }
            }}
          >
            <div
              className={`text-xs md:text-sm font-semibold ${customColorFromName(
                comment.replyTo.commentedBy.name,
                "text",
              )}`}
            >
              {isYou()}
            </div>
            <div className="text-xs break-words overflow-wrap-anywhere text-ellipsis line-clamp-1">
              <span>{htmlToText(comment.replyTo.comment)}</span>
            </div>
          </div>
        )}
        {
          <div
            className="prose dark:prose-invert"
            onClick={handleMentionClick}
            dangerouslySetInnerHTML={parsedHtml}
          />
        }
        {reactions && (
          <div className="flex items-center flex-wrap gap-1 max-w-60">
            {reactions.map((r: commentReactionProps, idx: number) => (
              <div
                key={idx}
                className="bg-gray-300 dark:bg-blk7 flex items-center gap-1 px-1 py-0.5 rounded-full mt-2 "
              >
                <div className="text-xs">{r.emoji}</div>
                <div className="text-gray-700 dark:text-gray-300 text-xs">
                  {r.reactedBy.length}
                </div>
              </div>
            ))}
          </div>
        )}
        {menuPos &&
          createPortal(
            <>
              <div
                className="fixed inset-0 z-[998]"
                style={{ pointerEvents: "auto" }}
                onClick={() => setMenuPos(null)} // click anywhere closes menu
              />
              <div
                ref={menuRef}
                className="fixed bg-gray-200 dark:bg-blk6 shadow-lg rounded-md p-2 w-34 lg:w-44 text-gray-800 dark:text-gray-200 lg:text-base text-sm z-999"
                style={{
                  left: menuPos.x,
                  top: menuPos.y,
                  pointerEvents: "auto",
                }}
              >
                <ul>
                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => {
                      setReply({
                        comment: comment.comment,
                        commentId: comment.id,
                        commentedBy: comment.user,
                      });
                      closeMenu();
                    }}
                  >
                    <svg
                      className="w-4 h-4 lg:w-5 lg:h-5"
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
                        strokeWidth="1.7"
                        d="M14.5 8.046H11V6.119c0-.921-.9-1.446-1.524-.894l-5.108 4.49a1.2 1.2 0 0 0 0 1.739l5.108 4.49c.624.556 1.524.027 1.524-.893v-1.928h2a3.023 3.023 0 0 1 3 3.046V19a5.593 5.593 0 0 0-1.5-10.954Z"
                      />
                    </svg>
                    Reply
                  </li>

                  <li
                    className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        htmlToText(comment.comment),
                      );
                      closeMenu();
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
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75"
                      />
                    </svg>
                    Copy Text
                  </li>

                  {comment.user.id === currentUserId && (
                    <li
                      className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
                      onClick={() => setShowWarning(true)}
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
                      Delete
                    </li>
                  )}
                </ul>
              </div>
            </>,
            document.body,
          )}
      </div>

      {showWarning &&
        createPortal(
          <CommentDeleting
            setShowWarning={setShowWarning}
            showWarning={showWarning}
            handleDelete={handleDelete}
          />,
          document.body,
        )}
    </>
  );
}
