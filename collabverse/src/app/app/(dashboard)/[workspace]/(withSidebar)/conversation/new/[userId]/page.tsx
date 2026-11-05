import { NewChat } from "@/components/conversation/chatArea/mainArea/NewChat";

export default function NewConversationPage({
  params,
}: Readonly<{ params: { userId: string } }>) {
  const { userId } = params;

  return <NewChat userId={userId} />;
}
