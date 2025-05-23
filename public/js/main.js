import { Game } from './game.js';
import { SoundManager } from './soundManager.js';
import { GameTimer } from './gameTimer.js';
import { COLS, ROWS, BLOCK_SIZE } from './constants.js';

// Make BLOCK_SIZE available globally for canvas sizing
window.BLOCK_SIZE = BLOCK_SIZE;

// Initialize sound manager and timer
export const soundManager = new SoundManager();
const gameTimer = new GameTimer();

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Get canvas elements and buttons
  const canvas = document.getElementById('tetris');
  const canvasNext = document.getElementById('next-piece');
  const pauseButton = document.getElementById('pause-button');
  const restartButton = document.getElementById('restart-button');
  const gameOverModal = document.getElementById('game-over');
  let isPaused = false;
  
  console.log('Initializing game...');
  
  // Set canvas size based on constants
  canvas.width = COLS * BLOCK_SIZE;
  canvas.height = ROWS * BLOCK_SIZE;
  
  // Scale the canvas for high DPI displays
  const scale = window.devicePixelRatio || 1;
  
  // Set canvas display size (CSS pixels)
  canvas.style.width = (COLS * BLOCK_SIZE) + 'px';
  canvas.style.height = (ROWS * BLOCK_SIZE) + 'px';
  
  // Set canvas render size (actual pixels)
  canvas.width = COLS * BLOCK_SIZE * scale;
  canvas.height = ROWS * BLOCK_SIZE * scale;
  
  // Scale the context to account for device pixel ratio
  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  
  // Scale the next piece canvas
  const nextPieceSize = 100;
  canvasNext.style.width = nextPieceSize + 'px';
  canvasNext.style.height = nextPieceSize + 'px';
  canvasNext.width = nextPieceSize * scale;
  canvasNext.height = nextPieceSize * scale;
  const ctxNext = canvasNext.getContext('2d');
  ctxNext.scale(scale, scale);
  
  // Initialize the game with sound manager after canvas setup
  const game = new Game(canvas, canvasNext, soundManager);
  console.log('Game initialized with sound manager');
  
  // Pause button functionality
  pauseButton.addEventListener('click', () => {
    if (!game.board.gameOver) {
      isPaused = !isPaused;
      if (isPaused) {
        game.pause();
        pauseButton.textContent = '▶️';
        pauseButton.title = 'Resume';
      } else {
        game.play();
        pauseButton.textContent = '⏸️';
        pauseButton.title = 'Pause';
      }
    }
  });
  
  // Handle keyboard events for game controls
  const handleKeyDown = (event) => {
    // Only process game control keys
    const gameKeys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Escape'];
    if (gameKeys.includes(event.key)) {
      // Prevent default for all game control keys
      event.preventDefault();
      event.stopPropagation();
      
      // Handle the key press
      game.keyDown(event);
      
      // Don't allow any other handlers to process this event
      event.stopImmediatePropagation();
      return false;
    }
  };
  
  // Add event listeners for keyboard controls
  document.addEventListener('keydown', handleKeyDown);
  
  // Also add to window to catch events that might bubble up
  window.addEventListener('keydown', handleKeyDown);
  
  // Prevent context menu on right-click to avoid interference
  document.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    return false;
  });
  
  // Start the game automatically
  console.log('Starting game automatically');
  try {
    game.play();
    isPaused = false;
    pauseButton.textContent = '⏸️';
    pauseButton.title = 'Pause';
    console.log('Game started automatically');
    // Start background music when game starts
    soundManager.playBackgroundMusic();
  } catch (error) {
    console.error('Error starting game:', error);
  }
  
  restartButton.addEventListener('click', () => {
    gameOverModal.style.display = 'none';
    gameTimer.reset();
    game.play();
    gameTimer.start();
    isPaused = false;
    pauseButton.textContent = '⏸️';
    pauseButton.title = 'Pause';
    soundManager.playBackgroundMusic();
  });
  
  // Prevent arrow keys from scrolling the page
  window.addEventListener('keydown', (e) => {
    if ([32, 37, 38, 39, 40].includes(e.keyCode)) {
      e.preventDefault();
    }
  }, false);

  // Sound toggle button
  const soundToggle = document.getElementById('sound-toggle');
  if (soundToggle) {
    soundToggle.addEventListener('click', () => {
      const isMuted = soundManager.toggleMute();
      soundToggle.classList.toggle('muted', isMuted);
      soundToggle.textContent = isMuted ? '🔇' : '🔊';
    });
  }
});
