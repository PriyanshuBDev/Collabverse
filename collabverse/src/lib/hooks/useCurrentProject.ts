"use client";

import { createContext, useContext } from "react";
import { projectSlugProps } from "../axios/workspace/project/getCurrentProject";
export const ProjectContext = createContext<projectSlugProps | null>(null);
export function useCurrentProject() {
  const ctx = useContext(ProjectContext);

  if (!ctx) {
    throw new Error("useCurrentProject must be used inside ProjectProvider");
  }

  return ctx;
}
