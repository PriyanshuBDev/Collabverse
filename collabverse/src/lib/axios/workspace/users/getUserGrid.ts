import api from "@/lib/axios";
import { AuthParamNormal } from "../../errors/AuthParamNormal";
import { wsUserResPropsGrid } from "@/app/interfaces";
import axios from "axios";

export async function getUsersGrid({
  workspaceId,
  projectId,
  taskId,
  search,
  cursorId,
}: {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
  search?: string;
  cursorId?: string;
}) {
  try {
    const res = await api.get<wsUserResPropsGrid>(
      `/api/workspace/${workspaceId}/users`,
      {
        params: {
          mode: "cursor",
          cursorId: cursorId ?? undefined,
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
    throw Error("Something went wrong");
  }
}
