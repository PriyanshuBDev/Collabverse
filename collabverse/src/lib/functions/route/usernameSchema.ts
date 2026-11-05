import z from "zod";

export const usernameSchema = z
  .string()
  .min(3)
  .max(20)
  .trim()
  .toLowerCase()
  .regex(/^@[a-z0-9]+(?:[._][a-z0-9]+)*$/, {
    message:
      "Username must start with @ and can contain lowercase letters, numbers, dots, or underscores (no consecutive or trailing symbols).",
  });
