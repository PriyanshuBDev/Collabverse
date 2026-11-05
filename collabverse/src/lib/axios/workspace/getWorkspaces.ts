import { WorkspacesProps } from "@/app/interfaces";
import api from "@/lib/axios";

export default async function getWorkspaces(search?: string) {
  try {
    const res = await api.get<WorkspacesProps[]>("/api/workspace/all", {
      params: { search },
    });
    return res.data;
  } catch {
    throw new Error("Something went wrong");
  }
}
