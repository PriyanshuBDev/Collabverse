import { Dispatch, SetStateAction, useEffect } from "react";

export function usePreviewUrl({
  avatar,
  setPreviewUrl,
  extra,
}: {
  avatar: File | null;
  setPreviewUrl: Dispatch<SetStateAction<string | null>>;
  extra: () => void;
}) {
  useEffect(() => {
    if (!avatar) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(avatar);
    setPreviewUrl(url);
    extra();
    return () => URL.revokeObjectURL(url); // prevent memory leaks
  }, [avatar, extra, setPreviewUrl]);
}
