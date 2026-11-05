import createWorkspace from "@/lib/axios/workspace/createWorkspace";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useCreateWorkspace = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: createWorkspace,

    onError: (error: Error) => {
      toast.error(error.message || "Failed to create new workspace");
    },
    onSuccess: (workspace) => {
      toast.success("Workspace created");
      router.push(`/app/${workspace.slug}/home`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["workspaces"] });
    },
  });
  return {
    createWs: mutation.mutate,
    isCreating: mutation.isPending,
  };
};
