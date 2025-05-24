export declare class Piece {
    typeId: number;
    shape: number[][];
    color: string;
    x: number;
    y: number;
    ctx: CanvasRenderingContext2D | null;
    constructor(ctx: CanvasRenderingContext2D);
    spawn(): void;
    draw(): void;
    move(p: {
        x: number;
        y: number;
        shape?: number[][];
    }): void;
    private randomizeTetrominoType;
    setStartingPosition(): void;
    drawNext(ctx: CanvasRenderingContext2D): void;
}
