import { COLS, BLOCK_SIZE, COLORS, SHAPES, NEXT_COLS, NEXT_ROWS } from './constants.js';

export class Piece {
  public typeId: number = 0;
  public shape: number[][] = [];
  public color: string = '';
  public x: number = 0;
  public y: number = 0;
  public ctx: CanvasRenderingContext2D | null = null;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.spawn();
  }

  public spawn(): void {
    this.typeId = this.randomizeTetrominoType(COLORS.length - 1);
    this.shape = SHAPES[this.typeId].map(row => [...row]);
    this.color = COLORS[this.typeId];
    this.x = Math.floor(COLS / 2) - Math.floor(this.shape[0].length / 2);
    this.y = 0;
  }

  public draw(): void {
    if (!this.ctx) return;
    
    this.ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx?.fillRect(
            (this.x + x) * BLOCK_SIZE,
            (this.y + y) * BLOCK_SIZE,
            BLOCK_SIZE - 1,
            BLOCK_SIZE - 1
          );
        }
      });
    });
  }

  public move(p: { x: number; y: number; shape?: number[][] }): void {
    this.x = p.x;
    this.y = p.y;
    if (p.shape) {
      this.shape = p.shape.map(row => [...row]);
    }
  }

  private randomizeTetrominoType(noOfTypes: number): number {
    return Math.floor(Math.random() * noOfTypes + 1);
  }

  public setStartingPosition(): void {
    this.x = this.typeId === 4 ? 4 : 3;
  }

  public drawNext(ctx: CanvasRenderingContext2D): void {
    if (!ctx) return;
    
    const blockSize = BLOCK_SIZE * 0.7;
    const xOffset = (NEXT_COLS * blockSize - this.shape[0].length * blockSize) / 2;
    const yOffset = (NEXT_ROWS * blockSize - this.shape.length * blockSize) / 2;

    ctx.fillStyle = this.color;
    this.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          ctx.fillRect(
            xOffset + x * blockSize,
            yOffset + y * blockSize,
            blockSize - 1,
            blockSize - 1
          );
        }
      });
    });
  }
}
