import { Board } from "../models/Board";
import { Field } from "../models/Field";
import { GameSceneView } from "../views/GameSceneView";

const Rows = 8;
const Cols = 8;
const Bombs = 8;

/**
 * Сцена игрового уровня
 * Предназначена для обрабатки основной игровой логики
 *
 * @export
 * @class GameScene
 * @extends {Phaser.Scene}
 */
export class GameScene extends Phaser.Scene {
    /**
     * Модель доски
     *
     * @private
     * @type {Board}
     */
    private _board: Board = null;

    /**
     * Число свободных флагов, доступных для расстановки на доске
     *
     * @private
     * @type {number}
     */
    private _flags: number = 0;

    /**
     * Вьюшка для игровой сцены (UI)
     *
     * @private
     * @type {GameSceneView}
     */
    private _view: GameSceneView = null;
    
    constructor() {
        super('Game');
        // отключить контекстное меню по клику правой кнопкой
        document.querySelector("canvas").oncontextmenu = e => e.preventDefault();
    }

    /**
     * Создает игровые объекты
     * Инициализирует доску, UI, отслеживание событий
     *
     */
    public create(): void {
        this._flags = Bombs;
        this._board = new Board(this, Rows, Cols, Bombs);
        this._board.on('left-click', this._onFieldClickLeft, this);
        this._board.on('right-click', this._onFieldClickRight, this);
        this._view = new GameSceneView(this);
        this._view.render({flags: this._flags});
    }

    /**
     * Запускается при завершении уровня
     * Отключает отслеживание событий с модели доски
     * Открывает все закрытые ячейки на доске
     * Выводит сообщение со статусом завершения уровня
     *
     * @private
     * @param {boolean} status
     */
    private _onGameOver(status: boolean) {
        this._board.off('left-click', this._onFieldClickLeft, this);
        this._board.off('right-click', this._onFieldClickRight, this);
        this._board.open();
        this._view.render({status});
    }

    /**
     * Обрабатывает клик левой кнопки мыши по ячейке
     *
     * @private
     * @param {Field} field
     */
    private _onFieldClickLeft(field: Field): void {
        if (field.closed) { // если ячейка закрыта
            field.open(); // открыть ее
    
            if (field.mined) { // если она заминирована
                field.exploded = true;
                this._onGameOver(false); // игра проиграна
            } else if (field.empty) { // если она пуста
                this._board.openClosestFields(field); // открыть соседей
            }
        } else if (field.opened) { // если ячейка открыта
            if (this._board.completed) { // и вся доска помечена флагами корректно
                this._onGameOver(true); // игра выиграна
            }
        }
    }

    /**
     * Обрабатывает клик правой кнопки мыши по ячейке
     *
     * @private
     * @param {Field} field
     */
    private _onFieldClickRight(field: Field): void {
        if (field.closed && this._flags > 0) { // если ячейка закрыта и есть свободные флаги
            field.addFlag(); // добавляем флаг в ячейку
        } else if (field.marked) { // если флаг уже есть
            field.removeFlag(); // удаляем флаг
        }

        this._flags = Bombs - this._board.countMarked; // актуализируем число свободных флагов
        this._view.render({flags: this._flags}); // обновляем текст числа флагов в UI
    }
}