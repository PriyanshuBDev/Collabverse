import { useOpenUser } from "@/lib/stateMangement/useOpenUser";
import {
  NodeViewWrapper,
  NodeViewContent,
  ReactNodeViewProps,
} from "@tiptap/react";
import React from "react";

interface MentionNodeAttrs {
  id: string | null;
  name: string | null;
  avatar: string | null;
  userName: string | null;
}
export default function MentionText({ node }: ReactNodeViewProps) {
  const { id, userName } = node.attrs as MentionNodeAttrs;

  const { setShowUserId } = useOpenUser();

  const handleClick = () => {
    if (id) {
      setShowUserId(id);
    }
    console.log("Clicked User ID:", id);
  };

  return (
    <NodeViewWrapper className="inline-flex">
      <span
        data-id={id}
        className="text-blue-500 font-medium cursor-pointer inline-flex"
        onClick={handleClick}
      >
        {userName}
      </span>
      <NodeViewContent className="inline-block" />
    </NodeViewWrapper>
  );
}
