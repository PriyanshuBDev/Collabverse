import { fullUserAppearance } from "@/app/interfaces";
import { queryClient } from "@/components/wrappers/QueryProvider";
import { patchMusicLevel } from "@/lib/axios/user/appearance/patchMusicLevel";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
const queryKey = ["user", "appearance"];
export const useSetMusicLevel = () => {
  return useMutation({
    mutationFn: (level: number) => patchMusicLevel(level),
    onMutate: async (vars) => {
      await queryClient.cancelQueries({ queryKey });
      const previousData =
        queryClient.getQueryData<fullUserAppearance>(queryKey);
      if (previousData) {
        queryClient.setQueryData<fullUserAppearance>(queryKey, {
          ...previousData,
          musicLevel: vars,
        });
      }
      return {
        previousData,
      };
    },
    onError: (_e, _v, c) => {
      if (c?.previousData) {
        queryClient.setQueryData(queryKey, c.previousData);
      }
      toast.error("Failed to change music volume");
    },
  });
};
