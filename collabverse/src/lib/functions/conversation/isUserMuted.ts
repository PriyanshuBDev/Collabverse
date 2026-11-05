import { MuteEnum } from "@prisma/client";
const MUTE_DURATION: Partial<Record<MuteEnum, number>> = {
  Eight: 8 * 60 * 60 * 1000,
  Week: 7 * 24 * 60 * 60 * 1000,
};
export function isUserMuted(mutedAt: Date | null, mutedFor: MuteEnum | null) {
  if (mutedFor === "Always") return true;
  if (!mutedAt || !mutedFor) return false;

  const duration = MUTE_DURATION[mutedFor];

  if (!duration) return false;

  return mutedAt.getTime() + duration >= Date.now();
}
