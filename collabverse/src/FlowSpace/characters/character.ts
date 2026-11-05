import { CharacterAppearance } from "@/app/interfaces";
import {
  CharacterDirection,
  getIdleFrames,
  getWalkFrames,
} from "./characterAnimations";

export class Character {
  readonly container: Phaser.GameObjects.Container;
  private body: Phaser.GameObjects.Sprite;
  private eyes: Phaser.GameObjects.Sprite;
  private hairstyle: Phaser.GameObjects.Sprite;
  private outfit: Phaser.GameObjects.Sprite;
  private accessory?: Phaser.GameObjects.Sprite;

  private direction: CharacterDirection = "down";
  private moving = false;
  private animationFrames: string[] = [];
  private animationIndex = 0;
  private animationTimer = 0;
  private readonly animationInterval = 150;

  private emoteSprite?: Phaser.GameObjects.Sprite;
  constructor(
    private scene: Phaser.Scene,
    x: number,
    y: number,
    appearance: CharacterAppearance,
  ) {
    this.container = scene.add.container(x, y);
    this.body = this.createLayer(appearance.body);
    this.outfit = this.createLayer(appearance.outfit);
    this.hairstyle = this.createLayer(appearance.hairstyle);
    this.eyes = this.createLayer(appearance.eyes);
    this.container.setScale(0.8);
    if (appearance.accessory) {
      this.accessory = this.createLayer(appearance.accessory);
    }
    this.container.add([this.body, this.outfit, this.hairstyle, this.eyes]);
    if (this.accessory) {
      this.container.add(this.accessory);
    }
    this.setAnimation(getIdleFrames(this.direction));
  }
  private createLayer(texture: string): Phaser.GameObjects.Sprite {
    const sprite = this.scene.add.sprite(0, 0, texture, "r3c0");

    sprite.setOrigin(0.5, 1);
    return sprite;
  }
  private setAnimation(frames: string[]) {
    this.animationFrames = frames;
    this.animationIndex = 0;
    this.animationTimer = 0;
    this.applyFrames();
  }
  private applyFrames() {
    const frame = this.animationFrames[this.animationIndex];

    if (!frame) {
      return;
    }

    this.body.setFrame(frame);
    this.outfit.setFrame(frame);
    this.hairstyle.setFrame(frame);
    this.eyes.setFrame(frame);
    this.accessory?.setFrame(frame);

    this.body.setPosition(0, 0);
    this.outfit.setPosition(0, 0);
    this.hairstyle.setPosition(0, 0);
    this.eyes.setPosition(0, 0);
    this.accessory?.setPosition(0, 0);
  }
  update(delta: number) {
    if (this.animationFrames.length <= 1) {
      return;
    }
    this.animationTimer += delta;
    if (this.animationTimer < this.animationInterval) return;
    this.animationTimer -= this.animationInterval;
    this.animationIndex++;
    if (this.animationIndex >= this.animationFrames.length) {
      this.animationIndex = 0;
    }
    this.applyFrames();
  }
  setMoving(moving: boolean) {
    if (this.moving === moving) return;
    this.moving = moving;
    if (moving) {
      this.setAnimation(getWalkFrames(this.direction));
    } else {
      this.setAnimation(getIdleFrames(this.direction));
    }
  }
  setDirection(direction: CharacterDirection) {
    if (this.direction === direction) {
      return;
    }
    this.direction = direction;
    if (this.moving) {
      this.setAnimation(getWalkFrames(this.direction));
    } else {
      this.setAnimation(getIdleFrames(this.direction));
    }
  }
  setPosition(x: number, y: number) {
    this.container.setPosition(x, y);
  }
  setDepth(depth: number) {
    this.container.setDepth(depth);
  }
  setAppearance(appearance: CharacterAppearance) {
    this.body.setTexture(appearance.body);
    this.eyes.setTexture(appearance.eyes);
    this.outfit.setTexture(appearance.outfit);
    this.hairstyle.setTexture(appearance.hairstyle);
    if (appearance.accessory) {
      if (!this.accessory) {
        this.accessory = this.scene.add.sprite(
          0,
          0,
          appearance.accessory,
          "r0c0",
        );
        this.container.add(this.accessory);
      } else {
        this.accessory.setTexture(appearance.accessory);
      }
    }
    this.applyFrames();
  }
  getDirection(): CharacterDirection {
    return this.direction;
  }
  playEmote(animationKey: string) {
    if (!this.emoteSprite) {
      this.emoteSprite = this.scene.add.sprite(0, -55, "ui-emotes");
      this.emoteSprite?.setOrigin(0.5, 1);
      this.emoteSprite.setScale(0.8);
      this.container.add(this.emoteSprite);
    }
    this.emoteSprite.stop();
    this.emoteSprite.setVisible(true);
    this.emoteSprite.play(animationKey);
  }
  hideEmote() {
    this.emoteSprite?.stop();
    this.emoteSprite?.setVisible(false);
  }
  destroy() {
    this.container.destroy(true);
  }
}
