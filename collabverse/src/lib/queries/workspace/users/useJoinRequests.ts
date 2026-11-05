import { approvalReqProps, wsJoinRequestsProps } from "@/app/interfaces";
import { queryClient } from "@/components/wrappers/QueryProvider";
import { getJoinRequests } from "@/lib/axios/workspace/users/getJoinRequests";
import {
  joinReqStatus,
  updateJoinRequest,
} from "@/lib/axios/workspace/users/updateJoinRequest";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
export interface updateJoinReqProps {
  reqId: string;
  status: joinReqStatus;
}
export function useJoinRequests({
  page,
  setPage,
}: {
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
}) {
  const { id } = useCurrentWorkspace();
  const queryKey = [id, "users", "join-requests", page];
  const joinRequestQuery = useQuery({
    queryKey,
    queryFn: () => getJoinRequests(id, page),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    placeholderData: keepPreviousData,
    enabled: !!id,
  });
  const updateRequestMutation = useMutation({
    mutationFn: ({ reqId, status }: updateJoinReqProps) =>
      updateJoinRequest({ workspaceId: id, reqId, status }),
    onMutate: async ({ reqId }) => {
      await queryClient.cancelQueries({
        queryKey,
      });
      const previousData = queryClient.getQueriesData<wsJoinRequestsProps>({
        queryKey,
      });

      queryClient.setQueriesData<wsJoinRequestsProps>(
        { queryKey },
        (oldData: wsJoinRequestsProps | undefined) => {
          if (!oldData) return oldData;
          const updatedRequests = oldData.requests.filter(
            (r: approvalReqProps) => r.id !== reqId,
          );
          if (updatedRequests.length === 0 && page > 1) {
            setPage(page - 1);
          }
          return {
            ...oldData,
            requests: oldData.requests.filter(
              (r: approvalReqProps) => r.id !== reqId,
            ),
            total: oldData.total - 1,
          };
        },
      );
      return { previousData };
    },
    onError: (_err: AxiosError<ApiError>, _res, context) => {
      context?.previousData?.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(
        getApiErrorMessage(
          _err,
          `Failed to ${_res.status === "Approved" ? "approve" : "reject"} user`,
        ),
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [id, "users"],
      });
    },
  });
  return {
    ...joinRequestQuery,
    updateRequest: updateRequestMutation.mutate,
    isUpdating: updateRequestMutation.isPending,
  };
}
