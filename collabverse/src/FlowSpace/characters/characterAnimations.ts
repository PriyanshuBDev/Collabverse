import { frameRange } from "./characterFrames";

export type CharacterDirection = "up" | "down" | "left" | "right";

export function getIdleFrames(direction: CharacterDirection): string[] {
  switch (direction) {
    case "up":
      return frameRange(2, 6, 6);

    case "left":
      return frameRange(2, 12, 6);

    case "down":
      return frameRange(2, 18, 6);

    case "right":
      return frameRange(2, 0, 6);
  }
}

export function getWalkFrames(direction: CharacterDirection): string[] {
  switch (direction) {
    case "up":
      return frameRange(4, 6, 6);

    case "left":
      return frameRange(4, 12, 6);

    case "down":
      return frameRange(4, 18, 6);

    case "right":
      return frameRange(4, 0, 6);
  }
}
