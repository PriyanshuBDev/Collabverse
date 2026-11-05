import { PositionProps } from "@/components/ChatComponents/Bubble";
import { Dispatch, SetStateAction } from "react";

export const handleContextMenu = (
  e: React.MouseEvent,
  setMenuPos: Dispatch<SetStateAction<PositionProps | null>>,
  menuPos: PositionProps | null,
) => {
  e.preventDefault();
  if (menuPos) return;

  setMenuPos({ x: e.clientX, y: e.clientY });
};
