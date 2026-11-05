"use client";
import { User } from "@supabase/supabase-js";
import React, { createContext } from "react";

export const UserContext = createContext<User | undefined>(undefined);

export default function UserProvider({
  user,
  children,
}: {
  user: User;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}
