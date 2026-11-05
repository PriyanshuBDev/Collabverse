import {
  CharacterAppearance,
  fullUserAppearance,
  UserDataProps,
} from "@/app/interfaces";
import { queryClient } from "@/components/wrappers/QueryProvider";
import { changeUserAppearance } from "@/lib/axios/user/appearance/changeUserAppearance";
import { toggleDnd } from "@/lib/axios/user/appearance/toggleDnd";
import { getApiErrorMessage } from "@/lib/functions/error/getApiErrorMessage";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { ApiError } from "next/dist/server/api-utils";
import { toast } from "sonner";
const queryKey = ["user", "profile"];
export const useMutateAppearance = () => {
  const mutateAppearance = useMutation({
    mutationFn: ({ appearance }: { appearance: CharacterAppearance }) =>
      changeUserAppearance(appearance),
    onMutate: async ({ appearance }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData<UserDataProps>(queryKey);
      if (previousData) {
        queryClient.setQueryData<UserDataProps>(queryKey, {
          ...previousData,
          appearance,
        });
      }
      return {
        previousData,
      };
    },
    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData<UserDataProps>(
          ["user", "profile"],
          ctx.previousData,
        );
      }
      toast.error(getApiErrorMessage(error, "Failed to edit profile"));
    },
    onSuccess: () => {
      toast.success("Appearance updated successfully");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "appearance"] });
    },
  });
  const mutateDnd = useMutation({
    mutationFn: () => toggleDnd(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<fullUserAppearance>(queryKey);
      if (previousData) {
        queryClient.setQueryData<fullUserAppearance>(queryKey, {
          ...previousData,
          dnd: !previousData.dnd,
        });
      }
      return {
        previousData,
      };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.previousData) {
        queryClient.setQueryData(queryKey, ctx.previousData);
      }
      toast.error("Failed to toggle Do Not Disturb");
    },
  });
  return {
    mutateAppearance,
    mutateDnd,
  };
};
