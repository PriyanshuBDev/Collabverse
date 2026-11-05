import { create } from "zustand";

type Store = {
  userId: string | null;
  setUserId: (id: string | null) => void;
};

export const useShowUserStore = create<Store>((set) => ({
  userId: null,

  setUserId: (id) =>
    set({
      userId: id,
    }),
}));
