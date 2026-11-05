import { userDetails } from "@/app/interfaces";
import api from "@/lib/axios";

export default async function getUser() {
  try {
    const res = await api.get<userDetails>("/api/user");
    return res.data;
  } catch {
    throw new Error("Failed to get user");
  }
}
