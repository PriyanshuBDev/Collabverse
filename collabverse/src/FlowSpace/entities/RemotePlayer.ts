import Phaser from "phaser";
import { PlayerMovement, WorldPlayer } from "@/app/interfaces";
import { Character } from "../characters/character";
import { smoothNameTagText } from "../helpers/smoothTag";

const TAG_HEIGHT = 16;
const TAG_STATUS_HEIGHT = 23;
const TAG_GAP_ABOVE_PLAYER = 0;

const AVATAR_SIZE = 9;
const AVATAR_X = 2;
const AVATAR_CENTER_X = AVATAR_X + AVATAR_SIZE / 2;
const AVATAR_CENTER_Y = TAG_HEIGHT / 2;

const MIN_TAG_WIDTH = 30;
const TAG_RIGHT_PADDING = 3;
const AVATAR_NAME_GAP = 2;
const NAME_X = AVATAR_X + AVATAR_SIZE + AVATAR_NAME_GAP;

export class RemotePlayer {
  readonly character: Character;

  private x: number;
  private y: number;
  private targetX: number;
  private targetY: number;

  private readonly tag: Phaser.GameObjects.Container;
  private readonly avatarImage: Phaser.GameObjects.Image;
  private readonly avatarFallback: Phaser.GameObjects.Text;
  private readonly avatarMaskGraphics: Phaser.GameObjects.Graphics;

  private panel: Phaser.GameObjects.Image;
  private panelTextureKey: string;
  private nameText: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private tagHeight = TAG_HEIGHT;
  private tagWidth = MIN_TAG_WIDTH;
  constructor(
    private readonly scene: Phaser.Scene,
    private readonly player: WorldPlayer,
    movement: PlayerMovement,
  ) {
    this.x = this.targetX = movement.x;
    this.y = this.targetY = movement.y;

    this.character = new Character(
      scene,
      movement.x,
      movement.y,
      player.appearance,
    );

    this.avatarMaskGraphics = scene.add.graphics();
    this.avatarMaskGraphics.fillStyle(0x667eea, 1);
    this.avatarMaskGraphics.fillCircle(
      AVATAR_CENTER_X,
      AVATAR_CENTER_Y,
      AVATAR_SIZE / 2,
    );

    this.avatarFallback = smoothNameTagText(
      scene.add.text(
        AVATAR_CENTER_X,
        AVATAR_CENTER_Y,
        this.getInitial(player.name),
        {
          fontFamily: "Arial",
          fontSize: "6px",
          color: "#ffffff",
          fixedWidth: AVATAR_SIZE,
          fixedHeight: AVATAR_SIZE,
          align: "center",
        },
      ),
    ).setOrigin(0.5);

    this.avatarImage = scene.add
      .image(AVATAR_CENTER_X, AVATAR_CENTER_Y, "__MISSING_AVATAR_TEXTURE__")
      .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE)
      .setOrigin(0.5)
      .setVisible(false);

    this.nameText = smoothNameTagText(
      scene.add.text(NAME_X, AVATAR_CENTER_Y, player.username, {
        fontFamily: "Arial",
        fontSize: "5px",
        color: "#60A5FA",
        fontStyle: "bold",
        maxLines: 1,
      }),
    ).setOrigin(0, 0.5);

    this.statusText = smoothNameTagText(
      scene.add.text(this.tagWidth / 2, 17, "", {
        fontFamily: "Arial",
        fontSize: "7px",
        color: "#8de0c0",
        align: "center",
        maxLines: 1,
      }),
    )
      .setOrigin(0.5)
      .setVisible(false);
    this.tagWidth = Math.max(
      MIN_TAG_WIDTH,
      Math.ceil(NAME_X + this.nameText.width + TAG_RIGHT_PADDING),
    );
    this.panelTextureKey = "";
    this.panel = this.createPanel(this.tagWidth, this.tagHeight);
    this.tag = scene.add
      .container(0, 0, [
        this.panel,
        this.avatarMaskGraphics,
        this.avatarFallback,
        this.avatarImage,
        this.nameText,
        this.statusText,
      ])
      .setSize(this.tagWidth, this.tagHeight);

    // this.avatarImage.enableFilters();
    // this.avatarImage.filters!.internal.addMask(
    //   this.avatarMaskGraphics,
    //   false,
    //   scene.cameras.main,
    //   "world",
    // );

