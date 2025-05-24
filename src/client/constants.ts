// Game constants
export const COLS = 10;
export const ROWS = 20;
export const BLOCK_SIZE = 30;
export const NEXT_COLS = 4;
export const NEXT_ROWS = 4;

export const KEY = {
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
  UP: 'ArrowUp',
  SPACE: ' ',
  P: 'p',
  ESC: 'Escape'
} as const;

export const COLORS: string[] = [
  'cyan',
  'blue',
  'orange',
  'yellow',
  'green',
  'purple',
  'red'
];

export const SHAPES = [
  [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]], // I
  [[1, 0, 0], [1, 1, 1], [0, 0, 0]], // J
  [[0, 0, 1], [1, 1, 1], [0, 0, 0]], // L
  [[1, 1], [1, 1]], // O
  [[0, 1, 1], [1, 1, 0], [0, 0, 0]], // S
  [[0, 1, 0], [1, 1, 1], [0, 0, 0]], // T
  [[1, 1, 0], [0, 1, 1], [0, 0, 0]]  // Z
] as const;

export const POINTS = {
  SINGLE: 100,
  DOUBLE: 300,
  TRIPLE: 500,
  TETRIS: 800,
  SOFT_DROP: 1,
  HARD_DROP: 2
} as const;

export const LEVEL: { [key: number]: number } = {
  0: 800,
  1: 720,
  2: 630,
  3: 550,
  4: 470,
  5: 380,
  6: 300,
  7: 220,
  8: 130,
  9: 100,
  10: 80,
  11: 80,
  12: 80,
  13: 70,
  14: 70,
  15: 70,
  16: 50,
  17: 50,
  18: 50,
  19: 30,
  20: 30,
  // 21+ : 20ms (as fast as possible)
  21: 20
};

// Sound configuration
export const SOUNDS = {
  move: { path: '/sounds/move.ogg', volume: 0.5 },
  rotate: { path: '/sounds/rotate.ogg', volume: 0.5 },
  drop: { path: '/sounds/drop.ogg', volume: 0.5 },
  clear: { path: '/sounds/clear.ogg', volume: 0.7 },
  gameOver: { path: '/sounds/gameover.ogg', volume: 0.8 },
  levelUp: { path: '/sounds/levelup.ogg', volume: 0.8 },
  background: { path: '/sounds/background.mp3', volume: 0.3, loop: true }
} as const;

// Type exports
export type KeyType = keyof typeof KEY;
export type KeyValue = typeof KEY[KeyType];
export type PointsType = keyof typeof POINTS;
export type SoundType = keyof typeof SOUNDS;
