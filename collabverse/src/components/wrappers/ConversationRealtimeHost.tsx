"use client";

import { useBroadcastListeners } from "@/lib/hooks/realtime/Conversation/useBroadcastListeners";
import { useConversationRT } from "@/lib/hooks/realtime/Conversation/useConversationRT";
import React, { createContext, useRef } from "react";

type ConversationViewRefs = {
  activeConversationIdRef: React.MutableRefObject<string | null>;
  isNearBottomRef: React.MutableRefObject<boolean>;
  scrollToBottomRef: React.MutableRefObject<(() => void) | null>;
};

export const ConversationViewContext =
  createContext<ConversationViewRefs | null>(null);
export function ConversationRealtimeHost({
  children,
}: {
  children: React.ReactNode;
}) {
  const activeConversationIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const scrollToBottomRef = useRef<(() => void) | null>(null);
  useConversationRT(
    activeConversationIdRef,
    isNearBottomRef,
    scrollToBottomRef,
  );
  useBroadcastListeners();
  return (
    <ConversationViewContext.Provider
      value={{
        activeConversationIdRef,
        isNearBottomRef,
        scrollToBottomRef,
      }}
    >
      {children}
    </ConversationViewContext.Provider>
  );
}
