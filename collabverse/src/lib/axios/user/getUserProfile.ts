import { UserDataProps } from "@/app/interfaces";
import api from "@/lib/axios";

export async function getUserProfile() {
  try {
    const res = await api.get<UserDataProps>("/api/user/profile");
    return res.data;
  } catch (e) {
    console.log(e);
    throw new Error("Something went wrong");
  }
}
