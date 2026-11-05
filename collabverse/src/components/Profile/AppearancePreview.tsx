"use client";

import { useEffect, useState } from "react";
import type { CharacterAppearance } from "@/app/interfaces";
import {
  assetProps,
  characterAssets,
} from "@/FlowSpace/characters/characterAssets";
import {
  getIdleFrames,
  type CharacterDirection,
} from "@/FlowSpace/characters/characterAnimations";

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 64;
const ROW_STEP = 32; // Matches your createCharacterFrames y = row * 32
type layerProp = "body" | "eyes" | "hairstyle" | "accessory" | "outfit";
const LAYERS = ["body", "outfit", "hairstyle", "eyes", "accessory"] as const;

const DIRECTIONS: CharacterDirection[] = ["down", "left", "right", "up"];

function getSpriteSrc(
  layer: (typeof LAYERS)[number],
  textureId: string | null,
) {
  if (!textureId) return undefined;

  const asset = characterAssets[layer].find(
    (item: assetProps) => item.id === textureId,
  );
  return asset ? `/Character/${layer}/${asset.file}` : undefined;
}

export function AnimatedDirectionPreview({
  appearance,
  direction,
}: {
  appearance: CharacterAppearance;
  direction: CharacterDirection;
}) {
  const frames = getIdleFrames(direction).slice(0, 4);
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, 180);

    return () => window.clearInterval(timer);
  }, [frames.length]);

  const frame = frames[frameIndex];
  const match = /^r(\d+)c(\d+)$/.exec(frame);

  if (!match) return null;

  const row = Number(match[1]);
  const column = Number(match[2]);
  const backgroundPosition = `-${column * FRAME_WIDTH}px -${row * ROW_STEP}px`;

  return (
    <div className="relative h-24 w-12">
      {/* Scale the 32×64 source frame to 48×96, preserving its proportions. */}
      <div
        className="absolute bottom-0 left-1/2 h-16 w-8 origin-bottom"
        style={{ transform: "translateX(-50%) scale(1.5)" }}
      >
        {LAYERS.map((layer: layerProp) => {
          const src = getSpriteSrc(layer, appearance[layer]);
          if (!src) return null;

          return (
            <div
              key={layer}
              className="absolute bottom-0 left-0"
              style={{
                width: FRAME_WIDTH,
                height: FRAME_HEIGHT,
                backgroundImage: `url("${src}")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition,
                imageRendering: "pixelated",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export function AppearancePreview({
  appearance,
  gap,
}: {
  appearance: CharacterAppearance;
  gap?: string;
}) {
  return (
    <div className={`flex items-center ${gap ?? "gap-10"} justify-around`}>
      {DIRECTIONS.map((direction: CharacterDirection) => (
        <div key={direction}>
          <AnimatedDirectionPreview
            appearance={appearance}
            direction={direction}
          />
        </div>
      ))}
    </div>
  );
}
