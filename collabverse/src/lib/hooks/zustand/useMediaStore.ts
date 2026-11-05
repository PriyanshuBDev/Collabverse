import { chatMediaProps } from "@/app/interfaces";
import { getSignedUrlsForChatMedia } from "@/lib/axios/workspace/conversation/messages/getSignedUrlsForChatMedia";
import { create } from "zustand";

export type signedUrl = {
  url: string;
  expiresAt: number;
};

export type urlByPath = {
  paths: Record<string, signedUrl>;
};

type MediaStore = {
  urls: Record<string, urlByPath>;
  ensureSignedUrls: (
    chatMedia: chatMediaProps[],
    workspaceId: string,
    conversationId: string,
    messageId: string,
  ) => Promise<void>;
};

const inFlight = new Map<string, Promise<void>>();
const REFRESH_BEFORE_EXPIRY_MS = 30_000;

export const useMediaStore = create<MediaStore>((set, get) => ({
  urls: {},

  ensureSignedUrls: async (
    chatMedia,
    workspaceId,
    conversationId,
    messageId,
  ) => {
    const refreshBefore = Date.now() + REFRESH_BEFORE_EXPIRY_MS;
    const missing = new Set<string>();

    for (const media of chatMedia) {
      if (media.url?.startsWith("blob:") || !media.path) continue;

      const cached = get().urls[messageId]?.paths[media.path];

      if (!cached || cached.expiresAt <= refreshBefore) {
        missing.add(media.path);
      } else {
        media.url = cached.url;
      }
    }

    const paths = [...missing].sort();
    if (paths.length === 0) return;

    const requestKey = JSON.stringify([
      workspaceId,
      conversationId,
      messageId,
      paths,
    ]);

    const existingRequest = inFlight.get(requestKey);
    if (existingRequest) {
      await existingRequest;
      return;
    }

    const request = (async () => {
      const signed = await getSignedUrlsForChatMedia({
        workspaceId,
        conversationId,
        messageId,
        paths,
      });

      set((state) => {
        const messagePaths = {
          ...state.urls[messageId]?.paths,
        };

        for (const item of signed) {
          messagePaths[item.path] = {
            url: item.url,
            expiresAt: item.expiresAt,
          };
        }

        return {
          urls: {
            ...state.urls,
            [messageId]: { paths: messagePaths },
          },
        };
      });
    })();

    inFlight.set(requestKey, request);

    try {
      await request;
    } finally {
      if (inFlight.get(requestKey) === request) {
        inFlight.delete(requestKey);
      }
    }
  },
}));
