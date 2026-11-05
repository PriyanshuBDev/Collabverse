"use client";
import { useCall } from "@/lib/hooks/call/useCall";
import { createContext, useContext } from "react";

type ContextType = ReturnType<typeof useCall>;
const CallContext = createContext<ContextType | null>(null);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const call = useCall();

  return <CallContext.Provider value={call}>{children}</CallContext.Provider>;
}

export function useCallContext() {
  const context = useContext(CallContext);
  if (!context)
    throw new Error("useCallContext must be used within CallProvider");
  return context;
}
