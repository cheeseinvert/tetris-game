declare global {
    interface Window {
        BLOCK_SIZE: number;
    }
}
export declare class Game {
    private readonly ctx;
    private readonly ctxNext;
    private board;
    private soundManager;
    private accountValues;
    private _time;
    private get time();
    private set time(value);
    private requestId;
    private moves;
    private keyMap;
    private isPaused;
    private dropCounter;
    private readonly dropInterval;
    private lastTime;
    private isGameOver;
    private isRunning;
    private keyStates;
    private lastKeyPressTime;
    private readonly keyRepeatDelay;
    private keyRepeatInterval;
    constructor(canvas: HTMLCanvasElement, canvasNext: HTMLCanvasElement, soundManager: any);
    start(): void;
    private animate;
    private getDropInterval;
    private drop;
    private gameOver;
    private updateAccount;
    private addEventListeners;
    private keydown;
    private keyup;
    private handleKeyPress;
    togglePause(): void;
    private draw;
    destroy(): void;
}
