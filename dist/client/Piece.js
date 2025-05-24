import { COLS, BLOCK_SIZE, COLORS, SHAPES, NEXT_COLS, NEXT_ROWS } from './constants.js';
export class Piece {
    constructor(ctx) {
        this.typeId = 0;
        this.shape = [];
        this.color = '';
        this.x = 0;
        this.y = 0;
        this.ctx = null;
        this.ctx = ctx;
        this.spawn();
    }
    spawn() {
        this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
        this.shape = SHAPES[this.typeId].map(row => [...row]);
        this.color = COLORS[this.typeId];
        this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
        this.y = 0;
    }
    draw() {
        if (!this.ctx)
            return;
        this.ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                var _a;
                if (value > 0) {
                    (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.fillRect((this.x + x) * BLOCK_SIZE, (this.y + y) * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });
    }
    move(p) {
        this.x = p.x;
        this.y = p.y;
        if (p.shape) {
            this.shape = p.shape.map(row => [...row]);
        }
    }
    randomizeTetrominoType(noOfTypes) {
        return Math.floor(Math.random() * noOfTypes + 1);
    }
    setStartingPosition() {
        this.x = this.typeId === 4 ? 4 : 3;
    }
    drawNext(ctx) {
        if (!ctx)
            return;
        const blockSize = BLOCK_SIZE * 0.7;
        const xOffset = (NEXT_COLS * blockSize - this.shape[0].length * blockSize) / 2;
        const yOffset = (NEXT_ROWS * blockSize - this.shape.length * blockSize) / 2;
        ctx.fillStyle = this.color;
        this.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    ctx.fillRect(xOffset + x * blockSize, yOffset + y * blockSize, blockSize - 1, blockSize - 1);
                }
            });
        });
    }
}
//# sourceMappingURL=Piece.js.map