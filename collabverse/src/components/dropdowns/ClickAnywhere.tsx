import {
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";
import { PositionProps } from "../ChatComponents/Bubble";
import { useClickOutSide } from "@/lib/hooks/useClickOutside";
import { createPortal } from "react-dom";

export default function ClickAnywhere({
  menuPos,
  setMenuPos,
  children,
  width,
  bg,
}: {
  menuPos: PositionProps | null;
  setMenuPos: Dispatch<SetStateAction<PositionProps | null>>;
  children: ReactNode;
  width?: string;
  bg?: string;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    if (menuPos) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [menuPos]);

  const closeMenu = () => {
    setMenuPos(null);
  };
  useClickOutSide(menuRef, closeMenu);
  function positionMenu(
    clickX: number,
    clickY: number,
    menuW: number,
    menuH: number,
  ) {
    let x = clickX;
    let y = clickY;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    if (x + menuW > viewportW) {
      x -= menuW;
    }

    if (y + menuH > viewportH) {
      y -= menuH;
    }

    x = Math.max(0, Math.min(x, viewportW - menuW));
    y = Math.max(0, Math.min(y, viewportH - menuH));
    return { x, y };
  }
  useEffect(() => {
    if (!menuPos || !menuRef.current) return;
    const menuW = menuRef.current.offsetWidth;
    const menuH = menuRef.current.offsetHeight;

    const { x, y } = positionMenu(menuPos.x, menuPos.y, menuW, menuH);
    if (x !== menuPos.x || y !== menuPos.y) setMenuPos({ x, y });
  }, [menuPos, setMenuPos]);
  const shouldRender = menuPos || isVisible;
  return (
    <>
      {shouldRender &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[1001]"
              style={{ pointerEvents: "auto" }}
              onClick={() => setMenuPos(null)} // click anywhere closes menu
            />
            <div
              ref={menuRef}
              className={`fixed ${
                bg ? bg : "bg-gray-200 dark:bg-blk3"
              } rounded-md shadow-lg dark:shadow-black/30  py-2 ${
                width ?? "w-34 lg:w-44"
              } text-gray-800 dark:text-gray-200 text-base  z-1002   transition-all duration-200 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-0"}`}
              style={{
                left: menuPos?.x,
                top: menuPos?.y,
                transformOrigin: "left top",
                pointerEvents: isVisible ? "auto" : "none",
              }}
              onTransitionEnd={() => {
                if (!isVisible) {
                  setMenuPos(null); // finally unmount
                }
              }}
              onClick={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                e.stopPropagation()
              }
            >
              {children}
            </div>
          </>,
          document.body,
        )}
    </>
  );
}
