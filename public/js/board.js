import { COLS, ROWS, BLOCK_SIZE, POINTS, COLORS } from './constants.js';
import { Piece } from './pieces.js';

export class Board {
  constructor(ctx, ctxNext, soundManager) {
    this.soundManager = soundManager;
    this.ctx = ctx;
    this.ctxNext = ctxNext;
    this.grid = this.getEmptyBoard();
    this.piece = null;
    this.next = null;
    this.gameOver = false;
    this.score = 0;
    this.lines = 0;
    this.level = 0;
    this.requestId = null;
    this.time = { start: 0, elapsed: 0, level: 1000 };
  }

  reset() {
    this.grid = this.getEmptyBoard();
    this.gameOver = false;
    this.score = 0;
    this.lines = 0;
    this.level = 0;
    this.time = { start: 0, elapsed: 0, level: 1000 };
    
    // Create new pieces
    this.piece = new Piece(this.ctx);
    this.next = new Piece(this.ctxNext);
    
    // Set starting positions
    this.piece.setStartingPosition();
    this.next.setStartingPosition();
    
    // Draw the initial state
    this.draw();
    this.drawNext();
    
    console.log('Board reset - New piece spawned at:', this.piece);
  }

  getEmptyBoard() {
    return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  }

  valid(p) {
    return p.shape.every((row, dy) => {
      return row.every((value, dx) => {
        let x = p.x + dx;
        let y = p.y + dy;
        return (
          value === 0 ||
          (this.insideWalls(x, y) && this.notOccupied(x, y))
        );
      });
    });
  }

  insideWalls(x, y) {
    return x >= 0 && x < COLS && y < ROWS;
  }

  notOccupied(x, y) {
    return y < 0 || !this.grid[y] || this.grid[y][x] === 0;
  }

  rotate(p, direction) {
    // Clone the piece to avoid modifying the original
    let clone = JSON.parse(JSON.stringify(p));
    
    // Transpose the matrix
    for (let y = 0; y < clone.shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [clone.shape[x][y], clone.shape[y][x]] = [clone.shape[y][x], clone.shape[x][y]];
      }
    }
    
    // Reverse the order of the columns
    if (direction > 0) {
      clone.shape.forEach(row => row.reverse());
    } else {
      clone.shape.reverse();
    }
    
    return clone;
  }

  draw() {
    // Clear the board
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    
    // Draw the grid
    this.grid.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          this.ctx.fillStyle = COLORS[value - 1];
          this.ctx.fillRect(
            x * BLOCK_SIZE, 
            y * BLOCK_SIZE, 
            BLOCK_SIZE - 1, 
            BLOCK_SIZE - 1
          );
        }
      });
    });
    
    // Draw the current piece
    if (this.piece) {
      this.piece.draw();
    }
    
    // Draw a border around the board for better visibility
    this.ctx.strokeStyle = '#666';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(0, 0, COLS * BLOCK_SIZE, ROWS * BLOCK_SIZE);
  }

  drawNext() {
    if (this.next) {
      this.ctxNext.clearRect(0, 0, this.ctxNext.canvas.width, this.ctxNext.canvas.height);
      this.next.drawNext(this.ctxNext);
    }
  }

  drop() {
    if (!this.piece) {
      console.error('No active piece to drop');
      return false;
    }

    // Create a copy of the piece one row below
    const nextPos = { ...this.piece, y: this.piece.y + 1 };
    
    // Check if the piece can move down
    if (this.valid(nextPos)) {
      // Move the piece down
      this.piece.move(nextPos);
      return true;
    }
    
    // If we can't move down, freeze the piece
    this.freeze();
    
    // Clear any complete lines
    const linesCleared = this.clearLines();
    
    // Check for game over (if piece is at or near the top)
    const isGameOver = this.piece.y <= 1;
    if (isGameOver) {
      console.log('Game over - piece at y:', this.piece.y);
      this.gameOver = true;
      return false;
    }
    
    // Spawn a new piece
    this.piece = this.next;
    this.next = new Piece(this.ctxNext);
    this.piece.ctx = this.ctx;  // Make sure the piece uses the main canvas context
    this.piece.setStartingPosition();
    this.next.setStartingPosition();
    
    console.log('New piece spawned at:', this.piece);
    
    // Draw the new next piece
    this.drawNext();
    
    return true;
  }

  freeze() {
    if (!this.piece) {
      console.error('No active piece to freeze');
      return;
    }
    
    console.log('Freezing piece at y:', this.piece.y);
    
    this.piece.shape.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value > 0) {
          const boardY = y + this.piece.y;
          const boardX = x + this.piece.x;
          if (boardY >= 0 && boardY < ROWS && boardX >= 0 && boardX < COLS) {
            this.grid[boardY][boardX] = this.piece.typeId + 1;
            console.log(`Froze block at (${boardX}, ${boardY})`);
          }
        }
      });
    });
    
    // Draw the frozen piece immediately
    this.draw();
  }

  clearLines() {
    let lines = 0;
    
    this.grid.forEach((row, y) => {
      // If every value is greater than 0
      if (row.every(cell => cell > 0)) {
        lines++;
        
        // Remove the line
        this.grid.splice(y, 1);
        // Add new empty line at the top
        this.grid.unshift(Array(COLS).fill(0));
      }
    });
    
    if (lines > 0) {
      // Update score
      this.lines += lines;
      this.score += this.getLineClearPoints(lines);
      const newLevel = Math.floor(this.lines / 10);
      
      // Check for level up
      if (newLevel > this.level) {
        this.soundManager.play('levelUp');
      }
      
      this.level = newLevel;
      
      // Update game speed based on level
      this.time.level = Math.max(100, 1000 - (this.level * 50));
    }
    
    return lines;
  }

  getLineClearPoints(lines) {
    switch (lines) {
      case 1: return POINTS.SINGLE * (this.level + 1);
      case 2: return POINTS.DOUBLE * (this.level + 1);
      case 3: return POINTS.TRIPLE * (this.level + 1);
      case 4: return POINTS.TETRIS * (this.level + 1);
      default: return 0;
    }
  }
}
