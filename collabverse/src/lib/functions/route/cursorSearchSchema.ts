import z from "zod";

export const cursorSearchSchema = z.object({
  search: z.string().trim().min(2).optional(),
  cursor: z.uuid().optional(),
});
