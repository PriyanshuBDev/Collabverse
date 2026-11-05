import { RefObject, useLayoutEffect } from "react";

export function useMirrorWidth(
  nameRef: RefObject<HTMLTextAreaElement | null>,
  mirrorRef: RefObject<HTMLSpanElement | null>,
  editedName: string,
) {
  return useLayoutEffect(() => {
    if (mirrorRef.current && nameRef.current) {
      // Measure mirror width
      const width = mirrorRef.current.offsetWidth;
      nameRef.current.style.width = width + 20 + "px"; // +20 for padding
    }
  }, [editedName, mirrorRef, nameRef]);
}
