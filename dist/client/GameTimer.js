export class GameTimer {
    constructor() {
        this.startTime = 0;
        this.elapsedTime = 0;
        this.timerInterval = null;
        this.isRunning = false;
        this.displayElement = null;
    }
    // Initialize the timer with a display element
    init(displayElement) {
        this.displayElement = displayElement;
        this.updateDisplay();
    }
    // Start the timer
    start() {
        if (this.isRunning)
            return;
        this.isRunning = true;
        this.startTime = Date.now() - this.elapsedTime;
        this.timerInterval = setInterval(() => {
            this.elapsedTime = Date.now() - this.startTime;
            this.updateDisplay();
        }, 100);
    }
    // Pause the timer
    pause() {
        if (!this.isRunning || !this.timerInterval)
            return;
        clearInterval(this.timerInterval);
        this.isRunning = false;
    }
    // Reset the timer
    reset() {
        this.pause();
        this.elapsedTime = 0;
        this.updateDisplay();
    }
    // Get the current time
    getTime() {
        const totalSeconds = Math.floor(this.elapsedTime / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
        return { minutes, seconds, milliseconds };
    }
    // Get the current time in seconds
    getTimeInSeconds() {
        return Math.floor(this.elapsedTime / 1000);
    }
    // Get formatted time string (MM:SS)
    getFormattedTime() {
        const time = this.getTime();
        return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
    }
    // Update the display element with the current time
    updateDisplay() {
        if (this.displayElement) {
            this.displayElement.textContent = this.getFormattedTime();
        }
    }
    // Get the current elapsed time in milliseconds
    getElapsedTime() {
        return this.elapsedTime;
    }
    // Clean up the timer
    destroy() {
        this.pause();
        this.displayElement = null;
    }
}
//# sourceMappingURL=GameTimer.js.map