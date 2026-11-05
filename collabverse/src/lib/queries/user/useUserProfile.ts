"use client";

import { UserDataProps } from "@/app/interfaces";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import toggleMute from "../../axios/toggles/toggleMute";
import { toast } from "sonner";
import { getUserProfile } from "@/lib/axios/user/getUserProfile";
import { editProfile } from "@/lib/axios/user/editProfile";
import { toggleTheme } from "@/lib/axios/toggles/toggleTheme";
import {
  ApiError,
  getApiErrorMessage,
} from "@/lib/functions/error/getApiErrorMessage";
import { AxiosError } from "axios";

export function useUserProfile() {
  const queryClient = useQueryClient();
  const userQuery = useQuery<UserDataProps>({
    queryKey: ["user", "profile"],
    queryFn: () => getUserProfile(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
  const edit = useMutation({
    mutationFn: editProfile,

    onMutate: async ({
      editedName,
      name,
      editedBio,
      bio,
      editedUsername,
      username,
      avatar,
      avatarRemoved,
    }) => {
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });
      const previousUser = queryClient.getQueryData<UserDataProps>([
        "user",
        "profile",
      ]);
      const previewUrl = avatar ? URL.createObjectURL(avatar) : undefined;

      if (previousUser) {
        queryClient.setQueryData<UserDataProps>(["user", "profile"], {
          ...previousUser,
          name: editedName !== name ? editedName : name,
          bio: editedBio !== bio ? editedBio : bio,
          username: editedUsername !== username ? editedUsername : username,
          avatar: avatar
            ? previewUrl
            : avatarRemoved
              ? undefined
              : previousUser?.avatar,
          avatarPath: avatar
            ? undefined
            : avatarRemoved
              ? undefined
              : previousUser.avatarPath,
        });
      }
      return {
        previewUrl,
        previousUser,
      };
    },

    onError: (error: AxiosError<ApiError>, _vars, ctx) => {
      if (ctx?.previousUser) {
        queryClient.setQueryData<UserDataProps>(
          ["user", "profile"],
          ctx.previousUser,
        );
      }
      toast.error(getApiErrorMessage(error, "Failed to edit profile"));
    },
    onSuccess: (editedUser) => {
      queryClient.setQueryData<UserDataProps>(["user", "profile"], (current) =>
        current
          ? {
              ...current,
              ...editedUser,
              avatar:
                editedUser?.avatar !== undefined
                  ? editedUser?.avatar
                  : undefined,
              avatarPath:
                editedUser?.avatarPath !== undefined
                  ? editedUser?.avatarPath
                  : undefined,
            }
          : current,
      );

      toast.success("Profile updated successfully");
    },
    onSettled: (_data, _err, _vars, ctx) => {
      if (ctx?.previewUrl) {
        URL.revokeObjectURL(ctx.previewUrl);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
  const toggleMuteMutation = useMutation({
    mutationFn: () => toggleMute(),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });
      const previousUser = queryClient.getQueryData<UserDataProps>([
        "user",
        "profile",
      ]);

      if (previousUser) {
        queryClient.setQueryData<UserDataProps>(["user", "profile"], {
          ...previousUser,
          mute: !previousUser.mute,
        });
      }
      return { previousUser };
    },

    onError: (error, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", "profile"], context.previousUser);
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
      await queryClient.cancelQueries({ queryKey: ["user", "profile"] });
      const previousUser = queryClient.getQueryData<UserDataProps>([
        "user",
        "profile",
      ]);
      if (previousUser) {
        queryClient.setQueryData<UserDataProps>(["user", "profile"], {
          ...previousUser,
          theme,
        });
      }
      return { previousUser };
    },
    onError: (error, _vars, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user", "profile"], context.previousUser);
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
    isTogglingMute: toggleMuteMutation.isPending,
    edit: edit.mutate,
    isEditing: edit.isPending,
    toggleTheme: toggleThemeMutation.mutate,
    isTogglingTheme: toggleThemeMutation.isPending,
  };
}
