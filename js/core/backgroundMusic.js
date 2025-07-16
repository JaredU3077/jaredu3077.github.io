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
            console.error('Background music element not found - check if audio element exists in HTML');
            return;
        }

        // Background music initialized

        // Set volume to a comfortable level that won't interfere with typing sounds
        this.backgroundMusic.volume = 0.2; // Reduced volume to prevent conflicts
        
        // Add error handling for missing audio file
        this.backgroundMusic.addEventListener('error', (e) => {
            console.error('Background music file not found or cannot be loaded:', e);
            console.error('Audio error details:', {
                error: this.backgroundMusic.error,
                networkState: this.backgroundMusic.networkState,
                readyState: this.backgroundMusic.readyState
            });
            // Hide audio controls if music file is not available
            const audioControls = document.getElementById('audioControls');
            if (audioControls) {
                audioControls.style.display = 'none';
            }
        });
        
        // Add load event listener to confirm audio file loaded
        this.backgroundMusic.addEventListener('loadeddata', () => {
            // Background music file loaded successfully
        });
        
        // Add play event listener
        this.backgroundMusic.addEventListener('play', () => {
            // Ensure audio context is resumed when music plays
            if (window.audioSystemInstance && window.audioSystemInstance.audioContext && 
                window.audioSystemInstance.audioContext.state === 'suspended') {
                window.audioSystemInstance.audioContext.resume().then(() => {
                    // Audio context resumed
                }).catch(err => {
                    console.warn('Failed to resume audio context:', err);
                });
            }
        });
        
        // Add pause event listener
        this.backgroundMusic.addEventListener('pause', () => {
            // Background music paused
        });
        
        // Add canplay event to check if audio can be played
        this.backgroundMusic.addEventListener('canplay', () => {
            // Background music can be played
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
                // Silently handle autoplay policy errors - this is expected
                if (error.name === 'NotAllowedError') {
                    // This is normal - music will start on first user interaction
                } else {
                    console.warn('Could not start background music:', error);
                }
            });
        };
        
        // Try to play immediately, if it fails, wait for user interaction
        playMusic();
        
        // Set up auto-restart for music on user interaction
        if (this.musicEnabled && !this.autoRestartSetup) {
            const startOnInteraction = () => {
                // Only restart if music is enabled, paused, and user hasn't manually disabled it
                if (this.backgroundMusic && this.backgroundMusic.paused && this.musicEnabled && !this.userManuallyDisabled) {
                    playMusic();
                }
            };
            
            // Listen for any user interaction to start music
            document.addEventListener('click', startOnInteraction, { once: false });
            document.addEventListener('keydown', startOnInteraction, { once: false });
            document.addEventListener('touchstart', startOnInteraction, { once: false });
            this.autoRestartSetup = true;
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
            // Background music stopped
            
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
            return;
        }
        
        this.toggleInProgress = true;
        
        // Simple toggle logic
        if (this.musicEnabled) {
            // Disable music
            this.musicEnabled = false;
            this.userManuallyDisabled = true;
            localStorage.setItem('neuos-music', 'false');
            
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                
                // Remove music indicator
                const indicator = document.querySelector('div[style*="musicPulse"]');
                if (indicator) {
                    indicator.remove();
                }
            }
        } else {
            // Enable music
            this.musicEnabled = true;
            this.userManuallyDisabled = false;
            localStorage.setItem('neuos-music', 'true');
            
            if (this.backgroundMusic && this.backgroundMusic.paused) {
                this.backgroundMusic.play().then(() => {
                    this.showMusicIndicator();
                }).catch(error => {
                    console.warn('Could not resume background music:', error);
                });
            }
        }
        
        this.updateAudioControls();
        
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