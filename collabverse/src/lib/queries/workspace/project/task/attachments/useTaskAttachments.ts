import {
  attachmentProps,
  fileMetadata,
  getAttachmentsRes,
} from "@/app/interfaces";
import { deleteAttachments } from "@/lib/axios/workspace/project/tasks/attachments/deleteAttachments";
import { deleteSingleAttachment } from "@/lib/axios/workspace/project/tasks/attachments/deleteSingleAttachment";
import { getAttachments } from "@/lib/axios/workspace/project/tasks/attachments/getAttachments";
import { postAttachments } from "@/lib/axios/workspace/project/tasks/attachments/postAttachments";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentProject } from "@/lib/hooks/useCurrentProject";
import { useCurrentTask } from "@/lib/hooks/useCurrentTask";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import {
  InfiniteData,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export function useTaskAttachments() {
  const ws = useCurrentWorkspace();
  const project = useCurrentProject();
  const task = useCurrentTask();
  const queryClient = useQueryClient();
  const queryKey = [ws.id, project.id, "task", task.id, "attachments"];
  const attachments = useInfiniteQuery({
    queryKey,
    initialPageParam: undefined as
      | { cursorId: string; cursorCreatedAt: Date }
      | undefined,
    queryFn: async ({ pageParam }) =>
      await getAttachments({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        cursorCreatedAt: pageParam?.cursorCreatedAt,
        cursorId: pageParam?.cursorId,
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  const createAttachments = useMutation({
    mutationFn: (files: fileMetadata[]) =>
      postAttachments({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        files,
      }),
    onError: async (e: AxiosError<ApiError>, vars) => {
      toast.error(getApiErrorMessage(e, "Failed to upload attachments"));
      await deleteAttachments(vars);
    },
    onSuccess: () => {
      toast.success("Attachments uploaded successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
  const deleteAttachment = useMutation({
    mutationFn: (attachmentId: string) =>
      deleteSingleAttachment({
        workspaceId: ws.id,
        projectId: project.id,
        taskId: task.id,
        attachmentId,
      }),
    onMutate: async (attachmentId: string) => {
      await queryClient.cancelQueries({ queryKey });
      const previousAttachments = queryClient.getQueriesData<
        InfiniteData<getAttachmentsRes>
      >({ queryKey });
      queryClient.setQueriesData<InfiniteData<getAttachmentsRes>>(
        { queryKey },
        (oldData: InfiniteData<getAttachmentsRes, unknown> | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: getAttachmentsRes) => ({
              ...page,
              attachments: page.attachments.filter(
                (a: attachmentProps) => a.id !== attachmentId,
              ),
            })),
          };
        },
      );
      return { previousAttachments };
    },
    onError: (_err: AxiosError<ApiError>, _var, ctx) => {
      ctx?.previousAttachments.forEach(
        ([key, data]: [
          readonly unknown[],
          InfiniteData<getAttachmentsRes, unknown> | undefined,
        ]) => {
          queryClient.setQueryData(key, data);
        },
      );
      toast.error(getApiErrorMessage(_err, "Failed to delete attachment"));
    },
    onSuccess: () => {
      toast.success("Attachment deleted successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey,
      });
    },
  });
  return { createAttachments, ...attachments, deleteAttachment };
}
