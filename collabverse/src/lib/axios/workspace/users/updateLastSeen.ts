import api from "../..";

export async function updateLastSeen({ workspaceId }: { workspaceId: string }) {
  return api.patch(`/api/workspace/${workspaceId}/users/lastSeenSync`);
}
