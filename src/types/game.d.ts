// Global type declarations for the Tetris game

type BlockType = number;
type Grid = BlockType[][];

interface Point {
  x: number;
  y: number;
}

interface Piece {
  shape: number[][];
  color: string;
  x: number;
  y: number;
  ctx: CanvasRenderingContext2D;
  setStartingPosition: () => void;
  draw: () => void;
  move: (p: Point) => void;
  rotate: () => void;
  drawNext: (ctx: CanvasRenderingContext2D) => void;
}

interface GameTime {
  start: number;
  elapsed: number;
  level: number;
  lastDrop?: number;
}

interface AccountValues {
  score: number;
  level: number;
  lines: number;
}

declare const COLS: number;
declare const ROWS: number;
declare const BLOCK_SIZE: number;

declare const COLORS: string[];

declare const POINTS: {
  SINGLE: number;
  DOUBLE: number;
  TRIPLE: number;
  TETRIS: number;
  SOFT_DROP: number;
  HARD_DROP: number;
};

declare const KEY: {
  ESC: string;
  SPACE: string;
  LEFT: string;
  UP: string;
  RIGHT: string;
  DOWN: string;
  P: string;
};

declare const LEVEL: number;
