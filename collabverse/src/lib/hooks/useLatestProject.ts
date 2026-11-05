import { projectProps } from "@/app/interfaces";
import { useEffect, useState } from "react";
import { useProjectSidebar } from "../queries/workspace/project/useProjectSidebar";
import { useIsErrorToast } from "./useIsErrorToast";

export function useLatestProject() {
  const [project, setProject] = useState<projectProps | undefined>();
  const { data, isLoading, isError, error } = useProjectSidebar();
  useIsErrorToast(isError, "Failed to fetch projects", error);
  useEffect(() => {
    if (data && !isLoading) {
      setProject(data.projects[0]);
    }
  }, [data, isLoading]);
  return { project, setProject };
}
