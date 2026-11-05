import { UserContext } from "@/components/wrappers/UserProvider";
import { useContext } from "react";

export default function useCurrentUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used inside UserProvider");
  }
  return context;
}
