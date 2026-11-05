"use client";

import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useGetCurrentProject } from "@/lib/queries/workspace/project/useGetCurrentProject";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import Spinner1 from "../loadings/Spinner1";
import { ProjectContext } from "@/lib/hooks/useCurrentProject";
import { AxiosError } from "axios";

export default function ProjectProvider({
  slug,
  children,
}: {
  slug: string;
  children: React.ReactNode;
}) {
  const ws = useCurrentWorkspace();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isError, error, isLoading } = useGetCurrentProject(slug);
  useEffect(() => {
    if (data) {
      queryClient.setQueryData([ws.id, "current-project", data.id], data);
    }
  }, [data, queryClient, ws]);
  const status =
    error instanceof AxiosError ? error?.response?.status : undefined;
  useEffect(() => {
    if (!isError) return;
    if (!status) return;
    toast.dismiss();
    switch (status) {
      case 403: {
        toast.error("You are not authorised");
        router.replace("/app/unauthorize?from=project");
        break;
      }
      case 500: {
        toast.error("Something went wrong");
        router.replace("/app/error");
        break;
      }
      case 404: {
        toast.error("Project not found");
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
  return (
    <ProjectContext.Provider value={data}>{children}</ProjectContext.Provider>
  );
}
