import { ConversationContext } from "@/components/wrappers/ConversationProvider";
import { useContext } from "react";

export default function useCurrentConversation() {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error(
      "useCurrentConversation must be used inside ConversationProvider",
    );
  }
  return context.data;
}
