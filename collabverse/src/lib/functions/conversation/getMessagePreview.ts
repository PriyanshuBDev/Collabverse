import { MessagePreview } from "@/app/interfaces";
import { Prisma } from "@prisma/client";

export const getMessagePreview = (value: Prisma.JsonValue): MessagePreview => {
  return value as unknown as MessagePreview;
};
