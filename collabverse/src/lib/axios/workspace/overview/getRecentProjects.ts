import { AuthParamNormal } from "../../errors/AuthParamNormal";
import api from "@/lib/axios";
import axios from "axios";
import { ProjectCardProps } from "@/app/interfaces";

export async function getRecentProjects(id?: string) {
  try {
    const res = await api.get<ProjectCardProps[]>(
      `/api/workspace/${id}/overview/projects/recent`,
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
