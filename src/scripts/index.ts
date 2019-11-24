import * as Phaser from "phaser";
import { StartScene } from "./scenes/StartScene";
import { GameScene } from "./scenes/GameScene";

new Phaser.Game({
    type: Phaser.AUTO,
    parent: "minesweeper",
    width: window.innerWidth,
    height: window.innerHeight,
    backgroundColor: "#F0FFFF",
    scene: [StartScene, GameScene]
});