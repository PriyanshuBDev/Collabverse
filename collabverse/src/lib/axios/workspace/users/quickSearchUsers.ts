import { memberProps } from "@/app/interfaces";
import api from "../..";

export async function quickSearchUsers({
  search,
  workspaceId,
  signal,
}: {
  search: string;
  workspaceId: string;
  signal?: AbortSignal;
}) {
  const res = await api.get<{ users: memberProps[] }>(
    `/api/workspace/${workspaceId}/users/search`,
    {
      params: {
        search,
      },
      signal,
    },
  );

  return res.data.users;
}
