import {
  useEditor,
  EditorContent,
  ReactRenderer,
  type ReactRenderer as ReactRendererType,
} from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Mention from "@tiptap/extension-mention";
import tippy, { type Instance, type Props } from "tippy.js";
import "tippy.js/dist/tippy.css";
import {
  commentDataForApi,
  commentReplyProps,
  memberProps,
} from "../../app/interfaces";
import CharacterCount from "@tiptap/extension-character-count";
import { Plugin } from "@tiptap/pm/state";
import Placeholder from "@tiptap/extension-placeholder";
import { SetStateAction, useState, Dispatch, useRef } from "react";
import { EmojiPicker } from "frimousse";
import customColorFromName from "@/lib/functions/colors/customColorFromName";
import MentionList from "./MentionBox";
import htmlToText from "@/lib/functions/chat/htmlToText";
import type { Node as ProseMirrorNode } from "@tiptap/pm/model";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import useMounted from "@/lib/hooks/useMounted";
import useIsDark from "@/lib/hooks/useIsDark";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCommentStore } from "@/lib/hooks/zustand/Comments/useTaskCommentStore";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
import { useUserProfile } from "@/lib/queries/user/useUserProfile";
import { useCommentMutation } from "@/lib/queries/workspace/project/task/comment/useCommentMutation";
import { useTaskRole } from "@/lib/queries/workspace/project/task/comment/useTaskRole";
interface EditorNode {
  type?: string;
  attrs?: Record<string, string>;
  content?: EditorNode[];
  text?: string;
}
export default function InputEditor({
  users,
  reply,
  setReply,
  scrollToBottom,
}: {
  users: memberProps[];
  reply?: commentReplyProps | null;
  setReply: Dispatch<SetStateAction<commentReplyProps | null>>;
  scrollToBottom: () => void;
}) {
  const LIMIT = 500;
  const { id: currentUserId } = useCurrentUser();
  const { user: currentUserData } = useUserProfile();
  const { id: taskId } = useCurrentTask();
  const { data } = useTaskRole();
  const filteredUsers = users.filter(
    (u: memberProps) => u.id !== currentUserId,
  );
  const CustomMention = Mention.extend({
    addAttributes() {
      return {
        id: { default: null },
        name: { default: null },
        avatar: { default: null },
        userName: { default: null },
      };
    },

    renderHTML({ node }: { node: ProseMirrorNode }) {
      return [
        "span",
        {
          class: "mention text-blue-500 font-medium cursor-pointer",
          "data-id": node.attrs.id,
          "data-name": node.attrs.name,
          "data-avatar": node.attrs.avatar,
          "data-username": node.attrs.userName,
        },
        `${node.attrs.userName}`,
      ];
    },

    renderText({ node }: { node: ProseMirrorNode }) {
      return `@${node.attrs.userName}`;
    },
  });
  const limitPlugin = new Plugin({
    filterTransaction(transaction) {
      if (!transaction.docChanged) return true;

      const newDoc = transaction.doc;
      return newDoc.textContent.length <= LIMIT;
    },
  });
  const editor = useEditor({
    extensions: [
      StarterKit,
      CharacterCount.configure({
        limit: LIMIT,
      }),
      CustomMention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          char: "@",
          items: ({ query }) => {
            return filteredUsers.filter((user: memberProps) =>
              user.name.toLowerCase().includes(query.toLowerCase()),
            );
          },
          render: () => {
            let popup: Instance<Props> | null = null;
            let component: ReactRendererType | null = null;

            return {
              onStart: (props) => {
                component = new ReactRenderer(MentionList, {
                  props,
                  editor: props.editor,
                });

                popup = tippy(document.body, {
                  getReferenceClientRect: props.clientRect
                    ? () => props.clientRect!() ?? new DOMRect()
                    : undefined,
                  appendTo: () => document.body,
                  content: component.element,
                  showOnCreate: true,
                  interactive: true,
                  trigger: "manual",
                  arrow: false,
                  offset: [0, 6],
                  theme: "none",
                  placement: "top-start",
                });
              },
              onUpdate(props) {
                component?.updateProps(props);
                if (props.clientRect) {
                  const rect = props.clientRect();
                  if (rect) {
                    popup?.setProps({
                      getReferenceClientRect: () => rect,
                    });
                  } else popup?.hide();
                } else popup?.hide();
              },
              onExit() {
                popup?.destroy();
                component?.destroy();
              },
            };
          },
        },
      }),
      Placeholder.configure({
        placeholder: "Enter text here",
      }),
    ],
    editorProps: {
      handleTextInput(view, from, to, text) {
        const current = view.state.doc.textContent.length;
        return current + text.length > LIMIT;
      },

      handlePaste(view, event) {
        const pasted = event.clipboardData?.getData("text") ?? "";
        const current = view.state.doc.textContent.length;

        if (current + pasted.length > LIMIT) {
          event.preventDefault();
          return true;
        }

        return false;
      },
    },
    onCreate({ editor }) {
      editor.registerPlugin(limitPlugin);
    },
    content: "",
    immediatelyRender: false,
  });
  const menuRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const isDark = useIsDark();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiBtnRef = useRef<HTMLDivElement>(null);
  const { sendComment } = useCommentMutation();
  useClickOutSide([emojiBtnRef, menuRef], () => {
    setShowEmojiPicker(false);
  });
  if (!mounted) {
    return null;
  }
  const handleEmojiSelect = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  const handleSend = async () => {
    if (!editor) return;

    const comment = editor?.isEmpty
      ? undefined
      : getSafeHtml(editor?.getHTML());
    if (!comment) return;
    const json = editor?.getJSON();
    if (editor.isEmpty) return;
    const mentions = new Set<string>();
    function handleMentions(node: EditorNode | undefined) {
      if (!node) return;
      if (node.type === "mention") {
        if (node.attrs?.id) {
          mentions.add(node.attrs.id);
        }
      }
      if (node.content && Array.isArray(node.content)) {
        node.content.forEach((child: EditorNode) => handleMentions(child));
      }
    }

    handleMentions(json);
    const addCommentRT = useCommentStore.getState().addCommentRT;
    const clientId = crypto.randomUUID();
    const date = new Date();
    addCommentRT(
      taskId,
      {
        id: clientId,
        comment,
        createdAt: date,
        sentAt: date,
        user: {
          id: currentUserId,
          name: currentUserData?.name ?? "unknown",
          avatar: currentUserData?.avatar,
        },
        isReadByMe: true,
        reactions: [],
        replyTo: reply ?? undefined,
      },
      currentUserId,
    );
    const commentForApi: commentDataForApi = {
      clientId,
      comment,
      replyToCommentId: reply?.commentId ?? null,
      createdAt: date,
      mentions: [...mentions],
    };

    setReply(null);
    editor.commands.clearContent(); // clear after sending
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scrollToBottom?.();
      });
    });
    await sendComment.mutateAsync({ comment: commentForApi, clientId });
  };

  if (!data || (data.role !== "Assignee" && data.role !== "Reviewer"))
    return null;
  return (
    <div>
      {
        <div
          className={`transition-all duration-300 rounded-t-lg border border-gray-300  flex items-center justify-between gap-2 bg-gray-50 dark:bg-blk6 dark:border-gray-600 ${
            reply
              ? "opacity-100 pl-3 pr-3 py-1 max-h-[100px]"
              : "opacity-0 h-0 pointer-events-none"
          }`}
        >
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-gray-500">
              {isDark ? (
                <svg
                  className="w-4 h-4 lg:w-5 lg:h-5 "
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.502 7.046h-2.5v-.928a2.122 2.122 0 0 0-1.199-1.954 1.827 1.827 0 0 0-1.984.311L3.71 8.965a2.2 2.2 0 0 0 0 3.24L8.82 16.7a1.829 1.829 0 0 0 1.985.31 2.121 2.121 0 0 0 1.199-1.959v-.928h1a2.025 2.025 0 0 1 1.999 2.047V19a1 1 0 0 0 1.275.961 6.59 6.59 0 0 0 4.662-7.22 6.593 6.593 0 0 0-6.437-5.695Z" />
                </svg>
              ) : (
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
              )}
            </div>
            {reply && (
              <div>
                <div
                  className={`text-xs md:text-sm font-semibold ${customColorFromName(
                    reply.commentedBy.name,
                    "text",
                  )}`}
                >
                  {reply.commentedBy.name}
                </div>
                <div className="text-sm break-words overflow-wrap-anywhere line-clamp-1 text-ellipsis">
                  {htmlToText(reply!.comment)}
                </div>
              </div>
            )}
          </div>
          <div
            className="text-gray-500 cursor-pointer"
            onClick={() => setReply(null)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-4 lg:size-5"
            >
              <path
                fillRule="evenodd"
                d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      }
      <div
        className={`relative border border-gray-300 bg-gray-50 dark:bg-blk5
              dark:border-gray-600  
        ${reply ? "rounded-b-lg" : "rounded-lg"}`}
      >
        <div
          ref={emojiBtnRef}
          className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-500 cursor-pointer"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          {isDark ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="size-6"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-2.625 6c-.54 0-.828.419-.936.634a1.96 1.96 0 0 0-.189.866c0 .298.059.605.189.866.108.215.395.634.936.634.54 0 .828-.419.936-.634.13-.26.189-.568.189-.866 0-.298-.059-.605-.189-.866-.108-.215-.395-.634-.936-.634Zm4.314.634c.108-.215.395-.634.936-.634.54 0 .828.419.936.634.13.26.189.568.189.866 0 .298-.059.605-.189.866-.108.215-.395.634-.936.634-.54 0-.828-.419-.936-.634a1.96 1.96 0 0 1-.189-.866c0-.298.059-.605.189-.866Zm2.023 6.828a.75.75 0 1 0-1.06-1.06 3.75 3.75 0 0 1-5.304 0 .75.75 0 0 0-1.06 1.06 5.25 5.25 0 0 0 7.424 0Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
              />
            </svg>
          )}
        </div>
        <div className=" p-2 ">
          <EditorContent
            editor={editor}
            className={` tiptap max-h-[100px] px-9 py-1 text-sm placeholder:text-gray-400 dark:placeholder-gray-400 focus:outline-none text-gray-900 dark:text-white overflow-y-auto scrollbar-none`}
          />
        </div>
        <button
          type="submit"
          className=" absolute inset-y-0 end-0 pe-3 cursor-pointer dark:text-gray-500 text-gray-600"
          onClick={handleSend}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5 lg:size-6"
          >
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>

        <div
          ref={menuRef}
          className={`absolute bottom-12 left-0 z-50 origin-bottom-right rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-blk3 shadow-lg p-2 transition-all duration-200 ease-out transform ${
            showEmojiPicker
              ? "opacity-100 scale-100 pointer-events-auto visible"
              : "opacity-0 scale-95 pointer-events-none invisible"
          }`}
        >
          <EmojiPicker.Root
            className="fri-picker"
            onEmojiSelect={({ emoji }) => handleEmojiSelect(emoji)}
          >
            <EmojiPicker.Search className="w-full p-1 rounded-md border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-blk7 text-sm outline-none cursor-pointer" />
            <EmojiPicker.Viewport className="max-h-56 overflow-y-auto mt-2 custom-scrollbar ">
              <style jsx global>{`
                .fri-picker * {
                  cursor: pointer !important;
                }
              `}</style>
              <EmojiPicker.List className="gap-1 text-lg " />
            </EmojiPicker.Viewport>
          </EmojiPicker.Root>
        </div>
      </div>
    </div>
  );
}
