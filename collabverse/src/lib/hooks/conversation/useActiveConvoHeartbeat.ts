import { useConvoActiveMutation } from "@/lib/queries/workspace/conversation/active-heartbeat/useConvoActiveMutation";
import { useEffect, useRef } from "react";

export const useActiveConvoHeartbeat = (convoId: string) => {
  const { mutateAsync } = useConvoActiveMutation();
  const sending = useRef(false);
  useEffect(() => {
    if (!convoId) return;

    const send = async () => {
      if (sending.current) return;

      sending.current = true;

      try {
        await mutateAsync(convoId);
      } finally {
        sending.current = false;
      }
    };
    const onVisiblity = () => {
      if (document.visibilityState !== "visible") return;
      send();
    };
    onVisiblity();
    const interval = setInterval(() => {
      onVisiblity();
    }, 30000);
    document.addEventListener("visibilitychange", onVisiblity);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisiblity);
    };
  }, [convoId, mutateAsync]);
};
