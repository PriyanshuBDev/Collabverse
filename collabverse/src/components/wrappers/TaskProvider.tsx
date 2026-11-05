"use client";

import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import Spinner1 from "../loadings/Spinner1";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useGetCurrentTask } from "@/lib/queries/workspace/project/task/useGetCurrentTask";
import { TaskContext } from "@/lib/hooks/useCurrentTask";
import { AxiosError } from "axios";

export default function TaskProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, isError, isLoading, error } = useGetCurrentTask(slug);
  useEffect(() => {
    if (data) {
      queryClient.setQueryData(
        [ws.id, project.id, "current-task", data.id],
        data,
      );
    }
  }, [data, queryClient, ws, project]);
  const status =
    error instanceof AxiosError ? error?.response?.status : undefined;
  useEffect(() => {
    if (!isError) return;
    if (!status) return;
    toast.dismiss();
    switch (status) {
      case 403: {
        toast.error("You are not authorised");
        router.replace("/app/unauthorize?from=task");
        break;
      }
      case 500: {
        toast.error("Something went wrong");
        router.replace("/app/error");
        break;
      }
      case 404: {
        toast.error("Task not found");
        router.replace("/app/not-found");
        break;
      }
    }
  }, [status, router, isError]);
  if (isLoading)
    return (
      <div className="flex justify-center items-center h-full w-full ">
        <Spinner1 size="size-10 lg:size-14"></Spinner1>
      </div>
    );
  if (!data) return null;
  return <TaskContext.Provider value={data}>{children}</TaskContext.Provider>;
}
