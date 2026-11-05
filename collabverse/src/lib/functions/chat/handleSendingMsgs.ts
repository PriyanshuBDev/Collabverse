import {
  chatMediaProps,
  CompleteChatProps,
  fileMeta,
  fileMetadata,
  msgDataFileForApi,
  msgDataForApi,
  rawChatProps,
} from "@/app/interfaces";
import {
  uploadFilesBatch,
  uploadFileXHR,
} from "@/lib/axios/upload/uploadFiles";
import { useChatStore } from "@/lib/hooks/zustand/useChatStore";
import getDuration from "./getDuration";
import { deleteFiles } from "@/lib/axios/workspace/conversation/messages/deleteFiles";
export async function optimisticFileBuilder(
  file: File,
  id: string,
  order: number,
) {
  const objUrl = URL.createObjectURL(file);

  const type = file.type.startsWith("image")
    ? "image"
    : file.type.startsWith("application")
      ? "application"
      : file.type.startsWith("audio")
        ? "audio"
        : "video";
  const properFile = {
    name: file.name,
    id,
    url: objUrl,
    format: file.type.split("/")[1],
    type,
    bytes: file.size,
    duration:
      type === "video" || type === "audio"
        ? await getDuration(objUrl, type)
        : undefined,
    order,
  };
  return properFile;
}
export async function handleSendingMsgs(
  msgs: rawChatProps[],
  mutateFunc: (
    msg: msgDataForApi,
    clientId: string,
  ) => Promise<CompleteChatProps>,
  conversationId: string,
  currentUserId: string,
) {
  const state = useChatStore.getState();
  if (msgs.length > 1) {
    const uploadTasks = msgs.map(async (msg: rawChatProps) => {
      const file = msg.media.at(0);
      if (!file) return;
      const fileId = crypto.randomUUID();
      const properFile = await optimisticFileBuilder(file, fileId, 1);
      state.addMessageRT(
        conversationId,
        {
          ...msg,
          replyToMsgId: msg.replyTo?.chatId,
          isDeleted: false,
          isDeletedForUser: false,
          isForwarded: false,
          isPinned: false,
          isRead: false,
          isReadByMe: true,
          media: [properFile],
          sending: {
            status: "uploading",
            progress: 0,
          },
          reactions: [],
        },
        currentUserId,
      );
      try {
        const { promise, cancel } = await uploadFileXHR({
          file,
          folder: "Chat_Media",
          id: conversationId,
          onProgress: (progress) => {
            state.updateMessages(conversationId, msg.id, {
              sending: {
                status: "uploading",
                progress,
              },
            });
          },
        });
        state.setCancelFn(msg.id, cancel);
        const uploaded = await promise;
        state.updateMessages(conversationId, msg.id, {
          sending: {
            status: "processing",
            progress: 100,
          },
        });
        const clientId = msg.id;
        const msgForApi: msgDataForApi = {
          clientId,
          ...msg,
          replyToMessageId: msg.replyTo?.chatId ?? null,
          content: msg.message ?? null,
          files: [
            {
              url: properFile.url,
              fileName: uploaded.fileName,
              originalName: uploaded.originalName,
              path: uploaded.path,
              format: properFile.format,
              type: properFile.type,
              size: uploaded.size,
              duration: properFile.duration ?? null,
            },
          ],
        };
        await mutateFunc(msgForApi, clientId);
      } catch (e) {
        console.error(e);
        state.updateMessages(conversationId, msg.id, {
          sending: {
            status: "failed",
            progress: 0,
          },
        });
      }
    });
    await Promise.allSettled(uploadTasks);
  } else {
    const msg = msgs.at(0);
    if (!msg) return;

    if (msg.media.length > 0) {
      const media: chatMediaProps[] = [];
      const mediaMap = new Map<string, chatMediaProps>();
      const filesWithId: fileMeta[] = [];
      await Promise.all(
        msg.media.map(async (m: File, i: number) => {
          const id = crypto.randomUUID();
          filesWithId.push({ id, file: m });

          const properFile = await optimisticFileBuilder(m, id, i);

          media.push(properFile);
          mediaMap.set(id, properFile);
        }),
      );

      state.addMessageRT(
        conversationId,
        {
          ...msg,
          replyToMsgId: msg.replyTo?.chatId,
          isDeleted: false,
          isDeletedForUser: false,
          isForwarded: false,
          isPinned: false,
          isRead: false,
          isReadByMe: true,
          media,
          sending: {
            status: "uploading",
            progress: 0,
          },
          reactions: [],
        },
        currentUserId,
      );
      try {
        const { promise, cancel } = await uploadFilesBatch(
          filesWithId,
          "Chat_Media",
          conversationId,
          (progress) => {
            state.updateMessages(conversationId, msg.id, {
              sending: {
                status: "uploading",
                progress,
              },
            });
          },
        );
        state.setCancelFn(msg.id, cancel);
        const results = await promise;
        const success: fileMetadata[] = [];
        const failed: unknown[] = [];
        for (const res of results) {
          if (res.status === "fulfilled") {
            success.push(res.value);
          } else {
            failed.push(res.reason);
          }
        }
        if (failed.length > 0) {
          if (success.length > 0) {
            await deleteFiles(success.map((s: fileMetadata) => s.path));
          }

          throw new Error("Upload failed");
        }
        state.updateMessages(conversationId, msg.id, {
          sending: {
            status: "processing",
            progress: 100,
          },
        });
        const fileForApi: msgDataFileForApi[] = [];
        for (const s of success) {
          const properFile = mediaMap.get(s.id);
          if (!properFile) continue;
          fileForApi.push({
            url: properFile.url,
            fileName: s.fileName,
            originalName: s.originalName,
            path: s.path,
            format: properFile.format,
            type: properFile.type,
            size: s.size,
            duration: properFile.duration ?? null,
          });
        }
        const clientId = msg.id;
        const msgForApi: msgDataForApi = {
          clientId,
          ...msg,
          replyToMessageId: msg.replyTo?.chatId ?? null,
          content: msg.message ?? null,
          files: fileForApi,
        };
        await mutateFunc(msgForApi, clientId);
      } catch (e) {
        console.error(e);
        state.updateMessages(conversationId, msg.id, {
          sending: {
            status: "failed",
            progress: 0,
          },
        });
      }
    } else {
      try {
        state.addMessageRT(
          conversationId,
          {
            ...msg,
            replyToMsgId: msg.replyTo?.chatId,
            isDeleted: false,
            isDeletedForUser: false,
            isForwarded: false,
            isPinned: false,
            isRead: false,
            isReadByMe: true,
            media: [],
            reactions: [],
          },
          currentUserId,
        );

        const clientId = msg.id;
        const msgForApi: msgDataForApi = {
          clientId,
          ...msg,
          replyToMessageId: msg.replyTo?.chatId ?? null,
          content: msg.message ?? null,
          files: [],
        };
        await mutateFunc(msgForApi, clientId);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
