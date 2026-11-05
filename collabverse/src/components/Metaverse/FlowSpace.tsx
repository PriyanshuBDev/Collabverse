"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import BootScene from "@/FlowSpace/scenes/BootScene";
import PreloadScene from "@/FlowSpace/scenes/PreloadScene";
import WorldScene from "@/FlowSpace/scenes/WorldScene";
import useCurrentUser from "@/lib/hooks/useCurrentUser";
import { useFlowSpaceChannelRT } from "../wrappers/FlowSpaceChannelProvider";
import { DoorEvent, PlayerMovement } from "@/app/interfaces";
import { useEventsBroadcast } from "@/lib/hooks/realtime/FlowSpace/useEventsBroadcast";
import { useDoorsData } from "@/lib/queries/workspace/project/FlowSpace/useDoorsData";
import { useCurrentUserAppearance } from "@/lib/queries/user/appearance/useCurrentUserAppearance";
import { Doors } from "@prisma/client";
import { useFlowSpaceStore } from "@/lib/hooks/zustand/FlowSpace/useFlowSpaceStore";
import { PlayerSidebar } from "./PlayerSidebar";
import { useEventsListener } from "@/lib/hooks/realtime/FlowSpace/useEventsListener";
import { EmotePicker } from "./EmotePicker";
import { usePlayEmote } from "@/FlowSpace/helpers/emoteRuntime";
import { FlowSpaceSettings } from "./FlowSpaceSettings";
import { FlowSpaceLoadingScreen } from "./FlowSpaceLoadingScreen";
import { useWorldPresence } from "@/lib/hooks/realtime/FlowSpace/useWorldPresence";

