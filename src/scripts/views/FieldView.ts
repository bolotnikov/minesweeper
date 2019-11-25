import { Field } from "../models/Field";

const States = {
    'closed': field => field.closed,
    'flag': field => field.marked,
    'empty': field => field.opened && !field.mined && !field.filled,
    'exploded': field => field.opened && field.mined && field.exploded,
    'mined': field => field.opened && field.mined && !field.exploded
}

/**
 *
 *
 * @interface Vec2
 */
interface Vec2 {x: number, y: number};

/**
 * Вьюшка для модели ячейки
 * Предназначена для рендеринга спрайта ячейки доски
 *
 * @export
 * @class FieldView
 * @extends {Phaser.GameObjects.Sprite}
 */
export class FieldView extends Phaser.GameObjects.Sprite {
    /**
     * Позиция на доске
     *
     * @private
     * @type {Vec2}
     */
    private _position: Vec2 = {x: 0, y: 0};
    /**
     * Ссылка на модель данной вьюшки
     *
     * @private
     * @type {Field}
     */
    private _model: Field = null;

    /**
     *Creates an instance of FieldView.
     * @param {Phaser.Scene} scene
     * @param {Field} model
     */
    constructor(scene: Phaser.Scene, model: Field) {
        super(scene, 0, 0, 'spritesheet', 'closed');
        this._model = model;
        this._init();
        this._create();
    }

    /**
     * Смещение относительно левого и верхнего краев экрана
     *
     * @readonly
     * @private
     * @type {Vec2}
     */
    private get _offset(): Vec2 {
        return {
            x: (this.scene.cameras.main.width - this._model.board.cols * this.width) / 2,
            y: (this.scene.cameras.main.height - this._model.board.rows * this.height) / 2
        };
    }

    /**
     * Создает спрайт и запускает анимацию вылета при старте игры
     *
     * @private
     */
    private _create(): void {
        this.scene.add.existing(this); // добавляем созданный объект на канвас
        this.setOrigin(0.5); // устанавливаем pivot point в центр спрайта
        this.setInteractive();        
        this._animateShow();
    }

    /**
     * Анимация вылета при старте игры
     * Помещает спрайт за левый верхний угол экрана, чтобы скрыть его сразу после создания
     * Запускает анимацию движения до актуальной позиции на доске
     *
     * @private
     * @returns {Promise<void>}
     */
    private _animateShow(): Promise<void> {
        this.x = -this.width;
        this.y = -this.height;
        const delay = this._model.row * 50 + this._model.col * 10;
        return this._moveTo(this._position, delay);
    }

    /**
     * Анимация разворота при клике левой кнопкой мыши
     *
     * @private
     */
    private _animateFlip(): void {
        this._scaleXTo(0).then(() => {
            this._render();
            this._scaleXTo(1);
        })
    }

    /**
     * Инициализация координат на канвасе
     * Подписка на событие изменения модели
     *
     * @private
     */
    private _init(): void {
        const offset = this._offset;
        this.x = this._position.x = offset.x + this.width * this._model.col + this.width / 2;
        this.y = this._position.y = offset.y + this.height * this._model.row + this.height / 2;
        this._model.on('change', this._onStateChange, this);
    }

    /**
     * Запускается при событии изменения модели
     *
     * @private
     */
    private _onStateChange(): void {
        if (this._model.opened) {
            this._animateFlip();
        } else {
            this._render();
        }
    }

    /**
     * Отрисовывает спрайт ячейки на канвасе
     *
     * @private
     */
    private _render(): void {
        this.setFrame(this._frameName);
    }

    /**
     * Получает актуальный фрейм, в зависимости от текущего состояния модели,
     * который требуется отрисовать на канвасе
     *
     * @readonly
     * @private
     * @type {string}
     */
    private get _frameName(): string {
        for (let key in States) {
            if (States[key](this._model)) {
                return key;
            }
        }
    
        return this._model.value.toString();
    }

    /**
     * Твин анимация перемещения в заданную позицию
     *
     * @private
     * @param {Vec2} position
     * @param {number} delay
     * @returns {Promise<void>}
     */
    private _moveTo(position: Vec2, delay: number): Promise<void> {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this,
                x: position.x,
                y: position.y,
                duration: 600,
                ease: 'Elastic',
                easeParams: [1, 1],
                delay,
                onComplete: () => {
                    resolve();
                }
            });
        });
    }

    /**
     * Твин анимация скейла до заданных размеров
     *
     * @private
     * @param {number} scaleX
     * @returns {Promise<void>}
     */
    private _scaleXTo(scaleX: number): Promise<void> {
        return new Promise(resolve => {
            this.scene.tweens.add({
                targets: this,
                scaleX,
                ease: 'Elastic.easeInOut',
                easeParams: [1, 1],
                duration: 150,
                onComplete: () => {
                    resolve()
                }
            });
        });
    }    
}