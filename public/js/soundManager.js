// Sound Manager for handling game audio
export class SoundManager {
  constructor() {
    this.masterVolume = 0.5; // Default volume (0 to 1)
    this.muted = false;
    
    // Use absolute paths for sound files
    const baseUrl = window.location.origin;
    this.sounds = {
      move: { path: `${baseUrl}/sounds/move.ogg`, volume: 0.1 },
      rotate: { path: `${baseUrl}/sounds/rotate.ogg`, volume: 0.1 },
      drop: { path: `${baseUrl}/sounds/drop.ogg`, volume: 0.1 },
      clear: { path: `${baseUrl}/sounds/clear.ogg`, volume: 0.1 },
      gameOver: { path: `${baseUrl}/sounds/gameover.ogg`, volume: 0.1 },
      levelUp: { path: `${baseUrl}/sounds/levelup.ogg`, volume: 0.1 },
      background: { path: `${baseUrl}/sounds/background.mp3`, volume: 0.4, audio: null }
    };
  }
  
  // Play a sound effect
  play(soundName) {
    if (this.muted || soundName === 'background') return;
    
    const sound = this.sounds[soundName];
    if (!sound) {
      console.warn(`Sound not found: ${soundName}`);
      return;
    }
    
    try {
      // Create a new audio element for this sound effect
      const audio = new Audio(sound.path);
      audio.volume = Math.max(0, Math.min(1, sound.volume * this.masterVolume));
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          if (error.name !== 'NotAllowedError') {
            console.warn(`Could not play sound ${soundName}:`, error);
          }
          audio.remove();
        });
      }
      
      // Clean up after the sound finishes playing
      audio.onended = () => audio.remove();
      
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  }
  
  // Toggle mute state
  toggleMute() {
    this.muted = !this.muted;
    
    // Update background music volume if it's playing
    const bgMusic = this.sounds.background;
    if (bgMusic.audio) {
      bgMusic.audio.muted = this.muted;
      if (!this.muted && bgMusic.audio.paused) {
        this.playBackgroundMusic();
      }
    }
    
    return this.muted;
  }
  
  // Stop all sounds (except background music)
  stopAll() {
    // Background music is handled separately
    const bgMusic = this.sounds.background;
    
    // Pause all other sounds
    Object.entries(this.sounds).forEach(([name, sound]) => {
      if (name !== 'background' && sound.audio) {
        sound.audio.pause();
        sound.audio.currentTime = 0;
        sound.audio = null;
      }
    });
  }
  
  // Individual sound methods for better semantics
  playMove() { this.play('move'); }
  playRotate() { this.play('rotate'); }
  playDrop() { this.play('drop'); }
  playClear() { this.play('clear'); }
  playGameOver() { this.play('gameOver'); }
  playLevelUp() { this.play('levelUp'); }
  
  // Background music control
  playBackgroundMusic() {
    if (this.muted) return;
    
    const bgMusic = this.sounds.background;
    if (!bgMusic) {
      console.warn('Background music not found');
      return;
    }
    
    // If background music is already playing, don't start it again
    if (bgMusic.audio) {
      if (!bgMusic.audio.paused) return;
      
      // If paused, try to resume
      try {
        bgMusic.audio.play().catch(console.warn);
        return;
      } catch (e) {
        console.warn('Failed to resume background music, creating new instance', e);
      }
    }
    
    // Create a new audio element for background music
    try {
      bgMusic.audio = new Audio(bgMusic.path);
      bgMusic.audio.loop = true;
      bgMusic.audio.volume = this.masterVolume * bgMusic.volume;
      bgMusic.audio.muted = this.muted;
      
      // Handle errors during loading
      bgMusic.audio.onerror = (error) => {
        console.error('Error loading background music:', error);
        bgMusic.audio = null;
      };
      
      // Handle when audio is ready to play
      const playWhenReady = () => {
        bgMusic.audio.removeEventListener('canplaythrough', playWhenReady);
        bgMusic.audio.play().catch(error => {
          console.warn('Could not play background music:', error);
          // Auto-unmute if autoplay was prevented
          if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
            console.log('Trying to unmute and play again...');
            this.muted = false;
            bgMusic.audio.muted = false;
            bgMusic.audio.play().catch(e => console.warn('Still could not play:', e));
          }
        });
      };
      
      bgMusic.audio.addEventListener('canplaythrough', playWhenReady);
      bgMusic.audio.load();
      
    } catch (error) {
      console.error('Error initializing background music:', error);
    }
  }
  
  // Stop background music
  stopBackgroundMusic() {
    const bgMusic = this.sounds.background;
    if (bgMusic && bgMusic.audio) {
      bgMusic.audio.pause();
      bgMusic.audio.currentTime = 0;
    }
  }
}
