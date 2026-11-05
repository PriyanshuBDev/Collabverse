import Phaser from "phaser";

export function smoothNameTagText(text: Phaser.GameObjects.Text) {
  text.setResolution(4);
  text.texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
  text.texture.setSmoothPixelArt(true);
  return text;
}

export function createSmoothTagBackground(
  scene: Phaser.Scene,
  width: number,
  height: number,
  dotY: number,
  dotCenterX: number,
): Phaser.GameObjects.Image {
  const key = `tag-background-${Phaser.Utils.String.UUID()}`;
  const resolution = 2;

  const texture = scene.textures.createCanvas(
    key,
    width * resolution,
    height * resolution,
  );

  if (!texture) {
    throw new Error("Could not create the name tag background.");
  }

  const context = texture.context;
  context.scale(resolution, resolution);

  context.fillStyle = "rgba(21, 25, 35, 0.9)";
  context.strokeStyle = "rgba(74, 222, 128, 0.45)";
  context.lineWidth = 1;

  context.beginPath();
  context.roundRect(0.5, 0.5, width - 1, height - 1, 6);
  context.fill();
  context.stroke();

  context.fillStyle = "#4ade80";
  context.beginPath();
  context.arc(dotCenterX, dotY, 2, 0, Math.PI * 2);
  context.fill();

  texture.refresh();
  texture.setFilter(Phaser.Textures.FilterMode.LINEAR);

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
    scene.textures.remove(key);
  });

  return scene.add.image(0, 0, key).setOrigin(0).setDisplaySize(width, height);
}
