import { themeProps } from "@/app/interfaces";
import { isZodError } from "@/lib/functions/zod/isZodError";
import api from "@/lib/axios";

export async function toggleTheme({ theme }: themeProps) {
  try {
    await api.patch("/api/user/theme/edit", {
      theme,
    });
    return theme;
  } catch (e) {
    if (isZodError(e)) {
      throw new Error(e.response?.data.errors.theme?.[0] ?? "Invalid input");
    } else {
      throw new Error("Something went wrong");
    }
  }
}
