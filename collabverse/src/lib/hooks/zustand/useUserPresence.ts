import { create } from "zustand";

type Store = {
  userPresence: string | null;
  setUserPresence: (id: string | null) => void;
};

export const useActiveConversationStore = create<Store>((set) => ({
  userPresence: null,

  setUserPresence: (id) =>
    set({
      userPresence: id,
    }),
}));
