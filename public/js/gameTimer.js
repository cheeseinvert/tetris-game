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
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.startTime = Date.now() - this.elapsedTime;
    
    this.timerInterval = setInterval(() => {
      this.elapsedTime = Date.now() - this.startTime;
      this.updateDisplay();
    }, 100);
  }
  
  // Pause the timer
  pause() {
    if (!this.isRunning) return;
    
    clearInterval(this.timerInterval);
    this.isRunning = false;
  }
  
  // Reset the timer
  reset() {
    this.pause();
    this.elapsedTime = 0;
    this.updateDisplay();
  }
  
  // Get formatted time string (MM:SS)
  getFormattedTime() {
    const totalSeconds = Math.floor(this.elapsedTime / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  
  // Update the display element if it exists
  updateDisplay() {
    if (this.displayElement) {
      this.displayElement.textContent = this.getFormattedTime();
    }
  }
  
  // Get the current time in seconds
  getTimeInSeconds() {
    return Math.floor(this.elapsedTime / 1000);
  }
}
