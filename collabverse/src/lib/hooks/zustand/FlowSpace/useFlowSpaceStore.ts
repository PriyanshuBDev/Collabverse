import { DoorEvent, PlayerEmoteEvent } from "@/app/interfaces";
import {} from "@prisma/client";
import { create } from "zustand";

export type flowSpaceStore = {
  activeEmotes: Record<string, PlayerEmoteEvent>;
  showEmote: (emote: PlayerEmoteEvent) => void;
  clearEmote: (playerId: string, eventId: string) => void;
  doorState: Record<string, boolean>;
  setDoorState: (door: DoorEvent) => void;
  dnd: boolean;
  setDnd: (value: boolean) => void;
};

export const useFlowSpaceStore = create<flowSpaceStore>((set) => ({
  activeEmotes: {},
  doorState: {},
  dnd: false,
  showEmote: (emote) => {
    set((state) => {
      const activeEmotes = { ...state.activeEmotes };
      activeEmotes[emote.playerId] = emote;
      return {
        activeEmotes,
      };
    });
  },
  clearEmote: (playerId, eventId) => {
    set((state) => {
      const current = state.activeEmotes[playerId];
      if (!current || current.eventId !== eventId) return state;
      const activeEmotes = { ...state.activeEmotes };
      delete activeEmotes[playerId];
      return {
        activeEmotes,
      };
    });
  },
  setDoorState: (door) => {
    set((state) => {
      const doorState = { ...state.doorState };
      doorState[door.doorId] = door.isOpen;
      return {
        doorState,
      };
    });
  },
  setDnd: (value) => [set({ dnd: value })],
}));
