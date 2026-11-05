import { fileMeta } from "@/app/interfaces";
import { Dispatch, RefObject, SetStateAction } from "react";
import { toast } from "sonner";

export default function FilePicker({
  selected,
  setSelected,
  fileInputRef,
}: {
  selected: fileMeta[];
  setSelected: Dispatch<SetStateAction<fileMeta[]>>;
  fileInputRef: RefObject<HTMLInputElement | null>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxSize = 50 * 1024 * 1024;

    const overLimit = files.find((f: File) => f.size > maxSize);

    const validFiles = files
      .filter((file: File) => {
        const isValidSize = file.size <= maxSize && file.size !== 0;
        return isValidSize;
      })
      .map((f: File) => ({ id: crypto.randomUUID(), file: f }));

    if (overLimit) {
      toast.error("Max size 50MB");
      return;
    }
    if (validFiles.length === 0) {
      toast.error("Invalid file ");
      return;
    }
    if (selected.length + validFiles.length > 10) {
      toast.error("Only 10 files allowed at a time");
      setSelected([...selected, ...validFiles.splice(0, 10 - selected.length)]);
    } else {
      setSelected([...selected, ...validFiles]);
    }
    // send files to parent
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="
          image/*,
          video/mp4,video/webm,
          audio/mpeg,audio/webm,audio/ogg,audio/wav,
          text/plain,text/csv,
          application/pdf,application/json,
          .docx,.xlsx,.pptx,
          .xls,
          .zip,.rar,.7z
        "
        className="hidden"
        multiple
        onChange={handleChange}
      />
    </>
  );
}
