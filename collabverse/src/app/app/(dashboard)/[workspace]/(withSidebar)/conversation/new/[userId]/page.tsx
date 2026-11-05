import { NewChat } from "@/components/conversation/chatArea/mainArea/NewChat";

export default async function NewConversationPage({
  params: paramsPromise,
}: Readonly<{ params: Promise<{ userId: string }> }>) {
  const params = await paramsPromise;
  const { userId } = params;

  return <NewChat userId={userId} />;
}
