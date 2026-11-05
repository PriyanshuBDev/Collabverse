import { handleConversationMute } from "@/lib/axios/workspace/conversation/handleConversationMute";
import { useCurrentWorkspace } from "@/lib/hooks/useCurrentWorkspace";
import { MuteEnum } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useMuteMutation<T extends object>(
  queryKey: string[],
  name: string,
  conversationId: string,
) {
  const { id: workspaceId } = useCurrentWorkspace();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      enabled,
      muteType,
    }: {
      enabled: boolean;
      muteType?: MuteEnum;
    }) =>
      handleConversationMute({
        workspaceId,
        conversationId,
        muteType,
        enabled,
      }),
    onMutate: async ({ muteType, enabled }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<T>(queryKey);
      queryClient.setQueryData<T>(
        queryKey,
        (oldData: NoInfer<T> | undefined) => {
          if (!oldData) return oldData;
          if (enabled) {
            return {
              ...oldData,
              mute: muteType,
              mutedAt: new Date(),
            };
          } else {
            return {
              ...oldData,
              mute: undefined,
              mutedAt: undefined,
            };
          }
        },
      );
      return { previousData };
    },
    onError: (_err, _data, context) => {
      if (context) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      toast.error(`Failed to ${_data.enabled ? "mute" : "unmute"} ${name}`);
    },
    onSuccess: (_, vars) => {
      toast.success(
        `${name} is ${vars.enabled ? `muted for ${vars.muteType === "Always" ? "always" : vars.muteType === "Eight" ? "eight hrs" : "a week"}` : "unmuted"}`,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
