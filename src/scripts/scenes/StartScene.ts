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

/**
 * Стартовая сцена
 * Реализует функционал предзагрузки ресурсов
 * Используется в качестве стартового экрана, приглашающего пользователю в игру
 *
 * @export
 * @class StartScene
 * @extends {Phaser.Scene}
 */
export class StartScene extends Phaser.Scene {
    constructor() {
        super('Start');
    }
  
    /**
     * Предзагрузка ресурсов
     * Выполняется до метода create
     */
    public preload(): void {
        this.load.atlas("spritesheet", spritesheetPng, spritesheetJson);
    }

    /**
     * Создание объектов сцены (приглашающего текста)
     * Выполняется после завершения заргузки всех ресурсов, указанных в preload
     */
    public create(): void {
        // Текст с названием игры
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY - 100,
            Texts.Title,
            {font: `52px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);
    
        // Текст с приглашающим сообщением
        this.add.text(
            this.cameras.main.centerX,
            this.cameras.main.centerY + 100,
            Texts.Message,
            {font: `28px ${Styles.Font}`, fill: Styles.Color})
        .setOrigin(0.5);

        // По событию клика в любом месте экрана
        this.input.once('pointerdown', () => {
            // отправляем игрока на сцену игрового уровня
            this.scene.start('Game');
        });
    }
}