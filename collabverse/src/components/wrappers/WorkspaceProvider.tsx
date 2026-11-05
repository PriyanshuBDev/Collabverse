"use client";

import { usePresenceRT } from "@/lib/hooks/realtime/usePresenceRT";
import { useLastSeenSync } from "@/lib/hooks/useLastSeenSync";
import { useRememberWsPage } from "@/lib/hooks/useRememberWsPage";
import {
  currentWsProps,
  useWorkspace,
} from "@/lib/queries/workspace/useWorkspace";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

export default function WorkspaceProvider({
  initialWs,
  wsSlug,
  children,
}: {
  initialWs: currentWsProps;
  wsSlug: string;
  children: ReactNode;
}) {
  const { error } = useWorkspace(wsSlug, initialWs);
  const router = useRouter();

  const status = error?.response?.status;
  useEffect(() => {
    if (!status) return;
    toast.dismiss();
    switch (status) {
      case 403: {
        toast.error("You are not authorised");
        router.replace("/app/unauthorize?from=workspace");
        break;
      }
      case 500: {
        toast.error("Something went wrong");
        router.replace("/app/error");
        break;
      }
      case 404: {
        toast.error("Workspace not found");
        router.replace("/app/not-found");
        break;
      }
    }
  }, [status, router]);
  usePresenceRT(initialWs.id);
  useLastSeenSync(initialWs.id);
  useRememberWsPage();
  return <>{children}</>;
}
