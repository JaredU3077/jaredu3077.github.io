/**
 * @file Background Music Module - Handles background music management
 * @author Jared U.
 * @tags neu-os
 */

export class BackgroundMusic {
    constructor() {
        // Background music management
        this.backgroundMusic = null;
        this.musicEnabled = localStorage.getItem('neuos-music') !== 'false';
        if (localStorage.getItem('neuos-music') === null) {
            this.musicEnabled = true;
            localStorage.setItem('neuos-music', 'true');
        }
        this.userManuallyDisabled = false; // Track if user manually disabled music
        this.toggleInProgress = false; // Prevent rapid clicking
        this.autoRestartSetup = false;
    }

    init() {
        this.setupBackgroundMusic();
    }

    setupBackgroundMusic() {
        this.backgroundMusic = document.getElementById('backgroundMusic');
        if (!this.backgroundMusic) {
            console.warn('Background music element not found');
            return;
        }

        console.log('Background music initialized - enabled:', this.musicEnabled);

        // Set volume to a comfortable level that won't interfere with typing sounds
        this.backgroundMusic.volume = 0.2; // Reduced volume to prevent conflicts
        
        // Add error handling for missing audio file
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn('Background music file not found or cannot be loaded:', e);
            // Hide audio controls if music file is not available
            const audioControls = document.getElementById('audioControls');
            if (audioControls) {
                audioControls.style.display = 'none';
            }
        });
        
        // Add load event listener to confirm audio file loaded
        this.backgroundMusic.addEventListener('loadeddata', () => {
            console.log('Background music file loaded successfully');
            console.log('Audio duration:', this.backgroundMusic.duration);
        });
        
        // Add play event listener
        this.backgroundMusic.addEventListener('play', () => {
    
            // Ensure audio context is resumed when music plays
            if (window.audioSystemInstance && window.audioSystemInstance.audioContext && 
                window.audioSystemInstance.audioContext.state === 'suspended') {
                window.audioSystemInstance.audioContext.resume().then(() => {
                    console.log('Audio context resumed due to music playback');
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                });
            }
        });
        
        // Add pause event listener
        this.backgroundMusic.addEventListener('pause', () => {
            console.log('Background music paused');
        });
        
        // Update audio controls to reflect music state
        this.updateAudioControls();
        
        // Start music if enabled
        if (this.musicEnabled) {
            this.startBackgroundMusic();
        }
    }

    startBackgroundMusic() {
        if (!this.backgroundMusic || !this.musicEnabled) {
            return;
        }
        
        // Modern browsers require user interaction before playing audio
        const playMusic = () => {
            this.backgroundMusic.play().then(() => {
                // Add visual indicator that music is playing
                this.showMusicIndicator();
            }).catch(error => {
                console.warn('Could not start background music:', error);
            });
        };
        
        // Try to play immediately, if it fails, wait for user interaction
        playMusic();
        
        // Only set up auto-restart if music is enabled and we haven't already set it up
        if (this.musicEnabled && !this.autoRestartSetup) {
            const startOnInteraction = () => {
                console.log('User interaction detected, attempting to start music...');
                // Only restart if music is enabled, paused, and user hasn't manually disabled it
                if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled && !this.userManuallyDisabled) {
                    console.log('Auto-restarting music due to user interaction...');
                    playMusic();
                } else {
                    console.log('Auto-restart prevented - music disabled or manually paused');
                }
            };
            
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('keydown', startOnInteraction);
            this.autoRestartSetup = true;
            console.log('Auto-restart listeners set up');
        }
    }

    showMusicIndicator() {
        // Create a subtle visual indicator that music is playing
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            width: 8px;
            height: 8px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.7;
            animation: musicPulse 2s ease-in-out infinite;
            pointer-events: none;
            z-index: 7999;
        `;
        
        // Add the pulse animation if it doesn't exist
        if (!document.querySelector('style[data-music-animation]')) {
            const style = document.createElement('style');
            style.setAttribute('data-music-animation', 'true');
            style.textContent = `
                @keyframes musicPulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 0.8; transform: scale(1.2); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
        
        // Remove indicator when music stops
        this.backgroundMusic.addEventListener('pause', () => {
            indicator.remove();
        });
        
        this.backgroundMusic.addEventListener('ended', () => {
            indicator.remove();
        });
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
            console.log('Background music stopped');
            
            // Remove music indicator
            const indicator = document.querySelector('div[style*="musicPulse"]');
            if (indicator) {
                indicator.remove();
            }
        }
    }

    toggleBackgroundMusic() {
        // Prevent rapid clicking
        if (this.toggleInProgress) {
            console.log('Toggle already in progress, ignoring click');
            return;
        }
        
        this.toggleInProgress = true;
        
        console.log('Audio toggle clicked - current state:', this.musicEnabled);
        console.log('Audio element state before toggle:', {
            paused: this.backgroundMusic?.paused,
            currentTime: this.backgroundMusic?.currentTime,
            duration: this.backgroundMusic?.duration,
            readyState: this.backgroundMusic?.readyState,
            networkState: this.backgroundMusic?.networkState,
            volume: this.backgroundMusic?.volume
        });
        
        // Simple toggle logic
        if (this.musicEnabled) {
            // Disable music
            console.log('Disabling background music...');
            this.musicEnabled = false;
            this.userManuallyDisabled = true;
            localStorage.setItem('neuos-music', 'false');
            
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                console.log('Background music paused');
                
                // Remove music indicator
                const indicator = document.querySelector('div[style*="musicPulse"]');
                if (indicator) {
                    indicator.remove();
                }
            }
        } else {
            // Enable music
            console.log('Enabling background music...');
            this.musicEnabled = true;
            this.userManuallyDisabled = false;
            localStorage.setItem('neuos-music', 'true');
            
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play().then(() => {
                    console.log('Background music resumed successfully');
                    this.showMusicIndicator();
                }).catch(error => {
                    console.warn('Could not resume background music:', error);
                });
            } else if (this.backgroundMusic) {
                console.log('Music already playing or not available');
            }
        }
        
        this.updateAudioControls();
        console.log('Audio toggle complete - new state:', this.musicEnabled);
        console.log('Audio element state after toggle:', {
            paused: this.backgroundMusic?.paused,
            currentTime: this.backgroundMusic?.currentTime,
            duration: this.backgroundMusic?.duration,
            readyState: this.backgroundMusic?.readyState,
            networkState: this.backgroundMusic?.networkState,
            volume: this.backgroundMusic?.volume
        });
        
        // Allow toggle again after a short delay
        setTimeout(() => {
            this.toggleInProgress = false;
        }, 300);
    }

    updateAudioControls() {
        const audioToggle = document.getElementById('audioToggle');
        if (!audioToggle) return;
        
        const audioOn = audioToggle.querySelector('.audio-on');
        const audioOff = audioToggle.querySelector('.audio-off');
        
        if (this.musicEnabled) {
            audioOn.style.display = 'block';
            audioOff.style.display = 'none';
        } else {
            audioOn.style.display = 'none';
            audioOff.style.display = 'block';
        }
    }

    // Add play and pause methods for terminal access
    play() {
        if (this.backgroundMusic && this.musicEnabled) {
            this.backgroundMusic.play().then(() => {
                console.log('Background music started via terminal command');
                this.showMusicIndicator();
            }).catch(error => {
                console.warn('Could not start background music via terminal:', error);
            });
        } else {
            console.warn('Background music not available or disabled');
        }
    }

    pause() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            console.log('Background music paused via terminal command');
            
            // Remove music indicator
            const indicator = document.querySelector('div[style*="musicPulse"]');
            if (indicator) {
                indicator.remove();
            }
        } else {
            console.warn('Background music not available');
        }
    }

    // Expose methods globally for other components
    static getInstance() {
        if (!window.backgroundMusicInstance) {
            window.backgroundMusicInstance = new BackgroundMusic();
        }
        return window.backgroundMusicInstance;
    }
} 