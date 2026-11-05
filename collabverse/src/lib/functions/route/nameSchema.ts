import z from "zod";
export const nameSchema = z
  .string()
  .min(6, "Name must be atleast 6 characters")
  .max(25, "Name must be at most 25 characters")
  .refine((val) => !val.startsWith(" "), {
    message: "Name cannot start with a space",
  })
  .refine((val) => !val.includes("   "), {
    message: "Name cannot contain triple spaces",
  })
  .regex(/^[\p{L}\p{N}\p{Emoji_Presentation}\s._-]+$/u, {
    message: "Name contains invalid characters",
  });
