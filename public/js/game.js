import { COLS, ROWS, BLOCK_SIZE, KEY, POINTS, LEVEL } from './constants.js';
import { Board } from './board.js';
import { Piece } from './pieces.js';

// Make BLOCK_SIZE available globally for canvas sizing
window.BLOCK_SIZE = BLOCK_SIZE;

export class Game {
  constructor(canvas, canvasNext, soundManager) {
    this.soundManager = soundManager;
    console.log('Game constructor called');
    console.log('Canvas:', canvas);
    console.log('CanvasNext:', canvasNext);
    
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvasNext = canvasNext;
    this.ctxNext = canvasNext.getContext('2d');
    
    console.log('Contexts created');
    
    this.board = new Board(this.ctx, this.ctxNext, this.soundManager);
    console.log('Board initialized with sound manager');
    
    this.accountValues = {
      score: 0,
      level: 0,
      lines: 0
    };
    
    this.time = { start: 0, elapsed: 0, level: 1000 };
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
      'Escape': 'ESC'
    };
    
    this.reset();
    
    console.log('Game constructor completed');
  }

  reset() {
    this.time = { start: 0, elapsed: 0, level: 1000 };
    this.updateAccount('score', 0);
    this.updateAccount('lines', 0);
    this.updateAccount('level', 0);
    
    // Reset the board
    this.board = new Board(this.ctx, this.ctxNext, this.soundManager);
    
    // Initialize the first piece
    this.board.piece = new Piece(this.ctx);
    this.board.next = new Piece(this.ctxNext);
    this.board.piece.setStartingPosition();
    this.board.next.setStartingPosition();
    
    // Draw the initial state
    this.board.draw();
    this.board.drawNext();
    
    return this;
  }

  play() {
    console.log('Game.play() called');
    try {
      // Only reset if the game is over or hasn't started yet
      if (this.board.gameOver || this.time.start === 0) {
        this.reset();
        console.log('Game reset completed');
        
        // Initialize time tracking
        this.time = { 
          start: 0, 
          elapsed: 0, 
          level: 1000, // 1 second per drop
          lastDrop: 0 
        };
      }
      
      // If we have an old game running then cancel it
      if (this.requestId) {
        console.log('Cancelling previous animation frame');
        cancelAnimationFrame(this.requestId);
        this.requestId = null;
      }
      
      console.log('Starting game loop...');
      // Start the game loop
      this.animate(performance.now());
      console.log('Game loop started');
      
      // Play game start sound if sound manager is available
      if (this.soundManager) {
        this.soundManager.play('move');
      }
    } catch (error) {
      console.error('Error in Game.play():', error);
      throw error;
    }
  }

  animate(now = 0) {
    // If game is over, stop the animation
    if (this.board.gameOver) {
      this.gameOver();
      return;
    }
    
    // Initialize time tracking if needed
    if (!this.time.start) {
      this.time.start = now;
    }
    
    // Calculate time since last frame
    this.time.elapsed = now - this.time.start;
    
    // If it's time to drop the piece (every 1 second by default)
    const dropInterval = 1000; // 1 second
    if (this.time.elapsed > dropInterval) {
      this.time.start = now;
      
      // Try to move the piece down
      if (!this.board.drop()) {
        // If drop returns false, game over
        this.gameOver();
        return;
      }
      
      // Redraw after moving
      this.draw();
    }
    
    // Continue the animation loop
    this.requestId = requestAnimationFrame(this.animate);
    
    // Draw the current game state
    this.draw();
    
    // Log frame rate occasionally
    if (Math.random() < 0.01) { // Log approximately once every 100 frames
      console.log('Animation frame', this.requestId, 'at', now.toFixed(0), 'ms');
      console.log('Current piece position (x, y):', this.board.piece?.x, this.board.piece?.y);
    }
  }

  draw() {
    // Clear the canvas
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw the board and current piece
    if (this.board) {
      this.board.draw();
      this.board.drawNext();
      
      // Update the account values
      this.updateAccount('score', this.board.score);
      this.updateAccount('lines', this.board.lines);
      this.updateAccount('level', this.board.level);
    } else {
      console.error('Board is not initialized');
      throw error;
    }
  }

  keyDown(event) {
    // Only process if we have a valid key
    if (!event.key || !this.keyMap.hasOwnProperty(event.key)) {
      return;
    }
    
    // Don't do anything if the game is over or no piece is active
    if (this.board.gameOver || !this.board.piece) {
      return;
    }
    
    // Get the action from the key map
    const action = this.keyMap[event.key];
    
    // Prevent default for all game control keys to avoid page scrolling and extension conflicts
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    
    try {
      // Handle special actions first
      if (action === 'ESC') {
        this.pause();
        return;
      }
      
      // Get the move function for this action
      const move = this.moves[action];
      if (!move) return;
      
      if (action === KEY.SPACE) {
        // Hard drop
        let p = this.moves[KEY.DOWN](this.board.piece);
        while (this.board.valid(p)) {
          this.board.piece.move(p);
          p = this.moves[KEY.DOWN](this.board.piece);
        }
        // Play drop sound
        if (this.soundManager) {
          this.soundManager.play('drop');
        }
        // Force a drop to freeze the piece and get a new one
        this.board.drop();
      } else {
        // Regular move (left, right, down, rotate)
        const p = move(this.board.piece);
        if (this.board.valid(p)) {
          this.board.piece.move(p);
          // Play move sound for left/right/down, rotate sound for up
          if (this.soundManager) {
            this.soundManager.play(action === KEY.UP ? 'rotate' : 'move');
          }
        }
      }
      
      // Redraw the board after any move
      this.board.draw();
      this.board.drawNext();
      
    } catch (error) {
      console.error('Error in keyDown handler:', error);
    }
  }

  updateAccount(key, value) {
    const element = document.getElementById(key);
    if (element) {
      element.textContent = value;
    }
  }

  pause() {
    if (!this.board.gameOver) {
      if (this.requestId) {
        cancelAnimationFrame(this.requestId);
        this.requestId = null;
        // Show pause menu
      } else {
        this.animate();
        // Hide pause menu
      }
    }
  }


  gameOver() {
    cancelAnimationFrame(this.requestId);
    
    // Show final score in the modal
    document.getElementById('final-score').textContent = this.board.score;
    const gameOverModal = document.getElementById('game-over');
    
    // Ensure the modal is visible and properly positioned
    gameOverModal.style.display = 'flex';
    gameOverModal.style.opacity = '1';
    
    // Stop any background music
    if (this.soundManager) {
      this.soundManager.stopBackgroundMusic();
    }
  }
}
