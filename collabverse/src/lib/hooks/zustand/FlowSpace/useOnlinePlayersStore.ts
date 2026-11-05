import { PlayerMovement, WorldPlayer } from "@/app/interfaces";
import { create } from "zustand";

type onlinePlayersStore = {
  onlinePlayers: Record<string, WorldPlayer>;
  setOnlinePlayers: (players: Record<string, WorldPlayer>) => void;
  playerMovements: Record<string, PlayerMovement>;
  setPlayerMovements: (movement: PlayerMovement) => void;
};
export const useOnlinePlayers = create<onlinePlayersStore>((set) => ({
  onlinePlayers: {},
  playerMovements: {},
  setOnlinePlayers: (players) =>
    set((state) => {
      const playerMovements = { ...state.playerMovements };
      for (const playerId of Object.keys(playerMovements)) {
        if (!players[playerId]) {
          delete playerMovements[playerId];
        }
      }
      return {
        onlinePlayers: players,
        playerMovements,
      };
    }),
  setPlayerMovements: (movement) => {
    set((state) => {
      const current = state.playerMovements[movement.playerId];
      if (
        current?.sequence !== undefined &&
        movement.sequence !== undefined &&
        movement.sequence < current.sequence
      ) {
        return state;
      }
      const playerMovements = { ...state.playerMovements };
      playerMovements[movement.playerId] = movement;
      return {
        playerMovements,
      };
    });
  },
}));
