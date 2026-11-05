"use client";

import { useParams } from "next/navigation";
import { currentWsProps } from "../queries/workspace/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";

export function useCurrentWorkspace() {
  const params = useParams();
  const slug = params.workspace as string;

  const queryClient = useQueryClient();
  const data = queryClient.getQueryData<currentWsProps>(["workspace", slug]);
  if (!data) {
    throw new Error("Workspace not found in cache");
  }
  return data;
}
