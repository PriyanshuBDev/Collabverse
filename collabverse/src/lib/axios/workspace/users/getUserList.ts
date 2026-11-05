import api from "@/lib/axios";
import { AuthParamNormal } from "../../errors/AuthParamNormal";
import { wsUserResPropsList } from "@/app/interfaces";
import axios from "axios";

export async function getUsersList({
  workspaceId,
  projectId,
  taskId,
  search,
  page,
}: {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  page: number;
  search?: string;
}) {
  try {
    const res = await api.get<wsUserResPropsList>(
      `/api/workspace/${workspaceId}/users`,
      {
        params: {
          mode: "offset",
          page,
          search: search ?? undefined,
          projectId: projectId ?? undefined,
          taskId: taskId ?? undefined,
        },
      },
    );
    return res.data;
  } catch (e) {
    if (axios.isAxiosError(e)) {
      const error = AuthParamNormal(e);
      throw error;
    }
    throw new Error("Something went wrong");
  }
}