export default function FlowSpace() {
  useWorldPresence();
  const gameRef = useRef<HTMLDivElement>(null);
  const { id: userId } = useCurrentUser();
  const { isSubscribed } = useFlowSpaceChannelRT();
  const [spawnMovement, setSpawnMovement] = useState<Omit<
    PlayerMovement,
    "playerId"
  > | null>(null);
  const [isOpenEmote, setIsOpenEmote] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [loadingPercent, setLoadingPercent] = useState(0);
  const [worldReady, setWorldReady] = useState(false);
  const { playEmote } = usePlayEmote();
  const sentInitialPosition = useRef(false);
  const { doorState, toggleDoorState } = useDoorsData();
  const requestedSnapshot = useRef(false);
  const movementSequence = useRef(0);
  const { data } = useCurrentUserAppearance();
  const { sendDoorState, sendPositionSnapshotRequest, sendMovement } =
    useEventsBroadcast();
  const pendingDoorToggles = useRef(new Set<string>());
  const [nearbyPlayerIds, setNearbyPlayerIds] = useState<string[]>([]);
  const onNearbyPlayersChanged = useCallback((playerIds: string[]) => {
    setNearbyPlayerIds(playerIds);
  }, []);
  const gameInstanceRef = useRef<Phaser.Game | null>(null);
  const currentMovementRef = useRef<Omit<PlayerMovement, "playerId"> | null>(
    null,
  );
  const getCurrentMovement = useCallback(() => currentMovementRef.current, []);
  useEventsListener(getCurrentMovement);

  const sendMovementAndRemember = useCallback(
    (movement: Omit<PlayerMovement, "playerId">) => {
      const sequencedMovement = {
        ...movement,
        sequence: ++movementSequence.current,
      };
      currentMovementRef.current = movement;
      sendMovement(sequencedMovement);
    },
    [sendMovement],
  );

  const hasAppearance = Boolean(data);

  const requestDoorToggle = useCallback(
    async (doorId: Doors, nextIsOpen: boolean) => {
      if (pendingDoorToggles.current.has(doorId)) return;

      pendingDoorToggles.current.add(doorId);

      const store = useFlowSpaceStore.getState();
      const previousIsOpen = store.doorState[doorId] ?? false;
      const event: DoorEvent = {
        doorId,
        isOpen: nextIsOpen,
      };

      store.setDoorState(event);

      try {
        await toggleDoorState.mutateAsync({
          doorId: doorId,
          enabled: nextIsOpen,
        });
        sendDoorState(event);
      } catch (e) {
        useFlowSpaceStore
          .getState()
          .setDoorState({ doorId, isOpen: previousIsOpen });
        console.error(e);
      } finally {
        pendingDoorToggles.current.delete(doorId);
      }
    },
    [sendDoorState, toggleDoorState],
  );
  const runtimeRef = useRef({
    userId,
    data,
    doorStates: doorState.data ?? [],
    sendMovementAndRemember,
    toggleDoorState,
    requestDoorToggle,
    isOpenEmote,
    onNearbyPlayersChanged,
  });
  runtimeRef.current = {
    userId,
    data,
    doorStates: doorState.data ?? [],
    sendMovementAndRemember,
    toggleDoorState,
    requestDoorToggle,
    isOpenEmote,
    onNearbyPlayersChanged,
  };
  useEffect(() => {
    if (
      !gameRef.current ||
      !userId ||
      !hasAppearance ||
      gameInstanceRef.current ||
      !doorState.isSuccess
    ) {
      return;
    }

    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width: gameRef.current.clientWidth,
      height: gameRef.current.clientHeight,
      parent: gameRef.current,
      backgroundColor: "#1a1a",
      render: {
        pixelArt: true,
        antialias: true,
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
      },
      scene: [BootScene, PreloadScene, WorldScene],
      callbacks: {
        preBoot: (game) => {
          const runtime = runtimeRef.current;
          game.registry.merge({
            localPlayerId: runtime.userId,
            onLoadingProgress: setLoadingPercent,
            onWorldReady: () => setWorldReady(true),
            onLocalSpawnReady: (movement: Omit<PlayerMovement, "playerId">) => {
              currentMovementRef.current = movement;
              setSpawnMovement(movement);
            },
            sendMovement: runtime.sendMovementAndRemember,
            doorState: runtime.doorStates ?? [],
            appearance: runtime.data,
            requestDoorToggle: runtime.requestDoorToggle,
            setOpenSidebar: () => {
              setIsOpen((prev) => !prev);
            },
            onNearbyPlayersChanged: runtime.onNearbyPlayersChanged,
            setIsOpenEmote: () => {
              setIsOpenEmote((prev) => !prev);
            },
            isOpenEmote: runtime.isOpenEmote,
          });
        },
      },
    });
    gameInstanceRef.current = game;
    return () => {
      if (gameInstanceRef.current === game) {
        gameInstanceRef.current = null;
      }
      game.destroy(true);
    };
  }, [hasAppearance, userId, doorState.isSuccess]);
  useEffect(() => {
    if (!isSubscribed) {
      sentInitialPosition.current = false;
      return;
    }
    if (!spawnMovement || sentInitialPosition.current) return;
    sendMovementAndRemember(spawnMovement);
    sentInitialPosition.current = true;
    if (!requestedSnapshot.current) {
      sendPositionSnapshotRequest(crypto.randomUUID());
      requestedSnapshot.current = true;
    }
  }, [
    sendMovementAndRemember,
    isSubscribed,
    spawnMovement,
    sendPositionSnapshotRequest,
  ]);
  useEffect(() => {
    gameInstanceRef.current?.registry.set("isSidebarOpen", isOpen);
  }, [isOpen]);
  useEffect(() => {
    gameInstanceRef.current?.registry.set("isOpenEmote", isOpenEmote);
  }, [isOpenEmote]);
  useEffect(() => {
    if (!data) return;
    const setDnd = useFlowSpaceStore.getState().setDnd;
    setDnd(data?.dnd);
    gameInstanceRef.current?.registry.set("appearance", data);
  }, [data]);

  return (
    <>
      {" "}
      <div className="relative h-full w-full overflow-hidden">
        <div ref={gameRef} className="w-full h-full" />
        {!worldReady ? (
          <FlowSpaceLoadingScreen progress={loadingPercent} />
        ) : (
          <>
            <PlayerSidebar
              setIsOpenAction={setIsOpen}
              isOpen={isOpen}
              nearbyPlayerIds={nearbyPlayerIds}
            />
            <EmotePicker
              open={isOpenEmote}
              onClose={() => setIsOpenEmote(false)}
              onSelect={(emote) => {
                playEmote(emote);
              }}
            />
            <FlowSpaceSettings
              isDnd={data?.dnd ?? false}
              musicLevel={data?.musicLevel ?? 0}
            />
          </>
        )}
      </div>
    </>
  );
}
