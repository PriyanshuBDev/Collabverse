import { toast } from "sonner";
import { z } from "zod";
import api from "@/lib/axios";
import { isZodError } from "@/lib/functions/zod/isZodError";
export const signUpSchema = z.object({
  id: z.string().uuid({ message: "Invalid user id" }),
  email: z.string().email({ message: "Invalid email" }),
});
type input = z.infer<typeof signUpSchema>;
export default async function signup({ id, email }: input) {
  try {
    await api.post("/api/auth/signup", {
      id,
      email,
    });
    toast.success("Signup successful");
    return { success: true };
  } catch (e) {
    if (isZodError(e)) {
      toast.error(e.response?.data.errors.email?.[0] ?? "Invalid input");
    } else {
      toast.error("Something went wrong");
    }
  }
  return { success: false };
}
