import { Dispatch, SetStateAction } from "react";

export default function Toggles({
  id,
  value,
  label,
  selected,
  setSelected,
  type,
  popup,
  popupColor,
  text,
}: {
  id?: string;
  value: string;
  label: string;
  selected: string | null;
  setSelected: Dispatch<SetStateAction<string | null>>;
  type?: string;
  popup?: number;
  popupColor?: "neutral" | "warning";
  text?: string;
}) {
  return (
    <div
      className={`cursor-pointer py-1 lg:py-1.5 ${text ?? "text-xs sm:text-sm md:text-base xl:text-lg"} ${
        selected === value
          ? "text-emerald-600 border-b-3"
          : "text-gray-600 dark:text-400 hover:text-emerald-600"
      }`}
      onClick={() => {
        setSelected(value);
        localStorage.setItem(`${type ? type : ""}${id ?? ""}Tab`, `${value}`);
      }}
    >
      <div className="flex items-center gap-1 lg:gap-2">
        {label}
        {popup && (
          <div
            className={`w-fit px-1.5 py-0.5 text-[10px] sm:text-xs  rounded-full  text-white ${
              popupColor === "neutral" ? "bg-blue-500" : "bg-red-500"
            }`}
          >
            {popup}
          </div>
        )}
      </div>
    </div>
  );
}
