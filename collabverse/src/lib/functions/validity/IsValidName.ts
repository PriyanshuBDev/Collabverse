import { Dispatch, SetStateAction } from "react";

export default function isValidName(
  value: string,
  setName: Dispatch<SetStateAction<string>>,
) {
  const allowedRegex = /^[\p{L}\p{N}\p{Emoji_Presentation}\s._-]+$/u;
  if (value.startsWith(" ")) return;

  // Max length limit
  if (value.length > 25) return;
  if (value.includes("   ")) return;
  // Prevent invalid characters
  if (!allowedRegex.test(value) && value !== "") return;
  setName(value);
}
