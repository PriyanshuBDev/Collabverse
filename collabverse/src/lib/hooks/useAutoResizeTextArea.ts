import { RefObject, useEffect } from "react";

export function useAutoResizeTextArea(
  descriptionRef: RefObject<HTMLTextAreaElement | null>,
  showDescriptionEdit: boolean,
  editedDescription: string | undefined,
) {
  return useEffect(() => {
    if (showDescriptionEdit && descriptionRef.current) {
      const el = descriptionRef.current;
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [showDescriptionEdit, editedDescription, descriptionRef]);
}
