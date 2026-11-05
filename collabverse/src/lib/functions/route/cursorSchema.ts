import z from "zod";

export const cursorSchema = z.object({
  cursorId: z.uuid().optional(),
  cursorCreatedAt: z.coerce.date().optional(),
});
