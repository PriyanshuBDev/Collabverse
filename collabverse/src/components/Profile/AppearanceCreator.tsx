import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { CharacterAppearance } from "@/app/interfaces";
import {
  assetProps,
  characterAssets,
} from "@/FlowSpace/characters/characterAssets";
import OverlayWrapper from "../wrappers/OverlayWrapper";
import { useMutateAppearance } from "@/lib/queries/user/appearance/useMutateAppearance";

type Layer = keyof CharacterAppearance;
type Direction = "up" | "down" | "left" | "right";
type prop = {
  id: Layer;
  label: string;
  icon: string;
};
const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 64;
const ROW_STEP = 32;
const IDLE_START_COLUMN: Record<Direction, number> = {
  up: 6,
  left: 12,
  down: 18,
  right: 0,
};

const LAYERS: prop[] = [
  { id: "body", label: "BODY", icon: "♟" },
  { id: "outfit", label: "OUTFIT", icon: "◆" },
  { id: "hairstyle", label: "HAIR", icon: "✦" },
  { id: "eyes", label: "EYES", icon: "◉" },
  { id: "accessory", label: "ACCESSORY", icon: "◇" },
];

const DIRECTIONS: Direction[] = ["down", "left", "right", "up"];

function getSpriteSrc(layer: Layer, textureId: string | null) {
  if (!textureId) return undefined;

  const asset = characterAssets[layer].find(
    (item: assetProps) => item.id === textureId,
  );
  return asset ? `/Character/${layer}/${asset.file}` : undefined;
}

function getIdleFrame(direction: Direction, frameIndex: number) {
  const column = IDLE_START_COLUMN[direction] + frameIndex;
  return {
    x: column * FRAME_WIDTH,
    y: 2 * ROW_STEP,
  };
}

