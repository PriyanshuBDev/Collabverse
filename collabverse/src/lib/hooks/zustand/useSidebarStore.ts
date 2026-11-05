import { chatListProps } from "@/app/interfaces";
import { create } from "zustand";

type sidebarStore = {
  byId: Record<string, chatListProps>;
  sidebarIds: string[];
  merge: (incoming: chatListProps[]) => void;
  mergeSearch: (incoming: chatListProps[]) => void;
  upsertOnlyData: (
    conversation: Partial<chatListProps> & {
      id: string;
    },
  ) => void;
  upsert: (
    conversation: Partial<chatListProps> & {
      id: string;
    },
  ) => void;
  remove: (conversationId: string) => void;
};

export const useSidebarStore = create<sidebarStore>((set) => ({
  byId: {},
  sidebarIds: [],
  merge: (incoming) =>
    set((state) => {
      const byId = { ...state.byId };
      for (const convo of incoming) {
        byId[convo.id] = {
          ...byId[convo.id],
          ...convo,
        };
      }
      const sidebarIds = [
        ...new Set([
          ...state.sidebarIds,
          ...incoming.map((c: chatListProps) => c.id),
        ]),
      ];
      return {
        byId,
        sidebarIds,
      };
    }),
  mergeSearch: (incoming) =>
    set((state) => {
      const byId = { ...state.byId };
      for (const convo of incoming) {
        byId[convo.id] = {
          ...byId[convo.id],
          ...convo,
        };
      }
      return {
        byId,
      };
    }),
  upsertOnlyData: (conversation) =>
    set((state) => ({
      byId: {
        ...state.byId,
        [conversation.id]: {
          ...state.byId[conversation.id],
          ...conversation,
        },
      },
    })),
  upsert: (conversation) =>
    set((state) => {
      const byId = {
        ...state.byId,
        [conversation.id]: {
          ...state.byId[conversation.id],
          ...conversation,
        },
      };
      const sidebarIds = [...new Set([...state.sidebarIds, conversation.id])];
      return {
        byId,
        sidebarIds,
      };
    }),

  remove: (conversationId) =>
    set((state) => {
      const byId = {
        ...state.byId,
      };
      delete byId[conversationId];
      const sidebarIds = state.sidebarIds.filter(
        (id: string) => id !== conversationId,
      );
      return {
        byId,
        sidebarIds,
      };
    }),
}));
