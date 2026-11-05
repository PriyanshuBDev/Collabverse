import { create } from "zustand";

interface userState {
  showUserId: string | null;
  setShowUserId: (showUserId: string | null) => void;
}
export const useOpenUser = create<userState>((set) => ({
  showUserId: null,
  setShowUserId: (showUserId) => set({ showUserId }),
}));
