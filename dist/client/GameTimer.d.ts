interface GameTime {
    minutes: number;
    seconds: number;
    milliseconds: number;
}
export declare class GameTimer {
    private startTime;
    private elapsedTime;
    private timerInterval;
    private isRunning;
    private displayElement;
    constructor();
    init(displayElement: HTMLElement): void;
    start(): void;
    pause(): void;
    reset(): void;
    getTime(): GameTime;
    getTimeInSeconds(): number;
    getFormattedTime(): string;
    private updateDisplay;
    getElapsedTime(): number;
    destroy(): void;
}
export {};
