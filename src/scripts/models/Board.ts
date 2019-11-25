import { Field } from "./Field";

/**
 * Модель доски
 * Содержит коллекцию ячеек
 * Создает, выводит на экран и обрабатывает инпут ячеек
 *
 * @export
 * @class Board
 * @extends {Phaser.Events.EventEmitter}
 */
export class Board extends Phaser.Events.EventEmitter {
    /**
     * Ссылка на текущую игровую сцену (используется во вьюшке ячеек)
     *
     * @private
     * @type {Phaser.Scene}
     */
    private _scene: Phaser.Scene = null;
    /**
     * Число строк доски
     *
     * @private
     * @type {number}
     */
    private _rows: number = 0;
    /**
     * Число столбцов доски
      *
     * @private
     * @type {number}
     */
    private _cols: number = 0;
    /**
     * Число бомб на доске
     *
     * @private
     * @type {number}
     */
    private _bombs: number = 0;
    /**
     * Массив с объектами моделей ячеек
     *
     * @private
     * @type {Field[]}
     */
    private _fields: Field[] = [];

    /**
     *Creates an instance of Board.
     * @param {Phaser.Scene} scene
     * @param {number} rows
     * @param {number} cols
     * @param {number} bombs
     */
    constructor(scene: Phaser.Scene, rows: number, cols: number, bombs: number) {
        super();
        this._scene = scene;
        this._rows = rows;
        this._cols = cols;
        this._bombs = bombs;
        this._fields = [];
        this._create();
    }

    /**
     *
     *
     * @readonly
     * @type {number}
     */
    public get cols(): number {
        return this._cols;
    }
    
    /**
     *
     *
     * @readonly
     * @type {number}
     */
    public get rows(): number {
        return this._rows;
    }

    /**
     * Флаг успешности расстановки флагов на доске
     * Возвращает {true} в случае, если все заминированные ячейки отмечены флагами
     *
     * @readonly
     * @type {boolean}
     */
    public get completed(): boolean {
        return this._fields.filter(field => field.completed).length === this._bombs;
    }

    /**
     * Возвращает число ячеек доски, отмеченных флагами
     *
     * @readonly
     * @type {number}
     */
    public get countMarked(): number {
        return this._fields.filter(field => field.marked).length;
    }

    /**
     * Возвращает ячейку доски по заданным параметрам строки и столбцу
     *
     * @param {number} row
     * @param {number} col
     * @returns {Field}
     */
    public getField(row: number, col: number): Field {
        return this._fields.find(field => field.row === row && field.col === col);
    }

    /**
     * Открывает все закрытые ячейки
     *
     */
    public open(): void {
        this._fields.forEach(field => field.open());
    }

    /**
     * Рекурсивно открывает все соседние закрытые ячейки относительно заданной
     * до тех пор, пока не откроется ячейка со значением
     *
     * @param {Field} field
     */
    public openClosestFields(field: Field): void {
        field.getClosestFields().forEach(item => {// для каждой соседней ячейки
            if (item.closed) {// если она закрыта
                item.open();// открыть ячейку
    
                if (item.empty) {// если она пуста
                    this.openClosestFields(item);// открыть соседей этой ячейки
                }
            }
        });
    }

    /**
     * Инициализирует игровую доску: 
     * создает ячейки, устанавливает в них бомбы и значения
     *
     * @private
     */
    private _create(): void {
        this._createFields();
        this._createBombs();
        this._createValues(); 
    }

    /**
     * Обработчик клика по ячейке
     *
     * @private
     * @param {Field} field
     * @param {Phaser.Input.Pointer} pointer
     */
    private _onFieldClick(field: Field, pointer: Phaser.Input.Pointer): void {
        if (pointer.leftButtonDown()) {
            this.emit(`left-click`, field);
        } else if (pointer.rightButtonDown()) {
            this.emit(`right-click`, field);
        }
    }

    /**
     * Создает модели ячеек и заполняет ими массив this._fields
     * устанавливает обработчик инпута по каждой ячейке
     * 
     * @private
     */
    private _createFields(): void {
        for (let row = 0; row < this._rows; row++) {
            for (let col = 0; col < this._cols; col++) {
                const field = new Field(this._scene, this, row, col)
                field.view.on('pointerdown', this._onFieldClick.bind(this, field));
                this._fields.push(field);
            }
        }
    }

    /**
     * Расставляет требуемой число бомб в рандомных ячейках доски
     *
     * @private
     */
    private _createBombs(): void {
        let count = this._bombs; // определить число бомб для генерации
    
        while (count > 0) { // пока не создано требуемое число бомб
            let field = this._fields[Phaser.Math.Between(0, this._fields.length - 1)]; // получить рандомное поле
    
            if (field.empty) { // если полученное поле пустое
                field.setBomb(); // поместить в него бомбу
                --count; // уменьшить счетчик бомб
            }
        }
    }

    /**
     * Устанавливает числовые значения во все требуемые ячейки
     * на основе того, как расставлены бомбы на доске
     *
     * @private
     */
    private _createValues() {
        // для каждого поля на доске
        this._fields.forEach(field => {
            // если в поле есть мина
            if (field.mined) {
                // для каждой соседней ячейки
                field.getClosestFields().forEach(item => {
                    // увеличим показатель числа мин рядом
                    if (item.value >= 0) {
                        ++item.value;
                    }
                });
            }
        });
    }
}