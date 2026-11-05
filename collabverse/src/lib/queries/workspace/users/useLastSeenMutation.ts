import { updateLastSeen } from "@/lib/axios/workspace/users/updateLastSeen";
import { useMutation } from "@tanstack/react-query";

export function useLastSeenMutation(workspaceId: string) {
  const mutation = useMutation({
    mutationFn: () => updateLastSeen({ workspaceId }),
    onError: (e) => {
      console.error(e);
    },
  });
  return {
    updateLastSeen: mutation.mutateAsync,
  };
}
