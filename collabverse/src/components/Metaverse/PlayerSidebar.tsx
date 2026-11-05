import { Dispatch, SetStateAction } from "react";
import { useOnlinePlayers } from "@/lib/hooks/zustand/FlowSpace/useOnlinePlayersStore";
import { PlayerCard } from "./PlayerCard";
import { WorldPlayer } from "@/app/interfaces";

export function PlayerSidebar({
  isOpen,
  setIsOpenAction,
  nearbyPlayerIds,
}: {
  isOpen: boolean;
  setIsOpenAction: Dispatch<SetStateAction<boolean>>;
  nearbyPlayerIds: string[];
}) {
  const onlinePlayers = useOnlinePlayers((state) => state.onlinePlayers);
  const nearbyPlayers = nearbyPlayerIds
    .map((playerId: string) => onlinePlayers[playerId])
    .filter((player: WorldPlayer): player is WorldPlayer => Boolean(player));

  return (
    <>
      {/* Backdrop */}
      <button
        aria-label="Close player sidebar"
        tabIndex={isOpen ? 0 : -1}
        onClick={() => setIsOpenAction(false)}
        className={`absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-[2px]
          transition-opacity duration-300
          ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      {/* Toggle */}
      <button
        type="button"
        aria-label={isOpen ? "Close player list" : "Open player list"}
        aria-expanded={isOpen}
        onClick={() => setIsOpenAction((open) => !open)}
        className={`absolute right-0 top-1/2 z-40 grid h-14 w-10
  -translate-y-1/2 place-items-center rounded-l-2xl outline-0
  border border-r-0 border-white/10 bg-blk3/90 text-white
  shadow-xl backdrop-blur-xl
  transition-[right,width,background-color] duration-500
  ease-[cubic-bezier(0.22,1,0.36,1)]
  hover:w-12 hover:bg-blk4
  ${isOpen ? "right-[18rem]" : "right-0"}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={`h-5 w-5 transition-transform duration-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <path
            d="m9 18 6-6-6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Sidebar */}
      <aside
        aria-label="Online players"
        aria-hidden={!isOpen}
        className={`absolute bottom-0 right-0 top-0 z-30 flex w-72
          flex-col border-l border-white/10 bg-blk3/90 text-white
          shadow-2xl shadow-black/30 backdrop-blur-2xl
          transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <h2 className="text-sm font-semibold tracking-wide">People</h2>
            <p className="mt-1 text-xs text-slate-400">In your proximity</p>
          </div>

          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
            <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
            {nearbyPlayers.length} online
          </span>
        </header>

        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {nearbyPlayers.map((player: WorldPlayer, index: number) => {
            return (
              <PlayerCard
                key={player.playerId}
                isOpen={isOpen}
                index={index}
                player={player}
              />
            );
          })}

          {nearbyPlayers.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-slate-400">
              No people in proximity
            </p>
          )}
        </div>

        <footer className="border-t border-white/10 px-5 py-3 text-xs text-slate-500">
          A space that flows
        </footer>
      </aside>
    </>
  );
}
