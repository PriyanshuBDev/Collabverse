import emojiRegex from "emoji-regex";
import z from "zod";
const regex = emojiRegex();

export const reactionSchema = z.object({
  reaction: z.string().refine(
    (value) => {
      const matches = value.match(regex);
      return matches?.length === 1 && matches[0] === value;
    },
    {
      message: "Invalid emoji",
    },
  ),
});
