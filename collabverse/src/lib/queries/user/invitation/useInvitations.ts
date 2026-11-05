import { getInvitations } from "@/lib/axios/user/invitation/getInvitations";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useQuery } from "@tanstack/react-query";

export function useInvitations() {
  const { id } = useCurrentUser();
  return useQuery({
    queryKey: ["user", id, "invitations"],
    queryFn: getInvitations,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
