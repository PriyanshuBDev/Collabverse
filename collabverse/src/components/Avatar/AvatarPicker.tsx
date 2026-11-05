import { Dispatch, RefObject, SetStateAction } from "react";
import { toast } from "sonner";

export default function AvatarPicker({
  setSelected,
  avatarInputRef,
}: {
  setSelected: Dispatch<SetStateAction<File | undefined>>;
  avatarInputRef: RefObject<HTMLInputElement | null>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; // first selected file
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    const overLimit = file.size > maxSize;
    const isPhoto = file.type.startsWith("image/");
    if (overLimit) {
      toast.error("Max size 10MB");
      return;
    }
    if (!isPhoto) {
      toast.error("Only photos are allowed");
      return;
    }
    setSelected(file);
    // send files to parent
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/jpeg, image/png, image/webp, image/avif"
        className="hidden"
        onChange={handleChange}
      />
    </>
  );
}