    this.updatePresence(player);
    this.loadAvatar(player.avatar, player.playerId);
    this.applyMovement(movement);
    this.updateTagPosition();
  }

  updatePresence(player: WorldPlayer) {
    const status = player.inCall
      ? { text: "In call", color: "#8de0c0" }
      : player.dnd
        ? { text: "⊘", color: "#b91c1c" }
        : null;

    const nextHeight = status ? TAG_STATUS_HEIGHT : TAG_HEIGHT;
    this.updatePanelHeight(nextHeight);

    this.statusText
      .setText(status?.text ?? "")
      .setColor(status?.color ?? "#ffffff")
      .setPosition(this.tagWidth / 2, 17)
      .setVisible(Boolean(status));

    this.updateTagPosition();
  }

  setTarget(movement: PlayerMovement) {
    this.targetX = movement.x;
    this.targetY = movement.y;
    this.applyMovement(movement);
  }

  update(delta: number) {
    const blend = 1 - Math.exp(-delta / 80);

    this.x += (this.targetX - this.x) * blend;
    this.y += (this.targetY - this.y) * blend;

    this.character.setPosition(Math.round(this.x), Math.round(this.y));
    this.updateTagPosition();
    this.character.update(delta);
  }

  setDepth(depth: number) {
    this.character.setDepth(depth);
    this.tag.setDepth(depth + 1);
  }

  destroy() {
    this.character.destroy();
    this.tag.destroy(true);
    this.scene.textures.remove(this.panelTextureKey);
  }

  private updateTagPosition() {
    const characterHeight = 48 * this.character.container.scaleY;

    this.tag.setPosition(
      Math.round(this.x - this.tagWidth / 2),
      Math.round(
        this.y - characterHeight - TAG_GAP_ABOVE_PLAYER - this.tagHeight,
      ),
    );

    this.tag.setDepth(this.character.container.depth + 1);
  }

  private applyMovement(movement: PlayerMovement) {
    this.character.setDirection(movement.direction);
    this.character.setMoving(movement.moving);
  }

  private getInitial(name: string): string {
    const parts = name.trim().split(" ").filter(Boolean);

    if (parts.length === 0) return "?";
    if (parts.length === 1) return parts[0][0]?.toUpperCase() ?? "?";

    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  private loadAvatar(avatarUrl: string | undefined, playerId: string) {
    if (!avatarUrl) return;

    const textureKey = `player-avatar-${playerId}`;

    const showAvatar = () => {
      if (!this.scene.sys.isActive()) return;
      if (!this.scene.textures.exists(textureKey)) return;

      const source = this.scene.textures
        .get(textureKey)
        .getSourceImage() as HTMLImageElement;

      const size = 64;
      const circleKey = `player-avatar-circle-${playerId}`;

      if (this.scene.textures.exists(circleKey)) {
        this.scene.textures.remove(circleKey);
      }
      const canvas = this.scene.textures.createCanvas(circleKey, size, size);

      if (!canvas) return;

      const context = canvas.context;
      const sourceWidth = source.naturalWidth || source.width;
      const sourceHeight = source.naturalHeight || source.height;
      const scale = Math.max(size / sourceWidth, size / sourceHeight);
      const drawWidth = sourceWidth * scale;
      const drawHeight = sourceHeight * scale;

      context.clearRect(0, 0, size, size);
      context.save();
      context.beginPath();
      context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      context.clip();
      context.drawImage(
        source,
        (size - drawWidth) / 2,
        (size - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
      context.restore();

      canvas.refresh();
      canvas.setFilter(Phaser.Textures.FilterMode.LINEAR);

      this.avatarImage
        .setTexture(circleKey)
        .setDisplaySize(AVATAR_SIZE, AVATAR_SIZE)
        .setVisible(true);

      this.avatarFallback.setVisible(false);
    };
    if (this.scene.textures.exists(textureKey)) {
      showAvatar();
      return;
    }

    const onAvatarLoadError = (file: Phaser.Loader.File) => {
      if (file.key !== textureKey) return;

      console.error("Avatar image failed to load:", file.src);
      this.scene.load.off(
        Phaser.Loader.Events.FILE_LOAD_ERROR,
        onAvatarLoadError,
      );
    };

    this.scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onAvatarLoadError);

    this.scene.load.once(`filecomplete-image-${textureKey}`, () => {
      this.scene.load.off(
        Phaser.Loader.Events.FILE_LOAD_ERROR,
        onAvatarLoadError,
      );
      showAvatar();
    });

    this.scene.load.image(textureKey, avatarUrl);
    this.scene.load.start();
  }

  private createPanel(width: number, height: number): Phaser.GameObjects.Image {
    const key = `remote-tag-${this.player.playerId}-${Phaser.Utils.String.UUID()}`;
    const canvas = this.scene.textures.createCanvas(key, width, height);

    if (!canvas) {
      throw new Error(`Could not create tag texture: ${key}`);
    }

    const context = canvas.context;
    context.fillStyle = "rgba(21, 25, 35, 0.92)";
    context.strokeStyle = "rgba(255, 255, 255, 0.18)";
    context.lineWidth = 1;

    context.beginPath();
    context.roundRect(0.5, 0.5, width - 1, height - 1, 4);
    context.fill();
    context.stroke();

    canvas.refresh();
    canvas.setFilter(Phaser.Textures.FilterMode.LINEAR);

    this.panelTextureKey = key;
    return this.scene.add.image(0, 0, key).setOrigin(0);
  }

  private updatePanelHeight(height: number) {
    if (height === this.tagHeight) return;

    const oldTextureKey = this.panelTextureKey;
    const newPanel = this.createPanel(this.tagWidth, height);
    const newTextureKey = this.panelTextureKey;

    this.panel.setTexture(newTextureKey).setDisplaySize(this.tagWidth, height);
    newPanel.destroy();
    this.scene.textures.remove(oldTextureKey);

    this.tagHeight = height;
    this.tag.setSize(this.tagWidth, height);
  }
}
