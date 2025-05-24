import { BLOCK_SIZE, KEY, POINTS, LEVEL, type KeyValue } from './constants.js';
import { Board } from './Board.js';

// Extend Window interface to include BLOCK_SIZE
declare global {
  interface Window {
    BLOCK_SIZE: number;
  }
}

// Make BLOCK_SIZE available globally for canvas sizing
window.BLOCK_SIZE = BLOCK_SIZE;

interface AccountValues {
  score: number;
  level: number;
  lines: number;
}

interface GameTime {
  start: number;
  elapsed: number;
  level: number;
  lastDrop?: number;
}

type MoveFunction = (p: { x: number; y: number; shape: number[][] }) => { x: number; y: number; shape: number[][] };
type KeyMap = { [key: string]: KeyValue | 'ESC' };

export class Game {
  // Canvas elements are used indirectly through their contexts
  private readonly ctx: CanvasRenderingContext2D;
  private readonly ctxNext: CanvasRenderingContext2D;
  private board: Board;
  private soundManager: any; // TODO: Define proper type for soundManager
  private accountValues: AccountValues;
  private _time: GameTime = { start: 0, elapsed: 0, level: 1000 };
  private get time(): GameTime { return this._time; }
  private set time(value: GameTime) { this._time = value; }
  private requestId: number | null = null;
  private moves: { [key: string]: MoveFunction };
  private keyMap: KeyMap;
  private isPaused: boolean = false;
  private dropCounter: number = 0;
  // Game timing and state
  // Game timing and state
  private readonly dropInterval: number = 1000; // Start with 1 second drop interval
  private lastTime: number = 0;
  private isGameOver: boolean = false;
  private isRunning: boolean = false;
  private keyStates: { [key: string]: boolean } = {};
  private lastKeyPressTime: { [key: string]: number } = {};
  private readonly keyRepeatDelay: number = 200; // ms before key starts repeating
  private keyRepeatInterval: number = 50; // ms between key repeats

  constructor(canvas: HTMLCanvasElement, canvasNext: HTMLCanvasElement, soundManager: any) {
    this.soundManager = soundManager;
    console.log('Game constructor called');
    
    // Initialize main canvas context
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get 2D context for canvas');
    this.ctx = ctx;
    
    // Initialize next piece canvas context
    const ctxNext = canvasNext.getContext('2d');
    if (!ctxNext) throw new Error('Could not get 2D context for next canvas');
    this.ctxNext = ctxNext;
    
    console.log('Contexts created');
    
    this.board = new Board(this.ctx, this.ctxNext, this.soundManager);
    console.log('Board initialized with sound manager');
    
    this.accountValues = {
      score: 0,
      level: 0,
      lines: 0
    };
    
    this.time = { start: 0, elapsed: 0, level: 1000 };
    
    // Bind the animate method to the current instance
    this.animate = this.animate.bind(this);
    
    // Keyboard controls mapping
    this.moves = {
      [KEY.LEFT]:  (p) => ({ ...p, x: p.x - 1 }),
      [KEY.RIGHT]: (p) => ({ ...p, x: p.x + 1 }),
      [KEY.DOWN]:  (p) => ({ ...p, y: p.y + 1 }),
      [KEY.UP]:    (p) => this.board.rotate(p),
      [KEY.SPACE]: (p) => ({ ...p, y: p.y + 1 })
    };
    
    // Map key codes to actions
    this.keyMap = {
      'ArrowLeft': KEY.LEFT,
      'ArrowRight': KEY.RIGHT,
      'ArrowDown': KEY.DOWN,
      'ArrowUp': KEY.UP,
      ' ': KEY.SPACE,
      'Escape': 'ESC' as const
    };
    
    // Bind methods
    this.animate = this.animate.bind(this);
    this.keydown = this.keydown.bind(this);
    this.keyup = this.keyup.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isGameOver = false;
    this.isPaused = false;
    
    // Reset the board and account values
    this.board.reset();
    this.accountValues = {
      score: 0,
      level: 0,
      lines: 0
    };
    
    // Update the UI
    this.updateAccount('score', 0);
    this.updateAccount('level', 0);
    this.updateAccount('lines', 0);
    
    // Reset time
    this._time = { ...this._time, start: 0, elapsed: 0, level: 1000 };
    
    // Start the game loop
    this.lastTime = 0;
    this.dropCounter = 0;
    
    // Start background music if available
    if (this.soundManager) {
      // Try to play background music immediately
      this.soundManager.playBackgroundMusic();
      
      // Also try to play on first user interaction
      const startOnInteraction = () => {
        document.removeEventListener('click', startOnInteraction);
        document.removeEventListener('keydown', startOnInteraction);
        this.soundManager.playBackgroundMusic();
      };
      
      // Add event listeners for first interaction
      document.addEventListener('click', startOnInteraction, { once: true });
      document.addEventListener('keydown', startOnInteraction, { once: true });
    }
    
    // Start the game loop
    this.requestId = requestAnimationFrame(this.animate);
    
    // Add event listeners
    this.addEventListeners();
  }

