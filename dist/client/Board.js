import { COLS, ROWS, BLOCK_SIZE, POINTS, COLORS } from './constants.js';
import { Piece } from './Piece.js';
export class Board {
    constructor(ctx, ctxNext, soundManager) {
        this.ctx = ctx;
        this.ctxNext = ctxNext;
        this.soundManager = soundManager;
        this.grid = this.getEmptyBoard();
        this.piece = null;
        this.next = null;
        this.gameOver = false;
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.requestId = null;
        this.time = { start: 0, elapsed: 0, level: 1000 };
    }
    reset() {
        this.grid = this.getEmptyBoard();
        this.gameOver = false;
        this.score = 0;
        this.lines = 0;
        this.level = 0;
        this.time = { start: 0, elapsed: 0, level: 1000 };
        // Create new pieces
        this.piece = new Piece(this.ctx);
        this.next = new Piece(this.ctxNext);
        // Set starting positions
        if (this.piece)
            this.piece.setStartingPosition();
        if (this.next)
            this.next.setStartingPosition();
        // Draw the initial state
        this.draw();
        this.drawNext();
        console.log('Board reset - New piece spawned');
    }
    getEmptyBoard() {
        return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    }
    valid(p) {
        return p.shape.every((row, dy) => {
            return row.every((value, dx) => {
                const x = p.x + dx;
                const y = p.y + dy;
                return (value === 0 ||
                    (this.insideWalls(x, y) && this.notOccupied(x, y)));
            });
        });
    }
    insideWalls(x, y) {
        return x >= 0 && x < COLS && y <= ROWS;
    }
    notOccupied(x, y) {
        return y < 0 || (y < ROWS && x >= 0 && x < COLS && this.grid[y][x] === 0);
    }
    draw() {
        if (!this.piece || !this.next)
            return;
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.drawGrid();
        this.drawBoard();
        this.piece.draw();
    }
    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 0.5;
        // Draw vertical lines
        for (let i = 0; i <= COLS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * BLOCK_SIZE, 0);
            this.ctx.lineTo(i * BLOCK_SIZE, ROWS * BLOCK_SIZE);
            this.ctx.stroke();
        }
        // Draw horizontal lines
        for (let i = 0; i <= ROWS; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * BLOCK_SIZE);
            this.ctx.lineTo(COLS * BLOCK_SIZE, i * BLOCK_SIZE);
            this.ctx.stroke();
        }
    }
    drawBoard() {
        this.grid.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    this.ctx.fillStyle = COLORS[value - 1];
                    this.ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE - 1, BLOCK_SIZE - 1);
                }
            });
        });
    }
    // Rotate the current piece
    rotate(piece) {
        // Clone the piece to avoid mutating the original
        let p = {
            shape: piece.shape[0].map((_, i) => piece.shape.map(col => col[i])).reverse(),
            x: piece.x,
            y: piece.y
        };
        // If the rotation is valid, return the rotated piece
        if (this.valid(p)) {
            if (this.soundManager) {
                this.soundManager.play('rotate');
            }
            return p;
        }
        // If rotation is not valid, try wall kicks (move left/right to make it fit)
        const originalX = p.x;
        // Try moving right
        p.x += 1;
        if (this.valid(p)) {
            if (this.soundManager) {
                this.soundManager.play('rotate');
            }
            return p;
        }
        // Try moving left
        p.x = originalX - 1;
        if (this.valid(p)) {
            if (this.soundManager) {
                this.soundManager.play('rotate');
            }
            return p;
        }
        // If all else fails, return the original piece
        p.x = originalX;
        return piece;
    }
    // Move the current piece
    move(moveFn) {
        if (!this.piece)
            return false;
        const p = moveFn({
            x: this.piece.x,
            y: this.piece.y,
            shape: this.piece.shape
        });
        if (this.valid(p)) {
            this.piece.x = p.x;
            this.piece.y = p.y;
            if (p.shape) {
                this.piece.shape = p.shape;
            }
            return true;
        }
        return false;
    }
    drawNext() {
        if (!this.next)
            return;
        this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
        this.next.drawNext(this.ctxNext);
    }
    // Get the current piece
    getPiece() {
        return this.piece;
    }
    // Set the current piece
    setPiece(piece) {
        this.piece = piece;
    }
    drop() {
        if (!this.piece)
            return;
        let p = { ...this.piece, y: this.piece.y + 1 };
        if (this.valid(p)) {
            this.piece.move(p);
        }
        else {
            this.freeze();
            this.clearLines();
            if (this.piece.y === 0) {
                // Game over
                this.gameOver = true;
                if (this.soundManager) {
                    this.soundManager.play('gameOver');
                    this.soundManager.stopBackgroundMusic();
                }
            }
            // Get the next piece
            this.piece = this.next;
            if (this.piece) {
                this.piece.ctx = this.ctx;
                this.piece.setStartingPosition();
            }
            // Generate a new next piece
            this.next = new Piece(this.ctxNext);
            this.next.setStartingPosition();
            this.drawNext();
        }
    }
    freeze() {
        if (!this.piece)
            return;
        this.piece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value > 0) {
                    const boardY = this.piece.y + y;
                    if (boardY >= 0) { // Only freeze pieces that are on the board
                        this.grid[boardY][this.piece.x + x] = this.piece.typeId + 1; // +1 because 0 is empty
                    }
                }
            });
        });
    }
    clearLines() {
        var _a;
        let lines = 0;
        this.grid.forEach((row, y) => {
            // If every cell in the row is filled
            if (row.every(cell => cell > 0)) {
                lines++;
                // Remove the line
                this.grid.splice(y, 1);
                // Add new empty line at the top
                this.grid.unshift(Array(COLS).fill(0));
            }
        });
        if (lines > 0) {
            // Update score
            this.lines += lines;
            this.score += this.getLineClearPoints(lines);
            const newLevel = Math.floor(this.lines / 10);
            // Check for level up
            if (newLevel > this.level) {
                (_a = this.soundManager) === null || _a === void 0 ? void 0 : _a.play('levelUp');
            }
            this.level = newLevel;
            // Update game speed based on level
            this.time.level = Math.max(100, 1000 - (this.level * 50));
        }
        return lines;
    }
    getLineClearPoints(lines) {
        switch (lines) {
            case 1: return POINTS.SINGLE * (this.level + 1);
            case 2: return POINTS.DOUBLE * (this.level + 1);
            case 3: return POINTS.TRIPLE * (this.level + 1);
            case 4: return POINTS.TETRIS * (this.level + 1);
            default: return 0;
        }
    }
}
//# sourceMappingURL=Board.js.map