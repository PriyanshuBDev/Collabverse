import { RefObject, useEffect } from "react";

export function useAutoResizeInputHeight(
  nameRef: RefObject<HTMLTextAreaElement | null>,
  editedName: string,
) {
  return useEffect(() => {
    const el = nameRef.current;
    if (!el) return;

    el.style.height = "auto";
    const newHeight = el.scrollHeight;
    const minHeight = 40; // about 1 line for your text-lg/md:text-xl combo

    el.style.height = `${Math.max(newHeight, minHeight)}px`;
  }, [editedName, nameRef]);
}
