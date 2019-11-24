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

enum States {
    Closed = 'closed',
    Opened = 'opened',
    Marked = 'flag'
};

export class Field extends Phaser.Events.EventEmitter {
    private _state: string = States.Closed;
    private _scene: Phaser.Scene = null;
    private _board: Board = null;
    private _row: number = 0;
    private _col: number = 0;
    private _view: FieldView = null;
    private _value: number = 0;
    private _exploded: boolean = false;

    constructor(scene: Phaser.Scene, board: Board, row: number, col: number) {
        super();
        this._init(scene, board, row, col);
    }

    public get completed(): boolean {
        return this.marked && this.mined;
    }
    
    public set exploded(exploded: boolean) {
        this._exploded = exploded;
        this.emit('change');
    }

    public get exploded(): boolean {
        return this._exploded;
    }

    public get marked(): boolean {
        return this._state === States.Marked;
    }

    public get closed(): boolean {
        return this._state === States.Closed;
    }

    public get opened(): boolean {
        return this._state === States.Opened;
    }

    public get value(): number {
        return this._value;
    }

    public set value(value) {
        this._value = value;
    }

    public get empty(): boolean {
        return this._value === 0;
    }

    public get mined(): boolean {
        return this._value === -1;
    }

    public get filled(): boolean {
        return this._value > 0;
    }

    public setBomb(): void {
        this._value = -1;
    }

    public get view(): FieldView {
        return this._view;
    }

    public get col(): number {
        return this._col;
    }

    public get row(): number {
        return this._row;
    }

    public get board(): Board {
        return this._board;
    }

    public open(): void {
        this._setState(States.Opened);
    }

    public addFlag(): void {
        this._setState(States.Marked);
    }
    
    public removeFlag(): void {
        this._setState(States.Closed);
    }

    private _setState(state: string): void {
        if (this._state !== state) {
            this._state = state;
            this.emit('change');
        }
    }

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

    private _init(scene: Phaser.Scene, board: Board, row: number, col: number): void {
        this._scene = scene;
        this._board = board;
        this._row = row;
        this._col = col;
        this._view = new FieldView(this._scene, this);
    }
}