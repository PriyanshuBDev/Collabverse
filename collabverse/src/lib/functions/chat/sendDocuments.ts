import uploadChatMedia from "./uploadChatMedia";
import api from "@/lib/axios";

export default async function sendDocuments(
  files: File[],
  chatId: string,
  userId: string,
  workspaceId: string,
  replyToMessageId: string,
) {
  for (const file of files) {
    const [type, format] = file.type.split("/");
    const tempMessageId = crypto.randomUUID();

    //   addMessageToUI({
    //   id: tempMessageId,
    //   type,
    //   name: file.name,
    //   status: "uploading",
    // });

    try {
      const upload = await uploadChatMedia(chatId, file);

      const savedMessage = await api.post("/api/chat/upload/document", {
        conversationId: chatId,
        type,
        format,
        size: file.size,
        path: upload.filePath,
        publicId: upload.publicUrl,
        originalName: upload.originalName,
        fileName: upload.fileName,
        senderId: userId,
        workspaceId,
        replyToMessageId,
      });
      //   updateMessage(tempMessageId, {
      //   id: savedMessage.data.id,
      //   status: "sent",
      //   fileUrl: upload.publicUrl,
      // });
    } catch (e) {
      //  updateMessage(tempMessageId, {
      //     status: "failed",
      //   });
      throw e;
    }
  }
}
