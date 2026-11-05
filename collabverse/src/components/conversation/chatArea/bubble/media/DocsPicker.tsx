import { MessageType } from "@prisma/client";
import { Dispatch, RefObject, SetStateAction } from "react";
import { toast } from "sonner";

export default function DocsPicker({
  selected,
  setSelected,
  docInputRef,
  setType,
}: {
  selected: File[];
  setSelected: Dispatch<SetStateAction<File[]>>;
  docInputRef: RefObject<HTMLInputElement | null>;
  setType: Dispatch<SetStateAction<MessageType>>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024;

    const overLimit = files.find((f: File) => f.size > maxSize);

    const validFiles = files.filter((file: File) => {
      const audioExtensions = [
        ".mp3",
        ".wav",
        ".ogg",
        ".m4a",
        ".aac",
        ".flac",
        ".opus",
        ".weba",
      ];

      const isAudio =
        file.type.startsWith("audio/") ||
        audioExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));
      const isZip = file.name.toLowerCase().endsWith(".zip");
      const isDoc =
        file.type.startsWith("image/") ||
        file.type.startsWith("video/") ||
        file.type === "application/pdf" ||
        file.type.startsWith("application/vnd") || // Office docs
        file.type === "text/plain" ||
        file.type === "application/json" ||
        file.type === "application/zip" ||
        isZip ||
        isAudio;
      const isValidSize = file.size <= maxSize;

      return isDoc && isValidSize;
    });

    if (validFiles.length === 0) {
      toast.error("Only 50 documents allowed. Max size 50MB");
      return;
    }
    if (overLimit) {
      toast.error("Max size 50MB");
    }
    if (selected.length + validFiles.length > 50) {
      toast.error("Only 50 documents allowed at a time");
      setSelected([...selected, ...validFiles.splice(0, 50 - selected.length)]);
      setType("document");
    } else {
      setSelected([...selected, ...validFiles]);
      setType("document");
    }

    // send files to parent
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.json,.zip,image/jpeg, image/png, image/webp, image/avif, video/mp4, video/webm, audio/*"
        multiple
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
