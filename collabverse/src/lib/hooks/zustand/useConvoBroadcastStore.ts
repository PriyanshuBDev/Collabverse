import { create } from "zustand";
type ConversationUsers = Record<string, string[]>;
type ConvoBroadcastState = {
  typingUsersByConversation: ConversationUsers;
  uploadingUsersByConversation: ConversationUsers;

  addTypingUsers: (conversationId: string, userId: string) => void;
  removeTypingUsers: (conversationId: string, userId: string) => void;
  addUploadingUsers: (conversationId: string, userId: string) => void;
  removeUploadingUsers: (conversationId: string, userId: string) => void;
};
export const useConvoBroadCastStore = create<ConvoBroadcastState>((set) => ({
  typingUsersByConversation: {},
  uploadingUsersByConversation: {},
  addTypingUsers: (conversationId, userId) =>
    set((state) => ({
      typingUsersByConversation: {
        ...state.typingUsersByConversation,
        [conversationId]: [
          ...new Set([
            ...(state.typingUsersByConversation[conversationId] ?? []),
            userId,
          ]),
        ],
      },
    })),
  removeTypingUsers: (conversationId, userId) =>
    set((state) => ({
      typingUsersByConversation: {
        ...state.typingUsersByConversation,
        [conversationId]: (
          state.typingUsersByConversation[conversationId] ?? []
        ).filter((id: string) => id !== userId),
      },
    })),
  addUploadingUsers: (conversationId, userId) =>
    set((state) => ({
      uploadingUsersByConversation: {
        ...state.uploadingUsersByConversation,
        [conversationId]: [
          ...new Set([
            ...(state.uploadingUsersByConversation[conversationId] ?? []),
            userId,
          ]),
        ],
      },
    })),
  removeUploadingUsers: (conversationId, userId) => {
    set((state) => ({
      uploadingUsersByConversation: {
        ...state.uploadingUsersByConversation,
        [conversationId]: (
          state.uploadingUsersByConversation[conversationId] ?? []
        ).filter((id: string) => id !== userId),
      },
    }));
  },
}));
