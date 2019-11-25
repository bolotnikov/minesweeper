enum Styles {
    Color = '#008080',
    Font = 'Arial'
}

enum Texts {
    Flags = 'FLAGS: ',
    Exit = 'EXIT',
    Success = 'YOU WIN!',
    Failure = 'YOU LOOSE'
};

/**
 * UI игровой сцены
 *
 * @export
 * @class GameSceneView
 */
export class GameSceneView {
    /**
     *
     *
     * @private
     * @type {Phaser.Scene}
     */
    private _scene: Phaser.Scene = null;
    /**
     * Стиль для рендеринга текста
     *
     * @private
     * @type {{font: string, fill: string}}
     */
    private _style: {font: string, fill: string};
    /**
     * Объект текста с число свободных флагов (слева вверху экрана)
     *
     * @private
     * @type {Phaser.GameObjects.Text}
     */
    private _txtFlags: Phaser.GameObjects.Text = null;
    /**
     * Объект с текстом статуса завершения игры (сверху в центре экрана)
     *
     * @private
     * @type {Phaser.GameObjects.Text}
     */
    private _txtStatus: Phaser.GameObjects.Text = null;
    /**
     * Текст с кнопкой выхода (сверху справа на экране)
     *
     * @private
     * @type {Phaser.GameObjects.Text}
     */
    private _btnExit: Phaser.GameObjects.Text = null;

    /**
     *Creates an instance of GameSceneView.
     * @param {Phaser.Scene} scene
     */
    constructor(scene: Phaser.Scene) {
        this._scene = scene;
        this._style = {font: `28px ${Styles.Font}`, fill: Styles.Color};
        this._create();
    }

    /**
     *
     *
     * @private
     */
    private _create(): void {
        this._createTxtFlags();
        this._createTxtStatus();
        this._createBtnExit();
    }

    /**
     * Отрисовывает UI игрового уровня
     * Выводит актуальное число свободных флагов
     * Выводит сообщение со результатом игры при завершении уровня
     * 
     * @param {{flags?: number, status?: boolean}} data
     */
    public render(data: {flags?: number, status?: boolean}) {
        if (typeof data.flags !== 'undefined') {
            this._txtFlags.text = Texts.Flags + data.flags.toString();
        }
    
        if (typeof data.status !== 'undefined') {
            this._txtStatus.text = data.status ? Texts.Success : Texts.Failure;
            this._txtStatus.visible = true;
        }
    }

    /**
     * Создает текст с числом свободных флагов
     *
     * @private
     */
    private _createTxtFlags(): void {
        this._txtFlags = this._scene.add.text(
            50,
            50,
            Texts.Flags,
            this._style
        ).setOrigin(0, 1);
    }

    /**
     * Создает текст со статусом завершения игры
     * Скрыт по дефолту
     *
     * @private
     */
    private _createTxtStatus(): void {
        this._txtStatus = this._scene.add.text(
            this._scene.cameras.main.centerX,
            50,
            Texts.Success,
            this._style
        ).setOrigin(0.5, 1);
    
        this._txtStatus.visible = false;
    }

    /**
     * Создает кнопку выхода
     *
     * @private
     */
    private _createBtnExit(): void {
        this._btnExit = this._scene.add.text(
            this._scene.cameras.main.width - 50,
            50,
            Texts.Exit,
            this._style
        ).setOrigin(1);
    
        this._btnExit.setInteractive();
        this._btnExit.once('pointerdown', () => {
            this._scene.scene.start('Start');
        });
    }
}