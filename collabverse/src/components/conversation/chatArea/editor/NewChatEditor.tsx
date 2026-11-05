"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "tippy.js/dist/tippy.css";
import {
  chatReplyProps,
  msgDataForApi,
  rawChatProps,
} from "../../../../app/interfaces";
import Placeholder from "@tiptap/extension-placeholder";
import { SetStateAction, useEffect, useState, Dispatch, useRef } from "react";
import { EmojiPicker } from "frimousse";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import useIsDark from "@/lib/hooks/useIsDark";
import useMounted from "@/lib/hooks/useMounted";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { getSafeHtml } from "@/lib/functions/chat/getSafeHtml";
import GetReplyMsg from "../bubble/GetReplyMsg";
import { ReplySvg } from "@/components/svg/ReplySvg";
import { MessageType } from "@prisma/client";
import { useUserProfile } from "@/lib/queries/user/useUserProfile";
import { useSendMessages } from "@/lib/queries/workspace/conversation/messages/useSendMessages";
import { handleSendingMsgs } from "@/lib/functions/chat/handleSendingMsgs";
import MediaFinalize from "../bubble/media/MediaFinalize";
import DocsFinalize from "../bubble/media/DocsFinalize";
import MediaPicker from "../bubble/media/MediaPicker";
import DocsPicker from "../bubble/media/DocsPicker";
import { createNewDm } from "@/lib/axios/workspace/conversation/dm/new/createNewDm";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";

