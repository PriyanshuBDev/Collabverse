import { supabaseBrowser } from "@/lib/supabase/browser";

export default async function uploadChatMedia(chatId: string, file: File) {
  const supabase = supabaseBrowser();
  const uuid = crypto.randomUUID();
  const fileExt = file.name.split(".").pop();
  const fileName = `${uuid}.${fileExt}`;
  const filePath = `${chatId}/${fileName}`;

  const { error } = await supabase.storage
    .from("Chat_Media")
    .upload(filePath, file);
  if (error) throw error;

  const publicUrl = supabase.storage.from("Chat_Media").getPublicUrl(filePath)
    .data.publicUrl;

  return {
    publicUrl,
    filePath,
    fileName,
    originalName: file.name,
  };
}
