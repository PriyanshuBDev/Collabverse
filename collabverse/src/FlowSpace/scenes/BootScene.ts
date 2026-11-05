import { TiledMapData } from "@/app/interfaces";
import Phaser from "phaser";

export default class BootScene extends Phaser.Scene {
  constructor() {
    super("BootScene");
  }
  preload() {
    this.load.json("mapData", "/map/FullMap.tmj");
  }
  create() {
    const mapData = this.cache.json.get("mapData") as TiledMapData;
    this.scene.start("PreloadScene", {
      mapData,
    });
  }
}
