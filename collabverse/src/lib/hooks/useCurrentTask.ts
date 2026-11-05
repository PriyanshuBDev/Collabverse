"use client";

import { createContext, useContext } from "react";
import { currentTaskProps } from "@/app/interfaces";
export const TaskContext = createContext<currentTaskProps | null>(null);
export function useCurrentTask() {
  const ctx = useContext(TaskContext);

  if (!ctx) {
    throw new Error("useCurrentTask must be used inside TaskProvider");
  }

  return ctx;
}
