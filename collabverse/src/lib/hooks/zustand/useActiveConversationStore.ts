import { create } from "zustand";

type Store = {
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
};

export const useActiveConversationStore = create<Store>((set) => ({
  activeConversationId: null,

  setActiveConversationId: (id) =>
    set({
      activeConversationId: id,
    }),
}));
