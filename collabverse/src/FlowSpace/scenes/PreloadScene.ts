import { TiledMapData, TiledTileset } from "@/app/interfaces";
import Phaser from "phaser";
import { characterAssets } from "../characters/characterAssets";
import { createCharacterFrames } from "../characters/characterFrames";
import { DoorAssets } from "../doors/DoorAssets";
import { PlayerEmote } from "@prisma/client";
type Point = { x: number };
const tallFrameRects = [{ x: 0 }, { x: 32 }, { x: 64 }, { x: 96 }];
const iconFramesRects: Record<PlayerEmote, [Point, Point]> = {
  yellowExclamation: [{ x: 128 }, { x: 160 }],
  dollar: [{ x: 192 }, { x: 224 }],
  redExclamation: [{ x: 256 }, { x: 288 }],
  blueQuestionMark: [{ x: 320 }, { x: 352 }],
  brokenHeart: [{ x: 384 }, { x: 416 }],
  zzz: [{ x: 448 }, { x: 480 }],
  yellowQuestionMark: [{ x: 512 }, { x: 544 }],
  music: [{ x: 576 }, { x: 608 }],
  letter: [{ x: 640 }, { x: 672 }],
  night: [{ x: 704 }, { x: 736 }],
  sunshine: [{ x: 768 }, { x: 800 }],
  nothing: [{ x: 832 }, { x: 864 }],
  heart: [{ x: 896 }, { x: 928 }],
  angry: [{ x: 960 }, { x: 992 }],
  thinking: [{ x: 1024 }, { x: 1056 }],
  blush: [{ x: 1088 }, { x: 1120 }],
  waterDroplet: [{ x: 1152 }, { x: 1184 }],
  yellowPlus: [{ x: 1216 }, { x: 1248 }],
};
export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super("PreloadScene");
  }
  init(data: { mapData: TiledMapData }) {
    this.registry.set("mapData", data.mapData);
  }
  preload() {
    const onProgress = this.registry.get("onLoadingProgress") as
      | ((percent: number) => void)
      | undefined;
    this.load.on("progress", (value: number) => {
      onProgress?.(Math.round(value * 100));
    });
    this.load.once("complete", () => {
      onProgress?.(100);
    });
    const mapData = this.registry.get("mapData") as TiledMapData;
    const loadedImages = new Set<string>();
    mapData.tilesets.forEach((tileset: TiledTileset) => {
      if (!tileset.image) return;
      const fileName = tileset.image.split("/").pop();
      if (!fileName) return;
      if (fileName === "Interiors_16x16.png") {
        for (let i = 0; i < 5; i++) {
          const textureKey = `tileset-Interiors_16x16-${i}`;

          this.load.image(textureKey, `/tilesets/Interiors_16x16_${i}.png`);
        }

        return;
      }

      if (fileName === "Interiors_32x32.png") {
        for (let i = 0; i < 8; i++) {
          const textureKey = `tileset-Interiors_32x32-${i}`;

          this.load.image(textureKey, `/tilesets/Interiors_32x32_${i}.png`);
        }

        return;
      }
      if (!loadedImages.has(fileName)) {
        loadedImages.add(fileName);
        const textureKey = `tileset-${fileName}`;
        this.load.image(
          textureKey,
          `/tilesets/${encodeURIComponent(fileName)}`,
        );
      }
    });
    this.load.tilemapTiledJSON("worldMap", "/map/MapPhaser.tmj");
    for (const [type, assets] of Object.entries(characterAssets)) {
      const folder = `/character/${type}/`;
      for (const asset of assets) {
        this.load.image(asset.id, `${folder}${asset.file}`);
      }
    }
    for (const door of DoorAssets) {
      this.load.spritesheet(door.id, door.file, {
        frameWidth: door.width,
        frameHeight: door.height,
      });
    }
    this.load.image(
      "ui-emotes",
      "/Character/ui/UI_thinking_emotes_animation_32x32.png",
    );
  }
  private createEmoteFrames() {
    const texture = this.textures.get("ui-emotes");
    for (const [emoteId, positions] of Object.entries(iconFramesRects)) {
      const frameNames = [
        ...tallFrameRects.map((point: Point, index: number) => {
          const name = `intro-${index}`;
          if (!texture.has(name)) {
            texture.add(name, 0, point.x, 0, 32, 64);
          }
          return name;
        }),
        ...positions.map((point: Point, index: number) => {
          const name = `${emoteId}-${index}`;
          texture.add(name, 0, point.x, 0, 32, 64);
          return name;
        }),
      ];
      this.anims.create({
        key: `emote-${emoteId}`,
        frames: frameNames.map((frame: string, index: number) => ({
          key: "ui-emotes",
          frame,
          duration: index === frameNames.length - 1 ? 1000 : 100,
        })),
        duration: 1,
        repeat: 0,
        frameRate: 6,
      });
    }
  }
  create() {
    createCharacterFrames(this);
    this.scene.start("WorldScene");
    this.createEmoteFrames();
  }
}
