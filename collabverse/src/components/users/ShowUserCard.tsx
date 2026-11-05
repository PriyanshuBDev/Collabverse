"use client";

import { useShowUserStore } from "@/lib/hooks/zustand/useShowUser";
import CompleteUserCard from "./CompleteUserCard";

export function ShowUserCard() {
  const userId = useShowUserStore((s) => s.userId);
  if (!userId) return null;
  return <CompleteUserCard userId={userId} />;
}