  private animate(now: number = 0): void {
    if (this.isPaused || this.isGameOver) {
      this.requestId = requestAnimationFrame(this.animate);
      return;
    }
    
    // Calculate delta time
    if (!this.lastTime) {
      this.lastTime = now;
      this.requestId = requestAnimationFrame(this.animate);
      return;
    }
    
    const deltaTime = now - this.lastTime;
    this.lastTime = now;
    
    // Update drop counter
    this.dropCounter += deltaTime;
    
    // Get the current drop interval based on level
    const dropInterval = this.getDropInterval();
    
    // Drop the piece if it's time
    if (this.dropCounter > dropInterval) {
      this.drop();
      this.dropCounter = 0;
    }
    
    // Draw the game state
    this.draw();
    
    // Continue the animation loop
    this.requestId = requestAnimationFrame(this.animate);
  }

  private getDropInterval(): number {
    // Get the drop interval based on the current level
    const level = this.accountValues.level;
    return LEVEL[Math.min(level, 21)] || this.dropInterval;
  }

  private drop(): void {
    if (this.isPaused || this.isGameOver) return;
    
    // Move the piece down
    this.board.drop();
    
    // Update the score for the soft drop
    this.updateAccount('score', this.accountValues.score + POINTS.SOFT_DROP);
    
    // Check for game over
    if (this.board.gameOver) {
      this.gameOver();
    }
  }

  private gameOver(): void {
    this.isGameOver = true;
    this.soundManager.play('gameOver');
    
    // Stop the game loop
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
    
    // Show game over modal
    const gameOverModal = document.getElementById('game-over');
    if (gameOverModal) {
      const finalScoreElement = document.getElementById('final-score');
      if (finalScoreElement) {
        finalScoreElement.textContent = this.accountValues.score.toString();
      }
      gameOverModal.classList.add('show');
    }
    
    // Stop background music
    if (this.soundManager) {
      this.soundManager.stopBackgroundMusic();
    }
    
    console.log('Game Over');
  }

  private updateAccount(key: keyof AccountValues, value: number): void {
    this.accountValues[key] = value;
    
    // Update the UI
    const element = document.getElementById(key);
    if (element) {
      element.textContent = value.toString();
    }
  }

  private addEventListeners(): void {
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keyup', this.keyup);
    
    document.addEventListener('keydown', this.keydown);
    document.addEventListener('keyup', this.keyup);
  }

  private keydown(event: KeyboardEvent): void {
    if (this.isGameOver) return;
    
    const now = Date.now();
    const key = event.key;
    
    // Handle pause
    if (key === 'p' || key === 'P') {
      this.togglePause();
      return;
    }
    
    const timeSinceLastPress = now - (this.lastKeyPressTime[key] || 0);
    
    // Skip if this is a repeated key press and we're within the repeat interval
    if (this.keyStates[key] && timeSinceLastPress < this.keyRepeatInterval) {
      return;
    }
    
    // For the first key press, wait for the initial delay
    if (this.keyStates[key] && timeSinceLastPress < this.keyRepeatDelay) {
      return;
    }
    
    this.keyStates[key] = true;
    this.lastKeyPressTime[key] = now;
    
    // Handle the key press
    this.handleKeyPress(key);
  }

  private keyup(event: KeyboardEvent): void {
    this.keyStates[event.key] = false;
  }

  private handleKeyPress(key: string): void {
    if (this.isPaused || this.isGameOver) return;
    
    const action = this.keyMap[key];
    
    if (action === 'ESC') {
      this.togglePause();
      return;
    }
    
    if (action && this.moves[action]) {
      // Play move sound if available
      if (this.soundManager && action !== KEY.SPACE) {
        this.soundManager.play('move');
      }
      
      // Handle the move
      this.board.move(this.moves[action]);
      
      // If it's a hard drop (space), keep dropping until it hits something
      if (action === KEY.SPACE) {
        while (this.board.move(this.moves[action])) {
          this.updateAccount('score', this.accountValues.score + POINTS.HARD_DROP);
        }
        this.drop();
      }
      
      // Redraw the game state
      this.draw();
    }
  }

  public togglePause(): void {
    this.isPaused = !this.isPaused;
    
    const pauseModal = document.getElementById('pause');
    const pauseButton = document.getElementById('pause-button');
    
    if (pauseModal) {
      pauseModal.style.display = this.isPaused ? 'flex' : 'none';
    }
    
    // Update pause button icon and title
    if (pauseButton) {
      if (this.isPaused) {
        pauseButton.innerHTML = '▶️'; // Play icon when paused
        pauseButton.setAttribute('title', 'Resume');
      } else {
        pauseButton.innerHTML = '⏸️'; // Pause icon when playing
        pauseButton.setAttribute('title', 'Pause');
      }
    }
    
    // Play/pause background music
    if (this.soundManager) {
      if (this.isPaused) {
        this.soundManager.pauseBackgroundMusic();
      } else {
        this.soundManager.resumeBackgroundMusic();
      }
    }
  }

  private draw(): void {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw the board
    this.board.draw();
    
    // Draw the next piece preview
    this.board.drawNext();
  }

  public destroy(): void {
    // Clean up event listeners
    document.removeEventListener('keydown', this.keydown);
    document.removeEventListener('keyup', this.keyup);
    
    // Stop the game loop
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
    
    // Stop any sounds
    if (this.soundManager) {
      this.soundManager.stopBackgroundMusic();
    }
  }
}
