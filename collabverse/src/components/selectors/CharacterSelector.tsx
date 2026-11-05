import { useState } from "react";

type Category = "body" | "outfit" | "hairstyle" | "eyes" | "accessory";
type categoryProp = {
  id: Category;
  label: string;
  icon: string;
};
const categories: categoryProp[] = [
  { id: "body", label: "BODY", icon: "♟" },
  { id: "outfit", label: "OUTFIT", icon: "◆" },
  { id: "hairstyle", label: "HAIR", icon: "✦" },
  { id: "eyes", label: "EYES", icon: "◉" },
  { id: "accessory", label: "ACCESSORY", icon: "◇" },
];

export default function PixelCategoryButtons() {
  const [selected, setSelected] = useState<Category>("body");

  return (
    <section className="mx-auto w-fit max-w-[95vw] border-4 border-[#e8dec4] bg-[linear-gradient(180deg,#263b3a,#1b2d2d)] p-[18px] shadow-[0_0_0_5px_#101718,8px_8px_0_rgba(0,0,0,0.35)] [image-rendering:pixelated]">
      <h2 className="mb-[14px] text-center font-black tracking-[3px] text-[#fff0c9] [font-family:Arial_Black,sans-serif] [text-shadow:3px_3px_0_#121b1c]">
        CHARACTER
      </h2>

      <div className="flex max-w-[calc(95vw-44px)] gap-2.5 overflow-x-auto pb-1">
        {categories.map((category: categoryProp) => {
          const active = selected === category.id;

          return (
            <button
              key={category.id}
              type="button"
              aria-pressed={active}
              onClick={() => setSelected(category.id)}
              className={[
                "relative flex h-[82px] w-[92px] shrink-0 flex-col items-center justify-center gap-[7px] border-[3px] p-0 transition-[transform,background-color,box-shadow,color] duration-100",
                active
                  ? "translate-x-[3px] translate-y-1 border-[#d8f0df] bg-[linear-gradient(180deg,#4d8876,#326554)] text-[#fff3cd] shadow-[inset_4px_4px_0_#73b59f,inset_-4px_-4px_0_#23493e,1px_1px_0_#0b1011] animate-[selectedPop_180ms_steps(3)]"
                  : "border-[#101718] bg-[linear-gradient(180deg,#344c4a,#263c3b)] text-[#d5e5dc] shadow-[inset_3px_3px_0_#516563,inset_-3px_-3px_0_#172321,4px_4px_0_#0b1011] hover:-translate-y-[3px] hover:bg-[linear-gradient(180deg,#405b57,#304946)] hover:text-[#fff1c9] hover:shadow-[inset_3px_3px_0_#607b73,inset_-3px_-3px_0_#1a2927,4px_7px_0_#0b1011] active:translate-x-[3px] active:translate-y-1 active:shadow-[inset_3px_3px_0_#182321,inset_-2px_-2px_0_#52635f,1px_1px_0_#0b1011]",
              ].join(" ")}
            >
              <span className="absolute left-[5px] top-[5px] h-[5px] w-[5px] bg-[#88a69c]" />
              <span className="absolute right-[5px] top-[5px] h-[5px] w-[5px] bg-[#88a69c]" />
              <span className="absolute bottom-[5px] left-[5px] h-[5px] w-[5px] bg-[#88a69c]" />
              <span className="absolute bottom-[5px] right-[5px] h-[5px] w-[5px] bg-[#88a69c]" />

              <span
                className={[
                  "flex h-8 w-8 items-center justify-center text-[23px] [font-family:Arial_Black,sans-serif] [text-shadow:2px_2px_0_#101718] transition-[transform,color] duration-150",
                  active
                    ? "scale-110 text-[#d5ffe9] [text-shadow:2px_2px_0_#18362e,0_0_8px_rgba(157,239,204,0.5)]"
                    : "text-[#d4e7dd] group-hover:-translate-y-0.5 group-hover:scale-110",
                ].join(" ")}
              >
                {category.icon}
              </span>

              <span
                className={[
                  "text-[9px] font-black tracking-[1px] [text-shadow:2px_2px_0_#101718]",
                  active ? "translate-y-px text-[#fff3cd]" : "text-[#d5e5dc]",
                ].join(" ")}
              >
                {category.label}
              </span>

              {active && (
                <span className="absolute right-[5px] top-[5px] flex h-[15px] w-[15px] items-center justify-center border-2 border-[#19352b] bg-[#d5f2df] text-[9px] font-black leading-none text-[#245441] animate-[checkPop_180ms_steps(3)]">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
