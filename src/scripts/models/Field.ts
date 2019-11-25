import { Board } from "./Board";
import { FieldView } from "../views/FieldView";

const Positions = [
    {row : 0, col : 1}, // справа
    {row : 0, col : -1}, // слева
    {row : 1, col : 0}, // сверху
    {row : 1, col : 1}, // сверху справа
    {row : 1, col : -1}, // сверху слева
    {row : -1, col : 0}, // снизу
    {row : -1, col : 1}, // снизу справа
    {row : -1, col : -1} // снизу слева
];

/**
 * Состояния модели
 *
 * @enum {number}
 */
enum States {
    Closed = 'closed',
    Opened = 'opened',
    Marked = 'flag'
};

/**
 * Класс модели ячейки
 *
 * @export
 * @class Field
 * @extends {Phaser.Events.EventEmitter}
 */
export class Field extends Phaser.Events.EventEmitter {
    /**
     * Состояние модели
     *
     * @private
     * @type {string}
     */
    private _state: string = States.Closed;
    /**
     * Ссылка на текущую активную сцену (требуется для вьюшки)
     *
     * @private
     * @type {Phaser.Scene}
     */
    private _scene: Phaser.Scene = null;
    private _board: Board = null;
    /**
     * Ссылка на модель доски
     *
     * @private
     * @type {number}
     */
    /**
     * Номер строки, в которой расположена ячейка
     *
     * @private
     * @type {number}
     */
    private _row: number = 0;
    private _col: number = 0;
    /**
     * Номер столбца, в котором расположена ячейка
     *
     * @private
     * @type {FieldView}
     */
    private _view: FieldView = null;
    /**
     * Вьюшка данной модели
     *
     * @private
     * @type {number}
     */
    /**
     * Числовое значение, обозначающее содержимое данной ячейки
     *
     * @private
     * @type {number}
     */
    private _value: number = 0;
    /**
     * Флаг, обозначающий была ли ячейка взорвана при ее открытии
     *
     * @private
     * @type {boolean}
     */
    private _exploded: boolean = false;

    /**
     *Creates an instance of Field.
     * @param {Phaser.Scene} scene
     * @param {Board} board
     * @param {number} row
     * @param {number} col
     */
    constructor(scene: Phaser.Scene, board: Board, row: number, col: number) {
        super();
        this._init(scene, board, row, col);
    }

    /**
     * Флаг, обозначающий была ли ячейка успешно разминирована
     * Возвращает {true} в случае, если ячейки и заминирована, и помечена флагом
     *
     * @readonly
     * @type {boolean}
     */
    public get completed(): boolean {
        return this.marked && this.mined;
    }
    
    /**
     * Установка флага _exploded
     *
     */
    public set exploded(exploded: boolean) {
        this._exploded = exploded;
        this.emit('change');
    }

    /**
     *
     *
     * @type {boolean}
     */
    public get exploded(): boolean {
        return this._exploded;
    }

    /**
     * Указывает, отмечена ли ячейка флагом
     *
     * @readonly
     * @type {boolean}
     */
    public get marked(): boolean {
        return this._state === States.Marked;
    }

    /**
     * Указывает, закрыта ли ячейка
     *
     * @readonly
     * @type {boolean}
     */
    public get closed(): boolean {
        return this._state === States.Closed;
    }

    /**
     * Указывает, открыта ли ячейка
     *
     * @readonly
     * @type {boolean}
     */
    public get opened(): boolean {
        return this._state === States.Opened;
    }

    /**
     * 
     *
     * @type {number}
     */
    public get value(): number {
        return this._value;
    }

    /**
     *
     *
     */
    public set value(value) {
        this._value = value;
    }

    /**
     * Указывает, пуста ли ячейка
     *
     * @readonly
     * @type {boolean}
     */
    public get empty(): boolean {
        return this._value === 0;
    }

    /**
     * Указывает, заминирована ли ячейка
     *
     * @readonly
     * @type {boolean}
     */
    public get mined(): boolean {
        return this._value === -1;
    }

    /**
     * Указывает, содержит ли ячейка числовое значение
     *
     * @readonly
     * @type {boolean}
     */
    public get filled(): boolean {
        return this._value > 0;
    }

    /**
     * Устанавливает бомбу в ячейку
     *
     */
    public setBomb(): void {
        this._value = -1;
    }

    /**
     *
     *
     * @readonly
     * @type {FieldView}
     */
    public get view(): FieldView {
        return this._view;
    }

    /**
     *
     *
     * @readonly
     * @type {number}
     */
    public get col(): number {
        return this._col;
    }

    /**
     *
     *
     * @readonly
     * @type {number}
     */
    public get row(): number {
        return this._row;
    }

    /**
     *
     *
     * @readonly
     * @type {Board}
     */
    public get board(): Board {
        return this._board;
    }

    /**
     * Открывает ячейку
     *
     */
    public open(): void {
        this._setState(States.Opened);
    }

    /**
     * Добавляет в ячейку флаг
     *
     */
    public addFlag(): void {
        this._setState(States.Marked);
    }
    
    /**
     * Удаляет флаг из ячейки
     *
     */
    public removeFlag(): void {
        this._setState(States.Closed);
    }

    /**
     * Устанавливает состояние модели (закрыта/открыта/отмечена флагом)
     *
     * @private
     * @param {string} state
     */
    private _setState(state: string): void {
        if (this._state !== state) {
            this._state = state;
            this.emit('change');
        }
    }

    /**
     * Возвращает всех соседей
     * (все ячейки, находящиеся рядом с текущий, в том числе и по диагонали)
     *
     * @returns {Field[]}
     */
    public getClosestFields(): Field[] {
        let results = [];
    
        // для каждой возможной соседней позиции
        Positions.forEach(position => {
            // получим клетку в заданной позиции
            let field = this._board.getField(this._row + position.row, this._col + position.col);
    
            // если такая клетка есть на доске
            if (field) {
                // добавить ее в пул
                results.push(field);
            }
        });
    
        return results;
    };

    /**
     *
     *
     * @private
     * @param {Phaser.Scene} scene
     * @param {Board} board
     * @param {number} row
     * @param {number} col
     */
    private _init(scene: Phaser.Scene, board: Board, row: number, col: number): void {
        this._scene = scene;
        this._board = board;
        this._row = row;
        this._col = col;
        this._view = new FieldView(this._scene, this);
    }
}