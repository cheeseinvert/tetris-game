import { type SoundType } from './constants.js';
export interface ISoundManager {
    play(soundType: SoundType): void;
    stop(soundType: SoundType): void;
    stopAll(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    isMuted(): boolean;
    toggleMute(): void;
    loadSounds(): Promise<void>;
    playBackgroundMusic(): void;
    stopBackgroundMusic(): void;
}
export declare class SoundManager implements ISoundManager {
    private masterVolume;
    private muted;
    private sounds;
    private backgroundAudio;
    private isBackgroundPlaying;
    constructor();
    loadSounds(): Promise<void>;
    play(soundType: SoundType): void;
    stop(soundType: SoundType): void;
    stopAll(): void;
    playBackgroundMusic(): void;
    stopBackgroundMusic(): void;
    pauseBackgroundMusic(): void;
    resumeBackgroundMusic(): void;
    toggleMute(): void;
    setVolume(volume: number): void;
    getVolume(): number;
    isMuted(): boolean;
    destroy(): void;
}
