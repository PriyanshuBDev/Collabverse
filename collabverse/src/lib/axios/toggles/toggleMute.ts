import api from "@/lib/axios";

export default async function toggleMute() {
  try {
    await api.patch("/api/user/mute");
  } catch {
    throw new Error("Failed to toggle mute");
  }
}
