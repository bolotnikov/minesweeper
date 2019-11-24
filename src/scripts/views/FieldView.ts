import { Field } from "../models/Field";

const States = {
    'closed': field => field.closed,
    'flag': field => field.marked,
    'empty': field => field.opened && !field.mined && !field.filled,
    'exploded': field => field.opened && field.mined && field.exploded,
    'mined': field => field.opened && field.mined && !field.exploded
}

interface Vec2 {x: number, y: number};

export class FieldView extends Phaser.GameObjects.Sprite {
    private _position: Vec2 = {x: 0, y: 0};
    private _model: Field = null;

    constructor(scene: Phaser.Scene, model: Field) {
        super(scene, 0, 0, 'spritesheet', 'closed');
        this._model = model;
        this._init();
        this._create();
    }

    private get _offset(): Vec2 {
        return {
            x: (this.scene.cameras.main.width - this._model.board.cols * this.width) / 2,
            y: (this.scene.cameras.main.height - this._model.board.rows * this.height) / 2
        };
    }

    private _create(): void {
        this.scene.add.existing(this); // добавляем созданный объект на канвас
        this.setOrigin(0.5); // устанавливаем pivot point в центр спрайта
        this.setInteractive();        
        this._animateShow();
    }

    private _animateShow(): Promise<void> {
        this.x = -this.width;
        this.y = -this.height;
        const delay = this._model.row * 50 + this._model.col * 10;
        return this._moveTo(this._position, delay);
    }

    private _animateFlip(): void {
        this._scaleXTo(0).then(() => {
            this._render();
            this._scaleXTo(1);
        })
    }

    private _init(): void {
        const offset = this._offset;
        this.x = this._position.x = offset.x + this.width * this._model.col + this.width / 2;
        this.y = this._position.y = offset.y + this.height * this._model.row + this.height / 2;
        this._model.on('change', this._onStateChange, this);
    }

    private _onStateChange(): void {
        if (this._model.opened) {
            this._animateFlip();
        } else {
            this._render();
        }
    }

    private _render(): void {
        this.setFrame(this._frameName);
    }

    private get _frameName(): string {
        for (let key in States) {
            if (States[key](this._model)) {
                return key;
            }
        }
    
        return this._model.value.toString();
    }

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