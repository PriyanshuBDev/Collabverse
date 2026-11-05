import Phaser from "phaser";
import {
  fullUserAppearance,
  PlayerMovement,
  TiledLayer,
  TiledMapData,
  TiledObject,
  TiledProperty,
  TiledTileset,
  WorldPlayer,
} from "@/app/interfaces";
import { Player, SendMovement } from "../entities/Player";
import { DoorAssets } from "../doors/DoorAssets";
import { RemotePlayer } from "@/FlowSpace/entities/RemotePlayer";
import { useOnlinePlayers } from "../../lib/hooks/zustand/FlowSpace/useOnlinePlayersStore";
import { useFlowSpaceStore } from "@/lib/hooks/zustand/FlowSpace/useFlowSpaceStore";
import { Doors } from "@prisma/client";
type DoorPart = {
  sprite: Phaser.GameObjects.Sprite;
  animationId: string;
};
type DoorEntry = {
  parts: DoorPart[];
  isOpen: boolean;
  collisionZone: Phaser.Physics.Arcade.Sprite;
  isAnimating: boolean;
};
type prop = {
  tileid: number;
  duration: number;
};
type propertyProp = {
  name: string;
  value: unknown;
};
type tileAnimProp = {
  id: number;
  animation?:
    | {
        tileid: number;
        duration: number;
      }[]
    | undefined;
};
type RequestDoorToggle = (doorId: string, nextIsOpen: boolean) => void;
type NearbyPlayersChanged = (playerIds: string[]) => void;
const PROMPT_WIDTH = 198;
const PROMPT_HEIGHT = 51;
const PROXIMITY_RADIUS = 160;
export default class WorldScene extends Phaser.Scene {
  private map!: Phaser.Tilemaps.Tilemap;
  private player!: Player;
  private depthLayerIndex = 0;
  private objectOrderInLayer = 0;
  private playerDepthLayerIndex = 4;
  private readonly FIXED_BELOW_LAYER_COUNT = 3;
  private depthLayerSize = 100000;
  private depthSortBase = 0;
  private depthAboveBase = 0;
  private depthSortStride = 1;

  private depthSortableObjects: {
    sprite: Phaser.GameObjects.Sprite;
    layerOrder: number;
    orderTie: number;
    groupId?: string;
  }[] = [];
  private doorSprites = new Map<string, DoorEntry>();
  private nearbyDoorId = null;
  private doorZones: Phaser.GameObjects.Zone[] = [];
  private doorPartSprites = new Map<string, Phaser.GameObjects.Sprite[]>();
  private DoorPrompt!: Phaser.GameObjects.Container;
  private DoorPromptText!: Phaser.GameObjects.Text;
  private openDoorKey!: Phaser.Input.Keyboard.Key;
  private listPrompt!: Phaser.GameObjects.Container;
  private listPromptText!: Phaser.GameObjects.Text;
  private openListKey!: Phaser.Input.Keyboard.Key;
  private emotePrompt!: Phaser.GameObjects.Container;
  private emotePromptText!: Phaser.GameObjects.Text;
  private openEmoteKey!: Phaser.Input.Keyboard.Key;
  private collisionGroup!: Phaser.Physics.Arcade.StaticGroup;
  private doorCollisionBodies = new Map<string, Phaser.Physics.Arcade.Sprite>();

  private remotePlayers = new Map<string, RemotePlayer>();
  private lastMovement = new Map<string, PlayerMovement>();

  private lastEmoteIds = new Map<string, string>();

  private unsubscribeDoorStore?: () => void;
  private pendingDoorStates = new Map<string, boolean>();
  private previousNearbyPlayerIds = new Set<string>();

  private nearbyCheckElapsed = 0;

