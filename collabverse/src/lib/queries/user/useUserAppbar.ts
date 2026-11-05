"use client";

import { userDetails } from "@/app/interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import getUser from "../../axios/user/getUser";
import toggleMute from "../../axios/toggles/toggleMute";
import { toast } from "sonner";
import { toggleTheme } from "@/lib/axios/toggles/toggleTheme";

export function useUserAppbar() {
  const queryClient = useQueryClient();
  const userQuery = useQuery<userDetails>({
    queryKey: ["user", "me"],
    queryFn: () => getUser(),
    staleTime: Infinity,
  });
  const toggleMuteMutation = useMutation({
    mutationFn: () => toggleMute(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", "me"] });
      const previousUser = queryClient.getQueryData<userDetails>([
        "user",
        "me",
      ]);

      if (previousUser) {
        queryClient.setQueryData<userDetails>(["user", "me"], {
          ...previousUser,
          mute: !previousUser.mute,
        });
      }
      return { previousUser };
    },

    onError: (error, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", "me"], context.previousUser);
      }
      toast.error(error.message || "Failed to update mute status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  const toggleThemeMutation = useMutation({
    mutationFn: toggleTheme,

    onMutate: async ({ theme }) => {
      await queryClient.cancelQueries({ queryKey: ["user", "me"] });
      const previousUser = queryClient.getQueryData<userDetails>([
        "user",
        "me",
      ]);
      if (previousUser) {
        queryClient.setQueryData<userDetails>(["user", "me"], {
          ...previousUser,
          theme,
        });
      }
      return { previousUser };
    },
    onError: (error, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", "me"], context.previousUser);
      }
      toast.error(error.message || "Failed to change theme");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  return {
    user: userQuery.data,
    isLoading: userQuery.isLoading,
    isError: userQuery.isError,
    toggleMute: () => {
      if (!userQuery.data) return;
      toggleMuteMutation.mutate();
    },
    isToggling: toggleMuteMutation.isPending,
    toggleTheme: toggleThemeMutation.mutate,
    isTogglingTheme: toggleThemeMutation.isPending,
  };
}
