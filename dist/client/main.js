import { Game } from './Game.js';
import { SoundManager } from './SoundManager.js';
import { COLS, ROWS, BLOCK_SIZE } from './constants.js';
// Make BLOCK_SIZE available globally for canvas sizing
window.BLOCK_SIZE = BLOCK_SIZE;
// Game and UI elements
let game = null;
let soundManager = null;
// Wait for the DOM to be fully loaded and sounds to be loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Initialize sound manager
    const soundManagerInstance = new SoundManager();
    soundManager = soundManagerInstance;
    // Get start screen and game container elements
    const startScreen = document.getElementById('start-screen');
    const gameContainer = document.querySelector('.game-container');
    const startButton = document.getElementById('start-button');
    // Function to start the game
    const startGame = async () => {
        // Hide start screen and show game container
        startScreen.style.display = 'none';
        gameContainer.style.display = 'block';
        // Initialize the game after user interaction
        await initializeGame();
        // Try to play background music after a short delay
        setTimeout(() => {
            if (soundManager) {
                soundManager.playBackgroundMusic();
            }
        }, 500);
    };
    // Add event listeners for start button and keyboard
    startButton.addEventListener('click', startGame);
    document.addEventListener('keydown', function onFirstKeyPress(e) {
        if (e.code === 'Space' || e.key === 'Enter') {
            e.preventDefault();
            document.removeEventListener('keydown', onFirstKeyPress);
            startGame();
        }
    }, { once: true });
});
// Initialize the game
async function initializeGame() {
    // Get canvas elements and buttons
    const canvas = document.getElementById('tetris');
    const canvasNext = document.getElementById('next-piece');
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    const muteButton = document.getElementById('mute-button');
    const gameOverModal = document.getElementById('game-over');
    const pauseModal = document.getElementById('pause');
    if (!canvas || !canvasNext || !soundManager) {
        console.error('Could not initialize game: Missing required elements');
        return;
    }
    console.log('Initializing game...');
    // Set canvas size based on constants
    canvas.width = COLS * BLOCK_SIZE;
    canvas.height = ROWS * BLOCK_SIZE;
    // Scale the canvas for high DPI displays
    const scale = window.devicePixelRatio || 1;
    // Set canvas display size (CSS pixels)
    canvas.style.width = `${COLS * BLOCK_SIZE}px`;
    canvas.style.height = `${ROWS * BLOCK_SIZE}px`;
    // Set canvas render size (actual pixels)
    canvas.width = COLS * BLOCK_SIZE * scale;
    canvas.height = ROWS * BLOCK_SIZE * scale;
    // Scale the context to account for device pixel ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context for main canvas');
        return;
    }
    ctx.scale(scale, scale);
    // Scale the next piece canvas
    const nextPieceSize = 100;
    canvasNext.style.width = `${nextPieceSize}px`;
    canvasNext.style.height = `${nextPieceSize}px`;
    canvasNext.width = nextPieceSize * scale;
    canvasNext.height = nextPieceSize * scale;
    const ctxNext = canvasNext.getContext('2d');
    if (!ctxNext) {
        console.error('Could not get 2D context for next piece canvas');
        return;
    }
    ctxNext.scale(scale, scale);
    try {
        // Load sounds before starting the game
        console.log('Loading sounds...');
        await soundManager.loadSounds();
        console.log('Sounds loaded successfully');
        // Initialize the game
        game = new Game(canvas, canvasNext, soundManager);
        // Make game available globally for debugging
        window.game = game;
        // Start the game
        game.start();
        console.log('Game started');
    }
    catch (error) {
        console.error('Failed to initialize game:', error);
        return; // Exit if game initialization fails
    }
    // Event listeners for UI buttons
    if (pauseButton) {
        pauseButton.addEventListener('click', () => {
            if (game) {
                game.togglePause();
            }
        });
    }
    if (restartButton) {
        restartButton.addEventListener('click', async () => {
            // Hide modals
            if (gameOverModal)
                gameOverModal.classList.remove('show');
            if (pauseModal)
                pauseModal.classList.remove('show');
            // Clean up existing game
            if (game) {
                game.destroy();
            }
            // Reinitialize the game
            await initializeGame();
            // Try to play background music after a short delay
            setTimeout(() => {
                if (soundManager) {
                    soundManager.playBackgroundMusic();
                }
            }, 500);
        });
    }
    if (muteButton && soundManager) {
        muteButton.addEventListener('click', () => {
            soundManager === null || soundManager === void 0 ? void 0 : soundManager.toggleMute();
            if (muteButton && soundManager) {
                muteButton.textContent = soundManager.isMuted() ? '🔇' : '🔊';
            }
        });
    }
    // The restart button is already handled above with the ID 'restart-button'
    // This matches the HTML where the button has id="restart-button"
    // Handle keyboard events
    const handleKeyDown = (event) => {
        // Prevent default for game control keys to avoid page scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
        // Prevent default for game control keys to avoid page scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
            event.preventDefault();
        }
    };
    // Add event listeners for keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    // Clean up event listeners when the window is unloaded
    window.addEventListener('beforeunload', () => {
        document.removeEventListener('keydown', handleKeyDown);
        if (game) {
            game.destroy();
        }
    });
    console.log('Game initialized');
}
// Export for debugging in browser console
if (typeof window !== 'undefined' && soundManager) {
    window.soundManager = soundManager;
}
//# sourceMappingURL=main.js.map