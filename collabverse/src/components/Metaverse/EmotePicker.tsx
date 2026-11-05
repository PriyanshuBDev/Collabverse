import { PlayerEmote } from "@prisma/client";
import { CircleCrossSvg } from "../svg/CircleCrossSvg";

const SHEET_WIDTH = 1280;
const SHEET_HEIGHT = 64;
type emoteProp = {
  id: PlayerEmote;
  x: number;
};
const EMOTES: emoteProp[] = [
  { id: "yellowExclamation", x: 128 },
  { id: "dollar", x: 192 },
  { id: "redExclamation", x: 256 },
  { id: "blueQuestionMark", x: 320 },
  { id: "brokenHeart", x: 384 },
  { id: "zzz", x: 448 },
  { id: "yellowQuestionMark", x: 512 },
  { id: "music", x: 576 },
  { id: "letter", x: 640 },
  { id: "night", x: 704 },
  { id: "sunshine", x: 768 },
  { id: "nothing", x: 832 },
  { id: "heart", x: 896 },
  { id: "angry", x: 960 },
  { id: "thinking", x: 1024 },
  { id: "blush", x: 1088 },
  { id: "waterDroplet", x: 1152 },
  { id: "yellowPlus", x: 1216 },
] as const;

export type EmoteId = (typeof EMOTES)[number]["id"];

type EmotePickerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (emote: EmoteId) => void;
};

export function EmotePicker({ open, onClose, onSelect }: EmotePickerProps) {
  return (
    <div
      aria-hidden={!open}
      className={[
        "fixed left-1/2 top-3 z-[1000] -translate-x-1/2",
        "transition-[opacity,transform] duration-200 ease-out",
        "motion-reduce:transition-none thinScrollbar",
        open
          ? "translate-y-0 scale-100 opacity-100"
          : "-translate-y-3 scale-95 pointer-events-none opacity-0",
      ].join(" ")}
    >
      <section
        aria-label="Choose an emote"
        className={[
          "w-[min(92vw,560px)] rounded-lg border-2 border-slate-500",
          "bg-blk3/90 backdrop-blur-xl p-2 text-white",
          "shadow-[inset_2px_2px_0_#475569,inset_-2px_-2px_0_#0f172a,4px_4px_0_#000]",
          "[image-rendering:pixelated]",
        ].join(" ")}
      >
        <header className="mb-2 flex items-center justify-between px-1">
          <h2 className="font-mono text-xs uppercase tracking-wider">Emotes</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close emote picker"
            className="rounded  px-2 py-1 font-mono text-xs   focus-visible:outline-2 focus-visible:outline-white"
          >
            <CircleCrossSvg size="size-4 lg:size-5" />
          </button>
        </header>

        <div className="overflow-x-auto overscroll-x-contain thinScrollbar">
          <div className="flex w-max gap-2 pb-2">
            {EMOTES.map(({ id, x }: emoteProp) => (
              <button
                key={id}
                type="button"
                title={id}
                aria-label={`Send ${id} emote`}
                disabled={!open}
                onClick={() => {
                  onSelect(id);
                  onClose();
                }}
                className={[
                  "flex px-1 py-2 shrink-0 items-center justify-center",
                  "rounded border-2 border-blk7 bg-blk3",
                  "hover:border-emerald-300 hover:bg-blk5",
                  "focus-visible:outline-2 focus-visible:outline-emerald-300",
                  "active:translate-y-px",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className="block h-8 w-8 shrink-0"
                  style={{
                    backgroundImage:
                      "url('/Character/ui/UI_thinking_emotes_animation_32x32.png')",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${SHEET_WIDTH}px ${SHEET_HEIGHT}px`,
                    backgroundPosition: `-${x}px 0`,
                    imageRendering: "pixelated",
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
