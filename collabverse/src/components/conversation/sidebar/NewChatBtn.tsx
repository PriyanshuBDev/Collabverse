import { useState } from "react";
import { createPortal } from "react-dom";
import useMounted from "@/lib/hooks/useMounted";
import { PencilSvg } from "@/components/svg/PencilSvg";
import NewChatPicker from "./NewChatPicker";

export default function NewChatBtn() {
  const mounted = useMounted();
  const [show, setShow] = useState(false);
  if (!mounted) return null;

  return (
    <>
      <div
        className="text-gray-500  cursor-pointer relative group"
        onClick={() => setShow(true)}
      >
        <span title={"New Chat"}>
          <PencilSvg size="size-5" />
        </span>
      </div>
      {createPortal(
        <NewChatPicker show={show} setShow={setShow} />,
        document.body,
      )}
    </>
  );
}
