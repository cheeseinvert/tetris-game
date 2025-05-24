import { Piece } from './Piece.js';
import type { ISoundManager } from './SoundManager.js';
type Grid = number[][];
interface GameTime {
    start: number;
    elapsed: number;
    level: number;
    lastDrop?: number;
}
export declare class Board {
    grid: Grid;
    piece: Piece | null;
    next: Piece | null;
    gameOver: boolean;
    score: number;
    lines: number;
    level: number;
    requestId: number | null;
    time: GameTime;
    private ctx;
    private ctxNext;
    private soundManager;
    constructor(ctx: CanvasRenderingContext2D, ctxNext: CanvasRenderingContext2D, soundManager: ISoundManager);
    reset(): void;
    getEmptyBoard(): Grid;
    private valid;
    private insideWalls;
    private notOccupied;
    draw(): void;
    private drawGrid;
    private drawBoard;
    rotate(piece: {
        shape: number[][];
        x: number;
        y: number;
    }): {
        shape: number[][];
        x: number;
        y: number;
    };
    move(moveFn: (p: {
        x: number;
        y: number;
        shape: number[][];
    }) => {
        x: number;
        y: number;
        shape: number[][];
    }): boolean;
    drawNext(): void;
    getPiece(): Piece | null;
    setPiece(piece: Piece | null): void;
    drop(): void;
    private freeze;
    private clearLines;
    private getLineClearPoints;
}
export {};
