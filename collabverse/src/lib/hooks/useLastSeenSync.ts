import { useCallback, useEffect, useRef } from "react";
import { useLastSeenMutation } from "../queries/workspace/users/useLastSeenMutation";

const FIVE_MIN = 1000 * 60 * 5;
export function useLastSeenSync(workspaceId: string) {
  const { updateLastSeen } = useLastSeenMutation(workspaceId);
  const isPersistingRef = useRef(false);
  const lastPersistedRef = useRef(0);

  const persistLastSeen = useCallback(
    async (force = false) => {
      if (!workspaceId || isPersistingRef.current) return;
      const now = Date.now();

      // prevent too many DB writes
      if (!force && now - lastPersistedRef.current < FIVE_MIN) {
        return;
      }

      lastPersistedRef.current = now;
      isPersistingRef.current = true;

      try {
        await updateLastSeen();
      } finally {
        isPersistingRef.current = false;
      }
    },
    [updateLastSeen, workspaceId],
  );
  useEffect(() => {
    persistLastSeen(true);
    const interval = setInterval(() => persistLastSeen(), FIVE_MIN);
    return () => clearInterval(interval);
  }, [persistLastSeen, workspaceId]);
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        persistLastSeen(true);
      }
    };
    const handlePageHide = () => {
      persistLastSeen(true);
    };
    const handleFocus = () => {
      persistLastSeen();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("pagehide", handlePageHide);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      window.removeEventListener("pagehide", handlePageHide);

      window.removeEventListener("focus", handleFocus);
    };
  }, [workspaceId, persistLastSeen]);
}
