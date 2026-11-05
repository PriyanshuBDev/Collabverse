"use client";
import { currentConversationProps } from "@/app/interfaces";
import { useActiveConvoHeartbeat } from "@/lib/hooks/conversation/useActiveConvoHeartbeat";
import { useActiveConversationStore } from "@/lib/hooks/zustand/useActiveConversationStore";
import React, { createContext, useContext, useEffect } from "react";
import { ConversationViewContext } from "./ConversationRealtimeHost";

export const ConversationContext = createContext<
  | {
      data: currentConversationProps;
      isNearBottomRef: React.RefObject<boolean>;
      scrollToBottomRef: React.RefObject<(() => void) | null>;
    }
  | undefined
>(undefined);

export default function ConversationProvider({
  data,
  children,
}: {
  data: currentConversationProps;
  children: React.ReactNode;
}) {
  const view = useContext(ConversationViewContext);

  if (!view) {
    throw new Error(
      "ConversationProvider must be inside ConversationRealtimeHost",
    );
  }

  const { activeConversationIdRef, isNearBottomRef, scrollToBottomRef } = view;
  useActiveConvoHeartbeat(data.id);
  const setActiveConversationId = useActiveConversationStore(
    (s) => s.setActiveConversationId,
  );
  useEffect(() => {
    activeConversationIdRef.current = data.id;
    isNearBottomRef.current = true;

    setActiveConversationId(data.id);

    return () => {
      // Avoid clearing a newer conversation during a quick route change.
      if (activeConversationIdRef.current === data.id) {
        activeConversationIdRef.current = null;
        scrollToBottomRef.current = null;
      }

      setActiveConversationId(null);
    };
  }, [
    data.id,
    activeConversationIdRef,
    isNearBottomRef,
    scrollToBottomRef,
    setActiveConversationId,
  ]);
  return (
    <ConversationContext.Provider
      value={{ data, isNearBottomRef, scrollToBottomRef }}
    >
      {children}
    </ConversationContext.Provider>
  );
}
