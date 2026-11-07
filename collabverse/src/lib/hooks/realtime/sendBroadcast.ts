import type { RealtimeChannel } from "@supabase/supabase-js";

type Broadcast = {
  event: string;
  payload: unknown;
};

/** Preserve WebSocket delivery for joined channels and make the REST fallback explicit. */
export function sendBroadcast(channel: RealtimeChannel, broadcast: Broadcast) {
  if (channel.state === "joined") {
    return channel.send({ type: "broadcast", ...broadcast });
  }

  return channel.httpSend(broadcast.event, broadcast.payload);
}
