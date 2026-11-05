import api from "..";
import { currentWsProps } from "@/lib/queries/workspace/useWorkspace";

export async function getCurrentWorkspace({ slug }: { slug: string }) {
  try {
    const res = await api.get<currentWsProps>(
      `/api/workspace/slug/${slug}/current`,
    );
    return res.data;
  } catch (e) {
    throw e;
  }
}
