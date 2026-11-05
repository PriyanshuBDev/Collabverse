import api from "../..";

export async function transferWs({
  id,
  newOwnerId,
}: {
  id: string;
  newOwnerId: string;
}) {
  return await api.patch(`/api/workspace/${id}/settings/transfer`, {
    newOwnerId,
  });
}
