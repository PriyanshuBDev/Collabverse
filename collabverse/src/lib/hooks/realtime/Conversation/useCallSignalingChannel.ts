import { supabaseBrowser } from "@/lib/supabase/browser";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useCurrentWorkspace } from "../../useCurrentWorkspace";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useCallSignalingChannel({ callId }: { callId: string | null }) {
  const supabase = useMemo(() => supabaseBrowser(), []);
  const { id: workspaceId } = useCurrentWorkspace();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  const readyRef = useRef<Promise<RealtimeChannel | null>>(
    Promise.resolve(null),
  );

  const waitForSignalingReady = useCallback(() => readyRef.current, []);

  useEffect(() => {
    if (!workspaceId || !callId) {
      setChannel(null);
      readyRef.current = Promise.resolve(null);
      return;
    }

    let resolveReady!: (channel: RealtimeChannel | null) => void;
    let settled = false;

    const readyPromise = new Promise<RealtimeChannel | null>((resolve) => {
      resolveReady = resolve;
    });

    readyRef.current = readyPromise;

    const realtimeChannel = supabase.channel(`call-connection-${callId}`, {
      config: { private: true },
    });

    setChannel(realtimeChannel);

    realtimeChannel.subscribe((status, err) => {
      console.log("callSignalingChannel", status, err);

      if (status === "SUBSCRIBED" && !settled) {
        settled = true;
        resolveReady(realtimeChannel);
      } else if (
        ["CHANNEL_ERROR", "TIMED_OUT", "CLOSED"].includes(status) &&
        !settled
      ) {
        settled = true;
        resolveReady(null);
      }
    });

    return () => {
      if (!settled) {
        settled = true;
        resolveReady(null);
      }
      setChannel(null);
      void supabase.removeChannel(realtimeChannel);
    };
  }, [workspaceId, callId, supabase]);

  return { channel, waitForSignalingReady };
}