interface EditorNode {
  type?: string;
  attrs?: Record<string, string>;
  content?: EditorNode[];
  text?: string;
}
interface props {
  reply?: chatReplyProps | null;
  setReply: Dispatch<SetStateAction<chatReplyProps | null>>;
  canSendFiles: boolean;
  userId: string;
  setConvoId: Dispatch<SetStateAction<string | null>>;
  setSpinner: Dispatch<SetStateAction<boolean>>;
}
export default function NewChatEditor({
  reply,
  setReply,
  canSendFiles,
  userId,
  setConvoId,
  setSpinner,
}: props) {
  const { id: currentUserId } = useCurrentUser();
  const { user: currentUserData } = useUserProfile();
  const { id: workspaceId } = useCurrentWorkspace();
  let conversationId = "";
  const { mutateAsync } = useSendMessages(conversationId);
  const editor = useEditor({
    extensions: [
      StarterKit,

      Placeholder.configure({
        placeholder: "Enter text here",
      }),
    ],

    content: "",
    immediatelyRender: false,
  });
  const emojiMenuRef = useRef<HTMLDivElement>(null);
  const mounted = useMounted();
  const [showLinks, setShowLinks] = useState(false);
  const [showMedia, setShowMedia] = useState(false);
  const [showDoc, setShowDoc] = useState(false);
  const [fileType, setFileType] = useState("");
  const linksBtnRef = useRef<HTMLDivElement>(null);
  const linksMenuRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiBtnRef = useRef<HTMLDivElement>(null);
  const isDark = useIsDark();
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);
  useClickOutSide([emojiBtnRef, emojiMenuRef], () => setShowEmojiPicker(false));
  useClickOutSide([linksBtnRef, linksMenuRef], () => setShowLinks(false));
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [msgType, setmsgType] = useState<MessageType>("text");

  useEffect(() => {
    if (!canSendFiles) return;
    if (selectedFiles.length > 0) {
      if (fileType === "photo/video") {
        setShowMedia(true);
      }
      if (fileType === "doc") {
        setShowDoc(true);
      }
      setShowLinks(false);
    } else {
      setShowMedia(false);
      setShowDoc(false);
    }
  }, [selectedFiles, fileType, showDoc, canSendFiles]);
  const handleEmojiSelect = (emoji: string) => {
    if (!editor) return;
    editor.chain().focus().insertContent(emoji).run();
  };

  const handleSend = async () => {
    if (!editor) return;
    setSpinner(true);
    const message = getSafeHtml(editor.getHTML());
    const json = editor.getJSON();
    if (editor.isEmpty && (!selectedFiles || selectedFiles.length === 0))
      return;
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
    conversationId = (await createNewDm({ workspaceId, userId }))
      .conversationId;

    const msgs: rawChatProps[] = [];
    if (msgType === "document" || msgType === "audio") {
      for (const file of selectedFiles) {
        msgs.push({
          id: crypto.randomUUID(),
          type: msgType,
          message,
          createdAt: new Date(),
          user: {
            id: currentUserId,
            name: currentUserData?.name ?? "unknown",
            avatar: currentUserData?.avatar,
          },
          replyTo: reply ?? undefined,
          media: [file],
          mentions: [...mentions],
        });
      }
    } else {
      msgs.push({
        id: crypto.randomUUID(),
        type: selectedFiles.length > 0 ? msgType : "text",
        message,
        createdAt: new Date(),
        user: {
          id: currentUserId,
          name: currentUserData?.name ?? "unknown",
          avatar: currentUserData?.avatar,
        },
        media: selectedFiles,
        mentions: [...mentions],
        replyTo: reply ?? undefined,
      });
    }
    const mutationFunction = async (msg: msgDataForApi, clientId: string) =>
      await mutateAsync({ msg, clientId });
    handleSendingMsgs(msgs, mutationFunction, conversationId, currentUserId);
    setReply(null);
    editor.commands.clearContent();
    setSelectedFiles([]); // clear after sending
    setConvoId(conversationId);
  };

  if (!mounted) {
    return null;
  }
  return (
    <div className="relative">
      <div
        className={`transition-all duration-300 rounded-t-lg border border-gray-300  flex items-center justify-between gap-2  dark:border-gray-600 overflow-hidden ${
          showMedia || showDoc
            ? "opacity-100  max-h-100"
            : "opacity-0 h-0 pointer-events-none"
        }`}
      >
        {showMedia && (
          <MediaFinalize
            setShowCarousel={setShowMedia}
            showCarousel={showMedia}
            media={selectedFiles}
            setMedia={setSelectedFiles}
          />
        )}
        {showDoc && (
          <DocsFinalize
            setShowCarousel={setShowDoc}
            showCarousel={showDoc}
            docs={selectedFiles}
            setDocs={setSelectedFiles}
          />
        )}
      </div>
      <div
        className={`transition-all duration-300  border border-gray-300  flex items-center justify-between gap-2 bg-gray-50 dark:bg-blk3 dark:border-gray-600 ${
          reply
            ? "opacity-100 pl-3 pr-3 py-1 max-h-[100px]"
            : "opacity-0 h-0 pointer-events-none"
        } ${showMedia || showDoc ? "" : "rounded-t-lg"}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-gray-500">
            <ReplySvg />
          </div>
          {reply && (
            <div>
              <GetReplyMsg reply={reply} />
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
      <div
        className={`relative border-t border-gray-300 bg-gray-50 dark:bg-blk2
              dark:border-gray-600  
        ${reply || showMedia || showDoc ? "rounded-b-lg" : "rounded-lg"}`}
      >
        <div
          ref={linksMenuRef}
          className={`absolute bottom-14 left-0 z-50 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-blk3 shadow-lg p-2 transition-all duration-200 ease-out transform ${
            showLinks
              ? "opacity-100 scale-100 pointer-events-auto visible"
              : "opacity-0 scale-95 pointer-events-none invisible"
          }`}
        >
          <ul>
            <li
              className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
              onClick={() => {
                mediaInputRef.current?.click();
                setFileType("photo/video");
              }}
            >
              Photos & Videos
            </li>
            <li className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2">
              Camera
            </li>
            <li
              className="lg:p-2 p-1 hover:bg-gray-100 dark:hover:bg-blk8 cursor-pointer rounded-md flex items-center gap-2"
              onClick={() => {
                docInputRef.current?.click();
                setFileType("doc");
              }}
            >
              Document
            </li>
          </ul>
        </div>

        {canSendFiles &&
          (selectedFiles.length > 0 ? (
            <div
              className="bg-blue-500 hover:bg-blue-400 absolute inset-y-0 start-0 flex items-center ms-2 text-white cursor-pointer  p-2 my-2 rounded-sm"
              onClick={() => {
                if (fileType === "photo/video") {
                  mediaInputRef.current?.click();
                }
                if (fileType === "doc") {
                  docInputRef.current?.click();
                }
              }}
            >
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
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
          ) : (
            <div
              ref={linksBtnRef}
              className="absolute inset-y-0 start-0 flex items-center ms-2 text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk5 p-2 my-2 rounded-sm"
              onClick={() => setShowLinks((prev) => !prev)}
            >
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
                  d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.112 2.13"
                />
              </svg>
            </div>
          ))}
        <div
          ref={emojiBtnRef}
          className={`absolute inset-y-0 start-0 flex items-center  text-gray-500 cursor-pointer hover:bg-gray-200 dark:hover:bg-blk5 p-2 my-2 rounded-sm ${
            canSendFiles ? "ms-13" : "ms-3"
          }`}
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
            className={` tiptap max-h-[100px] ${
              canSendFiles ? "pl-24" : "pl-14"
            } pr-24 py-1 lg:py-2 text-sm lg:text-base placeholder:text-gray-400 dark:placeholder-gray-400 focus:outline-none text-gray-900 dark:text-white overflow-y-auto scrollbar-none`}
          />
        </div>
        <button
          type="submit"
          className=" absolute inset-y-0 end-0 me-2 cursor-pointer dark:text-gray-500 text-gray-600 hover:bg-gray-200 dark:hover:bg-blk5 p-2 my-2 rounded-sm"
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
          ref={emojiMenuRef}
          className={`absolute bottom-14 left-0 z-101 origin-bottom-right rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-blk3 shadow-lg p-2 transition-all duration-200 ease-out transform ${
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
      <MediaPicker
        selected={selectedFiles}
        mediaInputRef={mediaInputRef}
        setSelected={setSelectedFiles}
        setType={setmsgType}
      ></MediaPicker>
      <DocsPicker
        selected={selectedFiles}
        docInputRef={docInputRef}
        setSelected={setSelectedFiles}
        setType={setmsgType}
      ></DocsPicker>
    </div>
  );
}
