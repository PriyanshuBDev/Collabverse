"use client";

import { useCommentRT } from "@/lib/hooks/realtime/Comments/useCommentRT";
import React, { createContext, useContext, useRef } from "react";

type CommentViewRefs = {
  isNearBottomRef: React.MutableRefObject<boolean>;
  scrollToBottomRef: React.MutableRefObject<(() => void) | null>;
};

export const CommentViewContext = createContext<CommentViewRefs | null>(null);
export function TaskCommentRealtimeHost({
  children,
}: {
  children: React.ReactNode;
}) {
  const isNearBottomRef = useRef(true);
  const scrollToBottomRef = useRef<(() => void) | null>(null);
  useCommentRT(isNearBottomRef, scrollToBottomRef);
  return (
    <CommentViewContext.Provider
      value={{
        isNearBottomRef,
        scrollToBottomRef,
      }}
    >
      {children}
    </CommentViewContext.Provider>
  );
}
export function useTaskCommentView() {
  const ctx = useContext(CommentViewContext);

  if (!ctx) {
    throw new Error(
      "useTaskCommentView must be used inside TaskCommentRealtimeHost",
    );
  }
  return ctx;
}
