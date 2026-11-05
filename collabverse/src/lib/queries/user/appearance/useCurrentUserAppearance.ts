import { getUserAppearance } from "@/lib/axios/user/appearance/getUserAppearance";
import { useQuery } from "@tanstack/react-query";

export const useCurrentUserAppearance = () => {
  return useQuery({
    queryKey: ["user", "appearance"],
    queryFn: () => getUserAppearance(),
    staleTime: Infinity,

    refetchOnWindowFocus: false,
  });
};