function SpriteLayers({
  appearance,
  layers,
  direction,
  frameIndex = 0,
  scale = 1,
}: {
  appearance: CharacterAppearance;
  layers: Layer[];
  direction: Direction;
  frameIndex?: number;
  scale?: number;
}) {
  const position = getIdleFrame(direction, frameIndex);

  return (
    <div
      className="relative"
      style={{
        width: FRAME_WIDTH * scale,
        height: FRAME_HEIGHT * scale,
      }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: FRAME_WIDTH,
          height: FRAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {layers.map((layer: keyof CharacterAppearance) => {
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
                backgroundPosition: `-${position.x}px -${position.y}px`,
                imageRendering: "pixelated",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

function AnimatedDirectionPreview({
  appearance,
  direction,
}: {
  appearance: CharacterAppearance;
  direction: Direction;
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex((current) => (current + 1) % 4);
    }, 180);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <SpriteLayers
      appearance={appearance}
      layers={LAYERS.map((layer: prop) => layer.id)}
      direction={direction}
      frameIndex={frameIndex}
      scale={1.25}
    />
  );
}

export function AppearanceCreator({
  appearance,
  setShow,
  show,
}: {
  appearance: CharacterAppearance;
  setShow: Dispatch<SetStateAction<boolean>>;
  show: boolean;
}) {
  const [selectedLayer, setSelectedLayer] = useState<Layer>("body");
  const options = characterAssets[selectedLayer];
  const [editedAppearance, setEditedAppearance] =
    useState<CharacterAppearance>(appearance);
  const { mutateAppearance } = useMutateAppearance();
  function chooseAsset(textureId: string | null) {
    setEditedAppearance({
      ...editedAppearance,
      [selectedLayer]: textureId,
    });
  }

  return (
    <OverlayWrapper active={show}>
      <section className="mx-auto w-full max-w-5xl border-4 border-[#e8dec4] bg-[linear-gradient(180deg,#263b3a,#1b2d2d)] p-3 text-[#d5e5dc] shadow-[0_0_0_5px_#101718,8px_8px_0_rgba(0,0,0,0.35)] sm:p-[18px]">
        <h2 className="mb-4 text-center font-black tracking-[3px] text-[#fff0c9] [font-family:Arial_Black,sans-serif] [text-shadow:3px_3px_0_#121b1c]">
          APPEARANCE
        </h2>

        <div className="flex gap-2 overflow-x-hidden pb-3 w-full">
          {LAYERS.map(({ id, label, icon }: prop) => {
            const active = selectedLayer === id;

            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedLayer(id)}
                className={[
                  "relative flex h-[82px] w-[92px] shrink-0 flex-col items-center justify-center gap-1 border-[3px] transition duration-100",
                  active
                    ? "translate-x-[2px] translate-y-[2px] border-[#d8f0df] bg-[linear-gradient(180deg,#4d8876,#326554)] text-[#fff3cd] shadow-[inset_4px_4px_0_#73b59f,inset_-4px_-4px_0_#23493e]"
                    : "border-[#101718] bg-[linear-gradient(180deg,#344c4a,#263c3b)] hover:-translate-y-1 hover:bg-[linear-gradient(180deg,#405b57,#304946)]",
                ].join(" ")}
              >
                <span className="absolute left-[5px] top-[5px] h-[5px] w-[5px] bg-[#88a69c]" />
                <span className="absolute right-[5px] top-[5px] h-[5px] w-[5px] bg-[#88a69c]" />

                <SpriteLayers
                  appearance={editedAppearance}
                  layers={[id]}
                  direction="down"
                  scale={0.35}
                />

                <span className="text-[9px] font-black tracking-wide">
                  {label || icon}
                </span>
              </button>
            );
          })}
        </div>

        <div className="grid gap-4 border-t border-[#88a69c]/40 pt-4 md:grid-cols-[1fr_220px]">
          <div>
            <h3 className="mb-3 text-center text-xs font-bold tracking-widest text-[#fff0c9]">
              FOUR-DIRECTION PREVIEW
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {DIRECTIONS.map((direction: Direction) => (
                <div
                  key={direction}
                  className="flex min-h-32 flex-col items-center justify-center gap-2 border-2 border-[#101718] bg-[#263c3b] p-2 shadow-[inset_2px_2px_0_#516563,inset_-2px_-2px_0_#172321]"
                >
                  <AnimatedDirectionPreview
                    appearance={editedAppearance}
                    direction={direction}
                  />
                  <span className="text-[10px] font-bold capitalize tracking-wider">
                    {direction}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-center text-xs font-bold tracking-widest text-[#fff0c9]">
              CHOOSE {selectedLayer.toUpperCase()}
            </h3>

            <div className="grid max-h-72 grid-cols-3 gap-2 overflow-y-auto pr-1">
              {options.map((asset: assetProps) => {
                const active = editedAppearance[selectedLayer] === asset.id;

                return (
                  <button
                    key={asset.id}
                    type="button"
                    aria-label={`Select ${asset.id}`}
                    aria-pressed={active}
                    onClick={() => {
                      if (selectedLayer === "accessory") {
                        if (asset.id === editedAppearance.accessory) {
                          chooseAsset(null);
                        } else {
                          chooseAsset(asset.id);
                        }
                      } else {
                        chooseAsset(asset.id);
                      }
                    }}
                    className={[
                      "flex min-h-20 items-center justify-center border-2 p-2",
                      active
                        ? "border-[#d8f0df] bg-[#326554] shadow-[inset_2px_2px_0_#73b59f]"
                        : "border-[#101718] bg-[#344c4a] hover:border-[#88a69c] hover:bg-[#405b57]",
                    ].join(" ")}
                  >
                    <SpriteLayers
                      appearance={{
                        ...editedAppearance,
                        [selectedLayer]: asset.id,
                      }}
                      layers={[selectedLayer]}
                      direction="down"
                      scale={0.65}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-3 border-t border-[#88a69c]/40 pt-4">
          <button
            type="button"
            onClick={() => setShow(false)}
            className="border-2 border-[#101718] bg-[#344c4a] px-4 py-2 text-xs font-black tracking-wider text-[#d5e5dc] shadow-[inset_2px_2px_0_#516563,inset_-2px_-2px_0_#172321] hover:bg-[#405b57] active:translate-y-0.5"
          >
            CANCEL
          </button>

          <button
            type="button"
            onClick={() => {
              mutateAppearance.mutate({ appearance: editedAppearance });
              setShow(false);
            }}
            className="border-2 border-[#d8f0df] bg-[linear-gradient(180deg,#4d8876,#326554)] px-4 py-2 text-xs font-black tracking-wider text-[#fff3cd] shadow-[inset_2px_2px_0_#73b59f,inset_-2px_-2px_0_#23493e] hover:brightness-110 active:translate-y-0.5"
          >
            CONFIRM
          </button>
        </div>
      </section>
    </OverlayWrapper>
  );
}
