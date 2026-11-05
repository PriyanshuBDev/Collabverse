import Phaser from "phaser";
import { Character } from "../characters/character";
import { CharacterAppearance, PlayerMovement } from "@/app/interfaces";
import { useCallStore } from "@/lib/hooks/zustand/useCallStore";
import { useFlowSpaceStore } from "@/lib/hooks/zustand/FlowSpace/useFlowSpaceStore";
import {
  createSmoothTagBackground,
  smoothNameTagText,
} from "../helpers/smoothTag";
type MovementUpdate = Omit<PlayerMovement, "playerId">;
export type SendMovement = (movement: MovementUpdate) => void;
export class Player {
  readonly body: Phaser.Physics.Arcade.Sprite;
  readonly character: Character;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  };
  private speed = 100;
  private networkTimer = 0;
  private lastSent: MovementUpdate | null = null;
  private readonly networkInterval = 80;
  private readonly localTag!: Phaser.GameObjects.Container;
  private readonly dndIndicator!: Phaser.GameObjects.Text;
  private dotCenterX = 0;

  private wasMoving = false;
  constructor(
    private readonly scene: Phaser.Scene,
    x: number,
    y: number,
    appearance: CharacterAppearance,
    private sendMovement: SendMovement,
  ) {
    this.body = scene.physics.add.sprite(x, y, "body-01", "r0c0");
    this.body.setVisible(false);
    this.body.setSize(22, 14);
    this.body.setOffset(5, 18);

    this.character = new Character(scene, x, y, appearance);
    const inCall = useCallStore.getState().active;
    const inDnd = !inCall && useFlowSpaceStore.getState().dnd;
    const hasStatusRow = inCall || inDnd;
    const tagWidth = 40;
    const tagHeight = hasStatusRow ? 22 : 13;
    const firstRowCenterY = 4;
    const label = smoothNameTagText(
      scene.add.text(0, firstRowCenterY, "You", {
        fontFamily: "Arial",
        fontSize: "6px",
        color: "#ffffff",
        fontStyle: "bold",
      }),
    );

    const dotRadius = 2;
    const dotDiameter = dotRadius * 2;
    const labelGap = 3;

    const firstRowWidth = dotDiameter + labelGap + label.width;
    const firstRowLeft = (tagWidth - firstRowWidth) / 2;

    this.dotCenterX = firstRowLeft + dotRadius;
    label.setX(firstRowLeft + dotDiameter + labelGap);

    const background = createSmoothTagBackground(
      scene,
      tagWidth,
      tagHeight,
      7,
      this.dotCenterX,
    );

    const children: Phaser.GameObjects.GameObject[] = [background, label];

    if (inCall) {
      children.push(
        smoothNameTagText(
          scene.add
            .text(tagWidth / 2, 9, "In call", {
              fontFamily: "Arial",
              fontSize: "7px",
              color: "#8de0c0",
            })
            .setOrigin(0.5, 0),
        ),
      );
    }
    this.dndIndicator = smoothNameTagText(
      scene.add
        .text(tagWidth / 2, 11, "⊘", {
          fontFamily: "Arial",
          fontSize: "7px",
          color: "#b91c1c",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0)
        .setVisible(!inCall && inDnd),
    );

    children.push(this.dndIndicator);

    this.localTag = scene.add
      .container(0, 0, children)
      .setSize(tagWidth, tagHeight);
    const characterHeight = 48 * this.character.container.scaleY;

    this.localTag.setPosition(
      Math.round(this.body.x - tagWidth / 2),
      Math.round(this.body.y - characterHeight - this.localTag.height),
    );
    this.localTag.setDepth(this.character.container.depth + 1);
    const unsubscribeDnd = useFlowSpaceStore.subscribe((state, previous) => {
      if (state.dnd === previous.dnd) return;
      this.updateDndTag(state.dnd);
    });

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribeDnd);

    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, unsubscribeDnd);
    this.cursors = scene.input.keyboard!.createCursorKeys();
    this.keys = {
      W: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: scene.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    };
  }

  update(delta: number) {
    let x = 0;
    let y = 0;

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      y -= 1;
    }
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      x -= 1;
    }
    if (this.cursors.down.isDown || this.keys.S.isDown) {
      y += 1;
    }
    if (this.cursors.right.isDown || this.keys.D.isDown) {
      x += 1;
    }
    const moving = x !== 0 || y !== 0;

    if (!moving) {
      this.body.setVelocity(0, 0);
      this.character.setMoving(false);

      if (this.wasMoving) {
        this.sendMovement({
          x: this.body.x,
          y: this.body.y,
          direction: this.character.getDirection(),
          moving: false,
        });
      }

      this.wasMoving = false;
      this.character.update(delta);
      this.syncCharacter();
      return;
    }
    if (y !== 0) {
      x = 0;
    }
    this.body.setVelocity(x * this.speed, y * this.speed);

    if (Math.abs(x) > Math.abs(y)) {
      this.character.setDirection(x > 0 ? "right" : "left");
    } else {
      this.character.setDirection(y > 0 ? "down" : "up");
    }
    this.character.setMoving(true);

    this.character.update(delta);
    this.syncCharacter();
    this.broadcastMovement(delta, moving);
  }
  private updateDndTag(dnd: boolean) {
    const inCall = useCallStore.getState().active;
    const nextHeight = inCall || dnd ? 23 : 13;

    this.dndIndicator.setVisible(!inCall && dnd);

    if (this.localTag.height === nextHeight) return;

    const oldBackground = this.localTag.getAt(0) as Phaser.GameObjects.Image;
    const oldTextureKey = oldBackground.texture.key;

    oldBackground.destroy();
    this.scene.textures.remove(oldTextureKey);

    const background = createSmoothTagBackground(
      this.scene,
      40,
      nextHeight,
      6,
      this.dotCenterX,
    );

    this.localTag.addAt(background, 0);
    this.localTag.setSize(40, nextHeight);

    const characterHeight = 48 * this.character.container.scaleY;
    this.localTag.setPosition(
      Math.round(this.body.x - 20),
      Math.round(this.body.y - characterHeight - this.localTag.height),
    );
  }
  private syncCharacter() {
    this.character.setPosition(
      Math.round(this.body.x),
      Math.round(this.body.y),
    );
    const characterHeight = 48 * this.character.container.scaleY;
    const gap = 0;

    this.localTag.setPosition(
      Math.round(this.body.x - 40 / 2),
      Math.round(this.body.y - characterHeight - this.localTag.height - gap),
    );
    this.localTag.setDepth(this.character.container.depth + 1);
  }
  private broadcastMovement(delta: number, moving: boolean) {
    this.networkTimer += delta;
    const next: MovementUpdate = {
      x: Math.round(this.body.x),
      y: Math.round(this.body.y),
      direction: this.character.getDirection(),
      moving,
    };
    const previous = this.lastSent;
    const stateChanged =
      !previous ||
      previous.moving !== next.moving ||
      previous.direction !== next.direction;
    const positionChanged =
      !previous || previous.x !== next.x || previous.y !== next.y;
    const intervalElapsed = this.networkTimer >= this.networkInterval;
    if (stateChanged || (moving && intervalElapsed && positionChanged)) {
      this.wasMoving = true;
      this.sendMovement(next);
      this.lastSent = next;
      this.networkTimer = 0;
    }
  }
}
