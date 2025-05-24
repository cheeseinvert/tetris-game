// Sound Manager for handling game audio
import { SOUNDS } from './constants.js';
export class SoundManager {
    constructor() {
        this.masterVolume = 1.0;
        this.sounds = {};
        this.backgroundAudio = null;
        this.isBackgroundPlaying = false;
        this.muted = false;
    }
    async loadSounds() {
        const soundPromises = Object.entries(SOUNDS).map(async ([key, sound]) => {
            try {
                const audio = new Audio(sound.path);
                audio.volume = sound.volume * this.masterVolume;
                if (sound.loop) {
                    audio.loop = true;
                }
                this.sounds[key] = audio;
            }
            catch (error) {
                console.error(`Failed to load sound: ${key}`, error);
            }
        });
        await Promise.all(soundPromises);
    }
    // Play a sound effect
    play(soundType) {
        const sound = this.sounds[soundType];
        if (sound) {
            sound.currentTime = 0; // Rewind to start
            sound.play().catch(error => console.error('Error playing sound:', error));
        }
        else {
            console.warn(`Sound not loaded: ${soundType}`);
        }
    }
    // Stop playing a specific sound
    stop(soundType) {
        const sound = this.sounds[soundType];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }
    // Stop all currently playing sounds
    stopAll() {
        Object.values(this.sounds).forEach(sound => {
            if (sound) {
                sound.pause();
                sound.currentTime = 0;
            }
        });
        if (this.backgroundAudio) {
            this.backgroundAudio.pause();
            this.backgroundAudio.currentTime = 0;
            this.isBackgroundPlaying = false;
        }
    }
    // Play background music
    playBackgroundMusic() {
        if (this.muted || this.isBackgroundPlaying)
            return;
        const sound = this.sounds.background;
        if (!sound)
            return;
        try {
            this.backgroundAudio = sound;
            if (this.backgroundAudio) {
                // Try to play the audio and handle autoplay restrictions
                const playPromise = this.backgroundAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        if (error.name === 'NotAllowedError' || error.name === 'NotSupportedError') {
                            console.log('Autoplay prevented. Waiting for user interaction...');
                            // Set up a one-time click handler to start audio on first interaction
                            const startOnInteraction = () => {
                                var _a;
                                document.removeEventListener('click', startOnInteraction);
                                document.removeEventListener('keydown', startOnInteraction);
                                (_a = this.backgroundAudio) === null || _a === void 0 ? void 0 : _a.play().catch(e => console.error('Error playing after interaction:', e));
                            };
                            document.addEventListener('click', startOnInteraction, { once: true });
                            document.addEventListener('keydown', startOnInteraction, { once: true });
                        }
                        else {
                            console.error('Error playing background music:', error);
                        }
                    });
                }
                this.isBackgroundPlaying = true;
            }
        }
        catch (error) {
            console.error('Error playing background music:', error);
            // Fallback: Try to play again after a short delay
            if (this.backgroundAudio) {
                setTimeout(() => {
                    var _a;
                    (_a = this.backgroundAudio) === null || _a === void 0 ? void 0 : _a.play().catch(e => console.error('Retry play failed:', e));
                }, 1000);
            }
        }
    }
    // Stop background music
    stopBackgroundMusic() {
        const audio = this.backgroundAudio;
        if (!audio)
            return;
        try {
            audio.pause();
            audio.currentTime = 0;
            this.isBackgroundPlaying = false;
            this.backgroundAudio = null;
        }
        catch (error) {
            console.error('Error stopping background music:', error);
        }
    }
    // Pause background music
    pauseBackgroundMusic() {
        if (!this.backgroundAudio)
            return;
        try {
            this.backgroundAudio.pause();
            this.isBackgroundPlaying = false;
        }
        catch (error) {
            console.error('Error pausing background music:', error);
        }
    }
    // Resume background music
    resumeBackgroundMusic() {
        if (!this.backgroundAudio || this.isBackgroundPlaying)
            return;
        try {
            const playPromise = this.backgroundAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name !== 'NotAllowedError') {
                        console.warn('Could not resume background music:', error);
                    }
                });
            }
            this.isBackgroundPlaying = true;
        }
        catch (error) {
            console.error('Error resuming background music:', error);
        }
    }
    // Toggle mute state
    toggleMute() {
        this.muted = !this.muted;
        // Update background audio if it exists
        if (this.backgroundAudio) {
            this.backgroundAudio.muted = this.muted;
        }
        // Update UI to reflect mute state
        const muteButton = document.getElementById('mute-button');
        if (muteButton) {
            muteButton.textContent = this.muted ? '🔇' : '🔊';
        }
    }
    // Set master volume (0 to 1)
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        // Update background audio if it exists and has been loaded
        if (this.backgroundAudio && this.sounds.background) {
            this.backgroundAudio.volume = this.sounds.background.volume * this.masterVolume;
        }
    }
    // Get current volume (0 to 1)
    getVolume() {
        return this.masterVolume;
    }
    // Check if sound is muted
    isMuted() {
        return this.muted;
    }
    // Clean up resources
    destroy() {
        this.stopBackgroundMusic();
    }
}
//# sourceMappingURL=SoundManager.js.map