  constructor() {
    super("WorldScene");
  }
  private subscribeToDoorStates() {
    this.unsubscribeDoorStore = useFlowSpaceStore.subscribe(
      (state, previous) => {
        for (const [doorId, isOpen] of Object.entries(state.doorState)) {
          if (previous.doorState[doorId] === isOpen) continue;
          this.applyDoorState(doorId, isOpen);
        }
      },
    );

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.unsubscribeDoorStore?.();
      this.unsubscribeDoorStore = undefined;
    });
  }
  private getSplitTilesetInfo(fileName: string): {
    chunkHeight: number;
    chunkCount: number;
    baseName: string;
  } | null {
    if (fileName === "Interiors_16x16.png") {
      return {
        chunkHeight: 4096,
        chunkCount: 5,
        baseName: "Interiors_16x16",
      };
    }

    if (fileName === "Interiors_32x32.png") {
      return {
        chunkHeight: 4096,
        chunkCount: 8,
        baseName: "Interiors_32x32",
      };
    }

    return null;
  }
  private findTiledObject(
    layers: TiledLayer[],
    name: string,
  ): TiledObject | undefined {
    for (const layer of layers) {
      if (layer.type === "objectgroup") {
        const object = layer.objects?.find(
          (item: TiledObject) => item.name === name,
        );
        if (object) return object;
      }

      if (layer.type === "group" && layer.layers) {
        const object = this.findTiledObject(layer.layers, name);
        if (object) return object;
      }
    }

    return undefined;
  }
  private positionPrompt(
    prompt: Phaser.GameObjects.Container,
    screenX: number,
    screenY: number,
  ) {
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    const centerX = camera.x + camera.width / 2;
    const centerY = camera.y + camera.height / 2;

    prompt.setScrollFactor(0);
    prompt.setScale(1 / zoom);
    prompt.setPosition(
      centerX + (screenX - centerX) / zoom,
      centerY + (screenY - centerY) / zoom,
    );
  }
  private repositionPrompts() {
    const camera = this.cameras.main;
    const gap = 8;
    const bottomPadding = 12;

    // Prompts use PROMPT_HEIGHT and are positioned from their top-left corner.
    let y = camera.height - bottomPadding - PROMPT_HEIGHT;

    const place = (prompt?: Phaser.GameObjects.Container) => {
      if (!prompt?.visible) return;

      this.positionPrompt(prompt, 12, y);
      y -= PROMPT_HEIGHT + gap;
    };

    // Bottom to top.
    place(this.emotePrompt);
    place(this.listPrompt);
    place(this.DoorPrompt);
  }
  create() {
    this.map = this.make.tilemap({
      key: "worldMap",
    });

    this.physics.world.setBounds(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
    );
    const mapData = this.registry.get("mapData") as TiledMapData;
    const tilesets: Phaser.Tilemaps.Tileset[] = [];
    for (const tiledTileset of mapData.tilesets) {
      if (!tiledTileset.image) continue;
      const fileName = tiledTileset.image.split("/").pop();
      if (!fileName) continue;
      if (this.getSplitTilesetInfo(fileName)) {
        continue;
      }
      const textureKey = `tileset-${fileName}`;
      const tileset = this.map.addTilesetImage(tiledTileset.name, textureKey);
      if (tileset) {
        tilesets.push(tileset);
      }
    }
    const interiors32 = mapData.tilesets.find(
      (tileset: TiledTileset) =>
        tileset.image?.split("/").pop() === "Interiors_32x32.png",
    );

    if (interiors32) {
      const tileWidth = interiors32.tilewidth;
      const tileHeight = interiors32.tileheight;

      const columns = interiors32.columns ?? 16;

      const rowsPerChunk = 4096 / tileHeight;

      const tilesPerChunk = columns * rowsPerChunk;

      for (let chunkIndex = 0; chunkIndex < 8; chunkIndex++) {
        const textureKey = `tileset-Interiors_32x32-${chunkIndex}`;

        const texture = this.textures.get(textureKey);

        if (!texture) {
          console.warn("Interiors chunk texture not found:", textureKey);

          continue;
        }

        const chunkFirstGid = interiors32.firstgid + chunkIndex * tilesPerChunk;

        const chunkHeight = Math.min(
          4096,
          (interiors32.imageheight ?? 0) - chunkIndex * 4096,
        );

        const tileset = new Phaser.Tilemaps.Tileset(
          `Interiors_32x32-${chunkIndex}`,
          chunkFirstGid,
          tileWidth,
          tileHeight,
          interiors32.margin ?? 0,
          interiors32.spacing ?? 0,
        );

        tileset.setImage(texture);

        tileset.updateTileData(interiors32.imagewidth ?? 512, chunkHeight);

        tilesets.push(tileset);
      }
    }
    this.createUsedTilesetFrames(mapData);
    this.collisionGroup = this.physics.add.staticGroup();
    const visualLayerCount = this.countDepthLayers(mapData.layers);

    this.depthSortStride = visualLayerCount + 1;

    // A whole Y-sort band must fit between fixed layer bands.
    this.depthLayerSize = (this.map.heightInPixels + 2) * this.depthSortStride;

    this.depthSortBase = visualLayerCount * this.depthLayerSize;

    this.depthAboveBase = (visualLayerCount + 1) * this.depthLayerSize;
    this.createLayersInOrder(mapData.layers, tilesets);
    this.subscribeToDoorStates();
    const spawns = ["Spawn1", "Spawn2"]
      .map((name: string) => this.findTiledObject(mapData.layers, name))
      .filter(
        (spawn: TiledObject | undefined): spawn is TiledObject =>
          spawn !== undefined,
      );
    if (spawns.length === 0) {
      throw new Error("No spawn points were found");
    }
    const spawn = Phaser.Utils.Array.GetRandom(spawns);
    const sendMovement = this.registry.get("sendMovement") as SendMovement;
    const currentUser = this.registry.get("appearance") as fullUserAppearance;
    this.player = new Player(
      this,
      spawn.x,
      spawn.y,
      {
        ...currentUser.appearance,
      },
      sendMovement,
    );
    const onLocalSpawnReady = this.registry.get("onLocalSpawnReady") as (
      movement: Omit<PlayerMovement, "playerId">,
    ) => void;
    onLocalSpawnReady({
      x: this.player.body.x,
      y: this.player.body.y,
      direction: this.player.character.getDirection(),
      moving: false,
    });
    this.physics.add.collider(this.player.body, this.collisionGroup);
    this.player.body.setData("depthGroupId", "__player__");
    const camera = this.cameras.main;
    camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
    camera.setRoundPixels(true);
    camera.startFollow(this.player.body, true, 0.08, 0.08);
    camera.setZoom(2);
    camera.setDeadzone(160, 96);
    this.initializeDoorInteraction();
    this.createListPromptButton();
    this.createEmotePromptButton();
    this.repositionPrompts();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.repositionPrompts, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.repositionPrompts, this);
    });
    const onWorldReady = this.game.registry.get("onWorldReady") as () => void;
    onWorldReady();
  }
  private createListPromptButton() {
    const ListPromptBackground = this.add.graphics();
    ListPromptBackground.fillStyle(0x232323, 0.94);
    ListPromptBackground.lineStyle(1, 0xffffff, 0.2);
    ListPromptBackground.fillRoundedRect(0, 0, PROMPT_WIDTH, PROMPT_HEIGHT, 8);
    ListPromptBackground.strokeRoundedRect(
      0,
      0,
      PROMPT_WIDTH,
      PROMPT_HEIGHT,
      8,
    );

    const button = this.add.circle(25, 25, 16.5, 0x4ade80);

    const buttonText = this.add
      .text(25, 25, "Q", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "15px",
        color: "#102016",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.listPromptText = this.add.text(51, 17, "Open proximity list", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
    });

    this.listPrompt = this.add
      .container(16, 16, [
        ListPromptBackground,
        button,
        buttonText,
        this.listPromptText,
      ])
      .setDepth(10000000000)
      .setScrollFactor(0)
      .setVisible(false);

    this.positionPrompt(this.listPrompt, 12, this.cameras.main.height - 88);
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable in this scene.");
    }

    this.openListKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }
  private createEmotePromptButton() {
    const EmotePromptBackground = this.add.graphics();
    EmotePromptBackground.fillStyle(0x232323, 0.94);
    EmotePromptBackground.lineStyle(1, 0xffffff, 0.2);
    EmotePromptBackground.fillRoundedRect(0, 0, PROMPT_WIDTH, PROMPT_HEIGHT, 8);
    EmotePromptBackground.strokeRoundedRect(
      0,
      0,
      PROMPT_WIDTH,
      PROMPT_HEIGHT,
      8,
    );

    const button = this.add.circle(25, 25, 16.5, 0x4ade80);

    const buttonText = this.add
      .text(25, 25, "E", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "15px",
        color: "#102016",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.emotePromptText = this.add.text(51, 17, "Open emotes", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
    });

    this.emotePrompt = this.add
      .container(16, 16, [
        EmotePromptBackground,
        button,
        buttonText,
        this.emotePromptText,
      ])
      .setDepth(10000000000)
      .setScrollFactor(0)
      .setVisible(true);

    this.positionPrompt(this.emotePrompt, 12, this.cameras.main.height - 46);
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable in this scene.");
    }

    this.openEmoteKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
  }
  private createLayersInOrder(
    layers: TiledLayer[],
    tilesets: Phaser.Tilemaps.Tileset[],
    parentPath = "",
  ): void {
    for (const layer of layers) {
      const layerPath = parentPath ? `${parentPath}/${layer.name}` : layer.name;

      if (layer.type === "tilelayer") {
        const tileLayer = this.map.createLayer(layerPath, tilesets, 0, 0);

        tileLayer?.setDepth(this.depthLayerIndex * this.depthLayerSize);

        this.depthLayerIndex++;
        continue;
      }

      if (layer.type === "objectgroup" && layer.objects) {
        if (layer.name === "Collision") {
          this.createCollisionObjects(layer);
        } else {
          this.objectOrderInLayer = 0;

          const depthMode = this.getLayerDepthMode(layer, this.depthLayerIndex);

          this.createObjects(layer, this.depthLayerIndex, depthMode);

          this.depthLayerIndex++;
        }

        continue;
      }

      if (layer.type === "group" && layer.layers) {
        this.createLayersInOrder(layer.layers, tilesets, layerPath);
      }
    }
  }
  private initializeDoorInteraction() {
    for (const door of DoorAssets) {
      this.anims.create({
        key: `${door.id}-open`,
        frames: this.anims.generateFrameNames(door.id, {
          start: door.start,
          end: door.end,
        }),
        frameRate: 8,
        repeat: 0,
      });
      this.anims.create({
        key: `${door.id}-close`,
        frames: this.anims.generateFrameNames(door.id, {
          start: door.end,
          end: door.start,
        }),
        frameRate: 8,
        repeat: 0,
      });
    }
    for (const [doorId, sprites] of this.doorPartSprites) {
      const collisionZone = this.doorCollisionBodies.get(doorId);

      if (!collisionZone) {
        console.warn(`No collision object found for doorId "${doorId}"`);
        continue;
      }

      const parts = sprites.map((sprite: Phaser.GameObjects.Sprite) => ({
        sprite,
        animationId: sprite.name,
      }));

      for (const part of parts) {
        const animationExists = DoorAssets.some(
          (asset) => asset.id === part.animationId,
        );

        if (!animationExists) {
          console.warn(
            `No DoorAssets entry matches visual object name "${part.animationId}"`,
          );
        }
      }

      this.doorSprites.set(doorId, {
        parts,
        collisionZone,
        isOpen: false,
        isAnimating: false,
      });
    }
    const initialOpenDoors = this.registry.get("doorState") as Doors[];

    for (const doorId of this.doorSprites.keys()) {
      const isOpen = initialOpenDoors.includes(doorId as Doors);

      if (isOpen) {
      }

      this.setInitialDoorState(doorId, isOpen);
    }
    const interactionLayer = this.map.getObjectLayer("Interaction");
    if (interactionLayer) {
      for (const obj of interactionLayer?.objects) {
        if (!obj.name?.endsWith("In")) continue;
        const properties = obj.properties as TiledProperty[];
        const doorId = properties.find(
          (p: TiledProperty) => p.name === "doorId",
        )?.value;
        if (!doorId) continue;
        const zone = this.add.zone(
          (obj.x ?? 0) + (obj.width ?? 0) / 2,
          (obj.y ?? 0) + (obj.height ?? 0) / 2,
          obj.width ?? 0,
          obj.height ?? 0,
        );
        this.physics.add.existing(zone, true);
        zone.setData("doorId", doorId);
        this.doorZones.push(zone);
      }
    }
    const DoorPromptBackground = this.add.graphics();
    DoorPromptBackground.fillStyle(0x232323, 0.94);
    DoorPromptBackground.lineStyle(1, 0xffffff, 0.2);
    DoorPromptBackground.fillRoundedRect(0, 0, PROMPT_WIDTH, PROMPT_HEIGHT, 8);
    DoorPromptBackground.strokeRoundedRect(
      0,
      0,
      PROMPT_WIDTH,
      PROMPT_HEIGHT,
      8,
    );

    const button = this.add.circle(25, 25, 16.5, 0x4ade80);

    const buttonText = this.add
      .text(25, 25, "R", {
        fontFamily: "Trebuchet MS, Arial, sans-serif",
        fontSize: "15px",
        color: "#102016",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.DoorPromptText = this.add.text(51, 17, "Open door", {
      fontFamily: "Trebuchet MS, Arial, sans-serif",
      fontSize: "12px",
      color: "#ffffff",
    });

    this.DoorPrompt = this.add
      .container(16, 16, [
        DoorPromptBackground,
        button,
        buttonText,
        this.DoorPromptText,
      ])
      .setDepth(10000000000)
      .setScrollFactor(0)
      .setVisible(false);
    const camera = this.cameras.main;
    const uiScale = 1 / camera.zoom;

    this.DoorPrompt.setScale(uiScale);
    const height = this.previousNearbyPlayerIds.size > 0 ? 130 : 88;
    this.positionPrompt(this.DoorPrompt, 12, this.cameras.main.height - height);
    const keyboard = this.input.keyboard;

    if (!keyboard) {
      throw new Error("Keyboard input is unavailable in this scene.");
    }

    this.openDoorKey = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
  }
  private setInitialDoorState(doorId: string, isOpen: boolean) {
    const door = this.doorSprites.get(doorId);
    if (!door) return;

    door.isOpen = isOpen;

    for (const part of door.parts) {
      const animation = this.anims.get(
        `${part.animationId}-${isOpen ? "open" : "close"}`,
      );

      const finalFrame = animation?.frames.at(-1)?.frame;
      if (finalFrame) {
        part.sprite.setFrame(finalFrame);
      }
    }

    const body = door.collisionZone.body;
    if (body && doorId !== "StoreroomDoor") {
      body.enable = !isOpen;
    }
  }
  private createCollisionObjects(layer: TiledLayer): void {
    if (!layer.objects) return;

    for (const object of layer.objects) {
      const width = object.width ?? 0;
      const height = object.height ?? 0;

      if (width <= 0 || height <= 0) continue;

      const body = this.collisionGroup.create(
        (object.x ?? 0) + width / 2,
        (object.y ?? 0) + height / 2,
        undefined,
      );

      body.setSize(width, height);
      body.setVisible(false);

      const isDoor = object.properties?.some(
        (property) => property.name === "type" && property.value === "door",
      );
      const doorId = this.getObjectProperty(object, "doorId");

      if (isDoor && typeof doorId === "string") {
        if (this.doorCollisionBodies.has(doorId)) {
          console.warn(
            `More than one door collision object has doorId "${doorId}"`,
          );
          continue;
        }

        this.doorCollisionBodies.set(doorId, body);
      }
    }
  }
  private createUsedTilesetFrames(mapData: TiledMapData): void {
    const usedTiles = new Map<number, Set<number>>();

    const collectObjects = (layers: TiledLayer[]) => {
      for (const layer of layers) {
        if (layer.type === "objectgroup" && layer.objects) {
          for (const object of layer.objects) {
            if (!object.gid) continue;

            const { gid } = this.getCleanGid(object.gid);

            const tilesetIndex = mapData.tilesets.findIndex(
              (tileset: TiledTileset, index: number) => {
                const nextTileset = mapData.tilesets[index + 1];

                if (!nextTileset) {
                  return gid >= tileset.firstgid;
                }

                return gid >= tileset.firstgid && gid < nextTileset.firstgid;
              },
            );

            if (tilesetIndex === -1) continue;

            const tileset = mapData.tilesets[tilesetIndex];

            const localTileId = gid - tileset.firstgid;

            if (!usedTiles.has(tilesetIndex)) {
              usedTiles.set(tilesetIndex, new Set<number>());
            }

            usedTiles.get(tilesetIndex)!.add(localTileId);
          }
        }

        if (layer.type === "group" && layer.layers) {
          collectObjects(layer.layers);
        }
      }
    };

    collectObjects(mapData.layers);

    usedTiles.forEach((tileIds, tilesetIndex) => {
      const tiledTileset = mapData.tilesets[tilesetIndex];

      if (!tiledTileset.image) return;

      const fileName = tiledTileset.image.split("/").pop();

      if (!fileName) return;
      const splitInfo = this.getSplitTilesetInfo(fileName);

      const tileWidth = tiledTileset.tilewidth;

      const tileHeight = tiledTileset.tileheight;

      const margin = tiledTileset.margin ?? 0;

      const spacing = tiledTileset.spacing ?? 0;

      const columns =
        tiledTileset.columns ??
        Math.floor(
          ((tiledTileset.imagewidth ?? 0) - margin * 2 + spacing) /
            (tileWidth + spacing),
        );
      for (const tile of tiledTileset.tiles ?? []) {
        if (!tile.animation) continue;

        tileIds.add(tile.id);

        for (const frame of tile.animation) {
          tileIds.add(frame.tileid);
        }
      }
      for (const tileId of tileIds) {
        const column = tileId % columns;

        const row = Math.floor(tileId / columns);

        const x = margin + column * (tileWidth + spacing);

        const y = margin + row * (tileHeight + spacing);

        const frameName = `tile-${tilesetIndex}-${tileId}`;
        if (splitInfo) {
          const chunkIndex = Math.floor(y / splitInfo.chunkHeight);
          const localY = y - chunkIndex * splitInfo.chunkHeight;
          const textureKey = `tileset-${splitInfo.baseName}-${chunkIndex}`;
          const texture = this.textures.get(textureKey);
          if (!texture) {
            console.warn("Split texture not found:", textureKey);
            continue;
          }
          if (texture.has(frameName)) {
            continue;
          }
          texture.add(frameName, 0, x, localY, tileWidth, tileHeight);
          continue;
        }
        const textureKey = `tileset-${fileName}`;

        const texture = this.textures.get(textureKey);

        if (!texture) {
          console.warn(`Texture not found: ${textureKey}`);
          return;
        }

        if (texture.has(frameName)) {
          continue;
        }

        texture.add(frameName, 0, x, y, tileWidth, tileHeight);
      }
    });
  }

  private createObjects(
    layer: TiledLayer,

    depthLayerIndex: number,
    depthMode: "belowPlayer" | "ySort" | "abovePlayer",
  ): void {
    if (!layer.objects) return;
    const mapData = this.registry.get("mapData") as TiledMapData;
    for (const object of layer.objects) {
      if (!object.gid) continue;
      const raw = object.gid;
      const { gid, flipHorizontal, flipVertical } = this.getCleanGid(raw);
      const tiledTilesetIndex = mapData.tilesets.findIndex(
        (tiledTileset: TiledTileset, index: number) => {
          const nextTileset = mapData.tilesets[index + 1];
          if (!nextTileset) {
            return gid >= tiledTileset.firstgid;
          }
          return gid >= tiledTileset.firstgid && gid < nextTileset.firstgid;
        },
      );
      if (tiledTilesetIndex === -1) {
        console.warn("No tileset found for object GID:", gid);
        continue;
      }
      const tiledTileset = mapData.tilesets[tiledTilesetIndex];

      const localTileId = gid - tiledTileset.firstgid;

      const fileName = tiledTileset.image?.split("/").pop();
      if (!fileName) {
        console.warn(`No image for tileset "${tiledTileset.name}"`);
        continue;
      }
      const splitInfo = this.getSplitTilesetInfo(fileName);
      let textureKey: string;
      if (splitInfo) {
        const columns =
          tiledTileset.columns ??
          Math.floor(
            ((tiledTileset.imagewidth ?? 0) -
              (tiledTileset.margin ?? 0) * 2 +
              (tiledTileset.spacing ?? 0)) /
              (tiledTileset.tilewidth + (tiledTileset.spacing ?? 0)),
          );

        const row = Math.floor(localTileId / columns);

        const y =
          (tiledTileset.margin ?? 0) +
          row * (tiledTileset.tileheight + (tiledTileset.spacing ?? 0));

        const chunkIndex = Math.floor(y / splitInfo.chunkHeight);

        textureKey = `tileset-${splitInfo.baseName}-${chunkIndex}`;
      } else {
        textureKey = `tileset-${fileName}`;
      }

      const frameName = `tile-${tiledTilesetIndex}-${localTileId}`;
      const texture = this.textures.get(textureKey);
      if (!texture) {
        console.warn("Texture not found:", textureKey);

        continue;
      }
      if (!texture.has(frameName)) {
        console.warn("Tile frame not found:", {
          gid,
          localTileId,
          tileset: tiledTileset.name,
          textureKey,
          frameName,
        });

        continue;
      }

      const sprite = this.add.sprite(object.x, object.y, textureKey, frameName);

      sprite.setOrigin(0, 1);
      if (layer.name === "doors") {
        const doorId = this.getObjectProperty(object, "doorId");

        // The Tiled object name matches the DoorAssets id.
        const animationId = object.name;

        if (typeof doorId === "string" && typeof animationId === "string") {
          sprite.name = animationId;
          sprite.setData("doorId", doorId);

          const parts = this.doorPartSprites.get(doorId) ?? [];
          parts.push(sprite);
          this.doorPartSprites.set(doorId, parts);
        }
      }

      sprite.setData("depthLayerIndex", depthLayerIndex);

      const objectOrderIndex = this.objectOrderInLayer++;

      const orderTie =
        (objectOrderIndex + 1) / ((layer.objects?.length ?? 0) + 1);

      const groupId = this.getObjectProperty(object, "groupId");

      const depthSortProperty = object.properties?.find(
        (property: TiledProperty) => property.name === "depthSort",
      );

      const depthSortable = depthSortProperty?.value !== false;

      sprite.setData("depthLayerIndex", depthLayerIndex);
      sprite.setData("depthSortable", depthSortable);

      if (typeof groupId === "string" && groupId.length > 0) {
        sprite.setData("depthGroupId", groupId);
      }

      if (depthMode === "ySort" && depthSortable) {
        this.depthSortableObjects.push({
          sprite,
          layerOrder: depthLayerIndex,
          orderTie: orderTie * 0.25,
          groupId:
            typeof groupId === "string" && groupId.length > 0
              ? groupId
              : undefined,
        });
      } else if (depthMode === "abovePlayer") {
        sprite.setDepth(this.depthAboveBase + depthLayerIndex + orderTie);
      } else {
        // Fixed layer depth; layers 1–3 remain beneath the Y-sort band.
        sprite.setDepth(depthLayerIndex * this.depthLayerSize + orderTie);
      }

      // Animation part do not touch
      const tileData = tiledTileset.tiles?.find(
        (tile: tileAnimProp) => tile.id === localTileId,
      );

      if (tileData?.animation?.length) {
        const animationKey = this.createTileAnimation(
          tiledTilesetIndex,
          localTileId,
          tileData.animation,
        );
        sprite.play(animationKey);
      }
      sprite.setVisible(true);
      sprite.setFlipX(flipHorizontal);
      sprite.setFlipY(flipVertical);
      if (object.rotation) {
        sprite.setRotation(Phaser.Math.DegToRad(object.rotation));
      }
      if (object.visible === false) {
        sprite.setVisible(false);
      }
    }
  }
  private countDepthLayers(layers: TiledLayer[]): number {
    let count = 0;

    for (const layer of layers) {
      if (layer.type === "tilelayer") {
        count++;
      } else if (
        layer.type === "objectgroup" &&
        layer.objects &&
        layer.name !== "Collision"
      ) {
        count++;
      } else if (layer.type === "group" && layer.layers) {
        count += this.countDepthLayers(layer.layers);
      }
    }

    return count;
  }

  private getLayerDepthMode(
    layer: TiledLayer,
    depthLayerIndex: number,
  ): "belowPlayer" | "ySort" | "abovePlayer" {
    const properties = (
      layer as TiledLayer & {
        properties?: { name: string; value: unknown }[];
      }
    ).properties;

    const mode = properties?.find(
      (property: propertyProp) => property.name === "depthMode",
    )?.value;

    if (mode === "belowPlayer" || mode === "ySort" || mode === "abovePlayer") {
      return mode;
    }

    return depthLayerIndex < this.FIXED_BELOW_LAYER_COUNT
      ? "belowPlayer"
      : "ySort";
  }

  private getObjectBottomY(sprite: Phaser.GameObjects.Sprite): number {
    // Sprites use origin (0, 1), so y is the bottom anchor.
    return sprite.y;
  }

  private getYSortDepth(
    y: number,
    layerOrder: number,
    orderTie: number,
  ): number {
    return (
      this.depthSortBase +
      Math.round(y) * this.depthSortStride +
      layerOrder +
      orderTie
    );
  }
  private getPlayerFeetY(): number {
    const body = this.player.body.body;
    return body?.bottom ?? this.player.character.container.y;
  }
  private updatePlayerDepth(): void {
    if (!this.player) return;

    // A grouped object's anchor is the bottommost visible piece.
    const groupBottomY = new Map<string, number>();

    for (const item of this.depthSortableObjects) {
      if (!item.groupId || !item.sprite.visible) continue;

      const bottomY = this.getObjectBottomY(item.sprite);
      const previous = groupBottomY.get(item.groupId);

      if (previous === undefined || bottomY > previous) {
        groupBottomY.set(item.groupId, bottomY);
      }
    }

    // Every piece in a group uses the group's same Y anchor.
    for (const item of this.depthSortableObjects) {
      if (!item.sprite.visible) continue;

      const y =
        item.groupId !== undefined
          ? (groupBottomY.get(item.groupId) ??
            this.getObjectBottomY(item.sprite))
          : this.getObjectBottomY(item.sprite);

      item.sprite.setDepth(
        this.getYSortDepth(y, item.layerOrder, item.orderTie),
      );
    }

    this.player.character.setDepth(
      this.getPlayerSortDepth(this.getPlayerFeetY()),
    );
  }

  private getObjectProperty(
    object: TiledObject,
    propertyName: string,
  ): unknown {
    return object.properties?.find(
      (property: TiledProperty) => property.name === propertyName,
    )?.value;
  }
  private getCleanGid(gid: number): {
    gid: number;
    flipHorizontal: boolean;
    flipVertical: boolean;
    flipDiagonal: boolean;
  } {
    const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
    const FLIPPED_VERTICALLY_FLAG = 0x40000000;
    const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

    return {
      gid:
        gid &
        ~(
          FLIPPED_HORIZONTALLY_FLAG |
          FLIPPED_VERTICALLY_FLAG |
          FLIPPED_DIAGONALLY_FLAG
        ),

      flipHorizontal: (gid & FLIPPED_HORIZONTALLY_FLAG) !== 0,

      flipVertical: (gid & FLIPPED_VERTICALLY_FLAG) !== 0,

      flipDiagonal: (gid & FLIPPED_DIAGONALLY_FLAG) !== 0,
    };
  }

  private createTileAnimation(
    tiledTilesetIndex: number,
    localTileId: number,
    animation: {
      tileid: number;
      duration: number;
    }[],
  ): string {
    const key = `tiled-animation-${tiledTilesetIndex}-${localTileId}`;
    if (this.anims.exists(key)) {
      return key;
    }
    this.anims.create({
      key,
      frames: animation.map((frame: prop) => ({
        key: this.getTileTextureKey(tiledTilesetIndex, frame.tileid),
        frame: `tile-${tiledTilesetIndex}-${frame.tileid}`,
        duration: frame.duration,
      })),
      repeat: -1,
    });
    return key;
  }
  private getTileTextureKey(
    tiledTilesetIndex: number,
    localTileId: number,
  ): string {
    const mapData = this.registry.get("mapData") as TiledMapData;
    const tiledTileset = mapData.tilesets[tiledTilesetIndex];
    const fileName = tiledTileset.image?.split("/").pop();
    if (!fileName) {
      throw new Error(`No image found for tileset index ${tiledTilesetIndex}`);
    }
    const splitInfo = this.getSplitTilesetInfo(fileName);
    if (!splitInfo) {
      return `tileset-${fileName}`;
    }
    const columns = tiledTileset.columns ?? 16;
    const tileHeight = tiledTileset.tileheight;
    const row = Math.floor(localTileId / columns);
    const y = row * tileHeight;
    const chunkIndex = Math.floor(y / splitInfo.chunkHeight);
    return `tileset-${splitInfo.baseName}-${chunkIndex}`;
  }
  private applyDoorState(doorId: string, isOpen: boolean): boolean {
    const door = this.doorSprites.get(doorId);

    if (!door || door.parts.length === 0) return false;
    if (door.isAnimating) {
      this.pendingDoorStates.set(doorId, isOpen);
      return true;
    }

    // Already at the requested state.
    if (door.isOpen === isOpen) return true;

    door.isAnimating = true;
    let remainingParts = door.parts.length;

    const onPartAnimationComplete = () => {
      remainingParts--;

      if (remainingParts > 0) return;

      door.isOpen = isOpen;
      door.isAnimating = false;
      const pendingIsOpen = this.pendingDoorStates.get(doorId);
      this.pendingDoorStates.delete(doorId);

      if (pendingIsOpen !== undefined && pendingIsOpen !== door.isOpen) {
        this.applyDoorState(doorId, pendingIsOpen);
        return;
      }
      const body = door.collisionZone.body;
      if (body && doorId !== "StoreroomDoor") {
        // Open: no collision. Closed: collision enabled.
        body.enable = !isOpen;
      }

      if (this.nearbyDoorId === doorId) {
        this.DoorPromptText.setText(
          doorId === "StoreroomDoor"
            ? "Open door"
            : isOpen
              ? "Close door"
              : "Open door",
        );
      }
    };

    for (const part of door.parts) {
      part.sprite.once(
        Phaser.Animations.Events.ANIMATION_COMPLETE,
        onPartAnimationComplete,
      );

      part.sprite.play(`${part.animationId}-${isOpen ? "open" : "close"}`);
    }

    return true;
  }
  private doorInteraction() {
    this.nearbyDoorId = null;

    for (const zone of this.doorZones) {
      const zoneBounds = new Phaser.Geom.Rectangle(
        zone.x - zone.width / 2,
        zone.y - zone.height / 2,
        zone.width,
        zone.height,
      );
      const body = this.player.body.body;
      if (!body) continue;

      const feetX = body.center.x;
      const feetY = body.bottom;
      if (Phaser.Geom.Rectangle.Contains(zoneBounds, feetX, feetY)) {
        this.nearbyDoorId = zone.getData("doorId");
        break;
      }
    }
    const shouldShowDoorPrompt = this.nearbyDoorId !== null;

    if (this.DoorPrompt.visible !== shouldShowDoorPrompt) {
      this.DoorPrompt.setVisible(shouldShowDoorPrompt);
      this.repositionPrompts();
    }
    if (this.nearbyDoorId !== null) {
      const door = this.doorSprites.get(this.nearbyDoorId);
      if (this.nearbyDoorId === "StoreroomDoor") {
        this.DoorPromptText.setText("Open door");
      } else {
        this.DoorPromptText.setText(door?.isOpen ? "Close door" : "Open door");
      }
      if (door && Phaser.Input.Keyboard.JustDown(this.openDoorKey)) {
        const requestDoorToggle = this.registry.get("requestDoorToggle") as
          | RequestDoorToggle
          | undefined;

        if (door && requestDoorToggle) {
          requestDoorToggle(this.nearbyDoorId, !door.isOpen);
        }
      }
    }
  }
  private updateRemotePlayer(delta: number) {
    const { onlinePlayers, playerMovements } = useOnlinePlayers.getState();

    const localPlayerId = this.registry.get("localPlayerId") as string;

    for (const [playerId, player] of Object.entries(onlinePlayers)) {
      if (playerId === localPlayerId) continue;
      const movement = playerMovements[playerId];
      if (!movement) continue;
      let remote = this.remotePlayers.get(playerId);
      if (!remote) {
        remote = new RemotePlayer(this, player as WorldPlayer, movement);
        this.remotePlayers.set(playerId, remote);
        this.lastMovement.set(playerId, movement);
      } else {
        remote.updatePresence(player);
        if (this.lastMovement.get(playerId) !== movement) {
          remote.setTarget(movement);
          this.lastMovement.set(playerId, movement);
        }
      }
      remote.update(delta);
      const localFeetOffset =
        this.getPlayerFeetY() - this.player.character.container.y;

      // Inside the remote-player loop, after remote.update(delta):
      const remoteFeetY = remote.character.container.y + localFeetOffset;
      remote.setDepth(this.getPlayerSortDepth(remoteFeetY));
    }
    for (const [playerId, remote] of this.remotePlayers) {
      if (!onlinePlayers[playerId]) {
        remote.destroy();
        this.remotePlayers.delete(playerId);
        this.lastMovement.delete(playerId);
      }
    }
  }
  private getPlayerSortDepth(feetY: number): number {
    const playerTie = Phaser.Math.Clamp(
      this.playerDepthLayerIndex + 0.5,
      0,
      this.depthSortStride - 0.5,
    );

    return this.getYSortDepth(
      feetY,
      this.playerDepthLayerIndex,
      playerTie - this.playerDepthLayerIndex,
    );
  }
  private hasLineOfSight(
    fromX: number,
    fromY: number,
    toX: number,
    toY: number,
  ): boolean {
    const line = new Phaser.Geom.Line(fromX, fromY, toX, toY);

    for (const child of this.collisionGroup.getChildren()) {
      const sprite = child as Phaser.Physics.Arcade.Sprite;
      const body = sprite.body as Phaser.Physics.Arcade.StaticBody | null;

      // Open doors have their collision body disabled.
      if (!body?.enable) continue;

      const bounds = new Phaser.Geom.Rectangle(
        body.x,
        body.y,
        body.width,
        body.height,
      );

      if (Phaser.Geom.Intersects.LineToRectangle(line, bounds)) {
        return false;
      }
    }

    return true;
  }
  private updateNearybyPlayers(delta: number) {
    this.nearbyCheckElapsed += delta;
    if (this.nearbyCheckElapsed < 100) return;
    this.nearbyCheckElapsed = 0;

    const localPlayerId = this.registry.get("localPlayerId") as string;
    const onNearbyPlayersChanged = this.registry.get(
      "onNearbyPlayersChanged",
    ) as NearbyPlayersChanged | undefined;

    if (!onNearbyPlayersChanged || !this.player.body.body) return;

    const localBody = this.player.body.body;
    const localX = localBody.center.x;
    const localY = localBody.bottom;
    const nearbyPlayerIds: string[] = [];
    for (const [playerId, remote] of this.remotePlayers) {
      if (playerId === localPlayerId) continue;
      const character = remote.character;
      const remoteX = character.container.x;
      const remoteY = character.container.y;
      const distance = Phaser.Math.Distance.Between(
        localX,
        localY,
        remoteX,
        remoteY,
      );
      if (
        distance <= PROXIMITY_RADIUS &&
        this.hasLineOfSight(localX, localY, remoteX, remoteY)
      ) {
        nearbyPlayerIds.push(playerId);
      }
    }
    const nextSet = new Set(nearbyPlayerIds);
    const unChanged =
      nextSet.size === this.previousNearbyPlayerIds.size &&
      [...nextSet].every((id) => this.previousNearbyPlayerIds.has(id));
    if (unChanged) return;
    this.previousNearbyPlayerIds = nextSet;
    onNearbyPlayersChanged(nearbyPlayerIds);
    this.listPrompt.setVisible(nearbyPlayerIds.length > 0);
    if (nearbyPlayerIds.length === 0) {
      this.listPromptText.setText("Open proximity list");
      this.repositionPrompts();
      return;
    }
    const isSidebarOpen = this.registry.get("isSidebarOpen") === true;
    this.listPromptText.setText(
      isSidebarOpen ? "Close proximity list" : "Open proximity list",
    );
    this.repositionPrompts();
  }
  private syncEmotes() {
    const activeEmotes = useFlowSpaceStore.getState().activeEmotes;
    const localPlayerId = this.registry.get("localPlayerId") as string;
    const localEvent = activeEmotes[localPlayerId];
    if (localEvent) {
      if (this.lastEmoteIds.get(localPlayerId) !== localEvent.eventId) {
        this.lastEmoteIds.set(localPlayerId, localEvent.eventId);

        this.player.character.playEmote(`emote-${localEvent.emote}`);
      }
    } else if (this.lastEmoteIds.has(localPlayerId)) {
      this.player.character.hideEmote();
      this.lastEmoteIds.delete(localPlayerId);
    }
    for (const [playerId, remote] of this.remotePlayers) {
      const event = activeEmotes[playerId];

      if (!event) {
        if (this.lastEmoteIds.has(playerId)) {
          remote.character.hideEmote();
          this.lastEmoteIds.delete(playerId);
        }
        continue;
      }

      if (this.lastEmoteIds.get(playerId) === event.eventId) continue;

      this.lastEmoteIds.set(playerId, event.eventId);

      remote.character.playEmote(`emote-${event.emote}`);
    }
  }
  private checkListKey() {
    if (
      this.previousNearbyPlayerIds.size > 0 &&
      Phaser.Input.Keyboard.JustDown(this.openListKey)
    ) {
      const setOpenSidebar = this.registry.get("setOpenSidebar") as
        | (() => void)
        | undefined;
      setOpenSidebar?.();
    }
  }
  private checkEmoteKey() {
    if (Phaser.Input.Keyboard.JustDown(this.openEmoteKey)) {
      const setOpenEmote = this.registry.get("setIsOpenEmote") as
        | (() => void)
        | undefined;
      setOpenEmote?.();
    }
    const isOpenEmote = this.registry.get("isOpenEmote") as boolean;
    this.emotePromptText.setText(isOpenEmote ? "Close emotes" : "Open emotes");
  }
  update(_time: number, delta: number) {
    if (!this.player) return;

    this.player.update(delta);
    this.updatePlayerDepth();
    this.doorInteraction();
    this.updateRemotePlayer(delta);
    this.syncEmotes();
    this.updateNearybyPlayers(delta);
    this.checkListKey();
    this.checkEmoteKey();
  }
}
