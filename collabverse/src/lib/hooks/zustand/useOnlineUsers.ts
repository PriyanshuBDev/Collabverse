import { create } from "zustand";
export type Presence = {
  userId: string;
  name: string;
  avatar?: string;
  workspaceId: string;
  activeConversationId: string | null;
  lastActivityAt: number;
};
type onlineUsersStore = {
  onlineUsers: Record<string, Presence>;
  setOnlineUsers: (users: Record<string, Presence>) => void;
};
export const useOnlineUsers = create<onlineUsersStore>((set) => ({
  onlineUsers: {},
  setOnlineUsers: (users) => set({ onlineUsers: users }),
}));
