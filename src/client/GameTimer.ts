interface GameTime {
  minutes: number;
  seconds: number;
  milliseconds: number;
}

export class GameTimer {
  private startTime: number;
  private elapsedTime: number;
  private timerInterval: NodeJS.Timeout | null;
  private isRunning: boolean;
  private displayElement: HTMLElement | null;
  
  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerInterval = null;
    this.isRunning = false;
    this.displayElement = null;
  }
  
  // Initialize the timer with a display element
  public init(displayElement: HTMLElement): void {
    this.displayElement = displayElement;
    this.updateDisplay();
  }
  
  // Start the timer
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now() - this.elapsedTime;
    
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay();
    }, 100);
  }
  
  // Pause the timer
  public pause(): void {
    if (!this.isRunning || !this.timerInterval) return;
    
    clearInterval(this.timerInterval);
    this.isRunning = false;
  }
  
  // Reset the timer
  public reset(): void {
    this.pause();
    this.elapsedTime = 0;
    this.updateDisplay();
  }
  
  // Get the current time
  public getTime(): GameTime {
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((this.elapsedTime % 1000) / 10);
    
    return { minutes, seconds, milliseconds };
  }
  
  // Get the current time in seconds
  public getTimeInSeconds(): number {
    return Math.floor(this.elapsedTime / 1000);
  }
  
  // Get formatted time string (MM:SS)
  public getFormattedTime(): string {
    const time = this.getTime();
    return `${time.minutes.toString().padStart(2, '0')}:${time.seconds.toString().padStart(2, '0')}`;
  }
  
  // Update the display element with the current time
  private updateDisplay(): void {
    if (this.displayElement) {
      this.displayElement.textContent = this.getFormattedTime();
    }
  }
  
  // Get the current elapsed time in milliseconds
  public getElapsedTime(): number {
    return this.elapsedTime;
  }
  
  // Clean up the timer
  public destroy(): void {
    this.pause();
    this.displayElement = null;
  }
}
