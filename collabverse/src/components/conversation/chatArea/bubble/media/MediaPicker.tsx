import { MessageType } from "@prisma/client";
import { Dispatch, RefObject, SetStateAction } from "react";
import { toast } from "sonner";

export default function MediaPicker({
  selected,
  setSelected,
  mediaInputRef,
  setType,
}: {
  selected: File[];
  setSelected: Dispatch<SetStateAction<File[]>>;
  mediaInputRef: RefObject<HTMLInputElement | null>;
  setType: Dispatch<SetStateAction<MessageType>>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024;

    const overLimit = files.find((f: File) => f.size > maxSize);

    const validFiles = files.filter((file: File) => {
      const isPhoto = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidType = isPhoto || isVideo;
      const isValidSize = file.size <= maxSize;

      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      toast.error("Invalid media");
      return;
    }
    if (overLimit) {
      toast.error("Max size 50MB");
    }
    const handleType = () => {
      if (selected.length + validFiles.length > 1) {
        setType("album");
      } else {
        if (validFiles[0]?.type.startsWith("image/")) {
          setType("photo");
        } else {
          setType("video");
        }
      }
    };
    if (selected.length + validFiles.length > 50) {
      toast.error("Only 50 media allowed at a time");
      setSelected([...selected, ...validFiles.splice(0, 50 - selected.length)]);
      handleType();
    } else {
      setSelected([...selected, ...validFiles]);
      handleType();
    }
    // send files to parent
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={mediaInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp, image/avif, video/mp4, video/webm"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
