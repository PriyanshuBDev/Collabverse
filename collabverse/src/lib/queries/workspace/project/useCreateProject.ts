import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrentWorkspace } from "../../../hooks/useCurrentWorkspace";
import { createProject } from "@/lib/axios/workspace/project/createProject";
import { AxiosError } from "axios";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";

export const useCreateProject = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { id, slug } = useCurrentWorkspace();
  const mutation = useMutation({
    mutationFn: createProject,

    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to create Project"));
    },
    onSuccess: (project) => {
      toast.success("Project created");
      router.push(`/app/${slug}/projects/${project.slug}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [id, "projects"] });
    },
  });
  return {
    createProject: mutation.mutate,
    isCreating: mutation.isPending,
    isError: mutation.isError,
  };
};
