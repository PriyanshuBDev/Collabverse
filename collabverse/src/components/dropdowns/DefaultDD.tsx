import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { useRef, useState } from "react";

export default function DefaultDD({
  array,
  current,
  onClick,
}: {
  array: string[];
  current: string;
  onClick: (item: string) => void;
}) {
  const [dropdown, setDropDown] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  useClickOutSide([dropRef], () => setDropDown(false));
  return (
    <div ref={dropRef} className="relative lg:min-w-30 min-w-25 cursor-pointer">
      <div
        className="border flex items-center justify-center dark:border-gray-500 border-gray-400 hover:bg-gray-300 dark:hover:bg-blk6 dark:bg-blk3 bg-gray-200 rounded-lg w-23 lg:w-30 px-2 lg:px-3 py-0.5"
        onClick={() => {
          setDropDown((prev) => !prev);
        }}
      >
        <div className="text-sm lg:text-base">{current}</div>
      </div>
      <div
        id="dropdown"
        className={`z-30 py-1  shadow-lg absolute top-0 -left-1 w-23 lg:w-32  bg-gray-100 border dark:border-gray-500 border-gray-400 transition-all duration-300  rounded-lg  dark:bg-blk3 ${
          dropdown
            ? "opacity-100 visible"
            : "opacity-0 invisible pointer-events-none"
        }`}
      >
        {array.map((t: string, idx: number) => (
          <div
            className={`text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-blk6  px-2 lg:px-3 py-0.5  text-xs lg:text-base cursor-pointer ${
              t === current && "border-l-4 border-blue-500"
            }`}
            onClick={() => {
              setDropDown(false);
              if (current === t) return;
              onClick(t);
            }}
            key={idx}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
