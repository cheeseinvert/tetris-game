export declare const COLS = 10;
export declare const ROWS = 20;
export declare const BLOCK_SIZE = 30;
export declare const NEXT_COLS = 4;
export declare const NEXT_ROWS = 4;
export declare const KEY: {
    readonly LEFT: "ArrowLeft";
    readonly RIGHT: "ArrowRight";
    readonly DOWN: "ArrowDown";
    readonly UP: "ArrowUp";
    readonly SPACE: " ";
    readonly P: "p";
    readonly ESC: "Escape";
};
export declare const COLORS: string[];
export declare const SHAPES: readonly [readonly [readonly [0, 0, 0, 0], readonly [1, 1, 1, 1], readonly [0, 0, 0, 0], readonly [0, 0, 0, 0]], readonly [readonly [1, 0, 0], readonly [1, 1, 1], readonly [0, 0, 0]], readonly [readonly [0, 0, 1], readonly [1, 1, 1], readonly [0, 0, 0]], readonly [readonly [1, 1], readonly [1, 1]], readonly [readonly [0, 1, 1], readonly [1, 1, 0], readonly [0, 0, 0]], readonly [readonly [0, 1, 0], readonly [1, 1, 1], readonly [0, 0, 0]], readonly [readonly [1, 1, 0], readonly [0, 1, 1], readonly [0, 0, 0]]];
export declare const POINTS: {
    readonly SINGLE: 100;
    readonly DOUBLE: 300;
    readonly TRIPLE: 500;
    readonly TETRIS: 800;
    readonly SOFT_DROP: 1;
    readonly HARD_DROP: 2;
};
export declare const LEVEL: {
    [key: number]: number;
};
export declare const SOUNDS: {
    readonly move: {
        readonly path: "/sounds/move.ogg";
        readonly volume: 0.5;
    };
    readonly rotate: {
        readonly path: "/sounds/rotate.ogg";
        readonly volume: 0.5;
    };
    readonly drop: {
        readonly path: "/sounds/drop.ogg";
        readonly volume: 0.5;
    };
    readonly clear: {
        readonly path: "/sounds/clear.ogg";
        readonly volume: 0.7;
    };
    readonly gameOver: {
        readonly path: "/sounds/gameover.ogg";
        readonly volume: 0.8;
    };
    readonly levelUp: {
        readonly path: "/sounds/levelup.ogg";
        readonly volume: 0.8;
    };
    readonly background: {
        readonly path: "/sounds/background.mp3";
        readonly volume: 0.3;
        readonly loop: true;
    };
};
export type KeyType = keyof typeof KEY;
export type KeyValue = typeof KEY[KeyType];
export type PointsType = keyof typeof POINTS;
export type SoundType = keyof typeof SOUNDS;
