import { usersProjFilterProps } from "@/app/interfaces";
import api from "@/lib/axios";

interface usersFiltersResProps {
  data: usersProjFilterProps[];
}
export async function getFilters({ workspaceId }: { workspaceId?: string }) {
  try {
    const res = await api.get<usersFiltersResProps>(
      `/api/workspace/${workspaceId}/users/filter-data`,
    );
    return res.data.data;
  } catch {
    throw new Error("Something went wrong while fetching filters");
  }
}
