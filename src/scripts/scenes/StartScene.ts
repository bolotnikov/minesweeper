const spritesheetPng = require("./../../assets/spritesheet.png");
const spritesheetJson = require("./../../assets/spritesheet.json");

enum Texts {
    Title = 'Minesweeper HTML5',
    Message = 'Click anywhere to start'
}

enum Styles {
    Color = '#008080',
    Font = 'Arial'
}

export class StartScene extends Phaser.Scene {
    constructor() {
        super('Start');
    }
  
    public preload(): void {
        this.load.atlas("spritesheet", spritesheetPng, spritesheetJson);
    }

    public create(): void {
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            Texts.Title,
            {font: `52px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);
    
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            Texts.Message,
            {font: `28px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);

        this.input.once('pointerdown', () => {
            this.scene.start('Game');
        });
    }
}