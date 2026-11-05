import { chatListLastMsg } from "@/app/interfaces";
import { checkCall } from "@/lib/axios/workspace/conversation/call/checkCall";
import { createCallSession } from "@/lib/axios/workspace/conversation/call/createCallSession";
import { joinCall } from "@/lib/axios/workspace/conversation/call/joinCall";
import { updateCallStatus } from "@/lib/axios/workspace/conversation/call/updateCallStatus";
import { createCallWithConversation } from "@/lib/axios/workspace/project/FlowSpace/createCallWithConversation";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { upsertSidebar } from "@/lib/hooks/realtime/Conversation/useConvoSidebarRT";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import { CallStatus, CallType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

export const useCallMutations = () => {
  const { id: workspaceId } = useCurrentWorkspace();
  const { id: currentUserId } = useCurrentUser();
  const createCall = useMutation({
    mutationFn: ({
      conversationId,
      type,
    }: {
      conversationId: string;
      type: CallType;
    }) => createCallSession({ workspaceId, conversationId, type }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to start the call"));
    },
    onSuccess: (data, vars) => {
      const setCallId = useCallStore.getState().setCallId;
      setCallId(data.callId);
      useChatStore
        .getState()
        .addMessageRT(vars.conversationId, data.msg, currentUserId);
      const lastMessage: chatListLastMsg = {
        ...data.msg,
        callStatus: data.msg.call?.status,
        messagedBy: {
          name: data.msg.user.name ?? "unknown",
          id: data.msg.user.id ?? "",
        },
        isDeletedForUser: data.msg.isDeletedForUser,
      };
      upsertSidebar(vars.conversationId, workspaceId, currentUserId, false, {
        lastMessage,
      });
    },
  });
  const createCallWithConvo = useMutation({
    mutationFn: ({
      remoteUserId,
      type,
    }: {
      remoteUserId: string;
      type: CallType;
    }) => createCallWithConversation({ workspaceId, remoteUserId, type }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to start the call"));
    },
    onSuccess: (data) => {
      const setCallId = useCallStore.getState().setCallId;
      setCallId(data.callId);
      useChatStore
        .getState()
        .addMessageRT(data.conversationId, data.msg, currentUserId);
      const lastMessage: chatListLastMsg = {
        ...data.msg,
        callStatus: data.msg.call?.status,
        messagedBy: {
          name: data.msg.user.name ?? "unknown",
          id: data.msg.user.id ?? "",
        },
        isDeletedForUser: data.msg.isDeletedForUser,
      };
      upsertSidebar(data.conversationId, workspaceId, currentUserId, false, {
        lastMessage,
      });
    },
  });
  const updateStatus = useMutation({
    mutationFn: ({
      conversationId,
      callId,
      status,
    }: {
      conversationId: string;
      callId: string;
      status: CallStatus;
    }) => updateCallStatus({ workspaceId, conversationId, callId, status }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to update call status"));
    },
  });
  const join = useMutation({
    mutationFn: ({
      conversationId,
      callId,
    }: {
      conversationId: string;
      callId: string;
    }) => joinCall({ workspaceId, conversationId, callId }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to join the call"));
    },
  });
  const checkCallMutation = useMutation({
    mutationFn: ({
      conversationId,
      callId,
    }: {
      conversationId: string;
      callId: string;
    }) => checkCall({ workspaceId, conversationId, callId }),
    onError: (e: AxiosError<ApiError>) => {
      toast.error(getApiErrorMessage(e, "Failed to get the call"));
    },
  });
  return {
    createCall,
    updateStatus,
    join,
    checkCallMutation,
    createCallWithConvo,
  };
};
