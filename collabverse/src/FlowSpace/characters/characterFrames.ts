import Phaser from "phaser";
import { characterAssets } from "./characterAssets";

const CHARACTER_WIDTH = 32;
const CHARACTER_HEIGHT = 64;
const CHARACTER_COLUMNS = 56;
const CHARACTER_ROWS = 41;
export function frameName(row: number, col: number) {
  return `r${row}c${col}`;
}
export function frameRange(
  row: number,
  startCol: number,
  count: number,
): string[] {
  return Array.from({ length: count }, (_, index) =>
    frameName(row, startCol + index),
  );
}

export function createCharacterFrames(scene: Phaser.Scene) {
  for (const assets of Object.values(characterAssets)) {
    for (const asset of assets) {
      const texture = scene.textures.get(asset.id);
      for (let row = 0; row < CHARACTER_ROWS; row++) {
        for (let col = 0; col < CHARACTER_COLUMNS; col++) {
          const name = frameName(row, col);
          const x = col * CHARACTER_WIDTH;
          const y = row * 32;

          // Make sure the frame fits in the texture.
          if (
            x + CHARACTER_WIDTH > texture.source[0].width ||
            y + CHARACTER_HEIGHT > texture.source[0].height
          ) {
            continue;
          }
          texture.add(name, 0, x, y, CHARACTER_WIDTH, CHARACTER_HEIGHT);
        }
      }
    }
  }
}
